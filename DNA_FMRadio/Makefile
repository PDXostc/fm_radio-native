PROJECT = DNA_FMRADIO
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common css icon.png index.html setup config.xml js manifest.json images fonts
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

 # TIZEN_IP must be exported from the env if set to anything else than NUC
ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: clean
	cp -rf ../DNA_common .
	zip -r $(PROJECT).wgt $(WRT_FILES)

config:
	scp setup/weston.ini root@$(TIZEN_IP):/etc/xdg/weston/

$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX004.FMRadio"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'FMRADIO' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher"

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX004.FMRadio -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX004.FMRadio -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/DNA_FMRADIO.wgt -q"
endif

debug: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -d 9888"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'FMRADIO' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

install: deploy
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'FMRADIO' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/DNA_FMRADIO.wgt"

$(PROJECT).wgt : wgt

deploy: wgtPkg
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app

all:
	@echo "Nothing to build"

doc:
	yuidoc .

clean:
	-rm $(PROJECT).wgt
	-rm -rf DNA_common
