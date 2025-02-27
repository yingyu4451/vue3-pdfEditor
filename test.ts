const { writeFile,readFile } = require('fs')
const http = require('http')
const url = require('url')

http
  .createServer(function (request, response) {
    let flag=url.parse(request.url, true).query.flag

    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain。并用charset=UTF-8解决输出中文乱码
    // response.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' })
    if(flag==='1'){
      let seting = url.parse(request.url, true).query.data
      readFile(seting.toString(),'utf-8',(err, data)=>{
        response.end(data)
      })
    }
    if(flag==='2'){
      writeFile(
        'resources\\setting\\projects.json',
        url.parse(request.url, true).query.data,
        (err) => {
          if (err) throw err
          response.end('异常')
        }
      )
    }
    if(flag==='3'){
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const obj = list[list.length - 1]
      writeFile(obj.settingPath, JSON.stringify(obj), (err) => {
        if (err) throw err
        response.end('异常')
      })
      writeFile(
        'C:\\Users\\34058\\WebstormProjects\\vue-pdf\\resources\\setting\\projects.json',
        url.parse(request.url, true).query.data,
        (err) => {
          if (err) throw err
          response.end('异常')
        }
      )
    }
    if(flag=='4'){
      const listString = url.parse(request.url, true).query.data
      const list = JSON.parse(listString)
      const key = url.parse(request.url, true).query.key
      console.log(key)
      console.log(list)
      writeFile(
        'C:\\Users\\34058\\WebstormProjects\\vue-pdf\\resources\\setting\\projects.json',
        listString,
        (err) => {
          if (err) throw err
          response.end('异常')
        }
      )
      writeFile(
        list[key].settingPath,
        JSON.stringify(list[key]),
        (err) => {
          if (err) throw err
          response.end('异常')
        }
      )
    }


    // 下句是发送响应数据

  })
  .listen(8888)
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/')
