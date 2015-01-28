Name:       agl-plugins
Summary:    A collection of IVI software
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

# External requirements to build deps
BuildRequires:  python
BuildRequires:  desktop-file-utils
BuildRequires:  rpmbuild
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
Requires:       gstreamer-1.0
Requires:       gstreamer-base-1.0
Requires:       gstreamer-audio-1.0
Requires:       dbus-glib-1
Requires:       dbus-1
Requires:       glib-2.0
Requires:       libusb
Requires:       libsndfile

%global plugin_list extension_common BoilerPlateExtension wkb_client_ext FMRadioExtension
%global deps_list rtl-sdr fftw-3.3.4 libsamplerate-0.1.8

%description
A collection of IVI software

%package service
Summary: FMRadioService dbus service
Group: Applications/System
%description service
FMRadioService dbus-daemon

%prep
%setup -q -n %{name}-%{version}

%build
# Build rtl-sdr CMAKE project
AGL_ROOT=`pwd`
FMRADIOSERVICE_PATH=${AGL_ROOT}/FMRadioService
RTLSDR_PATH=${FMRADIOSERVICE_PATH}/deps/rtl-sdr
LIBSAMPLERATE_PATH=${FMRADIOSERVICE_PATH}/deps/libsamplerate-0.1.8
FFTW3_PATH=${FMRADIOSERVICE_PATH}/deps/fftw-3.3.4

# First autotool project FMRadioService needs to be autogen'ed
cd ${FMRADIOSERVICE_PATH}
./autogen.sh

# uncompress the deps
cd ${FMRADIOSERVICE_PATH}/deps
for files in %{deps_list}; do
	tar -xvf ${files}.tar.gz
done

# Build RTLSDR dep
cd ${RTLSDR_PATH}
rm -fR build
mkdir build
cd build
cmake .. -DCMAKE_C_FLAGS:STRING="%{optflags}" -DCMAKE_INSTALL_PREFIX=%{_prefix}
make
RTLSDR_LIBS="${RTLSDR_PATH}/src/librtlsdr.so"
RTLSDR_INCLUDES="-I/${RTLSDR_PATH}/include"
cd ${AGL_ROOT}

# Build FFTW dep
cd ${FFTW3_PATH}
./configure --prefix=%{_prefix} --enable-single --enable-shared
make
FFTW3_LIBS="${FFTW3_PATH}/.libs/libfftw3f.so"
FFTW3_INCLUDES="-I/${FFTW3_PATH}/api"
cd ${AGL_ROOT}

# Build LIBSAMPLERATE dep
cd ${LIBSAMPLERATE_PATH}
#FFTW3_CFLAGS=${FFTW3_INCLUDES} FFTW3_LIBS=${FFTW3_LIBS} ./configure --prefix=%{_prefix}
./configure --prefix=%{_prefix}
make
LIBSAMPLERATE_LIBS="${LIBSAMPLERATE_PATH}/src/.libs/libsamplerate.so"
LIBSAMPLERATE_INCLUDES="-I/${LIBSAMPLERATE_PATH}/src"
cd ${AGL_ROOT}

# Now build autotool-like FMRadioService and pull the previously built dependencies
cd ${FMRADIOSERVICE_PATH}
LD_LIBRARY_PATH=${RTLSDR_LIBPATH} RS_CFLAGS=${RTLSDR_INCLUDES} RS_LIBS=${RTLSDR_LIBS} SR_CFLAGS=${LIBSAMPLERATE_INCLUDES} SR_LIBS=${LIBSAMPLERATE_LIBS} FFTW_CFLAGS=${FFTW3_INCLUDES} FFTW_LIBS=${FFTW3_LIBS} ./configure --prefix=%{_prefix}
make
cd ${AGL_ROOT}

# Build all the xwalk extension plugins
for folder in %{plugin_list}; do
	make -C ${folder}
done

%install
# manually add those paths that we are going to install
mkdir -p %{buildroot}/usr/lib/systemd/user
mkdir -p %{buildroot}/usr/share/dbus-1/services
for folder in %{plugin_list}; do
    make -C ${folder} install DESTDIR=%{buildroot} PREFIX=%{_prefix}
done

%files
%{_prefix}/lib/tizen-extensions-crosswalk/libbp.so
%{_prefix}/lib/tizen-extensions-crosswalk/libwkb_client.so
%{_prefix}/lib/tizen-extensions-crosswalk/lib_fmradio.so
%{_prefix}/share/X11/xkb/symbols/wkb
%{_prefix}/local/sbin/kb_inst
%{_prefix}/share/weekeyboard/blue_1080.edj
%{_prefix}/share/weekeyboard/blue_720.edj
%{_prefix}/share/weekeyboard/blue_600.edj
%{_prefix}/share/weekeyboard/green_1080.edj
%{_prefix}/share/weekeyboard/green_720.edj
%{_prefix}/share/weekeyboard/green_600.edj
%{_prefix}/share/weekeyboard/amber_1080.edj
%{_prefix}/share/weekeyboard/amber_720.edj
%{_prefix}/share/weekeyboard/amber_600.edj

%files service
%{_prefix}/lib/systemd/user/fmradioservice.service
%{_prefix}/share/dbus-1/services/com.jlr.fmradioservice.service
%{_prefix}/bin/fmradioservice

