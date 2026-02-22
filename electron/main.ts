import { app, BrowserWindow, ipcMain, dialog, Menu, session, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Bundle fontconfig for Linux systems missing fonts (e.g., Bazzite, Fedora Atomic).
// Must run before any BrowserWindow is created so Chromium's Skia picks up the config.
if (process.platform === 'linux') {
  const fontsDir = path.join(process.resourcesPath, 'fonts')
  if (fs.existsSync(fontsDir)) {
    const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>${fontsDir}</dir>
</fontconfig>`
    const confPath = path.join(os.tmpdir(), `gosh-wordpad-fonts-${process.pid}.conf`)
    fs.writeFileSync(confPath, conf)
    process.env.FONTCONFIG_FILE = confPath
  }
}

const allowedPaths = new Set<string>()

// Wayland support for Linux (#30)
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto')
}

let mainWindow: BrowserWindow | null = null
let forceClose = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    title: 'Document - WordPad',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('close', (e) => {
    if (!forceClose) {
      e.preventDefault()
      mainWindow?.webContents.send('window:close-requested')
    }
  })

  // Open external links in the user's default browser (#29)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.setMenuBarVisibility(false)
  mainWindow.setAutoHideMenuBar(true)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { role: 'appMenu' },
      { role: 'editMenu' },
      { role: 'windowMenu' }
    ]))
  } else {
    Menu.setApplicationMenu(null)
  }

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' ws://localhost:*"
        ]
      }
    })
  })

  createWindow()

  // Auto-update via electron-updater:
  // - Windows: Works with NSIS builds
  // - Linux: Requires AppImage (deb/rpm users get updates via package manager)
  // - macOS: Requires code signing with Apple Developer certificate
  if (!process.env.VITE_DEV_SERVER_URL) {
    const isAppImage = !!process.env.APPIMAGE
    const isWindows = process.platform === 'win32'
    if (isAppImage || isWindows) {
      autoUpdater.autoDownload = true
      autoUpdater.autoInstallOnAppQuit = true

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(mainWindow!, {
          type: 'info',
          title: 'Update Ready',
          message: 'A new version has been downloaded. Restart to apply the update.',
          buttons: ['Restart', 'Later']
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall()
          }
        })
      })

      autoUpdater.on('error', (err) => {
        console.log('Auto-update error:', err.message)
      })

      autoUpdater.checkForUpdatesAndNotify().catch((err: Error) => {
        console.log('Update check failed:', err.message)
      })
    }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Clean up temporary fontconfig file on quit
if (process.platform === 'linux') {
  app.on('quit', () => {
    const confPath = path.join(os.tmpdir(), `gosh-wordpad-fonts-${process.pid}.conf`)
    try { fs.unlinkSync(confPath) } catch {}
  })
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// IPC Handlers
ipcMain.handle('dialog:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    filters: [
      { name: 'HTML Documents', extensions: ['html', 'htm'] },
      { name: 'Text Documents', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  allowedPaths.add(filePath)
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return { content, filePath }
})

ipcMain.handle('dialog:save', async (_event, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultPath || 'Document.html',
    filters: [
      { name: 'HTML Documents', extensions: ['html', 'htm'] },
      { name: 'Text Documents', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (result.canceled || !result.filePath) return null
  allowedPaths.add(result.filePath)
  return result.filePath
})

ipcMain.handle('dialog:ask-save', async () => {
  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'warning',
    buttons: ['Save', "Don't Save", 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    title: 'WordPad',
    message: 'Do you want to save changes?'
  })
  if (result.response === 0) return 'save'
  if (result.response === 1) return 'dont-save'
  return 'cancel'
})

ipcMain.handle('fs:read', async (_event, filePath: string) => {
  if (!allowedPaths.has(filePath)) {
    throw new Error('Access denied: path was not opened via file dialog')
  }
  return await fs.promises.readFile(filePath, 'utf-8')
})

ipcMain.handle('fs:write', async (_event, filePath: string, content: string) => {
  if (!allowedPaths.has(filePath)) {
    throw new Error('Access denied: path was not opened via file dialog')
  }
  await fs.promises.writeFile(filePath, content, 'utf-8')
})

ipcMain.handle('window:set-title', async (_event, title: string) => {
  mainWindow?.setTitle(title)
})

ipcMain.handle('app:quit', async () => {
  app.quit()
})

ipcMain.handle('window:force-close', () => {
  forceClose = true
  mainWindow?.close()
})
