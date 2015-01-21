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

#define DEFAULT_FREQUENCY  96700

enum
{
  PROP_0,
  PROP_FREQUENCY
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

static void
gst_sdrjfm_src_set_frequency (GstSdrjfmSrc *self, gint frequency)
{
  
}

static gint
gst_sdrjfm_src_get_frequency (GstSdrjfmSrc *self)
{
}

static void
 gst_sdrjfm_src_set_property (GObject * object, guint prop_id,
    const GValue * value, GParamSpec * pspec)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (object);

  GST_OBJECT_LOCK (self);

  switch (prop_id) {
    case PROP_FREQUENCY:
      gst_sdrjfm_src_set_frequency (self, g_value_get_int (value));
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
    case PROP_FREQUENCY:
      g_value_set_int (value, gst_sdrjfm_src_get_frequency (self));
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
  }

  GST_OBJECT_UNLOCK (self);
}

static gboolean
gst_sdrjfm_src_open (GstAudioSrc * asrc)
{
  return TRUE;
}

static gboolean
gst_sdrjfm_src_close (GstAudioSrc * asrc)
{
  return TRUE;
}

static gboolean
gst_sdrjfm_src_prepare (GstAudioSrc * asrc, GstAudioRingBufferSpec * spec)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (asrc);
  self->radio = new RadioInterface;

  return TRUE;
}

static gboolean
gst_sdrjfm_src_unprepare (GstAudioSrc * asrc)
{
  GstSdrjfmSrc *self = GST_SDRJFM_SRC (asrc);

  delete self->radio;
  self->radio = 0;

  return TRUE;
}

static guint
gst_sdrjfm_src_read (GstAudioSrc * asrc, gpointer data, guint length,
    GstClockTime * timestamp)
{
  GstSdrjfmSrc *self =  GST_SDRJFM_SRC (asrc);

  return self->radio->getSamples(static_cast<float *>(data), length);
}

static guint
gst_sdrjfm_src_delay (GstAudioSrc * asrc)
{
  GstSdrjfmSrc *self =  GST_SDRJFM_SRC (asrc);
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
gst_sdrjfm_src_init (GstSdrjfmSrc * self)
{
  GstAudioBaseSrc *basrc = GST_AUDIO_BASE_SRC (self);

  self->frequency = DEFAULT_FREQUENCY;

  basrc->latency_time = 132000; /* base on buffer size */
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

  g_object_class_install_property (gobject_class, PROP_FREQUENCY,
      g_param_spec_int ("frequency", "Frequency",
          "Frequency to receive", 0, G_MAXINT, DEFAULT_FREQUENCY,
    static_cast<GParamFlags>(G_PARAM_READWRITE | GST_PARAM_MUTABLE_PLAYING | G_PARAM_STATIC_STRINGS)));

  gst_element_class_set_static_metadata (gstelement_class, "FM Radio Source (SDR-J)",
      "Source/Audio",
      "Capture and demodulate FM radio",
      "Collabora <info@collabora.com>");

  gst_element_class_add_pad_template (gstelement_class,
      gst_static_pad_template_get (&sdrjfmsrc_src_factory));
}

