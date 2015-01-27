#! /bin/sh

aclocal \
&& automake --add-missing --foreign \
&& autoconf

cd src/gst-sdr-j-fm
./autogen.sh
