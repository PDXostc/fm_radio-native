/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
*/

/*
 * Created by: Jeff Eastwood
 * Purpose: Provides the implementation of the interface between a JavaScript application that needs to use the bp
 * plugin (aka Crosswalk extension) and the C++ code that implements the bp API.
 *
 * Receives the title and description strings sent from the Boilerplate applications
 * main.js::addItemClick function and passes the two values to the bpMaster object's handleItem function.
 *
 */

#include "src/bp_instance.h"
#include "common/picojson.h"
#include <syslog.h>

#include "bp.h"

static DeviceAPI::bp::bpMaster* bpMaster;
bpInstance::bpInstance() {
	syslog(LOG_USER | LOG_DEBUG, "bpInstance ctor");
	bpMaster = new DeviceAPI::bp::bpMaster;
}

bpInstance::~bpInstance() {
}

// Called by JavaScript to pass in a message that will be executed asynchronously;
// any return data will be sent back using the PostMessage call.
// The message parameter is handled as follows:
// messages arives as stringified json, formatted as:
// api: <setItem>
// dest: <itemHandler><itemQuery>
//
void bpInstance::HandleMessage(const char* message) {

	syslog(LOG_USER | LOG_DEBUG, "HandleMessage str is %s", message);

	// Parse json string into string, value pairs:
	picojson::value v;
	std::string err;
	picojson::parse(v, message, message + strlen(message), &err);
	if (!err.empty()) {
	    syslog(LOG_USER | LOG_DEBUG, "HandleMessage is Ignoring message.\n");
	    return;
	}

	bool failed=true;
	do
	{

	  if( v.is<picojson::null>())
		  break;
	  syslog(LOG_USER | LOG_DEBUG, "OK1\n");

	  std::string apiVal, destVal, paramVal1, paramVal2;

	  apiVal = v.get("api").to_str();
	  destVal = v.get("dest").to_str();
	  syslog(LOG_USER | LOG_DEBUG, "HandleMessage sees get(api) as %s\n", apiVal.c_str());
	  syslog(LOG_USER | LOG_DEBUG, "HandleMessage sees get(dest) as %s\n", destVal.c_str());

	  if(apiVal.empty() || destVal.empty())
		  break;

	  // Now we can do the mapping of the api tag to the supported bpMaster function calls:
	  if( apiVal == "handleItem")
	  {

		  paramVal1 = v.get("title").to_str();
		  paramVal2 = v.get("desc").to_str();
		  bpMaster->handleItem(destVal, paramVal1, paramVal2);

	  }
	  else
	  {
		  syslog(LOG_USER | LOG_DEBUG, "Unsupported api: %s\n", apiVal.c_str());
		  break;
	  }

	  failed=false;
	  break;

	} while(0);

	if(failed)
	{
	  syslog(LOG_USER | LOG_DEBUG, "HandleMessage fails\n");
	  std::string msg;
			  std::string resp = PrepareMessage(msg);

			  picojson::object o;
			  o["msg"] = picojson::value(resp+"aaa");
			  picojson::value rv(o);
			  PostMessage(rv.serialize().c_str());
	  // Create and post a failure message
	}
	else
	{
	  std::string msg;
	  std::string resp = PrepareMessage(msg);

	  picojson::object o;
	  o["msg"] = picojson::value(resp);
	  picojson::value rv(o);
	  PostMessage(rv.serialize().c_str());
	}

}
// Called by JavaScript to pass in a message that will be executed synchronously.
void bpInstance::HandleSyncMessage(const char* message) {
	syslog(LOG_USER | LOG_DEBUG, "HandleSyncMessage str is %s", message);

	 picojson::value v;
	  std::string err;
	  picojson::parse(v, message, message + strlen(message), &err);

	  std::string msg;

	  if (!err.empty()) {
	    syslog(LOG_USER | LOG_DEBUG, "HandleSyncMessage is Ignoring message.\n");
	    msg = std::string("empty");

		  std::string resp = PrepareMessage(msg);

		  picojson::object o;
		  o["msg"] = picojson::value(resp);
		  picojson::value rv(o);

	    SendSyncReply(rv.serialize().c_str());
	    return;
	  }

	  msg = v.get("msg").to_str();
	  syslog(LOG_USER | LOG_DEBUG, "HandleSyncMessage sees message string as %s\n", msg.c_str());

	  std::string resp = PrepareMessage(msg);

	  picojson::object o;
	  o["msg"] = picojson::value(resp+"bbb");
	  picojson::value rv(o);

  SendSyncReply(rv.serialize().c_str());
}

// The implementation of HandleMessage and HandleSyncMessage call this function to format the reply
// to be sent back to the JavaScript into JSON.
// In this case, return a string containing the title that was sent to HandleMessage.
// msg: The string sent from the bp extension's asynch handler.
std::string bpInstance::PrepareMessage(std::string msg) const {
	syslog(LOG_USER | LOG_DEBUG, " PrepareMessage");
  return( "Last title received: " + bpMaster->getTitle());
}
