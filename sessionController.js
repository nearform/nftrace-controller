var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var ps = require('ps-nodejs');
var liner = require('./liner');

exports.createSession = function(session, cb){
  var child = spawn('lttng', ['create', session, '--live']);
  manageChild(child, cb);
};

exports.enableUserlandEvent = function(session, eventName, filter, cb){
  var arr = ['enable-event', '-s', session, '-u', eventName];
  if(cb){
    arr.push('-f', filter); 
  } else{
    cb = filter;
  }
  var child = spawn('lttng', arr);
  manageChild(child, cb);
};

exports.enableKernelEvent = function(session, eventName, filter, cb){
  var arr = ['enable-event', '-s', session, '-k', eventName];
  if(cb){
    arr.push('-f', filter); 
  } else{
    cb = filter;
  }

  var child = spawn('lttng', arr);
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
  exec('lttng list -u', function(err, stdout, stderr){
    if(err){
      return cb(err, stderr);
    }
    var processTracepoints = {}; 
    // the object that represents the tracepoints
  
    // take the output, split it into the different processes' and make
    // arrays that represent those processes' & their tracepoints
    var out = stdout.replace(/ /g, '');//replace all whitespace using a regexp
    out = out.split('-------------\n\n')[1]; 
    // get rid of the info at the start of lttng list, choose element 1
  
      var arr = out.split('\n\n');
    arr.pop();
    // this has left the output with very few white spaces and more
    // understandable output/arrays
    for(var i = 0; i < arr.length; i++){
      // split the array into strings, with the name, pid, and
      // tracepoints of a running process.
      arr[i] = arr[i].split('\n');
      arr[i][0] = arr[i][0].split('-');
      for(var j = 0; j < arr[i][0].length; j++){
        arr[i][0][j] = arr[i][0][j].split(':');
      }
    }
    // take that output, and process it into an object
    for(i = 0; i < arr.length; i++){
      niceClosure(i);
    }
    
    function niceClosure(i){
      // get name and pid, delete that element of the array
      var name = arr[i][0][1][1];
      var pid = arr[i][0][0][1];
      arr[i].shift();
  
        // create object representing process
      var process = name + '_' + pid;
      // each process and associated tracepoints are saved in an object
      processTracepoints[process] = {};
      processTracepoints[process].name = name;
      processTracepoints[process].pid = pid;
  
      // do some crazy splitting of the tracepoint string and remove the 
      // brackets not even gonna try justify this madness.
      var tracepointObjects = {};
      for(var j = 0; j < arr[i].length; j++){
        arr[i][j] = arr[i][j].split('(l');
        arr[i][j][1] = 'l' + arr[i][j][1];
        arr[i][j][1] = arr[i][j][1].split('(t');
        arr[i][j][1][1] = 't' + arr[i][j][1][1];
        arr[i][j] = [arr[i][j][0], 
                     arr[i][j][1][0].substr(0, arr[i][j][1][0].length-1), 
                     arr[i][j][1][1].substr(0, arr[i][j][1][1].length-1)];
        var tracepointObject = {};
        var loglevel = arr[i][j][1].split(':')[1];
        var type = arr[i][j][2].split(':')[1];
        tracepointObject = {
          logLevel: loglevel,
          type: type
        };
        tracepointObjects[arr[i][j][0]] = tracepointObject;
      }
  
      processTracepoints[process].tracepoints = tracepointObjects;
  
      // get more information on the process by doing a pid lookup
      // NOTE: ps is broken, but it parses the output nicely.
      // I'm using it to get the objects from output from ps, and filtering
      // myself.
      ps.lookup({ name: name, psargs: 'u' }, function(err, resultList ) {
       if (err) {
          throw new Error( err );
        }
        var proc = resultList.filter(function(element){
          return element.pid == pid;
        })[0]; //select the first element of the filtered array.
  
          processTracepoints[process].args = proc.arguments;
        processTracepoints[process].doneAsync = true;
        var keys = Object.keys(processTracepoints);
        // check if all async pslookups are done.
        var done = true;
        keys.forEach(function(key){
          if(!processTracepoints[key].doneAsync){
            done = false;
          }
        });
        if(done){
          keys.forEach(function(key){
          delete processTracepoints[key].doneAsync;
        });
        cb(null, processTracepoints);
        }
      });
    }
  });
};

exports.listKernelEvents = function(cb){
  exec('lttng list -k', function(err, stdout, stderr){
    if(err){
      return cb(err, stderr);
    }
    cb(null, stdout);
  });
};

function manageChild(child, cb){
  var output = '';
  child.stdout.on('data', function (data){
    output += data;
  });

  var error = '';
  child.stderr.on('data', function (data){
    console.log(data);
    error += data;
  });

  child.on('close', function childFinished(code){
    if(code !== 0){
      error += '\nChild exited with code:' + code;
      return cb(error, output);
    }
    //var lines = output.split('\n');
    //console.log(lines);
    return cb(null, output);
  });

  child.on('error', function errorOccured(err){
    console.error(err);
  });
}

exports.getEventStream = function(cb){
  var child = spawn('lttng',  ['view']);
  child.stdout.pipe(liner);
  liner.on('readable', function () {
    var line = liner.read();
    while (line) {
      cb(line);
      line = liner.read();
    }
  });
};







































