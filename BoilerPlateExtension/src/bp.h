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
 * Purpose: Provides implementation bp extension functionality. In general, the bp_instance code
 * handles/dispatches all communications from/to Javascript, and this class implements each individual API function.
 */

#ifndef BP_H
#define BP_H

#include <string>
#include <map>

class AbstractPropertyType;

namespace DeviceAPI { // This namespace encapsulates all classes written for this plugin.
namespace bp { // This namespace encapsulates all bp related classes written for this plugin.


/*! \class DeviceAPI::bp::bpMaster
 * \brief One of two top level JavaScript-C++ bridge/wrapper classes for controlling the bp extension.
*   One of two top level JavaScript-C++ bridge/wrapper classes for controlling the bp extension.
*
*	Dependencies: none at the class level; see bp.cpp for implementation dependencies.
*/
class bpMaster
{
public:

	bpMaster();
	~bpMaster();

	/** \brief \brief Pass Tile and Descripiton data received from UI to C++ handler. */
	void handleItem(std::string dest, std::string title, std::string desc );

	std::string getTitle(void) { return curTitle; }
	void setTitle(std::string _title) { curTitle = _title; }

private:
	bpMaster(bpMaster&);
	bpMaster& operator=(bpMaster&);
	std::string curTitle;  // Is set to the last title received by handleItem.
};

} // bp
} // DeviceAPI

#endif // BP_H

