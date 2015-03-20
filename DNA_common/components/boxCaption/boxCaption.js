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
 * @module CarTheme
 **/
(function ($) {
    "use strict";
    /**
     * Represents static UI element composed of rectangle and caption that can be used as a section title. 
     * This component is required by {{#crossLink "Library"}}{{/crossLink}} class.
     *
     * Use following snippet to include component in your `index.html` file:
     *
     *     <script type='text/javascript' src='./common/components/boxCaption/boxCaption.js'></script>
     *     <link rel="stylesheet" href="./common/components/boxCaption/boxCaption.css" />
     *
     * Box caption provides following options for UI representations:
     *  
     * * {{#crossLink "BoxCaption/init:method"}}{{/crossLink}} - Standard size of rectangle and light text color 
     * (e.g. Exterior brightness in {{#crossLinkModule "DashboardApplication"}}{{/crossLinkModule}})     
     * * {{#crossLink "BoxCaption/initSmall:method"}}{{/crossLink}} - Small size of rectangle and light text color 
     * (e.g. Category title in {{#crossLink "Library"}}{{/crossLink}})
     *
     * Use following code to initialize:
     *
     *     $('#box').boxCaptionPlugin('init', "Caption");        // OR
     *     $('#box').boxCaptionPlugin('initSmall', "Caption");
     *
     * @class BoxCaption
     * @constructor
     */
    var BoxCaption = {
            /**
             * Generates and shows default box caption element on the screen.
             * 
             * @method init
             * @param caption {String} Caption text.
             */
            init: function (caption) {
                this.empty();
                var appendText = '<div class="boxIconRectangle bgColorTheme"></div>';
                appendText += '<div class="boxIconCaption fontSizeXSmall fontWeightBold fontColorLight">';
                appendText += caption.toUpperCase();
                appendText += '</div>';
                this.append(appendText);
            },
            /**
             * Generates and shows small box caption element on the screen.
             * 
             * @method initSmall
             * @param caption {String} Caption text.
             */
            initSmall: function (caption) {
                this.empty();
                var appendText = '<div class="boxIconRectangleSmall bgColorTheme"></div>';
                appendText += '<div class="boxIconCaptionSmall boxCaptionText">';
                appendText += caption.toUpperCase();
                appendText += '</div>';
                this.append(appendText);
            }
        };
    /** 
     * jQuery extension method for {{#crossLink "BoxCaption"}}{{/crossLink}} plugin.
     * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
     * @method boxCaptionPlugin
     * @for jQuery
     * @return Result of called method.
     */
    $.fn.boxCaptionPlugin = function (method) {
        // Method calling logic
        if (BoxCaption[method]) {
            return BoxCaption[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return BoxCaption.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.boxCaptionPlugin');
        }
    };
}(jQuery));
