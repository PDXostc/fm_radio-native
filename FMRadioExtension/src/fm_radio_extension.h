// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Doxygen-based "general/mainpage" information section
/*! \mainpage Jaguar Land Rover FM Radio
 *
 * \section intro_sec Introduction
 *
 * This project provides a proof of concept FM Radio application for the Tizen
 * IVI environment. It is accomplished by enabling the reference FM radio
 * hardware through a background dbus service/daemon (FMRadioService) that
 * controls GStreamer and other low level libraries (gstsdrjfm) that demodulate
 * the FM signal into audio data. The background service will provides a D-Bus
 * API that exposes WebFM API (MPL) to the Crosswalk Web Runtime though a
 * matching JavaScript API. The application (DNA_FMRadio) uses these APIs for
 * the selection of radio stations, starting and stopping playback. The
 * application is the user-facing section of the project. It is built using the
 * Crosswalk Web Runtime infrastructure, and takes advantage of the state of
 * already provided 'DNA' UI framework from customer.
 *
 * \section note_sec Important note
 *
 * This Doxygen-generated documentation only covers the following components :
 *  * FMRadioExtension and FMRadioInstance (Crosswalk plugin bridging high-level app to dbus daemon)
 *
 * Please, find documentation of these other components in the below locations :
 *  * FMRadioService (FM radio dbus daemon)
 *     * <X004_DNAFMRadio/FMRadioService/docs/html/index.html>
 *  * gstsdrjfm      (GST element doing actual demodulation using third-party sdrj)
 *     * <X004_DNAFMRadio/FMRadioService/docs/html/index.html>
 *  * DNA_FMRadio (crosswalk Web application)
 *     * ...
 */

#ifndef FM_RADIO_EXTENSION_H_
#define FM_RADIO_EXTENSION_H_

#include "../../extension_common/extension.h"

/**
 * Main extension class exposed through crosswalk plugin infrastructure.
 * This class does not contain implementation of the radio functionnalities
 * but only boilerplate code to make it available as a crosswalk plugins.
 * For implementation details, see fm_radio_instance.{cc,h}
*/
class FMRadioExtension : public common::Extension {
    public:
        FMRadioExtension();
        virtual ~FMRadioExtension();

    private:
    // common::Extension implementation
    virtual common::Instance* CreateInstance();
};

#endif  // FM_RADIO_EXTENSION_H_
