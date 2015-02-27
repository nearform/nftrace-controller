var http = require('http');

var location = process.argv[2];
var depthToGo = process.argv[3];
var requestsPerProcess = process.argv[4];
var currentDepth = process.argv[5];

if(currentDepth === undefined){
	currentDepth = 1;
}
if (currentDepth === depthToGo){  
  child();
}else{
  parent();
}

function parent() {
	currentDepth++;
	var spawn = require('child_process').spawn;
	spawn(process.execPath, [__filename, location, depthToGo, 
							requestsPerProcess, currentDepth])
							.stdout.pipe(process.stdout);
	spawn(process.execPath, [__filename, location, depthToGo, 
							requestsPerProcess, currentDepth])
							.stdout.pipe(process.stdout);

	curl();
}

function child() {
  	curl();
}

function curl(){
	for(var i = 0; i < requestsPerProcess; i++){
		http.get(location);
	}
}
