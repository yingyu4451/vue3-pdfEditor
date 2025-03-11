import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import { exec } from 'node:child_process'
import http from 'http'
import url from 'url'
import { readFile, unlink, writeFile } from 'fs-extra'


let mainWindow
let server

function createWindow(): void {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 1300,
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
    mainWindow.setTitle(args.title)
    console.log(event.ports)
    // console.log(event)
    // new BrowserWindow({
    //   width: 1600,
    //   height: 900,
    //   show: true,
    //   title: args.title,
    //   autoHideMenuBar: true,
    //   maximizable: true,
    //   ...(process.platform === 'linux' ? { icon } : {}),
    //   webPreferences: {
    //     // preload: join(__dirname, '../preload/index.js'),
    //     // sandbox: false,
    //     // nodeIntegration: true,
    //     // contextIsolation: false,
    //     // webSecurity: false
    //   }
    // })
    //   .on('page-title-updated', (event) => {
    //     // 阻止默认行为，防止窗口标题被更新
    //     event.preventDefault()
    //   })
    //   .loadURL('http://localhost:5173/#/pdf')
  })
  ipcMain.on('ping', () => console.log('pong'))
// 直接执行 node test.js 脚本
//    exec(`test.exe` , (error, stdout, stderr) => {
//     if (error) {
//       console.error(`执行脚本时出错: ${error}`);
//       return;
//     }
//     console.log(`脚本输出: ${stdout}`);
//     console.error(`脚本错误输出: ${stderr}`);
//   });
   server = http
    .createServer(function (request, response) {
      const urlToParse = request.url || '';
      // 设置 CSP 和 CORS 响应头
      // response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:8008");
      // response.setHeader('Access-Control-Allow-Origin', '*');
      // response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      // response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // response.setHeader('Access-Control-Max-Age', '86400');
      // const corsHeaders = {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      //   'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      // };
      // response.setHeader("Access-Control-Allow-Origin","*");
      // // 处理 OPTIONS 预检请求
      // if (request.method === 'OPTIONS') {
      //   response.writeHead(204); // 204 No Content
      //   response.end();
      //   return;
      // }
      const flag=url.parse(urlToParse, true).query.flag
      console.log(flag)
      //读取配置文件并返回
      if(flag==='1'){
        let seting = url.parse(urlToParse, true).query.data
        console.log(seting)
        try {
          if(seting)
          readFile(seting.toString(), (err, data) => {
            if(err){
              console.error(err)
            }
            response.end(JSON.stringify(eval(data.toString())[0]));
          })
        }catch(err){
          console.error(err)
          response.end(JSON.stringify(err));
        }
      }
      //导入项目，只需要在总配置文件新增，项目信息
      if(flag==='2'){
        let seting = url.parse(urlToParse, true).query.data
        try {
          writeFile(
            'resources/setting/projects.json',
            seting,
            (err) => {
              if (err) throw err
              response.end('异常')
            }
          )
        }catch(err){
          console.error(err)
          response.end(JSON.stringify(err));
        }
      }
      //新建项目，新建项目配置文件，在总配置文件新增该项目
      if(flag==='3'){
        const listString = url.parse(urlToParse, true).query.data
        if (typeof listString === 'string') {
          const list = JSON.parse(listString)
          const obj = [list[list.length - 1],[]]
          try {
            writeFile(obj[0].settingPath, JSON.stringify(obj), (err) => {
              if (err) throw err
              response.end('异常')
            })
            writeFile(
              'resources/setting/projects.json',
              url.parse(urlToParse, true).query.data,
              (err) => {
                if (err) throw err
                response.end('异常')
              }
            )
          }catch(err){
            console.error(err)
            response.end(JSON.stringify(err));
          }
        }


      }
      //编辑项目信息
      if(flag==='4'){
        const listString = url.parse(urlToParse, true).query.data
        const key = url.parse(urlToParse, true).query.key
        if (typeof listString === 'string'&&typeof key === 'string') {
          const list = eval(listString)
          try {
            writeFile(
              'resources/setting/projects.json',
              listString,
              (err) => {
                if (err) throw err
                response.end('异常')
              }
            )
            readFile(list[key].settingPath, (err, data) => {
              if(err){
                console.error(err)
              }
              const tempList = eval(data.toString())
              tempList[0]=list[key]
              writeFile(
                list[key].settingPath,
                JSON.stringify(tempList),
                (err) => {
                  if (err) throw err
                  response.end('异常')
                }
              )
            })
          }catch(err){
            console.dir(err)
            response.end(JSON.stringify(err));
          }
        }


      }
      //打开项目获取项目文件
      if(flag==='5'){
        const file = url.parse(urlToParse, true).query.data
        if (typeof file === 'string') {
          try {
            readFile(file.toString(), (err, data) => {
              if(err){
                console.error(err)
              }
              let base = data.toString('base64');
              response.setHeader('Content-Type', 'application/pdf');
              response.end(base);
            })
          }catch(err){
            console.error(err)
            response.end(JSON.stringify(err));
          }
        }

      }
      //保存标目信息
      if(flag==='6'){
        //读取标目列表
        const headings = url.parse(urlToParse, true).query.data
        //读取配置文件地址
        const path = url.parse(urlToParse, true).query.path
        //读取配置文件信息
        if(typeof headings === 'string'&&typeof path === 'string'){
          try {
            readFile(path, (err, data) => {
              //替换原有标目列表
              if(err){
                console.error(err)
              }
              const tempList = eval(data.toString())
              tempList[1] = eval(headings)
              writeFile(path, JSON.stringify(tempList), (err) => {
                if(err){
                  console.error(err)
                }
              })
            })
          }catch(err){
            console.error(err)
            response.end(JSON.stringify(err));
          }
        }
        response.end('ok');
      }
      if(flag==='7'){
        const settingPath = url.parse(urlToParse, true).query.data
        if(typeof settingPath === 'string'){
          try {
            unlink(settingPath,() => {})
          }catch(err){console.error(err)}
        }
      }
      if(flag==='8'){
        let seting = url.parse(urlToParse, true).query.data
        if(seting!==undefined && seting!==null){
          try {
            readFile(seting.toString(), (err, data) => {
              if(err){
                console.error(err)
              }
              console.log(JSON.stringify(eval(data.toString())[1]))
              response.end(JSON.stringify(eval(data.toString())[1]));
            })
          }catch(err){
            console.error(err)
            response.end(JSON.stringify(err));
          }
        }

      }
      if(flag==='9'){
        let seting = url.parse(urlToParse, true).query.data
        console.log(seting)
        if(seting!==undefined && seting!==null){
          try {
            readFile(seting.toString(), (err, data) => {
              if(err){
                console.error(err)
              }
              response.end(JSON.stringify(eval(data.toString())));
            })
          }catch(err){
            console.error(err)
            response.end(JSON.stringify(err));
          }
        }

      }
    })

  server.listen(8008)
  console.log('启动'+8008)


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
  server.close(()=>{
    console.log('服务关闭close')
  })
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
