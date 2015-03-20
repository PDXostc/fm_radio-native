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
 * @module CarTheme
 **/

(function ($) {
	"use strict";
	/**
	 * Class which provides UI and methods to operate with progress bar (e.g. Battery level in {{#crossLinkModule "DashboardApplication"}}{{/crossLinkModule}}).
	 * Progress bar displays values between 0-100%.
	 *
	 * Use following snippet to include component in your `index.html` file: 
	 *
	 *     <script type="text/javascript" src="./common/components/progressBar/progressBar.js"></script>
	 *     <link rel="stylesheet" href="./common/components/progressBar/progressBar.css" />
	 *
	 * and following code to initialize:
	 *
	 *     $("#progressBar").progressBarPlugin('init');
	 * 
	 * @class progressBarPlugin
	 * @static
	 */
	var progressBarPlugin = {
			/**
			 * Holds object of this JQuery object selector.
			 * @property thisSelector {Object}
			 */
			thisSelector: null,
			/**
			 * Holds value of position.
			 * @property position {Integer}
			 */
			position: null,
			/**
			 * Holds value of width.
			 * @property width {Integer}
			 */
			width: null,
			/**
			 * Holds status of animation.
			 * @property animCmpl {Boolean}
			 */
			animCmpl: null,
			/**
			 * Holds circle percent value.
			 * @property circleAddPer {Number}
			 */
			circleAddPer: null,
			/**
			 * Holds circle with value.
			 * @property circleWidth {Integer}
			 */
			circleWidth: null,
			/**
			 * Holds wrapper position value.
			 * @property wrapperPos {Integer}
			 */
			wrapperPos: null,
			/**
			 * Holds type of appearance.
			 * @property typeAppearance {String}
			 * @deprecated
			 */
			typeAppearance: "",
			/**
			 * Holds audio tag selector.
			 * @property audioSel {String}
			 * @deprecated
			 */
			audioSel: null,
			/** 
			 * Method initialize progress bar
			 * @method init			 
			 */
			init : function () {
				var appearance = "progressBar";
				progressBarPlugin.thisSelector = this;
				this.empty();
				var appendText;
				progressBarPlugin.typeAppearance = appearance;
				switch (appearance) {
				case "volumeControl":
					appendText = '<div id = "VCouter"  ontouchmove = \'$("#' + this[0].id + '").progressBarPlugin("touch", 0)\' onClick = \'$("#' + this[0].id + '").progressBarPlugin("touch", 1)\'>';
					appendText += '<div id = "VCbarWrapper">';
					appendText += '<div id = "VCicon"></div>';
					appendText += '<div id = "VCline" class =  "bgColorTheme"></div>';
					appendText += '<div id = "VCinner" class =  "bgColorTheme boxShadow3"></div>';
					appendText += '<div id = "VCcircle">';
					appendText += '</div>';
					appendText += '</div>';
					appendText += '</div>';
					break;

				case "progressBar":
					appendText = '<div id = "VCouter" ontouchmove = "VolumeControl.touch(0)" ontouchstart = "VolumeControl.touch(1)">' +
						'<div id = "VCbarWrapper">' +
						'<div id = "VCline" class =  "bgColorTheme"></div>' +
						'<div id = "VCinner" class = "bgColorTheme boxShadow3"></div>' +
						'</div>' +
						'</div>' +
						'</div>';
					break;

				default:
					break;
				}
				this.append(appendText);
				if (appearance === "progressBar") {
					$('#VCinner').css('height', '3px');
				}
				progressBarPlugin.width = this.width();
				progressBarPlugin.position = this.offset();
				progressBarPlugin.circleWidth = $('#VCcircle').width();
				$('#VCbarWrapper').css('width', (progressBarPlugin.width - 50) + 'px');
				progressBarPlugin.circleAddPer = (100 / (progressBarPlugin.width - 50)) * (progressBarPlugin.circleWidth / 2);
				progressBarPlugin.wrapperPos = $('#VCbarWrapper').position().left;

				if (progressBarPlugin.audioSel !== null) {
					$(progressBarPlugin.audioSel).get(0).volume = 0.5;
				}

				$('#VCinner').css('width', '50%');
				$('#VCcircle').css('left', (50 - (progressBarPlugin.circleAddPer)) + '%');
			},
			/** 
			 * Method sets progress bar position in percents.
			 * @method setPosition
			 * @param pos {Integer} Value of position in progress bar between 0 and 100.
			 */
			setPosition: function (pos) {
				var thisID = $(this).attr('id');
				$("#"+thisID+' #VCinner').css('width', pos + '%');
			},
			/** 
			 * Method sets volume control position.
			 * @method setVolume
			 * @deprecated
			 * @param vol {Integer} Value of position in volume control.
			 */
			setVolume: function (vol) {
				$('#VCinner').css('width', parseInt(vol, 10) + '%');
				$('#VCcircle').css('left', (parseInt(vol, 10) - (progressBarPlugin.circleAddPer)) + '%');
				if (progressBarPlugin.audioSel !== null) {
					$(progressBarPlugin.audioSel).get(0).volume = vol / 100;
				}
			},
			/** 
			 * Method sets audio selector.
			 * @method setAudioSelector
			 * @deprecated
			 * @param selector {String} Selector id of audio tag.
			 */
			setAudioSelector: function (selector) {
				progressBarPlugin.audioSel = selector;
			},
			/** 
			 * Method is called after touch event on volume control.
			 * @method touch
			 * @deprecated
			 * @param parm {Integer} Value 0 change position without animation, value 1 is for changing position with animation.
			 */
			touch: function (parm) {
				//console.log("touch " + window.event);
				var value = 0;
				var xPoint = window.event.clientX - progressBarPlugin.position.left;
				//console.log("xPoint " + progressBarPlugin.position.left);
				if ((xPoint > progressBarPlugin.wrapperPos) && (xPoint <= progressBarPlugin.width - progressBarPlugin.wrapperPos)) {
					value = (xPoint - progressBarPlugin.wrapperPos) / (progressBarPlugin.width - progressBarPlugin.wrapperPos * 2);
				}
				if (xPoint > progressBarPlugin.width - progressBarPlugin.wrapperPos) {
					value = 1;
				}
				//value = Math.round(value*Math.pow(10,2))/Math.pow(10,2);
				if (progressBarPlugin.audioSel !== null) {
					$(progressBarPlugin.audioSel).get(0).volume = value;
				}
				//console.log("value " + value);
				var dispVal = value * 100;
				if ((parm === 0) && progressBarPlugin.animCmpl) {
					$('#VCinner').stop();
					$('#VCinner').css('width', dispVal + '%');
					$('#VCcircle').css('left', (dispVal - progressBarPlugin.circleAddPer) + '%');
				}
				if (parm === 1) {
					progressBarPlugin.animCmpl = false;
					$('#VCinner').animate({width: (dispVal) + '%'}, 500, function () {progressBarPlugin.animCmpl = true; });
					$('#VCcircle').animate({left: ((dispVal - progressBarPlugin.circleAddPer)) + '%'}, 500, function () {progressBarPlugin.animCmpl = true; });
				}

				progressBarPlugin.thisSelector.trigger('volumeControlTouch', {position: dispVal});
				progressBarPlugin.thisSelector.trigger('progressBarTouch', {position: dispVal});
			}
		};
	/** 
	 * jQuery extension method for {{#crossLink "progressBarPlugin"}}{{/crossLink}} plugin.
	 * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
	 * @method progressBarPlugin
	 * @for jQuery
	 * @return Result of called method.
	 */
	$.fn.progressBarPlugin = function (method) {
		// Method calling logic
		if (progressBarPlugin[method]) {
			return progressBarPlugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return progressBarPlugin.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.progressBar');
		}
	};
}(jQuery));
