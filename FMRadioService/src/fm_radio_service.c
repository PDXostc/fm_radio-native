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

/**
 * Signal enum types.
 * Signal enums are used in g_signal_new as name/id.
 */
typedef enum {
    E_SIGNAL_ON_ENABLED,
    E_SIGNAL_ON_DISABLED,
    E_SIGNAL_ON_FREQUENCY_CHANGED,

    E_SIGNAL_COUNT              /**< E_SIGNAL_COUNT is not an actual signal */
} signal_enum;

/**
 * GObject properties.
 * GObject properties are necessary for dbus to expose modifiable
 * properties/values to the connected clients.
 */
typedef enum {
    E_PROP_0,                   /**< first prop_enum (0) has a special meaning */

    E_PROP_ENABLED,
    E_PROP_FREQUENCY,

    E_PROP_COUNT                /**< E_PROP_COUNT is not an actual property */
} prop_enum;

/**
 * GStreamer element data structure.
 * Useful struct to keep data about fmsrc gstreamer element.
 */
typedef struct _GstData GstData;
struct _GstData
{
    GstElement *pipeline;
    GstElement *fmsrc;
    void *server;
    void (*playing_cb) (GstData*);
    void (*frequency_changed_cb) (GstData*, gint);
    void (*station_found_cb) (GstData*, gint);
};

/** Main GObject RadioServer object. */
typedef struct {
    GObject parent;

    /* Actual properties */
    gboolean enabled;
    gdouble  frequency;         /**< frequency is in Hz */

    GstData *gstData;
} RadioServer;

/** Main GObject RadioServerClass class. */
typedef struct {
    GObjectClass parent;
    DBusGConnection *connection;

    guint signals[E_SIGNAL_COUNT];
} RadioServerClass;

GType radio_server_get_type (void);

#define TYPE_RADIO_SERVER           (radio_server_get_type())
#define RADIO_SERVER(obj)           (G_TYPE_CHECK_INSTANCE_CAST \
                                    ((obj), TYPE_RADIO_SERVER, RadioServer))
#define RADIO_SERVER_CLASS(cls)     (G_TYPE_CHECK_CLASS_CAST \
                                    ((cls), TYPE_RADIO_SERVER, RadioServerClass))
#define IS_RADIO_SERVER(obj)        (G_TYPE_CHECK_INSTANCE_TYPE\
                                    ((obj), TYPE_RADIO_SERVER))
#define IS_RADIO_SERVER_CLASS(cls)  (G_TYPE_CHECK_CLASS_TYPE \
                                    ((cls), TYPE_RADIO_SERVER))
#define RADIO_SERVER_GET_CLASS(obj) (G_TYPE_INSTANCE_GET_CLASS \
                                    ((obj), TYPE_RADIO_SERVER, RadioServerClass))
#define radio_server_new(...)       (g_object_new(TYPE_RADIO_SERVER,\
                                    ## __VA_ARGS__, NULL))

G_DEFINE_TYPE(RadioServer, radio_server, G_TYPE_OBJECT)

/* Stub functions must be declared before the bindings are included */
/* Our dbus interface is defined in this automatically generated header */
gboolean server_enable (RadioServer *server, GError **error);
gboolean server_setfrequency (RadioServer *server, gdouble value_in,
                              GError **error);
#include "server-bindings.h"

static GParamSpec *obj_properties[E_PROP_COUNT] = {NULL,};

static GstData *sdrjfm_init (RadioServer *server,
                             void (*playing_cb) (GstData*),
                             void (*frequency_changed_cb) (GstData*, gint freq),
                             void (*station_found_cb) (GstData*, gint freq));
static void radio_set_property (GObject *object, uint property_id,
                                const GValue *value, GParamSpec *pspec);
static void radio_get_property (GObject *object, guint property_id,
                                GValue *value, GParamSpec *pspec);

/**
* Function that creates all the glib signals.
* @param klass Pointer on the main gobject class.
*/
static void
radio_server_create_signals(RadioServerClass *klass)
{
    const gchar* signal_names[E_SIGNAL_COUNT] = {
        SIGNAL_ON_ENABLED,
        SIGNAL_ON_DISABLED,
        SIGNAL_ON_FREQUENCY_CHANGED
    };

    guint signal_id;

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

/**
* Function that creates all the glib properties.
* @param gobject_class Pointer on the main gobject class.
*/
static void
radio_server_create_properties(GObjectClass *gobject_class)
{

    obj_properties[E_PROP_ENABLED] =
        g_param_spec_boolean ("enabled",
                              "radio-enabled-state",
                              "Tells if FMRadio enabled yet",
                              FALSE,
                              G_PARAM_CONSTRUCT | G_PARAM_READWRITE);

    obj_properties[E_PROP_FREQUENCY] =
        g_param_spec_double ("frequency",
                             "frequency",
                             "Tells the current FMRadio frequency",
                             (gdouble) FM_RADIO_SERVICE_MIN_FREQ,
                             (gdouble) FM_RADIO_SERVICE_MAX_FREQ,
                             (gdouble) FM_RADIO_SERVICE_DEF_FREQ,
                             G_PARAM_CONSTRUCT | G_PARAM_READWRITE);

    g_object_class_install_properties(gobject_class,
                                      E_PROP_COUNT,
                                      obj_properties);
}

/**
* Create properties and signals, and create dbus connection.
* @param klass Pointer on the main gobject class.
*/
static void
radio_server_class_init(RadioServerClass *klass)
{
    GError *error = NULL;

    GObjectClass *gobject_class = G_OBJECT_CLASS (klass);

    gobject_class->set_property = radio_set_property;
    gobject_class->get_property = radio_get_property;

    radio_server_create_properties(gobject_class);

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

/**
* Create dbus proxy and register service.
* @param klass Pointer on the main gobject class.
*/
static void
radio_server_init(RadioServer *server)
{
    g_message("radio_server_init");
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

/**
* Handler called when the radio is just been enabled.
* @param data GstData structure.
*/
void
handle_on_enabled(GstData *data)
{
    g_message("handle_on_enabled");
    //GError *error = NULL;
    RadioServer *server;


    server = (RadioServer *) data->server;
    g_assert (server != NULL);
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_ENABLED],
                  0);
}

/**
* Handle called when the radio is just been disabled.
* @param data GstData structure.
*/
void
handle_on_disabled(GstData* data)
{
    RadioServer *server;
    server = (RadioServer *) data->server;
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_DISABLED],
                  0);
}

/**
* Handler called when the frequency has been changed.
* @param data GstData structure.
* @param freq gint.
*/
void
handle_on_frequency_changed(GstData* data, gint freq)
{
    g_message("handle_on_frequency_changed");
    RadioServer *server;
    server = (RadioServer *) data->server;
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    server->frequency = (gdouble)freq;
    g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_FREQUENCY_CHANGED],
                  0,
                  server->frequency);
}

/**
* Handler called when a station has been found by a GST slement seek.
* @param data GstData structure.
* @param freq gint.
*/
void
handle_on_station_found(GstData* data, gint freq)
{
    g_message("handle_on_station_found");
    // NOT IMPLEMENTED YET
}

// **********************************************************
// WebFM api SERVER implementation **************************
// The following are server implementations of all the sup-
// ported WebFM apis declared in radio-service.xml

/**
* Initialize gstsdrjfm gst element if it's not already done.
* @param server Main server object.
* @param error GError containing code and message for calling dbus client.
* @return TRUE is successful.
*/
gboolean
server_enable (RadioServer *server, GError **error)
{

    g_message("server_enable");
    /* Enabling FM Radio is a two-step async process.
       We first enable our sdrjfm GST element in here,
       then, the GST bus GST_MESSAGE_STATE_CHANGED callback will
       send the "enabled" signal if gst's state is set to GST_STATE_PLAYING */

    if (!server->enabled) {
        sdrjfm_init(server,
                    handle_on_enabled,
                    handle_on_frequency_changed,
                    handle_on_station_found);
        g_message("FMRadioService: server enabled");
    }

    // TODO: Return false and set error in case something went wrong.
    g_message("DEBUG1 : server_enable, cb = %p", server->gstData->frequency_changed_cb);
    return TRUE;
}

/**
* Set the internal frequency of the gstsdrjfm gst element
* @param server Main server object.
* @param value_in The passed-in dbus frequency dbus parameter.
* @param error GError containing code and message for calling dbus client.
* @return TRUE is successful.
*/
gboolean
server_setfrequency (RadioServer *server, gdouble value_in, GError **error)
{
    g_message("server_setfrequency");
    // Set the GST element frequency
    g_object_set (server->gstData->fmsrc, "frequency", (gint) value_in, NULL);
    // FIXME:
    // server->frequency should be set via
    // GST_ELEMENT frequency_changed cb server->frequency = value_in;

    g_message("FMRadioService: frequency set to : %f", value_in);
    // TODO: Return false and set error in case something went wrong.
    return TRUE;
}

// **********************************************************

/**
* Main gobject property getter.
* @param object Pointer to the Gobject to get properties from.
* @param property_id The ID of the property to get.
* @param value Pointer to a GValue containing the value to get.
* @param pspec Pointer to GParamSpec.
*/
static void
radio_get_property (GObject    *object,
                    guint       property_id,
                    GValue     *value,
                    GParamSpec *pspec)
{
    RadioServer *server = (RadioServer *) object;

    switch (property_id) {
        case E_PROP_ENABLED:
            g_value_set_boolean (value, server->enabled);
        break;

        case E_PROP_FREQUENCY:
            g_value_set_double(value, server->frequency);
        break;

        default:
            G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
        break;
    }
}

/**
* Main gobject property setter.
* @param object Pointer to the Gobject to set properties on.
* @param property_id The ID of the property to set.
* @param value Pointer to a GValue containing the value to set.
* @param pspec Pointer to GParamSpec.
*/
static void
radio_set_property (GObject       *object,
                    guint          property_id,
                    const GValue  *value,
                    GParamSpec    *pspec)
{
    RadioServer *server = (RadioServer *) object;

    switch (property_id) {
        case E_PROP_ENABLED:
            server->enabled = g_value_get_boolean(value);
        break;

        case E_PROP_FREQUENCY:
            server->frequency = g_value_get_double(value);
            // TODO: remove
            // handle_on_frequency_changed(server);
        break;

        default:
            G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
        break;
    }
}

/**
* Callback called when receiving message from gstsdrjfm gst element.
* @param bus Pointer on the GstBus that initiated the message.
* @param message Pointer on GstMessage containing the sent message.
* @param user_data Some user data passed along with the message.
* @param TRUE is successful, FALSE otherwise.
*/
static gboolean
bus_cb (GstBus *bus, GstMessage *message, gpointer user_data)
{
    GstData *data = (GstData*)user_data;
    GError *error = NULL;

    g_message("DEBUG : bus_cb, cb = %p", data->frequency_changed_cb);
    switch (message->type) {
        case GST_MESSAGE_STATE_CHANGED:
            g_message("bus_cb - GST_MESSAGE_STATE_CHANGED");
            if (GST_MESSAGE_SRC (message) == GST_OBJECT (data->pipeline)) {
                GstState state;
                gst_message_parse_state_changed (message, NULL, &state, NULL);
                if (state == GST_STATE_PLAYING && data->playing_cb)
                    data->playing_cb (data);
            }
        break;

        case GST_MESSAGE_ELEMENT:
            g_message("DEBUG2 : bus_cb, cb = %p", data->frequency_changed_cb);
            g_message("bus_cb - GST_MESSAGE_ELEMENT");
            if (GST_MESSAGE_SRC (message) == GST_OBJECT (data->fmsrc)) {
                g_message("DEBUG3 : bus_cb, cb = %p", data->frequency_changed_cb);
                const GstStructure *s = gst_message_get_structure (message);

                g_assert (gst_structure_has_field_typed (s, "frequency", G_TYPE_INT));
                g_message("DEBUG4 : bus_cb, cb = %p", data->frequency_changed_cb);

                gint freq;
                gst_structure_get_int (s, "frequency", &freq);
                g_assert_cmpint (freq, >=, FM_RADIO_SERVICE_MIN_FREQ);
                g_assert_cmpint (freq, <=, FM_RADIO_SERVICE_MAX_FREQ);
                g_message("DEBUG5 : bus_cb, cb = %p", data->frequency_changed_cb);


                if (gst_structure_has_name (s, "sdrjfmsrc-frequency-changed")) {
                    g_message("DEBUG6 : bus_cb, cb = %p", data->frequency_changed_cb);
                    g_message("bus_cb - GST_MESSAGE_ELEMENT - sdrjfmsrc-frequency-changed");
                    if (data->frequency_changed_cb) {
                        g_message("bus_cb - GST_MESSAGE_ELEMENT - sdrjfmsrc-frequency-changed - freq = %i", freq);
                        data->frequency_changed_cb (data, freq);
                    } else {
                        g_message("bus_cb - GST_MESSAGE_ELEMENT - sdrjfmsrc-frequency-changed - NO CALLBACK");
                    }
                } else if (gst_structure_has_name (s, "sdrjfmsrc-station-found")) {
                    if (data->station_found_cb)
                        data->station_found_cb (data, freq);
                }
            }
        break;

        case GST_MESSAGE_ERROR:
            gst_message_parse_error (message, &error, NULL);
	    GST_WARNING ("Error from bus: %s", error->message);
        break;

        case GST_MESSAGE_WARNING:
            gst_message_parse_warning (message, &error, NULL);
	    GST_WARNING ("Warning from bus: %s", error->message);
        break;

        default:
        break;
    }

    return TRUE;
}

/**
* Gstreamer element initialization and pipeline creation.
* @param server Pointer to main GObject RadioServer object.
* @param playing_cb A callback function pointer for the "playing" state
* @param Pointer to GstData struct filled-in with all required fields.
*/
static GstData *
sdrjfm_init (RadioServer *server, void (*playing_cb) (GstData*),
                                  void (*frequency_changed_cb) (GstData*, gint freq),
                                  void (*station_found_cb) (GstData*, gint freq))
{
    g_message("sdrjfm_init");
    GError *error = NULL;
    GstData *data = g_slice_new0 (GstData);
    GstBus *bus;

    data->server = server;
    server->gstData = data;
    data->pipeline =
        gst_parse_launch ("sdrjfmsrc name=sdrjfm ! audioresample ! queue ! pulsesink",
        &error);
    g_assert_no_error (error);
    g_assert (data->pipeline != NULL);

    data->fmsrc = gst_bin_get_by_name (GST_BIN (data->pipeline), "sdrjfm");
    g_assert(data->fmsrc != NULL);

    data->playing_cb = playing_cb;
    data->frequency_changed_cb = frequency_changed_cb;
    data->station_found_cb = station_found_cb;

    g_message("DEBUG1 : sdrjfm_init, cb = %p", data->frequency_changed_cb);
    bus = gst_pipeline_get_bus (GST_PIPELINE (data->pipeline));
    gst_bus_add_watch (bus, bus_cb, data);

    gst_element_set_state (data->pipeline, GST_STATE_PLAYING);
    g_object_set(server, "enabled", TRUE, NULL);

    /* Default frequency : We don't want to send a frequencyChanged event here,
       so just set server->frequency */
    g_object_set (server->gstData->fmsrc, "frequency",
        (gint) server->frequency, NULL);

    g_object_unref (bus);

    g_message("DEBUG2 : sdrjfm_init, cb = %p", data->frequency_changed_cb);
    return data;
}

// TODO: Call this when relevant
/**
* Gstreamer element destruction and pipeline teardown.
* @param data Some GstData.
*/
static void
sdrjfm_deinit(GstData *data)
{
    gst_element_set_state (data->pipeline, GST_STATE_NULL);
    g_object_unref (data->fmsrc);
    g_object_unref (data->pipeline);
    g_slice_free (GstData, data);
}

int
main(int argc, char** argv)
{
    GMainLoop* mainloop = NULL;
    RadioServer* radio_obj = NULL;

    mainloop = g_main_loop_new(NULL, FALSE);

    if (mainloop == NULL)
        g_error("Couldn't create GMainLoop");

    radio_obj = g_object_new(TYPE_RADIO_SERVER, NULL);
    if (radio_obj == NULL)
        g_error("Failed to create one Value instance.");

    gst_init(&argc, &argv);

    /* Start service requests on the D-Bus */
    g_main_loop_run(mainloop);

    /* Should never be reached in normal working conditions */
    return EXIT_FAILURE;
}

