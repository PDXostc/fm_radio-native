
all: lib themes

install: 
	make -C src install
	make -C themes install

lib: 
	make -C src

themes:
	make -C themes

clean:
	make -C src clean
	make -C ut clean

test: api

api:
	make -C ut api


.PHONY: all prepare clean

