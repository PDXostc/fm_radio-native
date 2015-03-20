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

/* global loadScript, Themes, Wifi, Bluetooth, ko, loadTemplate, $ */

/**
 * Settings class provides list view of available Settings options.
 *
 * This class requires following components:
 *
 * * {{#crossLink "BoxCaption"}}{{/crossLink}} component
 * * {{#crossLink "Tabs"}}{{/crossLink}} component
 * * {{#crossLink "Themes"}}{{/crossLink}} component
 * * {{#crossLink "Wifi"}}{{/crossLink}} component
 * * {{#crossLink "Bluetooth"}}{{/crossLink}} component
 * 
 * @class Settings
 * @module Settings
 * @constructor
 */
var Settings = (function() {
	"use strict";
	/**
	 * @class Settings
	 * @constructor
	 */
	function Settings() {
		console.info("Starting up service Settings");

		var self = this;

		/**
		 * Shows a given Settings option.
		 * 
		 * @method openSetting
		 * @param setting {Object} Object representing Setting option to be showed.
		 */
		this.openSetting = function(setting) {
			self.selectedSetting = null;
			if (!!setting && !self.locked) {
				self.locked = true;
				self.selectedSetting = setting;
				switch (setting.id) {
				case "wifinetworks":
					loadScript(self.SETTINGS_JS_PATH + "wifi.js", function(path, status) {
						if (status === "ok") {
							if (!self.Wifi) {
								self.Wifi = new Wifi();
								self.Wifi.init(function(err) {
									if (!!err) {
										alert(err);
										self.Wifi = null;
									} else {
										self.Wifi.showNetworks();
									}
									self.locked = false;
								});
							} else {
								self.Wifi.showNetworks();
								self.locked = false;
							}
						} else {
							self.locked = false;
						}
					});
					break;
				case "wifitethering":
					loadScript(self.SETTINGS_JS_PATH + "wifi.js", function(path, status) {
						if (status === "ok") {
							if (!self.Wifi) {
								self.Wifi = new Wifi();
								self.Wifi.init(function(err) {
									if (!!err) {
										alert(err);
										self.Wifi = null;
									} else {
										self.Wifi.showWifiTethering();
									}
									self.locked = false;
								});
							} else {
								self.Wifi.showWifiTethering();
								self.locked = false;
							}
						} else {
							self.locked = false;
						}
					});
					break;
				case "bluetooth":
					loadScript(self.SETTINGS_JS_PATH + "bluetooth.js", function(path, status) {
						if (status === "ok") {
							if (!self.Bluetooth) {
								self.Bluetooth = new Bluetooth();
							}
							self.Bluetooth.show();
						}
						self.locked = false;
					});
					break;
				default:
					self.locked = false;
					break;
				}
			}
		};
	}

	/**
	 * Defines base path to Settings resources.
	 * 
	 * @property SETTINGS_BASEPATH
	 * @public
	 * @type String
	 * @default ./common/components/settings/
	 */
	Settings.prototype.SETTINGS_BASEPATH = "./DNA_common/components/settings/";
	/**
	 * Defines path to Settings templates.
	 * 
	 * @property SETTINGS_TEMPLATES_PATH
	 * @public
	 * @type String
	 * @default ./common/components/settings/templates/
	 */
	Settings.prototype.SETTINGS_TEMPLATES_PATH = "./DNA_common/components/settings/templates/";
	/**
	 * Defines path to Settings javascript files.
	 * 
	 * @property SETTINGS_JS_PATH
	 * @public
	 * @type String
	 * @default ./common/components/settings/js/
	 */
	Settings.prototype.SETTINGS_JS_PATH = "./DNA_common/components/settings/js/";
	/**
	 * Holds the git revision number.
	 * 
	 * @property SETTINGS_REVISION
	 * @public
	 * @type String
	 */
	Settings.prototype.SETTINGS_REVISION = "@revision@";
	/**
	 * Instance of Theme class.
	 * 
	 * @property Theme
	 * @public
	 * @type Themes
	 */
	Settings.prototype.Theme = null;
	/**
	 * Instance of Wifi class.
	 * 
	 * @property Wifi
	 * @public
	 * @type Wifi
	 */
	Settings.prototype.Wifi = null;
	/**
	 * Instance of Bluetooth class.
	 * 
	 * @property Bluetooth
	 * @public
	 * @type Bluetooth
	 */
	Settings.prototype.Bluetooth = null;
	/**
	 * jQuery representation of Settings Tabs component.
	 * 
	 * @property domElement
	 * @public
	 * @type Any
	 */
	Settings.prototype.domElement = null;
	/**
	 * Prevents opening of clicked Settings option more times.
	 * 
	 * @property locked
	 * @public
	 * @type Boolean
	 * @default false
	 */
	Settings.prototype.locked = false;

	/**
	 * Contains array of Settings options.
	 * 
	 * @property settingsModel
	 * @type {Array}
	 */
	Settings.prototype.settingsModel = ko.observableArray([ {} ]);
	/**
	 * Represents opened Settings option.
	 * 
	 * @property selectedSetting
	 * @public
	 * @type Any
	 * @default null
	 */
	Settings.prototype.selectedSetting = null;

	/**
	 * Loads all the javascript and style files, initializes UI components that Settings list view depends on.
	 * 
	 * @method init
	 */
	Settings.prototype.init = function() {
		var self = this;
		loadScript('./DNA_common/components/boxCaption/boxCaption.js', function(path, status) {
			if (status === "ok") {
				loadScript('./DNA_common/components/tabs/tabs.js', function(path, status) {
					if (status === "ok") {
						$("head").append($("<link rel='stylesheet' href='./DNA_common/components/boxCaption/boxCaption.css' />"));
						$("head").append($("<link rel='stylesheet' href='./DNA_common/components/tabs/tabs.css' />"));
						$("head").append($("<link rel='stylesheet' href='" + self.SETTINGS_BASEPATH + "/css/settings.css' />"));

						if (!$("#settingsTabs").length) {
							var settings = '<div id="settingsTabs" class="tabs pageBgColorNormalTransparent"></div>';
							$(settings).appendTo("body");
							self.domElement = $("#settingsTabs");
						}

						self.domElement.bind('eventClick_menuItemBtn', function() {
							self.renderSettingsView();
						});

						self.domElement.tabs("setSectionTitle", "APPS");
						var version = typeof tizen === 'undefined' ? "" : tizen.application.getCurrentApplication().appInfo.version;
						self.domElement.tabs("setSectionHint", "v. " + version + " rev. " + self.SETTINGS_REVISION);
						self.domElement.tabs("init");

						var tabMenuModel = {
							Tabs : [ {
								text : "SETTINGS",
								selected : true
							} ]
						};

						self.domElement.tabs("tabMenuTemplateCompile", tabMenuModel, function() {
							self.renderSettingsView(function() {
								self.show();
							});
						});
					}
				});
			}
		});
	};
	/**
	 * Loads all the javascript and style files, initializes UI components that Settings list view depends on.
	 * 
	 * @method init
	 */
	Settings.prototype.silentinit = function() {
		var self = this;
		loadScript('./DNA_common/components/boxCaption/boxCaption.js', function(path, status) {
			if (status === "ok") {
				loadScript('./DNA_common/components/tabs/tabs.js', function(path, status) {
					if (status === "ok") {
						$("head").append($("<link rel='stylesheet' href='./DNA_common/components/boxCaption/boxCaption.css' />"));
						$("head").append($("<link rel='stylesheet' href='./DNA_common/components/tabs/tabs.css' />"));
						$("head").append($("<link rel='stylesheet' href='" + self.SETTINGS_BASEPATH + "/css/settings.css' />"));

						if (!$("#settingsTabs").length) {
							var settings = '<div id="settingsTabs" class="tabs pageBgColorNormalTransparent"></div>';
							$(settings).appendTo("body");
							self.domElement = $("#settingsTabs");
						}

						self.domElement.bind('eventClick_menuItemBtn', function() {
							self.renderSettingsView();
						});

						self.domElement.tabs("setSectionTitle", "APPS");
						var version = typeof tizen === 'undefined' ? "" : tizen.application.getCurrentApplication().appInfo.version;
						self.domElement.tabs("setSectionHint", "v. " + version + " rev. " + self.SETTINGS_REVISION);
						self.domElement.tabs("init");

						var tabMenuModel = {
							Tabs : [ {
								text : "SETTINGS",
								selected : true
							} ]
						};

						self.domElement.tabs("tabMenuTemplateCompile", tabMenuModel, function() {
							self.renderSettingsView(function() {});
						});
					}
				});
			}
		});
	};

	/**
	 * Fades in the Settings.
	 * 
	 * @method show
	 */
	Settings.prototype.show = function() {
		var self = this;
		self.domElement.tabs("showPage");
	};

	/**
	 * Shows list view of available Settings options.
	 * 
	 * @method renderSettingsView
	 * @param successCallback {Function()} Callback function to be invoked when the rendering ends.
	 */
	Settings.prototype.renderSettingsView = function(successCallback) {
		var self = this;
		var settingsContent = "settingsContent";
		var templateName = "template-settings";
		self.domElement.tabs('closeSubpanel');
		self.domElement.tabs("clearContent");
		self.domElement.tabs("changeContentClass", settingsContent);
		loadTemplate(self.SETTINGS_TEMPLATES_PATH, templateName, function() {
			if (!$("#settingsList").length) {
				var settingsList = '<div id="settingsList" data-bind="template: { name: \'';
				settingsList += templateName;
				settingsList += '\', foreach: Settings.settingsModel }"></div>';
				$(settingsList).appendTo($('.' + settingsContent));
				ko.applyBindings(window.Settings);
			}
			if (!!successCallback) {
				successCallback();
			}
		});
		if (self.domElement.find(".bluetoothPINCode").length) {
			self.domElement.find(".bluetoothPINCode").remove();
		}
	};

	window.__settings = undefined === window.__settings ? new Settings() : window.__settings;

	return window.__settings;
})();
