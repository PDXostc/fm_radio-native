#!/bin/bash
# This script installs all the newly copied RPMSfrom target.
# This script SHOULD REALLY be run on the target device !

# Some nice colors!
red='\033[0;31m'
NC='\033[0m' # No Color

DEBUG_MODE="0"
if [ $# -eq 1 ]; then
    if [ $1 = "debug" ]; then
        DEBUG_MODE="1"
    fi
fi

RPM_LIST=( "agl-plugins-0.0.1-1.i686" \
           "agl-plugins-rtl-sdr-0.0.1-1.i686" \
           "agl-plugins-fftw3-0.0.1-1.i686" \
           "agl-plugins-samplerate-0.0.1-1.i686" \
           "agl-plugins-service-0.0.1-1.i686" \
           "agl-plugins-gstsdrjfm-0.0.1-1.i686" )

RPM_INSTALL_ORDER=( 0 1 2 3 4 5 )
RPM_UNINSTALL_ORDER=( 5 4 3 2 1 0 )

DEBUG_RPM_LIST=( "agl-plugins-debuginfo-0.0.1-1.i686" \
                 "agl-plugins-debugsource-0.0.1-1.i686" \
                 "agl-plugins-fftw3-debuginfo-0.0.1-1.i686" \
                 "agl-plugins-gstsdrjfm-debuginfo-0.0.1-1.i686" \
                 "agl-plugins-rtl-sdr-debuginfo-0.0.1-1.i686" \
                 "agl-plugins-samplerate-debuginfo-0.0.1-1.i686" \
                 "agl-plugins-service-debuginfo-0.0.1-1.i686" )

DEBUG_RPM_INSTALL_ORDER=( 0 1 2 3 4 5 )
DEBUG_RPM_UNINSTALL_ORDER=( 5 4 3 2 1 0 )

echo -e "${red}Installing binary rpms...${NC}"
for i in "${RPM_UNINSTALL_ORDER[@]}"
do
    rpm -e ${RPM_LIST[${i}]}
done
for i in "${RPM_INSTALL_ORDER[@]}"
do
    rpm -ivh --force ${RPM_LIST[${i}]}.rpm
done
if [ $DEBUG_MODE -eq "1" ]; then
    echo -e "${red}Installing debug rpms...${NC}"
	for i in "${DEBUG_RPM_UNINSTALL_ORDER[@]}"
	do
	    rpm -e ${DEBUG_RPM_LIST[${i}]}
	done
	for i in "${DEBUG_RPM_INSTALL_ORDER[@]}"
	do
	    rpm -ivh --force ${DEBUG_RPM_LIST[${i}]}.rpm
	done
fi
