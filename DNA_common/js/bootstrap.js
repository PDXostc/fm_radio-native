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

/*global loadScript, ThemeEngine, Configuration, CarIndicator, IncomingCall, Speech */
/** 
 * @module Services
 */

console.log("loading of bootstrap.js has started");
/** 
 * This class provides unified way to boot up the HTML applications by loading shared components in proper order:
 * 
 * * {{#crossLink "Configuration"}}{{/crossLink}}
 * * {{#crossLink "ThemeEngine"}}{{/crossLink}}
 * * {{#crossLink "CarIndicator"}}{{/crossLink}}
 * * {{#crossLink "Speech"}}{{/crossLink}}
 * * {{#crossLink "IncomingCall"}}{{/crossLink}}
 * 
 * To start bootstraping process in application include following snippet to your `index.html` page `<head>` section:
 * 
 *     <script type='text/javascript' src='./js/services/bootstrap.js'></script>
 *
 * and include following script into `document.ready()` code:
 * 
 *     $(document).ready(function() {
 *        "use strict";
 *        var bootstrap = new Bootstrap(function(status) {
 *           // Perform any additional intialization
 *        });
 *     });
 * 
 * @class Bootstrap
 * @constructor
 * @param callback {function(error)} Callback function called after whole boot up process is finished or if issue was detected during the process. Parameter `error` will contain any error that 
 * was intercepted.
 */

var Bootstrap = function(callback) {
	"use strict";
	var self = this;
	callback = callback || function() {};

	console.log("Loading Configuration object");

	loadScript('./DNA_common/components/configuration/configuration.js', function(path, status) {
		if (status === "ok") {
			Configuration.reload(function() {
				self.loadThemeEngine(callback);
			});
		} else {
			console.log("Error occured during loading of Configuration", status);
			callback(status);
		}
	});
};

/** 
 * Theme engine object; available after bootstap process is finished.
 * @property themeEngine
 * @type ThemeEngine
 */
Bootstrap.prototype.themeEngine = null;

/** 
 * Car indicators object; available after bootstap process is finished.
 * @property carIndicator
 * @type CarIndicator
 */
Bootstrap.prototype.carIndicator = null;

/** 
 * Incoming call object; available after bootstap process is finished.
 * @property incomingCall
 * @type IncomingCall
 */
Bootstrap.prototype.incomingCall = null;

/** 
 * This method initialize theme engine.
 * @method loadThemeEngine
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.loadThemeEngine = function(callback) {
	"use strict";
	var self = this;
	self.initCarIndicators(callback);

	//console.log("Loading ThemeEngine object");

	//loadScript('./DNA_common/js/themeengine.js', function(path, status) {
		//if (status === "ok") {
			//self.themeEngine = ThemeEngine;
			//self.themeEngine.init(function(themeStatus) {
				//if (!themeStatus) {
					//self.initCarIndicators(callback);
				//} else {
					//callback(themeStatus);
				//}
			//});
		//} else {
			//console.log("Error occured during loading of Configuration", status);
			//callback(status);
		//}
	//});
};

/** 
 * This method initialize car indicator component and attaches to AMB system.
 * @method initCarIndicators
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initCarIndicators = function(callback) {
	"use strict";
	var self = this;

	console.log("Loading CarIndicators object");
/*
	loadScript('./DNA_common/js/carIndicator.js', function(path, status) {
		if (status === "ok") {
			try {
				self.carIndicator = new CarIndicator();
				console.log(self.carIndicator);

				self.carIndicator.addListener({
					onNightModeChanged: function(nightMode) {
						//self.themeEngine.setUserTheme("http://com.intel.tizen/" + (nightMode ? "blue" : "green"));
						cosole.log("http://com.intel.tizen/" + (nightMode ? "blue" : "green"));
					}
				});
				console.log(self);
				self.initSpeech(callback);
			} catch (ex) {
				console.error("Error occured during CarIndicator initialization", self.CarIndicator, path, status, ex);
				callback(ex);
			}
		} else {
			console.log("Error occured during loading of Configuration", status);
			callback(status);
		}
	});*/
	self.initSpeech(callback);
};
/** 
 * This method initialize incoming call component and attaches to incoming call signal.
 * @method initIncomingCall
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initIncomingCall = function(callback) {
	"use strict";
	var self = this;
	callback();
    /*  removed incomming call.
	console.log("Loading IncomingCall object");
	loadScript('./DNA_common/components/boxCaption/boxCaption.js', function(path, status) {
		if (status === "ok") {

			loadScript('./DNA_common/components/incomingCall/incomingCall.js', function(path, status) {
				if (status === "ok") {
					try {
						self.incomingCall = new IncomingCall();
						if (typeof(tizen) !== 'undefined' && tizen.phone) {
							tizen.phone.addCallChangedListener(function(result) {
								// global getAppByID 
								var appId = getAppByID('intelPoc15.phone');

								var contact;
								if (!!result.contact.name) {
									contact = result.contact;
								} else {
									contact = {
										phoneNumbers: [{
											// jshint camelcase: false 
											number: tizen.phone.activeCall.line_id
											// jshint camelcase: true
										}]

									};
								}

								console.log("result.state " + result.state);
								switch (result.state.toLowerCase()) {
									case "DISCONNECTED".toLowerCase():
										self.incomingCall.denyCall();
										Configuration.set("acceptedCall", "false");
										break;
									case "ACTIVE".toLowerCase():
										if (Configuration._values.acceptedCall !== "true") {
											self.incomingCall.acceptIncommingCall();
											Configuration.set("acceptedCall", "true");
										}
										break;
									case "DIALING".toLowerCase():
										if (!appId.running) {
											//global launchApplication
											launchApplication('intelPoc15.phone');
										}
										break;
									case "INCOMING".toLowerCase():
										self.incomingCall.show(contact);
										break;
								}
							});
						}
						callback();
					} catch (ex) {
						console.error("Error occured during IncomingCall initialization", ex);
						callback(ex);
					}
				} else {
					console.log("Error occured during loading of Configuration", status);
					callback(status);
				}
			});
		}
	});*/
};
/** 
 * This method initialize speech functionality.
 * @method initSpeech
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initSpeech = function(callback) {
	"use strict";
	var self = this;
	/*
	loadScript('./DNA_common/js/speech.js', function(path, status) {
		Speech.readCurrentAppName();
		self.reload();
		self.initIncomingCall(callback);
	});*/
	self.initIncomingCall(callback);
};

/** 
 * This method reloads configuration.
 * @method reload
 */
Bootstrap.prototype.reload = function() {
	"use strict";
	document.addEventListener("webkitvisibilitychange", function() {
		Configuration.reload();
		Speech.readCurrentAppName();
	}, false);
	// workaround for webkitvisibilitychange
	setInterval(function() {
		Configuration.reload();
	}, 1000);
};

console.log("loading of bootstrap.js has ended");
