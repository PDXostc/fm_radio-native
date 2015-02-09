 /* GStreamer
 * Copyright (C) 2014, Collabora Ltd. <info@collabora.com>
 *
 * gstsdrjfmsrc.c:
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Library General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Library General Public License for more details.
 *
 * You should have received a copy of the GNU Library General Public
 * License along with this library; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin St, Fifth Floor,
 * Boston, MA 02110-1301, USA.
 */

/* Note, the plugin code is left LPGLv2, so this code can be copy pasted to
 * form other FM sources later if it makes sense. But the plugin will remain
 * GPLv2 since the backend is from GPLv2 program.
 */

/**
 * SECTION:element-sdrjfmsrc
 *
 * This element lets capture from RTL SDR supported radio card.
 *
 * <refsect2>
 * <title>Example pipelines</title>
 * |[
 * gst-launch-1.0 -v sdrjfmsrc frequency=97700000 ! pulsesink
 * ]| will playback live FM radio channel 97.7.
 * </refsect2>
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <string.h>

#include "gstsdrjfmsrc.h"

GST_DEBUG_CATEGORY_EXTERN (sdrjfm_debug);
#define GST_CAT_DEFAULT sdrjfm_debug


#define DEFAULT_MIN_FREQUENCY    88100000
#define DEFAULT_MAX_FREQUENCY   108100000
#define DEFAULT_FREQUENCY_STEP     100000
#define DEFAULT_FREQUENCY        96700000
#define DEFAULT_INTERVAL             1000
#define DEFAULT_THRESHOLD              20

enum
{
  PROP_0,
  PROP_MIN_FREQUENCY,
  PROP_MAX_FREQUENCY,
  PROP_FREQUENCY_STEP,
  PROP_FREQUENCY,
  PROP_INTERVAL,
  PROP_THRESHOLD
};

/* signals and args */
enum
{
  SIGNAL_SEEK_UP,
  SIGNAL_SEEK_DOWN,
  SIGNAL_CANCEL_SEEK,
  LAST_SIGNAL
};


#define gst_sdrjfm_src_parent_class parent_class

extern "C" {
G_DEFINE_TYPE (GstSdrjfmSrc, gst_sdrjfm_src, GST_TYPE_AUDIO_SRC);
}

static GstStaticPadTemplate sdrjfmsrc_src_factory = GST_STATIC_PAD_TEMPLATE ("src",
    GST_PAD_SRC,
    GST_PAD_ALWAYS,
    GST_STATIC_CAPS ("audio/x-raw, "
        "format = (string) " GST_AUDIO_NE(F32) ", "
        "layout = (string) interleaved, "
        "rate = (int) 44100, "
        "channels = (int) 2; ")
    );

static guint signals[LAST_SIGNAL] = { 0 };

static void
gst_sdrjfm_src_set_frequency (GstSdrjfmSrc *self, gint frequency)
{ 
  self->frequency = frequency;
  if (self->radio)
      self->radio->setTuner( frequency );
}

static gint
gst_sdrjfm_src_get_frequency (GstSdrjfmSrc *self)
{
  return self->frequency;
}

static void
 gst_sdrjfm_src_set_property (GObject * object, guint prop_id,
    const GValue * value, GParamSpec * pspec)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (object);

  GST_OBJECT_LOCK (self);

  switch (prop_id) {
    case PROP_MIN_FREQUENCY:
      self->min_freq = g_value_get_int (value);
      break;
    case PROP_MAX_FREQUENCY:
      self->max_freq = g_value_get_int (value);
      break;
    case PROP_FREQUENCY_STEP:
      self->freq_step = g_value_get_int (value);
      break;
    case PROP_FREQUENCY:
      gst_sdrjfm_src_set_frequency (self, g_value_get_int (value));
      break;
    case PROP_INTERVAL:
      self->interval = g_value_get_int (value);
      GST_DEBUG_OBJECT (self, "Set interval to %i from %i",
			self->interval, g_value_get_int (value));
      break;
    case PROP_THRESHOLD:
      self->threshold = g_value_get_int (value);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
  }

  GST_OBJECT_UNLOCK (self);
}

static void
gst_sdrjfm_src_get_property (GObject * object, guint prop_id,
    GValue * value, GParamSpec * pspec)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (object);

  GST_OBJECT_LOCK (self);

  switch (prop_id) {
    case PROP_MIN_FREQUENCY:
      g_value_set_int (value, self->min_freq);
      break;
    case PROP_MAX_FREQUENCY:
      g_value_set_int (value, self->max_freq);
      break;
    case PROP_FREQUENCY_STEP:
      g_value_set_int (value, self->freq_step);
      break;
    case PROP_FREQUENCY:
      g_value_set_int (value, gst_sdrjfm_src_get_frequency (self));
      break;
    case PROP_INTERVAL:
      g_value_set_int (value, self->interval);
      break;
    case PROP_THRESHOLD:
      g_value_set_int (value, self->threshold);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
  }

  GST_OBJECT_UNLOCK (self);
}

typedef struct _BusMessageData
{
  GstSdrjfmSrc *src;
  GstMessage *msg;
} BusMessageData;

static gboolean
gst_sdrjfm_src_send_bus_message_idle (void *user_data)
{
  BusMessageData *data = static_cast<BusMessageData *>(user_data);
  gst_element_post_message (GST_ELEMENT(data->src), data->msg);
  delete data;
  return FALSE;
}

static void
gst_sdrjfm_src_send_bus_message(void * user_data, const char *name,
				const char*field_name, gint field_value)
{

  GstSdrjfmSrc *self = static_cast<GstSdrjfmSrc *>(user_data);
  GstStructure *s;
  BusMessageData *data;

  s = gst_structure_new (name, field_name, G_TYPE_INT, field_value, NULL);

  data = new BusMessageData;
  data->src = self;
  data->msg = gst_message_new_element (GST_OBJECT (self), s);

  g_idle_add (gst_sdrjfm_src_send_bus_message_idle, data);
}

static void
gst_sdrjfm_src_frequency_changed (void * user_data, int32_t frequency)
{
  gst_sdrjfm_src_send_bus_message (user_data, "sdrjfmsrc-frequency-changed",
				   "frequency", frequency);
}

static gboolean
gst_sdrjfm_src_open (GstAudioSrc * asrc)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (asrc);

  self->radio = new RadioInterface(self->frequency);
  GST_INFO_OBJECT (self, "Created new SDR-J FM Radio object with frequency %u",
		   self->frequency);

  self->radio->setFrequencyChangeCB (gst_sdrjfm_src_frequency_changed, self);

  return TRUE;
}

static gboolean
gst_sdrjfm_src_close (GstAudioSrc * asrc)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (asrc);

  delete self->radio;
  self->radio = 0;

  return TRUE;
}

static gboolean
gst_sdrjfm_src_prepare (GstAudioSrc * asrc, GstAudioRingBufferSpec * spec)
{
  return TRUE;
}

static gboolean
gst_sdrjfm_src_unprepare (GstAudioSrc * asrc)
{
  return TRUE;
}

static guint
gst_sdrjfm_src_read (GstAudioSrc * asrc, gpointer data, guint length,
    GstClockTime * timestamp)
{
  const guint samplesRequired = length / sizeof(DSPFLOAT);

  GstSdrjfmSrc *self =  GST_SDRJFM_SRC (asrc);
  DSPFLOAT *samples = static_cast<DSPFLOAT *>(data);
  guint remaining = samplesRequired;

  while (remaining) {
    guint count = self->radio->getSamples(samples, remaining);
    GST_TRACE_OBJECT(self, "Read %u samples out of %u remaining from %u (length: %u)",
		     count, remaining, samplesRequired, length);

    samples += count;
    remaining -= count;
  }
  
  return length;
}

static guint
gst_sdrjfm_src_delay (GstAudioSrc * asrc)
{
  GST_FIXME_OBJECT (asrc, "not implemented");
  return 0;
}

static void
gst_sdrjfm_src_reset (GstAudioSrc * asrc)
{
  GST_FIXME_OBJECT (asrc, "not implemented");
}

static void
gst_sdrjfm_src_dispose (GObject * object)
{
  G_OBJECT_CLASS (parent_class)->dispose (object);
}

static void
gst_sdrjfm_src_finalize (GstSdrjfmSrc * self)
{
  G_OBJECT_CLASS (parent_class)->finalize (G_OBJECT (self));
}

static void
gst_sdrjfm_src_station_found (int32_t frequency, void *user_data)
{
  GstSdrjfmSrc *self = static_cast<GstSdrjfmSrc *>(user_data);
  GST_DEBUG_OBJECT (self, "Station found at frequency %i", frequency);

  self->frequency = frequency;
  gst_sdrjfm_src_send_bus_message (user_data, "sdrjfmsrc-station-found",
				   "frequency", frequency);
}

static void
gst_sdrjfm_src_do_seek(GstSdrjfmSrc * self, int32_t step)
{
  self->radio->seek(self->threshold, self->min_freq, self->max_freq, step,
    self->interval, gst_sdrjfm_src_station_found, self);
}

static void
gst_sdrjfm_src_seek_up (GstSdrjfmSrc * self)
{
  return gst_sdrjfm_src_do_seek(self, self->freq_step);
}

static void
gst_sdrjfm_src_seek_down (GstSdrjfmSrc * self)
{
  return gst_sdrjfm_src_do_seek(self, -self->freq_step);
}

static void
gst_sdrjfm_src_cancel_seek (GstSdrjfmSrc * self)
{
  self->radio->cancelSeek();
}

static void
gst_sdrjfm_src_init (GstSdrjfmSrc * self)
{
  GstAudioBaseSrc *basrc = GST_AUDIO_BASE_SRC (self);

  self->min_freq = DEFAULT_MIN_FREQUENCY;
  self->max_freq = DEFAULT_MAX_FREQUENCY;
  self->freq_step = DEFAULT_FREQUENCY_STEP;
  self->frequency = DEFAULT_FREQUENCY;
  self->interval = DEFAULT_INTERVAL;
  self->threshold = DEFAULT_THRESHOLD;

  basrc->latency_time = 2000000;
  basrc->buffer_time = 8 * basrc->latency_time;

  gst_audio_base_src_set_provide_clock (basrc, FALSE);
}

static void
gst_sdrjfm_src_class_init (GstSdrjfmSrcClass * klass)
{
  GObjectClass *gobject_class;
  GstElementClass *gstelement_class;
  GstAudioSrcClass *gstaudiosrc_class;

  gobject_class = (GObjectClass *) klass;
  gstelement_class = (GstElementClass *) klass;
  gstaudiosrc_class = (GstAudioSrcClass *) klass;

  gobject_class->dispose = gst_sdrjfm_src_dispose;
  gobject_class->finalize = (GObjectFinalizeFunc) gst_sdrjfm_src_finalize;
  gobject_class->get_property = gst_sdrjfm_src_get_property;
  gobject_class->set_property = gst_sdrjfm_src_set_property;


  gstaudiosrc_class->open = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_open);
  gstaudiosrc_class->prepare = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_prepare);
  gstaudiosrc_class->unprepare = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_unprepare);
  gstaudiosrc_class->close = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_close);
  gstaudiosrc_class->read = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_read);
  gstaudiosrc_class->delay = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_delay);
  gstaudiosrc_class->reset = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_reset);

  klass->seek_up = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_seek_up);
  klass->seek_down = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_seek_down);
  klass->cancel_seek = GST_DEBUG_FUNCPTR (gst_sdrjfm_src_cancel_seek);

  g_object_class_install_property (gobject_class, PROP_MIN_FREQUENCY,
      g_param_spec_int ("min-frequency", "Minimum Frequency",
          "Minimum frequency used in seeks (in Hz)", 0, G_MAXINT, DEFAULT_MIN_FREQUENCY,
			static_cast<GParamFlags>( G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS)));

  g_object_class_install_property (gobject_class, PROP_MAX_FREQUENCY,
      g_param_spec_int ("max-frequency", "Maximum Frequency",
          "Maximum frequency used in seeks (in Hz)", 0, G_MAXINT, DEFAULT_MAX_FREQUENCY,
			static_cast<GParamFlags>( G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS)));

  g_object_class_install_property (gobject_class, PROP_FREQUENCY_STEP,
      g_param_spec_int ("frequency-step", "Frequency Step",
          "Frequency steps used in seeks (in Hz)", 1, G_MAXINT, DEFAULT_FREQUENCY_STEP,
			static_cast<GParamFlags>( G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS)));

  g_object_class_install_property (gobject_class, PROP_FREQUENCY,
      g_param_spec_int ("frequency", "Frequency",
          "Frequency to receive", 0, G_MAXINT, DEFAULT_FREQUENCY,
    static_cast<GParamFlags>(G_PARAM_READWRITE | GST_PARAM_MUTABLE_PLAYING | G_PARAM_STATIC_STRINGS)));

  g_object_class_install_property (gobject_class, PROP_INTERVAL,
      g_param_spec_int ("interval", "Interval",
			"Interval between frequency hops during seeks",
			0, G_MAXINT, DEFAULT_INTERVAL,
			static_cast<GParamFlags>(G_PARAM_READWRITE
						 | GST_PARAM_MUTABLE_PLAYING
						 | G_PARAM_STATIC_STRINGS)));
 
  g_object_class_install_property (gobject_class, PROP_THRESHOLD,
      g_param_spec_int ("threshold", "Threshold",
			"Signal-to-noise threshold to consider a station present during seeks",
			0, G_MAXINT, DEFAULT_THRESHOLD,
			static_cast<GParamFlags>(G_PARAM_READWRITE
						 | GST_PARAM_MUTABLE_PLAYING
						 | G_PARAM_STATIC_STRINGS)));

  signals[SIGNAL_SEEK_UP] =
      g_signal_new ("seek-up", G_TYPE_FROM_CLASS (klass),
		    static_cast<GSignalFlags>( G_SIGNAL_RUN_LAST | G_SIGNAL_ACTION),
		    G_STRUCT_OFFSET (GstSdrjfmSrcClass, seek_up), NULL, NULL,
		    g_cclosure_marshal_generic, G_TYPE_NONE, 0, G_TYPE_NONE);

  signals[SIGNAL_SEEK_DOWN] =
      g_signal_new ("seek-down", G_TYPE_FROM_CLASS (klass),
		    static_cast<GSignalFlags>( G_SIGNAL_RUN_LAST | G_SIGNAL_ACTION ),
		    G_STRUCT_OFFSET (GstSdrjfmSrcClass, seek_down), NULL, NULL,
		    g_cclosure_marshal_generic, G_TYPE_NONE, 0, G_TYPE_NONE);

  signals[SIGNAL_CANCEL_SEEK] =
      g_signal_new ("cancel-seek", G_TYPE_FROM_CLASS (klass),
		    static_cast<GSignalFlags>( G_SIGNAL_RUN_LAST | G_SIGNAL_ACTION ),
		    G_STRUCT_OFFSET (GstSdrjfmSrcClass, cancel_seek), NULL, NULL,
		    g_cclosure_marshal_generic, G_TYPE_NONE, 0, G_TYPE_NONE);

  gst_element_class_set_static_metadata (gstelement_class, "FM Radio Source (SDR-J)",
      "Source/Audio",
      "Capture and demodulate FM radio",
      "Collabora <info@collabora.com>");

  gst_element_class_add_pad_template (gstelement_class,
      gst_static_pad_template_get (&sdrjfmsrc_src_factory));
}

