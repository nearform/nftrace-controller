var sessionController = require('..');

//console.log(sessionController);

sessionController.createSession('sessionName', function(err){
  if(err){ 
    return console.error(err);
  }
  console.log('created session');
  sessionController.enableUserlandEvent('sessionName', '-a', function(err){
    if(err){
      return console.error(err);
    }
    console.log('enabled all events');
    sessionController.start('sessionName', function(err){
      if(err){ 
        return console.error(err);
      }
      console.log('started');
    });
  });
});

setTimeout(function(){
  sessionController.stop('sessionName', function(err){
    if(err){
      return console.error(err);
    }
    console.log('stopped session');
    sessionController.destroy('sessionName', function(err){
      if(err){ 
        return console.error(err);
      }
      console.log('destroyed session');
      process.exit(0);
    });
  });
}, 90000);

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337);

console.log('Server should be running at http://127.0.0.1:1337/');

var spawn = require('child_process').spawn;
var child = spawn(process.execPath, 
                  ['battery.js', 'http://localhost:1337', 4, 4000]);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stdout);
