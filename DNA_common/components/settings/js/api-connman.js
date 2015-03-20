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

/* Namespace */
var settings = settings || {};
settings.connman = settings.connman || {};

/* Module */
settings.connman = (function() {

	var default_adapter = null;

	/* Technology class */
	var ConnmanTechnology = function(technology_path, technology_properties) {
		this.id = technology_path;
		this.prop = technology_properties;
	};

	ConnmanTechnology.prototype.setPowered = function(powered, success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		if (this.setPowerInProgress) {
			console.log('Enabling/disabling technology in progress');
			return;
		}

		var me = this;
		this.setPowerInProgress = true;
		setTimeout(function() {
			wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_TECHNOLOGY, 'enable', [ me.id, powered ], function() {
				me.setPowerInProgress = false;
				success_cb();
			}, function(e) {
				if (e.indexOf('Already enabled') >= 0) {
					console.log('connman ' + me.prop.Type + ' already enabled');
					me.setPowerInProgress = false;
					success_cb();
				} else if (e.indexOf('Already disabled') >= 0) {
					console.log('connman ' + me.prop.Type + ' already disabled');
					me.setPowerInProgress = false;
					success_cb();
				} else {
					me.setPowerInProgress = false;
					error_cb(e);
				}
			})
		}, 2000);
	};

	ConnmanTechnology.prototype.getPowered = function(success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		var me = this;
		wsAPI.sendRequest(this.prop.Type, 'is_enabled', null, function(isEnabled) {
			if (isEnabled === undefined) {
				console.log('Badly formed json message: ' + json_msg);
			}
			me.powered = isEnabled;
			success_cb(me.powered);
		}, error_cb);
	};

	ConnmanTechnology.prototype.setTethering = function(identifier, passphrase, enabled, success_cb, error_cb) {
		if (wsAPI === undefined) {
			return;
		}

		var me = this;
		var index = me.id.lastIndexOf('/');
		var technology = me.id.substring(index + 1).toString().trim().toLowerCase();
		if (technology !== "wifi") {
			return;
		}

		var info = {
			path : me.id,
			ssid : identifier === undefined ? me.prop.TetheringIdentifier : identifier,
			password : passphrase === undefined ? me.prop.TetheringPassphrase : passphrase,
			enabled : enabled === undefined ? me.prop.Tethering : enabled
		};
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_TECHNOLOGY, 'set_tethering', info, function() {
			if (!!success_cb) {
				success_cb();
			}
		}, function(e) {
			if (!!error_cb) {
				error_cb(e);
			}
		});
	};

	/* Service class */
	ConnmanService = function(service_path, service_properties) {
		this.id = service_path;
		this.prop = service_properties;
	};

	ConnmanService.prototype.connect = function(name, passphrase, type, success_cb, error_cb) {
		if (wsAPI === undefined)
			return;

		var info = [ this.id, {
			'Name' : name === undefined ? this.prop.Name : name,
			'Type' : type === undefined ? this.prop.EncryptionMode : type,
			'Passphrase' : passphrase
		} ];
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_SERVICE, 'connect', info, success_cb, error_cb);
	};

	ConnmanService.prototype.disconnect = function(success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_SERVICE, 'disconnect', [ this.id, null ], success_cb, error_cb);
	};

	ConnmanService.prototype.setAutoConnect = function(enabled, success_cb, error_cb) {
		if (wsAPI === undefined) {
			return;
		}

		var me = this;
		if (!!me.prop && me.prop.Type !== "wifi") {
			return;
		}

		var info = {
			path : me.id,
			enable : enabled === undefined ? me.prop.AutoConnect : enabled
		};
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_SERVICE, 'autoconnect', info, function() {
			if (!!success_cb) {
				success_cb();
			}
		}, function(e) {
			if (!!error_cb) {
				error_cb(e);
			}
		});
	};

	function getTechnologies(success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_MANAGER, 'get_technologies', null, function(results) {
			if (results.length >= 0 && results[0].length >= 0 && results[0][0][0] === undefined) {
				error_cb('Cannot parse technologies');
				return;
			}

			var technologies_list = results[0];

			try {
				var technologies = [];
				for ( var i = 0; i < technologies_list.length; i++) {
					if (technologies_list[i][0] === undefined || technologies_list[i][1] === undefined) {
						console.log('Badly form json message: ' + json_msg);
					}

					var technology = new settings.connman.ConnmanTechnology(technologies_list[i][0], technologies_list[i][1]);
					technologies.push(technology);
				}
			} catch (e) {
				error_cb(e);
			}
			success_cb(technologies);
		}, error_cb);
	}

	function getServices(success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_MANAGER, 'get_services', null, function(results) {
			if (results.length >= 0 && results[0].length >= 0 && results[0][0][0] === undefined) {
				error_cb('Cannot parse get_services results');
				return;
			}

			var services_list = results[0];

			try {
				var results = [];
				for ( var i = 0; i < services_list.length; i++) {
					if (services_list[i][0] === undefined || services_list[i][1] === undefined) {
						console.log('Badly form json message: ' + json_msg);
					}

					var service = new settings.connman.ConnmanService(services_list[i][0], services_list[i][1]);
					results.push(service);
				}
			} catch (e) {
				error_cb(e);
			}
			success_cb(results);
		}, error_cb);
	}

	function scan(technology, success_cb, error_cb) {
		if (wsAPI === undefined)
			return;
		wsAPI.sendRequest(WS_REQUEST_TYPE.CONNMAN_TECHNOLOGY, 'scan', [ technology, null ], function(results) {
			if (results.length >= 0 && results[0].length >= 0 && results[0][0][0] === undefined) {
				error_cb('Cannot parse scan results');
				return;
			}

			var services_list = results[0];

			try {
				var services = [];
				for ( var i = 0; i < services_list.length; i++) {
					if (services_list[i][0] === undefined || services_list[i][1] === undefined) {
						console.log('Badly form json message: ' + json_msg);
					}

					var service = new settings.connman.ConnmanService(services_list[i][0], services_list[i][1]);
					services.push(service);
				}
			} catch (e) {
				error_cb(e);
			}
			success_cb(services);
		}, error_cb);
	}
	;

	return {
		ConnmanTechnology : ConnmanTechnology,
		ConnmanService : ConnmanService,
		getTechnologies : getTechnologies,
		getServices : getServices,
		scan : scan
	};
})();
