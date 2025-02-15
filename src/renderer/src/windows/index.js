/**
 * 封装多窗口管理器
 * @author YXY  Q：282310962
 */

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'

process.env.ROOT = join(__dirname, '../view/StartMenu/StartMenuView.vue')

const isDevelopment = process.env.NODE_ENV === 'development'
// const winURL = isDevelopment ? 'http://localhost:3000/' : join(__dirname, 'dist/index.html')
const winURL = isDevelopment
  ? process.env.VITE_DEV_SERVER_URL
  : join(process.env.ROOT, 'dist/index.html')

// 配置参数
const defaultConfig = {
  id: null, // 窗口唯一id
  background: '#fff', // 背景色
  route: '', // 路由地址url
  title: '',              // 标题
  data: null,             // 传入数据参数
  width: '',              // 窗口宽度
  height: '',             // 窗口高度
  minWidth: '',           // 窗口最小宽度
  minHeight: '',          // 窗口最小高度
  x: '',                  // 窗口相对于屏幕左侧坐标
  y: '',                  // 窗口相对于屏幕顶端坐标
  resize: true,           // 是否支持缩放
  maximize: false,        // 最大化窗口
  isMultiWin: false,      // 是否支持多开窗口
  isMainWin: false,       // 是否主窗口
  parent: '',             // 父窗口（需传入父窗口id）
  modal: false,           // 模态窗口（模态窗口是浮于父窗口上，禁用父窗口）
  alwaysOnTop: false      // 置顶窗口
}

class MultiWindows {
  constructor() {
    // 主窗口
    this.mainWin = null
    // 窗口组
    this.winLs = {}

    // ...
  }

  winOpts() {
    return {
      // 窗口图标
      icon: join(process.env.ROOT, 'resource/shortcut.ico'),
      backgroundColor: '#fff',
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      width: 1000,
      height: 640,
      resizable: true,
      minimizable: true,
      maximizable: true,
      frame: false,
      show: false,
      webPreferences: {
        contextIsolation: true, // 启用上下文隔离(为了安全性)（默认true）
        // nodeIntegration: false, // 启用Node集成（默认false）
        preload: join(process.env.ROOT, 'resource/preload.js'),
        // devTools: true,
        // webSecurity: false
      }
    }
  }

  // 创建新窗口
  createWin(options) {
    alert(111)
    const args = Object.assign({}, defaultConfig, options)
    console.log(args)

    // 判断窗口是否存在
    for(const i in this.winLs) {
      if(this.getWin(i) && this.winLs[i].route === args.route && !this.winLs[i].isMultiWin) {
        this.getWin(i).focus()
        return
      }
    }

    const opt = this.winOpts()
    if(args.parent) {
      opt.parent = this.getWin(args.parent)
    }

    if(typeof args.modal === 'boolean') opt.modal = args.modal
    if(typeof args.resize === 'boolean') opt.resizable = args.resize
    if(typeof args.alwaysOnTop === 'boolean') opt.alwaysOnTop = args.alwaysOnTop
    if(args.background) opt.backgroundColor = args.background
    if(args.width) opt.width = args.width
    if(args.height) opt.height = args.height
    if(args.minWidth) opt.minWidth = args.minWidth
    if(args.minHeight) opt.minHeight = args.minHeight
    if(args.x) opt.x = args.x
    if(args.y) opt.y = args.y

    console.log(opt)

    // 创建窗口对象
    const win = new BrowserWindow(opt)
    // 是否最大化
    if(args.maximize && args.resize) {
      win.maximize()
    }
    this.winLs[win.id] = {
      route: args.route, isMultiWin: args.isMultiWin
    }
    args.id = win.id


    // 加载页面
    let $url
    if(!args.route) {
      if(process.env.VITE_DEV_SERVER_URL) {
        // 打开开发者调试工具
        // win.webContents.openDevTools()

        $url = process.env.VITE_DEV_SERVER_URL
      }else {
        $url = winURL
      }
    }else {
      $url = `${winURL}#${args.route}`
    }
    win.loadURL($url)
    /*if(process.env.VITE_DEV_SERVER_URL) {
        win.loadURL($url)
    }else {
        win.loadFile($url)
    }*/
    win.webContents.openDevTools()

    win.once('ready-to-show', () => {
      win.show()
    })

    win.on('close', () => win.setOpacity(0))

    // 初始化渲染进程
    win.webContents.on('did-finish-load', () => {
      // win.webContents.send('win-loaded', '加载完成~！')
      win.webContents.send('win-loaded', args)
    })
  }

  // 获取窗口
  getWin(id) {
    return BrowserWindow.fromId(Number(id))
  }

  // 获取全部窗口
  getAllWin() {
    return BrowserWindow.getAllWindows()
  }

  // 关闭全部窗口
  closeAllWin() {
    try {
      for(const i in this.winLs) {
        if(this.getWin(i)) {
          this.getWin(i).close()
        }else {
          app.quit()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 开启主进程监听
  ipcMainListen() {
    // 设置标题
    ipcMain.on('set-title', (e, data) => {
      const webContents = e.sender
      const wins = BrowserWindow.fromWebContents(webContents)
      wins.setTitle(data)
    })
    // 是否最大化
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('isMaximized', (e) => {
      const win = BrowserWindow.getFocusedWindow()
      return win.isMaximized()
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.on('min', e => {
      const win = BrowserWindow.getFocusedWindow()
      win.minimize()
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('max2min', e => {
      const win = BrowserWindow.getFocusedWindow()
      if(win.isMaximized()) {
        win.unmaximize()
        return false
      }else {
        win.maximize()
        return true
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.on('close', (e, data) => {
      // const wins = BrowserWindow.getFocusedWindow()
      // wins.close()
      this.closeAllWin()
    })
    ipcMain.on('win-create', (event, args) => alert(111))

    // ...
  }
}

export { MultiWindows }


