#the line below is required for the script to work with ssh
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
#These lines remove installed wigits before installing the new ones.
#installing wigits over existing will case problems.
xwalkctl | egrep -e "Home Screen" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "Hello Tizen" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "Browser" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "News" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
#These lines install the wigits.
xwalkctl -i /home/app/DNA_HomeScreen.wgt
xwalkctl -i /home/app/DNA_HelloTizen.wgt
xwalkctl -i /home/app/DNA_Browser.wgt
xwalkctl -i /home/app/DNA_News.wgt
#Launch the app after install
xwalkctl | egrep -e "Home Screen" | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d 
