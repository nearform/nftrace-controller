var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var parseString = require('xml2js').parseString;
var TraceToObject = require('./traceToObjectStream');


exports.createSession = function(session, cb){
  var arr = ['lttng', '--mi', 'xml', 'create', session, '--live'];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.enableUserlandEvent = function(session, eventName, pid, cb){
  var arr = ['lttng', '--mi', 'xml', 'enable-event', 
              '-s', session, '-u', eventName];
  if(pid){
    if(cb){ // assume all is right in the world
      arr.push('--filter', '\'$ctx.vpid =='  + pid +'\'');
    } else if(!cb) { //assume pid === cb. set it
      cb = pid;
    }
  } else if(!pid) {
    if(cb){ // pid === null and cb === cb
      // do nothing. we can proceed
    } else if(!cb){
      // there is something wrong here...
      // shouldn't have no pid and no cb.
      // but its not appropriate to throw here...
      // AND with no cb we can't pass an errback...
      // fml
    }
  }

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });
  exec(str, handleExec(cb));
};

exports.enableKernelEvent = function(session, eventName, cb){
  var arr = ['lttng', '--mi', 'xml', 'enable-event', 
              '-s', session, '-k', eventName];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.start = function (session, cb){
  var arr = ['lttng', '--mi', 'xml', 'start', session];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.stop = function(session, cb){
  var arr = ['lttng', '--mi', 'xml', 'stop', session];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.destroy = function(session, cb){
  var arr = ['lttng', '--mi', 'xml', 'destroy', session];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.listUserlandEvents = function(cb){
  var arr = ['lttng', '--mi', 'xml', 'list', '-u'];
  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.listKernelEvents = function(cb){
  var arr = ['lttng', '--mi', 'xml', 'list', '-k'];

  var str = '';
  arr.forEach(function(elem){
    str+=elem + ' ';
  });

  exec(str, handleExec(cb));
};

exports.getCurrentSessions = function(cb){
  var arr = ['lttng', '--mi', 'xml', 'list'];

  var str = '';
  arr.forEach(function(elem){
    str += elem + ' ';
  });

  exec(str, handleExec(cb));
}

exports.getSessionInfo = function(session, cb){
  var arr = ['lttng', '--mi', 'xml', 'list', session];

  var str = '';
  arr.forEach(function(elem){
    str += elem + ' ';
  });

  exec(str, handleExec(cb));
}

exports.useSession = function(session, cb){
  var arr = ['lttng', '--mi', 'xml', 'set-session', session];

  var str = '';
  arr.forEach(function(elem){
    str += elem + ' ';
  });

  exec(str, handleExec(cb));
}

exports.getEventStream = function(stream){
  var child = spawn('lttng',  ['view']);

  var traceToObject = new TraceToObject();

  child.stdout.pipe(traceToObject);
  
  traceToObject.pipe(stream);
};

// simple closure.
function handleExec(cb){
  return function(err, stdout, stderr){
    if(err){
      return cb(err);
    }
    
    parseString(stdout, function(err, result){
      if(err){
        return cb(err);
      }
      cb(err, result);
    });
  };
}
