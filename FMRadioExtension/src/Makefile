
include ../Makefile.in

OBJS= \
	fm_radio_extension.o \
	fm_radio_instance.o \
	fm_radio_api.o \

TARGET=lib_fmradio.so

BINDINGS= \
	client-bindings.h \

TARGET_DIR=../../lib

LIB_DIRS=-L../../lib

LIBS=-lglib-2.0 -Wl,--whole-archive -lextension-common -Wl,--no-whole-archive

CFLAGS:=$(CFLAGS) $(LIB_DIRS) $(LIBS) `pkg-config --cflags glib-2.0`

all: $(TARGET)

$(TARGET): $(BINDINGS) fm_radio_api.cc prepare $(OBJS) 
	$(CC) $(CFLAGS) -fPIC -shared -o $@ -I./ $(OBJS)
	cp -f $(TARGET) $(TARGET_DIR)

.cpp.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

.cc.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

fm_radio_api.cc:  fm_radio_api.js
	python ../../extension_tools/generate_api.py fm_radio_api.js \
		kSource_fm_radio_api fm_radio_api.cc

#Rules to generate the binding headers
client-bindings.h: ../../extension_common/fm_radio_service.xml
	dbus-binding-tool --prefix=server_object --mode=glib-client $<> $@

prepare:
	mkdir -p $(TARGET_DIR)

install: $(TARGET)
	install -D $(TARGET_DIR)/$(TARGET) \
		$(DESTDIR)$(PREFIX)/lib/tizen-extensions-crosswalk/$(TARGET)

clean:
	rm -f *.o *.so
	rm -f $(TARGET_DIR)/$(TARGET)
	rm -f fm_radio_api.cc
	rm -f client-bindings.h

.PHONY: all prepare clean
