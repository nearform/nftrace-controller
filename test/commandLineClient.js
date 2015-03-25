var readline = require('readline');
var sessionController = require('..');
var ps = require('ps-nodejs');

var rl = readline.createInterface(process.stdin, process.stdout);
console.log('Hello! Welcome to the console application.');

rl.setPrompt('Enter Option> ');
rl.on('close', exitProgram);

var started = false;

var lttngSession = 'nodejsConsoleAppSession';

var menu = '';
menu += 'Please enter the option you would like to carry out\n';
menu += '1) List all userland tracepoints in running processes\'\n';
menu += '2) List all kernel tracepoints\n';
menu += '3) Enable a userland tracepoint\n';
menu += '4) Enable a kernel tracepoint\n';
menu += '5) Start tracing\n';
menu += '6) View the tracing session\n';
menu += '0) Exit this program\n\n';


sessionController.createSession(lttngSession, function(err, out){
  if(err || !out.command.success[0]){ 
    return sessionController.destroy(lttngSession, function(err){
      if(err){ 
        throw err;
      }
      sessionController.createSession(lttngSession, function(err, out){
        if(err){
          throw err;
        }
        if(out.command.success[0]){
          console.log('created session');
        }
        mainMenu();
      });
    });
  }
  if(out.command.success[0]){
    console.log('created session');
  }
  mainMenu();
});

function mainMenu(){
  rl.question(menu, function(answer) {
    console.log('answer ' + answer);
    if(answer !== '' && !isNaN(answer) && 
      Number(answer) >= 0 && Number(answer) <= 6){
        switch(answer){
          case '1':
            printUserlandTracepoints();
            break;
          case '2':
            printKernelTracepoints();
            break;
          case '3':
            enableUserlandTracepoints();
            break;
          case '4':
            enableKernelTracepoints();
            break;
          case '5':
            startTracing();
            break;
          case '6':
            getEventStream();
            break;
          case '0':
            rl.close();
            break;
        }
      } else{
      console.log('Answer is invalid. try again.');
      mainMenu();
      }
    });
}

function printUserlandTracepoints(){
  sessionController.listUserlandEvents(function(err, out){
      if(err){
        throw new Error(err);
      }
      if(out.command.output[0].domains[0].domain[0].pids[0] === ''){
        console.log('No running processes with lttng tracepoints.');
        return mainMenu();
      }

      var processes = out.command.output[0].domains[0].domain[0].pids[0].pid;
      var i = 0;

      var output = 'UST Tracepoints in active processes:\n\n';

      printProcessInfo(i);

      function printProcessInfo(i){
        if(processes.length && i === processes.length){
          console.log(output);
          return mainMenu();
        }
        var proc = processes[i];
        var tracepoints = proc.events[0].event;
        ps.lookup({ name: proc.name[0], psargs: 'u' }, function(err, resultList ) {
            if (err) {
              throw new Error(err);
            }
            var args = resultList.filter(function(element){
              return element.pid == proc.id[0];
            })[0].arguments; //select the first element of the filtered array.
            output += 'Process: ' + proc.name[0] + ' (PID: ' + proc.id[0] + ')\n';
            output += 'Command: ' + proc.name[0];
            args.forEach(function(arg){
              output += ' ' + arg;
            });
            output += '\n';
            tracepoints.forEach(function(tp){
              output += '\tName: ' + tp.name[0] + ' (Loglevel: ' + tp.loglevel[0] + ') (Type: ' + tp.type[0] + ')\n';
            })
            output += '\n';
            printProcessInfo(++i);
        });
      };
  });
}

function printKernelTracepoints(){
  sessionController.listKernelEvents(function(err, out){
      if(err){
        console.log('Error listing kernel tracepoints... Have you run the sessiond as root?');
        console.log('($: sudo lttng-sessiond -b)');
        return mainMenu();
      }
      var output = '\nKernel Tracepoints:\n'; 
      var tracepoints = out.command.output[0].domains[0].domain[0].events[0].event;
      tracepoints.forEach(function(tracepoint){
            output += '\tName: ' + tracepoint.name[0] + ' (Loglevel: ' + 
            tracepoint.loglevel[0] + ') (Type: ' + tracepoint.type[0] + ')\n';
      });
      output += '\n\n';
      console.log(output);
      mainMenu(); 
  });
}

function enableUserlandTracepoints(){
  var printOut = '';
  printOut += 'Enter the tracepoint names, delimited by commas,\n';
  printOut += 'you can enter the pid in brackets. Whitespace is ignored.\n';
  printOut += 'EG: node:gc*,node:net*(pid:123)\n';

  rl.question(printOut, function(answer) {
    answer.replace(/ /g, '');
    var tracepoints = answer.split(',');
    for(var i = 0; i < tracepoints.length; i++){
      if(tracepoints[i].indexOf('(') >= 0){
        tracepoints[i] = tracepoints[i].split('(');
        tracepoints[i][1] = tracepoints[i][1].split(':')[1];
        tracepoints[i][1] = tracepoints[i][1].substring(0, 
                   tracepoints[i][1].length-1);
      }
    }
    
    enableTp(0);
    function enableTp(tp){
      if(tp === tracepoints.length || tracepoints[tp] === ''){ 
        return mainMenu();
      }
      if(tracepoints[tp].constructor === Array){
        sessionController.enableUserlandEvent(lttngSession, 
         tracepoints[tp][0], tracepoints[tp][1], function(err, out){
          if(err){
            console.log(err);
            throw new Error('Problem enabling a tracepoint');
          }
          tp++;
          enableTp(tp);
        });
      } else {
        sessionController.enableUserlandEvent(lttngSession, 
         tracepoints[tp], function(err){
          if(err){
            throw new Error('Problem enabling a tracepoint');
          }
          tp++;
          enableTp(tp);
        });
      }
    }
    });
}

function enableKernelTracepoints(){
  var printOut = '';
  printOut += 'Enter the tracepoint names, delimited by commas.\n';

  rl.question(printOut, function(answer) {
    answer.replace(/ /g, '');
    var tracepoints = answer.split(',');
    enableTp(0);
    function enableTp(tp){
      if(tp === tracepoints.length || tracepoints[tp] === ''){ 
        return mainMenu();
      }
      sessionController.enableKernelEvent(lttngSession, 
       tracepoints[tp], function(err){
        if(err){
          throw new Error('Problem enabling a tracepoint');
        }
        tp++;
        enableTp(tp);
      });
    }
    });
}

function startTracing(){
  sessionController.start(lttngSession, function(err){
    if(err){
      throw new Error('something went wrong');
    }
    started = true;
    console.log('started tracing');
    mainMenu();
  });
}

function getEventStream(){
  var stream = require('stream');
  var writable = new stream.Writable({objectMode: true});
  writable._write = function (chunk, encoding, done) {
    console.log(chunk);
    done();
  };

  sessionController.getEventStream(writable);
  mainMenu();
}


function exitProgram(){
  if(started){
    sessionController.stop(lttngSession, function(err){
      if(err){
        throw new Error(err);
      }
      console.log('stopped session');
      sessionController.destroy(lttngSession, function(err){
        if(err){ 
          throw new Error(err);
        }
        console.log('Destroyed session');
        console.log('Bye now!');
        process.exit(0);
      });
    });
  } else{
    sessionController.destroy(lttngSession, function(err){
      if(err){ 
        throw new Error(err);
      }
      console.log('Destroyed session');
      console.log('Bye now!');
      process.exit(0);
    });
  }
}