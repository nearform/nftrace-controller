var http = require('http');

var port = 1338;

http.createServer(function (req, res) {
  res.end('Hello World\n');
}).listen(port);

console.log('Server should be running at http://127.0.0.1:%s/', port);