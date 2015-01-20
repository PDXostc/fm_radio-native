#
/*
 *    Copyright (C)  2014
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
 *
 */

#ifndef __GUI
#define __GUI

#include	<sndfile.h>
#include	"fm-constants.h"
#include	"ringbuffer.h"
#include	"fft.h"
#include	"fir-filters.h"
class	keyPad;

class	fmProcessor;
class	rdsDecoder;
class	audioSink;
class	virtualInput;
/*
 *	The main gui object. It inherits from
 *	QDialog and the generated form
 */
class RadioInterface {
public:
		RadioInterface		();
		~RadioInterface		();

private:
	bool		doInit;
	int16_t		outputDevice;
	void		localConnects		(void);

	int32_t		inputRate;
	int32_t		fmRate;
	int32_t		workingRate;
	int32_t		audioRate;
	audioSink	*our_audioSink;
	virtualInput	*myRig;

	uint8_t		HFviewMode;
	uint8_t		inputMode;

	void		setDetectorScreen	(int16_t);

	int32_t		mapIncrement		(int32_t);
	int32_t		IncrementInterval	(int16_t);
	void		setTuner		(int32_t);
	int16_t		IncrementIndex;
	int32_t		autoIncrement_amount;
	int32_t		fmIncrement;
	int32_t		minLoopFrequency;
	int32_t		maxLoopFrequency;
	
	void		stopIncrementing	(void);
	int32_t		get_Increment_for	(int16_t);

	int32_t		Panel;
	int16_t		CurrentRig;

	bool		audioDumping;
	SNDFILE		*audiofilePointer;

	fmProcessor	*myFMprocessor;
	rdsDecoder	*myRdsDecoder;
	int8_t		rdsModus;

	void		IncrementFrequency	(int32_t);

	int32_t		currentPIcode;
	int32_t		frequencyforPICode;
	int16_t		logTime;
	FILE		*logFile;
	int8_t		latencyLevel;
	int8_t		runMode;

	void		showStrength		(void);
	bool		squelchMode;
/*
 *	The private slots link the GUI elements
 *	to the GUI code
 */
private:
	void	setStart		(void);
	void	clickPause		(void);
	void	setGainSelector		(int);

	void	setAttenuation		(int);

	void	setStreamOutSelector	(int);
	void	abortSystem		(int);
	void	TerminateProcess	(void);
	void	setVolume		(int);
	void	set_audioDump		(const std::string &);

	void	setfmMode		(const std::string &);
	void	setfmRdsSelector	(const std::string &);
	void	setfmDecoder		(const std::string &);
	void	setfmChannelSelector	(const std::string &);
	void	setfmDeemphasis		(const std::string &);

	void	autoIncrement_timeout	(void);
	void	autoIncrementButton	(void);
	void	autoDecrementButton	(void);
	void	set_fm_increment	(int);
	void	set_minimum		(int);
	void	set_maximum		(int);
	void	IncrementButton		(void);
	void	DecrementButton		(void);

	bool	setupSoundOut		(audioSink *,
	                                 int32_t, int16_t *);
	void	set_squelchValue	(int);
	void	set_squelchMode		(void);
	void	set_plusOne		(void);
	void	set_minusOne		(void);
public:
	void	newFrequency		(int);
	void	setCRCErrors		(int);
	void	setSyncErrors		(int);
	void	setbitErrorRate		(double);
	void	setGroup		(int);
	void	setPTYCode		(int);
	void	setPiCode		(int);
	void	clearStationLabel	(void);
	void	setStationLabel		(char *, int);
	void	clearRadioText		(void);
	void	setRadioText		(char *, int);
	void	setRDSisSynchronized	(bool);
	void	setMusicSpeechFlag	(int);
	void	clearMusicSpeechFlag	(void);
	void	scanresult		(void);
};

#endif

