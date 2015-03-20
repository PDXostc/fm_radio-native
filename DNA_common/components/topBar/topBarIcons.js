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

/*global ThemeEngine, loadScript, template, changeCssBgImageColor, ThemeKeyColorSelected, ThemeKeyColor, Speech, Settings */

/**
 * @module CarTheme
 **/
/** 
 * Array of applications that will be rendered to the top bar panel.
 * @property topBarAplicationsModel
 * @type {Array}
 * @for window
 */

var topBarAplicationsModel = [];

/** 
 * Array of applications that would not fit the top bar panel.
 * @property extraAppsModel
 * @type {Array}
 * @for global
 */
var extraAppsModel = [];

/**
 * The callback to be invoked when the application was not launched successfully.
 *
 * @method onError
 * @for window
 * @param err {Any} An error message.
 */
function onError(err) {
	"use strict";
	console.error(err);
	alert("An error occured while launching the application: " + err.message);
}

/**
 * Returns the application object by application id from topBarAplicationsModel.
 *
 * @method getAppByID
 * @for window
 * @param id {String} Application ID.
 * @return {Object} Object representing basic application's information.
 */
function getAppByID(id) {
	"use strict";
	var j, i = 0;
	for (j = 0; j < topBarAplicationsModel.length; ++j) {
		if (id === topBarAplicationsModel[j].id) {
			return topBarAplicationsModel[j];
		}
	}
	for (i = 0; i < extraAppsModel.length; ++i) {
		if (id === extraAppsModel[i].id) {
			return extraAppsModel[i];
		}
	}

	return null;
}

/**
 * Returns the application object by application name from topBarAplicationsModel.
 *
 * @method getAppByName
 * @for window
 * @param appName {String} Application name.
 * @return {Object} Object representing basic application's information.
 */
function getAppByName(appName) {
	"use strict";
	for (var j = 0; j < topBarAplicationsModel.length; ++j) {
		if (appName.toString().trim().toLowerCase() === topBarAplicationsModel[j].appName.toString().trim().toLowerCase()) {
			return topBarAplicationsModel[j];
		}
	}
	for (var i = 0; i < extraAppsModel.length; ++i) {
		if (appName.toString().trim().toLowerCase() === extraAppsModel[i].appName.toString().trim().toLowerCase()) {
			return extraAppsModel[i];
		}
	}

	return null;
}

/**
 * The callback to be invoked when the application was launched successfully.
 *
 * @method onAppInfoSuccess
 * @for window
 */
function onLaunchSuccess() {
	"use strict";
	console.log("App launched succesfully...");
	//tizen.application.getCurrentApplication().hide();
}

/**
 * Launches an application with the given application ID.
 *
 * @method launchApplication
 * @for window
 * @param id {String} Application ID.
 */
function launchApplication(id) {
	"use strict";
	console.log('launchApplication('+id+');');
	if (id === "http://com.intel.tizen/settings") {
		if (typeof Settings === 'undefined') {
			loadScript('./common/components/settings/js/settings.js', function(path, status) {
				if (status === "ok") {
					Settings.init();
				}
			});
		} else {
			Settings.show();
		}
		return;
	}

	var app = getAppByID(id);
	console.log(app);
	if ( !! app) {
		if( app != tizen.application.getCurrentApplication() )
		{
			if (app.installed && !app.running) {
				console.log("Application is not running!");
				tizen.application.launch(app.id, onLaunchSuccess, onError);
			} else if (app.running) {
				console.log("Application is running!");
				console.log(app);
			}
		}
	} else {
		console.log("Application is not installed!");
		alert("Application is not installed!");
	}
}

(function($) {
	"use strict";
	/**
	 * Represents top bar UI control element that is used to navigate between predefined set of applications. Applications displayed in this list must have 
	 * [application ID](https://developer.tizen.org/dev-guide/2.2.1/org.tizen.web.device.apireference/tizen/application.html#::Application::ApplicationId) 
	 * starting with `intelPoC` prefix (e.g. `intelPoc10.HomeScreen`). Use following snippet to include component in your `index.html` file:
     * 
     *     <script type='text/javascript' src='./common/components/topBarIcons/topBarIcons.js'></script>
	 *     <link rel="stylesheet" href="./common/components/topBarIcons/topBarIcons.css" />
     *
     * and following code to initialize:
     *
     *     $("#topBarIcons").topBarIconsPlugin('init');
     *
	 * @class TopBarIcons
	 * @constructor
	 */
	var TopBarIcons = {
		/** 
		 * Name of the application that is used to highlight only the icon of currently running application.
		 * @property runningAppName
		 * @type {String}
		 * @default ""
		 */
		runningAppName: "",

		/**
		 * Initializes the element and gets the list of installed application.
		 *
		 * @method init
		 * @param appName {String} Name of running application.
		 */
		init: function() {
			TopBarIcons.initLaunchingAppsByVoiceRecognition();
			TopBarIcons.runningAppName = typeof(tizen) === 'undefined' ? "" : tizen.application.getCurrentApplication().appInfo.id;

			this.empty();
			this.addClass("topBarIcons");

			if (typeof ThemeEngine !== 'undefined') {
				ThemeEngine.addStatusListener(function(themeId) {
					TopBarIcons.renderApps();
				});
			} else {
				console.error("ThemeEngine API is not available.");
			}

			TopBarIcons._getApps();
		},

		_getApps: function() {
			try {
				if (typeof(tizen) !== 'undefined') {
					tizen.application.getAppsInfo(TopBarIcons.onAppInfoSuccess, function(err) {
						// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
						window.setTimeout(function() {
							TopBarIcons._getApps();
						}, 1000);

						onError(err);
					});
				}
			} catch (exc) {
				console.error(exc.message);
			}
		},
		appList: [],
		prevThemeColor: "",
		/**
		 * The callback to be invoked when the installed application list is retrieved. Compares list of installed applications to predefined list and sets installed and running properties, that are used when launching an application.
		 * Calls render application icons function.
		 * @method onAppInfoSuccess
		 * @param list {Array} Array of installed application.
		 */
		onAppInfoSuccess: function(list) {
			try {
				var registeredApps = {"Home Screen":"/common/images/homescreen_icon.png",
									   Browser:"/common/images/browser_icon.png", 
									   Boilerplate:"/common/images/boilerplate_icon.png",
									   News:"/common/images/news_icon.png",
									   gestureGame:"/common/images/GestureGame_icon.png",
									   Phone:"/common/images/phone_icon.png",
									   Dashboard:"/common/images/dashboard_icon.png",
									   Weather:"/common/images/weather_icon.png",
									   Handwriting:"/common/images/handwriting_icon.png"};
				var appListLenght;
					var i = 0,
						j = 0;
					var modelData = [];
					var homeScreenApp = {};

					for (i = 0; i < list.length; i++) {
						var app = list[i];
						//console.log(app.name);
						if (registeredApps[app.name]) {
							var newApp = {
								id: app.id,
								appName: app.name,
								//style: "background-image: url('app://"+ app.id.substr(6) + app.iconPath + "');",
								style: "background-image: url('"+ registeredApps[app.name] + "');",
								//style: "background-image: url('/icon.png');",
								iconPath: app.iconPath,
								css: "app_" + app.id.replace(/\./g, "_").replace(/\ /g, "_"),
								installed: true,
								running: TopBarIcons.runningAppName === app.id
							};
							//console.log(newApp);

							if (app.name === "Home Screen") {
								homeScreenApp = newApp;
							} else {
								//app filter to block adding some apps into topbar
								if (modelData.length < 7) {
									modelData.push(newApp);
								}
								else {
									extraAppsModel.push(newApp);
								}
							}
						}
					}

					modelData.sort(function(x, y) {
						return x.appName > y.appName ? 1 : -1;
					});

					modelData.unshift(homeScreenApp);
					while (modelData.length < 8) {
						modelData.push({});
					}

					modelData.push({
						id: "http://com.intel.tizen/settings",
						appName: "settings",
						css: "appIconNo7",
						installed: true,
						lastIcon: true
					});
					var equals = modelData.length === topBarAplicationsModel.length;

					if (equals) {
						for (j = 0; j < modelData.length; j++) {
							equals = modelData[j].id === topBarAplicationsModel[j].id ? equals : false;
							equals = modelData[j].appName === topBarAplicationsModel[j].appName ? equals : false;
							equals = modelData[j].css === topBarAplicationsModel[j].css ? equals : false;
							equals = modelData[j].iconPath === topBarAplicationsModel[j].iconPath ? equals : false;
						}
					}

					if (!equals) {
						topBarAplicationsModel = modelData;
						if (appListLenght !== list.length) {
							loadScript('./common/components/jsViews/jsrender.js', function(path, status) {
								if (status === "ok") {
									loadScript('./common/components/jsViews/template.js', function(path, status) {
										if (status === "ok") {
											TopBarIcons.renderApps();

											// jsRender adds additional properties so we need to store it once again for comparsion in next round
											topBarAplicationsModel = modelData;
										}
									});
								}
							});
						}
					}
			} catch (exc) {
				console.error(exc.message);
			} finally {
				// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
				window.setTimeout(function() {
					TopBarIcons._getApps();
				}, 1000);
			}
		},

		/**
		 * Renders the array of predefined applications into the panel utilizing template mechanism.
		 *
		 * @method renderApps
		 * @param caption {String} Caption text.
		 */
		renderApps: function() {
			$(".topBarIcons").empty();
			//$(".topBarIcons").css("display", "none");

			template.compile(topBarAplicationsModel, "./common/components/topBarIcons/templates/topBarIconsDelegate.html", ".topBarIcons", function() {
				var j = 0;
				for (j = 0; j < topBarAplicationsModel.length; ++j) {
					if (topBarAplicationsModel[j].running) {
						changeCssBgImageColor("." + topBarAplicationsModel[j].css, ThemeKeyColorSelected);
					} else {
						changeCssBgImageColor("." + topBarAplicationsModel[j].css, ThemeKeyColor);
					}
				}
				setTimeout(function() {
					//	$(".topBarIcons").css("display", "block");
				}, 200);
			});
		},
		initLaunchingAppsByVoiceRecognition: function() {
			if (typeof(Speech) !== 'undefined') {
				Speech.addVoiceRecognitionListener({
					onapplicationlaunch: function(appName) {
						// check if app is in foreground
						//if (!document. webkitHidden) {
						launchApplication(getAppByName(appName).id);
						//}
					}
				});
			} else {
				console.warn("Speech API is not available.");
			}
		}
	};

	/** 
	 * jQuery extension method for class {{#crossLink "TopBarIcons"}}{{/crossLink}} plugin.
	 * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
	 * @method topBarIconsPlugin
	 * @for jQuery
	 * @return Result of called method.
	 */
	$.fn.topBarIconsPlugin = function(method) {
		// Method calling logic
		if (TopBarIcons[method]) {
			return TopBarIcons[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return TopBarIcons.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.boxCaptionPlugin');
		}
	};
}(jQuery));
