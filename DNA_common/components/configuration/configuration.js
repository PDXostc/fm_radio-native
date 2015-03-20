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
 * @module Services
 */

/** 
 * Class provides unified access to shared configuration settings between applications using [Tizen FileSystem API](https://developer.tizen.org/dev-guide/2.2.1/org.tizen.web.device.apireference/tizen/filesystem.html). 
 * Internally uses `JSON.stringify()` and  `JSON.parse()` so its possible to store even complex structures as values. This component is usually initialized by {{#crossLink "Bootstrap"}}{{/crossLink}} class
 * and can be later accessed using global {{#crossLink "Configuration"}}{{/crossLink}} object.
 * 
 * To attach and detach listener to detect changes in configuration register new callback function using {{#crossLink "Configuration/addUpdateListener:method"}}{{/crossLink}} method, e.g.:
 * 
 *     var listenerId = Configuration.addUpdateListener(function() {
 *        // Process configuration
 *     });
 * 
 *     // Unregister listener
 *     Configuration.removeUpdateListener(listenerId);
 * 
 * Changes are detected on global configuration level so each listener is responsible for detecting changes in interested properties. Use {{#crossLink "Configuration/get:method"}}{{/crossLink}} 
 * method to get new value or {{#crossLink "Configuration/set:method"}}{{/crossLink}} method to set and save new value.
 *
 * In special cases it's possible to force update in configuration file by calling {{#crossLink "Configuration/save:method"}}{{/crossLink}} method or force update of configuration object by calling
 * {{#crossLink "Configuration/reload:method"}}{{/crossLink}} method.
 *  
 * @class Configuration 
 * @constructor
 */
var Configuration = (function() {
	"use strict";
	function Configuration() {
		console.info("Starting up service Configuration");
	}
	Configuration.prototype = function() { };

    /** 
     * Contains array of attached callbacks.
     * @property _updateCallbacks
     * @private
     * @type Array
     */
	Configuration.prototype._updateCallbacks = {};

    /** 
     * Defines file name used for storing configuration object.
     * @property _settingsFileName
     * @private
     * @type String
     */
	Configuration.prototype._settingsFileName = "__intel_ivi.settings";

    /** 
     * Defines Tizen filesystem storage name used for storing configuration object.
     * @property _settingsStorageName
     * @private
     * @type String
     */
    Configuration.prototype._settingsStorageName = "downloads";

    /** 
     * Defines default values used when no valid configuration file is available.
     * @property _values
     * @private
     * @type Object
     */
	Configuration.prototype._values = {
        version: 0.4,
		selectedTheme: "http://com.intel.tizen/blue",
        bluetooth: {
            devices: null,
            lastSync: null
        }
	};

    /** 
     * Method adds update listener which is fired after any property is changed. 
     * @method addUpdateListener 
     * @param aCallback {function()} Callback to be invoked after property is changed.
     * @return {Integer} ID that can be used for removal of update listener.
     */
	Configuration.prototype.addUpdateListener = function(aCallback) {
		var id = Math.floor(Math.random() * 1000000);
		this._updateCallbacks[id] = aCallback;

		return id;
	};

    /** 
     * Method removes update listener from list of listeners. 
     * @method removeUpdateListener 
     * @param aId {Integer} ID returned from addUpdateListener method.
     */
	Configuration.prototype.removeUpdateListener = function(aId) {
		this._updateCallbacks[aId] = undefined;
	};

    /** 
     * Gets configuration property from storage. 
     * @method get 
     * @param aKey {String} Property key for value to be retieved.
     * @return {Object} Property value.
     */
	Configuration.prototype.get = function(aKey) {
        if (typeof(this._values[aKey]) === 'object') {
            return JSON.parse(JSON.stringify(this._values[aKey]));
        }
        return this._values[aKey];
	};

    /** 
     * Sets configuration property to storage and invokes update listeners.
     * @method set 
     * @param aKey {String} Property key for value to be retieved.
     * @param aValue {String} New value for property.
     * @param callListeners {Boolean} Indicates if listeners should be fired.
     */
	Configuration.prototype.set = function(aKey, aValue, callListeners) {
		this._values[aKey] = aValue;
        this.save();
        if (callListeners === undefined || callListeners) {
            this._callListeners();
        }
	};

	Configuration.prototype._callListeners = function () {
        for (var i in this._updateCallbacks) {
            if (this._updateCallbacks.hasOwnProperty(i)) {
                try {
                    this._updateCallbacks[i]();
                } catch (ex) {
                    console.log("Error occured during callback invocation", ex);
                }
            }
        }
	};

    /** 
     * Method reloads all property values from storage and fires update listeners once done. 
     * @method reload 
     * @param aCallback {function()} Callback to be invoked after all properties are loaded from storage.
     */
	Configuration.prototype.reload = function (aCallback) {
		var self = this;
        aCallback = aCallback || function() {};

        if (typeof(tizen) !== 'undefined') {
			//console.log("Settings updated.", this._settingsStorageName);
            tizen.filesystem.resolve(this._settingsStorageName, function(directory) {
                var settingsFile;
                try {
                     settingsFile = directory.resolve(self._settingsFileName);
                } catch(ex) {
                    console.warn("Settings file doesn't exist, creating ...", ex);
                    settingsFile = directory.createFile(self._settingsFileName);
                }

                settingsFile.readAsText(function(contents) {
                    //console.log("Settings file contents", contents);
                    var configValues = null;

                    if (contents.length > 0) {
                        try {
                            configValues = JSON.parse(contents);
                        }
                        catch (ex) {
                            console.error("Error occured during parsing settings file", ex);
                            aCallback(ex);
                        }
                    }

                    if (!configValues || !configValues.version || configValues.version < self._values.version) {
                        configValues = jQuery.extend({}, self._values);
                        self.save();
                    }
                    //console.log("Loaded settings:", configValues);

                    if (JSON.stringify(configValues) !== JSON.stringify(self._values)) {
                        console.log("Settings updated.");
                        self._values = configValues;
                        self._callListeners();
                    }

                    aCallback();
                }, function(ex) {
                    console.error("Cannot read settings file", ex);
                    aCallback(ex);
                });
            }, function(error) {
                console.error("Error occured during opening Documents directory", error);
                aCallback(error);
            }, "rw");
        } else {
            console.warn("Tizen API is not available, cannot read settings from persistent storage.");
            aCallback();
        }
	};

    /** 
     * Method saves all property values to storage. 
     * @method save 
     */
	Configuration.prototype.save = function () {
		var self = this;

        if (typeof(tizen) !== 'undefined') {
            tizen.filesystem.resolve(this._settingsStorageName, function(directory) {
                var settingsFile;
                try {
                     settingsFile = directory.resolve(self._settingsFileName);
                } catch(ex) {
                    console.warn("Settings file doesn't exist, creating ...", ex);
                    settingsFile = directory.createFile(self._settingsFileName);
                }

                settingsFile.openStream("w", function(stream) {
                    console.log("Writing new settings", self._values);

                    stream.write(JSON.stringify(self._values));

                    stream.close();
                }, function(ex) {
                    console.error("Cannot read settings file", ex);
                });

            }, function(error) {
                console.error("Error occured during opening Documents directory", error);
            }, "rw");
        } else {
            console.warn("Tizen API is not available, cannot read settings from persistent storage.");
        }
	};

    window.__configuration = undefined === window.__configuration ? new Configuration() : window.__configuration;

    return window.__configuration;
})();
