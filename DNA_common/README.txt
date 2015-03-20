
Copyright (c) 2014, Intel Corporation, Jaguar Land Rover

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Name: Common
Name: Settings
Version: XW_TizenIVI3_0_01FEB_AGL_05MAR2015
Maintainer: Art McGee <amcgee7@jaguarlandrover.com>
Mailing list: dev@lists.tizen.org

Build Instructions: 

	Doesn't apply common code is used in the build process by other apps
	and doesn't have any build process alone.

KnownIssues: 
	* Wifi, RVI, Hotspot are not presently finished in Settings.
	* Bluetooth is not consistantly able to pair and you may need to reboot or
	  remove devices with bluetoothctl before it will pair again.


