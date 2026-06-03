const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Zoom
  setZoom: (factor) => ipcRenderer.send('set-zoom', factor),

  // Sysinfo — one-time snapshot
  getSysinfo: () => ipcRenderer.invoke('get-sysinfo'),

  // Perf — live stream
  startPerf:  ()    => ipcRenderer.send('start-perf'),
  stopPerf:   ()    => ipcRenderer.send('stop-perf'),
  onPerfData: (cb)  => ipcRenderer.on('perf-data',  (e, data) => cb(data)),
  onPerfError:(cb)  => ipcRenderer.on('perf-error', (e, msg)  => cb(msg)),
  removePerfListeners: () => {
    ipcRenderer.removeAllListeners('perf-data')
    ipcRenderer.removeAllListeners('perf-error')
  },

  // Save file via native dialog
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
})
