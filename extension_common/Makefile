
include Makefile.in

AR=ar rcs
OBJS=extension.o
TARGET=libextension-common.a
TARGET_DIR=../lib

all: $(TARGET)

libextension-common.a: prepare $(OBJS)
	$(AR) $@ $(OBJS)
#	$(CC) $(CFLAGS) $(LIBS) -fPIC -shared -o $@ $(OBJS)
	cp -f $(TARGET) $(TARGET_DIR)

.cc.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

prepare:
	mkdir -p $(TARGET_DIR)

install: $(TARGET)
#	install -D $(TARGET_DIR)/$(TARGET) \
#		$(DESTDIR)/$(PREFIX)/lib/tizen-extensions-crosswalk/$(TARGET)

clean:
	rm *.o *.a *.so
	rm $(TARGET_DIR)/$(TARGET)

.PHONY: all prepare clean

