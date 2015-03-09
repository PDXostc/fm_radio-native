/**
 * FMRadioExtension bridge between HTML5/JS web applications and FMRadioService
 * dbus daemon in C/C++
*/
/*! \file */

// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "fm_radio_extension.h"
#include "fm_radio_instance.h"

common::Extension* CreateExtension() {
    return new FMRadioExtension();
}

extern const char kSource_fm_radio_api[];

FMRadioExtension::FMRadioExtension() {
    SetExtensionName("fmradio");
    SetJavaScriptAPI(kSource_fm_radio_api);
}

FMRadioExtension::~FMRadioExtension() {}

common::Instance* FMRadioExtension::CreateInstance() {
    return new FMRadioInstance;
}
