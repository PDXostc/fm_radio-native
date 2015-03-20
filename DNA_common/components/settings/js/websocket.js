/*
 * Copyright (c) 2014, Intel Corporation.
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

/* Dummy backend for faking websocket daemon */
var dummyBackend = false;

var ERROR_SETTINGSD_DISCONNECTED = 'Settings daemon is not connected';

var WS_REQUEST_TYPE = {
	CONNMAN_MANAGER : "connman::manager",
	CONNMAN_TECHNOLOGY : "connman::technology",
	CONNMAN_SERVICE : "connman::service",
	BLUETOOTH : "bluetooth",
	DISPLAY : "display",
	SOUND : "sound",
	DATETIME : "clock",
	LOCALE : "locale"
};

var WS_EVENT_TYPE = {
	CONNMAN : "connman",
	BLUETOOTH : "bluetooth",
	DISPLAY : "display",
	SOUND : "sound",
	DATETIME : "clock",
	LOCALE : "locale"
};

/* web socket module to connect to the settings daemon */
var wsAPI = (function() {
	/* number of connection retries to attempt if the socket closes */
	var self = this;
	this.connected = false;
	this.event_callbacks = $.Callbacks();

	/* default values for WebSocket */
	this.socketUrl = 'ws://localhost:16000/';
	this.socketProtocol = 'http-only';

	this.timeouttime = 15000;
	this.methodIdx = 0;
	this.methodCalls = [];
	for ( var i = 0; i < 100; i++) {
		this.methodCalls[i] = null;
	}

	this.MethodCall = function(id, name, success_cb, error_cb) {
		var me = this;
		this.successCB = success_cb;
		this.errorCB = error_cb;
		this.transactionid = id;
		this.name = name;
		this.done = false;
		this.start = function() {
			me.timeout = setTimeout(function() {
				if (me.errorCB !== undefined) {
					me.errorCB('\"' + me.name + '\" method timed out after ' + self.timeouttime + ' ms');
				}
				me.finish();
			}, self.timeouttime);
		}
		this.finish = function() {
			if (me.timeout !== undefined) {
				clearTimeout(me.timeout);
			}
			me.done = true;
		}
	}

	this.EventObject = function(type, id, name, value) {
		var me = this;
		this.type = type;
		this.id = id;
		this.name = name;
		this.value = value;
	}

	function connect(url, protocol, sucess_cb, error_cb) {
		self.socketUrl = typeof url !== 'undefined' ? url : self.socketUrl;
		self.socketProtocol = typeof protocol !== 'undefined' ? protocol : self.socketProtocol;
		self.successCB = sucess_cb;
		self.errorCB = error_cb;

		if ('WebSocket' in window) {
			if (self.socketProtocol.length > 0) {
				self.socket = new WebSocket(self.socketUrl, self.socketProtocol);
			} else {
				self.socket = new WebSocket(self);
			}
			console.log('Connecting to websocket: ' + self.socketUrl);

			self.socket.onopen = function() {
				self.connected = true;
				console.log('websocket opened');
				self.successCB();
			};

			self.socket.onclose = function(code, reason, remote) {
				self.connected = false;
				console.log('websocket closed - ' + reason);

				if (dummyBackend) {
					/* fake the connection for dummy backend */
					self.connected = true;
					self.successCB();
					return;
				}

				self.errorCB(reason);
			};

			self.socket.onerror = function(e) {
				if (dummyBackend) {
					/* ignore websocket error */
					return;
				}

				if (e.data) {
					self.errorCB('websocket error: ' + e.data);
				} else {
					self.errorCB('websocket error: unknown');
				}
			};

			self.socket.onmessage = function(e) {
				receive(e.data);
			};
		} else {
			console.log('Websockets not supported');
		}
	}

	function reconnect() {
		if (this.connected)
			return;

		setTimeout(function() {
			connect(self.socketUrl, self.socketProtocol, self.successCB, self.errorCB);
		}, 1000);
	}

	function send(msg, success_cb, error_cb) {
		if (!this.connected) {
			if (error_cb !== undefined) {
				error_cb(ERROR_SETTINGSD_DISCONNECTED);
			}
			return;
		}
		var i = this.methodIdx;
		this.methodIdx = (this.methodIdx + 1) % 100;
		this.methodCalls[i] = new this.MethodCall(msg.transactionid, msg.name, success_cb, error_cb);
		this.methodCalls[i].start();

		var jsonMsg = JSON.stringify(msg);
		console.log('Sending json msg: ' + jsonMsg);
		if (dummyBackend) {
			/* fake with dummy data */
			dummyBackendSend(msg);
		} else {
			this.socket.send(jsonMsg);
		}
	}

	function fireEvent(type, id, name, value) {
		var event = new this.EventObject(type, id, name, value);
		console.log('Firing ' + type + ' event id=' + id + ', name=' + name + ', value=' + value);
		event_callbacks.fire(event);
	}

	function receive(msg) {
		var self = this;
		var response;
		try {
			console.log("Received json msg: " + msg);
			response = JSON.parse(msg);
		} catch (e) {
			console.error('Garbage message: ' + msg);
			return;
		}

		if ((response === undefined) || (response.type === undefined)) {
			console.error('Badly formed message: ' + msg);
		} else if (response.type === 'event' && response.value !== undefined) {
			if (response.value.interface_name === 'net.connman.Manager' || response.value.interface_name === 'net.connman.Service'
					|| response.value.interface_name === 'net.connman.Technology') {
				if (response.value.signal_name === undefined || response.value.parameters === undefined) {
					console.error('Badly formed event: ' + msg);
					return;
				}
				if (response.value.signal_name === 'ServiceChanged' && response.value.parameters.length !== 2) {
					console.error('Badly formed event parameters: ' + msg);
					return;
				}

				if (response.value.object_path === '/' || response.value.object_path.indexOf('/net/connman/technology/') >= 0) {
					fireEvent(WS_EVENT_TYPE.CONNMAN, response.value.object_path, response.value.signal_name, response.value.parameters);
				} else {
					console.error('Unrecognized event object_path, skipping');
				}
			} else {
				console.error('Unrecognized event, skipping');
			}
		} else if (response.transactionid === undefined) {
			console.error('Badly formed response: ' + msg);
		} else {
			var calls = this.methodCalls;
			for ( var i = 0; i < calls.length; i++) {
				var call = calls[i];
				if (call && (!call.done) && (call.transactionid === response.transactionid)) {
					call.finish();
					if (response.result !== 'succeeded' && response.reason !== undefined && call.errorCB !== undefined) {
						call.errorCB(response.reason);
					} else if (call.successCB !== undefined) {
						if (response.value !== undefined) {
							call.successCB(response.value);
						} else {
							call.successCB();
						}
					}
					return;
				}
			}
		}
	}

	function generateTransactionId() {
		var i, val = [];
		for (i = 0; i < 8; i++) {
			var num = Math.floor((Math.random() + 1) * 65536);
			val[i] = num.toString(16).substring(1);
		}
		var uuid = val[0] + val[1] + '-' + val[2] + '-' + val[3] + '-' + val[4] + '-' + val[5] + val[6] + val[7];
		return uuid;
	}

	function sendRequest(request_type, request_name, request_args, success_cb, error_cb) {
		var msg = {
			'type' : request_type,
			'transactionid' : generateTransactionId(),
			'name' : request_name,
			'value' : request_args
		};

		send(msg, success_cb, error_cb);
	}

	function subscribeEvents(callback) {
		event_callbacks.add(callback);
	}

	function unsubscribeEvents(callback) {
		event_callbacks.remove(callback);
	}

	/* this is dummy data for testing purposes */
	function dummyBackendSend(msg) {
		if (dummyBackend) {
			console.log('Sending to dummy server');

			var calls = this.methodCalls;
			var replyMsg = null;

			for ( var i = 0; i < calls.length; i++) {
				var call = calls[i];
				if (call && (!call.done) && (call.transactionid === msg.transactionid)) {
					call.finish();
					if (msg.error !== undefined) {
						if (call.errorCB) {
							call.errorCB(msg.error);
						}
					}
					if (msg.value !== undefined && call.successCB !== undefined) {
						switch (msg.type) {
						case WS_REQUEST_TYPE.CONNMAN_MANAGER:
						case WS_REQUEST_TYPE.CONNMAN_TECHNOLOGY:
							if (msg.name === 'get_technologies') {
								var results = [ [ [ "/net/connman/technology/ethernet", {
									"Name" : "Wired",
									"Type" : "ethernet",
									"Powered" : true,
									"Connected" : true,
									"Tethering" : false
								} ], [ "/net/connman/technology/wifi", {
									"Name" : "WiFi",
									"Type" : "wifi",
									"Powered" : false,
									"Connected" : false,
									"Tethering" : false
								} ], [ "/net/connman/technology/bluetooth", {
									"Name" : "Bluetooth",
									"Type" : "bluetooth",
									"Powered" : false,
									"Connected" : false,
									"Tethering" : false
								} ] ] ];

								replyMsg = JSON.stringify(results);
								call.successCB(results);
								return;
							} else if (msg.name === 'enable' && msg.value[1] === true) {
								call.successCB();
								fireEvent(WS_EVENT_TYPE.CONNMAN, msg.value[0], 'PropertyChanged', [ "Powered", true ]);
								return;
							} else if (msg.name === 'enable' && msg.value[1] === false) {
								call.successCB();
								fireEvent(WS_EVENT_TYPE.CONNMAN, msg.value[0], 'PropertyChanged', [ "Powered", false ]);
								return;
							} else if (msg.name === 'get_services' || msg.name === 'scan') {
								var results = [ [ [ "/net/connman/service/ethernet_0010f32f5a70_cable", {
									"Type" : "ethernet",
									"Security" : [],
									"State" : "ready",
									"AutoConnect" : true,
									"Domains" : [ "ftrdhcpuser.net" ],
									"Domains.Configuration" : [],
									"Ethernet" : {
										"Address" : "10:20:F3:2F:5E:23",
										"Interface" : "eno1",
										"MTU" : 1500,
										"Method" : "auto"
									},
									"Favorite" : true,
									"IPv4" : {
										"Address" : "192.168.1.20",
										"Gateway" : "192.168.1.1",
										"Method" : "dhcp",
										"Netmask" : "255.255.255.0"
									},
									"IPv4.Configuration" : {
										"Method" : "dhcp"
									},
									"IPv6" : {},
									"IPv6.Configuration" : {
										"Method" : "auto",
										"Privacy" : "disabled"
									},
									"Immutable" : false,
									"Name" : "Wired",
									"Nameservers" : [ "192.168.1.1", "184.11.12.13" ],
									"Nameservers.Configuration" : [],
									"Provider" : {},
									"Proxy" : {
										"Method" : "direct"
									},
									"Proxy.Configuration" : {},
									"Timeservers" : [ "192.168.1.1", "pool.ntp.org" ],
									"Timeservers.Configuration" : []
								} ], [ "/net/connman/service/wifi_c8f733acdf96_3558364737_managed_psk", {
									"Type" : "wifi",
									"Security" : [ "psk" ],
									"State" : "ready",
									"Strength" : 50,
									"Favorite" : false,
									"Immutable" : false,
									"AutoConnect" : false,
									"Name" : "Access Point 1",
									"BSSID" : "11:5d:49:88:3d:20",
									"MaxRate" : 54000000,
									"Frequency" : 2417,
									"EncryptionMode" : "none",
									"Ethernet" : {
										"Method" : "auto",
										"Interface" : "wlp1s0",
										"Address" : "B2:D3:55:66:44:22",
										"MTU" : 1500
									},
									"IPv4" : {
										"Address" : "192.168.1.20",
										"Gateway" : "192.168.1.1",
										"Method" : "dhcp",
										"Netmask" : "255.255.255.0"
									},
									"IPv4.Configuration" : {
										"Method" : "dhcp"
									},
									"IPv6" : {},
									"IPv6.Configuration" : {
										"Method" : "auto",
										"Privacy" : "disabled"
									},
									"Nameservers" : [],
									"Nameservers.Configuration" : [],
									"Timeservers" : [],
									"Timeservers.Configuration" : [],
									"Domains" : [],
									"Domains.Configuration" : [],
									"Proxy" : {},
									"Proxy.Configuration" : {},
									"Provider" : {}
								} ], [ "/net/connman/service/wifi_c8f733acdf96_446f75636865626167_managed_psk", {
									"Type" : "wifi",
									"Security" : [ "psk" ],
									"State" : "idle",
									"Strength" : 50,
									"Favorite" : false,
									"Immutable" : false,
									"AutoConnect" : false,
									"Name" : "Access Point 2",
									"BSSID" : "21:ef:30:b9:ad:86",
									"MaxRate" : 54000000,
									"Frequency" : 2417,
									"EncryptionMode" : "aes",
									"Ethernet" : {
										"Method" : "auto",
										"Interface" : "wlp1s0",
										"Address" : "E8:F2:33:AC:DF:96",
										"MTU" : 1500
									},
									"IPv4" : {},
									"IPv4.Configuration" : {
										"Method" : "dhcp"
									},
									"IPv6" : {},
									"IPv6.Configuration" : {
										"Method" : "auto",
										"Privacy" : "disabled"
									},
									"Nameservers" : [],
									"Nameservers.Configuration" : [],
									"Timeservers" : [],
									"Timeservers.Configuration" : [],
									"Domains" : [],
									"Domains.Configuration" : [],
									"Proxy" : {},
									"Proxy.Configuration" : {},
									"Provider" : {}
								} ], [ "/net/connman/service/wifi_c8f733acdf96_536563757265446f75636865626167_managed_psk", {
									"Type" : "wifi",
									"Security" : [ "psk" ],
									"State" : "idle",
									"Strength" : 50,
									"Favorite" : false,
									"Immutable" : false,
									"AutoConnect" : false,
									"Name" : "Access Point 3",
									"BSSID" : "25:ad:44:b7:e3:66",
									"MaxRate" : 54000000,
									"Frequency" : 2417,
									"EncryptionMode" : "aes",
									"Ethernet" : {
										"Method" : "auto",
										"Interface" : "wlp1s0",
										"Address" : "A9:28:44:AD:FF:26",
										"MTU" : 1500
									},
									"IPv4" : {},
									"IPv4.Configuration" : {
										"Method" : "dhcp"
									},
									"IPv6" : {},
									"IPv6.Configuration" : {
										"Method" : "auto",
										"Privacy" : "disabled"
									},
									"Nameservers" : [],
									"Nameservers.Configuration" : [],
									"Timeservers" : [],
									"Timeservers.Configuration" : [],
									"Domains" : [],
									"Domains.Configuration" : [],
									"Proxy" : {},
									"Proxy.Configuration" : {},
									"Provider" : {}
								} ] ] ];

								replyMsg = JSON.stringify(results);
								/* simulate scan behavior */
								setTimeout(function() {
									call.successCB(results);
								}, 2000);
								return;
							}
						case WS_REQUEST_TYPE.CONNMAN_SERVICE:
							if (msg.name === 'connect') {
								if (msg.value[0] === '/net/connman/service/wifi_c8f733acdf96_3558364737_managed_psk'
										&& msg.value[1].Passphrase !== '123') {
									call.errorCB('Invalid passphrase');
								} else if (msg.value[0] === '/net/connman/service/wifi_c8f733acdf96_446f75636865626167_managed_psk'
										&& msg.value[1].Passphrase !== '123') {
									call.errorCB('Invalid passphrase');
								} else {
									call.successCB();
									setTimeout(function() {
										fireEvent(WS_EVENT_TYPE.CONNMAN, msg.value[0], 'PropertyChanged', [ "Connected", true ]);
									}, 2000);
								}
								return;
							} else if (msg.name === 'disconnect') {
								call.successCB();
								setTimeout(function() {
									fireEvent(WS_EVENT_TYPE.CONNMAN, msg.value[0], 'PropertyChanged', [ "Connected", false ]);
								}, 2000);
								return;
							} else {
								if (call.errorCB) {
									call.errorCB('Unsupported request: ' + msg.name + ', ' + msg.value);
								}
								return;
							}
							break;
						case WS_REQUEST_TYPE.DATETIME:
							if (msg.name === 'is_time_updates_auto' && msg.value !== undefined) {
								/* default to manual */
								call.successCB(false);
								return;
							} else if (msg.name === 'is_timezone_updates_auto' && msg.value !== undefined) {
								/* default to manual */
								call.successCB(false);
								return;
							} else if (msg.name === 'time' && msg.value !== undefined) {
								call.successCB();
								return;
							} else if (msg.name === 'timezone' && msg.value !== undefined) {
								call.successCB();
								return;
							} else if (msg.name === 'time_updates' && msg.value !== undefined) {
								call.successCB();
								return;
							} else if (msg.name === 'timezone_updates' && msg.value !== undefined) {
								call.successCB();
								return;
							} else {
								if (call.errorCB) {
									call.errorCB('Unsupported request: ' + msg.name + ', ' + msg.value);
								}
								return;
							}
							break;
						case WS_REQUEST_TYPE.DISPLAY:
						case WS_REQUEST_TYPE.SOUND:
						case WS_REQUEST_TYPE.LOCALE:
							if (call.errorCB) {
								call.errorCB('Request not implemented');
							}
							return;
						default:
							if (call.errorCB) {
								call.errorCB('Invalid request type: ' + msg.type);
							}
							return;
						}
					}
					return;
				}
			}
		}
	}

	return {
		connect : connect,
		reconnect : reconnect,
		sendRequest : sendRequest,
		subscribeEvents : subscribeEvents,
		unsubscribeEvents : unsubscribeEvents
	}
})();