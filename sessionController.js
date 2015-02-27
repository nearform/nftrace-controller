var spawn = require('child_process').spawn;

exports.createSession = function(session, cb){
  var child = spawn('lttng', ['create', session, '--live']);
  manageChild(child, cb);
};

exports.enableUserlandEvent = function(session, eventName, cb){
  var child = spawn('lttng', ['enable-event', '-s', session, '-u', eventName]);
  manageChild(child, cb);
};

exports.enableKernelEvent = function(session, eventName, cb){
  var child = spawn('lttng', ['enable-event', '-s', session, '-k', eventName]);
  manageChild(child, cb);
};

exports.start = function (session, cb){
  var child = spawn('lttng', ['start', session]);
  manageChild(child, cb);
};

exports.stop = function(session, cb){
  var child = spawn('lttng', ['stop', session]);
  manageChild(child, cb);
};

exports.destroy = function(session, cb){
  var child = spawn('lttng', ['destroy', session]);
  manageChild(child, cb);
};

exports.listUserlandEvents = function(cb){
  var child = spawn('lttng',  ['list',  '-u']);
  manageChild(child, cb);
};

function manageChild(child, cb){
  var output = '';
  child.stdout.on('data', function (data) {
    output += data;
  });

  var error = '';
  child.stderr.on('data', function (data) {
    console.log(data);
    error += data;
  });

  child.on('exit', function childFinished(code){
    if(code !== 0){
      error += '\nChild exited with code:' + code;
      return cb(error, output);
    }
    return cb(null, output);
  });

  child.on('error', function errorOccured(err){
    console.error(err);
  });
}