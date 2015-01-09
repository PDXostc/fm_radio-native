
include ../Makefile.in

OBJS= \
	wkb_config_client.o \
	wkb_client_extension.o \
	wkb_client.o \
	wkb_client_api.o

TARGET=libwkb_client.so

TARGET_DIR=../../lib

LIB_DIRS=-L../../lib

LIBS=-lecore -leldbus -Wl,--whole-archive -lextension-common -Wl,--no-whole-archive

CFLAGS:=$(CFLAGS) $(LIB_DIRS) $(LIBS) `pkg-config --cflags glib-2.0`

all: $(TARGET) wkb_inst

wkb_inst: wkb_inst.o $(TARGET)
	$(CC) $(CFLAGS) -lwkb_client -lecore -leldbus $^ -o $@

$(TARGET): prepare $(OBJS) 
	$(CC) $(CFLAGS) -fPIC -shared -o $@ -I./ $(OBJS)
	cp -f $(TARGET) $(TARGET_DIR)

.cpp.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

.cc.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

wkb_client_api.cc:  wkb_client.js
	python ../../extension_tools/generate_api.py wkb_client.js \
		kSource_wkb_client_api wkb_client_api.cc

prepare:
	mkdir -p $(TARGET_DIR)

install: $(TARGET)
	install -D $(TARGET_DIR)/$(TARGET) \
		$(DESTDIR)$(PREFIX)/lib/tizen-extensions-crosswalk/$(TARGET)
	install -D wkb_inst \
		$(DESTDIR)$(PREFIX)/local/sbin/wkb_inst
	install -D kb_inst \
		$(DESTDIR)$(PREFIX)/local/sbin/kb_inst


clean:
	rm -f *.o *.so
	rm -f $(TARGET_DIR)/$(TARGET)
	rm -f wkb_client_api.cc

.PHONY: all prepare clean
