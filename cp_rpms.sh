#!/bin/bash
# This script copies all the newly built RPMS to target device's home. NOTE: Use *must* define TIZEN_IP in the environment (export) prior to calling this script

# Some nice colors!
red='\033[0;31m'
NC='\033[0m' # No Color

DEBUG_MODE="0"
if [ $# -eq 1 ]; then
    if [ $1 = "debug" ]; then
        DEBUG_MODE="1"
    fi
fi

RPM_FOLDER=$HOME/GBS-ROOT/local/repos/tizen/i586/RPMS
RPM_LIST=( "agl-plugins-0.0.1-1.i686.rpm" \
           "agl-plugins-fftw3-0.0.1-1.i686.rpm" \
           "agl-plugins-gstsdrjfm-0.0.1-1.i686.rpm" \
           "agl-plugins-rtl-sdr-0.0.1-1.i686.rpm" \
           "agl-plugins-samplerate-0.0.1-1.i686.rpm" \
           "agl-plugins-service-0.0.1-1.i686.rpm" )

DEBUG_RPM_LIST=( "agl-plugins-debuginfo-0.0.1-1.i686.rpm" \
                 "agl-plugins-debugsource-0.0.1-1.i686.rpm" \
                 "agl-plugins-fftw3-debuginfo-0.0.1-1.i686.rpm" \
                 "agl-plugins-gstsdrjfm-debuginfo-0.0.1-1.i686.rpm" \
                 "agl-plugins-rtl-sdr-debuginfo-0.0.1-1.i686.rpm" \
                 "agl-plugins-samplerate-debuginfo-0.0.1-1.i686.rpm" \
                 "agl-plugins-service-debuginfo-0.0.1-1.i686.rpm" )


if env | grep -q ^TIZEN_IP=
then
    echo -e "${red}Copying binary rpms to target device...${NC}"
    for i in "${RPM_LIST[@]}"
    do
        scp $RPM_FOLDER/$i app@$TIZEN_IP:
    done
    if [ $DEBUG_MODE -eq "1" ]; then
        echo -e "${red}Copying debug rpms to target device...${NC}"
        for i in "${DEBUG_RPM_LIST[@]}"
        do
            scp $RPM_FOLDER/$i app@$TIZEN_IP:
        done
    fi
    echo -e "${red}Copying the install script to target device...${NC}"
    scp ./install_rpms.sh app@$TIZEN_IP:
else
  echo "Error! You have to set and export TIZEN_IP prior to calling this script!"
fi
