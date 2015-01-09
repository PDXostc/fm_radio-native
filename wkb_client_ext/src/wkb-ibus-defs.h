/*
 * Copyright © 2013 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef _WKB_IBUS_DEFS_H_
#define _WKB_IBUS_DEFS_H_

#ifdef __cplusplus
extern "C" {
#endif

/* from ibusshare.h */
#define IBUS_SERVICE_IBUS       "org.freedesktop.IBus"
#define IBUS_SERVICE_PANEL      "org.freedesktop.IBus.Panel"
#define IBUS_SERVICE_CONFIG     "org.freedesktop.IBus.Config"

#define IBUS_PATH_IBUS          "/org/freedesktop/IBus"
#define IBUS_PATH_PANEL         "/org/freedesktop/IBus/Panel"
#define IBUS_PATH_CONFIG        "/org/freedesktop/IBus/Config"

#define IBUS_INTERFACE_IBUS     "org.freedesktop.IBus"
#define IBUS_INTERFACE_PANEL    "org.freedesktop.IBus.Panel"
#define IBUS_INTERFACE_CONFIG   "org.freedesktop.IBus.Config"
#define IBUS_INTERFACE_INPUT_CONTEXT "org.freedesktop.IBus.InputContext"

/* from ibustypes.h/ibuserror.c */
#define IBUS_ERROR_NO_ENGINE    "org.freedesktop.IBus.Error.NoEngine"
#define IBUS_ERROR_NO_CONFIG    "org.freedesktop.IBus.Error.NoConfig"
#define IBUS_ERROR_FAILED       "org.freedesktop.IBus.Error.Failed"

#ifdef __cplusplus
}
#endif

#endif /* _WKB_IBUS_DEFS_H_ */
