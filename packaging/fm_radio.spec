Name:       fm_radio
Summary:    A Radio Application for IVI software
Version:    0.0.1
Release:    2
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2
#BuildRequires:  common
BuildRequires:  zip
BuildRequires:  desktop-file-utils

Requires: pkgmgr
Requires: crosswalk
Requires: tizen-extensions-crosswalk
Requires: pkgmgr-server
Requires: model-config-ivi
Requires: tizen-middleware-units
Requires: tizen-platform-config
Requires: agl_app_suite
Requires: fm_radio-plugins

%global app_list DNA_FMRadio
%global app_id_list cciaaojcnnbbpfioidejhigcboenjmmg kmmeobdkikjechfejkakmfmfgjldjkco gnipnignbkkkjeglidcdnedabpekbiah

%description
A Radio Application for IVI software

%prep

%setup -q -n %{name}-%{version}

%build
for app in %{app_list}; do
    make -C ${app}
done

%install
make -C DNA_FMRadio "OBS=1" install_obs DESTDIR="%{?buildroot}"

%post
su app -c "pkgcmd -i -t wgt -p /opt/usr/apps/.preinstallWidgets/DNA_FMRadio -q"

%postun
su app -c "pkgcmd -u -n JLRPOCX004.DNA_FMRadio -q"

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/DNA_FMRadio.wgt

