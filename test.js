const { writeFile,readFile,createReadStream,unlink } = require('fs-extra')
const http = require('http')
const url = require('url')

http
  .createServer(function (request, response) {
    // 设置 CSP 和 CORS 响应头
    response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:8008");
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Max-Age', '86400');

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      response.writeHead(204); // 204 No Content
      response.end();
      return;
    }
    const flag=url.parse(request.url, true).query.flag
    //读取配置文件并返回
    if(flag==='1'){
      let seting = url.parse(request.url, true).query.data
      try {
        readFile(seting.toString(), (err, data) => {
          response.end(JSON.stringify(eval(data.toString())[0]));
        })
      }catch(err){
        console.error(err)
        response.end(JSON.stringify(err));
      }

    }
    //导入项目，只需要在总配置文件新增，项目信息
    if(flag==='2'){
      let seting = url.parse(request.url, true).query.data
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
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const obj = [list[list.length - 1],[]]
      try {
        writeFile(obj[0].settingPath, JSON.stringify(obj), (err) => {
          if (err) throw err
          response.end('异常')
        })
        writeFile(
          'resources/setting/projects.json',
          url.parse(request.url, true).query.data,
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
    //编辑项目信息
    if(flag==='4'){
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const key = url.parse(request.url, true).query.key
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
    //打开项目获取项目文件
    if(flag==='5'){
      const file = url.parse(request.url, true).query.data
      try {
        readFile(file.toString(), (err, data) => {
          let base = data.toString('base64');
          response.setHeader('Content-Type', 'application/pdf');
          response.end(base);
        })
      }catch(err){
        console.error(err)
        response.end(JSON.stringify(err));
      }
    }
    //保存标目信息
    if(flag==='6'){
      //读取标目列表
      const headings = url.parse(request.url, true).query.data
      //读取配置文件地址
      const path = url.parse(request.url, true).query.path
      //读取配置文件信息
      try {
        readFile(path, (err, data) => {
          //替换原有标目列表
          const tempList = eval(data.toString())
          tempList[1] = eval(headings)
          writeFile(path, JSON.stringify(tempList), (err) => {
          })
        })
      }catch(err){
        console.error(err)
        response.end(JSON.stringify(err));
      }
      response.end('ok');
    }
    if(flag==='7'){
      const settingPath = url.parse(request.url, true).query.data
      try {
        unlink(settingPath,() => {})
      }catch(err){console.error(err)}
    }
    if(flag==='8'){
      let seting = url.parse(request.url, true).query.data
     try {
       readFile(seting.toString(), (err, data) => {
         console.log(JSON.stringify(eval(data.toString())[1]))
         response.end(JSON.stringify(eval(data.toString())[1]));
       })
     }catch(err){
        console.error(err)
       response.end(JSON.stringify(err));
      }
    }
  })
  .listen(8008)
console.log('启动'+8008)

