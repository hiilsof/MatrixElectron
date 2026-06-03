const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const os   = require('os')

let mainWin      = null
let perfInterval = null
let si           = null  // systeminformation loaded lazily

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: '#000000',
    title: 'Matrix Terminal',
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  })

  mainWin = win
  win.loadFile('index.html')

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (perfInterval) clearInterval(perfInterval)
  if (process.platform !== 'darwin') app.quit()
})

/* ── Zoom ── */
ipcMain.on('set-zoom', (event, factor) => {
  if (mainWin) mainWin.webContents.setZoomFactor(factor)
})

// Save file dialog
const { dialog } = require('electron')
const fs = require('fs')
ipcMain.handle('save-file', async (event, { defaultName, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWin, {
    defaultPath: defaultName,
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  })
  if (canceled || !filePath) return { ok: false }
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    return { ok: true, filePath }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

/* ── Screensaver fullscreen ── */
ipcMain.on('ss-enter', () => {
  if (mainWin) {
    mainWin.setFullScreen(true)
    mainWin.setAlwaysOnTop(true, 'screen-saver')
  }
})
ipcMain.on('ss-exit', () => {
  if (mainWin) {
    mainWin.setFullScreen(false)
    mainWin.setAlwaysOnTop(false)
  }
})

/* ── Sysinfo: one-time static snapshot ── */
ipcMain.handle('get-sysinfo', async () => {
  try {
    if (!si) si = require('systeminformation')
    const [cpu, mem, osInfo, graphics, disk, battery] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.graphics(),
      si.diskLayout(),
      si.battery(),
    ])
    // si.display() varies by version — try gracefully
    let displays = []
    try { displays = await si.display() } catch(_) {
      try { displays = await si.displays() } catch(__) { displays = []; }
    }
    return {
      ok: true,
      cpu: {
        brand:         cpu.brand,
        manufacturer:  cpu.manufacturer,
        speed:         cpu.speed,
        cores:         cpu.cores,
        physicalCores: cpu.physicalCores,
        processors:    cpu.processors,
      },
      mem: {
        total: mem.total,
        free:  mem.free,
        used:  mem.used,
      },
      os: {
        platform: osInfo.platform,
        distro:   osInfo.distro,
        release:  osInfo.release,
        arch:     osInfo.arch,
        hostname: osInfo.hostname,
        username: os.userInfo().username,
        uptime:   os.uptime(),
      },
      gpu: (graphics.controllers || []).map(g => ({
        model:  g.model,
        vendor: g.vendor,
        vram:   g.vram,
      })),
      displays: (displays || []).map(d => ({
        resolutionX:        d.resolutionX,
        resolutionY:        d.resolutionY,
        currentRefreshRate: d.currentRefreshRate,
      })),
      disks: (disk || []).map(d => ({
        name: d.name,
        type: d.type,
        size: d.size,
      })),
      battery: {
        hasBattery: battery.hasBattery,
        percent:    battery.percent,
        isCharging: battery.isCharging,
      },
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

/* ── Perf: live polling ── */
ipcMain.on('start-perf', async () => {
  if (!si) {
    try {
      si = require('systeminformation')
    } catch (e) {
      mainWin?.webContents.send('perf-error',
        'systeminformation not installed — run: npm install systeminformation --save')
      return
    }
  }
  if (perfInterval) clearInterval(perfInterval)

  // last snapshot for delta comparison
  let lastSnap = null
  // slow poll counter — fsSize every 5th tick (~10s)
  let slowTick = 0
  let lastFs = []

  function changed(a, b, threshold) {
    if (!a || !b) return true
    return Math.abs(a - b) >= threshold
  }

  function snapDiffers(curr, last) {
    if (!last) return true
    // CPU changed >1%
    if (changed(curr.cpu.load, last.cpu.load, 1)) return true
    // RAM changed >50MB
    if (changed(curr.mem.used, last.mem.used, 50 * 1024 * 1024)) return true
    // any net interface rx/tx changed >5KB/s
    for (let i = 0; i < curr.net.length; i++) {
      const cn = curr.net[i], ln = last.net[i]
      if (!ln) return true
      if (changed(cn.rx, ln.rx, 5120) || changed(cn.tx, ln.tx, 5120)) return true
    }
    // GPU load changed >1%
    for (let i = 0; i < curr.gpu.length; i++) {
      const cg = curr.gpu[i], lg = last.gpu[i]
      if (!lg) return true
      if (changed(cg.utilizationGpu, lg.utilizationGpu, 1)) return true
    }
    return false
  }

  async function poll() {
    try {
      slowTick++
      // always fetch fast metrics
      const [cpuLoad, mem, netStats, gpuData] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.graphics(),
      ])
      // fetch disk only every 5 ticks (~10s)
      if (slowTick % 5 === 1) {
        try { lastFs = await si.fsSize() } catch(_) {}
      }

      const data = {
        cpu: {
          load:  Math.round(cpuLoad.currentLoad),
          cores: (cpuLoad.cpus || []).map(c => Math.round(c.load)),
        },
        mem: {
          total:  mem.total,
          used:   mem.used,
          active: mem.active,
          free:   mem.free,
        },
        net: (netStats || []).slice(0, 3).map(n => ({
          iface: n.iface,
          rx:    n.rx_sec || 0,
          tx:    n.tx_sec || 0,
        })),
        fs: (lastFs || []).slice(0, 6).map(f => ({
          fs:    f.fs,
          mount: f.mount,
          size:  f.size,
          used:  f.used,
          use:   f.use,
        })),
        gpu: (gpuData.controllers || []).map(g => ({
          model:          g.model,
          utilizationGpu: g.utilizationGpu  || 0,
          memoryUsed:     g.memoryUsed       || 0,
          memoryTotal:    g.memoryTotal      || 0,
          temperatureGpu: g.temperatureGpu   || 0,
        })),
      }

      // only send if something meaningful changed
      if (snapDiffers(data, lastSnap)) {
        mainWin?.webContents.send('perf-data', data)
        lastSnap = data
      }
    } catch (e) {
      mainWin?.webContents.send('perf-error', e.message)
    }
  }

  await poll()
  perfInterval = setInterval(poll, 2000)
})

ipcMain.on('stop-perf', () => {
  if (perfInterval) { clearInterval(perfInterval); perfInterval = null; }
})
