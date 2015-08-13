Name:       fm_radio-native
Summary:    Supporting packages for fm_radio
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

# External requirements to build deps
BuildRequires:  python
BuildRequires:  desktop-file-utils
BuildRequires:  cmake

# Actual app/service requirements
BuildRequires:  pkgconfig(eina)
BuildRequires:  pkgconfig(eet)
BuildRequires:  pkgconfig(evas)
BuildRequires:  pkgconfig(ecore)
BuildRequires:  pkgconfig(ecore-evas)
BuildRequires:  pkgconfig(edje)
BuildRequires:  pkgconfig(efreet)
BuildRequires:  pkgconfig(eldbus)
BuildRequires:  pkgconfig(glib-2.0)
BuildRequires:  pkgconfig(dbus-1)
BuildRequires:  pkgconfig(dbus-glib-1)
BuildRequires:  pkgconfig(systemd)
BuildRequires:  pkgconfig(gstreamer-1.0)
BuildRequires:  pkgconfig(gstreamer-base-1.0)
BuildRequires:  pkgconfig(gstreamer-audio-1.0)
BuildRequires:  pkgconfig(sndfile)
BuildRequires:  pkgconfig(libusb-1.0)

# Run-time dependencies
Requires:       ibus
Requires:       ibus-hangul
Requires:       ibus-libpinyin
Requires:       systemd
Requires:       gstreamer
Requires:       dbus-glib
Requires:       dbus
Requires:       libglib
Requires:       libusb
Requires:       libsndfile

# Some useful globals defining PATHS
%global AGL_DIR ${RPM_BUILD_DIR}/${RPM_PACKAGE_NAME}-${RPM_PACKAGE_VERSION}
%global FMRADIOSERVICE_PATH %{AGL_DIR}/FMRadioService
%global GSTSDRJFM_PATH %{FMRADIOSERVICE_PATH}/gst-sdr-j-fm
%global DEPS_PATH %{FMRADIOSERVICE_PATH}/deps
%global RTLSDR_PATH %{DEPS_PATH}/librtlsdr-0.5.3
%global FFTW3_PATH %{DEPS_PATH}/fftw-3.3.4
%global LIBSAMPLERATE_PATH %{DEPS_PATH}/libsamplerate-0.1.8

# Xwalk extension plugin list
%global plugin_list %{AGL_DIR}/extension_common %{AGL_DIR}/BoilerPlateExtension %{AGL_DIR}/FMRadioExtension

%global autogen_list %{FMRADIOSERVICE_PATH} %{GSTSDRJFM_PATH}
%global deps_list %{RTLSDR_PATH} %{FFTW3_PATH} %{LIBSAMPLERATE_PATH}
%global install_list %{RTLSDR_PATH}/build %{FFTW3_PATH} %{LIBSAMPLERATE_PATH} %{FMRADIOSERVICE_PATH} %{plugin_list}

%description
A collection of IVI software

%package service
Summary: FMRadioService dbus service
Group: System/Audio
%description service
FMRadioService dbus-daemon Service,

%package rtl-sdr
Summary: Library rtl-sdr
Group: System/Audio
%description rtl-sdr
DVB dongle compat library.

%package fftw3
Summary: Library fftw3
Group: System/Audio
%description fftw3
C subroutine library for computing the discrete Fourier transform.

%package samplerate
Summary: Library samplerate
Group: System/Audio
%description samplerate
Sample Rate Converter for audio.

%package gstsdrjfm
Summary: Library samplerate
Group: System/Audio
%description gstsdrjfm
Gstreamer element that demodulates FM radio signal.

%prep
%setup -q -n %{name}-%{version}
echo "HOME : ${HOME} HOME: %{HOME}"

# Some projects need to be autogen'ed
for file in %{autogen_list}; do
	cd ${AGL_DIR}/${file}
	./autogen.sh
done

# Uncompress the deps
for file in %{deps_list}; do
	tar -C %{DEPS_PATH}/ -xvf ${file}.tar.gz
done

%build
## Since dependencies from deps_list are not already packaged by Tizen they
## are provided here (tarballs) and built and installed from source

# Build RTLSDR CMAKE dep
cd %{RTLSDR_PATH}
rm -fR build
mkdir build
cd build
cmake .. -DCMAKE_C_FLAGS:STRING="%{optflags}" -DCMAKE_INSTALL_PREFIX=%{_prefix}
make
RTLSDR_LIBS="%{RTLSDR_PATH}/src/librtlsdr.so"
RTLSDR_INCLUDES="-I/%{RTLSDR_PATH}/include"

# Build FFTW dep
cd %{FFTW3_PATH}
./configure --prefix=%{_prefix} --enable-single --enable-shared
make
FFTW3_LIBS="%{FFTW3_PATH}/.libs/libfftw3f.la"
FFTW3_INCLUDES="-I/%{FFTW3_PATH}/api"

# Build LIBSAMPLERATE dep
cd %{LIBSAMPLERATE_PATH}
./configure --prefix=%{_prefix}
make
LIBSAMPLERATE_LIBS="%{LIBSAMPLERATE_PATH}/src/.libs/libsamplerate.la"
LIBSAMPLERATE_INCLUDES="-I/%{LIBSAMPLERATE_PATH}/src"

# Now build autotool-like FMRadioService and gstreamer gstsdrjfm plugin
cd %{FMRADIOSERVICE_PATH}
LD_LIBRARY_PATH=%{RTLSDR_LIBPATH} RS_CFLAGS=${RTLSDR_INCLUDES} RS_LIBS=${RTLSDR_LIBS} SR_CFLAGS=${LIBSAMPLERATE_INCLUDES} SR_LIBS=${LIBSAMPLERATE_LIBS} FFTW_CFLAGS=${FFTW3_INCLUDES} FFTW_LIBS=${FFTW3_LIBS} ./configure --prefix=%{_prefix}
make

# Build all the xwalk extension plugins
for folder in %{plugin_list}; do
	make -C ${folder}
done

%install
# Manually add those paths that we are going to install
mkdir -p %{buildroot}/usr/lib/systemd/user
mkdir -p %{buildroot}/usr/share/dbus-1/services
mkdir -p %{buildroot}/etc/modprobe.d/
mkdir -p %{buildroot}/etc/udev/rules.d/

# Install everything
for folder in %{install_list}; do
    make -C ${folder} install DESTDIR=%{buildroot} PREFIX=%{_prefix}
done
install -m 0644 blacklist-rtlsdr.conf %{buildroot}/etc/modprobe.d/
install -m 0644 99-touchscreen.rules %{buildroot}/etc/udev/rules/
install -m 0644 99-librtlsdr.rules %{buildroot}/etc/udev/rules/

%post -n fm_radio-native-rtl-sdr -p /sbin/ldconfig
%post -n fm_radio-native-fftw3 -p /sbin/ldconfig
%post -n fm_radio-native-samplerate -p /sbin/ldconfig

%postun -n fm_radio-native-rtl-sdr -p /sbin/ldconfig
%postun -n fm_radio-native-fftw3 -p /sbin/ldconfig
%postun -n fm_radio-native-samplerate -p /sbin/ldconfig

%files
%defattr(-,root,root)
%{_libdir}/tizen-extensions-crosswalk/libbp.so
%{_libdir}/tizen-extensions-crosswalk/lib_fmradio.so

%files rtl-sdr
%defattr(-,root,root)
%dir %{_sysconfdir}/udev
%dir %{_sysconfdir}/udev/rules.d
%config %{_sysconfdir}/modprobe.d/blacklist-rtlsdr.conf
%config %{_sysconfdir}/udev/rules/99-touchscreen.rules
%config %{_sysconfdir}/udev/rules/99-librtlsdr.rules
%{_bindir}/rtl_adsb
%{_bindir}/rtl_eeprom
%{_bindir}/rtl_fm
%{_bindir}/rtl_power
%{_bindir}/rtl_sdr
%{_bindir}/rtl_tcp
%{_bindir}/rtl_test
%{_includedir}/rtl-sdr.h
%{_includedir}/rtl-sdr_export.h
%{_libdir}/debug/.build-id/*/*
%{_libdir}/debug/usr/bin/rtl_adsb.debug
%{_libdir}/debug/usr/bin/rtl_eeprom.debug
%{_libdir}/debug/usr/bin/rtl_fm.debug
%{_libdir}/debug/usr/bin/rtl_power.debug
%{_libdir}/debug/usr/bin/rtl_sdr.debug
%{_libdir}/debug/usr/bin/rtl_tcp.debug
%{_libdir}/debug/usr/bin/rtl_test.debug
%{_libdir}/debug/usr/lib/librtlsdr.so.0.5.3.debug
%{_libdir}/librtlsdr.a
%{_libdir}/librtlsdr.so
%{_libdir}/librtlsdr.so.0
%{_libdir}/librtlsdr.so.0.5.3
%{_libdir}/pkgconfig/librtlsdr.pc

%files fftw3
%defattr(-,root,root)
%{_bindir}/fftw-wisdom-to-conf
%{_bindir}/fftwf-wisdom
%{_includedir}/fftw3.f
%{_includedir}/fftw3.f03
%{_includedir}/fftw3.h
%{_includedir}/fftw3l.f03
%{_includedir}/fftw3q.f03
%{_libdir}/debug/usr/bin/fftwf-wisdom.debug
%{_libdir}/debug/usr/lib/libfftw3f.so.3.4.4.debug
%{_libdir}/libfftw3f.a
%{_libdir}/libfftw3f.la
%{_libdir}/libfftw3f.so
%{_libdir}/libfftw3f.so.3
%{_libdir}/libfftw3f.so.3.4.4
%{_libdir}/pkgconfig/fftw3f.pc
%{_infodir}/fftw3.info-1.gz
%{_infodir}/fftw3.info-2.gz
%{_infodir}/fftw3.info.gz
%{_mandir}/man1/fftw-wisdom-to-conf.1.gz
%{_mandir}/man1/fftwf-wisdom.1.gz

%files samplerate
%defattr(-,root,root)
%{_includedir}/samplerate.h
%{_bindir}/sndfile-resample
%{_libdir}/debug/usr/bin/sndfile-resample.debug
%{_libdir}/debug/usr/lib/libsamplerate.so.0.1.8.debug
%{_libdir}/libsamplerate.a
%{_libdir}/libsamplerate.la
%{_libdir}/libsamplerate.so
%{_libdir}/libsamplerate.so.0
%{_libdir}/libsamplerate.so.0.1.8
%{_libdir}/pkgconfig/samplerate.pc
%{_defaultdocdir}/libsamplerate0-dev/html/SRC.css
%{_defaultdocdir}/libsamplerate0-dev/html/SRC.png
%{_defaultdocdir}/libsamplerate0-dev/html/api.html
%{_defaultdocdir}/libsamplerate0-dev/html/api_callback.html
%{_defaultdocdir}/libsamplerate0-dev/html/api_full.html
%{_defaultdocdir}/libsamplerate0-dev/html/api_misc.html
%{_defaultdocdir}/libsamplerate0-dev/html/api_simple.html
%{_defaultdocdir}/libsamplerate0-dev/html/download.html
%{_defaultdocdir}/libsamplerate0-dev/html/faq.html
%{_defaultdocdir}/libsamplerate0-dev/html/history.html
%{_defaultdocdir}/libsamplerate0-dev/html/index.html
%{_defaultdocdir}/libsamplerate0-dev/html/license.html
%{_defaultdocdir}/libsamplerate0-dev/html/lists.html
%{_defaultdocdir}/libsamplerate0-dev/html/quality.html
%{_defaultdocdir}/libsamplerate0-dev/html/win32.html

%files gstsdrjfm
%defattr(-,root,root)
%{_libdir}/debug/usr/lib/gstreamer-1.0/libgstsdrjfm.so.debug
%{_libdir}/gstreamer-1.0/libgstsdrjfm.a
%{_libdir}/gstreamer-1.0/libgstsdrjfm.la
%{_libdir}/gstreamer-1.0/libgstsdrjfm.so

%files service
%defattr(-,root,root)
%{_libdir}/systemd/user/fmradioservice.service
%{_datadir}/dbus-1/services/com.jlr.fmradioservice.service
%{_bindir}/fmradioservice

