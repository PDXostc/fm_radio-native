/*
 * Modified by: Rob Erickson
 * Purpose: Part of XW infrastructure to link javaScript to C++ plugin code.
 * Description:
 * Provides the three generic interfaces from C++ plugin to JavaScript: synchronous and asynch. calls
 * from javaScript to C++, and a listener method that receives return messages sent from the C++ plugin.
  */

var weekeboardClientErrorListener = null;

extension.setMessageListener(
    function(json)
    {
        var message = JSON.parse(json);
        var msg = message.msg;

	console.log("RE: Weekeboard callback message = " + msg);

	if (msg == "error")
	{
            if (weekeboardClientErrorListener instanceof Function) 
	    {
		weekeboardClientErrorListener(msg);	    
            } 
	    else 
	    {
		console.log("RE js api:weekeboardClientlistener not set.");
            }
	}
    });

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.clientAsync = function (msg, errorCallback) 
{
    weekeboardClientErrorListener = callback;

    extension.postMessage(msg);          
};

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.clientSync = function (msg) 
{
    return extension.internal.sendSyncMessage(msg);
};
