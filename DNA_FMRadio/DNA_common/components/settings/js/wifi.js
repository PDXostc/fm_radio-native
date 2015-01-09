/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* global showLoadingSpinner, hideLoadingSpinner, Settings, settings, $, ko, loadScript, wsAPI, WS_EVENT_TYPE, loadTemplate */

/**
 * Wifi class provides list view of available WiFi networks, detailed information view with signal strength, security or IP address for WiFi network, functionality to connect and disconnect to open and protected WiFi networks, connect to
 * hidden WiFi network by providing SSID and passphrase, mark and unmark Wifi network for auto-connect, enable and disable WiFi tethering with SSID and passphrase entry, turn on and off WiFi adapter.
 *
 * This class requires following components:
 *
 * * {{#crossLink "Tabs"}}{{/crossLink}} component
 * * {{#crossLink "Settings"}}{{/crossLink}} component
 * 
 * @class Wifi
 * @module Settings
 * @constructor
 */
var Wifi = function() {
	"use strict";
	var self = this;
	/**
	 * Sets the state of a WiFi technology to on or off by sending a request to WiFi hardware to change the power state. After WiFi technology is enabled it starts scanning for available WiFi networks.
	 * 
	 * @method togglePower
	 */
	this.togglePower = function() {
		console.log("Wifi: toggle power called.");
		if (!!self.adapter() && !self.togglePowerLocked()) {
			self.rescanEnabled(false);
			self.togglePowerLocked(true);
			if (self.isPowered()) {
				showLoadingSpinner("Turning off");
				self.adapter().technology.setPowered(false, function() {
					console.log('Successfully disable wifi subsystem');
					self.togglePowerLocked(false);
					self.setAdapterProperty("Powered", false);
					hideLoadingSpinner("Turning off");
					self.rescanEnabled(true);
					$('#settingNet').attr('src', './DNA_common/images/WiFi_Off.png');
				}, function(err) {
					var error = "An error occured while turning wifi off.";
					console.log(error, err);
					self.togglePowerLocked(false);
					hideLoadingSpinner("Turning off");
					alert(error);
					self.rescanEnabled(true);
				});
			} else {
				showLoadingSpinner("Turning on");
				self.adapter().technology.setPowered(true, function() {
					console.log('Successfully enable WiFi subsystem');
					self.togglePowerLocked(false);
					self.setAdapterProperty("Powered", true);
					hideLoadingSpinner("Turning on");
					self.scanNetwork();
					$('#settingNet').attr('src', './DNA_common/images/WiFi_On.png');
				}, function(err) {
					var error = "An error occured while turning wifi on.";
					console.log(error, err);
					self.togglePowerLocked(false);
					hideLoadingSpinner("Turning on");
					alert(error);
					self.rescanEnabled(true);
				});
			}
		}
	};

	/**
	 * Connects or disconnects to/from supplied WiFi network. Shows popup to enter passphrase in case supplied network is protected.
	 * 
	 * @method toggleConnection
	 * @param network {Object} Object representing WiFi network to be connected to or disconnected from.
	 */
	this.toggleConnection = function(network) {
		console.log("Wifi: toggle connection called.", network);
		if (!!network) {
			if (!self.isConnected(network.prop) && self.getEncryptionStr(network.prop).toString().trim().toLowerCase() !== 'none') {
				self.showEnterWifiPasswordPopup(network);
			} else {
				self.connectDisconnectNetwork(network, undefined);
			}
		} else {
			console.log("Supplied network is undefined.");
		}
	};

	/**
	 * Shows more information about supplied WiFi network (like SSID, encryption, security, signal strength, state, IP address, gateway, netmask) in a new view that in addition allows to mark and unmark for auto-connect and provides
	 * connect/disconnect operations.
	 * 
	 * @method openNetworkDetails
	 * @param network {Object} Object representing WiFi network to be showed in detailed information view.
	 */
	this.openNetworkDetails = function(network) {
		console.log("Wifi: open network details called.", network);
		self.selectedNetwork(null);
		if (!!network) {
			self.selectedNetwork(network);
			var subpanelModel = {
				textTitle : "NETWORK INFO",
				textSubtitle : self.getSsidStr(network.prop),
				actionName : "BACK",
				action : function() {
					Settings.openSetting(Settings.selectedSetting);
				}
			};
			var wifiNetworkInfoContent = "wifiNetworkInfoContent";
			var createNetworkInfoElement = function(key, value) {
				var networkInfoElement = '<div class="wifiNetworkInfoElement fontSizeLarge fontWeightBold fontColorNormal">';
				networkInfoElement += '<span>';
				networkInfoElement += key;
				networkInfoElement += ": ";
				networkInfoElement += '</span>';
				networkInfoElement += '<span data-bind="text:' + value + '">';
				networkInfoElement += '</span>';
				networkInfoElement += '</div>';
				return networkInfoElement;
			};
			var loadNetworkInfoUI = function() {
				if (!$("#wifiNetworkInfoBox").length) {
					var button = "";
					button += '<div id="wifiAutoConnectButton" class="toggleButton subPanelToggleButton subPanelToggleButtonWide" data-bind="with: Settings.Wifi.selectedNetwork, click: Settings.Wifi.toggleSelectedNetworkAutoConnect">';
					button += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
					button += '<div class="fontColorNormal fontSizeMedium fontWeightBold" data-bind="text: \'AUTO CONNECT\', css: { fontColorSelected: Settings.Wifi.isAutoConnect(prop) }"></div>';
					button += '</div>';
					$(button).appendTo($('.tabsTopSubPanel'));

					var networkInfo = '<div id="wifiNetworkInfoBox" data-bind="with: Settings.Wifi.selectedNetwork">';
					networkInfo += createNetworkInfoElement("SSID", "Settings.Wifi.getSsidStr(prop)");
					networkInfo += createNetworkInfoElement("Encryption", "Settings.Wifi.getEncryptionStr(prop)");
					networkInfo += createNetworkInfoElement("Security", "Settings.Wifi.getSecurityStr(prop)");
					networkInfo += createNetworkInfoElement("Signal Strength", "Settings.Wifi.getSignalStrengthNum(prop)");
					networkInfo += createNetworkInfoElement("Connected", "Settings.Wifi.isConnected(prop) ? 'Yes' : 'No'");
					networkInfo += '<div data-bind="with: Settings.Wifi.isConnected(prop)">';
					networkInfo += createNetworkInfoElement("Internet Access", "Settings.Wifi.isOnlineWifiNetwork($parent.id) ? 'Yes' : 'No'");
					networkInfo += createNetworkInfoElement("IP Address", "Settings.Wifi.getIpAddressStr($parent.prop)");
					networkInfo += createNetworkInfoElement("Method", "Settings.Wifi.getMethodStr($parent.prop)");
					networkInfo += createNetworkInfoElement("Gateway", "Settings.Wifi.getGatewayAddressStr($parent.prop)");
					networkInfo += createNetworkInfoElement("Netmask", "Settings.Wifi.getNetmaskAddressStr($parent.prop)");
					networkInfo += '</div>';
					networkInfo += '<div id="networkConnectButton" class="toggleButton networkConnectButton" data-bind="click: Settings.Wifi.toggleConnection">';
					networkInfo += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
					networkInfo += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: Settings.Wifi.isConnected(prop) ? \'DISCONNECT\' : \'CONNECT\'"></div>';
					networkInfo += '</div>';
					networkInfo += '</div>';
					$(networkInfo).appendTo($('.' + wifiNetworkInfoContent));
					ko.applyBindings(window.Settings);
				}
			};

			Settings.domElement.tabs("clearContent");
			Settings.domElement.tabs("changeContentClass", wifiNetworkInfoContent);
			Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, loadNetworkInfoUI);
		}
	};

	/**
	 * Marks or unmarks WiFi network opened in detail view for auto-connect.
	 * 
	 * @method toggleSelectedNetworkAutoConnect
	 */
	this.toggleSelectedNetworkAutoConnect = function() {
		console.log("Wifi: toggle auto connect called", self.selectedNetwork());
		if (!!self.selectedNetwork() && !!self.selectedNetwork().service && !!self.selectedNetwork().prop()) {
			self.rescanEnabled(false);
			var autoConnect = !self.selectedNetwork().prop().AutoConnect;
			self.selectedNetwork().service.setAutoConnect(autoConnect, function() {
				console.log("AutoConnect set");
				self.setNetworkProperty(self.selectedNetwork(), "AutoConnect", autoConnect);
				self.scan(false);
				self.rescanEnabled(true);
			}, function(err) {
				console.log("AutoConnect set failed", err);
				self.scan(false);
				self.rescanEnabled(true);
			});
		}
	};

	/**
	 * The scanNetwork function is intended to call WiFi.scan function with 1s delay.
	 * 
	 * @method scanNetwork
	 */
	this.scanNetwork = function() {
		console.log("Wifi: scan network called.");
		self.stopScan();
		showLoadingSpinner("Scanning");
		self.showWifiLoadingSpinner();
		setTimeout(function() {
			self.scan(true);
			self.rescanEnabled(true);
		}, 1000);
	};

	/**
	 * The showAddNetwork function is intended to call showAddNetworkPopup function.
	 * 
	 * @method showAddNetwork
	 */
	this.showAddNetwork = function() {
		console.log("Wifi: connect to hidden network called.");
		self.showAddNetworkPopup();
	};

	/**
	 * Returns SSID from supplied WiFi network properties.
	 * 
	 * @method getSsidStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network SSID.
	 */
	this.getSsidStr = function(prop) {
		var ssidStr = "UNKNOWN";
		if (!!prop() && !!prop().Name && prop().Name !== "") {
			ssidStr = prop().Name.toString().trim().toUpperCase();
		}
		return ssidStr;
	};

	/**
	 * Returns signal strength in human readable form from supplied WiFi network properties.
	 * 
	 * @method getSignalStrengthStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network signal strength.
	 */
	this.getSignalStrengthStr = function(prop) {
		var signalStrengthStr = 'UNKNOWN';
		if (!!prop() && !!prop().Strength) {
			var strength = prop().Strength;
			if (strength > 0 && strength <= 20) {
				strength = 'VERY POOR';
			} else if (strength > 20 && strength <= 40) {
				signalStrengthStr = 'POOR';
			} else if (strength > 40 && strength <= 70) {
				signalStrengthStr = 'AVERAGE';
			} else if (strength > 70 && strength <= 90) {
				signalStrengthStr = 'GOOD';
			} else if (strength > 90 && strength <= 100) {
				signalStrengthStr = 'EXCELLENT';
			}
		}
		return signalStrengthStr;
	};

	/**
	 * Returns signal strength number from supplied WiFi network properties.
	 * 
	 * @method getSignalStrengthNum
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {Number} WiFi network signal strength.
	 */
	this.getSignalStrengthNum = function(prop) {
		var signalStrengthNum = 0;
		if (!!prop() && !!prop().Strength) {
			signalStrengthNum = prop().Strength;
		}
		return signalStrengthNum;
	};

	/**
	 * Returns encryption mode from supplied WiFi network properties.
	 * 
	 * @method getEncryptionStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network encryption mode.
	 */
	this.getEncryptionStr = function(prop) {
		var encryptionStr = "UNKNOWN";
		if (!!prop() && !!prop().EncryptionMode && prop().EncryptionMode.toString().trim() !== "") {
			encryptionStr = prop().EncryptionMode.toString().trim().toUpperCase();
		}
		return encryptionStr;
	};

	/**
	 * Returns security types separated by "," from supplied WiFi network properties.
	 * 
	 * @method getSecurityStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {Number} WiFi network security types.
	 */
	this.getSecurityStr = function(prop) {
		var securityStr = "UNKNOWN";
		if (!!prop() && !!prop().Security && prop().Security.length) {
			securityStr = prop().Security.join(", ").toString().trim().toUpperCase();
		}
		return securityStr;
	};

	/**
	 * Returns connection state from supplied WiFi network properties.
	 * 
	 * @method isConnected
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {Boolean} True if WiFi network is connected otherwise false.
	 */
	this.isConnected = function(prop) {
		var connected = false;
		if (!!prop() && !!prop().State && prop().State.toString().trim() !== "") {
			if (prop().State.toString().trim().toLowerCase() === "ready" || prop().State.toString().trim().toLowerCase() === "online") {
				connected = true;
			}
		}
		return connected;
	};

	/**
	 * Returns auto-connect state from supplied WiFi network properties.
	 * 
	 * @method isAutoConnect
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {Boolean} True if WiFi network auto-connect is on otherwise false.
	 */
	this.isAutoConnect = function(prop) {
		var autoConnect = false;
		if (!!prop() && !!prop().AutoConnect && prop().AutoConnect !== undefined) {
			autoConnect = prop().AutoConnect;
		}
		return autoConnect;
	};

	/**
	 * Returns IP address from supplied WiFi network properties.
	 * 
	 * @method getIpAddressStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network IP address.
	 */
	this.getIpAddressStr = function(prop) {
		var addressStr = "UNKNOWN";
		if (!!prop() && !!prop().IPv4 && !!prop().IPv4.Address && prop().IPv4.Address.toString().trim() !== "") {
			addressStr = prop().IPv4.Address.toString().trim().toUpperCase();
		}
		return addressStr;
	};

	/**
	 * Returns method from supplied WiFi network properties.
	 * 
	 * @method getMethodStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network method.
	 */
	this.getMethodStr = function(prop) {
		var methodStr = "UNKNOWN";
		if (!!prop() && !!prop().IPv4 && !!prop().IPv4.Method && prop().IPv4.Method.toString().trim() !== "") {
			methodStr = prop().IPv4.Method.toString().trim().toUpperCase();
		}
		return methodStr;
	};

	/**
	 * Returns gateway address from supplied WiFi network properties.
	 * 
	 * @method getGatewayAddressStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network gateway address.
	 */
	this.getGatewayAddressStr = function(prop) {
		var gatewayAddressStr = "UNKNOWN";
		if (!!prop() && !!prop().IPv4 && !!prop().IPv4.Gateway && prop().IPv4.Gateway.toString().trim() !== "") {
			gatewayAddressStr = prop().IPv4.Gateway.toString().trim().toUpperCase();
		}
		return gatewayAddressStr;
	};

	/**
	 * Returns netmask address from supplied WiFi network properties.
	 * 
	 * @method getNetmaskAddressStr
	 * @param prop {Object} Object representing WiFi network properties.
	 * @return {String} WiFi network netmask address.
	 */
	this.getNetmaskAddressStr = function(prop) {
		var netmaskAddressStr = "UNKNOWN";
		if (!!prop() && !!prop().IPv4 && !!prop().IPv4.Netmask && prop().IPv4.Netmask.toString().trim() !== "") {
			netmaskAddressStr = prop().IPv4.Netmask.toString().trim().toUpperCase();
		}
		return netmaskAddressStr;
	};

	/**
	 * Returns power state of loaded default WiFi adapter.
	 * 
	 * @method isPowered
	 * @return {Boolean} True if adapter is powered on otherwise false.
	 */
	this.isPowered = function() {
		var powered = false;
		if (!!self.adapter() && !!self.adapter().prop() && self.adapter().prop().Powered !== undefined) {
			powered = self.adapter().prop().Powered;
		}
		return powered;
	};

	/**
	 * Returns tethering state of loaded default WiFi adapter.
	 * 
	 * @method isTethering
	 * @return {Boolean} True if WiFi tethering is enabled otherwise false.
	 */
	this.isTethering = function() {
		var tethering = false;
		if (!!self.adapter() && !!self.adapter().prop() && self.adapter().prop().Tethering !== undefined) {
			tethering = self.adapter().prop().Tethering;
		}
		return tethering;
	};

	/**
	 * Returns tethering identifier of loaded default WiFi adapter.
	 * 
	 * @method getTetheringIdentifierStr
	 * @return {String} WiFi adapter tethering identifier.
	 */
	this.getTetheringIdentifierStr = function() {
		var identifier = "";
		if (!!self.adapter() && !!self.adapter().prop() && !!self.adapter().prop().TetheringIdentifier && self.adapter().prop().TetheringIdentifier.toString().trim() !== "") {
			identifier = self.adapter().prop().TetheringIdentifier;
		}
		return identifier;
	};

	/**
	 * Returns tethering passphrase of loaded default WiFi adapter.
	 * 
	 * @method getTetheringPassphraseStr
	 * @return {String} WiFi adapter tethering passphrase.
	 */
	this.getTetheringPassphraseStr = function() {
		var passphrase = "";
		if (!!self.adapter() && !!self.adapter().prop() && !!self.adapter().prop().TetheringPassphrase && self.adapter().prop().TetheringPassphrase.toString().trim() !== "") {
			passphrase = self.adapter().prop().TetheringPassphrase;
		}
		return passphrase;
	};

	/**
	 * Returns security type from Wifi.SECURITY_TYPE for given index.
	 * 
	 * @method getSecurityStrByIndex
	 * @param index {Number} Index of security.
	 * @return {String} Security type.
	 */
	this.getSecurityStrByIndex = function(index) {
		if (index < 0) {
			index = 0;
		}
		if (index >= self.SECURITY_TYPE.length) {
			index = self.SECURITY_TYPE.length - 1;
		}
		return self.SECURITY_TYPE[index];
	};

	/**
	 * Returns password minimum and maximum number of ASCII characters for given security index.
	 * 
	 * @method getPasswordLengthStr
	 * @param security {Number} Index of security.
	 * @return {Object} Object containing password minimal and maximal length.
	 */
	this.getPasswordLengthStr = function(security) {
		var pass = {
			str : "",
			min : 0,
			max : 0
		};
		switch (security) {
		case 1:
			pass.str = "13 ASCII CHARACTERS";
			pass.min = 13;
			pass.max = 13;
			break;
		case 2:
			pass.str = "8-63 ASCII CHARACTERS";
			pass.min = 8;
			pass.max = 63;
			break;
		case 3:
			pass.str = "8-63 ASCII CHARACTERS";
			pass.min = 8;
			pass.max = 63;
			break;
		default:
			break;
		}
		return pass;
	};

	/**
	 * Tests if supplied string contains only ASCII characters.
	 * 
	 * @method isASCII
	 * @param str {String} String to be checked.
	 * @return {Boolean} True if string contains only ASCII characters otherwise false.
	 */
	this.isASCII = function(str) {
		return (/^[\x00-\x7F]*$/).test(str);
	};

	/**
	 * Tests if supplied password is valid (i.e. contains only ASCII characters and length of password is in given min - max range).
	 * 
	 * @method isPasswordValid
	 * @param password {String} Password to be tested.
	 * @param passwordMinLength {Number} Minimum number of characters.
	 * @param passwordMaxLength {Number} Maximum number of characters.
	 * @return {Boolean} True if password is valid otherwise false.
	 */
	this.isPasswordValid = function(password, passwordMinLength, passwordMaxLength) {
		if (self.isASCII(password) && password.length >= passwordMinLength && password.length <= passwordMaxLength) {
			return true;
		}
		return false;
	};

	/**
	 * Enables or disables WiFi tethering with SSID and passphrase entry. It enables also WiFi adapter in case it is turned off.
	 * 
	 * @method toggleTethering
	 */
	this.toggleTethering = function() {
		console.log("Wifi: toggle tethering called.");
		showLoadingSpinner("Processing");
		if (!self.isPowered()) {
			self.adapter().technology.setPowered(true, function() {
				console.log('Successfully enable WiFi subsystem');
				self.setAdapterProperty("Powered", true);
				setTimeout(function() {
					self.setTethering(!self.isTethering());
				}, 1000);
			}, function(err) {
				var error = "An error occured while turning wifi on.";
				console.log(error, err);
				hideLoadingSpinner("Processing");
				alert(error);
			});
		} else {
			self.setTethering(!self.isTethering());
		}
	};

	/**
	 * Starts or stops WiFi handover sequende. Not implemented yet.
	 * 
	 * @method toggleHandover
	 */
	this.toggleHandover = function() {
		console.log("Wifi: handover sequence called.");
		alert("Wifi handover sequence not supported.");
	};

	/**
	 * Tests if supplied WiFi network has internet access.
	 * 
	 * @method isOnlineWifiNetwork
	 * @param networkId {String} WiFi network ID to be tested.
	 * @return {Boolean} True if WiFi network is online otherwise false.
	 */
	this.isOnlineWifiNetwork = function(networkId) {
		if (!!self.onlineWifiNetwork() && self.onlineWifiNetwork() === networkId) {
			return true;
		}
		return false;
	};

	Settings.domElement.on('eventClick_hidePage', function() {
		self.rescanEnabled(false);
	});

	Settings.domElement.on('eventClick_showPage', function() {
		if ($(".wifiContent").length || $(".wifiNetworkInfoContent").length) {
			self.rescanEnabled(true);
		}
	});
};

/**
 * Contains array of available WiFi networks.
 * 
 * @property networks
 * @public
 * @type ko.observableArray
 * @default []
 */
Wifi.prototype.networks = ko.observableArray([]);
/**
 * Contains array of available hidden WiFi networks.
 * 
 * @property hiddenNetworks
 * @public
 * @type ko.observableArray
 * @default []
 */
Wifi.prototype.hiddenNetworks = ko.observableArray([]);
/**
 * Provides access to control the device's connman WiFi technology.
 * 
 * @property adapter
 * @public
 * @type ko.observable
 * @default null
 */
Wifi.prototype.adapter = ko.observable(null);
/**
 * Represents WiFi network showed in detail view.
 * 
 * @property selectedNetwork
 * @public
 * @type ko.observable
 * @default null
 */
Wifi.prototype.selectedNetwork = ko.observable(null);
/**
 * Indicates if there us active scanning session for available WiFi networks.
 * 
 * @property scanning
 * @public
 * @type ko.observable
 * @default false
 */
Wifi.prototype.scanning = ko.observable(false);
/**
 * Indicates if WiFi scanning was launched already.
 * 
 * @property firstScan
 * @public
 * @type ko.observable
 * @default true
 */
Wifi.prototype.firstScan = ko.observable(true);
/**
 * Indicates if rescanning is enabled or not.
 * 
 * @property rescanEnabled
 * @public
 * @type ko.observable
 * @default false
 */
Wifi.prototype.rescanEnabled = ko.observable(false);
/**
 * Holds a rescan interval.
 * 
 * @property rescanInterval
 * @public
 * @type Any
 * @default false
 */
Wifi.prototype.rescanInterval = null;
/**
 * Contains array of different security types.
 * 
 * @property SECURITY_TYPE
 * @public
 * @type Array
 * @default []
 */
Wifi.prototype.SECURITY_TYPE = [ "NONE", "WEP", "WPA", "WPA2" ];
/**
 * Defines WiFi network with internet access.
 * 
 * @property onlineWifiNetwork
 * @public
 * @type ko.observable
 * @default null
 */
Wifi.prototype.onlineWifiNetwork = ko.observable(null);
/**
 * Indicates if WiFi power button is clickable.
 * 
 * @property togglePowerLocked
 * @public
 * @type ko.observable
 * @default false
 */
Wifi.prototype.togglePowerLocked = ko.observable(false);
/**
 * Defines security type used for WiFi tethering.
 * 
 * @property tetheringSecurity
 * @public
 * @type ko.observable
 * @default 3
 */
Wifi.prototype.tetheringSecurity = ko.observable(3);

/**
 * Loads websocket and connman javascript APIs, connects to settings daemon, subscribes to receive notifications about WiFi adapter changes.
 * 
 * @method init
 * @param callback {Function(error?)} Callback function to be invoked when initialization is done.
 */
Wifi.prototype.init = function(callback) {
	"use strict";
	var self = this;
	var error = null;
	loadScript(Settings.SETTINGS_JS_PATH + "websocket.js", function(path, status) {
		if (status === "ok") {
			loadScript(Settings.SETTINGS_JS_PATH + "api-connman.js", function(path, status) {
				if (status === "ok") {
					wsAPI.connect('ws://localhost:16000/', 'http-only', function() {
						console.log('Settings daemon connected');
						wsAPI.subscribeEvents(function(event) {
							self.connmanEventReceived(event);
						});
						self.loadDefaultAdapter(function(err) {
							error = err;
							if (!!callback) {
								callback(error);
							}
						});
					}, function(err) {
						console.log('Settings daemon disconnected...', err);
						if (err === null || err === undefined) {
							error = 'Error: Cannot connect to settings daemon';
							console.log(error);
						} else {
							error = err;
							console.log("Error", error);
						}
						if (!!callback) {
							callback(error);
						}
					});
				} else {
					error = "Error: Connamn API is not available";
					console.log(error);
					if (!!callback) {
						callback(error);
					}
				}
			});
		} else {
			error = "Error: Websocket API is not available";
			console.log(error);
			if (!!callback) {
				callback(error);
			}
		}
	});
};

/**
 * The connmanEventReceived callback function is intened to update WiFi adapter properties when changed and e.g. start scanning when WiFi adapter was turned on.
 * 
 * @method connmanEventReceived
 * @param event {Object} Object representing event's information.
 */
Wifi.prototype.connmanEventReceived = function(event) {
	"use strict";
	var self = this;
	console.log("EVENT: ", event);

	if (event.type === WS_EVENT_TYPE.CONNMAN) {
		if (event.name === 'PropertyChanged') {
			var id = event.id, property = event.value;
			if (!!self.adapter()) {
				var index = id.lastIndexOf('/');
				var technology = id.substring(index + 1).toString().trim().toLowerCase();
				if (technology === 'wifi') {
					self.setAdapterProperty(property[0], property[1]);
					if (property[0] === "Powered") {
						if (!property[1]) {
							self.stopScan();
						} else {
							setTimeout(function() {
								self.scan(false);
							}, 2000);
						}
					}

					if (property[0] === "Tethering") {
						if (property[1]) {
							self.stopScan();
						} else {
							setTimeout(function() {
								self.scan(false);
							}, 2000);
						}
					}

					if (property[0] === "Connected") {
						self.checkOnlineWifiNetwork();
					}
				}
			}
		} else {
			console.log('Unsupported event received: ' + event.name);
		}
	}
};

/**
 * Enables or disables WiFi tethering and sets entered identifier and passphrase.
 * 
 * @method setTethering
 * @param enabled {Boolean} Indicates if WiFi tethering should be turned on or off.
 */
Wifi.prototype.setTethering = function(enabled) {
	"use strict";
	var self = this;
	console.log("setTethering called");

	if ($(".wifiTetheringContent").length && !!self.adapter()) {
		var wifiTetheringContent = $(".wifiTetheringContent");
		var identifier = wifiTetheringContent.find($("#inputSsid")).val().toString().trim();
		var passphrase = wifiTetheringContent.find($("#inputPassword")).val().toString().trim();

		if (self.validateWifiCredentials(identifier, self.tetheringSecurity(), passphrase)) {
			showLoadingSpinner("Processing");
			self.adapter().technology.setTethering(identifier, passphrase, enabled, function() {
				console.log("SUCCESS");
				hideLoadingSpinner("Processing");
				if(enabled)
					$('#settingNet').attr('src', './DNA_common/images/WiFi_On.png');
				else
					$('#settingNet').attr('src', './DNA_common/images/WiFi_Off.png');
			}, function(err) {
				console.log("ERROR", err);
				alert(err);
				hideLoadingSpinner("Processing");
			});
		} else {
			hideLoadingSpinner("Processing");
		}
	}
};

/**
 * Loads connman technologies and sets WiFi technology to Wifi.adapter.
 * 
 * @method loadDefaultAdapter
 * @param callback {Function(error?)} Callback function to be invoked when loading process ends.
 */
Wifi.prototype.loadDefaultAdapter = function(callback) {
	"use strict";
	var self = this;
	var error = null;
	if (typeof (settings) !== 'undefined' && typeof (settings.connman) !== 'undefined' && typeof (settings.connman.getTechnologies) !== 'undefined') {
		settings.connman.getTechnologies(function(technologies) {
			for ( var i = 0; i < technologies.length; i++) {
				var technology = technologies[i];
				if (technology.prop.Type === 'wifi') {
					console.log('Connman technology found: ', technology);
					self.adapter({
						id : technology.id,
						prop : ko.observable(technology.prop),
						technology : technology
					});
					break;
				}
			}
			if (!self.adapter()) {
				error = "Wifi technology not found.";
				console.log(error);
				if (!!callback) {
					callback(error);
				}
			} else {
				if (self.adapter().prop().Powered === undefined) {
					self.updatePowered(function() {
						if (!!callback) {
							callback();
						}
					}, function(err) {
						error = err;
						if (!!callback) {
							callback(error);
						}
					});
				} else {
					if (!!callback) {
						callback();
					}
				}
			}
		}, function(err) {
			error = err;
			console.log("getTechnologies error ", error);
			if (!!callback) {
				callback(error);
			}
		});
	} else {
		error = "settings.connman.getTechnologies API not available.";
		console.log(error);
		if (!!callback) {
			callback(error);
		}
	}
};

/**
 * Shows list view of available WiFi networks and allows to trigger rescanning, open detail view, connect or disconnect from selected WiFi network, turn on or off WiFi technology.
 * 
 * @method showNetworks
 */
Wifi.prototype.showNetworks = function() {
	"use strict";
	var self = this;
	self.rescanEnabled(true);
	var subpanelModel = {
		textTitle : "SETTINGS",
		textSubtitle : "WIFI",
		actionName : "BACK",
		action : function() {
			self.rescanEnabled(false);
			Settings.renderSettingsView();
		}
	};

	var loadWifiNetworksUI = function() {
		if (!$("#bluetoothDevicesList").length) {
			var wifiNetworksList = '<div id="wifiNetworksList" data-bind="template: { name: \'';
			wifiNetworksList += templateName;
			wifiNetworksList += '\', foreach: Settings.Wifi.networks }, style: { display: Settings.Wifi.isPowered() && !Settings.Wifi.isTethering() ? \'block\' : \'none\' }"></div>';
			wifiNetworksList += '<div style="text-align: center;" data-bind="style: { display: Settings.Wifi.isPowered() && Settings.Wifi.isTethering() ? \'block\' : \'none\' }" class="fontColorNormal fontSizeMedium fontWeightBold">TETHERING IS ON</div>';
			$(wifiNetworksList).prependTo($('.' + wifiContent));

			var button = "";

			button += '<div class="buttonsArea">';

			button += '<div id="wifiRefreshButton" class="wifiRefreshButton" data-bind="click: Settings.Wifi.scanNetwork, style: { display: Settings.Wifi.isPowered() && !Settings.Wifi.isTethering() ? \'block\' : \'none\' }">';
			button += '</div>';

			button += '<div id="addNetworkButton" class="addNetworkButton" data-bind="click: Settings.Wifi.showAddNetwork, style: { display: Settings.Wifi.isPowered() && !Settings.Wifi.isTethering() ? \'block\' : \'none\' }">';
			button += '</div>';

			button += '</div>';

			$(button).appendTo($('.' + wifiContent));

			button = '<div id="wifiPowerButton" class="subPanelToggleButton subPanelToggleButtonWide" data-bind="with: Settings.Wifi.adapter, click: Settings.Wifi.togglePower">';
			button += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: Settings.Wifi.isPowered() ? \'TURN OFF\' : \'TURN ON\'"></div>';
			button += '</div>';
			$(button).appendTo($('.tabsTopSubPanel'));
			ko.applyBindings(window.Settings);
			self.scan(self.firstScan());
			if (!self.rescanInterval) {
				self.rescanInterval = setInterval(function() {
					if (self.isPowered() && !self.isTethering() && !self.scanning() && self.rescanEnabled() && !document.webkitHidden) {
						self.scan(false);
					}
				}, 5000);
			}
		}
	};

	var wifiContent = "wifiContent";
	var templateName = "template-wifi";
	Settings.domElement.tabs("clearContent");
	Settings.domElement.tabs("changeContentClass", wifiContent);
	Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, function() {
		loadTemplate(Settings.SETTINGS_TEMPLATES_PATH, templateName, loadWifiNetworksUI);
	});
};

/**
 * Shows small loading spinner in header during active scanning session.
 * 
 * @method showWifiLoadingSpinner
 */
Wifi.prototype.showWifiLoadingSpinner = function() {
	"use strict";
	var self = this;
	if ($(".wifiContent").length) {
		if (!$("#loadingSpinnerWifi").length) {
			var spinner = '';
			spinner += '<div id="loadingSpinnerWifi" class="loadingSpinnerWifi loading-container loading-container-small">';
			spinner += '<div class="loading loading-small"></div>';
			spinner += '</div>';
			$(spinner).appendTo($(".tabsTopSubPanel"));
		}
		$("#loadingSpinnerWifi").show();
	}
};

/**
 * Hides small loading spinner in header.
 * 
 * @method hideWifiLoadingSpinner
 */
Wifi.prototype.hideWifiLoadingSpinner = function() {
	"use strict";
	var self = this;
	if ($("#loadingSpinnerWifi").length) {
		$("#loadingSpinnerWifi").hide();
	}
};

/**
 * Discovers available WiFi networks if any.
 * 
 * @method scan
 * @param showSpinner {Boolean} Indicates if full screen loading spinner should be visible during scanning.
 */
Wifi.prototype.scan = function(showSpinner) {
	"use strict";
	var self = this;
	if (self.scanning()) {
		self.showWifiLoadingSpinner();
		return;
	}
	if (self.isPowered() && !self.isTethering()) {
		showSpinner = typeof (showSpinner) === 'undefined' ? true : showSpinner;
		if (showSpinner) {
			showLoadingSpinner("Scanning");
		}
		self.showWifiLoadingSpinner();
		self.scanning(true);
		self.firstScan(false);
		settings.connman.scan(self.adapter().id, function(networks) {
			var wifiNets = ko.utils.arrayFilter(networks, function(network) {
				return !!network && !!network.prop && !!network.prop.Type && network.prop.Type === "wifi";
			});
			var wifiNetworks = [];
			var wifiHiddenNetworks = [];
			ko.utils.arrayForEach(wifiNets, function(net) {
				var _network = {
					id : net.id,
					prop : ko.observable(net.prop),
					service : net
				};
				if (!!net.prop.Name) {
					wifiNetworks.push(_network);
				} else {
					wifiHiddenNetworks.push(_network);
				}
			});
			console.log('Found wifi networks: ', wifiNetworks);
			console.log('Found wifi hidden networks: ', wifiHiddenNetworks);
			self.networks(wifiNetworks);
			self.hiddenNetworks(wifiHiddenNetworks);
			self.sortNetworks();
			self.checkOnlineWifiNetwork();

			for ( var i = 0; i < self.networks().length; ++i) {
				var network = self.networks()[i];
				if (!!self.selectedNetwork() && self.selectedNetwork().id === network.id) {
					self.selectedNetwork(network);
				}
			}

			self.scanning(false);
			hideLoadingSpinner("Scanning");
			self.hideWifiLoadingSpinner();
		}, function(err) {
			console.log('Error: Cannot scan: ' + err);
			self.scanning(false);
			hideLoadingSpinner("Scanning");
			self.hideWifiLoadingSpinner();
		});
	} else {
		console.log("Wifi adapter is null or is turned off.");
	}
};

/**
 * Stops scanning for available WiFi networks.
 * 
 * @method scan
 */
Wifi.prototype.stopScan = function() {
	"use strict";
	var self = this;
	self.scanning(false);
	self.clearNetworks();
	hideLoadingSpinner("Scanning");
	self.hideWifiLoadingSpinner();
};

/**
 * Tests if active WiFi network connection from available WiFi networks has internet access.
 * 
 * @method checkOnlineWifiNetwork
 */
Wifi.prototype.checkOnlineWifiNetwork = function() {
	"use strict";
	var self = this;
	console.log("Wifi: checking internet access");
	var testRequest = function(network) {
		$.ajax({
			type : "GET",
			url : "http://www.google.com",
			timeout : 1000,
			success : function(data, textStatus, jqXHR) {
				self.onlineWifiNetwork(network.id);
			},
			error : function(jqXHR, textStatus, errorThrown) {
				self.onlineWifiNetwork(null);
			}
		});
	};
	for ( var i = 0; i < self.networks().length; ++i) {
		var network = self.networks()[i];
		if (self.isConnected(network.prop)) {
			testRequest(network);
			return;
		}
	}
	self.onlineWifiNetwork(null);
};

/**
 * Gets and updates Wifi.adapter power state.
 * 
 * @method updatePowered
 * @param successCallback {Function()} Callback function to be invoked when getting the state ends successfully.
 * @param errorCallback {Function(error?)} Callback function to be invoked on failure of getting power state.
 */
Wifi.prototype.updatePowered = function(successCallback, errorCallback) {
	"use strict";
	var self = this;
	if (!!this.adapter()) {
		this.adapter().getPowered(function(powered) {
			console.log("Wifi adapter is powered: " + powered);
			self.setAdapterProperty("Powered", powered);
			if (!!successCallback) {
				successCallback();
			}
		}, function(err) {
			console.log('Error: Cannot get WiFi powered state: ' + err);
			self.setAdapterProperty("Powered", false);
			if (!!errorCallback) {
				errorCallback(err);
			}
		});
	} else {
		var err = "Error: Wifi adapter not found.";
		console.log(err);
		if (!!errorCallback) {
			errorCallback(err);
		}
	}
};

/**
 * Clears lists of available WiFi networks.
 * 
 * @method clearNetworks
 */
Wifi.prototype.clearNetworks = function() {
	"use strict";
	this.networks.removeAll();
	this.networks([]);
	this.hiddenNetworks.removeAll();
	this.hiddenNetworks([]);
};

/**
 * The refreshNetworks function is intended to be called when WiFi network properties have changed.
 * 
 * @method refreshNetworks
 */
Wifi.prototype.refreshNetworks = function() {
	"use strict";
	var self = this;
	var networks = self.networks().slice(0);
	var hiddenNetworks = self.hiddenNetworks().slice(0);
	self.clearNetworks();
	self.networks(networks);
	self.hiddenNetworks(hiddenNetworks);
	self.sortNetworks();
};

/**
 * Sorts available WiFi networks by connection state (connected first).
 * 
 * @method sortNetworks
 */
Wifi.prototype.sortNetworks = function() {
	"use strict";
	var self = this;
	if (!!self.networks() && self.networks().length) {
		self.networks.sort(function(left, right) {
			return self.isConnected(left.prop) === self.isConnected(right.prop) ? 0 : self.isConnected(left.prop) ? -1 : 1;
		});
	}
};

/**
 * Sets WiFi network property.
 * 
 * @method setNetworkProperty
 * @param network {Object} Object representing WiFi network's information to be updated.
 * @param key {Sring} Property key to be set.
 * @param value {Any} Value for property to be set.
 */
Wifi.prototype.setNetworkProperty = function(network, key, value) {
	"use strict";
	var self = this;
	if (!!network && !!network.prop()) {
		network.prop()[key] = value;
		network.prop.valueHasMutated();
		network.service.prop[key] = value;
		if (!!self.selectedNetwork() && self.selectedNetwork().id === network.id) {
			self.selectedNetwork.valueHasMutated();
		}
	}
};

/**
 * Sets WiFi technology property.
 * 
 * @method setAdapterProperty
 * @param key {Sring} Property key to be set.
 * @param value {Any} Value for property to be set.
 */
Wifi.prototype.setAdapterProperty = function(key, value) {
	"use strict";
	var self = this;
	if (!!self.adapter() && !!self.adapter().prop()) {
		self.adapter().prop()[key] = value;
		self.adapter().technology.prop[key] = value;
		self.adapter().prop.valueHasMutated();
	}
};

/**
 * Connects or disconnects to/from WiFi network.
 * 
 * @method connectDisconnectNetwork
 * @param network {Object} Object representing WiFi network's information to be connected to or disconnected from.
 * @param password {Sring} Password for protected WiFi network.
 * @param callback {Function(error?)} Callback function to be invoked when connecting/disconnecting ends.
 */
Wifi.prototype.connectDisconnectNetwork = function(network, password, callback) {
	"use strict";
	var self = this;
	var error = null;
	if (!!network && self.isPowered()) {
		self.rescanEnabled(false);
		if (!self.isConnected(network.prop)) {
			showLoadingSpinner("Connecting");
			console.log('WiFi connect to network: ' + self.getSsidStr(network.prop));
			network.service.connect(undefined, password, undefined, function() {
				console.log('WiFi connected to ' + self.getSsidStr(network.prop));
				self.setNetworkProperty(network, "State", "ready");
				self.scan(false);
				hideLoadingSpinner("Connecting");
				self.rescanEnabled(true);
				if (!!callback) {
					callback();
				}
			}, function(err) {
				console.log('Error: WiFi connect failed: ', err);
				if (err.indexOf("Error.AlreadyConnected") !== -1) {
					self.setNetworkProperty(network, "State", "ready");
				}
				self.scan(false);
				hideLoadingSpinner("Connecting");
				self.rescanEnabled(true);
				error = err;
				if (!!callback) {
					callback(error);
				}
			});
		} else {
			showLoadingSpinner("Disconnecting");
			console.log('Wifi disconnect from network: ' + self.getSsidStr(network.prop));
			network.service.disconnect(function() {
				console.log('WiFi disconnected from ' + self.getSsidStr(network.prop));
				self.setNetworkProperty(network, "State", "idle");
				self.scan(false);
				hideLoadingSpinner("Disconnecting");
				self.rescanEnabled(true);
				if (!!callback) {
					callback();
				}
			}, function(err) {
				console.log('Error: Network disconnect failed: ', err);
				if (err.indexOf("Error.NotConnected") !== -1) {
					self.setNetworkProperty(network, "State", "idle");
				}
				self.scan(false);
				hideLoadingSpinner("Disconnecting");
				self.rescanEnabled(true);
				error = err;
				if (!!callback) {
					callback(error);
				}
			});
		}
	} else {
		error = "Supplied network is undefined or wifi adapter is turned off.";
		console.log(error);
		if (!!callback) {
			callback(error);
		}
	}
};

/**
 * The showEnterWifiPasswordPopup function is intended to be called before connecting to protected WiFi network that requires password entry.
 * 
 * @method showEnterWifiPasswordPopup
 * @param network {Object} Object representing WiFi network's information the passworkd should be entered for.
 */
Wifi.prototype.showEnterWifiPasswordPopup = function(network) {
	"use strict";
	var self = this;

	var popup = "";
	popup += '<div class="popupContainer pageBgColorNormalTransparent">';
	popup += '<div class="popupContainerWrapper">';
	popup += '<div class="popupWrapper borderColorTheme boxShadow1 bgColorNormal">';

	popup += '<div class="popupHeader fontSizeLarge fontWeightBold fontColorTheme borderColorTheme">';
	popup += self.getSsidStr(network.prop);
	popup += '</div>';

	popup += '<div class="popupContent">';

	popup += '<div class="popupContentContainer">';
	popup += '<span class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'Signal Strength';
	popup += '</span>';
	popup += '<span class="popupContentContainerValue fontSizeMedium fontWeightBold fontColorNormal">';
	popup += self.getSignalStrengthStr(network.prop);
	popup += '</span>';
	popup += '</div>';

	popup += '<div class="popupContentContainer">';
	popup += '<span class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'Security';
	popup += '</span>';
	popup += '<span class="popupContentContainerValue fontSizeMedium fontWeightBold fontColorNormal">';
	popup += self.getSecurityStr(network.prop);
	popup += '</span>';
	popup += '</div>';

	popup += '<div class="popupContentContainer">';
	popup += '<div class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'Password';
	popup += '</div>';
	popup += '<div class="inputBox popupInputBox">';
	popup += '<input id="inputPassword" class="input fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text"/>';
	popup += '<div id="buttonDeletePassword" class="button deleteButton"></div>';
	popup += '</div>';
	popup += '</div>';

	popup += '</div>';

	popup += '<div class="popupFooter borderColorTheme">';

	popup += '<div id="cancelButton" class="popupButton">';
	popup += '<div class="bgColorThemeTransparent boxShadowInset popupButtonBackground"></div>';
	popup += '<div class="fontColorNormal fontSizeMedium fontWeightBold popupButtonText">CANCEL</div>';
	popup += '</div>';

	popup += '<div id="connectButton" class="popupButton">';
	popup += '<div class="bgColorThemeTransparent boxShadowInset popupButtonBackground"></div>';
	popup += '<div class="fontColorNormal fontSizeMedium fontWeightBold popupButtonText">CONNECT</div>';
	popup += '</div>';

	popup += '</div>';

	popup += '</div>';
	popup += '</div>';
	popup += '</div>';

	popup = $(popup);

	popup.appendTo("body");

	popup.find("#buttonDeletePassword").click(function() {
		self.deleteCharFromInput(popup.find("#inputPassword"));
		return false;
	});

	popup.find("#cancelButton").click(function() {
		popup.fadeOut("normal", function() {
			popup.remove();
		});
		return false;
	});

	popup.find("#connectButton").click(function() {
		self.connectDisconnectNetwork(network, popup.find("#inputPassword").val(), function(error) {
			if (!error) {
				popup.fadeOut("normal", function() {
					popup.remove();
				});
			} else {
				alert("An error occured while connecting/disconnecting to/from network. " + error);
			}
		});
		return false;
	});

	popup.fadeIn("normal", function() {
	});
};

/**
 * Removes last character from given input field.
 * 
 * @method deleteCharFromInput
 * @param input {Any} jQuery representation of input element.
 */
Wifi.prototype.deleteCharFromInput = function(input) {
	"use strict";
	var inputValue = input.val();
	inputValue = inputValue.slice(0, inputValue.length - 1);
	input.val(inputValue);
	input.focus();
};

/**
 * Shows popup to add and connect to hidden WiFi network by providing SSID, security and password.
 * 
 * @method showAddNetworkPopup
 */
Wifi.prototype.showAddNetworkPopup = function() {
	"use strict";
	var self = this;

	var popup = "";
	popup += '<div class="popupContainer pageBgColorNormalTransparent">';
	popup += '<div class="popupContainerWrapper">';
	popup += '<div class="popupWrapper borderColorTheme boxShadow1 bgColorNormal">';

	popup += '<div class="popupHeader fontSizeLarge fontWeightBold fontColorTheme borderColorTheme">';
	popup += 'ADD NETWORK';
	popup += '</div>';

	popup += '<div class="popupContent">';

	popup += '<div class="popupContentContainer">';
	popup += '<div class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'SSID';
	popup += '</div>';
	popup += '<div class="inputBox popupInputBox">';
	popup += '<input id="inputSsid" class="input fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text" />';
	popup += '<div id="buttonDeleteSsid" class="button deleteButton"></div>';
	popup += '</div>';
	popup += '</div>';

	popup += '<div class="popupContentContainer">';
	popup += '<div class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'SECURITY';
	popup += '</div>';
	popup += '<div class="inputBox popupInputBox">';
	popup += '<div id="buttonPreviousSecurity" class="button previousButton"></div>';
	popup += '<input id="inputSecurity" class="inputSelection fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" data-securitytype="0" type="text" value="NONE" disabled />';
	popup += '<div id="buttonNextSecurity" class="button nextButton"></div>';
	popup += '</div>';
	popup += '</div>';

	popup += '<div id="inputPasswordContainer" class="popupContentContainer" style="display: none;">';
	popup += '<div class="popupContentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
	popup += 'PASSWORD';
	popup += '</div>';
	popup += '<div class="inputBox popupInputBox">';
	popup += '<input id="inputPassword" class="input fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text"/>';
	popup += '<div id="buttonDeletePassword" class="button deleteButton"></div>';
	popup += '</div>';
	popup += '</div>';

	popup += '</div>';

	popup += '<div class="popupFooter borderColorTheme">';

	popup += '<div id="cancelButton" class="popupButton">';
	popup += '<div class="bgColorThemeTransparent boxShadowInset popupButtonBackground"></div>';
	popup += '<div class="fontColorNormal fontSizeMedium fontWeightBold popupButtonText">CANCEL</div>';
	popup += '</div>';

	popup += '<div id="addButton" class="popupButton">';
	popup += '<div class="bgColorThemeTransparent boxShadowInset popupButtonBackground"></div>';
	popup += '<div class="fontColorNormal fontSizeMedium fontWeightBold popupButtonText">ADD</div>';
	popup += '</div>';

	popup += '</div>';

	popup += '</div>';
	popup += '</div>';
	popup += '</div>';

	popup = $(popup);
	popup.appendTo("body");

	popup.find("#buttonDeleteSsid").click(function() {
		self.deleteCharFromInput(popup.find("#inputSsid"));
		return false;
	});

	popup.find("#buttonNextSecurity").click(function() {
		var input = popup.find("#inputSecurity");
		var currentSecurity = Number(input.data("securitytype"));
		currentSecurity = currentSecurity + 1;
		if (currentSecurity >= self.SECURITY_TYPE.length) {
			currentSecurity = 0;
		}
		if (currentSecurity === 0) {
			$("#inputPasswordContainer").hide(0);
		} else {
			$("#inputPasswordContainer").show(0);
		}
		input.data("securitytype", currentSecurity);
		input.attr("value", self.SECURITY_TYPE[currentSecurity]);
		return false;
	});

	popup.find("#buttonPreviousSecurity").click(function() {
		var input = popup.find("#inputSecurity");
		var currentSecurity = Number(input.data("securitytype"));
		currentSecurity = currentSecurity - 1;
		if (currentSecurity < 0) {
			currentSecurity = self.SECURITY_TYPE.length - 1;
		}
		if (currentSecurity === 0) {
			$("#inputPasswordContainer").hide(0);
		} else {
			$("#inputPasswordContainer").show(0);
		}
		input.data("securitytype", currentSecurity);
		input.attr("value", self.SECURITY_TYPE[currentSecurity]);
		return false;
	});

	popup.find("#buttonDeletePassword").click(function() {
		self.deleteCharFromInput(popup.find("#inputPassword"));
		return false;
	});

	popup.find("#cancelButton").click(function() {
		popup.fadeOut("normal", function() {
			popup.remove();
		});
		return false;
	});

	popup.find("#addButton").click(function() {
		var ssid = popup.find("#inputSsid").val().toString().trim();
		var security = popup.find("#inputSecurity").data("securitytype");
		var password;
		if (security > 0) {
			password = popup.find("#inputPassword").val().toString().trim();
			password = password === "" ? undefined : password;
			security = self.SECURITY_TYPE[security];
		} else {
			security = undefined;
		}

		console.log(ssid, password, security);

		var hiddenNetworks = self.hiddenNetworks().slice(0);
		if (password === undefined) {
			hiddenNetworks = ko.utils.arrayFilter(hiddenNetworks, function(network) {
				return !!network && !!network.prop() && !!network.prop().EncryptionMode && network.prop().EncryptionMode === "none";
			});
		}
		var hiddenNetworkIndex = 0;
		var connected = false;
		var error = null;

		function connectedSuccesfully() {
			connected = true;
			self.scan(false);
			hideLoadingSpinner("Connecting");
			self.rescanEnabled(true);
			popup.fadeOut("normal", function() {
				popup.remove();
			});
		}

		function connectToHiddenNetwork(networkIndex) {
			var network = hiddenNetworks[networkIndex];
			if (!!network) {
				console.log("Connecting to: " + network.id);
				network.service.connect(ssid, password, security, function() {
					console.log('WiFi connected to ' + self.getSsidStr(network.prop));
					connectedSuccesfully();
				}, function(err) {
					console.log('Error: WiFi connect failed: ', err);
					if (err.indexOf("Error.AlreadyConnected") !== -1) {
						connectedSuccesfully();
					} else {
						if (hiddenNetworkIndex + 1 < hiddenNetworks.length) {
							hiddenNetworkIndex++;
							connectToHiddenNetwork(hiddenNetworkIndex);
						} else {
							hideLoadingSpinner("Connecting");
							self.rescanEnabled(true);
							error = "Wrong ssid/password or network is unavailable.";
							console.log(error);
							alert(error);
						}
					}
				});
			} else {
				console.log("Supplied network is undefined.");
				hideLoadingSpinner("Connecting");
				self.rescanEnabled(true);
			}
		}

		if (hiddenNetworks.length) {
			showLoadingSpinner("Connecting");
			self.rescanEnabled(false);
			connectToHiddenNetwork(hiddenNetworkIndex);
		} else {
			error = "No hidden networks available.";
			console.log(error);
			alert(error);
		}

		return false;
	});

	popup.fadeIn("normal", function() {
	});
};

/**
 * Validates supplied WiFi SSID and password based on given security.
 * 
 * @method validateWifiCredentials
 * @param ssid {String} WiFi network SSID to be validated.
 * @param security {Number} WiFi network security index.
 * @param password {String} WiFi network password to be validated.
 */
Wifi.prototype.validateWifiCredentials = function(ssid, security, password) {
	"use strict";
	var self = this;
	ssid = ssid.toString().trim();
	password = password.toString().trim();
	console.log("validating: ", ssid, security, password);
	if (ssid !== "") {
		if (security > 0) {
			var pass = self.getPasswordLengthStr(security);
			if (!!pass && pass.str !== "") {
				if (!self.isPasswordValid(password, pass.min, pass.max)) {
					alert("Password must contain " + pass.str);
					return false;
				}
			} else {
				alert("Security type not supported");
				return false;
			}
		}
		return true;
	} else {
		alert("Enter WiFi SSID.");
		return false;
	}
};

/**
 * Shows WiFi tethering view that provides functionality to enable or disable WiFi tethering, change tethering identifier, security and passphrase.
 * 
 * @method showWifiTethering
 */
Wifi.prototype.showWifiTethering = function() {
	"use strict";
	var self = this;
	var subpanelModel = {
		textTitle : "SETTINGS",
		textSubtitle : "WIFI TETHERING",
		actionName : "BACK",
		action : function() {
			Settings.renderSettingsView();
		}
	};

	function loadTetheringUI() {
		if (!$("#wifiTetheringInfoBox").length) {
			var tetheringPowerButton = "";
			tetheringPowerButton += '<div id="tetheringPowerButton" class="toggleButton subPanelToggleButton subPanelToggleButtonWide" data-bind="click: Settings.Wifi.toggleTethering">';
			tetheringPowerButton += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
			tetheringPowerButton += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: Settings.Wifi.isTethering() ? \'TURN OFF\' : \'TURN ON\'"></div>';
			tetheringPowerButton += '</div>';
			$(tetheringPowerButton).appendTo($('.tabsTopSubPanel'));

			var wifiTetheringContent = '<div id="wifiTetheringInfoBox" data-bind="with: Settings.Wifi.adapter">';

			wifiTetheringContent += '<div class="contentContainer">';
			wifiTetheringContent += '<div class="contentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
			wifiTetheringContent += 'IDENTIFIER';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '<div class="inputBox contentInputBox">';
			wifiTetheringContent += '<input id="inputSsid" data-bind="value: Settings.Wifi.getTetheringIdentifierStr()" class="input settingsInputWideInline fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text"/>';
			wifiTetheringContent += '<div id="buttonDeleteSsid" class="button deleteButton"></div>';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '</div>';

			wifiTetheringContent += '<div class="contentContainer">';
			wifiTetheringContent += '<div class="contentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
			wifiTetheringContent += 'SECURITY';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '<div class="inputBox contentInputBox">';
			wifiTetheringContent += '<div id="buttonPreviousSecurity" class="button previousButton"></div>';
			wifiTetheringContent += '<input id="inputSecurity" data-bind="value: Settings.Wifi.getSecurityStrByIndex(Settings.Wifi.tetheringSecurity())" class="inputSelection settingsInputSelectionWideInline fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text" disabled />';
			wifiTetheringContent += '<div id="buttonNextSecurity" class="button nextButton"></div>';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '</div>';

			wifiTetheringContent += '<div id="inputPasswordContainer" class="contentContainer" data-bind="style: { display: Settings.Wifi.tetheringSecurity() == 0 ? \'none\' : \'block\' }">';
			wifiTetheringContent += '<div class="contentContainerKey fontSizeLarge fontWeightBold fontColorTheme">';
			wifiTetheringContent += "PASSPHRASE";
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '<div class="inputBox contentInputBox">';
			wifiTetheringContent += '<input id="inputPassword" data-bind="value: Settings.Wifi.getTetheringPassphraseStr(), attr: { maxlength: Settings.Wifi.getPasswordLengthStr(Settings.Wifi.tetheringSecurity()).max, placeholder: Settings.Wifi.getPasswordLengthStr(Settings.Wifi.tetheringSecurity()).str }" class="input settingsInputWideInline fontSizeLarge fontSizeBold fontColorNormal boxShadow4 boxShadow4Active" type="text"/>';
			wifiTetheringContent += '<div id="buttonDeletePassword" class="button deleteButton"></div>';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '</div>';

			wifiTetheringContent += '<div class="disabledArea bgColorNormalTransparent" data-bind="style: { display: Settings.Wifi.isTethering() ? \'block\' : \'none\' }"></div>';

			wifiTetheringContent += '</div>';

			wifiTetheringContent += '<div class="buttonsArea">';
			wifiTetheringContent += '<div id="startWifiHandover" class="toggleButton wifiHandoverButton" data-bind="click: Settings.Wifi.toggleHandover">';
			wifiTetheringContent += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
			wifiTetheringContent += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: \'START WIFI HANDOVER\'"></div>';
			wifiTetheringContent += '</div>';
			wifiTetheringContent += '</div>';

			wifiTetheringContent = $(wifiTetheringContent);

			wifiTetheringContent.find("#inputSsid").on("change", function() {
				// self.setTethering();
				return false;
			});
			wifiTetheringContent.find("#buttonDeleteSsid").click(function() {
				self.deleteCharFromInput(wifiTetheringContent.find("#inputSsid"));
				// self.setTethering();
				return false;
			});

			wifiTetheringContent.find("#inputPassword").on("change", function() {
				// self.setTethering();
				return false;
			});
			wifiTetheringContent.find("#buttonDeletePassword").click(function() {
				self.deleteCharFromInput(wifiTetheringContent.find("#inputPassword"));
				// self.setTethering();
				return false;
			});

			wifiTetheringContent.find("#buttonNextSecurity").click(function() {
				/*var currentSecurity = self.tetheringSecurity();
				currentSecurity = currentSecurity + 1;
				if (currentSecurity >= self.SECURITY_TYPE.length) {
					currentSecurity = 0;
				}
				self.tetheringSecurity(currentSecurity);
				self.setTethering();*/
				return false;
			});

			wifiTetheringContent.find("#buttonPreviousSecurity").click(function() {
				/*var currentSecurity = self.tetheringSecurity();
				currentSecurity = currentSecurity - 1;
				if (currentSecurity < 0) {
					currentSecurity = self.SECURITY_TYPE.length - 1;
				}
				self.tetheringSecurity(currentSecurity);
				self.setTethering();*/
				return false;
			});

			wifiTetheringContent.appendTo("." + wifiTetheringContentClass);
			ko.applyBindings(window.Settings);
		}
	}

	var wifiTetheringContentClass = "wifiTetheringContent";
	Settings.domElement.tabs("clearContent");
	Settings.domElement.tabs("changeContentClass", wifiTetheringContentClass);
	Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, loadTetheringUI);
};
