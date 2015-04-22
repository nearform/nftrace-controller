var json5 = require('json5'),
    stream = require('stream');

function makeStream(){
  var theStream = new stream.Transform( { objectMode: true } );
  
  theStream._transform = function (chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData){
      data = this._lastLineData + data;
    }

    var lines = data.split('\n');

    if(lines[lines.length-1] === ''){
      lines.splice(lines.length-1,1);
      this._lastLineData = null;
    } else {
      this._lastLineData = lines.splice(lines.length-1,1)[0];
    }
    
    lines.forEach(parseLine.bind(this));
    done();
  };
  
  theStream._flush = function (done) {
    if (this._lastLineData){ 
      parseLine.call(this, this._lastLineData);
    }
    this._lastLineData = null;
    done();
  };

  function parseLine (line){
    var trace = {};

    trace.time = line.match(/(?!\[).+?(?=\])/)[0];
    trace.timeFromLast = line.match(/(?!.*?\().+?(?=\))/)[0];
    
    var hostAndTracepoint = line.match(/(?!.*?\))\b.*?(?=: {)/)[0];
    trace.host = hostAndTracepoint.split(' ')[0];
    trace.tracepoint = hostAndTracepoint.split(' ')[1];
    trace.extInfo = line.match(/{(.*?)}/g);

    for(var i = trace.extInfo.length - 1; i >= 0; i--){
      trace.extInfo[i] = trace.extInfo[i].replace(/ =/g, ':');
      trace.extInfo[i] = trace.extInfo[i].replace(/=/g, ':');

      trace.extInfo[i] = json5.parse(trace.extInfo[i]);
      var keys = Object.keys(trace.extInfo[i])

      // skip the last object because that is actually the eventData, 
      // which should be saved in the trace.eventData obj
      if(i !== trace.extInfo.length - 1 && keys.length === 1){
        trace[keys[0]] = trace.extInfo[i][keys[0]];
        trace.extInfo.splice(i, 1);
      }
    };

    trace.eventData = trace.extInfo[trace.extInfo.length - 1].splice(trace.extInfo.length - 1, 1);
    if(trace.extInfo.length === 0){
      trace.extInfo = undefined;
    }

    this.push(trace);
  }

  return theStream;
}

module.exports = makeStream;