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

/* global launchApplication, getAppByID, acceptCall*/

var IncomingTemplateHTML = "DNA_common/components/incomingCall/incomingCall.html";
/**
 * @module CarTheme
 */
var IncomingCall = function() {
	"use strict";
	/** 
	 * Class provides accept/deny for incoming call dialog in every widget. This component is usually initialized by {{#crossLink "Bootstrap"}}{{/crossLink}} class
     * and can be later accessed using {{#crossLink "Bootstrap/incomingCall:property"}}{{/crossLink}} property.
     *
     * Component uses [tizen.phone API]() to perform phone operations and 
     * [Tizen Application API](https://developer.tizen.org/dev-guide/2.2.0/org.tizen.web.device.apireference/tizen/application.html) to launch external application.
     *
     * This class requires following components:
	 *	 
	 * * {{#crossLink "BoxCaption"}}{{/crossLink}} component
	 * 
	 * @class IncomingCall
	 * @constructor
	 */
	var self = this;
	if (typeof(tizen) !== 'undefined' && tizen.phone) {
		console.log("tizen.phone.addCallChangedListener created");
		tizen.phone.addCallChangedListener(this.onCallChange);
	}
	includeHTML(IncomingTemplateHTML, 
	function(linkobj) {
		console.log("loaded incomingCall.html",linkobj,linkobj.path[0].import);
		var localimport = linkobj.path[0].import;
		self.incomingCallHTML = localimport.getElementById('incomingCall');
		$("body").append(self.incomingCallHTML);
		$("#incomingCall .TopPanelTitle").boxCaptionPlugin('init', "Incoming Call");
	}, 
		function(linkobj) {
		console.log("load incomingCall.html failed");
		console.log(linkobj);
	});
	/*
	if (!$("#incomingCall").length) {
		var appendHtml = '<div id="incomingCall" class="incomingCall incomingCallHide ">';
		var background = '<div class = "pageBgColorNormalTransparent" style ="width:100%; height: 100%"></div>';
		var tabs = '<div id = "incomingCallTopPanel" class="tabsTopPanel"></div>';
		tabs += '<div id = "incomingCallTabs" class="tabsTab"></div>';
		tabs += '<div id ="incomingCallTitle" class="TopPanelTitle"></div>';
		var callbox = '<div class = "callInfoBox">';
		callbox += '<div class = "callPhotoBox noContactPhoto">';
		callbox += '<img id = "incomingCallPhoto" class="callPhoto"></div>';
		callbox += '</div>';
		callbox += '<div id = "incomingCallName" class="callName fontSizeXLarge fontWeightBold fontColorNormal">unknown</div>';
		callbox += '<div id = "incomingCallNumber" class="callNumber fontSizeXLarge fontWeightBold fontColorTheme">unknown</div>';
		//callbox += '</div>';

		var buttons = '<div id="incomingCallAccept" class="incomingCallAccept button callButton callingFalse boxShadow4Active" onClick = "bootstrap.incomingCall.acceptIncommingCall()"></div>';
		buttons += '<div id="incomingCallDeny" class="incomingCallDeny button callButton callingTrue boxShadow4Active" onClick = "bootstrap.incomingCall.denyCall()"></div>';

		appendHtml += background + tabs + callbox + buttons;
		appendHtml += '</div></div>';
		//$(appendHtml).appendTo("body");
		//document.getElementsByTagName("body")[0].appendChild(self.incomingCallHTML)
		//$("body").append(this.incomingCallHTML);
		//$("#incomingCall .TopPanelTitle").boxCaptionPlugin('init', "Incoming Call");
	}*/
};
/** 
 * Method shows incoming call dialog.
 * @method show
 * @param  contact {contact} Contact data from phone.
 */
IncomingCall.prototype.onCallChange = function(result) {
	console.log("tizen.phone.addCallChangedListener callback");
	/* global getAppByID */
	var appId = getAppByID('JLRPOCX031.Phone');

	var contact;
	if (!!result.contact.name) {
		contact = result.contact;
	} else {
		contact = {
			phoneNumbers: [{
				/* jshint camelcase: false */
				number: tizen.phone.activeCall.line_id
				/* jshint camelcase: true */
			}]

		};
	}

	console.log("incomingCall.js result.state=",result);
	switch (result.state.toLowerCase()) {
		case "DISCONNECTED".toLowerCase():
			try {
				this.denyCall();
			}
			catch(err) {
			}
			Configuration.set("acceptedCall", "false");
			break;
		case "ACTIVE".toLowerCase():
			if (Configuration._values.acceptedCall !== "true") {
				this.acceptIncommingCall();
				Configuration.set("acceptedCall", "true");
			}
			break;
		case "DIALING".toLowerCase():
			if (!appId.running) {
				/*global launchApplication*/
				launchApplication('intelPoc15.Phone');
			}
			break;
		case "INCOMING".toLowerCase():
			AnswerIncomingCall.show(contact);
			break;
	}
};
	

/** 
 * Method shows incoming call dialog.
 * @method show
 * @param  contact {contact} Contact data from phone.
 */
IncomingCall.prototype.show = function(contact) {
	"use strict";
	if (contact) {
		if (contact.name) {
			var name = contact.name.firstName || "";
			name += contact.name.lastName ? " " + contact.name.lastName : "";
			$("#incomingCallName").html(name);
		}

		if (contact.phoneNumbers) {
			$("#incomingCallNumber").html(contact.phoneNumbers[0] && contact.phoneNumbers[0].number ? contact.phoneNumbers[0].number : "");
		}

		if (contact.photoURI) {
			$("#incomingCallPhoto").attr("src", contact.photoURI);
		}
	}
	if ($("#incomingCall").hasClass('incomingCallHide')) {
		$("#incomingCall").removeClass('incomingCallHide');
		$("#incomingCall").addClass("incomingCallShow");
	}
};
/** 
 * Method hides incoming call dialog.
 * @method hide
 */
IncomingCall.prototype.hide = function() {
	"use strict";
	if ($("#incomingCall").hasClass('incomingCallShow')) {
		$("#incomingCall").removeClass('incomingCallShow');
		$("#incomingCall").addClass("incomingCallHide");
	}
};
/** 
 * Method accepts incoming call. If application where call is accepted isn't Phone application (`intelPoc15.Phone`), then launches Phone application. 
 * If apllication where call is accepted is Phone application (`intelPoc15.Phone`), call {{#crossLink "Phone/acceptCall:method"}}{{/crossLink}} method.
 * @method acceptIncommingCall
 */
IncomingCall.prototype.acceptIncommingCall = function() {
	"use strict";
	/* todo add call to phone application */
	this.hide();
	var appId = getAppByID('JLRPOCX031.Phone');
	/* if app isn't phone */
	if (typeof(Phone)==="undefined") {
		console.log("acceptIncommingcall Launch Phone");
		tizen.phone.answerCall(function(result) {
                    console.log(result.message);
                });
		launchApplication('JLRPOCX031.Phone');
		/* if app is phone */
	} else {
		if (typeof(tizen) !== 'undefined' && tizen.phone) {
			console.log("acceptIncommingcall acceptCall");
			acceptCall(tizen.phone.activeCall.contact);
		}
	}
};
/** 
 * Method denies incoming call. This method use api fucntion [tizen.phone.hangupCall]().
 * @method denyCall
 */
IncomingCall.prototype.denyCall = function() {
	"use strict";
	/* todo deny call */
	console.log("denyCall ");
	this.hide();
	if (typeof(tizen) !== 'undefined' && tizen.phone) {
		tizen.phone.hangupCall(function(result) {
			console.log(result.message);
		});
	}
};

var AnswerIncomingCall = new IncomingCall();
