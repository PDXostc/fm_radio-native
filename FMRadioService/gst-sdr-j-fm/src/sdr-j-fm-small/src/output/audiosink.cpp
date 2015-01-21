#
/*
 *    Copyright (C) 2011, 2012, 2013
 *    Jan van Katwijk (J.vanKatwijk@gmail.com)
 *    Lazy Chair Programming
 *
 *    This file is part of the SDR-J.
 *    Many of the ideas as implemented in SDR-J are derived from
 *    other work, made available through the GNU general Public License. 
 *    All copyrights of the original authors are recognized.
 *
 *    SDR-J is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation; either version 2 of the License, or
 *    (at your option) any later version.
 *
 *    SDR-J is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with SDR-J; if not, write to the Free Software
 *    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

#include	"audiosink.h"
#include	<stdexcept>
#include	<iostream>
/*
 *	The class is the sink for the data generated
 */
	audioSink::audioSink	() {
	_O_Buffer		= new RingBuffer<float>(2 * 32768);
}

	audioSink::~audioSink	(void) {
	delete	_O_Buffer;
}

//
//	helper
static std::string now()
{
  time_t t( time(NULL) );
  struct tm *nw( localtime(&t) );

  char str[32];
  strftime(str, sizeof(str), "%F %T", nw);
  return str;
}

static inline
int32_t	minimum (int32_t a, int32_t b) {
	return a > b ? b : a;
}
//
//	Just for my own curiosity I want to know to what degree
//	the buffer is filled
int32_t	audioSink::capacity	(void) {
	return _O_Buffer -> GetRingBufferWriteAvailable () / 2;
}
//
//	putSample output comes from the FM receiver

int32_t	audioSink::putSample	(DSPCOMPLEX v) {
	return putSamples (&v, 1);
}

int32_t	audioSink::putSamples		(DSPCOMPLEX *V, int32_t n) {
float	*buffer = (float *)alloca (2 * n * sizeof (float));
int32_t	i;
int32_t	available = _O_Buffer -> GetRingBufferWriteAvailable ();

	if (2 * n > available)
	   n = (available / 2) & ~01;
	for (i = 0; i < n; i ++) {
	   buffer [2 * i] = real (V [i]);
	   buffer [2 * i + 1] = imag (V [i]);
	}

	//std::cerr << now() << " writing 2*" << n << " samples to ringbuffer with "
	//<< available << " available space" << std::endl;

	_O_Buffer	-> putDataIntoBuffer (buffer, 2 * n);
	return n;
}

uint32_t audioSink::getSamples (DSPFLOAT *data, uint32_t count)
{
	   return _O_Buffer -> getDataFromBuffer (data, 2 * count);
}
