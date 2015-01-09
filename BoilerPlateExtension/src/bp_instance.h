#ifndef BP_INSTANCE_H_
#define BP_INSTANCE_H_

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
 Created by: Jeff Eastwood
 * Purpose: Implements  Crosswalk extension generic code; if the name of your extension is "MyExtension",
 * replace all of the bpXXX tokens below with MyExtensionxxx.
 *
 * provides two of the three top level Crosswalk extension interfaces between JavaScript
 * and the C++ extension: HandleMessage for synchronous messages (be sure that any code
 * executed by your synchronous code does not block for very long), and HandleSyncMessage
 * for asynch messages. Replies from asynch messages go back to the javaScript via PostMessage
 * and are received by the listener function in JavaScript.

 Adapted from
 https://github.com/crosswalk-project/crosswalk/blob/master/extensions/test/echo_extension.c
 Copyright (c) 2013 Intel Corporation. All rights reserved.
 Use of this source code is governed by a BSD-style license
 that can be found in the LICENSE file.
*/

#include <string>

#include "common/extension.h"

// This class exists to provide the top level C++ interfaces between JavaScript and C++.
// The three methods defined here are
// required by the Crosswalk Extension architecture.
class bpInstance : public common::Instance {
 public:
  bpInstance();
  ~bpInstance();

  // common::Instance implementation

  // Called by JavaScript to pass in a message that will be executed asynchronously;
  // any return data will be sent back using the PostMessage call.
  void HandleMessage(const char* message);
  // Called by JavaScript to pass in a message that will be executed synchronously.
  void HandleSyncMessage(const char* message);

 private:
  // The implementation of HandleMessage and HandleSyncMessage call this function to format the reply
  // to be sent back to the JavaScript into JSON.
  std::string PrepareMessage(std::string msg) const;
};

#endif  // BP_INSTANCE_H_
