var spawn = require('child_process').spawnSync;

var session = function(sessionName){
	var session = sessionName;
	var enabledUserlandEvents = [];
	var enabledKernelEvents = [];

	var self = {
		enableUserlandEvent: enableUserlandEvent,
		enableKernelEvent: enableKernelEvent,
		start: start,
		stop: stop,
		destroy: destroy
	};

	function enableUserlandEvent(eventName){
		enabledUserlandEvents.push(eventName);
		return self;
	}

	function enableKernelEvent(eventName){
		enabledKernelEvents.push(eventName);
		return self;
	}

	function start(){
		runCommands();
		spawn('lttng', ['start']);
		return self;
	}

	function stop(){
		spawn('lttng', ['stop']);
		return self;
	}

	function destroy(){
		spawn('lttng', ['destroy', session]);
		return self;
	}

	function runCommands(){
		spawn('lttng', ['create', session, '--live']);
		enabledUserlandEvents.forEach(function(event){
			spawn('lttng', ['enable-event', '-u', event]);
		});
		enabledKernelEvents.forEach(function(event){
			spawn('lttng', ['enable-event', '-k', event]);
		});
		return self;
	}

	return self;
};

module.exports = (function init(sessionName){
	if(sessionName !== undefined){
		return session(sessionName);
	} else{
		var rt = session;
		rt.createSession = session;
		return rt;
	}
})();
