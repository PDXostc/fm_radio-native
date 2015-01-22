/*
 * Copyright 2014 Collabora Ltd.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301, USA.
 *
 *  Author : Frederic Plourde <frederic.plourde@collabora.co.uk>
 */

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

#include <glib.h>
#include <gst/gst.h>
#include <gio/gio.h>
#include <dbus/dbus-glib.h>
#include <dbus/dbus-glib-bindings.h>
#include "../../extension_common/fm_radio_common.h"

// TODO: add proper console/printf//debug/ in a proper header to include
#define PRINTF_DEBUG printf("DEBUG: %s:%s:%d\n", __FILE__, __func__, __LINE__);

typedef enum {
	E_SIGNAL_ON_ENABLED,
	E_SIGNAL_ON_DISABLED,
	E_SIGNAL_ON_ANTENNA_CHANGED,
	E_SIGNAL_ON_FREQUENCY_CHANGED,

	E_SIGNAL_COUNT				// E_SIGNAL_COUNT is not an actual signal.
} signal_enum;

typedef enum {
	E_PROP_0,					// first prop_enum (0) has a special meaning

	E_PROP_ENABLED,
	E_PROP_ANTENNA_AVAILABLE,
	E_PROP_FREQUENCY,

	E_PROP_COUNT				// E_PROP_COUNT is not an actual property
} prop_enum;

typedef struct {
	GObject parent;

	/* Actual properties */
	gboolean enabled;
	gboolean antennaavailable;
	gdouble  frequency;
} RadioServer;

typedef struct {
	GObjectClass parent;
	DBusGConnection *connection;

	/* Signals created for this class. */
	guint signals[E_SIGNAL_COUNT];
} RadioServerClass;

GType radio_server_get_type (void);

#define TYPE_RADIO_SERVER           (radio_server_get_type())
#define RADIO_SERVER(obj)           (G_TYPE_CHECK_INSTANCE_CAST ((obj), TYPE_RADIO_SERVER, RadioServer))
#define RADIO_SERVER_CLASS(cls)     (G_TYPE_CHECK_CLASS_CAST    ((cls), TYPE_RADIO_SERVER, RadioServerClass))
#define IS_RADIO_SERVER(obj)        (G_TYPE_CHECK_INSTANCE_TYPE ((obj), TYPE_RADIO_SERVER))
#define IS_RADIO_SERVER_CLASS(cls)  (G_TYPE_CHECK_CLASS_TYPE    ((cls), TYPE_RADIO_SERVER))
#define RADIO_SERVER_GET_CLASS(obj) (G_TYPE_INSTANCE_GET_CLASS  ((obj), TYPE_RADIO_SERVER, RadioServerClass))
#define radio_server_new(...)       (g_object_new(TYPE_RADIO_SERVER, ## __VA_ARGS__, NULL))

G_DEFINE_TYPE(RadioServer, radio_server, G_TYPE_OBJECT)

/* Stub functions must be declared before the bindings are included */
/* Our dbus interface is defined in this automatically generated header */
/* TODO: define useful WebFM API here !! */
gboolean server_enable (RadioServer *server, GError **error);
gboolean server_setfrequency (RadioServer *server, gdouble value_in, GError **error);
#include "server-bindings.h"

static GParamSpec *obj_properties[E_PROP_COUNT] = {NULL,};

static void radio_set_property (GObject *object, guint property_id, const GValue *value, GParamSpec *pspec);
static void radio_get_property (GObject *object, guint property_id, GValue *value, GParamSpec *pspec);

static void
manage_error(const char* error, gboolean must_exit) {
	g_printerr(": ERROR: %s\n", error);

	if (must_exit) {
		exit(EXIT_FAILURE);
	}
}

static void
radio_server_create_signals(RadioServerClass *klass)
{
	PRINTF_DEBUG
	const gchar* signal_names[E_SIGNAL_COUNT] = {
		SIGNAL_ON_ENABLED,
		SIGNAL_ON_DISABLED,
		SIGNAL_ON_ANTENNA_CHANGED,
		SIGNAL_ON_FREQUENCY_CHANGED
	};

	guint signal_id;

	// TODO: Maybe have other enums/arrays with the closure
	//		 marshalling functions ... so we can build all
	//		 the signals in a nice loop and put this code back
	//		 into radio_server_class_init()
	PRINTF_DEBUG
    signal_id = g_signal_new(signal_names[E_SIGNAL_ON_ENABLED],
                   G_OBJECT_CLASS_TYPE(klass),
                   G_SIGNAL_RUN_LAST,
                   0,
                   NULL,
                   NULL,
                   g_cclosure_marshal_VOID__VOID,
                   G_TYPE_NONE,
                   0);
    klass->signals[E_SIGNAL_ON_ENABLED] = signal_id;

	PRINTF_DEBUG
	signal_id = g_signal_new(signal_names[E_SIGNAL_ON_DISABLED],
                   G_OBJECT_CLASS_TYPE(klass),
                   G_SIGNAL_RUN_LAST,
                   0,
                   NULL,
                   NULL,
                   g_cclosure_marshal_VOID__VOID,
                   G_TYPE_NONE,
                   0);
    klass->signals[E_SIGNAL_ON_DISABLED] = signal_id;

	PRINTF_DEBUG
	signal_id = g_signal_new(signal_names[E_SIGNAL_ON_ANTENNA_CHANGED],
                   G_OBJECT_CLASS_TYPE(klass),
                   G_SIGNAL_RUN_LAST,
                   0,
                   NULL,
                   NULL,
                   g_cclosure_marshal_VOID__VOID,
                   G_TYPE_NONE,
                   0);
    klass->signals[E_SIGNAL_ON_ANTENNA_CHANGED] = signal_id;

	PRINTF_DEBUG
	signal_id = g_signal_new(signal_names[E_SIGNAL_ON_FREQUENCY_CHANGED],
                   G_OBJECT_CLASS_TYPE(klass),
                   G_SIGNAL_RUN_LAST,
                   0,
                   NULL,
                   NULL,
                   g_cclosure_marshal_VOID__VOID,
                   G_TYPE_NONE,
                   1,
				   G_TYPE_DOUBLE);
    klass->signals[E_SIGNAL_ON_FREQUENCY_CHANGED] = signal_id;
}

static void
radio_server_create_properties(GObjectClass *gobject_class)
{
	PRINTF_DEBUG

	obj_properties[E_PROP_ENABLED] =
		g_param_spec_boolean ("enabled",
							  "radio-enabled-state",
							  "Tells if FMRadio enabled yet",
							  FALSE,
							  G_PARAM_CONSTRUCT | G_PARAM_READWRITE);

	obj_properties[E_PROP_ANTENNA_AVAILABLE] =
		g_param_spec_boolean ("antennaavailable",
							  "radio-antenna-available-state",
							  "Tells if FMRadio Antenna available yet",
							  FALSE,
							  G_PARAM_CONSTRUCT | G_PARAM_READWRITE);

	obj_properties[E_PROP_FREQUENCY] =
		g_param_spec_double ("frequency",
							"frequency",
							"Tells the current FMRadio frequency",
							88.1,
							108.0,
							88.1,
							G_PARAM_CONSTRUCT | G_PARAM_READWRITE);

	g_object_class_install_properties(gobject_class,
									  E_PROP_COUNT,
									  obj_properties);
	PRINTF_DEBUG
}

static void
radio_server_class_init(RadioServerClass *klass)
{
	PRINTF_DEBUG
	GError *error = NULL;

	GObjectClass *gobject_class = G_OBJECT_CLASS (klass);

	gobject_class->set_property = radio_set_property;
	gobject_class->get_property = radio_get_property;

	radio_server_create_properties(gobject_class);

	// TODO: Maybe have other enums/arrays with the closure
	//		 marshalling functions ... so we can build all
	//		 the signals in a nice loop and put this code back
	//		 into radio_server_class_init()
	radio_server_create_signals(klass);

	/* Init the DBus connection, per-klass */
	klass->connection = dbus_g_bus_get (DBUS_BUS_SESSION, &error);
	if (klass->connection == NULL)
	{
		g_warning("Unable to connect to dbus: %s", error->message);
		g_error_free (error);
		return;
	}

	dbus_g_object_type_install_info (TYPE_RADIO_SERVER,
									 &dbus_glib_server_object_object_info);
}

static void
radio_server_init(RadioServer *server)
{
	PRINTF_DEBUG
	GError *error = NULL;
	DBusGProxy *driver_proxy;
	RadioServerClass *klass = RADIO_SERVER_GET_CLASS (server);
	guint request_ret;

	/* Register the service name */
	driver_proxy = dbus_g_proxy_new_for_name (klass->connection,
											  DBUS_SERVICE_DBUS,
											  DBUS_PATH_DBUS,
											  DBUS_INTERFACE_DBUS);

	if(!org_freedesktop_DBus_request_name (driver_proxy,
										   FM_RADIO_SERVICE_DBUS_NAME,
										   0, &request_ret,
										   &error)) {
		g_warning("Unable to register service: %s", error->message);
		g_error_free (error);
	}

	g_object_unref (driver_proxy);

	/* Register DBUS path */
	dbus_g_connection_register_g_object (klass->connection,
										 FM_RADIO_SERVICE_DBUS_PATH,
										 G_OBJECT (server));
}

// TODO: remove this forward decl. when testing finished
gboolean handle_on_enabled(gpointer data);
gboolean handle_on_disabled(gpointer data);
gboolean handle_on_antenna_changed(gpointer data);
gboolean handle_on_frequency_changed(gpointer data);

// **********************************************************
// WebFM api SERVER implementation **************************
// The following are server implementations of all the sup-
// ported WebFM apis declared in radio-service.xml

gboolean
server_enable (RadioServer *server, GError **error)
{
	PRINTF_DEBUG
	// TODO: implement GST radio element ASYNC enablement
	g_timeout_add(2000, handle_on_enabled, server);
	g_timeout_add(4000, handle_on_disabled, server);
	g_timeout_add(6000, handle_on_antenna_changed, server);
	return TRUE;
}

gboolean
server_setfrequency (RadioServer *server, gdouble value_in, GError **error)
{
	PRINTF_DEBUG
	printf("DEBUG : Server_setfrequency value_in : %f\n", value_in);
	GValue val = G_VALUE_INIT;
	g_value_init (&val, G_TYPE_DOUBLE);
	g_value_set_double (&val, value_in);
	// implement GST radio element async setFrequency
	g_object_set_property (G_OBJECT (server), "frequency", &val);
	g_value_unset (&val);

	return TRUE;
}

// **********************************************************

// Handler called when radio has been enabled
gboolean
handle_on_enabled(gpointer data)
{
	//GError *error = NULL;
	RadioServer *server;

	PRINTF_DEBUG

	server = (RadioServer *) data;
	RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

	g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_ENABLED],
                  0);

	PRINTF_DEBUG
	// TODO: when testing with g_timeout_add finished... remove
	// this return FALSE and put something better.
	// let's kill the g_timeout
	return FALSE;
}

// Handler called when radio has been disabled
gboolean
handle_on_disabled(gpointer data)
{
	RadioServer *server;
PRINTF_DEBUG
	server = (RadioServer *) data;
	RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

	g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_DISABLED],
                  0);
PRINTF_DEBUG
	return FALSE;
}

// Handler called when radio antenna has been changed
gboolean
handle_on_antenna_changed(gpointer data)
{
	RadioServer *server;
PRINTF_DEBUG
	server = (RadioServer *) data;
	RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

	g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_ANTENNA_CHANGED],
                  0);
PRINTF_DEBUG
	return FALSE;
}

// Handler called when radio frequency has been changed
gboolean
handle_on_frequency_changed(gpointer data)
{
	RadioServer *server;
PRINTF_DEBUG
	server = (RadioServer *) data;
	RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

	g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_FREQUENCY_CHANGED],
                  0,
				  server->frequency);
	printf("      new freq : %f\n", server->frequency);
	return FALSE;
}

static void
radio_get_property (GObject    *object,
                    guint       property_id,
                    GValue     *value,
                    GParamSpec *pspec)
{
	RadioServer *server = (RadioServer *) object;

	PRINTF_DEBUG
	switch (property_id) {
		case E_PROP_ENABLED:
			g_value_set_boolean (value, server->enabled);
		break;

		case E_PROP_ANTENNA_AVAILABLE:
			g_value_set_boolean (value, server->antennaavailable);
		break;

		case E_PROP_FREQUENCY:
			g_value_set_double(value, server->frequency);
		break;

		default:
			G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
		break;
	}
}

static void
radio_set_property (GObject       *object,
                    guint          property_id,
                    const GValue  *value,
                    GParamSpec    *pspec)
{
	RadioServer *server = (RadioServer *) object;

	PRINTF_DEBUG
	printf("typename : %s\n", G_PARAM_SPEC_TYPE_NAME(pspec));
	switch (property_id) {
		case E_PROP_ENABLED:
			server->enabled = g_value_get_boolean(value);
		break;

		case E_PROP_ANTENNA_AVAILABLE:
			server->antennaavailable = g_value_get_boolean(value);
		break;

		case E_PROP_FREQUENCY:
			server->frequency = g_value_get_double(value);
			handle_on_frequency_changed(server);
		break;

		default:
			G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
		break;
	}
}

int
main(int argc, char** argv)
{
	printf("\n");PRINTF_DEBUG
	GMainLoop* mainloop = NULL;
	RadioServer* radio_obj = NULL;

	mainloop = g_main_loop_new(NULL, FALSE);

	if (mainloop == NULL)
		manage_error("Couldn't create GMainLoop", TRUE);

	radio_obj = g_object_new(TYPE_RADIO_SERVER, NULL);
	if (radio_obj == NULL)
		manage_error("Failed to create one Value instance.", TRUE);

	PRINTF_DEBUG

	/* Start service requests on the D-Bus */
	g_main_loop_run(mainloop);

	/* CodeFlow should never reach that point in normal working conditions */
	return EXIT_FAILURE;
}

