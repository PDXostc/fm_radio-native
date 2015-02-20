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
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#include <glib.h>
#include <glib/gstdio.h>
#include <gst/gst.h>
#include <gio/gio.h>
#include <dbus/dbus-glib.h>
#include <dbus/dbus-glib-bindings.h>
#include "../../extension_common/fm_radio_common.h"

#ifdef G_OS_UNIX
#include <glib-unix.h>
#endif

#define CONFIG_DIR "/fmradioservice"

/**
 * Signal enum types.
 * Signal enums are used in g_signal_new as name/id.
 */
typedef enum {
    E_SIGNAL_ON_ENABLED,
    E_SIGNAL_ON_DISABLED,
    E_SIGNAL_ON_FREQUENCY_CHANGED,
    E_SIGNAL_ON_STATION_FOUND,
    E_SIGNAL_ON_RDS_COMPLETE,

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
 * RDS enums
 */
typedef enum
{
  RDS_FIRST = 1,
  RDS_CLEAR,
  RDS_SECOND
} RDSState;

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
    RDSState rds_state;
    void (*playing_cb) (GstData*);
    void (*frequency_changed_cb) (GstData*, gint);
    void (*station_found_cb) (GstData*, gint);
    void (*rds_label_complete_cb) (GstData*, const gchar *);
};

/** Main GObject RadioServer object. */
typedef struct {
    GObject parent;

    /* Actual properties */
    gboolean enabled;
    gdouble  frequency;         /**< frequency is in Hz */

    GstData *gstData;
    GMainLoop *mainloop;

    gboolean ongoingSeek;

    GString *configFile;
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
gboolean server_seek (RadioServer *server, gboolean value_in,
                      GError **error);
gboolean server_cancelseek (RadioServer *server, GError **error);

#include "server-bindings.h"

static GParamSpec *obj_properties[E_PROP_COUNT] = {NULL,};

static GstData *sdrjfm_init (RadioServer *server,
                             void (*playing_cb) (GstData*),
                             void (*frequency_changed_cb) (GstData*, gint freq),
                             void (*station_found_cb) (GstData*, gint freq),
                             void (*rds_label_complete_cb) (GstData*, const gchar*));
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
        SIGNAL_ON_FREQUENCY_CHANGED,
        SIGNAL_ON_STATION_FOUND,
        SIGNAL_ON_RDS_COMPLETE
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

    signal_id = g_signal_new(signal_names[E_SIGNAL_ON_STATION_FOUND],
                             G_OBJECT_CLASS_TYPE(klass),
                             G_SIGNAL_RUN_LAST,
                             0,
                             NULL,
                             NULL,
                             g_cclosure_marshal_VOID__VOID,
                             G_TYPE_NONE,
                             1,
                             G_TYPE_DOUBLE);
    klass->signals[E_SIGNAL_ON_STATION_FOUND] = signal_id;

    signal_id = g_signal_new(signal_names[E_SIGNAL_ON_RDS_COMPLETE],
                             G_OBJECT_CLASS_TYPE(klass),
                             G_SIGNAL_RUN_LAST,
                             0,
                             NULL,
                             NULL,
                             g_cclosure_marshal_VOID__VOID,
                             G_TYPE_NONE,
                             1,
                             G_TYPE_STRING);
    klass->signals[E_SIGNAL_ON_RDS_COMPLETE] = signal_id;
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
    // fmradioservice and pulseaudio needs to have /tmp/pulseaudio
    // present... so create it.
    struct stat st = {0};
    if (stat("/tmp/pulseaudio", &st) == -1) {
        mkdir("/tmp/pulseaudio", 0755);
    }

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

    server->ongoingSeek = FALSE;
}

/**
* Handler called when the radio is just been enabled.
* @param data GstData structure.
*/
static void
handle_on_enabled(GstData *data)
{
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
static void
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
static void
handle_on_frequency_changed(GstData* data, gint freq)
{
    RadioServer *server;
    server = (RadioServer *) data->server;
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    server->frequency = (gdouble) freq;
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
static void
handle_on_station_found(GstData* data, gint freq)
{
    RadioServer *server;
    server = (RadioServer *) data->server;
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    server->ongoingSeek = FALSE;
    server->frequency = (gdouble) freq;
    g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_STATION_FOUND],
                  0,
                  server->frequency);
}

/**
* Handler called when a RDS string has been completely received
* @param data GstData structure.
* @param label gchar*
*/
static void
handle_on_rds_complete (GstData *data, const gchar *label)
{
    RadioServer *server;
    server = (RadioServer *) data->server;
    RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);

    g_signal_emit(server,
                  klass->signals[E_SIGNAL_ON_RDS_COMPLETE],
                  0,
                  label);
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
    /* Enabling FM Radio is a two-step async process.
       We first enable our sdrjfm GST element in here,
       then, the GST bus GST_MESSAGE_STATE_CHANGED callback will
       send the "enabled" signal if gst's state is set to GST_STATE_PLAYING */

    if (!server->enabled) {
        sdrjfm_init(server,
                    handle_on_enabled,
                    handle_on_frequency_changed,
                    handle_on_station_found,
                    handle_on_rds_complete);
        g_message("FMRadioService: server enabled");
        g_object_set(server, "enabled", TRUE, NULL);
    } else {
        // We still broadcast our current frequency
        RadioServerClass* klass = RADIO_SERVER_GET_CLASS(server);
        g_signal_emit(server,
                      klass->signals[E_SIGNAL_ON_ENABLED],
                      0);
        g_signal_emit(server,
                      klass->signals[E_SIGNAL_ON_FREQUENCY_CHANGED],
                      0,
                      server->frequency);
        g_message("FMRadioService: server already enabled");
    }

    // TODO: Return false and set error in case something went wrong.
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
    // Set the GST element frequency
    g_object_set (server->gstData->fmsrc, "frequency", (gint) value_in, NULL);
    g_message("FMRadioService: frequency set to : %f", value_in);

    // TODO: Return false and set error in case something went wrong.
    return TRUE;
}

/**
* Launch a seek operation in the GST element
* @param server Main server object.
* @param value_in Direction of the seek. 0=down 1=up
* @param error GError containing code and message for calling dbus client.
* @return TRUE is successful.
*/
gboolean
server_seek (RadioServer *server, gboolean value_in, GError **error)
{
    // Call the Seek on our gstjsdrsrc element
    if (value_in)
        g_signal_emit_by_name (server->gstData->fmsrc, "seek-up");
    else
        g_signal_emit_by_name (server->gstData->fmsrc, "seek-down");

    server->ongoingSeek = TRUE;

    // TODO: Return false and set error in case something went wrong.
    return TRUE;
}

/**
* Cancel an ongoing seek (if there's a seek going on)
* @param server Main server object.
* @param error GError containing code and message for calling dbus client.
* @return TRUE is successful.
*/
gboolean
server_cancelseek (RadioServer *server, GError **error)
{
    // We can only cancel a seek if GST element is currently seeking
    if (server->ongoingSeek) {
        g_signal_emit_by_name (server->gstData->fmsrc, "cancel-seek");
    }

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
            g_message("bus_cb - GST_MESSAGE_ELEMENT");
            if (GST_MESSAGE_SRC (message) == GST_OBJECT (data->fmsrc)) {
                const GstStructure *s = gst_message_get_structure (message);

                if (gst_structure_has_field_typed (s, "frequency", G_TYPE_INT)) {

                    gint freq;
                    gst_structure_get_int (s, "frequency", &freq);
                    g_assert_cmpint (freq, >=, FM_RADIO_SERVICE_MIN_FREQ);
                    g_assert_cmpint (freq, <=, FM_RADIO_SERVICE_MAX_FREQ);

                    if (gst_structure_has_name (s, "sdrjfmsrc-frequency-changed")) {
                        if (data->frequency_changed_cb)
                            data->frequency_changed_cb (data, freq);
                    } else if (gst_structure_has_name (s, "sdrjfmsrc-station-found")) {
                        if (data->station_found_cb)
                            data->station_found_cb (data, freq);
                    }

                } else if (gst_structure_has_field_typed (s, "station-label", G_TYPE_STRING)) {
                    const gchar *label = gst_structure_get_string (s, "station-label");
                    g_message("DEBUG : rds complete label = %s", label);
                    if (gst_structure_has_name (s, "sdrjfmsrc-rds-station-label-complete")) {
                        if (data->rds_label_complete_cb)
                            data->rds_label_complete_cb (data, label);
                    }
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
                                  void (*frequency_changed_cb) (GstData*, gint),
                                  void (*station_found_cb) (GstData*, gint),
                                  void (*rds_label_complete_cb) (GstData*, const gchar*))
{
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

    data->rds_state = RDS_FIRST;
    data->playing_cb = playing_cb;
    data->frequency_changed_cb = frequency_changed_cb;
    data->station_found_cb = station_found_cb;
    data->rds_label_complete_cb = rds_label_complete_cb;

    bus = gst_pipeline_get_bus (GST_PIPELINE (data->pipeline));
    gst_bus_add_watch (bus, bus_cb, data);

    gst_element_set_state (data->pipeline, GST_STATE_PLAYING);

    /* Default frequency : We don't want to send a frequencyChanged event here,
       so just set server->frequency */
    g_object_set (server->gstData->fmsrc, "frequency",
        (gint) server->frequency, NULL);

    g_object_unref (bus);

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

/**
* Finds a file provider for config file
*/
static GString *
getConfigFile()
{
    GString* configFile = g_string_new("");
    GString* configDir = g_string_new("");

    // We first check for standard XDG directories
    gchar* s = getenv("XDG_CONFIG_HOME");
    if (s != NULL) {
        g_string_assign(configDir, s);
        g_string_append(configDir, CONFIG_DIR);
    } else {
        gchar* homeDir = getenv("HOME");
        if (homeDir != NULL) {
            g_string_append(configDir, homeDir);
            g_string_append(configDir, "/.config");
            g_string_append(configDir, CONFIG_DIR);
        } else {
            // ouch! last resort :(
            g_string_append(configDir, ".");
        }
    }

    // create configDir if it's absent
    struct stat st;
    int err = g_stat(configDir->str, &st);
    if(err == -1) {
        if(errno == ENOENT) {
            /* does not exist, create it */
            g_mkdir_with_parents(configDir->str, 0x755);
        }
    }

    // then we have our fileName
    g_string_assign(configFile, configDir->str);
    g_string_append(configFile, "/lastStation.freq");

    return configFile;
}

static void
save_last_station(gchar* fileName, int freq)
{
    GError *error;

    FILE *f = g_fopen(fileName, "w");
    if (f != NULL) {
        fprintf(f, "%i", freq);
        g_close(f, &error);
    }
}

static int
load_last_station(gchar* fileName)
{
    GError *error;
    int freq;

    FILE *f = g_fopen(fileName, "r");
    if (f != NULL) {
        fscanf(f, "%i", &freq);
        g_close(f, &error);
    }
}

#ifdef G_OS_UNIX
static gboolean
handle_unix_termination_signal (gpointer user_data)
{
    RadioServer* server = (RadioServer*) user_data;
    GMainLoop *loop = server->mainloop;
    if (server->gstData != NULL)
        sdrjfm_deinit(server->gstData);
    g_main_loop_quit (loop);
    return FALSE;
}
#endif

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

    radio_obj->mainloop = mainloop;
    radio_obj->configFile = getConfigFile();

#ifdef G_OS_UNIX
    g_unix_signal_add (SIGTERM, handle_unix_termination_signal, radio_obj);
    g_unix_signal_add (SIGINT,  handle_unix_termination_signal, radio_obj);
#endif

    gst_init(&argc, &argv);

    // We enable the gstsdrj GST element BY DEFAULT at boot-time now.
    server_enable(radio_obj, NULL);

    /* Start service requests on the D-Bus */
    g_main_loop_run(mainloop);

    /* Should never be reached in normal working conditions */
    return EXIT_FAILURE;
}

