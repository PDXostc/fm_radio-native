PROJECT = _common

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_FILES = 
INSTALL_DIR = ${DESTDIR}/opt/usr/apps/

all:

install:
	mkdir -p ${DESTDIR}/opt/usr/apps/_common
	cp -r css ${DESTDIR}/opt/usr/apps/_common/css
	cp -r js ${DESTDIR}/opt/usr/apps/_common/js

#to clean old common files out to test.

clean:
	rm -rf css/car
	rm -rf css/user
	rm -rf js/services
