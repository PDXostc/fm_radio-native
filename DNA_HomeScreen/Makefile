PROJECT = DNA_HomeScreen
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common css icon.png index.html setup config.xml images js manifest.json
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: clean
	cp -rf ../DNA_common .
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images DNA_common

config:
	scp setup/weston.ini root@$(TIZEN_IP):/etc/xdg/weston/

$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX001.HomeScreen"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && ail_list | egrep -e 'Home Screen' | awk '{print $1}' | xargs --no-run-if-empty app_launcher -s -d "

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX001.HomeScreen -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX001.HomeScreen -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/DNA_HomeScreen.wgt -q"
endif

install: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && pkgcmd -l | egrep -e 'Home Screen' | awk '{print $1}' | xargs --no-run-if-empty pkgcmd -u -n -q"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && pkgcmd -i -t wgt -i /home/app/DNA_HomeScreen.wgt -q"
endif

$(PROJECT).wgt : wgt

deploy: wgtPkg
ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app
endif

all:
	@echo "Nothing to build"


clean:
	-rm $(PROJECT).wgt
	-rm -rf DNA_common

