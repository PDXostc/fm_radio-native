/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* global launchApplication, getAppByID, acceptCall*/

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
		// callbox += '</div>';

		var buttons = '<div id="incomingCallAccept" class="incomingCallAccept button callButton callingFalse boxShadow4Active" onClick = "bootstrap.incomingCall.acceptIncommingCall()"></div>';
		buttons += '<div id="incomingCallDeny" class="incomingCallDeny button callButton callingTrue boxShadow4Active" onClick = "bootstrap.incomingCall.denyCall()"></div>';

		appendHtml += background + tabs + callbox + buttons;
		appendHtml += '</div></div>';
		$(appendHtml).appendTo("body");
		$("#incomingCall .TopPanelTitle").boxCaptionPlugin('init', "Incoming Call");
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
	var appId = getAppByID('intelPoc15.Phone');
	/* if app isn't phone */
	if (!appId || !appId.running) {
		launchApplication('intelPoc15.Phone');
		/* if app is phone */
	} else {
		if (typeof(tizen) !== 'undefined' && tizen.phone) {
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
	this.hide();
	if (typeof(tizen) !== 'undefined' && tizen.phone) {
		tizen.phone.hangupCall(function(result) {
			console.log(result.message);
		});
	}
};
