#ifndef BP_EXTENSION_H_
#define BP_EXTENSION_H_

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

  Adapted from
  https://github.com/crosswalk-project/crosswalk/blob/master/extensions/test/echo_extension.c
  Copyright (c) 2013 Intel Corporation. All rights reserved.
  Use of this source code is governed by a BSD-style license
  that can be found in the LICENSE file.
*/

#include "common/extension.h"

// This class exists to create an instance of the bpInstance object; This behavior
// is required by the Crosswalk Extension architecture.
class bpExtension : public common::Extension {
 public:
  bpExtension();
  virtual ~bpExtension();

 private:
  // common::Extension implementation.
  virtual common::Instance* CreateInstance();  // Creates the bpInstance object,
};

#endif  // BP_EXTENSION_H_
