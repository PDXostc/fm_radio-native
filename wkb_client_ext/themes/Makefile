
themes=blue green amber

all: $(themes)
	$(foreach theme,$(themes), make -C $(theme);)

clean:
	rm -f *~
	$(foreach theme,$(themes), make -C $(theme) clean;)

install:
	$(foreach theme,$(themes), make -C $(theme) install;)
	install -D wkb $(DESTDIR)$(PREFIX)/share/X11/xkb/symbols/wkb

.PHONE: all clean install
