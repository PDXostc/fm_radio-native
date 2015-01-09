/*
 * Modified by: Jeff Eastwood
 * Purpose: Part of XW infrastructure to link javaScript to C++ plugin code.
 * Description:
 * Provides the three generic interfaces from C++ plugin (Crosswalk extension) to JavaScript: 
 * synchronous and asynchronous calls from javaScript to C++, and a listener method that receives 
 * return messages sent from the C++ plugin.
*/
var bpListener = null;

extension.setMessageListener(function(json) {
	
	  var message = JSON.parse(json);
	  var msg = message.msg;

	  if (bpListener instanceof Function) {
		  bpListener(msg);

	  } else {
	    console.log("js api: bpListener not set.");
	  }
	
});

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.bpAsync = function (msg, callback) {
	
	  bpListener = callback;
	  
//	  var resp = {"msg": msg};
//	  extension.postMessage(JSON.stringify(resp));
	  extension.postMessage(msg);
	  
};

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.bpSync = function (msg) {
//	  var resp = {"msg": msg};
 // return extension.internal.sendSyncMessage(JSON.stringify(resp));
	return extension.internal.sendSyncMessage(msg);
};
