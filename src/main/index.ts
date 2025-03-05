import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { exec } from 'node:child_process'




function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
// 生产环境加载打包后的文件
  if (import.meta.env.PROD) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173'); // Vite 开发服务器
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('openProjectWindow', (event, args) => {
    console.log(event)
    new BrowserWindow({
      width: 1600,
      height: 900,
      show: true,
      title: args.title,
      autoHideMenuBar: true,
      maximizable: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        // preload: join(__dirname, '../preload/index.js'),
        // sandbox: false,
        // nodeIntegration: true,
        // contextIsolation: false,
        // webSecurity: false
      }
    })
      .on('page-title-updated', (event) => {
        // 阻止默认行为，防止窗口标题被更新
        event.preventDefault()
      })
      .loadURL('http://localhost:5173/#/pdf')
  })
  ipcMain.on('ping', () => console.log('pong'))
// 直接执行 node test.js 脚本
  exec(`node test.js`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行脚本时出错: ${error}`);
      return;
    }
    console.log(`脚本输出: ${stdout}`);
    console.error(`脚本错误输出: ${stderr}`);
  });
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
