
const { writeFile,readFile,createReadStream } = require('fs')
const http = require('http')
const url = require('url')


http
  .createServer(function (request, response) {
    const flag=url.parse(request.url, true).query.flag
    //读取配置文件并返回
    if(flag==='1'){
      let seting = url.parse(request.url, true).query.data
      readFile(seting.toString(), (err, data) => {
        response.end(JSON.stringify(eval(data.toString())[0]));
      })
    }
    //导入项目，只需要在总配置文件新增，项目信息
    if(flag==='2'){
      writeFile(
        'resources/setting/projects.json',
        url.parse(request.url, true).query.data,
        (err) => {
          if (err) throw err
          response.end('异常')
        }
      )
    }
    //新建项目，新建项目配置文件，在总配置文件新增该项目
    if(flag==='3'){
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const obj = [list[list.length - 1],[]]
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
    }
    //编辑项目信息
    if(flag==='4'){
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const key = url.parse(request.url, true).query.key
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
    }
    //打开项目获取项目文件
    if(flag==='5'){
      const file = url.parse(request.url, true).query.data
      readFile(file.toString(), (err, data) => {
        let base = data.toString('base64');
        response.setHeader('Content-Type', 'application/pdf');
        response.end(base);
      })
    }
    //保存标目信息
    if(flag==='6'){
      //读取标目列表
      const headings = url.parse(request.url, true).query.data
      //读取配置文件地址
      const path = url.parse(request.url, true).query.path
      //读取配置文件信息
      readFile(path, (err, data) => {
        //替换原有标目列表
        const tempList = eval(data.toString())
        tempList[1] = eval(headings)
        writeFile(path, JSON.stringify(tempList), (err) => {
        })
      })
    }
  })
  .listen(8888)
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/')


