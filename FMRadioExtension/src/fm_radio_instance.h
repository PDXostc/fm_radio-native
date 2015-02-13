// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef FM_RADIO_INSTANCE_H_
#define FM_RADIO_INSTANCE_H_

#include <string>
#include <thread> // NOLINT

#include <gio/gio.h>
#include <dbus/dbus-glib.h>
#include "client-bindings.h"

#include "../../extension_common/extension.h"
#include "../../extension_common/picojson.h"

class FMRadioInstance;

typedef struct {
    //DBusGProxyCall  *call;
    FMRadioInstance *obj;
    picojson::value *msg;
} DBusReplyListener;

class FMRadioInstance : public common::Instance {
    public:
        FMRadioInstance();
        ~FMRadioInstance();

        void PostAsyncReply(const picojson::value& msg,
                            picojson::value::object& value);
        void PostAsyncErrorReply(const picojson::value& msg,
                                 const std::string& error_msg);
        void PostAsyncSuccessReply(const picojson::value& msg,
                                   const picojson::value& value);
        void PostAsyncSuccessReply(const picojson::value& msg);

    private:
        // common::Instance implementation.
        virtual void HandleMessage(const char* msg);
        virtual void HandleSyncMessage(const char* msg);

        // Synchronous messages
        void HandleGetEnabled(const picojson::value& msg);
        void HandleGetFrequency(const picojson::value& msg);

        // Asynchronous messages
        void HandleEnable(const picojson::value& msg);
        void HandleSetFrequency(const picojson::value& msg);
        void HandleAddListener(guint& listener_id,
                               const std::string& signal_name,
                               const picojson::value& msg);
        void HandleRemoveListener(guint& listener_id,
                                  const std::string& signal_name,
                                  const picojson::value& msg);

        // Asynchronous dbus reply callback catch-all method
        static void DBusReplyCallback(DBusGProxy *proxy,
                                      GError *error,
                                      gpointer userdata);
        DBusReplyListener* CreateDBusReplyListener(const picojson::value& msg);

        // Synchronous message helpers
        void SendSyncErrorReply(const std::string& error_msg);
        void SendSyncSuccessReply();
        void SendSyncSuccessReply(const picojson::value& value);

        // Asynchronous message helpers
        void SendSignal(const picojson::value& signal_name,
                        const picojson::value& signal_value);

        static GVariant* CallDBusGet(const gchar* method_name,
                                     GError **error);

        static void HandleSignal(GDBusConnection* connection,
                                 const gchar* sender_name,
                                 const gchar* object_path,
                                 const gchar* interface_name,
                                 const gchar* signal_name,
                                 GVariant* parameters,
                                 gpointer user_data);

        static void RunMainloop(void* data);

        static guint on_enabled_listener_id_;
        static guint on_disabled_listener_id_;
        static guint on_frequency_changed_listener_id_;

        GMainLoop* main_loop_;
        std::thread thread_;

        // Those are used to access FMRadioService .xml introspect bindings
        DBusGConnection *bus;
        DBusGProxy *busProxy;

        // TODO: remove
        // static std::list<dbusReplyListener*> listeners;
};

#endif  // FM_RADIO_INSTANCE_H_
