/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
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
