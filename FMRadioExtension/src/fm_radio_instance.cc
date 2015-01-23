// Copyright (c) 2014 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "fm_radio_instance.h"
#include "../../extension_common/fm_radio_common.h"

#include <gio/gio.h>
#include <string>

guint FMRadioInstance::on_enabled_listener_id_ = 0;
guint FMRadioInstance::on_disabled_listener_id_ = 0;
guint FMRadioInstance::on_antenna_changed_listener_id_ = 0;
guint FMRadioInstance::on_frequency_changed_listener_id_ = 0;

FMRadioInstance::FMRadioInstance()
    : main_loop_(g_main_loop_new(0, FALSE)),
      thread_(FMRadioInstance::RunMainloop, this) {
  thread_.detach();
  GError* error = NULL;
  bus = dbus_g_bus_get(DBUS_BUS_SESSION, &error);
  if (error == NULL) {
    busProxy = dbus_g_proxy_new_for_name(bus,
										 FM_RADIO_SERVICE_DBUS_NAME,
										 FM_RADIO_SERVICE_DBUS_PATH,
										 FM_RADIO_SERVICE_DBUS_IFACE);
  } else
    std::cerr << "Couldn't connect to the Session bus\n";
}

FMRadioInstance::~FMRadioInstance() {
  //TODO: free 'proxy' if necessary
  g_main_loop_quit(main_loop_);
}

void FMRadioInstance::RunMainloop(void* data) {
  FMRadioInstance* self = reinterpret_cast<FMRadioInstance*>(data);
  GMainContext* ctx = g_main_context_default();
  g_main_context_push_thread_default(ctx);
  g_main_loop_run(self->main_loop_);
  g_main_loop_unref(self->main_loop_);
}

void FMRadioInstance::HandleMessage(const char* msg) {
  picojson::value v;

  std::string err;
  picojson::parse(v, msg, msg + strlen(msg), &err);
  if (!err.empty()) {
    return;
  }

  const std::string cmd = v.get("cmd").to_str();
  if (cmd == "Enable") {
    HandleEnable(v);
  } else if (cmd == "SetFrequency") {
    HandleSetFrequency(v);
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
  } else if (cmd == "AddOnAntennaChangedListener") {
    HandleAddListener(on_antenna_changed_listener_id_,
        std::string("onantennachanged"), v);
  } else if (cmd == "RemoveOnAntennaChangedListener") {
    HandleRemoveListener(on_antenna_changed_listener_id_,
        std::string("onantennachanged"), v);
  } else if (cmd == "AddOnFrequencyChangedListener") {
    HandleAddListener(on_frequency_changed_listener_id_,
        std::string("onfrequencychanged"), v);
  } else if (cmd == "RemoveOnFrequencyChangedListener") {
    HandleRemoveListener(on_frequency_changed_listener_id_,
        std::string("onfrequencychanged"), v);
  } else {
    std::cerr << "HandleMessage : Unknown command: " << cmd << "\n";
  }
}

void FMRadioInstance::HandleSyncMessage(const char* msg) {
  picojson::value v;
  std::string err;

  picojson::parse(v, msg, msg + strlen(msg), &err);
  if (!err.empty()) {
    return;
  }

  const std::string cmd = v.get("cmd").to_str();
  if (cmd == "GetEnabled") {
    HandleGetEnabled(v);
  } else if (cmd == "GetAntennaAvailable") {
    HandleGetAntennaAvailable(v);
  } else if (cmd == "GetFrequency") {
    HandleGetFrequency(v);
  } else {
    std::cerr << "HandleSyncMessage : Unknown command: " << cmd << "\n";
  }
}

void FMRadioInstance::SendSyncErrorReply(const std::string&
										 error_msg = "") {
  picojson::value::object o;
  o["isError"] = picojson::value(true);
  if (!error_msg.empty())
    o["errorMessage"] = picojson::value(error_msg.c_str());
  picojson::value v(o);
  SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::SendSyncSuccessReply() {
  picojson::value::object o;
  o["isError"] = picojson::value(false);
  picojson::value v(o);
  SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::SendSyncSuccessReply(const picojson::value& value) {
  picojson::value::object o;
  o["isError"] = picojson::value(false);
  o["value"] = value;
  picojson::value v(o);
  SendSyncReply(v.serialize().c_str());
}

void FMRadioInstance::PostAsyncReply(const picojson::value& msg,
    picojson::value::object& reply) {
  reply["replyId"] = picojson::value(msg.get("replyId").get<double>());
  picojson::value v(reply);
  PostMessage(v.serialize().c_str());
}

void FMRadioInstance::PostAsyncErrorReply(const picojson::value& msg,
    const std::string& error_msg = "") {
  picojson::value::object reply;
  reply["isError"] = picojson::value(true);
  if (!error_msg.empty())
    reply["errorMessage"] = picojson::value(error_msg.c_str());
  PostAsyncReply(msg, reply);
}

void FMRadioInstance::PostAsyncSuccessReply(const picojson::value& msg,
    const picojson::value& value) {
  picojson::value::object reply;
  reply["isError"] = picojson::value(false);
  reply["value"] = value;
  PostAsyncReply(msg, reply);
}

void FMRadioInstance::PostAsyncSuccessReply(const picojson::value& msg) {
  picojson::value::object reply;
  reply["isError"] = picojson::value(false);
  PostAsyncReply(msg, reply);
}

void FMRadioInstance::SendSignal(const picojson::value& signal_name,
    const picojson::value& signal_value) {
  picojson::value::object o;
  o["cmd"] = picojson::value("signal");
  o["signal_name"] = signal_name;
  o["signal_params"] = signal_value;
  picojson::value msg(o);
  PostMessage(msg.serialize().c_str());
}

GVariant* FMRadioInstance::CallDBusGet(const gchar* method_name,
    GError** error) {
  if (!method_name)
    return NULL;

  return g_dbus_connection_call_sync(
      g_bus_get_sync(G_BUS_TYPE_SESSION, NULL, NULL),
      FM_RADIO_SERVICE_DBUS_NAME,
      FM_RADIO_SERVICE_DBUS_PATH,
      FM_RADIO_SERVICE_DBUS_IFACE,
      method_name,
      NULL,
      NULL,
      G_DBUS_CALL_FLAGS_NONE,
      -1,
      NULL,
      error);
}

void FMRadioInstance::HandleSignal(GDBusConnection* connection,
    const gchar* sender_name,
    const gchar* object_path,
    const gchar* interface_name,
    const gchar* signal_name,
    GVariant* parameters,
    gpointer user_data) {
  FMRadioInstance* instance = static_cast<FMRadioInstance*>(user_data);
  if (!instance) {
    std::cerr << "Failed to cast to instance..." << "\n";
    return;
  }

  std::cout << "DEBUG : HandleSignal : " << signal_name << "\n";

  if (!strcmp(signal_name, "onenabled")) {
    // there is no 'value' (param) here.
    instance->SendSignal(picojson::value(signal_name), picojson::value());
  } else if (!strcmp(signal_name, "ondisabled")) {

    // there is no 'value' (param) here.
    instance->SendSignal(picojson::value(signal_name), picojson::value());
  } else if (!strcmp(signal_name, "onantennachanged")) {
    // TODO: manage proper parameters and value
    /*
    const gchar* result;
    g_variant_get(parameters, "(s)", &result);
    if (!result)
      return;
    picojson::value value;
    std::string err;
    picojson::parse(value, result, result + strlen(result), &err);
    if (!err.empty()) {
      std::cerr << "cannot parse result.\n";
      return;
    }
	*/
    instance->SendSignal(picojson::value(signal_name), picojson::value());
    } else if (!strcmp(signal_name, "onfrequencychanged")) {

		double freq;
	    g_variant_get(parameters, "(d)", &freq);

	    picojson::value value(freq);

      // there is no 'value' (param) here.
      instance->SendSignal(picojson::value(signal_name), value);
	} /*else if (!strcmp(signal_name, "CallChanged")) {
    const gchar* key = NULL;
    const gchar* state = NULL;
    const gchar* line_id = NULL;
    const gchar* contact = NULL;
    picojson::value contact_obj;
    std::string contact_err = "No contact info";
    GVariantIter* iter;
    GVariant* value;

    g_variant_get(parameters, "(a{sv})", &iter);
    while (g_variant_iter_next(iter, "{sv}", &key, &value)) {
      if (!strcmp(key, "state")) {
        state = g_variant_get_string(value, NULL);
      } else if (!strcmp(key, "line_id")) {
        line_id = g_variant_get_string(value, NULL);
      } else if (!strcmp(key, "contact")) {
        contact = g_variant_get_string(value, NULL);
        contact_err = picojson::parse(contact_obj, contact,
                                      contact + strlen(contact));
      }
    }
    picojson::value::object o;
    o["state"] = state ? picojson::value(state) : picojson::value("");
    o["line_id"] = line_id ? picojson::value(line_id) : picojson::value("");
    o["contact"] = contact_err.empty() ? picojson::value(contact_obj)
                                       : picojson::value("");
    picojson::value v(o);
    instance->SendSignal(picojson::value(signal_name), v);
	*/
}

void FMRadioInstance::ReplyCallback(DBusGProxy *proxy,
									GError *error,
									gpointer userdata)
{
	if (error) {
		std::cerr << "Error occured '" << error->message << "'\n";
		g_error_free(error);
	}
}

void FMRadioInstance::HandleEnable(const picojson::value& msg) {
  GError* error = NULL;
	//TODO:: Transform CallDBus to specify the bus name/path/iface
	//       so it can be used to GetEnabled, etc... and return the value.
  //CallDBus("Hangup", NULL, &error);
  std::cerr << "DEBUG : HandleEnable...";
  if (!com_jlr_fmradioservice_enable(busProxy, &error)) {
	std::string error_str;
    if (error)
	  error_str = "FMRadioService:enable() error occured '" + std::string(error->message) + "'\n";
    else
      error_str = "FMRadioService:enable() unknown error occured\n";

    std::cout << "...failure!\n";
    PostAsyncErrorReply(msg, error_str);
    return;
  }

  std::cout << "success!\n";
  PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleSetFrequency(const picojson::value& msg) {
  GError* error = NULL;
  std::cerr << "DEBUG : HandleSetFrequency...\n";
  if (!msg.contains("frequency")) {
    PostAsyncErrorReply(msg);
    return;
  }
	//TODO:: Transform CallDBus to specify the bus name/path/iface
	//       so it can be used to GetEnabled, etc... and return the value.
  //CallDBus("Hangup", NULL, &error);
  // numbers are only repensented as 'double' in picojson, hense the conversion.
  if (!com_jlr_fmradioservice_setfrequency(busProxy, msg.get("frequency").get<double>(), &error)) {
	std::string error_str;
    if (error)
	  error_str = "FMRadioService:setFrequency() error occured '" + std::string(error->message) + "'\n";
    else
      error_str = "FMRadioService:setFrequency() unknown error occured\n";

    std::cout << "...failure!\n";
    PostAsyncErrorReply(msg, error_str);
    return;
  }

  std::cout << "success!\n";
  PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleAddListener(guint& listener_id,
    const std::string& signal_name,
    const picojson::value& msg) {
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

  std::cout << "DEBUG : HandleAddListener : " << signal_name << "\n";

  if (listener_id <= 0) {
    std::cerr << "Failed to subscribe for '" << signal_name << "': "
              << listener_id << "\n";
    PostAsyncErrorReply(msg);
    return;
  }

  PostAsyncSuccessReply(msg);
}

void FMRadioInstance::HandleRemoveListener(guint& listener_id,
    const std::string& signal_name,
    const picojson::value& msg) {
  if (listener_id == 0) {
    std::cerr << "Failed to unsubscribe for '" << signal_name << "'\n";
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

	std::cout << "DEBUG1: HandleGetEnabled\n";

	// TODO: Make use of DbusGetCall above !!
	DBusGProxy *temp = dbus_g_proxy_new_for_name(bus,
										 FM_RADIO_SERVICE_DBUS_NAME,
										 FM_RADIO_SERVICE_DBUS_PATH,
										 "org.freedesktop.DBus.Properties");

	if (temp == NULL) {
		std::cerr <<  "Could not create the proxy object";
	}

	if (!dbus_g_proxy_call(temp, "Get", &error,
					   G_TYPE_STRING, FM_RADIO_SERVICE_DBUS_IFACE,
					   G_TYPE_STRING, "enabled",
					   G_TYPE_INVALID,
					   G_TYPE_VALUE, &value,
					   G_TYPE_INVALID)) {
		printf("DEBUG : PROBLEM !\n");
		g_error_free(error);
	}

	// TODO: Loosen/Remove that check here when it's working since some time now 
	printf("value type %s : %s\n", G_VALUE_TYPE_NAME (&value), g_value_get_boolean(&value)?"TRUE":"FALSE");
	if (strcmp(G_VALUE_TYPE_NAME(&value), "gboolean")) {
		printf("Could not get enabled dbus property\n");
		SendSyncErrorReply("Could not get enabled dbus property");
		return;
	}

	o["enabled"] = picojson::value(static_cast<bool>(g_value_get_boolean(&value)));
    picojson::value result(o);
    SendSyncSuccessReply(result);
}

void FMRadioInstance::HandleGetAntennaAvailable(const picojson::value& msg)
{
	GValue value = { 0 };
	GError *error = NULL;

	// TODO: Make use of DBUsGetCall above !!
	DBusGProxy *temp = dbus_g_proxy_new_for_name(bus,
										 FM_RADIO_SERVICE_DBUS_NAME,
										 FM_RADIO_SERVICE_DBUS_PATH,
										 "org.freedesktop.DBus.Properties");

	if (temp == NULL) {
		std::cerr <<  "Could not create the proxy object";
	}

	if (!dbus_g_proxy_call(temp, "Get", &error,
					   G_TYPE_STRING, FM_RADIO_SERVICE_DBUS_IFACE,
					   G_TYPE_STRING, "antennaavailable",
					   G_TYPE_INVALID,
					   G_TYPE_VALUE, &value,
					   G_TYPE_INVALID)) {
		printf("DEBUG : PROBLEM !\n");
		g_error_free(error);
	}

	printf("value type %s : ", G_VALUE_TYPE_NAME (&value));
	if (g_value_get_boolean(&value) == TRUE)
		printf("true\n");
	else
		printf("false\n");

	//FIXME: This should be simplified with the use of DBusGetCall
	/*
	if (!strcmp(G_VALUE_TYPE_NAME(&value), "gboolean")) {
		cJSON_AddBoolToObject(json, "result", (int) g_value_get_boolean(&value));
		printf("DEBUG DEBUG : %s\n", cJSON_PrintUnformatted(json));
		sync_messaging_interface->SetSyncReply(instance, cJSON_PrintUnformatted(json));
		// TODO: free the cJSON_Print(json) char * when finished !!
	}*/
}

void FMRadioInstance::HandleGetFrequency(const picojson::value& msg)
{
	GValue value = { 0 };
	GError *error = NULL;
	picojson::value::object o;

	// TODO: Make use of DBUsGetCall above !!
	DBusGProxy *temp = dbus_g_proxy_new_for_name(bus,
										 FM_RADIO_SERVICE_DBUS_NAME,
										 FM_RADIO_SERVICE_DBUS_PATH,
										 "org.freedesktop.DBus.Properties");

	if (temp == NULL) {
		std::cerr <<  "Could not create the proxy object";
	}

	if (!dbus_g_proxy_call(temp, "Get", &error,
					   G_TYPE_STRING, FM_RADIO_SERVICE_DBUS_IFACE,
					   G_TYPE_STRING, "frequency",
					   G_TYPE_INVALID,
					   G_TYPE_VALUE, &value,
					   G_TYPE_INVALID)) {
		printf("DEBUG : PROBLEM !\n");
		g_error_free(error);
	}

	// TODO: Loosen/Remove that check here when it's working since some time now 
	printf("value type %s : %f\n", G_VALUE_TYPE_NAME (&value), g_value_get_double(&value));
	if (strcmp(G_VALUE_TYPE_NAME(&value), "gdouble")) {
		printf("Could not get frequency dbus property\n");
		SendSyncErrorReply("Could not get frequency dbus property");
		return;
	}

	o["frequency"] = picojson::value(static_cast<double>(g_value_get_double(&value)));
    picojson::value result(o);
    SendSyncSuccessReply(result);
}
