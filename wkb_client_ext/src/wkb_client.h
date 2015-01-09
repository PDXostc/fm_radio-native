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

#ifndef WEEKEYBOARD_CLIENT_H
#define WEEKEYBOARD_CLIENT_H

/* Rob Erickson
 *
 * Provides the implementation of the interface for a Javascript XWalk application
 * to use the Weekeyboard client.
 * 
 * Adapted from
 * https://github.com/crosswalk-project/crosswalk/blob/master/extensions/test/echo_extension.c
 * Copyright (c) 2013 Intel Corporation. All rights reserved.
 * Use of this source code is governed by a BSD-style license
 * that can be found in the LICENSE file.
 */

#include <string>

#include "extension_common/extension.h"
class WeekeyboardConfigClient;

class WeekeyboardClient : public common::Instance
{
  public:
    WeekeyboardClient();
    virtual ~WeekeyboardClient();
    
    // Called by JavaScript to pass in a message that will be executed asynchronously;
    // any return data will be sent back using the PostMessage call.
    void HandleMessage(const char* message);
    
    // Called by JavaScript to pass in a message that will be executed synchronously.
    void HandleSyncMessage(const char* message);

  private:
    // The implementation of HandleMessage and HandleSyncMessage call this function to format the reply
    // to be sent back to the JavaScript into JSON.
    std::string PrepareMessage(std::string msg) const;

    static WeekeyboardConfigClient* _configInstance;
};

#endif
