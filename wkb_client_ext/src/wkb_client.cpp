/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
 *
 * Proprietary and confidential
 * Unauthorized copying of this file, via any medium, is strictly prohibited
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 */

#include "wkb_client.h"
#include "wkb_config_client.h"

#include "extension_common/picojson.h"
#include <syslog.h>


WeekeyboardConfigClient* WeekeyboardClient::_configInstance = NULL;

WeekeyboardClient::WeekeyboardClient()
{
    if (! _configInstance)
    {
        try
        {
            _configInstance = new WeekeyboardConfigClient;
            _configInstance->Init();
        }
        catch (std::exception& e)
        {
            syslog(LOG_USER | LOG_ERR, "wkb_client - Error initializing.");
            syslog(LOG_USER | LOG_ERR, e.what());
            _configInstance = NULL;
        }
    }
}

WeekeyboardClient::~WeekeyboardClient()
{
    
}

// Called by JavaScript to pass in a message that will be executed asynchronously;
// any return data will be sent back using the PostMessage call.
// The message parameter is handled as follows:
// messages arives as stringified json, formatted as:
//
// api: <setTheme(string theme_path)>
//
void
WeekeyboardClient::HandleMessage(const char* message)
{
    if (! _configInstance)
    {
        syslog(LOG_USER | LOG_ERR, "Weekeyboard client not initialized");
        return ;
    }


	syslog(LOG_USER | LOG_DEBUG, "RE:  HandleMessage str is %s", message);

	// Parse json string into string, value pairs:
	picojson::value v;
	std::string err;
	picojson::parse(v, message, message + strlen(message), &err);
	if (!err.empty())
    {
	    syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage message is empty, ignoring.");
	    return;
	}

    syslog(LOG_USER | LOG_DEBUG, "RE: HandleSyncMessage - no sync calls are supported. Returning error");
    std::string resp = "error";
    
    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);
    
    PostMessage(rv.serialize().c_str());

}

void
WeekeyboardClient::HandleSyncMessage(const char* message)
{
    if (! _configInstance)
    {
        syslog(LOG_USER | LOG_ERR, "Weekeyboard client not initialized");
        return ;
    }
    
	syslog(LOG_USER | LOG_DEBUG, "RE:  HandleSyncMessage str is %s", message);

    picojson::value v;
    std::string err;
    picojson::parse(v, message, message + strlen(message), &err);

    std::string msg;
    bool failed = false;
    failed = failed || v.is<picojson::null>();
    
    std::string apiVal;
  
    if (! failed)
    {
        apiVal = v.get("api").to_str();
        syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage sees get(api) as %s\n", apiVal.c_str());
    }

    failed = failed || apiVal.empty();
    if (! failed && apiVal == "setTheme")
    {
        std::string paramVal1 = v.get("theme").to_str();
        try
        {
            _configInstance->SetTheme(paramVal1);
        }
        catch (std::exception& e)
        {
            failed = true;
            syslog(LOG_USER | LOG_ERR, "RE:wkb_client: exception during set theme!");
            syslog(LOG_USER | LOG_ERR, e.what());
        }
    }
    else
    {
        syslog(LOG_USER | LOG_DEBUG, "RE: Unsupported api: %s", apiVal.c_str());
        failed = true;
    }

    if (! failed)
	{
        // Create and post a success message
        std::string resp = "ok";
        
        picojson::object o;
        o["msg"] = picojson::value(resp);
        picojson::value rv(o);
        SendSyncReply(rv.serialize().c_str());
	}
    else
    {
        syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage fails");
        
        // Create and post a failure message
        std::string resp = "error";

        picojson::object o;
        o["msg"] = picojson::value(resp);
        picojson::value rv(o);
        SendSyncReply(rv.serialize().c_str());
	}

}

