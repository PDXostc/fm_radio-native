EXTRA_DIST = fmradioservice.service.in com.jlr.fmradioservice.service

fmradioservice.service : fmradioservice.service.in
	$(AM_V_GEN)$(SED) \
		-e 's|@bindir[@]|$(bindir)|g' \
		$< > $@

all-local : fmradioservice.service 

install-data-local:
	$(INSTALL) fmradioservice.service $(SYSTEMD_USER_SERVICE_PATH)/
	$(INSTALL) com.jlr.fmradioservice.service $(DBUS_SESSION_SERVICE_PATH)
	
CLEANFILES = fmradioservice.service


