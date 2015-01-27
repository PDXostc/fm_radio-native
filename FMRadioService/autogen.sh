#! /bin/sh

cd gst-sdr-j-fm && ./autogen.sh && cd ..

aclocal \
&& automake --add-missing --foreign \
&& autoconf
