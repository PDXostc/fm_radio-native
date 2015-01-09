Name:       agl_plugin_suite	
Summary:    A collection of IVI software
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

BuildRequires:  python
BuildRequires:  desktop-file-utils

Requires:       ibus
Requires:       ibus-hangul
Requires:       ibus-libpinyin


%global plugin_list BoilerPlateExtension 

%description
A collection of IVI software

%prep

%setup -q -n %{name}-%{version}

%build
for plugin in %{plugin_list}; do
    make -C ${plugin}
done

%install
for plugin in %{plugin_list}; do
    make -C ${plugin} install DESTDIR=%{buildroot} PREFIX=%{_prefix}
done


%files
%{_prefix}/lib/tizen-extensions-crosswalk/libbp.so

