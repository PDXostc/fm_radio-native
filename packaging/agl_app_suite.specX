Name:       HomeScreen	
Summary:    A HTML Home Screen application
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2
#BuildRequires:  common
BuildRequires:  zip
BuildRequires:  desktop-file-utils
Requires:  speech-recognition
Requires:   wrt-installer
Requires:   wrt-plugins-ivi

%description
A proof of concept pure html5 UI

%prep
%setup -q -n %{name}-%{version}

%build
cd HomeScreen
make

%install
rm -rf %{buildroot}
cd HomeScreen
%make_install

#%post
#if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
#    wrt-installer -i /opt/usr/apps/.preinstallWidgets/HomeScreen.wgt;
#fi

#%postun
#    wrt-installer -un intelPoc10.HomeScreen

%files
%defattr(-,app,app,-)
/opt/usr/apps/.preinstallWiggets/HomeScreen.wgt

