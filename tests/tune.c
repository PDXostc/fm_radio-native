#include <glib.h>
#include <gst/gst.h>

GST_DEBUG_CATEGORY (srdjrm_debug);
#define GST_CAT_DEFAULT srdjrm_debug

#define MIN_FREQ  88100000
#define MAX_FREQ 108100000

typedef struct _TestData TestData;
struct _TestData
{
  GstElement *pipeline;
  GstElement *fmsrc;
  void (*playing_cb) (TestData*);
  void (*freq_changed_cb) (TestData*,gint);
  gint timeout;
  GMainLoop *loop;
  gint freqs[10];
  gint idx;
  gint target_freq;
};

static gboolean
bus_cb (GstBus *bus, GstMessage *message, gpointer user_data)
{
  TestData *data = user_data;
  GError *error = NULL;

  switch (message->type) {
    case GST_MESSAGE_STATE_CHANGED:
      if (GST_MESSAGE_SRC (message) == GST_OBJECT (data->pipeline)) {
        GstState state;
        gst_message_parse_state_changed (message, NULL, &state, NULL);
        if (state == GST_STATE_PLAYING && data->playing_cb)
          data->playing_cb (data);
      }
      break;

    case GST_MESSAGE_ELEMENT:
      if (GST_MESSAGE_SRC (message) == GST_OBJECT (data->fmsrc)) {
        const GstStructure *s = gst_message_get_structure (message);

        g_assert (gst_structure_has_name (s, "srdjrmsrc-frequency-changed"));
        g_assert (gst_structure_has_field_typed (s, "frequency", G_TYPE_INT));

        if (data->freq_changed_cb) {
          gint freq;
          gst_structure_get_int (s, "frequency", &freq);

          g_assert_cmpint (freq, >=, MIN_FREQ);
          g_assert_cmpint (freq, <=, MAX_FREQ);

          data->freq_changed_cb (data, freq);
        }
      }
      break;

    case GST_MESSAGE_ERROR:
      gst_message_parse_error (message, &error, NULL);
      g_assert_no_error (error);
      break;

    case GST_MESSAGE_WARNING:
      gst_message_parse_warning (message, &error, NULL);
      g_assert_no_error (error);
      break;

    default:
      break;
  }

  return TRUE;
}

static TestData *
tearup (gint freq, void (*playing_cb) (TestData*),
    void (*freq_changed_cb) (TestData*,gint))
{
  GError *error = NULL;
  TestData *data = g_slice_new0 (TestData);
  GstBus *bus;

  data->pipeline =
      gst_parse_launch ("srdjrmsrc name=fmsrc ! audioresample ! alsasink",
      &error);
  g_assert_no_error (error);
  g_assert_nonnull (data->pipeline);

  data->fmsrc = gst_bin_get_by_name (GST_BIN (data->pipeline), "fmsrc");
  g_assert_nonnull (data->fmsrc);

  g_object_set (data->fmsrc,
      "frequency", freq,
      NULL);

  data->timeout = 20;
  data->playing_cb = playing_cb;
  data->freq_changed_cb = freq_changed_cb;

  bus = gst_pipeline_get_bus (GST_PIPELINE (data->pipeline));
  gst_bus_add_watch (bus, bus_cb, data);
  g_object_unref (bus);

  data->loop = g_main_loop_new (NULL, FALSE);

  gst_element_set_state (data->pipeline, GST_STATE_PLAYING);

  return data;
}

static void
teardown (TestData *data)
{
  gst_element_set_state (data->pipeline, GST_STATE_NULL);
  g_object_unref (data->fmsrc);
  g_object_unref (data->pipeline);
  g_main_loop_unref (data->loop);
  g_slice_free (TestData, data);
}

static gboolean
test_timed_out_cb (gpointer user_data)
{
  g_assert_false ("Test timed out");
  return FALSE;
}

static void
test_run (TestData *data)
{
  guint timeout;

  timeout = g_timeout_add_seconds (data->timeout, test_timed_out_cb, data);
  g_main_loop_run (data->loop);
  g_source_remove (timeout);

  teardown (data);
}

static void
test_done (TestData *data)
{
  g_main_loop_quit (data->loop);
}

static void
test_tune_playing_cb (TestData *data)
{
  data->freqs[0] =  96700000;
  data->freqs[1] =  93300000;
  data->freqs[2] = 105900000;
  data->freqs[3] =  88900000;
  data->freqs[4] = 0;
  //data->freqs[1] = 107600000;
  //data->freqs[5] = 107600000;
  //data->freqs[6] = 0;

  data->idx = 0;
  data->target_freq = data->freqs[0];
  g_object_set (data->fmsrc, "frequency", data->target_freq, NULL);

  GST_DEBUG_OBJECT (data->fmsrc, "Set frequency to %d", data->target_freq);
}

static void
test_tune_freq_changed_cb (TestData *data, gint frequency)
{
  g_assert_cmpint (frequency, ==, data->target_freq);

  data->target_freq = data->freqs[++(data->idx)];

  if (data->target_freq == 0)
    {
      GST_DEBUG_OBJECT (data->fmsrc, "Tune test completed");
      test_done (data);
    }
  else
    g_object_set (data->fmsrc, "frequency", data->target_freq, NULL);
}

static void
test_tune ()
{
  GST_DEBUG ("Starting tune test");
  TestData *data = tearup (96700000,
      test_tune_playing_cb,
      test_tune_freq_changed_cb);
  test_run (data);
}

gint
main (gint argc, gchar **argv)
{
  gst_init (&argc, &argv);

  GST_DEBUG_CATEGORY_INIT (srdjrm_debug, "srdjrm", 0, "SDR-J FM plugin");
  GST_DEBUG ("Running test");

  g_test_init (&argc, &argv, NULL);
  g_test_add_func ("/tune/live", test_tune);
  g_test_run ();
  return 0;
}
