var sessionController = require('..');
var spawn = require('child_process').spawn;
var child;
var finished = false;

sessionController.createSession('sessionName', function(err){
  if(err){ 
    return console.error(err);
  }
  console.log('created session');
  sessionController.enableUserlandEvent('sessionName', 'node:gc*', '$ctx.vpid == 30015', function(err){
    if(err){
      return console.error(err);
    }
    console.log('enabled all events');
    sessionController.start('sessionName', function(err){
      if(err){ 
        return console.error(err);
      }
      console.log('started');
      sessionController.getEventStream(logStuff);

      child = spawn(process.execPath, 
                  ['battery.js', 'http://localhost:1337', 4, 4000]);
    });
  });
});

function logStuff(stuff){
  console.log(stuff);
}

setTimeout(function(){
  child.kill();
  sessionController.stop('sessionName', function(err){
    if(err){
      return console.error(err);
    }
    console.log('stopped session');
    sessionController.destroy('sessionName', function(err){
      if(err){ 
        return console.error(err);
      }
      finished = true;
      console.log('destroyed session');
    });
  });
}, 90000);
