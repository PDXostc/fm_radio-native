#
/*
 *    Copyright (C) 2014
 *    Jan van Katwijk (J.vanKatwijk@gmail.com)
 *    Lazy Chair Programming
 *
 *    This file is part of the  SDR-J series.
 *    Many of the ideas as implemented in the SDR-J are derived from
 *    other work, made available through the (a) GNU general Public License. 
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
 *    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
#include	"fm-constants.h"
#include	"gui.h"
#include	"fm-processor.h"
#include	"fm-demodulator.h"
#include	"rds-decoder.h"
#include	"audiosink.h"
#include	"virtual-input.h"
#include	"dabstick-dll.h"

#ifdef __MINGW32__
#include	<iostream>
#include	<windows.h>
#endif
//
//	Processing modes
#define	IDLE		0100
#define	PAUSED		0101
#define	RUNNING		0102
#define	STOPPING	0103
//
//
static
int16_t	delayTable [] = {1, 3, 5, 7, 9, 10, 15};
#define delayTableSize	((int)(sizeof (delayTable) / sizeof (int16_t)))
/*
 *	We use the creation function merely to set up the
 *	user interface and make the connections between the
 *	gui elements and the handling agents. All real action
 *	is embedded in actions, initiated by gui buttons
 */
	RadioInterface::RadioInterface (): myFMprocessor(0) {
std::string h;
bool	success;
int32_t	startFreq;

	runMode			= IDLE;
	squelchMode		= false;
//
//	not used - other than as dummy parameters - in the "mini"
	this		-> audioRate	= 44100;

	if (audioRate == 22050) {
	   this -> inputRate = 48 * audioRate;
	   this -> fmRate    = 8 * audioRate;
	}
	else
	if (audioRate == 44100) {
	   this -> inputRate = 24 * audioRate;
	   this -> fmRate    = 4  * audioRate;
	}
	else {
	   audioRate = 48000;
	   fmRate    = 192000;
	   inputRate = 960000;
	}

	myRig = new dabstick_dll (inputRate, &success);
	
	if (!success) {
	  // FIXME: Need new method of error reporting
	   exit (1);
	}
	
	startFreq		= myRig	-> defaultFrequency	();
	setTuner (startFreq);

	myFMprocessor		= NULL;
	our_audioSink		= new audioSink (this -> audioRate);

//
	audioDumping		= false;
	audiofilePointer	= NULL;

	IncrementIndex		= 0;

//
//
	currentPIcode		= 0;
	frequencyforPICode	= 0;
	int16_t	thresHold	= 20;
//
//	The FM processor is currently shared with the
//	regular FM software, so lots on dummy parameters
	myFMprocessor	= new fmProcessor  (myRig,
	                                    this,
	                                    our_audioSink,
	                                    inputRate,
	                                    fmRate,
	                                    this -> audioRate,
	                                    thresHold);
	setStart();
}

	RadioInterface::~RadioInterface () {
	delete		our_audioSink;
	if (myFMprocessor != NULL)
	   delete myFMprocessor;
}

void	RadioInterface::newFrequency (int f) {
	stopIncrementing	();
	setTuner (f);
}
//
//	On start, we ensure that the streams are stopped so
//	that they can be restarted again.
void	RadioInterface::setStart	(void) {
bool	r = 0;

	if (runMode == RUNNING)
	   return;
//
//	always ensure that datastreams are stopped
	myRig		-> stopReader ();
	our_audioSink 	-> stop ();
//
	r = myRig		-> restartReader ();
	if (!r) {
	  // FIXME: Different notification method
	  /*
	   QMessageBox::warning (this, tr ("sdr"),
	                               tr ("Opening  input stream failed\n"));
	  */
	   return;
	}

	our_audioSink	-> restart ();

//	and finally: recall that starting overrules pausing
	runMode	= RUNNING;
}

void	RadioInterface::TerminateProcess (void) {
	runMode		= STOPPING;
	stopIncrementing	();
	if (audioDumping) {
	   our_audioSink	-> stopDumping ();
	   sf_close	(audiofilePointer);
	}
//
//	It is pretty important that no one is attempting to
//	set things within the FMprocessor when it is
//	being deleted. Correct order is
//	stop the Reader first
	myRig		-> stopReader ();
	usleep (100);
	myFMprocessor	-> stop ();
	
	//qDebug () <<  "Termination started";
}

void	RadioInterface::abortSystem (int d) {
	//qDebug ("aborting for reason %d\n", d);
}
//
//
void	RadioInterface::setGainSelector (int g) {
	myRig	-> setExternalGain (g);
}

void	RadioInterface::setfmChannelSelector (const std::string &s) {
uint8_t	channelSelector;

	if (s == "stereo")
	   channelSelector	= fmProcessor::S_STEREO;
	else
	if (s == "Left")
	   channelSelector	= fmProcessor::S_LEFT;
	else
	if (s == "Right")
	   channelSelector	= fmProcessor::S_RIGHT;
	else
	if (s == "Left+Right")
	   channelSelector	= fmProcessor::S_LEFTplusRIGHT;
	else
	if (s == "Left-Right")
	   channelSelector	= fmProcessor::S_LEFTminusRIGHT;
	else		// the default
	   channelSelector	= fmProcessor::S_LEFT;
	if (myFMprocessor != NULL)
	   myFMprocessor	-> setSoundMode	(channelSelector);
}

void	RadioInterface::setAttenuation (int n) {
	if (myFMprocessor != NULL)
	   myFMprocessor	-> setAttenuation (2 * n);
}
//	Increment frequency: with amount N, depending
//	on the mode of operation
//
int32_t 	RadioInterface::mapIncrement (int32_t n) {
	return n * 1000;
}
//
//	The generic setTuner.
void	RadioInterface::setTuner (int32_t n) {
	myRig		-> setVFOFrequency		(n);
	if (myFMprocessor != NULL)
	   myFMprocessor	-> resetRds	();
}

void	RadioInterface::set_plusOne	(void) {
	myRig	-> setVFOFrequency (myRig -> getVFOFrequency () + KHz (1));
}

void	RadioInterface::set_minusOne	(void) {
	myRig	-> setVFOFrequency (myRig -> getVFOFrequency () - KHz (1));
}

//
//===== code for auto increment/decrement
//	lots of code for something simple,

static inline
bool	frequencyInBounds (int32_t f, int32_t l, int32_t u) {
	return l <= f && f <= u;
}

int32_t	RadioInterface::IncrementInterval (int16_t index) {
	if (index < 0)
	   index = - index;

	if (index == 0)
	   index = 1;
	if (index >= delayTableSize)
	   index = delayTableSize;

	return 1000 * delayTable [index - 1];
}

//
void	RadioInterface::autoIncrement_timeout (void) {
int32_t	amount;
int32_t	frequency;
int32_t	low, high;

	low	= KHz (minLoopFrequency);
	high	= KHz (maxLoopFrequency);
	amount	=  fmIncrement;
	if (IncrementIndex < 0)
	   amount = - amount;
//
	frequency	= myRig -> getVFOFrequency () + KHz (amount);

	if ((IncrementIndex < 0) &&
	   !frequencyInBounds (frequency, low, high))
	   frequency = high;

	if ((IncrementIndex > 0) &&
	   !frequencyInBounds (frequency, low, high))
	   frequency = low;

	setTuner (frequency);
	//autoIncrementTimer	-> start (IncrementInterval (IncrementIndex));
	myFMprocessor	-> startScanning ();
}

void	RadioInterface::scanresult	(void) {
	stopIncrementing ();
}
//
//	stopIncrementing is called from various places to
//	just interrupt the autoincrementing
void	RadioInterface::stopIncrementing (void) {
        //set_incrementFlag (0);

	//if (autoIncrementTimer	-> isActive ())
	//autoIncrementTimer -> stop ();

	IncrementIndex = 0;
	myFMprocessor	-> stopScanning ();
}

void	RadioInterface::autoIncrementButton (void) {

  //if (autoIncrementTimer	-> isActive ())
  //autoIncrementTimer -> stop ();

	if (++IncrementIndex > delayTableSize)
	   IncrementIndex = delayTableSize;

	if (IncrementIndex == 0) {
		//set_incrementFlag (0);
	   return;
	}
//
	//autoIncrementTimer	-> start (IncrementInterval (IncrementIndex));
	//set_incrementFlag (IncrementIndex);
}

void	RadioInterface::autoDecrementButton (void) {
	//if (autoIncrementTimer	-> isActive ())
	//autoIncrementTimer -> stop ();

	if (--IncrementIndex < - delayTableSize)
	   IncrementIndex = - delayTableSize;

	if (IncrementIndex == 0) {
		//set_incrementFlag (0);
	   return;
	}
//
	//autoIncrementTimer	-> start (IncrementInterval (IncrementIndex));
	//set_incrementFlag (IncrementIndex);
}

void	RadioInterface::set_fm_increment (int v) {
	fmIncrement	= v;		// in Khz
}
//
//	min and max frequencies are specified in Mhz
void	RadioInterface::set_minimum	(int f) {
	   minLoopFrequency	= Khz (f);
}

void	RadioInterface::set_maximum	(int f) {
	   maxLoopFrequency	= Khz (f);
}

void	RadioInterface::IncrementButton (void) {
	stopIncrementing ();
	setTuner (myRig -> getVFOFrequency () + Khz (fmIncrement));
}

void	RadioInterface::DecrementButton (void) {
	stopIncrementing ();
	setTuner (myRig -> getVFOFrequency () - Khz (fmIncrement));
}
//

//	Deemphasis	= 50 usec (3183 Hz, Europe)
//	Deemphasis	= 75 usec (2122 Hz US)
void	RadioInterface::setfmDeemphasis	(const std::string& s) {
	if (myFMprocessor == NULL)
	   return;
	if (s == "50")
	   myFMprocessor	-> setDeemphasis (50);
	else
	if (s == "75")
	   myFMprocessor	-> setDeemphasis (75);
	else
	   myFMprocessor	-> setDeemphasis (1);
}

void	RadioInterface::setVolume (int v) {
	if (myFMprocessor != NULL)
	   myFMprocessor	-> setVolume ((int16_t)v);
}
//

void	RadioInterface::setCRCErrors	(int n) {
//	crcErrors	-> display (n);
	(void)n;
}

void	RadioInterface::setSyncErrors	(int n) {
//	syncErrors	-> display (n);
	(void)n;
}

void	RadioInterface::setbitErrorRate	(double v) {
//	bitErrorRate	-> display (v);
	(void)v;
}

void	RadioInterface::setGroup	(int n) {
	(void)n;
//	rdsGroupDisplay	-> display (n);
}

void	RadioInterface::setPTYCode	(int n) {
	(void)n;
//	rdsPTYDisplay	-> display (n);
}

void	RadioInterface::setPiCode	(int n) {
int32_t	t	= myRig -> getVFOFrequency ();

	if ((frequencyforPICode != t) || (n != 0)) {
	   currentPIcode	= n;
	   frequencyforPICode = t;
	}
}

void	RadioInterface::setfmMode (const std::string &s) {
	myFMprocessor	-> setfmMode (s == "stereo");
}

void	RadioInterface::setfmRdsSelector (const std::string &s) {
	rdsModus = (s == "rds 1" ? rdsDecoder::RDS1 :
	            s == "rds 2" ? rdsDecoder::RDS2 : 
	            rdsDecoder::NO_RDS);
	myFMprocessor	-> setfmRdsSelector (rdsModus);
}

void	RadioInterface::setfmDecoder (const std::string &s) {
int8_t	decoder	= 0;

	if (s == "fm1decoder")
	   decoder = fm_Demodulator::FM1DECODER;
	else
	if (s == "fm2decoder")
	   decoder = fm_Demodulator::FM2DECODER;
	else
	if (s == "fm3decoder")
	   decoder = fm_Demodulator::FM3DECODER;
	else
	if (s == "fm4decoder")
	   decoder = fm_Demodulator::FM4DECODER;
	else
	   decoder = fm_Demodulator::FM5DECODER;

	myFMprocessor	-> setFMdecoder (decoder);
}

////////////////////////////////////////////////////////////////////

void	RadioInterface::set_squelchMode	(void) {
	if (myFMprocessor == NULL)
	   return;
	squelchMode = !squelchMode;
	myFMprocessor -> set_squelchMode (squelchMode);
}

void	RadioInterface::set_squelchValue (int n) {
	if (myFMprocessor != NULL)
	   myFMprocessor -> set_squelchValue (n);
}

void	RadioInterface::set_audioDump (const std::string &file) {
SF_INFO	*sf_info	= (SF_INFO *)alloca (sizeof (SF_INFO));

	if (audioDumping) {
	   our_audioSink	-> stopDumping ();
	   sf_close (audiofilePointer);
	   audioDumping = false;
	   return;
	}

	sf_info		-> samplerate	= this -> audioRate;
	sf_info		-> channels	= 2;
	sf_info		-> format	= SF_FORMAT_WAV | SF_FORMAT_PCM_24;

	audiofilePointer	= sf_open (file.c_str(),
	                                   SFM_WRITE, sf_info);
	if (audiofilePointer == NULL) {
		//qDebug () << "Cannot open " << file. toLatin1 (). data ();
	   return;
	}

	audioDumping		= true;
	our_audioSink		-> startDumping (audiofilePointer);
}

