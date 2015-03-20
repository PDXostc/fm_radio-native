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

/*global template, AlphabetBookmark */

/**
 * @module CarTheme
 **/


/**
 * Library is standard **JQuery plugin** which represents data UI control element that is used to display list/grid/search 
 * view of data elements in multiple logical sections, so called tabs.
 * Rendering of individual parts of this element is done by template mechanism.
 * 
 * This class requires following components:
 *
 * * {{#crossLink "AlphabetBookmark"}}{{/crossLink}} component
 * * {{#crossLink "BoxCaption"}}{{/crossLink}} component
 * 
 * **Example initialization of Library plugin:**
 * 
 *     $('#properties').library("init");						//enables library plugin for properties element
 *     $('#properties').library('setAlphabetVisible', false);	//sets library component AlphabetBookmark visibility
 *     
 *     $('#properties').library('clearContent');				//clears library content
 *     $('#properties').off();									//unregister all library events listeners
 *     
 *     $('#properties').library('setSectionTitle', 'AMB PROPERTY LIBRARY');
 *     
 *     //sets left tabe enabled/disabled buttons
 *     $('#properties').library('setGridBtnDisabled', true);
 *     $('#properties').library('setListBtnDisabled', false);
 *     $('#properties').library('setSearchBtnDisabled', false);
 *     
 *     $('#properties').library('setLeftTabIndex', 1);			//selects active button of left tab menu by it's index
 *     
 *     //events registration/handling
 *     $('#properties').on('eventClick_SearchViewBtn', function(e, data) {
 *         $('#properties').library('showSubpanel');
 *     });
 *     $('#properties').on('eventClick_ListViewBtn', function(e, data) {
 *         $('#searchInput').val('');
 *         $('#properties').library('closeSubpanel');
 *         PropertiesController.renderTabContent(0);
 *     });
 *     $('#properties').on('eventClick_menuItemBtn', function(e, data) {
 *         PropertiesController.renderTabContent(data.Index);
 *     });
 *     
 *     //calling of templete compiling for top tab menu and it's setup
 *     $('#properties').library('tabMenuTemplateCompile', {
 *         Tabs : [ {
 *             text : 'Properties',
 *             selected : true
 *         } ]
 *     });
 *     
 *     //Library sub panel setup (delegate settin, comiling of template, events registering)
 *     $('#properties').library('setSubpanelContentDelegate', 'templates/searchSubPanelDelegate.html');
 *     $('#properties').library('subpanelContentTemplateCompile', {}, function() {
 *         $('#searchInput').on('input', PropertiesController.signalFilter);
 *         $('#properties').library('closeSubpanel', function() {
 *             $('#properties').library("showPage");			//SHOWS LIBRARY PAGE!
 *         });
 *     });
 *     
 *     //Library main content setup (delegate settin, comiling of template, events registering)
 *     $('#properties').library("setContentDelegate", "templates/propertiesListDelegate.html");
 *     $('#properties').library("contentTemplateCompile", PropertiesController.CurrentSourceSignals, "ambPropertiesContentGrid", function() {
 *         $('#libraryContent').find('.contactElement').on('click', PropertiesController.openPropertyDetail);
 *         $('#properties').library('updateContentHeight');
 *     });
 *
 * Hover and click on elements in images below to navigate to components or driving properties of Library application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/library.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="70,1,360,31" alt="Library title" title="Library title" href="{{#crossLinkRaw "Library/sectionTitle:property"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="70,32,577,80" alt="Top Tab menu" title="Top tab menu" href="{{#crossLinkRaw "Library/selectedTopTabIndex:propety"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="578,1,648,80" alt="Close library" title="Closes library" href="{{#crossLinkRaw "Library/hidePage:method"}}{{/crossLinkRaw}}" />
 *     <area shape="rect" coords="1,170,65,455" alt="Left Tab" title="Left Tab menu" href="{{#crossLinkRaw "Library/selectedLeftTabIndex:property"}}{{/crossLinkRaw}}" >
 *     <area shape="rect" coords="70,85,648,153" alt="Library sub panel" title="Library sub panel" href="{{#crossLinkRaw "Library/subpanelDelegate:property"}}{{/crossLinkRaw}}" >
 *     <area shape="rect" coords="80,170,635,1150" alt="Library content" title="Library content" target="_self" href="{{#crossLinkRaw "Library/contentDelegate:property"}}{{/crossLinkRaw}}" >
 *  </map>
 * </img>
 * 
 * @class Library
 * @static
 */


/** 
 * Library Left Control: grid tab default index.
 * @property GRID_TAB
 * @type {String}
 * @default 0
 * @static
 * @final
 */
/** 
 * Library Left Control: list tab default index.
 * @property LIST_TAB
 * @type {String}
 * @default 1
 * @static
 * @final
 */
/** 
 * Library Left Control: search tab default index.
 * @property SEARCH_TAB
 * @type {String}
 * @default 2
 * @static
 * @final
 */
var GRID_TAB = 0, LIST_TAB = 1, SEARCH_TAB = 2;
/** 
 * Holds default url to library templates.
 * @property basePath
 * @type {String}
 * @default "./common/components/library/templates/"
 * @static
 * @final
 */
var basePath = "./DNA_common/components/library/templates/";
/** 
 * Holds default url to library sub panel template.
 * @property LIBRARY_SUB_PANEL_DELEGATE_DEFAULT
 * @type {String}
 * @default basePath + "subpanelDelegate.html"
 * @static
 * @final
 */
/** 
 * Holds default url to library top panel template.
 * @property LIBRARY_TOP_PANEL_DELEGATE_DEFAULT
 * @type {String}
 * @default basePath + "tabMenuItemDelegate.html"
 * @static
 * @final
 */
var LIBRARY_SUB_PANEL_DELEGATE_DEFAULT = basePath + "subpanelDelegate.html", LIBRARY_TOP_PANEL_DELEGATE_DEFAULT = basePath + "tabMenuItemDelegate.html";

(function($) {
	"use strict";
	var Library = {
		thisObj : null,
		/** 
		 * Holds main content template url.
		 * @property contentDelegate
		 * @type {String}
		 * @default null
		 */
		contentDelegate : null,
		/** 
		 * Holds content template url for content generation.
		 * @property menuItemDelegate
		 * @type {String}
		 * @default LIBRARY_TOP_PANEL_DELEGATE_DEFAULT
		 */
		menuItemDelegate : LIBRARY_TOP_PANEL_DELEGATE_DEFAULT,
		/** 
		 * Holds sub panel content template.
		 * @property subpanelDelegate
		 * @type {String}
		 * @default LIBRARY_SUB_PANEL_DELEGATE_DEFAULT
		 */
		subpanelDelegate : LIBRARY_SUB_PANEL_DELEGATE_DEFAULT,
		/** 
		 * Holds library title text.
		 * @property sectionTitle
		 * @type {String}
		 * @default ""
		 */
		sectionTitle : "",
		/** 
		 * Indicates if list, grid or search view is selected.
		 * @property selectedLeftTabIndex
		 * @type {Number}
		 * @default LIST_TAB
		 */
		selectedLeftTabIndex : LIST_TAB,
		/** 
		 * Indicates if list, grid button is disabled.
		 * @property gridDisabled
		 * @type {Bool}
		 * @default false
		 */
		gridDisabled : false,
		/** 
		 * Indicates if list, grid view button is disabled.
		 * @property listDisabled
		 * @type {Bool}
		 * @default false
		 */
		listDisabled : false,
		/** 
		 * Indicates if list, grid view button is disabled.
		 * @property searchDisabled
		 * @type {Bool}
		 * @default false
		 */
		searchDisabled : false,
		/** 
		 * Index of selected tab.
		 * @property selectedTopTabIndex
		 * @type {Number}
		 * @default -1
		 */
		selectedTopTabIndex : -1,
		/** 
		 * Indicates if alphabet component should be visible when sub panel is opened.
		 * @property alphabetVisible
		 * @type {Boolean}
		 * @default false
		 */
		alphabetVisible : false,
		/** 
		 * Indicates library visibility.
		 * @property visible
		 * @type {Boolean}
		 * @default false
		 */
		visible : false,
		/**
		 * Initializes library layout and alphabet component. 
		 * 
		 * @method init
		 */
		init : function() {
			this.empty();

			// A template has been created for the below HTML assigned to var str
			// The template can be found at: ../templates/libraryPanel.html
			// In the template:
			// -- class evaluations have been set to a disabled default
			// -- onclick events have been removed

			var str;

			str = "<div class='libraryLeftPanel'>";
			str += "<div class='libraryLeftControl'>";

			str += "<div id='grid' class='gridIcon ";
			if (Library.gridDisabled) {
				str += "gridIconDisabled";
			} else if (Library.selectedLeftTabIndex === GRID_TAB) {
				str += "gridIconActive";
			}
			str += "' onclick=\"$(\'#" + this.attr('id') + "\').library(\'clickOnGridViewBtn\')\"></div>";

			str += "<div id='list' class='listIcon ";
			if (Library.listDisabled) {
				str += "listIconDisabled";
			} else if (Library.selectedLeftTabIndex === LIST_TAB) {
				str += "listIconActive";
			}
			str += "' onclick=\"$(\'#" + this.attr('id') + "\').library(\'clickOnListViewBtn\')\"></div>";

			str += "<div id='search' class='searchIcon ";
			if (Library.listDisabled) {
				str += "searchIconDisabled";
			} else if (Library.selectedLeftTabIndex === SEARCH_TAB) {
				str += "serachIconActive";
			}
			str += "' onclick=\"$(\'#" + this.attr('id') + "\').library(\'clickOnSearchViewBtn\')\"></div>";

			str += "</div>";
			str += "</div>";
			str += "<div id='libraryTopPanel' class='libraryTopPanel'>";
			str += "<div class='libraryTopPanelTitle'></div>";
			str += "<div class='closeLibraryButton' onClick=\'$(\"#" + this.attr('id') + "\").library(\"hidePage\")\'></div>";
			str += "<div id='libraryTabsID' class='libraryTabs'><div id='tabsWrapperID' class='tabsWrapper'></div></div>";
			str += "</div>";
			str += "<div class='libraryTabClear'></div>";
			str += "<div id='alphabetBookmarkList'></div>";
			str += "<div id='libraryTopSubPanel' class='libraryTopSubPanel bgColorDark'></div>";
			str += "<div id='libraryContent' class='libraryContent'>";
			str += "</div>";
			this.append(str);
			$(".libraryTopPanelTitle").boxCaptionPlugin('initSmall', Library.sectionTitle);
			AlphabetBookmark.fill();
			$("#libraryContent").show();
			$("#libraryTopSubPanel").hide();
			Library.thisObj = this;
			Library.updateContentHeight();
		},
		/**
		 * Updates content element height after calling.
		 * 
		 * @method updateContentHeight
		 */
		updateContentHeight : function() {
			var height = Library.thisObj.height();
			if ($("#libraryTopPanel").is(":visible")) {
				height = height - $("#libraryTopPanel").outerHeight();
			}
			if ($("#libraryTopSubPanel").is(":visible")) {
				height = height - $("#libraryTopSubPanel").outerHeight();
			}
			$("#libraryContent").css({
				maxHeight : height + "px"
			});
		},
		/**
		 * Shows library on the screen. Move in from right to left animation applied.
		 * 
		 * @method showPage
		 */
		showPage : function() {
			if (Library.thisObj) {
				Library.thisObj.css('left', '0px');
				Library.visible = true;
			}
		},
		/**
		 * Hides library from the screen. Move out from left to right animation applied.
		 * 
		 * @method hidePage
		 */
		hidePage : function() {
			if (Library.thisObj) {
				Library.thisObj.css('left', '720px');
				Library.visible = false;
			}
		},
		/**
		 * Returns true if library is visible (is in viewport) otherwise false.
		 * 
		 * @method isVisible
		 * @return {Bool} True if library is visible (is in viewport) otherwise false.
		 */
		isVisible : function() {
			return Library.visible;
		},
		/**
		 * Sets library title.
		 * 
		 * @method setSectionTitle
		 */
		setSectionTitle : function(title) {
			Library.sectionTitle = title;
			$(".libraryTopPanelTitle").boxCaptionPlugin('initSmall', Library.sectionTitle);
		},
		/**
		 * Sets library main content template path stored in {{#crossLink "Library/contentDelegate:property"}}Library.contentDelegate{{/crossLink}}.
		 * 
		 * @method setContentDelegate
		 * @param delegate {String} Path to template.
		 */
		setContentDelegate : function(delegate) {
			Library.contentDelegate = delegate;
		},
		/**
		 * Renders the given main content model into the main content DOM element utilizing template mechanism.
		 * 
		 * @method contentTemplateCompile
		 * @param model {Array} Array of data elements.
		 * @param classes {String} Css classes to be added to main content DOM element.
		 * @param successCallback {Function} Function called when the rendering ends successfully.
		 */
		contentTemplateCompile : function(model, classes, successCallback) {
			Library.clearContent();
			Library.changeContentClass(classes);
			template.compile(model, Library.contentDelegate, "#libraryContent", successCallback);
		},
		/**
		 * Adds classes to the main content DOM element.
		 * 
		 * @method changeContentClass
		 * @param classes {String} One or more class names to be added to the class attribute of main content DOM element.
		 */
		changeContentClass : function(classes) {
			$("#libraryContent").removeClass();
			$("#libraryContent").addClass("libraryContent " + classes);
		},
		/**
		 * Removes all child nodes of the main content DOM element.
		 * 
		 * @method clearContent
		 */
		clearContent : function() {
			$("#libraryContent").empty();
		},
		/**
		 * Sets library tabs content template.
		 * 
		 * @method setMenuItemDelegate
		 * @param delegate {String} Path to template.
		 */
		setMenuItemDelegate : function(delegate) {
			Library.menuItemDelegate = delegate;
		},
		/**
		 * Renders the given tabs into the tabs DOM element utilizing template mechanism.
		 * 
		 * @method tabMenuTemplateCompile
		 * @param model {Array} Array of tabs.
		 * @param successCallback {Function} Function called when the rendering ends successfully.
		 */
		tabMenuTemplateCompile : function(model, successCallback) {
			var i = 0;
			for (i = 0; i < model.Tabs.length; i++) {
				model.Tabs[i].index = i;
				if (model.Tabs[i].selected) {
					Library.selectedTopTabIndex = model.Tabs[i].index;
				}
				if (model.Tabs[i].action) {
					model.Tabs[i].action = model.Tabs[i].action + "$(\'#" + this.attr('id') + "\').library(\'libraryTabClick\'," + i + ");";
				} else {
					model.Tabs[i].action = "$(\'#" + this.attr('id') + "\').library(\'libraryTabClick\'," + i + ");";
				}
			}
			if (Library.selectedTopTabIndex === -1) {
				Library.selectedTopTabIndex = 0;
			}
			// template.compile(model, Library.menuItemDelegate, "#libraryTabsID", successCallback);
			template.compile(model, Library.menuItemDelegate, "#tabsWrapperID", function() {
				var clearWidth = $('#libraryTabsID').width() - $('#tabsWrapperID').width();
				$('.libraryTabInlineClear').css('width', clearWidth);
				if (successCallback) {
					successCallback();
				}
			});
		},
		/**
		 * Returns index of selected tab.
		 * 
		 * @method getSelectetTopTabIndex
		 * @return {Number} Index of selected tab.
		 */
		getSelectetTopTabIndex : function() {
			return Library.selectedTopTabIndex;
		},
		/**
		 * Sets index and highlight selected tab in top tab menu.
		 * 
		 * @method setTopTabIndex
		 * @param index {Number} Index of tab.
		 */
		setTopTabIndex : function(index) {
			Library.selectedTopTabIndex = index;
			$(".libraryTab").removeClass("fontColorSelected libraryTabSelected");
			var tabId = "#libraryTab" + index;
			$(tabId).toggleClass("fontColorSelected libraryTabSelected");
			var selectedTabClass = "libraryTab" + index + "Selected";
			$("#libraryTopPanel").attr("class", "libraryTopPanel " + selectedTabClass);
		},
		/**
		 * Sets library sub panel content template.
		 * 
		 * @method setSubpanelContentDelegate
		 * @param delegate {String} Path to template.
		 */
		setSubpanelContentDelegate : function(delegate) {
			Library.subpanelDelegate = delegate;
		},
		/**
		 * Renders the given model into the sub panel DOM element utilizing template mechanism.
		 * 
		 * @method subpanelContentTemplateCompile
		 * @param model {Object} Data for sub panel.
		 * @param successCallback {Function} Function called when the rendering ends successfully.
		 */
		subpanelContentTemplateCompile : function(model, successCallback) {
			model.id = this.attr('id');
			if (!model.action) {
				model.action = function() {
					Library.closeSubpanel();
				};
				model.actionName = "BACK";
			}
			if (LIBRARY_SUB_PANEL_DELEGATE_DEFAULT === Library.subpanelDelegate) {
				template.compile(model, Library.subpanelDelegate, "#libraryTopSubPanel", function() {
					if (!!model.textTitle) {
						$("#libraryTopSubPanelTitle").boxCaptionPlugin('initSmall', model.textTitle);
					}
					if (!!model.action) {
						$("#libraryCloseSubPanelButton").click(function() {
							model.action();
						});
					}
					Library.showSubpanel();
					if (!!successCallback) {
						successCallback();
					}
				});
			} else {
				template.compile(model, Library.subpanelDelegate, "#libraryTopSubPanel", function() {
					Library.showSubpanel();
					if (!!successCallback) {
						successCallback();
					}
				});
			}
		},
		/**
		 * Returns index of selected left tab.
		 * 
		 * @method getSelectetLeftTabIndex
		 * @return {Number} Index of selected tab.
		 */
		getSelectetLeftTabIndex : function() {
			return Library.selectedLeftTabIndex;
		},
		/**
		 * Sets index of selected left tab.
		 * 
		 * @method setLeftTabIndex
		 * @param index {Number} Index of left tab.
		 */
		setLeftTabIndex : function(index) {
			Library.selectedLeftTabIndex = index;
			$(".libraryLeftControl").children('*').removeClass("listIconActive searchIconActive gridIconActive");
			switch (index) {
				case 0:
					$(".libraryLeftControl #grid").addClass("gridIconActive");
					break;
				case 1:
					$(".libraryLeftControl #list").addClass("listIconActive");
					break;
				case 2:
					$(".libraryLeftControl #search").addClass("searchIconActive");
					break;
			}
		},
		/**
		 * Selects grid view button as active and triggers event.
		 * 
		 * @method clickOnGridViewBtn
		 */
		clickOnGridViewBtn : function() {
			if (!Library.gridDisabled) {
				Library.selectedLeftTabIndex = GRID_TAB;
				$(".libraryLeftControl #list").removeClass("listIconActive");
				$(".libraryLeftControl #search").removeClass("searchIconActive");
				$(".libraryLeftControl #grid").addClass("gridIconActive");
				/**
				 * Fired on left panel grid view button click and if button is not disabled.
				 * It's standard JQuery event and it fires on Library object.
				 * 
				 * @event eventClick_GridViewBtn
				 */
				Library.thisObj.trigger('eventClick_GridViewBtn');
			}
		},
		/**
		 * Enable/disable grid button in left tab menu.
		 * 
		 * @method setGridBtnDisabled
		 */
		setGridBtnDisabled : function(value) {
			Library.gridDisabled = value;
			if (value) {
				$(".libraryLeftControl #grid").removeClass("gridIconActive").addClass("gridIconDisabled");
			}
			else {
				$(".libraryLeftControl #grid").removeClass("gridIconDisabled");
			}
		},
		/**
		 * Selects list view button as active and triggers event.
		 * 
		 * @method clickOnListViewBtn
		 */
		clickOnListViewBtn : function() {
			if (!Library.listDisabled) {
				Library.selectedLeftTabIndex = LIST_TAB;
				$(".libraryLeftControl #grid").removeClass("gridIconActive");
				$(".libraryLeftControl #search").removeClass("searchIconActive");
				$(".libraryLeftControl #list").addClass("listIconActive");
				/**
				 * Fired on left panel list view button click and if button is not disabled.
				 * It's standard JQuery event and it fires on Library object.
				 * 
				 * @event eventClick_ListViewBtn
				 */
				Library.thisObj.trigger('eventClick_ListViewBtn');
			}
		},
		/**
		 * Enable/disable list button in left tab menu.
		 * 
		 * @method setListBtnDisabled
		 */
		setListBtnDisabled : function(value) {
			Library.listDisabled = value;
			if (value) {
				$(".libraryLeftControl #list").removeClass("listIconActive").addClass("listIconDisabled");
			}
			else {
				$(".libraryLeftControl #list").removeClass("listIconDisabled");
			}
		},
		/**
		 * Selects search view button as active and triggers event.
		 * 
		 * @method clickOnSearchViewBtn
		 */
		clickOnSearchViewBtn : function() {
			if (!Library.searchDisabled) {
				$(".libraryLeftControl #grid").removeClass("gridIconActive");
				$(".libraryLeftControl #list").removeClass("listIconActive");
				$(".libraryLeftControl #search").addClass("searchIconActive");
				/**
				 * Fired on left panel search view button click and if button is not disabled.
				 * It's standard JQuery event and it fires on Library object.
				 * 
				 * @event eventClick_SearchViewBtn
				 */
				Library.thisObj.trigger('eventClick_SearchViewBtn');
			}
		},
		/**
		 * Enable/disable search button in left tab menu.
		 * 
		 * @method setSearchBtnDisabled
		 */
		setSearchBtnDisabled : function(value) {
			Library.searchDisabled = value;
			if (value) {
				$(".libraryLeftControl #search").removeClass("searchIconActive").addClass("searchIconDisabled");
			}
			else {
				$(".libraryLeftControl #search").removeClass("searchIconDisabled");
			}
		},
		/**
		 * Shows sub panel and triggers {{#crossLink "Library/eventClick_showSubpanel:event"}}eventClick_showSubpanel{{/crossLink}}.
		 * 
		 * @method showSubpanel
		 */
		showSubpanel : function(completeCallback) {
			if ($("#libraryTopSubPanel").is(":hidden")) {
				$("#libraryTopSubPanel").show("fast", function() {
					Library.updateContentHeight();
					if (completeCallback) {
						completeCallback();
					}
				});
				if (!Library.alphabetVisible) {
					Library.hideAlphabet();
				} else {
					$("#alphabetBookmarkList").css('top', '175px');
				}
				/**
				 * Fired when {{#crossLink "Library/showSubpanel:method"}}showSubpanel{{/crossLink}} is called.
				 * It's standard JQuery event and it fires on Library object.
				 * 
				 * @event eventClick_showSubpanel
				 */
				Library.thisObj.trigger('eventClick_showSubpanel');
			}
		},
		/**
		 * Hides sub panel and triggers {{#crossLink "Library/eventClick_closeSubpanel:event"}}eventClick_closeSubpanel{{/crossLink}} event.
		 * 
		 * @method closeSubpanel
		 */
		closeSubpanel : function(completeCallback) {
			if ($("#libraryTopSubPanel").is(":visible")) {
				$("#libraryTopSubPanel").hide("fast", function() {
					Library.updateContentHeight();
					if (completeCallback) {
						completeCallback();
					}
				});
				if (Library.alphabetVisible) {
					Library.showAlphabet();
				}
				$("#alphabetBookmarkList").css('top', '115px');
				/**
				 * Fired when {{#crossLink "Library/closeSubpanel:method"}}closeSubpanel{{/crossLink}} is called.
				 * It's standard JQuery event and it fires on Library object.
				 * 
				 * @event eventClick_closeSubpanel
				 */
				Library.thisObj.trigger('eventClick_closeSubpanel');
			}
		},
		/**
		 * Triggers {{#crossLink "Library/eventClick_menuItemBtn:event"}}eventClick_menuItemBtn{{/crossLink}} event 
		 * and calls {{#crossLink "Library/setTopTabIndex:method"}}setTopTabIndex{{/crossLink}} to set
		 * {{#crossLink "Library/selectedTopTabIndex:propety"}}selectedTopTabIndex{{/crossLink}} automatically after clicking on tab.
		 * 
		 * @method libraryTabClick
		 * @param index {Number} Index of tab.
		 */
		libraryTabClick : function(index) {
			Library.setTopTabIndex(index);
			/**
			 * Fired when {{#crossLink "Library/libraryTabClick:method"}}libraryTabClick{{/crossLink}} is called.
			 * It's standard JQuery event and it fires on Library object.
			 * 
			 * **indexObject example:**
			 * 
			 *     { Index : 2 }
			 * 
			 * @event eventClick_menuItemBtn
			 * @param indexObject {Object} Contains index of clicked tab.
			 */
			Library.thisObj.trigger('eventClick_menuItemBtn', {
				Index : index
			});
		},
		/**
		 * Sets visibility of alphabet component.
		 * 
		 * @method setAlphabetVisible
		 * @param visible {Boolean} Visibility of alphabet.
		 */
		setAlphabetVisible : function(visible) {
			Library.alphabetVisible = visible;
		},
		/**
		 * Hides alphabet component.
		 * 
		 * @method hideAlphabet
		 */
		hideAlphabet : function() {
			$("#alphabetBookmarkList").hide();
			$("#libraryContent").css('margin-right', '15px');
		},
		/**
		 * Shows alphabet component.
		 * 
		 * @method showAlphabet
		 */
		showAlphabet : function() {
			$("#alphabetBookmarkList").show();
			$("#libraryContent").css('margin-right', '50px');
		}
	};
	/** 
	 * jQuery extension method for {{#crossLink "Library"}}{{/crossLink}} plugin.
	 * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
	 * @method library
	 * @for jQuery
	 * @return Result of called method.
	 */
	$.fn.library = function(method) {
		// Method calling logic
		if (Library[method]) {
			return Library[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return Library.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.library');
		}
	};
}(jQuery));
