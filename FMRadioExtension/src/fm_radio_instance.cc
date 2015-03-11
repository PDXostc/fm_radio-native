// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "fm_radio_instance.h"
#include "../../extension_common/fm_radio_common.h"

#include <gio/gio.h>
#include <string>

guint FMRadioInstance::on_enabled_listener_id_ = 0;
guint FMRadioInstance::on_disabled_listener_id_ = 0;
guint FMRadioInstance::on_frequency_changed_listener_id_ = 0;
guint FMRadioInstance::on_station_found_listener_id_ = 0;
guint FMRadioInstance::on_rds_clear_listener_id_ = 0;
guint FMRadioInstance::on_rds_change_listener_id_ = 0;
guint FMRadioInstance::on_rds_complete_listener_id_ = 0;

FMRadioInstance::FMRadioInstance()
    : main_loop_(g_main_loop_new(0, FALSE)),
        thread_(FMRadioInstance::RunMainloop, this)
{
    thread_.detach();
    GError* error = NULL;
    bus = dbus_g_bus_get(DBUS_BUS_SESSION, &error);
    if (error == NULL) {
        busProxy = dbus_g_proxy_new_for_name(bus,
                                             FM_RADIO_SERVICE_DBUS_NAME,
                                             FM_RADIO_SERVICE_DBUS_PATH,
                                             FM_RADIO_SERVICE_DBUS_IFACE);
    } else
        g_warning("Couldn't connect to the Session bus");
}

FMRadioInstance::~FMRadioInstance()
{
    //TODO: free 'proxy' if necessary
    g_main_loop_quit(main_loop_);
}

void FMRadioInstance::RunMainloop(void* data)
{
    FMRadioInstance* self = reinterpret_cast<FMRadioInstance*>(data);
    GMainContext* ctx = g_main_context_default();
    g_main_context_push_thread_default(ctx);
    g_main_loop_run(self->main_loop_);
    g_main_loop_unref(self->main_loop_);
}

void FMRadioInstance::HandleMessage(const char* msg)
{
    picojson::value v;

    std::string err;
    picojson::parse(v, msg, msg + strlen(msg), &err);
    if (!err.empty()) {
        return;
    }

    const std::string cmd = v.get("cmd").to_str();
    if (cmd == "Enable") {
        HandleEnable(v);
    } else if (cmd == "Disable") {
        HandleDisable(v);
    } else if (cmd == "SetFrequency") {
        HandleSetFrequency(v);
    } else if (cmd == "Seek") {
        HandleSeek(v);
    } else if (cmd == "CancelSeek") {
        HandleCancelSeek(v);
    } else if (cmd == "AddOnEnabledListener") {
        HandleAddListener(on_enabled_listener_id_,
        std::string("onenabled"), v);
    } else if (cmd == "RemoveOnEnabledListener") {
        HandleRemoveListener(on_enabled_listener_id_,
        std::string("onenabled"), v);
    } else if (cmd == "AddOnDisabledListener") {
        HandleAddListener(on_disabled_listener_id_,
        std::string("ondisabled"), v);
    } else if (cmd == "RemoveOnDisabledListener") {
        HandleRemoveListener(on_disabled_listener_id_,
        std::string("ondisabled"), v);
    } else if (cmd == "AddOnFrequencyChangedListener") {
        HandleAddListener(on_frequency_changed_listener_id_,
        std::string("onfrequencychanged"), v);
    } else if (cmd == "RemoveOnFrequencyChangedListener") {
        HandleRemoveListener(on_frequency_changed_listener_id_,
        std::string("onfrequencychanged"), v);
    } else if (cmd == "AddOnStationFoundListener") {
        HandleAddListener(on_station_found_listener_id_,
        std::string("onstationfound"), v);
    } else if (cmd == "RemoveOnStationFoundListener") {
        HandleRemoveListener(on_station_found_listener_id_,
        std::string("onstationfound"), v);
    } else if (cmd == "AddOnRdsClearListener") {
        HandleAddListener(on_rds_clear_listener_id_,
        std::string("onrdsclear"), v);
    } else if (cmd == "RemoveOnRdsClearListener") {
        HandleRemoveListener(on_rds_clear_listener_id_,
        std::string("onrdsclear"), v);
    } else if (cmd == "AddOnRdsChangeListener") {
        HandleAddListener(on_rds_change_listener_id_,
        std::string("onrdschange"), v);
    } else if (cmd == "RemoveOnRdsChangeListener") {
        HandleRemoveListener(on_rds_change_listener_id_,
        std::string("onrdschange"), v);
    } else if (cmd == "AddOnRdsCompleteListener") {
        HandleAddListener(on_rds_complete_listener_id_,
        std::string("onrdscomplete"), v);
    } else if (cmd == "RemoveOnRdsCompleteListener") {
        HandleRemoveListener(on_rds_complete_listener_id_,
        std::string("onrdscomplete"), v);
    } else {
        g_warning("HandleMessage : Unknown command: %s", cmd.c_str());
    }
}

void FMRadioInstance::HandleSyncMessage(const char* msg)
{
    picojson::value v;
    std::string err;

    picojson::parse(v, msg, msg + strlen(msg), &err);
    if (!err.empty()) {
        return;
    }

    const std::string cmd = v.get("cmd").to_str();
    if (cmd == "GetEnabled") {
        HandleGetEnabled(v);
    } else if (cmd == "GetFrequency") {
        HandleGetFrequency(v);
    } else {
        g_warning("HandleSyncMessage : Unknown command: %s", cmd.c_str());
    }
}

void FMRadioInstance::SendSyncErrorReply(const std::string&
                                         error_msg = "")
{
    picojson::value::object o;
    o["isError"] = picojson::value(true);
    if (!error_msg.empty())
        o["errorMessage"] = picojson::value(error_msg.c_str());
    picojson::value v(o);
    SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::SendSyncSuccessReply()
{
    picojson::value::object o;
    o["isError"] = picojson::value(false);
    picojson::value v(o);
    SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::SendSyncSuccessReply(const picojson::value& value)
{
    picojson::value::object o;
    o["isError"] = picojson::value(false);
    o["value"] = value;
    picojson::value v(o);
    SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::PostAsyncReply(const picojson::value& msg,
                                     picojson::value::object& reply)
{
    reply["replyId"] = picojson::value(msg.get("replyId").get<double>());
    picojson::value v(reply);
    PostMessage(v.serialize().c_str());
}

void FMRadioInstance::PostAsyncErrorReply(const picojson::value& msg,
                                          const std::string& error_msg = "")
{
    picojson::value::object reply;
    reply["isError"] = picojson::value(true);
    if (!error_msg.empty())
        reply["errorMessage"] = picojson::value(error_msg.c_str());
    PostAsyncReply(msg, reply);
}

void FMRadioInstance::PostAsyncSuccessReply(const picojson::value& msg,
                                            const picojson::value& value)
{
    picojson::value::object reply;
    reply["isError"] = picojson::value(false);
    reply["value"] = value;
    PostAsyncReply(msg, reply);
}

void FMRadioInstance::PostAsyncSuccessReply(const picojson::value& msg)
{
    picojson::value::object reply;
    reply["isError"] = picojson::value(false);
    PostAsyncReply(msg, reply);
}

void FMRadioInstance::SendSignal(const picojson::value& signal_name,
                                 const picojson::value& signal_value)
{
    picojson::value::object o;
    o["cmd"] = picojson::value("signal");
    o["signal_name"] = signal_name;
    o["signal_params"] = signal_value;
    picojson::value msg(o);
    PostMessage(msg.serialize().c_str());
}

void FMRadioInstance::HandleSignal(GDBusConnection* connection,
                                   const gchar* sender_name,
                                   const gchar* object_path,
                                   const gchar* interface_name,
                                   const gchar* signal_name,
                                   GVariant* parameters,
                                   gpointer user_data)
{
    FMRadioInstance* instance = static_cast<FMRadioInstance*>(user_data);
    if (!instance) {
        g_warning("Failed to cast to instance...");
        return;
    }

    if (!strcmp(signal_name, "onenabled")) {
        instance->SendSignal(picojson::value(signal_name), picojson::value());
    } else if (!strcmp(signal_name, "ondisabled")) {
        instance->SendSignal(picojson::value(signal_name), picojson::value());
    } else if (!strcmp(signal_name, "onfrequencychanged")) {
        double freq;
        g_variant_get(parameters, "(d)", &freq);
        picojson::value value(freq);

        instance->SendSignal(picojson::value(signal_name), value);
    } else if (!strcmp(signal_name, "onstationfound")) {
        double freq;
        g_variant_get(parameters, "(d)", &freq);
        picojson::value value(freq);

        instance->SendSignal(picojson::value(signal_name), value);
    } else if (!strcmp(signal_name, "onrdsclear")) {
        guint type;
        gchar *data;

        g_variant_get(parameters, "(u)", &type);
        g_variant_get(parameters, "(s)", &data);
        picojson::value::object o;

        // we want a guint here, but numbers are only conveyed as
        // 'double' in picojson'
        o["type"] = picojson::value((gdouble)type);
        picojson::value value(o);

        instance->SendSignal(picojson::value(signal_name), value);
    } else if (!strcmp(signal_name, "onrdschange")) {
        guint type;
        gchar *data;

        g_variant_get(parameters, "(us)", &type, &data);
        picojson::value::object o;

        o["type"] = picojson::value((gdouble)type);
        o["data"] = picojson::value(data);
        picojson::value value(o);

        instance->SendSignal(picojson::value(signal_name), value);
    } else if (!strcmp(signal_name, "onrdscomplete")) {
        guint type;
        gchar *data;

        g_variant_get(parameters, "(us)", &type, &data);
        picojson::value::object o;

        o["type"] = picojson::value((gdouble)type);
        o["data"] = picojson::value(data);
        picojson::value value(o);

        instance->SendSignal(picojson::value(signal_name), value);
    }
}

void FMRadioInstance::DBusReplyCallback(DBusGProxy *proxy,
                                        GError *error,
                                        gpointer userdata)
{
        std::string error_str;

        // we're static, fetch the corresponding FMRadioInstance obj
        DBusReplyListener* listener = (DBusReplyListener *) userdata;
        FMRadioInstance* instance = listener->obj;
        //DBusGProxyCall *proxyCall = listener->call;
        picojson::value *msg      = listener->msg;

        if (error) {
            error_str = "error: '" +
                        std::string(error->message) + "'\n";

            g_warning("%s", error_str.c_str());
            instance->PostAsyncErrorReply(*msg, error_str);
        } else {
            instance->PostAsyncSuccessReply(*msg);
        }

    delete msg;
    delete listener;
    return;
}

DBusReplyListener* FMRadioInstance::CreateDBusReplyListener(const picojson::value& msg)
{
    DBusReplyListener* listener = new DBusReplyListener();
    // make a copy of the msg and add it to the listener
    picojson::value *newMsg = new picojson::value(msg);
    listener->msg = newMsg;
    listener->obj = this;

    return listener;

    // TODO: remove
    // Add the listener in the list
    // listeners.push_front(listener);
}

void FMRadioInstance::HandleEnable(const picojson::value& msg)
{
    GError* error = NULL;
    //TODO:: Transform CallDBus to specify the bus name/path/iface
    //       so it can be used to GetEnabled, etc... and return the value.
    // CallDBus("Hangup", NULL, &error);
    if (!com_jlr_fmradioservice_enable(busProxy, &error)) {
        std::string error_str;
        if (error)
            error_str = "FMRadioService:enable() error occured '" +
                        std::string(error->message) + "'\n";
        else
            error_str = "FMRadioService:enable() unknown error occured\n";

        g_warning("%s", error_str.c_str());
        PostAsyncErrorReply(msg, error_str);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleDisable(const picojson::value& msg)
{
    GError* error = NULL;
    //TODO:: Transform CallDBus to specify the bus name/path/iface
    //       so it can be used to GetEnabled, etc... and return the value.
    // CallDBus("Hangup", NULL, &error);
    if (!com_jlr_fmradioservice_disable(busProxy, &error)) {
        std::string error_str;
        if (error)
            error_str = "FMRadioService:disable() error occured '" +
                        std::string(error->message) + "'\n";
        else
            error_str = "FMRadioService:disable() unknown error occured\n";

        g_warning("%s", error_str.c_str());
        PostAsyncErrorReply(msg, error_str);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleSetFrequency(const picojson::value& msg)
{
    GError* error = NULL;
    if (!msg.contains("frequency")) {
        PostAsyncErrorReply(msg);
        return;
    }

    //TODO:: Transform CallDBus to specify the bus name/path/iface
    //       so it can be used to GetEnabled, etc... and return the value.
    //       CallDBus("Hangup", NULL, &error);

    // Numbers are only repensented as 'double' in picojson,
    // hence the conversion.
    //DBusReplyListener* data = CreateDBusReplyListener(msg);
    /*com_jlr_fmradioservice_setfrequency_async (busProxy,
                                               msg.get("frequency").get<double>(),
                                               DBusReplyCallback,
                                               data);*/
    if (!com_jlr_fmradioservice_setfrequency(busProxy,
                                             msg.get("frequency").get<double>(),
                                             &error)) {
        std::string error_str;
        if (error)
            error_str = "FMRadioService:setFrequency() error occured '" +
                        std::string(error->message) + "'\n";
        else
            error_str = "FMRadioService:setFrequency() unknown error occured\n";

        g_warning("%s", error_str.c_str());
        PostAsyncErrorReply(msg, error_str);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleSeek(const picojson::value& msg)
{
    GError* error = NULL;
    if (!msg.contains("direction")) {
        PostAsyncErrorReply(msg);
        return;
    }

    if (!com_jlr_fmradioservice_seek(busProxy,
                                     msg.get("direction").get<bool>(),
                                     &error)) {
        std::string error_str;
        if (error)
            error_str = "FMRadioService:seek() error occured '" +
                        std::string(error->message) + "'\n";
        else
            error_str = "FMRadioService:seek() unknown error occured\n";

        g_warning("%s", error_str.c_str());
        PostAsyncErrorReply(msg, error_str);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleCancelSeek(const picojson::value& msg)
{
    GError* error = NULL;
    //TODO:: Transform CallDBus to specify the bus name/path/iface
    //       so it can be used to GetEnabled, etc... and return the value.
    // CallDBus("Hangup", NULL, &error);
    if (!com_jlr_fmradioservice_cancelseek(busProxy, &error)) {
        std::string error_str;
        if (error)
            error_str = "FMRadioService:cancelseek() error occured '" +
                        std::string(error->message) + "'\n";
        else
            error_str = "FMRadioService:cancelseek() unknown error occured\n";

        g_warning("%s", error_str.c_str());
        PostAsyncErrorReply(msg, error_str);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleAddListener(guint& listener_id,
                                        const std::string& signal_name,
                                        const picojson::value& msg)
{
    listener_id = g_dbus_connection_signal_subscribe(
        g_bus_get_sync(G_BUS_TYPE_SESSION, NULL, NULL),
        FM_RADIO_SERVICE_DBUS_NAME,
        FM_RADIO_SERVICE_DBUS_IFACE,
        signal_name.c_str(),
        NULL,
        NULL,
        G_DBUS_SIGNAL_FLAGS_NONE,
        HandleSignal,
        this,
        NULL);

    if (listener_id <= 0) {
        g_warning("Failed to subscribe for : %s, %i",
                  signal_name.c_str(), listener_id);
        PostAsyncErrorReply(msg);
        return;
    }

    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleRemoveListener(guint& listener_id,
                                           const std::string& signal_name,
                                           const picojson::value& msg)
{
    if (listener_id == 0) {
        g_warning("Failed to subscribe for : %s, %i",
                  signal_name.c_str(), listener_id);
        PostAsyncErrorReply(msg);
        return;
    }

    g_dbus_connection_signal_unsubscribe(
        g_bus_get_sync(G_BUS_TYPE_SESSION, NULL, NULL),
        listener_id);

    listener_id = 0;
    PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleGetEnabled(const picojson::value& msg)
{
    GValue value = { 0 };
    GError *error = NULL;
    picojson::value::object o;

    // TODO: Make use of DbusGetCall above !!
    DBusGProxy *prox = dbus_g_proxy_new_for_name(bus,
        FM_RADIO_SERVICE_DBUS_NAME,
        FM_RADIO_SERVICE_DBUS_PATH,
        "org.freedesktop.DBus.Properties");

    if (prox == NULL) {
        g_warning("Could not create the proxy object");
    }

    if (!dbus_g_proxy_call(prox, "Get", &error,
                           G_TYPE_STRING, FM_RADIO_SERVICE_DBUS_IFACE,
                           G_TYPE_STRING, "enabled",
                           G_TYPE_INVALID,
                           G_TYPE_VALUE, &value,
                           G_TYPE_INVALID)) {
        g_warning("Could not fetch 'enabled' dbus property !\n");
        g_error_free(error);
    }

    if (strcmp(G_VALUE_TYPE_NAME(&value), "gboolean")) {
        g_warning("Could not get enabled dbus property\n");
        SendSyncErrorReply("Could not get enabled dbus property");
        return;
    }

    o["enabled"] = picojson::value(static_cast<bool>(g_value_get_boolean(&value)));
    picojson::value result(o);
    SendSyncSuccessReply(result);
}

void FMRadioInstance::HandleGetFrequency(const picojson::value& msg)
{
    GValue value = { 0 };
    GError *error = NULL;
    picojson::value::object o;

    // TODO: Make use of DBUsGetCall above !!
    DBusGProxy *prox = dbus_g_proxy_new_for_name(bus,
        FM_RADIO_SERVICE_DBUS_NAME,
        FM_RADIO_SERVICE_DBUS_PATH,
        "org.freedesktop.DBus.Properties");

    if (prox == NULL) {
        g_warning("Could not create the proxy object");
    }

    if (!dbus_g_proxy_call(prox, "Get", &error,
                           G_TYPE_STRING, FM_RADIO_SERVICE_DBUS_IFACE,
                           G_TYPE_STRING, "frequency",
                           G_TYPE_INVALID,
                           G_TYPE_VALUE, &value,
                           G_TYPE_INVALID)) {
        g_warning("Could not fetch 'frequency' dbus property !\n");
        g_error_free(error);
    }

    if (strcmp(G_VALUE_TYPE_NAME(&value), "gdouble")) {
        g_warning("Could not get frequency dbus property\n");
        SendSyncErrorReply("Could not get frequency dbus property");
        return;
    }

    o["frequency"] =
        picojson::value(static_cast<double>(g_value_get_double(&value)));
    picojson::value result(o);
    SendSyncSuccessReply(result);
}
