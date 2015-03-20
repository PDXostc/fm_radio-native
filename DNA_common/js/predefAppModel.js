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
 * Contains area definitions for applications radial menu and apps definitions.
 * @class predefAppModel
 * @module HomescreenApplication
 **/
/**
 * Define center point of radial menu
 * @property centerPoint 
 * @type Object
 * @default {x: 360, y: 675}
 * @static
 **/
var centerPoint = {x: 360, y: 675};

/**
 * Definitions of radial pie.
 * Possible properties in contained Objects:
 * name, id, action, sectorID, iconPath, shape, sc, lc, sa, la 
 * @property areasDefinitions 
 * @type Array
 **/
/**
 * Name of an application
 * @property name
 * @type string
 **/
/**
 * Id of an application
 * @property id
 * @type string
 **/
/**
 * Action after click to defined area.
 * @property action
 * @type function
 **/
/**
 * Sector id in context to homescreen pie sectors
 * @property sectorID
 * @type int
 **/
/**
 * Path to app icon
 * @property iconPath
 * @type string
 **/
/**
 * Define shape of clicking area
 * @property shape
 * @type string
 **/
/**
 * Small circle - define distance from center, where pie sector starts (influence only if shape is pieWithoutCenter)
 * @property sc
 * @type int
 **/
/**
 * Large circle - define distance from center, where pie sector ends
 * @property lc
 * @type int
 **/
/**
 * Start angle - define starting ange of pie sector. Angle is based on zero angle(zero angle has a line, which is horizontal and starts in the center point) (influence only if shape is pieWithoutCenter).
 * @property sa
 * @type int
 **/
/**
 * End angle - define ending angle of pie sector (influence only if shape is pieWithoutCenter).
 * @property la
 * @type int
 **/
var areasDefinitions = [ {
	name: 'center',
	id: null,
	action: function () {
		"use strict";
		$("#homeScrAppGridView").fadeIn();
	},
	sectorId: 0,
	lc: 70,
	shape: 'cenerCircle'
}, {
	name: 'navigation',
	id: 'intelPoc11.navigation',
	iconPath: '../navigation/icon.png',
	sectorId: 1,
	sc: 104,
	lc: 497,
	sa:	61,
	la:	117,
	shape: 'pieWithoutCenter'
}, {
	name: "airconditioning",
	id: 'intelPoc16.HVAC',
	iconPath: '../dashboard/icon.png',
	sectorId: 2,
	sc: 94,		//small circle border
	lc: 437,	//large circle border
	sa:	11,		//smaller angle based on horizontal line which starts in center and continue right (right border) 
	la:	55,		//larger angle (left border)
	shape: 'pieWithoutCenter'
}, {
	name: 'MultimediaPlayer',
	id: 'intelPoc14.MultimediaPlayer',
	iconPath: '../musicplayer/icon.png',
	sectorId: 3,
	sc: 80,
	lc: 392,
	sa:	321,
	la:	359.9,
	shape: 'pieWithoutCenter'
}, {
	name: 'SmartDeviceLink',
	id: 'intelPoc17.SDL',
	iconPath: '../smartdevicelink/icon.png',
	sectorId: 4,
	sc: 80,
	lc: 384,
	sa:	268,
	la:	306,
	shape: 'pieWithoutCenter'
}, {
	name: 'phone',
	id: 'xwalk.hpjjjnbkfcbpdjaplleojadhidkmakcn',
	iconPath: '../phone/icon.png',
	sectorId: 5,
	sc: 82,
	lc: 364,
	sa:	217,
	la:	264,
	shape: 'pieWithoutCenter'
}, {
	name: 'store',
	id: 'intelPoc13.Store',
	iconPath: '../store/icon.png',
	sectorId: 6,
	sc: 82,
	lc: 364,
	sa:	170,
	la:	212,
	shape: 'pieWithoutCenter'
}, {
	name: 'dashboard',
	id: 'intelPoc12.Dashboard',
	iconPath: '../dashboard/icon.png',
	sectorId: 7,
	sc: 105,
	lc: 433,
	sa:	126,
	la:	160,
	shape: 'pieWithoutCenter'
} ];
