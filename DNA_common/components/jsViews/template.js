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

var template = {
		// params:
		// model - model to apply
		// pathToTemplate - path to file where template is located
		// element - (type string) name of element, where template will be rendered,
		// default: content
		compile: function (model, pathToTemplate, element, doneCallBack) {
			"use strict";
			if (element === null || element === undefined) {
				element = "#content";
			}

			$.get(pathToTemplate, function (data) {
				$.templates({
					tmpl : data
				});
				$(element).html($.render.tmpl(model));
				if (!!doneCallBack) {
					doneCallBack();
				}
			}, "html").error(function (data) {
				console.log(pathToTemplate + " jQuery GET error status: " + data.status + " status text: " + data.statusText);
				console.log(data);
			});
		}
	};
