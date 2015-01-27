Name:       agl-plugins
Summary:    A collection of IVI software
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

# External deps requirements
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
BuildRequires:  libusb-devel

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

%global plugin_list extension_common BoilerPlateExtension wkb_client_ext FMRadioExtension
%global FMRADIOSERVICE_PATH "FMRadioService"

%description
A collection of IVI software

%package service
Summary: FMRadioService dbus service
Group: Applications/System
%description service
FMRadioService dbus-daemon

%prep
%setup -q -n %{name}-%{version}
#rpmbuild --rebuild FMRadioService/deps/shadow-utils-4.1.5.1-17.fc21.src.rpm
#rpmbuild --rebuild FMRadioService/deps/rtl-sdr-0.5.3-3.src.rpm
#rpm -ivh ${HOME}/rpmbuild/RPMS/i586/rtl-sdr-0.5.3-3.*.rpm

%build
# Build rtl-sdr CMAKE project
# rpm projects are... picky to build with .spec files (!)
AGL_ROOT=`pwd`
FMRADIOSERVICE_PATH=${AGL_ROOT}/FMRadioService
RTLSDR_PATH=${FMRADIOSERVICE_PATH}/deps/rtl-sdr

# First autotool project FMRadioService needs to be autogen'ed
cd ${FMRADIOSERVICE_PATH}
./autogen.sh

cd ${RTLSDR_PATH}
rm -fR build
mkdir build
cd build
cmake .. -DCMAKE_C_FLAGS:STRING="%{optflags}" -DCMAKE_INSTALL_PREFIX=%{_prefix}
make
RTLSDR_LIBPATH=${RTLSDR_PATH}/src
cd ${AGL_ROOT}

# Now build autotool-like FMRadioService and pull the previously built dependencies
cd ${FMRADIOSERVICE_PATH}
LD_LIBRARY_PATH=${RTLSDR_LIBPATH} RS_CFLAGS="-I/${RTLSDR_PATH}/include" RS_LIBS=/${RTLSDR_LIBPATH}/librtlsdr.so ./configure --prefix=%{_prefix}
make

cd ${AGL_ROOT}

# Build the xwalk extension plugins
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

