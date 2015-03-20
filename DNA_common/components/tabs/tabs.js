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

/*global loadScript, template */

/**
 * @module CarTheme
 **/

/**
 * Tabs is standard **JQuery plugin** which represents data UI control element that is used to display to divide UI into multiple logical sections, so called tabs.
 * Rendering of individual parts of this element is done by template mechanism.
 * 
 * This class requires following componets:
 * 
 * * {{#crossLink "BoxCaption"}}{{/crossLink}} component
 *
 * This class is usually loaded from {{#crossLink "Settings"}}{{/crossLink}} component and since this component is included in every Tizen PoC
 * application it's available for future use. Use following code to initialize:
 *
 *      $('#tabPage').tabs("setSectionTitle", "SECTION");
 *      $('#tabPage').tabs("setSectionHint", "section hint");
 *      $('#tabPage').tabs('init');
 *
 * Hover and click on elements in images below to navigate to components or driving properties of Tabs application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/tabs.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="1,1,360,31" alt="Tabs title" title="Tabs title" href="{{#crossLinkRaw "Tabs/sectionTitle:property"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="1,32,577,80" alt="Top Tab menu" title="Top tab menu" href="{{#crossLinkRaw "Tabs/selectedTopTabIndex:property"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="578,1,648,80" alt="Close Tabs" title="Closes Tabs" href="{{#crossLinkRaw "Tabs/hidePage:method"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="1,81,648,1151" alt="Tabs content" title="Tabs content" target="_self" href="{{#crossLinkRaw "Tabs/contentDelegate:property"}}{{/crossLinkRaw}}" >
 *  </map>
 * </img>
 *
 * @class Tabs
 * @static
 */

/** 
 * Default sub panel delegate to render sub panel view.
 * @property TABS_SUB_PANEL_DELEGATE_DEFAULT
 * @type {String}
 * @default "./DNA_common/components/tabs/templates/subPanelDelegate.html"
 * @static
 * @final
 */
/** 
 * Default top panel delegate to render top panel view.
 * @property TABS_TOP_PANEL_DELEGATE_DEFAULT
 * @type {String}
 * @default "./DNA_common/components/tabs/templates/tabMenuItemDelegate.html"
 * @static
 * @final
 */
var TABS_SUB_PANEL_DELEGATE_DEFAULT = "./DNA_common/components/tabs/templates/subPanelDelegate.html",
	TABS_TOP_PANEL_DELEGATE_DEFAULT = "./DNA_common/components/tabs/templates/tabMenuItemDelegate.html";

(function ($) {
	"use strict";
	var Tabs = {
			thisObj: null,
			/** 
			 * Main content template.
			 * @property contentDelegate
			 * @type {String}
			 * @default null
			 */
			contentDelegate: null,
			/** 
			 * Tabs content template.
			 * @property topPanelDelegate
			 * @type {String}
			 * @default TABS_TOP_PANEL_DELEGATE_DEFAULT
			 */
			topPanelDelegate: TABS_TOP_PANEL_DELEGATE_DEFAULT,
			/** 
			 * Sub panel content template.
			 * @property subpanelDelegate
			 * @type {String}
			 * @default TABS_SUB_PANEL_DELEGATE_DEFAULT
			 */
			subPanelDelegate: TABS_SUB_PANEL_DELEGATE_DEFAULT,
			/** 
			 * Tabs title.
			 * @property sectionTitle
			 * @type {String}
			 * @default null
			 */
			sectionTitle: null,
			/** 
			 * Index of selected tab.
			 * @property selectedTopTabIndex
			 * @type {Number}
			 * @default -1
			 */
			selectedTopTabIndex: -1,

			/**
			 * Initializes tabs layout and create it's basic view DOM. 
			 * 
			 * @method init
			 */
			init: function () {
				this.empty();
				var str = "<div id='tabsTopPanel' class='tabsTopPanel' onclick='$(\"#settingsTabs\").tabs(\"hidePage\")'>";
				str += "<div class='tabsTopPanelTitle'></div>";
				str += "<div class='tabsCloseButton' onClick=\'$(\"#" + this.attr('id') + "\").tabs(\"hidePage\")\'></div>";
				str += "<div id='tabsTabsID' class='tabsTabs'></div>";
				str += "</div>";
				str += "<div id='tabsTopSubPanel' class='tabsTopSubPanel'></div>";
				str += "<div id='tabsContent' class='tabsContent'></div>";
				str += "<div class='tabsTopPanelTitleHint fontSizeXXSmall fontWeightBold fontColorTheme'>" + Tabs.sectionHint + "</div>";
				this.append(str);

				$(".tabsTopPanelTitle").boxCaptionPlugin('initSmall', Tabs.sectionTitle);
				$("#tabsContent").show(0);
				$("#tabsTopSubPanel").hide(0);
				Tabs.thisObj = this;
			},
			/**
			 * Shows tabs on the screen. Move in from right to left animation applied.
			 * Triggers {{#crossLink "Tabs/eventClick_showPage:event"}}eventClick_showPage{{/crossLink}} event.
			 * 
			 * @method showPage
			 */
			showPage: function () {
				Tabs.thisObj.fadeIn("normal", function() {
					Tabs.updateContentHeight();
				});
				/**
				 * Fired when {{#crossLink "Tabs/showPage:method"}}showPage{{/crossLink}} is called.
				 * It's standard JQuery event and it fires on Tabs object.
				 * 
				 * @event eventClick_showPage
				 */
				Tabs.thisObj.trigger('eventClick_showPage');
			},
			/**
			 * Hides tabs from the screen. Move out from left to right animation applied.
			 * Triggers {{#crossLink "Tabs/eventClick_hidePage:event"}}eventClick_hidePage{{/crossLink}} event.
			 * 
			 * @method hidePage
			 */
			hidePage: function () {
				Tabs.thisObj.fadeOut();
				/**
				 * Fired when {{#crossLink "Tabs/hidePagee:method"}}hidePage{{/crossLink}} is called.
				 * It's standard JQuery event and it fires on Tabs object.
				 * 
				 * @event eventClick_hidePage
				 */
				Tabs.thisObj.trigger('eventClick_hidePage');
			},
			/**
			 * Sets tabs title.
			 * 
			 * @method setSectionTitle
			 */
			setSectionTitle: function (title) {
				Tabs.sectionTitle = title;
			},
			/**
			 * Sets tabs hint.
			 * 
			 * @method setSectionHint
			 */
			setSectionHint: function (hint) {
				Tabs.sectionHint = hint;
			},
			/**
			 * Sets tabs main content template.
			 * 
			 * @method setContentDelegate
			 * @param delegate {String} Path to template.
			 */
			setContentDelegate: function (delegate) {
				Tabs.contentDelegate = delegate;
			},
			/**
			 * Renders the given main content model into the main content DOM element utilizing template mechanism.
			 * 
			 * @method contentTemplateCompile
			 * @param model {Array} Array of data elements.
			 * @param classes {String} Css classes to be added to main content DOM element.
			 * @param successCallback {Function} Function called when the rendering ends successfully.
			 */
			contentTemplateCompile: function (model, classes, successCallback) {
				Tabs.clearContent();
				Tabs.changeContentClass(classes);
				template.compile(model, Tabs.contentDelegate, "#tabsContent", successCallback);
			},
			/**
			 * Adds classes to the main content DOM element.
			 * 
			 * @method changeContentClass
			 * @param classes {String} One or more class names to be added to the class attribute of main content DOM element.
			 */
			changeContentClass: function (classes) {
				$("#tabsContent").removeClass();
				$("#tabsContent").addClass("tabsContent " + classes);
			},
			/**
			 * Removes all child nodes of the main content DOM element.
			 * 
			 * @method clearContent
			 */
			clearContent: function () {
				$("#tabsContent").empty();
			},
			/**
			 * Sets tabs content template.
			 * 
			 * @method setMenuItemDelegate
			 * @param delegate {String} Path to template.
			 */
			setMenuItemDelegate: function (delegate) {
				Tabs.topPanelDelegate = delegate;
			},
			/**
			 * Renders the given tabs into the tabs DOM element utilizing template mechanism.
			 * 
			 * @method tabMenuTemplateCompile
			 * @param model {Array} Array of tabs.
			 * @param successCallback {Function} Function called when the rendering ends successfully.
			 */
			tabMenuTemplateCompile: function (model, successCallback) {
				var i = 0;
				for (i = 0; i < model.Tabs.length; i++) {
					model.Tabs[i].index = i;
					if (model.Tabs[i].selected) {
						Tabs.selectedTopTabIndex = model.Tabs[i].index;
					}
					if (model.Tabs[i].action) {
						model.Tabs[i].action = model.Tabs[i].action + "$(\'#" + this.attr('id') + "\').tabs(\'tabsTabClick\'," + i + ");";
					} else {
						model.Tabs[i].action = "$(\'#" + this.attr('id') + "\').tabs(\'tabsTabClick\'," + i + ");";
					}
				}

				if (Tabs.selectedTopTabIndex === -1) {
					Tabs.selectedTopTabIndex = 0;
				}

				template.compile(model, Tabs.topPanelDelegate, "#tabsTabsID", successCallback);
			},
			/**
			 * Returns index of selected tab.
			 * 
			 * @method getSelectetTopTabIndex
			 * @return {Number} Index of selected tab.
			 */
			getSelectetTopTabIndex: function () {
				return Tabs.selectedTopTabIndex;
			},
			/**
			 * Sets index and highlight selected tab.
			 * 
			 * @method setTopTabIndex
			 * @param index {Number} Index of tab.
			 */
			setTopTabIndex: function (index) {
				Tabs.selectedTopTabIndex = index;
				$(".tabsTab").removeClass("fontColorSelected tabsTabSelected");
				var tabId = "#tabsTab" + index;
				$(tabId).toggleClass("fontColorSelected tabsTabSelected");
				var selectedTabClass = "tabsTab" + index + "Selected";
				$("#tabsTopPanel").attr("class", "tabsTopPanel " + selectedTabClass);
			},
			/**
			 * Sets tabs sub panel content template.
			 * 
			 * @method setSubpanelContentDelegate
			 * @param delegate {String} Path to template.
			 */
			setSubpanelContentDelegate : function (delegate) {
				Tabs.subPanelDelegate = delegate;
			},
			/**
			 * Renders the given model into the sub panel DOM element utilizing template mechanism.
			 * 
			 * @method subpanelContentTemplateCompile
			 * @param model {Object} Data for sub panel.
			 * @param successCallback {Function} Function called when the rendering ends successfully.
			 */
			subpanelContentTemplateCompile : function (model, successCallback) {
				model.id = this.attr('id');
				if (!model.action) {
					model.action = function() {
						Tabs.closeSubpanel(true);
					};
					model.actionName = "BACK";
				}

				if (TABS_SUB_PANEL_DELEGATE_DEFAULT === Tabs.subPanelDelegate) {
					template.compile(model, Tabs.subPanelDelegate, "#tabsTopSubPanel", function() {
						if (!!model.textTitle) {
							$("#tabsTopSubPanelTitle").boxCaptionPlugin('initSmall', model.textTitle);
						}
						if (!!model.action) {
							$("#tabsCloseSubPanelButton").click(function() {
								//model.action(); //return to a central modal settings dialog (Deprecated!)
								$("#settingsTabs").tabs("hidePage");
							});
						}
						Tabs.showSubpanel();
						if (!!successCallback) {
							successCallback();
						}
					});
				} else {
					template.compile(model, Tabs.subPanelDelegate, "#tabsTopSubPanel", function() {
						Tabs.showSubpanel();
						if (!!successCallback) {
							successCallback();
						}
					});
				}
			},

			/**
			 * Shows sub panel and triggers {{#crossLink "Tabs/eventClick_showSubpanel:event"}}eventClick_showSubpanel{{/crossLink}} event if triggerEvent == true.
			 * 
			 * @method showSubpanel
			 * @param triggerEvent {Boolean} Control if {{#crossLink "Tabs/eventClick_showSubpanel:event"}}eventClick_showSubpanel{{/crossLink}} will be triggered.
			 */
			showSubpanel: function (triggerEvent) {
				if ($("#tabsTopSubPanel").is(":hidden")) {
					$("#tabsTopSubPanel").show("fast", function() {
						Tabs.updateContentHeight();
					});
					if (!!triggerEvent) {
						/**
						 * Fired on sub panel showing caused by calling {{#crossLink "Tabs/showSubpanel:method"}}Tabs.showSubpanel(triggerEvent: boolean){{/crossLink}} method.
						 * It's standard JQuery event and it fires on Tabs object.
						 * 
						 * @event eventClick_showSubpanel
						 */
						Tabs.thisObj.trigger('eventClick_showSubpanel');
					}
				}
			},
			/**
			 * Hides sub panel and triggers {{#crossLink "Tabs/eventClick_closeSubpanel:event"}}eventClick_closeSubpanel{{/crossLink}} event if triggerEvent == true.
			 * 
			 * @method closeSubpanel
			 * @param triggerEvent {Boolean} Control if {{#crossLink "Tabs/eventClick_closeSubpanel:event"}}eventClick_closeSubpanel{{/crossLink}} will be triggered.
			 */
			closeSubpanel: function (triggerEvent) {
				if ($("#tabsTopSubPanel").is(":visible")) {
					$("#tabsTopSubPanel").hide("fast", function() {
						Tabs.updateContentHeight();
					});
					if (!!triggerEvent) {
						/**
						 * Fired on sub panel closing caused by calling {{#crossLink "Tabs/closeSubpanel:method"}}Tabs.closeSubpanel(triggerEvent: boolean){{/crossLink}} method.
						 * It's standard JQuery event and it fires on Tabs object.
						 * 
						 * @event eventClick_closeSubpanel
						 */
						Tabs.thisObj.trigger('eventClick_closeSubpanel');
					}
				}
			},
			/**
			 * Triggers {{#crossLink "Tabs/eventClick_menuItemBtn:event"}}eventClick_menuItemBtn(triggerEvent: boolean){{/crossLink}} event automatically after clicking on tab.
			 * Usually used as callback for Tabs tab item click action.
			 * 
			 * @method tabsTabClick
			 * @param index {Number} Index of tab.
			 */
			tabsTabClick: function (index) {
				Tabs.setTopTabIndex(index);
				/**
				 * Fired on {{#crossLink "Tabs/tabsTabClick:method"}}Tabs.tabsTabClick(index: number){{/crossLink}} method call.
				 * It's standard JQuery event and it fires on Tabs object.
				 * 
				 * **indexObject example:**
				 * 
				 *     { Index : 2 }
				 * 
				 * @event eventClick_menuItemBtn
				 * @param indexObject {Object} Contains index of clicked tab.
				 */
				Tabs.thisObj.trigger('eventClick_menuItemBtn', { Index: index });
			},
			/**
			 * Updates tab content element height after calling.
			 * 
			 * @method updateContentHeight
			 */
			updateContentHeight: function() {
				var height = Tabs.thisObj.height();
				if ($("#tabsTopPanel").is(":visible")) {
					height = height - $("#tabsTopPanel").outerHeight();
				}
				if ($("#tabsTopSubPanel").is(":visible")) {
					height = height - $("#tabsTopSubPanel").outerHeight();
				}
				$("#tabsContent").css({
					maxHeight:  height + "px"
				});
			}
		};
	/** 
	 * jQuery extension method for for {{#crossLink "Tabs"}}{{/crossLink}} plugin.
	 * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
	 * @method tabs
	 * @for jQuery
	 * @return Result of called method.
	 */
	$.fn.tabs = function (method) {
		// Method calling logic
		if (Tabs[method]) {
			return Tabs[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return Tabs.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.infoPanelAPI');
		}
	};
}(jQuery));
