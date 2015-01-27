#! /bin/sh

cd gst-sdr-j-fm && ./autogen.sh && cd ..

aclocal \
&& automake --add-missing --foreign \
&& autoconf

cd src/gst-sdr-j-fm
./autogen.sh
