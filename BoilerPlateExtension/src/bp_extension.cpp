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
 * Purpose: Implements Crosswalk extension generic code; if the name of your extension is "MyExtension",
 * replace all of the bpXXX tokens below with MyExtensionxxx.
 * Description:
 */
#include "src/bp_extension.h"
#include "src/bp_instance.h"
#include <syslog.h>

common::Extension* CreateExtension() {
  return new bpExtension();
}

extern const char kSource_bp_api[];

bpExtension::bpExtension() {
  SetExtensionName("bp");
  SetJavaScriptAPI(kSource_bp_api);
	syslog(LOG_USER | LOG_DEBUG, "bpExtension ctor");
}

bpExtension::~bpExtension() {}

common::Instance* bpExtension::CreateInstance() {
	syslog(LOG_USER | LOG_DEBUG, "CreateInstance");
  return new bpInstance();
}
