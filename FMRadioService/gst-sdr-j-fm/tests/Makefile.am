TESTS = tune.sh
TESTS_ENVIRONMENT = GST_PLUGIN_PATH="$(top_builddir)/src/.libs"

noinst_PROGRAMS = tune

tune_SOURCES = tune.c
tune_CFLAGS= $(GST_CFLAGS)
tune_LDADD= $(GST_LIBS)

