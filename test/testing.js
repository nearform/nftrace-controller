//var controller = require('..');

var topSession = require('..')('namedSession');

topSession.enableUserlandEvent('-a');
topSession.start();

console.log('created and started session');

setTimeout(function(){
	topSession.stop();
	topSession.destroy();
	console.log('destroyed session');
	console.log('finished!');
	process.exit(0);
}, 90000);

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337);

console.log('Server should be running at http://127.0.0.1:1337/');

//topSession.enableEvent('anotherEventName');
//console.log(topSession);
/*console.log(controller);

var session = controller('name1'),
	anotherSession = controller('name2'),
	yetAnotherSession = controller.createSession('name3');

console.log(topSession);
//console.log(session);
//console.log(anotherSession);
//console.log(yetAnotherSession);*/