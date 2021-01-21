import { app, protocol, BrowserWindow, BrowserView, session } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

// import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

const path = require('path')

Object.assign(console, log.functions)

// autoUpdater.logger = log
// autoUpdater.logger.transports.file.level = 'info'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])
console.log('process.env.ELECTRON_NODE_INTEGRATION', process.env.ELECTRON_NODE_INTEGRATION)
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL, {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
    })
    // autoUpdater.checkForUpdates()
    if (!process.env.IS_TEST) win.webContents.openDevTools()

    // const view = new BrowserView()
    // win.setBrowserView(view)
    // view.setBounds({ x: 0, y: 0, width: 1400, height: 900 })
    // view.webContents.loadURL('https://web.whatsapp.com/', {
    //   userAgent:
    //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
    // })
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    // autoUpdater.checkForUpdates()
  }

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: Object.fromEntries(
        Object.entries(details.responseHeaders).filter(header => !/x-frame-options/i.test(header[0])),
      ),
    })
  })
  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow()

  console.log(path.join(__dirname, 'dist'))

  // win.webContents.session
  //   .loadExtension(path.join(__dirname, 'dist'))
  //   .then(result => {
  //     console.log('result', result)
  //   })
  //   .catch(err => {
  //     console.log('err', err)
  //   })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
