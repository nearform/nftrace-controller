var stream = require('stream');

function makeStream(){
  var theStream = new stream.Transform( { objectMode: true } );
  
  theStream._transform = function (chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData){
      data = this._lastLineData + data;
    }
    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length-1,1)[0];
    lines.forEach(function(line){
      var trace;
      trace = line.split('[')[1];
      trace = trace.split('] (');
      trace = [trace[0], trace[1].split(': {')[0], trace[1].split(': {')[1]];
      trace = [trace[0], trace[1].split(') ')[0], trace[1].split(' ')[1], trace[1].split(' ')[2], trace[2]];
      trace = [trace[0], trace[1], trace[2], trace[3], trace[4].split(' }, { ')[0], trace[4].split(' }, { ')[1]];
      trace = [trace[0], trace[1], trace[2], trace[3], trace[4], trace[5].split(', ')];
      trace[5][trace[5].length-1] = trace[5][trace[5].length-1].split(' }')[0];
      trace = {
        'time': trace[0],
        'timeFromLast': trace[1],
        'host': trace[2],
        'name': trace[3],
        'cpuId': trace[4].split(' = ')[1],
        'eventData': trace[5]
      };
      var dd = {};
      trace.eventData.forEach(function(d){
        d.replace(/ /g, '');
        dd[d.split(' = ')[0]] = d.split(' = ')[1];
      });
      trace.eventData = dd;
      this.push(trace);
    }.bind(this));
    done();
  };
  
  theStream._flush = function (done) {
    if (this._lastLineData){ 
      this.push(this._lastLineData);
    }
    this._lastLineData = null;
    done();
  };

  return theStream;
}

module.exports = makeStream;