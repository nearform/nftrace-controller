var sessionController = require('..');
var spawn = require('child_process').spawn;
var child;
var finished = false;

sessionController.listUserlandEvents(function(err, out){
  if(err){
    throw new Error(err);
  }
  console.log(out);
});
/*
sessionController.createSession('sessionName', function(err){
  if(err){ 
    throw new Error(err);
  }
  console.log('created session');
  sessionController
  .enableUserlandEvent('sessionName', 'node:gc*', '$ctx.vpid == 2446', 
    function(err){
    if(err){
      throw new Error(err);
    }
    sessionController.enableUserlandEvent('sessionName', 'node:net*', 
      function(err){
      if(err){
        throw new Error(err);
      }
      console.log('enabled all events');
      sessionController.start('sessionName', function(err){
        if(err){ 
          throw new Error(err);
        }
        console.log('started');
        sessionController.getEventStream(logStuff);

        child = spawn(process.execPath, ['battery.js']);
      });
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
      throw new Error(err);
    }
    console.log('stopped session');
    sessionController.destroy('sessionName', function(err){
      if(err){ 
        throw new Error(err);
      }
      finished = true;
      console.log('destroyed session');
    });
  });
}, 90000);
//*/
