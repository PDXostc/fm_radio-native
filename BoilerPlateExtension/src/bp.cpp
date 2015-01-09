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
 * Purpose: Provides implementation of top level api used by the Boilerplate bp JavaScript interface.
 * Description:
 * This is the C++ interface to the bp Crosswalk extension (formerly called WRT a plugin).
 * It is made accessible to the widget application through the intermediation of the JavaScript interface in
 * bp_instance.cpp. Essentially, the members of the bp object visible in the widget application JavaScript
 * will correspond with the member functions declared here.
 */

#include "bp.h"

#include <stdexcept>
#include <memory>

#include <stdlib.h>
#include <unistd.h>
#include <syslog.h>


#define TIZEN_PREFIX            "org.tizen"

namespace DeviceAPI
{
namespace bp
{
/**
 * This class is the top level of the bp  Crosswalk extension.
 *
*/

bpMaster::bpMaster()
{
    syslog(LOG_USER | LOG_DEBUG, "bpMaster ctor");
}

bpMaster::~bpMaster()
{
}

/**
 * Receive a title string from HandleMessage and store it for later use.
 *
 * Parameters (purpose and usage):
 * dest: Unused here, but in general can provide a way to indicate what is to be done with the other parameters.
 * title: The title data the user entered into the Boilerplate title field.
 * desc: The description data the user entered into the Boilerplate description field.
 * title: The description data the user entered into the Boilerplate description field.
 * desc: The description data the user entered into the Boilerplate description field.
*/
void bpMaster::handleItem(std::string dest, std::string title, std::string desc )
{
	setTitle(title);  // Save title away for later sending back to application.
	syslog(LOG_USER | LOG_DEBUG, "bp handleItem receives %s  %s", title.c_str(), desc.c_str());
}

} // bp
} // DeviceAPI

