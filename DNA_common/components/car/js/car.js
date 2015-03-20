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

/*global ThemeKeyColor */

/** 
 * @module CarTheme
 */

/** 
* This function dowloads javascript file, saves it to local cache and injects it to HTML document.
* @method loadScript
* @for window
* @param {string} scriptPath DOM object which to save the downloaded Javascript as Base64.
* @param {function(status)} callback - callback function.
*/
function loadScript(path, callback) {
    "use strict";
    console.log("loadScript("+path+")");
    var scripts = document.getElementsByTagName("script"),
        i = 0,
        done = false,
        scriptElement;

    var tempPath = path;
    if (tempPath.startsWith("./")) {
        tempPath = tempPath.substring(1);
    }

    for (i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf(tempPath) !== -1) {
            callback(path, "ok");
            return;
        }
    }

    scriptElement = document.createElement('script');

    function handleLoad() {
        if (!done) {
            done = true;
            if (callback !== null) {
                callback(path, "ok");
            }
        }
    }

    scriptElement.onload = handleLoad;

    scriptElement.onreadystatechange = function () {
        var state;

        if (!done) {
            state = scriptElement.readyState;
            if (state === "complete") {
                handleLoad();
            }
        }
    };

    scriptElement.onerror = function () {
        if (!done) {
            done = true;
            if (callback !== null) {
                callback(path, "error");
            }
        }
    };

    scriptElement.src = path;
    scriptElement.type = "text/javascript";

    document.getElementsByTagName('head')[0].appendChild(scriptElement);
}

/** 
* Function tests if string starts with substring passed as parameter.
* @method startsWith
* @param {String} str Substring to verify.
* @for String
* @return {bool} true if string starts with substring.
*/
String.prototype.startsWith = function (str){
    "use strict";
    return this.indexOf(str) === 0;
};

/** 
* Function checks if script or CSS file is included in HTML <head>.
* @method checkIfIncluded
* @param {String} file Path to file name to test.
* @for window
* @return {bool} true if script / CSS is included in html.
*/
function checkIfIncluded(file) {
    "use strict";
    var links = document.getElementsByTagName("link"),
        i = 0,
        scripts = document.getElementsByTagName("script");

    for (i = 0; i < links.length; i++) {
        if (links[i].href.substr(-file.length) === file) {
            return true;
        }
    }

    for (i = 0; i < scripts.length; i++) {
        if (scripts[i].src.substr(-file.length) === file) {
            return true;
        }
    }

    return false;
}

/** 
* Function changes image background color by replacing key color with color provided as parameter.
* @method changeCssBgImageColor
* @for window
* @param {string} selector jQuery selector .
* @param {string} bgcolor New background color in HEX code.
*/

function changeCssBgImageColor(selector, bgcolor) {
    "use strict";
    var imageSource = $(selector).css("background-image"),
        patt = /\"|\'|\)|\(|url/g, //remove 'url' and '()' from background-image property
        img, ctx, w, h;

    if (imageSource !== undefined) {
        console.log(imageSource);
        imageSource = imageSource.replace(patt, '');

        img = new Image();
        ctx = document.createElement('canvas').getContext('2d');

        img.onload = function () {
            w = ctx.canvas.width = img.width;
            h = ctx.canvas.height = img.height;
            ctx.fillStyle = bgcolor || ThemeKeyColor;
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(img, 0, 0);

            $(selector).css('background-image', 'url(' + ctx.canvas.toDataURL() + ')');
            $(selector).css('visibility', 'visible');
        };

        img.src = imageSource;
    }
}
/** 
* Function loads teplate HTML code into script element with name provided as paramater.
* @method loadTemplate
* @for window
* @param {string} baseUrl HTLM URL to load.
* @param {string} name Element name to store loaded template.
* @param {callback} callback Callback function called when code was injected to HTML structure.
*/
function loadTemplate(baseUrl, name, callback) {
    "use strict";
    var template = document.getElementById(name);

    if (!!template) {
        callback();
    } else {
        jQuery.get(baseUrl + name + '.html', function (data) {
            var scriptTag = $('<script type="text/html" id="' + name + '"></script>');
            scriptTag.html(data);
            $('body').append(scriptTag);
            callback();
        });
    }
}
/** 
* Function shows loading spinner.
* @method showLoadingSpinner
* @for window
* @param {string} text Text to show in loading spinner.
*/
function showLoadingSpinner(text) {
    "use strict";
    if (!$("#loadingSpinnerWrapper").length) {
        var spinner = '';
        spinner += '<div id="loadingSpinnerWrapper" class="loadingSpinnerWrapper">';
        spinner += '<div id="loadingSpinner" class="loadingSpinner pageBgColorNormalTransparent">';
        spinner += '<div id="loadingSpinnerContent" class="loading-container">';
        spinner += '<div id="loadingSpinnerImg" class="loading"></div>';
        spinner += '<div id="loadingSpinnerText" class="loading-text fontSizeXXSmall fontWeightBold fontColorNormal">';
        spinner += (!!text && text !== "") ? text.toUpperCase() : "";
        spinner += '</div>';
        spinner += '</div>';
        spinner += '</div>';
        spinner += '</div>';
        $(spinner).appendTo($("body"));
        $("#loadingSpinnerWrapper").show();
    } else {
        if (!!text && text !== "") {
            $("#loadingSpinnerText").text(text);
        } else {
            $("#loadingSpinnerText").text("");
        }
        $("#loadingSpinnerWrapper").show();
    }
}
/** 
* Function hides loading spinner.
* @method hideLoadingSpinner
* @for window
* @param {string} text Text to show in loading spinner.
*/
function hideLoadingSpinner(text) {
    "use strict";
    if ($("#loadingSpinnerWrapper").length) {
        if (text === undefined || text.toString().trim().toLowerCase() === $("#loadingSpinnerText").text().toString().trim().toLowerCase()) {
            $("#loadingSpinnerWrapper").hide();
        }
    }
}
/** 
* Function returns formatted phone number into unified format starting with + sign.
* @method formatPhoneNumber
* @for window
* @param {string} phoneNumber Unformated phone number.
*/
function formatPhoneNumber(phoneNumber) {
    "use strict";
    var convPhoneNumber = phoneNumber;

    if (!!convPhoneNumber) {
        convPhoneNumber = convPhoneNumber.toString();
        convPhoneNumber = convPhoneNumber.trim().replace(/^\+/, "00"); // replace leading '+' by '00'
        convPhoneNumber = convPhoneNumber.trim().replace(/\D/g, "");  // remove all non-digit characters, ie. 00123-123(123) => 00123123123
        convPhoneNumber = convPhoneNumber.trim().replace(/^00/, "+"); // replace leading '00' by '+'
    }

    return convPhoneNumber;
}
