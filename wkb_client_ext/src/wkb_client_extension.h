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

/* Rob Erickson (rerickso@jaguarlandrover.com)
 *
 * Provices interface for plplugin (aka Crosswalk extension) to the Weekeyboard
 * client. Currently that provides a configuration method to set the theme.
 */

#ifndef WEEKEYBOARD_CLIENT_EXTENSION_H
#define WEEKEYBOARD_CLIENT_EXTENSION_H

#include "extension_common/extension.h"

class WeekeyboardClientExtension : public common::Extension
{
  public:
    WeekeyboardClientExtension();
    virtual ~WeekeyboardClientExtension();

  protected:
    virtual common::Instance* CreateInstance();
};

#endif
