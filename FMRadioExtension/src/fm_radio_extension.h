// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef FM_RADIO_EXTENSION_H_
#define FM_RADIO_EXTENSION_H_

#include "../../extension_common/extension.h"

class FMRadioExtension : public common::Extension {
 public:
  FMRadioExtension();
  virtual ~FMRadioExtension();

 private:
  // common::Extension implementation
  virtual common::Instance* CreateInstance();
};

#endif  // FM_RADIO_EXTENSION_H_
