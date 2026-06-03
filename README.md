# Matrix Terminal — Electron Edition
### Version 1.0

A Matrix-themed desktop terminal application built with Electron.
Features live rain animation, 3D atom models, a text editor, dictionaries,
system monitoring, and 50+ functional commands.

---

## Setup

```
npm install
npm install systeminformation --save
npm start
```

## Build standalone .exe

```
npm run build
```

Output: `dist/Matrix Terminal.exe` — portable, no installation needed.

---

## Version 1.0 Features

### Rain Animation
- Full-screen Matrix rain with katakana, latin, and number characters
- Toggle on/off, speed (normal/fast), and 5 color themes
- Green, Cyan, Red, Amber, Purple
- Rain color affects all panel text (panels inherit active color)

### Layout System
- Two panel slots — left and right
- Each slot supports multiple tabs
- First panel opens fullscreen, second auto-splits
- Subsequent panels alternate left/right as new tabs
- Draggable divider to resize split panels
- Flip — swap left and right slots
- Focus — bring any panel to fullscreen
- Panels popup — see all open tabs per slot

### Text Editor
- Multi-tab — unlimited files open simultaneously
- Auto-saves to localStorage on every keystroke
- Ctrl+S — save as .txt via native Windows save dialog
- Line numbers sidebar
- Live cursor position (Ln / Col)
- Unsaved indicator — dot on tab

### Atom Models (6 total)
All models are fully 3D with perspective projection, constant tumble rotation,
and composed entirely of matrix characters.

- **Dalton (1803)** — solid sphere with directional lighting and shadow
- **Thomson (1904)** — glowing blob, electrons on Lissajous paths
- **Rutherford (1911)** — 3 independent orbital planes, orbit rings glow near electron
- **Bohr (1913)** — concentric electron shells with ripple rings and electron trails
- **Quantum Mechanical** — breathing probability cloud with heartbeat pulse
- **Modern** — pulsing s/px/py/pz orbital lobes in 3D

Features across all models:
- Comet trails on electrons
- Pulsing nucleus with red P (proton) and blue N (neutron) characters
- Depth-based brightness (closer = brighter, further = dimmer)
- Continuous 3D tumble rotation on all axes

### Dictionaries
- **English Dictionary** — search bar panel + quick terminal lookup
  - Shows word, phonetic, part of speech, definitions, examples, synonyms
  - Source: dictionaryapi.dev (free, no API key)
- **EN ↔ JP Dictionary** — search in English, Japanese, or romaji
  - Shows kanji, hiragana reading, JLPT level, common word tag, meanings
  - Source: jisho.org (free, no API key)
- Both available as panels with GUI or quick terminal commands

### System Monitoring
- **sysinfo** — static snapshot of OS, CPU, RAM, GPU, display, storage, battery
- **perf** — live performance monitor updating every 2 seconds
  - CPU usage with 60-second scrolling graph and per-core breakdown
  - RAM usage bar with used/total GB
  - Storage per drive with used/free percentage
  - Network per interface with download and upload speed
  - GPU load, VRAM, and temperature
  - Color coded: green normal, yellow above 60%, red above 85%
- **dxdiag** — quick system summary in terminal
- Requires: systeminformation npm package

### Tools

| Category | Commands |
|---|---|
| Math | calc, conv |
| Encoding | b64enc, b64dec, hexenc, hexdec, hash, rot13 |
| Text | wc, rev, upper, lower, morse, unmorse, lorem |
| Random | uuid, pw, rand, coin, dice |
| Network | ip, weather, dns, ports |
| System | time, timer, zoom, fontsize, debug |

### Display and Zoom
- Zoom in/out — Ctrl+= and Ctrl+- or A+/A- buttons
- Zoom range 50% to 250%
- Font size command — applies to all UI text
- Both settings persist across sessions
- Resizable terminal height — drag handle at top of terminal

### General
- Frameless window
- Command history — Arrow Up/Down
- setuser — change terminal username, persists across sessions
- debug — shows active animation loops, memory usage, panel state
- Fully offline except: ip, weather, dns, define, jisho

---

## Full Command Reference

### Layout
| Command | Description |
|---|---|
| split | Toggle split view |
| flip | Swap left and right panel positions |
| focus \<panel\> | Bring panel to fullscreen |
| front \<panel\> | Switch active tab in a slot |
| panels | List all open panels |
| close \<name\> | Close panel by name |
| close all | Close all panels |
| closeall | Same as close all |

### Editor
| Command | Description |
|---|---|
| edit | Open text editor |
| edit \<filename\> | Open or create named file |
| closedit | Close editor |

### Atoms
| Command | Description |
|---|---|
| atom dalton | Open Dalton model |
| atom thomson | Open Thomson model |
| atom rutherford | Open Rutherford model |
| atom bohr | Open Bohr model |
| atom quantum | Open Quantum model |
| atom modern | Open Modern model |
| atom list | List all models |
| closeatom \<model\> | Close atom by name |

### Dictionaries
| Command | Description |
|---|---|
| opendict | Open English dictionary panel |
| openjisho | Open EN-JP dictionary panel |
| define \<word\> | Quick English definition in terminal |
| jisho \<word\> | Quick EN-JP lookup in terminal |

### System Monitoring
| Command | Description |
|---|---|
| sysinfo | Open system specs panel |
| perf | Open live performance monitor |
| dxdiag | Quick system summary in terminal |

### Math and Conversion
| Command | Description |
|---|---|
| calc \<expr\> | Math expression e.g. calc 2^10 |
| conv \<n\> \<from\> \<to\> | Unit conversion e.g. conv 100 km mi |

### Encoding
| Command | Description |
|---|---|
| b64enc \<text\> | Base64 encode |
| b64dec \<text\> | Base64 decode |
| hexenc \<text\> | Text to hex |
| hexdec \<hex\> | Hex to text |
| hash \<text\> | SHA-256 hash |
| rot13 \<text\> | ROT-13 cipher |

### Text Tools
| Command | Description |
|---|---|
| wc \<text\> | Word, character, line count |
| rev \<text\> | Reverse text |
| upper \<text\> | UPPERCASE |
| lower \<text\> | lowercase |
| morse \<text\> | Text to morse code |
| unmorse \<code\> | Morse to text |
| lorem \<n\> | Generate n lorem ipsum words |

### Random
| Command | Description |
|---|---|
| uuid | Random UUID v4 |
| pw \<len\> | Secure random password |
| rand \<min\> \<max\> | Random integer in range |
| coin | Flip a coin |
| dice \<NdS\> | Roll dice e.g. dice 2d6 |

### Network (requires internet)
| Command | Description |
|---|---|
| ip | Public IP, city, ISP, timezone |
| weather \<city\> | Live weather |
| dns \<domain\> | DNS A record lookup |
| ports | Scan 22 common local ports |
| ports open | Show only open ports |
| ports \<number\> | Check specific port |

### Display and System
| Command | Description |
|---|---|
| zoom \<level\> | Set zoom 0.5 to 2.5 |
| fontsize \<n\> | Set font size 9 to 22 |
| time | Current date, time, unix timestamp |
| timer \<seconds\> | Countdown timer |
| setuser \<name\> | Change terminal username |
| debug | Show animation loops and memory |
| clear | Clear terminal |
| rain | Toggle rain |
| fast | Toggle rain speed |
| color | Cycle rain color |
| exit | Close application |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl + = | Zoom in |
| Ctrl + - | Zoom out |
| Ctrl + 0 | Reset zoom |
| Ctrl + S | Save editor tab as .txt |
| Arrow Up / Down | Command history |

---

## Control Bar

```
Rain  |  Fast  |  Color  |  Split  |  Flip  |  Panels  |  Clear  |  A-  |  100%  |  A+
```

---

## Resource Usage

| Metric | Value |
|---|---|
| RAM idle | ~80-120 MB |
| RAM with atoms | ~130-160 MB |
| CPU idle | ~0-1% |
| CPU with rain and atoms | ~3-8% |
| Exe size | ~85-100 MB |

---

## Notes

- node_modules (~200 MB) is for development only — not needed in the built exe
- Editor content saves to localStorage and survives shutdowns
- Zoom and font size persist across sessions
- perf and sysinfo require: npm install systeminformation --save
