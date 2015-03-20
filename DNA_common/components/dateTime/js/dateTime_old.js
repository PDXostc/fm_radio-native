/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Provides functions for displaying and updating date/time element. 
 * Use following snippet to include component in your `index.html` file: 
 * 
 *     <script type='text/javascript' src='./common/components/dateTime/dateTime.js'></script>
 *     <link rel="stylesheet" href="./common/components/dateTime/dateTime.css" />
 *
 * and following code to initialize:
 *
 *     $("#clockElement").ClockPlugin('init',5);  // initialize clockElement, timer interval is set as 5 seconds 
 *     $("#clockElement").ClockPlugin('startTimer');  // start timer 
 *
 * @class Clock
 * @module CarTheme
 * @constructor
 *      
 **/
function Clock() {
}
/**
 * Contains actual time and date strings.
 * @property status
 * @type Object
 * @param {string} timeStr Holds actual time string.
 * @param {string} dateStr Holds actual date string.
 * @param {string} dayStr Holds actual day string.
 **/
Clock.prototype.status = {
	timeStr: null,
	dateStr: null,
	dayStr: null
};

/**
 * Listener for timer events.
 * @method handleTimerEv
 * @param clockSelector {string} Define clock selector in document.
 * @param dateSelector {string} Define date selector in document.
 **/
Clock.prototype.handleTimerEv = function (clockSelector, dateSelector) {
	"use strict";
	var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var ampm = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12;
	if (hour === 0) {
		hour = 12; // the hour '0' should be '12'
	}
	minute = minute < 10 ? '0' + minute : minute;
	hour = hour < 10 ? '0' + hour : hour;
	this.status.timeStr = hour + ":" + minute + " " + ampm;
	this.status.dateStr = monthsShort[date.getMonth().toString()].toUpperCase() + " " + date.getDate().toString();
	if (clockSelector !== null) {
		$(clockSelector).empty();
		$(clockSelector).append(this.status.timeStr);
	}
	if (dateSelector !== null) {
		$(dateSelector).empty();
		$(dateSelector).append(this.status.dateStr);
	}
};

(function ($) {
	"use strict";
	/**
	 * Provides functions for dateTime JQuery Plugin panel.
	 * @class ClockPlugin
	 * @static
	 **/
	var ClockPlugin = {
			/**
			 * Holds ID for clock document element.
			 * @property clockDiv
			 * @type string
			 * @default null
			 **/
			clockDiv: null,
			/**
			 * Holds ID for date document element.
			 * @property dateDiv
			 * @type string
			 * @default null
			 **/
			dateDiv: null,
			/**
			 * Holds timer for clock actualization interval.
			 * @property timer
			 * @type timer
			 * @default null
			 **/
			timer: null,
			/**
			 * Holds clock actualization interval in miliseconds.
			 * @property miliSeconds
			 * @type int
			 * @default 0
			 **/
			miliSeconds: 0,
			/**
			 * Holds Clock object after initialization.
			 * @property clockObj
			 * @type Object
			 * @default null
			 **/
			clockObj: null,
			/**
			 * Provides initialization of dateTime plugin.
			 * @method init
			 * @param seconds {int} Define clock actualization interval in seconds.
			 **/
			init: function (seconds) {
				this.empty();
				var appendText = '<div id="clock" class="clockElemnt fontSizeXLarge  fontColorDark fontWeightBold">TIME</div>';
				appendText += '<div id="date" class="dateElemnt fontSizeXLarge fontColorDark fontWeightBold">DATE</div>';
				this.append(appendText);
				ClockPlugin.clockDiv = "#clock";
				ClockPlugin.dateDiv = "#date";
				ClockPlugin.miliSeconds = seconds * 1000;
				ClockPlugin.clockObj = new Clock();
				ClockPlugin.clockObj.handleTimerEv(ClockPlugin.clockDiv, ClockPlugin.dateDiv);
			},
			/**
			 * Provides initialization of clock actualization timer.
			 * @method startTimer
			 **/
			startTimer: function () {
				ClockPlugin.timer = setInterval(function () {
					ClockPlugin.clockObj.handleTimerEv(ClockPlugin.clockDiv, ClockPlugin.dateDiv);
				}, ClockPlugin.miliSeconds);
			},
			/**
			 * Provides clearing of clock actualization timer.
			 * @method startTimer
			 **/
			stopTimer: function () {
				clearInterval(ClockPlugin.timer);
			}
		};
	/** 
	 * jQuery extension method for {{#crossLink "ClockPlugin"}}{{/crossLink}} plugin.
	 * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
	 * @method ClockPlugin
	 * @for jQuery
	 * @return Result of called method.
	 */
	$.fn.ClockPlugin = function (method) {
		// Method calling logic
		if (ClockPlugin[method]) {
			return ClockPlugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return ClockPlugin.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.ClockPlugin');
		}
	};
}(jQuery));
