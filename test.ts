const { writeFile } = require('fs')
const http = require('http')
const url = require('url')
http
  .createServer(function (request, response) {
    console.log(url.parse(request.url, true).query.data)

    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain。并用charset=UTF-8解决输出中文乱码
    // response.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' })
    writeFile(
      'C:\\Users\\34058\\WebstormProjects\\vue-pdf\\resources\\setting\\projects.json',
      url.parse(request.url, true).query.data,
      (err) => {
        if (err) throw err
        console.log('添加成功')
      }
    )
    // 下句是发送响应数据
    response.end('11')
  })
  .listen(8888)
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/')
