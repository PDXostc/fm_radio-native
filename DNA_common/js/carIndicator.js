/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/** 
 * @module Services
 */

/** 
 * Class provides AMB related functionality utilizing `tizen.vehicle` API for signals used in HTML applications. This component is usually initialized by {{#crossLink "Bootstrap"}}{{/crossLink}} class
 * and can be later accessed using {{#crossLink "Bootstrap/carIndicator:property"}}{{/crossLink}} property. Signals recognized by this class needs to be registered in property
 * {{#crossLink "CarIndicator/_mappingTable:property"}}{{/crossLink}}. 
 * 
 * To attach and detach to particular property register new callback object using {{#crossLink "Bootstrap/carIndicator:addListener"}}{{/crossLink}} method, e.g.:
 * 
 *     var listenerId = bootstrap.carIndicator.addListener({ 
 *        onSteeringWheelAngleChanged: function(newValue){
 *           // Process new value
 *        },
 *        onWheelBrakeChanged : function(newValue){
 *           // Process new value
 *        }
 *     });
 * 
 *     // Unregister listener
 *     bootstrap.carIndicator.removeListener(listenerId);
 *
 * Currently following signals are recognized:
 *
 * * SteeringWheelAngle
 *   * SteeringWheelAngle
 * * WheelBrake
 *   * Engaged
 * * TirePressure
 *   * leftFront
 *   * rightFront
 *   * leftRear
 *   * rightRear
 * * DoorStatus
 *   * ChildLockStatus
 * * WindowStatus
 *   * FrontDefrost
 *   * RearDefrost
 * * HVAC
 *   * FanSpeed
 *   * TargetTemperatureRight
 *   * TargetTemperatureLeft
 *   * SeatHeaterRight
 *   * SeatHeaterLeft
 *   * AirConditioning
 *   * AirRecirculation
 *   * AirflowDirection
 * * LightStatus
 *   * Hazard
 *   * Head
 *   * Parking
 * * BatteryStatus
 * * FullBatteryRange
 * * ExteriorTemperature
 *   * Exterior
 * * InteriorTemperature
 *   * Interior
 * * WheelInformation
 *   * FrontWheelRadius
 * * AvgKW
 *   * AvgKW
 * * VehicleSpeed
 * * Odometer
 * * Transmission
 *   * ShiftPosition
 * * ExteriorBrightness
 * * NightMode 
 * * DirectionIndicationINST
 * * DirectionIndicationMS
 * * ACCommand
 * * RecircReq
 * * FrontTSetRightCmd
 * * FrontTSetLeftCmd
 * * FrontBlwrSpeedCmd
 * * HeatedSeatFRModeRequest
 * * HeatedSeatFRRequest
 * * HeatedSeatFLModeRequest
 * * HeatedSeatFLRequest
 * * FLHSDistrCmd
 * * FRHSDistrCmd
 * 
 * @class CarIndicator
 * @constructor
 */
var CarIndicator = function() {
	"use strict";
	console.info("Starting up service CarIndicator");
};

function parseInteger(value) {
	"use strict";
	return parseInt(value, 10);
}

function parseTirePressure(value) {
	"use strict";
	var floatValue = parseFloat(value).toFixed(2);
	if (floatValue > 180 && floatValue < 220) {
		floatValue = "OK";
	}
	return floatValue;
}

/** 
 * Array of registered listeners 
 * @type Object
 * @property _listeners
 * @private
 */
CarIndicator.prototype._listeners = {};

/** 
 * Array of registered listener IDs. 
 * @type Array
 * @property _listenerIDs
 * @private
 */
CarIndicator.prototype._listenerIDs = [];

/** 
 * Signal mapping table.
 * Each entry should form an object
 * @property _mappingTable
 * @private
 * @type Object
 */
CarIndicator.prototype._mappingTable = {
	/*
	ZONE_None   = 000000;
	ZONE_Front  = 000001;
	ZONE_Middle = 000010;
	ZONE_Right  = 000100;
	ZONE_Left   = 001000;
	ZONE_Rear   = 010000;
	ZONE_Center = 100000;
	*/
	/* this is for steeringWheel game controler */
	"SteeringWheelAngle" : {
		propertyName : "SteeringWheelAngle",
		callBackPropertyName : "SteeringWheelAngle",
		subscribeName : "SteeringWheelAngle",
		conversionFunction : function(value) {
			"use strict";
			value = parseInt(value, 10);
			var returnValue = 0;
			if (value <= 180 && value > 0) {
				returnValue = (1 * (value / 6)) - 30;
			} else if (value <= 360 && value > 180) {
				returnValue = ((value - 179) / 6);
			} else if (value === 0) {
				returnValue = -30;
			}
			return returnValue;
		},
		zone : "000000"

	},
	"WheelBrake" : {
		propertyName : "Engaged",
		callBackPropertyName : "WheelBrake",
		subscribeName : "WheelBrake",
		zone : "000000"
	},
	/* end steeringWheel game controler*/
	"TirePressureLeftFront" : {
		propertyName : "leftFront",
		callBackPropertyName : "tirePressureLeftFront",
		subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000"
	},
	"TirePressureRightFront" : {
		propertyName : "rightFront",
		callBackPropertyName : "tirePressureRightFront",
		subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000"
	},
	"TirePressureLeftRear" : {
		propertyName : "leftRear",
		callBackPropertyName : "tirePressureLeftRear",
		subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000"
	},
	"TirePressureRightRear" : {
		propertyName : "rightRear",
		callBackPropertyName : "tirePressureRightRear",
		subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000"
	},
	"ChildLock" : {
		propertyName : "ChildLockStatus",
		callBackPropertyName : "childLock",
		subscribeName : "DoorStatus",
		zone : "000000"
	},
	"FrontDefrost" : {
		propertyName : "Defrost",
		callBackPropertyName : "frontDefrost",
		subscribeName : "WindowStatus",
		zone : "000001"
	},
	"RearDefrost" : {
		propertyName : "Defrost",
		callBackPropertyName : "rearDefrost",
		subscribeName : "WindowStatus",
		zone : "010000"
	},
	"FanSpeed" : {
		propertyName : "FanSpeed",
		callBackPropertyName : "fanSpeed",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"TargetTemperatureRight" : {
		propertyName : "TargetTemperature",
		callBackPropertyName : "targetTemperatureRight",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000100"
	},
	"TargetTemperatureLeft" : {
		propertyName : "TargetTemperature",
		callBackPropertyName : "targetTemperatureLeft",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "001000"
	},
	"Hazard" : {
		propertyName : "Hazard",
		callBackPropertyName : "hazard",
		subscribeName : "LightStatus",
		zone : "000000"
	},
	"Head" : {
		propertyName : "Head",
		callBackPropertyName : "frontLights",
		subscribeName : "LightStatus",
		zone : "000000"
	},
	"SeatHeaterRight" : {
		propertyName : "SeatHeater",
		callBackPropertyName : "seatHeaterRight",
		subscribeName : "HVAC",
		zone : "000101"
	},
	"SeatHeaterLeft" : {
		propertyName : "SeatHeater",
		callBackPropertyName : "seatHeaterLeft",
		subscribeName : "HVAC",
		zone : "001001"
	},
	"Parking" : {
		propertyName : "Parking",
		callBackPropertyName : "rearLights",
		subscribeName : "LightStatus",
		zone : "000000"
	},
	"AirConditioning" : {
		propertyName : "AirConditioning",
		callBackPropertyName : "fan",
		subscribeName : "HVAC",
		zone : "000000"
	},
	"AirRecirculation" : {
		propertyName : "AirRecirculation",
		callBackPropertyName : "airRecirculation",
		subscribeName : "HVAC",
		zone : "000000"
	},
	"AirflowDirection" : {
		propertyName : "AirflowDirection",
		callBackPropertyName : "airflowDirection",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"BatteryStatus" : {
		propertyName : "BatteryStatus",
		callBackPropertyName : "batteryStatus",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"FullBatteryRange" : {
		propertyName : "FullBatteryRange",
		callBackPropertyName : "fullBatteryRange",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"Exterior" : {
		propertyName : "Exterior",
		callBackPropertyName : "outsideTemp",
		subscribeName : "ExteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"Interior" : {
		propertyName : "Interior",
		callBackPropertyName : "insideTemp",
		subscribeName : "InteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"WheelAngle" : {
		propertyName : "FrontWheelRadius",
		callBackPropertyName : "wheelAngle",
		subscribeName : "WheelInformation",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"Weather" : {
		propertyName : "Weather",
		callBackPropertyName : "weather",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"AvgKW" : {
		propertyName : "AvgKW",
		callBackPropertyName : "avgKW",
		subscribeName : "AvgKW",
		conversionFunction : function(newValue) {
			"use strict";
			return parseFloat(newValue).toFixed(2);
		},
		zone : "000000"
	},
	"VehicleSpeed" : {
		propertyName : "VehicleSpeed",
		callBackPropertyName : "speed",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"Odometer" : {
		propertyName : "Odometer",
		callBackPropertyName : "odoMeter",
		conversionFunction : parseInteger,
		zone : "000000"
	},
	"TransmissionShiftPosition" : {
		propertyName : "ShiftPosition",
		callBackPropertyName : "gear",
		conversionFunction : function(value) {
			"use strict";
			switch (value) {
			case 0:
				value = "N";
				break;
			case 64:
				value = "C";
				break;
			case 96:
				value = "D";
				break;
			case 128:
				value = "R";
				break;
			case 255:
				value = "P";
				break;
			}
			return value;
		},
		subscribeName : "Transmission",
		zone : "000000"
	},
	"Randomize" : {
		propertyName : "Randomize",
		callBackPropertyName : "randomize",
		subscribeName : "Randomize",
		zone : "000000"
	},
	"ExteriorBrightness" : {
		propertyName : "ExteriorBrightness",
		callBackPropertyName : "exteriorBrightness",
		zone : "000000"
	},
	"NightMode" : {
		propertyName : "NightMode",
		callBackPropertyName : "nightMode",
		zone : "000000"
	},
	// JLR can signals
	"DirectionIndicationINST" : {
		propertyName : "DirectionIndicationINST",
		callBackPropertyName : "DirectionIndicationINST",
		subscribeName : "DirectionIndicationINST",
		zone : "000000"
	},
	"DirectionIndicationMS" : {
		propertyName : "DirectionIndicationMS",
		callBackPropertyName : "DirectionIndicationMS",
		subscribeName : "DirectionIndicationMS",
		zone : "000000"
	},
	"ACCommand" : {
		propertyName : "ACCommand",
		callBackPropertyName : "ACCommand",
		subscribeName : "ACCommand",
		zone : "000000"
	},
	"RecircReq" : {
		propertyName : "RecircReq",
		callBackPropertyName : "RecircReq",
		subscribeName : "RecircReq",
		zone : "000000"
	},
	"FrontTSetRightCmd" : {
		propertyName : "FrontTSetRightCmd",
		callBackPropertyName : "FrontTSetRightCmd",
		subscribeName : "FrontTSetRightCmd",
		zone : "000000"
	},
	"FrontTSetLeftCmd" : {
		propertyName : "FrontTSetLeftCmd",
		callBackPropertyName : "FrontTSetLeftCmd",
		subscribeName : "FrontTSetLeftCmd",
		zone : "000000"
	},
	"FrontBlwrSpeedCmd" : {
		propertyName : "FrontBlwrSpeedCmd",
		callBackPropertyName : "FrontBlwrSpeedCmd",
		subscribeName : "FrontBlwrSpeedCmd",
		zone : "000000"
	},
	"HeatedSeatFRModeRequest" : {
		propertyName : "HeatedSeatFRModeRequest",
		callBackPropertyName : "HeatedSeatFRModeRequest",
		subscribeName : "HeatedSeatFRModeRequest",
		zone : "000000"
	},
	"HeatedSeatFRRequest" : {
		propertyName : "HeatedSeatFRRequest",
		callBackPropertyName : "HeatedSeatFRRequest",
		subscribeName : "HeatedSeatFRRequest",
		zone : "000000"
	},
	"HeatedSeatFLModeRequest" : {
		propertyName : "HeatedSeatFLModeRequest",
		callBackPropertyName : "HeatedSeatFLModeRequest",
		subscribeName : "HeatedSeatFLModeRequest",
		zone : "000000"
	},
	"HeatedSeatFLRequest" : {
		propertyName : "HeatedSeatFLRequest",
		callBackPropertyName : "HeatedSeatFLRequest",
		subscribeName : "HeatedSeatFLRequest",
		zone : "000000"
	},
	"FLHSDistrCmd" : {
		propertyName : "FLHSDistrCmd",
		callBackPropertyName : "FLHSDistrCmd",
		subscribeName : "FLHSDistrCmd",
		zone : "000000"
	},
	"FRHSDistrCmd" : {
		propertyName : "FRHSDistrCmd",
		callBackPropertyName : "FRHSDistrCmd",
		subscribeName : "FRHSDistrCmd",
		zone : "000000"
	}
};

/** 
 * This method adds listener object for car events. Object should define function callbacks taking signal names from mapping table, e.g.:
 * @example
 *     {
 *        onBatteryChange: function(newValue, oldValue) {}
 *     }
 * Methods are called back with new and last known values.
 * @method addListener
 * @param callback {Object} object with callback functions.
 * @return {Integer} WatchID for later removal of listener.
 */
CarIndicator.prototype.addListener = function(aCallbackObject) {
	"use strict";
	var id = Math.floor(Math.random() * 1000000);
	var self = this;
	this._listeners[id] = aCallbackObject;
	this._listenerIDs.push(id);
	var subscribeCallback = function(data) {
		self.onDataUpdate(data, self);
	};
	for ( var i in aCallbackObject) {
		if (aCallbackObject.hasOwnProperty(i)) {
			var prop = i.replace("on", "").replace("Changed", "");

			for ( var signal in this._mappingTable) {
				if (this._mappingTable.hasOwnProperty(signal)) {
					var mapping = this._mappingTable[signal];
					var zone = parseInt(mapping.zone, 2);
					var subscribeName = signal;

					if (mapping.subscribeName !== undefined) {
						subscribeName = mapping.subscribeName;
					}
					if (mapping.callBackPropertyName.toLowerCase() === prop.toLowerCase() && !mapping.subscribeCount) {
						mapping.subscribeCount = typeof (mapping.subscribeCount) === 'undefined' ? 0 : mapping.subscribeCount++;
						if (typeof (tizen) !== 'undefined') {
							console.log(tizen);
							if (!(subscribeName.toString().trim().toLowerCase() === "nightmode" && id === this._listenerIDs[0])) {
								//TODO: var setUpData = tizen.vehicle.get(subscribeName, zone);
								self.onDataUpdate(setUpData, self, id);
							}

							//TODO: tizen.vehicle.subscribe(subscribeName, subscribeCallback, zone);
						} else {
							console.warn("Tizen API is not available, cannot subscribe to signal", signal);
						}
					}
				}
			}
		}
	}
	console.log("addListener End");
	return id;
};
/** 
 * This method is call as callback if data oon tizen.vehicle was change onDataUpdate
 * @method onDataUpdate
 * @param data {object} object whit new data.
 * @param self {object} this carIndicator Object.
 * @param lisenersID {int} id of listener.
 */
CarIndicator.prototype.onDataUpdate = function(data, self, lisenersID) {
	"use strict";
	if (data !== undefined) {
		var zone = data.zone.toString(2);
		var mapping;

		for ( var property in data) {
			if (data.hasOwnProperty(property)) {
				mapping = undefined;
				if (property !== "time" && property !== "zone" && property.search("Sequence") === -1) {
					for ( var element in self._mappingTable) {
						if (self._mappingTable.hasOwnProperty(element)) {
							if (self._mappingTable[element].propertyName.toLowerCase() === property.toLowerCase()) {
								/* jshint bitwise: false */
								if (!(zone ^ self._mappingTable[element].zone)) {
									/* jshint bitwise: true */
									mapping = self._mappingTable[element];
									break;
								}
							}
						}
					}

					if (typeof (mapping) !== 'undefined') {
						var value = data[property];
						value = mapping.conversionFunction ? mapping.conversionFunction(value) : value;

						var oldValue = self.status[mapping.callBackPropertyName];
						if (oldValue !== value || property.toUpperCase() === "nightMode".toUpperCase()) {
							console.info("AMB property '" + property + "' has changed to new value:" + value);
							self.status[mapping.callBackPropertyName] = value;

							var callbackName = "on" + mapping.callBackPropertyName[0].toUpperCase() + mapping.callBackPropertyName.substring(1) + "Changed";
							var listener;

							if (lisenersID !== undefined) {
								listener = self._listeners[lisenersID];

								if (typeof (listener[callbackName]) === 'function') {
									try {
										listener[callbackName](value, oldValue);
									} catch (ex) {
										console.error("Error occured during executing listener", ex);
									}
								}
							} else {
								for ( var i in self._listeners) {
									if (self._listeners.hasOwnProperty(i)) {
										listener = self._listeners[i];

										if (typeof (listener[callbackName]) === 'function') {
											try {
												listener[callbackName](value, oldValue);
											} catch (ex) {
												console.error("Error occured during executing listener", ex);
											}
										}
									}
								}
							}
						}

					} else {
						console.warn("Mapping for property '" + property + "' is not defined");
					}
				}
			}
		}
	}
};

/** 
 * This method removes previosly added listener object. Use WatchID returned from addListener method.
 * @method removeListener
 * @param aId {Integer} WatchID.
 */
CarIndicator.prototype.removeListener = function(aId) {
	"use strict";
	var listener = this._listeners[aId];

	for ( var i in listener) {
		if (listener.hasOwnProperty(i)) {
			var prop = i.replace("on", "").replace("Changed", "");

			for ( var signal in this._mappingTable) {
				if (this._mappingTable.hasOwnProperty(signal)) {
					var mapping = this._mappingTable[signal];

					if (mapping.subscribeCount === 0) { // Last signal, unscubscribe
						tizen.vehicle.unsubscribe(signal);
						mapping.subscribeCount = undefined;
					} else if (typeof (mapping.subscribeCount) !== 'undefined') {
						mapping.subscribeCount--;
					}
				}
			}
		}
	}

	this._listeners[aId] = undefined;
};

/** 
 * status object 
 * @property status
 * @type Object
 * @private
 */
CarIndicator.prototype.status = {
	fanSpeed : 0,
	targetTemperatureRight : 0,
	targetTemperatureLeft : 0,
	hazard : false,
	frontDefrost : false,
	rearDefrost : false,
	frontLeftwhell : "",
	frontRightwhell : "",
	rearLeftwhell : "",
	rearRightwhell : "",
	childLock : false,
	frontLights : false,
	rearLights : false,
	fan : false,
	seatHeaterRight : 0,
	seatHeaterLeft : 0,
	airRecirculation : false,
	airflowDirection : 0,
	batteryStatus : 58,
	fullBatteryRange : 350,
	outsideTemp : 74.2,
	insideTemp : 68.2,
	wheelAngle : 0,
	weather : 1,
	avgKW : 0.28,
	speed : 65,
	odoMeter : 75126,
	gear : "D",
	nightMode : false,
	randomize : false,
	exteriorBrightness : 1000
};

/** 
 * This method return status object in callback
 * @method getStatus
 * @param callback {function} callback function.
 */
CarIndicator.prototype.getStatus = function(callback) {
	"use strict";
	callback(this.status);
};

/** 
 * this method set status for property in tizen.vehicle and status object
 * @method setStatus
 * @param indicator {string} indicator name.
 * @param status {??} ??.
 * @param text_status {string} new status .
 * @param callback {function} callback function.
 */
CarIndicator.prototype.setStatus = function(indicator, newValue, callback, zone) {
	"use strict";
	var mappingElement, mappingProperty;
	for ( var element in this._mappingTable) {
		if (this._mappingTable.hasOwnProperty(element)) {
			mappingProperty = undefined;
			if (this._mappingTable[element].callBackPropertyName.toLowerCase() === indicator.toLowerCase()) {
				mappingElement = this._mappingTable[element];
				mappingProperty = this._mappingTable[element].propertyName;
				break;
			}
		}
	}

	// this.status[indicator] = status === "true";
	if (mappingProperty !== undefined) {
		var objectName = mappingElement.subscribeName;
		var propertyZone = parseInt(mappingElement.zone, 2);
		var propertyValue = {};
		propertyValue[mappingProperty] = newValue;
		propertyValue.zone = propertyZone;

		tizen.vehicle.set(objectName, propertyValue, function(msg) {
			console.error("Set error: " + msg);
		});
	}
	if (!!callback) {
		callback();
	}
};
