
include ../Makefile.in

INCLUDE_PATH:= $(INCLUDE_PATH)  \
	-I../src \
	-I../../common/src \
	-I../../include 

LIB_PATH=-L../../lib
LIBS=-lwkb_client -lstdc++

CFLAGS:=$(CFLAGS) \
	-g -Wall -std=c++11 \
	$(INCLUDE_PATH) \
	$(LIB_PATH) \
	$(LIBS)

TESTS=api


all : $(TESTS)

clean :
	rm -f $(TESTS) *.o

api : api.o 
	$(CC) $(CFLAGS) $^ -o $@

.cpp.o:
	$(CC) $(INCLUDE_PATH) $(CFLAGS) $(CXXFLAGS) -c $< -o $@

