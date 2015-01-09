/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/** 
 * @module MultimediaPlayerApplication
 */
(function ($) {
	"use strict";
	/**
	 * Class which provides methods to fill content of spectrum analyzer for JQuery plugin.
	 * @class SpectrumAnalyzerObj
	 * @static
	 */
	var SpectrumAnalyzerObj = {
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar1 {Integer}
			 */
			bar1 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar2 {Integer}
			 */
			bar2 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar3 {Integer}
			 */
			bar3 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar4 {Integer}
			 */
			bar4 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar5 {Integer}
			 */
			bar5 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar6 {Integer}
			 */
			bar6 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar7 {Integer}
			 */
			bar7 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar8 {Integer}
			 */
			bar8 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar9 {Integer}
			 */
			bar9 : 0,
			/**
			 * Holds value of spectrum analyzer bar.
			 * @property bar10 {Integer}
			 */
			bar10 : 0,
			/** 
			 * Method provides randomization for spectrum analyzer bars.
			 * @method spectrumAnalyzerRandomize
			 */
			spectrumAnalyzerRandomize : function () {
				SpectrumAnalyzerObj.bar1 = Math.floor((Math.random() *  6) + 1);
				SpectrumAnalyzerObj.bar2 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar3 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar4 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar5 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar6 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar7 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar8 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar9 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.bar10 = Math.floor((Math.random() * 6) + 1);
				SpectrumAnalyzerObj.showSpectrumAnalyzer(this);
			},
			/** 
			 * Method provides randomization for spectrum analyzer bars.
			 * @method showSpectrumAnalyzer
			 * @param thisObj {Object} Object which contains current object of this JQuery plugin.
			 */
			showSpectrumAnalyzer : function (thisObj) {
				var bar1Count, bar2Count, bar3Count, bar4Count, bar5Count, bar6Count, bar7Count, bar8Count, bar9Count, bar10Count, bottom, i;
				bar1Count = 2 * SpectrumAnalyzerObj.bar1;
				bar2Count = 2 * SpectrumAnalyzerObj.bar2;
				bar3Count = 2 * SpectrumAnalyzerObj.bar3;
				bar4Count = 2 * SpectrumAnalyzerObj.bar4;
				bar5Count = 2 * SpectrumAnalyzerObj.bar5;
				bar6Count = 2 * SpectrumAnalyzerObj.bar6;
				bar7Count = 2 * SpectrumAnalyzerObj.bar7;
				bar8Count = 2 * SpectrumAnalyzerObj.bar8;
				bar9Count = 2 * SpectrumAnalyzerObj.bar9;
				bar10Count = 2 * SpectrumAnalyzerObj.bar10;
				if (bar1Count  > 12) {
					bar1Count = 12;
				}
				if (bar2Count  > 12) {
					bar2Count = 12;
				}
				if (bar3Count  > 12) {
					bar3Count = 12;
				}
				if (bar4Count  > 12) {
					bar4Count = 12;
				}
				if (bar5Count  > 12) {
					bar5Count = 12;
				}
				if (bar6Count  > 12) {
					bar6Count = 12;
				}
				if (bar7Count  > 12) {
					bar7Count = 12;
				}
				if (bar8Count  > 12) {
					bar8Count = 12;
				}
				if (bar9Count  > 12) {
					bar9Count = 12;
				}
				if (bar10Count  > 12) {
					bar10Count = 12;
				}
				thisObj.empty();
				bottom = 0;
				for (i = 0; i < bar1Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar1" class="bar1Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar1" class="bar1Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar2Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar2" class="bar2Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar2" class="bar2Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar3Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar3" class="bar3Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar3" class="bar3Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar4Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar4" class="bar4Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar4" class="bar4Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar5Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar5" class="bar5Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar5" class="bar5Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar6Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar6" class="bar6Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar6" class="bar6Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar7Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar7" class="bar7Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar7" class="bar7Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar8Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar8" class="bar8Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar8" class="bar8Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar9Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar9" class="bar9Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar9" class="bar9Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
				bottom = 0;
				for (i = 0; i < bar10Count; i++) {
					bottom = bottom + 5;
					if ((i % 2) === 0) {
						thisObj.append('<div id="bar10" class="bar10Class barAnalyzer" style="bottom:' + bottom + 'px;"></div>');
					} else {
						thisObj.append('<div id="bar10" class="bar10Class barAnalyzer bgColorTheme boxShadow1" style="bottom:' + bottom + 'px;"></div>');
					}
				}
			},
			/** 
			 * Method provides clear for spectrum analyzer bars.
			 * @method clearSpectrumAnalyzer
			 */
			clearSpectrumAnalyzer : function () {
				SpectrumAnalyzerObj.bar1 = 0;
				SpectrumAnalyzerObj.bar2 = 0;
				SpectrumAnalyzerObj.bar3 = 0;
				SpectrumAnalyzerObj.bar4 = 0;
				SpectrumAnalyzerObj.bar5 = 0;
				SpectrumAnalyzerObj.bar6 = 0;
				SpectrumAnalyzerObj.bar7 = 0;
				SpectrumAnalyzerObj.bar8 = 0;
				SpectrumAnalyzerObj.bar9 = 0;
				SpectrumAnalyzerObj.bar10 = 0;
				SpectrumAnalyzerObj.showSpectrumAnalyzer(this);
			}
		};
	/** 
	 * Class which provides acces to SpectrumAnalyzerObj methods.
	 * @class spectrumAnalyzer
	 * @constructor
	 * @param method {Object} Identificator (name) of method.
	 * @return Result of called method.
	 */
	$.fn.spectrumAnalyzer = function (method) {
		// Method calling logic
		if (SpectrumAnalyzerObj[method]) {
			return SpectrumAnalyzerObj[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return SpectrumAnalyzerObj.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.spectrumAnalyzerAPI');
		}
	};
}(jQuery));
