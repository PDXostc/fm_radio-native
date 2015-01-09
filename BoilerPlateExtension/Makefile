ECHO_CFLAGS=$(CFLAGS) -fPIC -Wall -std=c++0x 
SOURCES=src/bp.cpp src/bp_extension.cpp src/bp_instance.cpp src/bp_api.cc common/extension.cc


all: libbp.so

bp_api.cc:
	python tools/generate_api.py src/bp_api.js kSource_bp_api src/bp_api.cc

libbp.so: prepare  bp_api.cc
	$(CC) $(ECHO_CFLAGS) -shared -o build/libbp.so \
	$(SYSROOT_FLAGS) -I./ $(SOURCES)

prepare:
	mkdir -p build

install: libbp.so
	install -D build/libbp.so \
	$(DESTDIR)/$(PREFIX)/lib/tizen-extensions-crosswalk/libbp.so

clean:
	rm -Rf build
	rm src/bp_api.cc

.PHONY: all prepare clean
