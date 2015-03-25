var http = require('http');

for(var i = 0; i < 100000; i++){
	http.get({'hostname': 'localhost', 'port': '1338', 'path': '/', 
		'agent': false}, function(r){ r.on('data', function(){}); });
}

