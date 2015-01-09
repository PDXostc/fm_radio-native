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

#include "wkb_client_extension.h"
#include "wkb_client.h"

#include <syslog.h>

extern const char kSource_wkb_client_api[];

common::Extension* CreateExtension()
{
    return new WeekeyboardClientExtension();
}

WeekeyboardClientExtension::WeekeyboardClientExtension()
{
    SetExtensionName("wkb_client");
    SetJavaScriptAPI(kSource_wkb_client_api);
    
	syslog(LOG_USER | LOG_DEBUG, "RE:WeekeyboardClientExtension ctor");
}

WeekeyboardClientExtension::~WeekeyboardClientExtension()
{}

common::Instance*
WeekeyboardClientExtension::CreateInstance()
{
	syslog(LOG_USER | LOG_DEBUG, "RE:  CreateInstance");
    
    return new WeekeyboardClient();
}
