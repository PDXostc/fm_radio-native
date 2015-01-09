/* ==== ==== ==== init top bar js code ==== ==== ==== */

var TopBar = {};

TopBar.TemplateHTML = "DNA_common/components/topBar/topBar.html";

TopBar.topbarBack = function() {
	if(tizen.application.getCurrentApplication().appInfo.packageId != "JLRPOCX001"){
		tizen.application.launch('JLRPOCX001.HomeScreen', TopBar.backButtonWin, TopBar.backButtonFail);
		tizen.application.getCurrentApplication().exit();
	}
}

TopBar.topbarGrid = function(){
	$("#hexGridView").toggle();
}

topbarTouchstart = function(event){
	if(event.originalEvent.targetTouches.length>1){
		return false;
	}
}
$("body").on('touchstart', topbarTouchstart); // PREVENT MULTITOUCH ZOOM BUBBLING

TopBar.pageUpdate = function() {
	$('#topBar').replaceWith(TopBar.topBarHTML.valueOf());
	$("#homeScreenIcon").click(TopBar.topbarBack);
	$("#appGridIcon").click(TopBar.topbarGrid);
	$(".exitButton").click(TopBar.topbarGrid);
	initAppGrid();
	initTaskLauncher();
}

TopBar.includeHTMLSucess = function(linkobj) {
		console.log("BottomBar.includeHTMLSucess()");
		TopBar.import = linkobj.path[0].import;
		console.log(TopBar.import);
		TopBar.topBarHTML = TopBar.import.getElementById('topBar');
		setTimeout(TopBar.pageUpdate,2000);
}

TopBar.includeHTMLFailed = function(linkobj) {
	console.log("load topBar.html failed");
	console.log(linkobj);
};


includeHTML("DNA_common/components/topBar/topBar.html", TopBar.includeHTMLSucess, TopBar.includeHTMLFailed);

TopBar.backbuttonTimeout = setTimeout(function() {
	if(tizen.application.getCurrentApplication().appInfo.packageId == "JLRPOCX001")
		$("#homeScreenIcon").attr('src', '/DNA_common/images/Tizen.png');
	else
		$("#homeScreenIcon").attr('src', '/DNA_common/images/homescreen_icon.png');
}, 1000);

/* ==== ==== ==== init app grid js code ==== ==== ==== */

TopBar.backButtonWin = function(x){console.log(x);tizen.application.getCurrentApplication().exit();}
TopBar.backButtonFail = function(x){console.log(x);}

var extras = 0, index = 0, i = 0, icon = 0, id = 0, installed=0;
var appList = [], applications = [], topBarApplicationsModel = [], extraAppsModel = [], toptasks = [];
var HomeScreenName = "Home Screen";
var registeredApps = {"Home Screen":"/DNA_common/images/return_arrow_inactive.png",
						"Hello Tizen":"/DNA_common/images/tizen_inactive.png",
						"GestureGame":"/DNA_common/images/gesture_game_inactive.png",
						"DNA Browser":"/DNA_common/images/browser_inactive.png",
						"Navigation":"/DNA_common/images/navigation_inactive.png",
						"HVAC":"/DNA_common/images/hvac_inactive.png",
						"Dashboard":"/DNA_common/images/dashboard_inactive.png",
						"NFC":"/DNA_common/images/nfc_inactive.png",
						"Phone":"/DNA_common/images/phone_inactive.png",
						"pkgmgr-install":"/DNA_common/images/pkgmgr-install_inactive.png",
						"Voiceprint":"/DNA_common/images/voiceprint_inactive.png",
						"Weather":"/DNA_common/images/weather_inactive.png",
						"Terminal":"/DNA_common/images/terminal_inactive.png",
						"Settings":"/DNA_common/images/settings_inactive.png",
						"SDL":"/DNA_common/images/sdl_inactive.png",
						"Handwriting":"/DNA_common/images/handwriting_inactive.png",
						"Email":"/DNA_common/images/email_inactive.png",
						"News":"/DNA_common/images/news_inactive.png",
						"AMB Simulator":"/DNA_common/images/amb_simulator_inactive.png",
						"Audio Settings":"/DNA_common/images/audio_settings_inactive.png",
					    "MOST AUDIO":"./DNA_common/images/audio_settings_inactive.png",
						"Finger Print":"/DNA_common/images/fingerprint_inactive.png",
						"Multimedia Player":"/DNA_common/images/mediaplayer_inactive.png",
						"SmartDeviceLink":"/DNA_common/images/sdl_inactive.png",
						"syspopup-app":"/DNA_common/images/syspopup-app_inactive.png",
						"ApplicationVisibility":"/DNA_common/images/app_visibility_inactive.png",
						"Dialer":"/DNA_common/images/dialer_inactive.png",
						"Keyboard":"/DNA_common/images/keyboard_inactive.png",
						"MiniBrowser":"/DNA_common/images/mini_browser_inactive.png", 
						"Tizen":"/DNA_common/images/tizen_inactive.png",
						"gestureGame":"/DNA_common/images/gesture_game_inactive.png",
						"saythis":"/DNA_common/images/say_this_inactive.png"
						};

function launchApplication(id) {
	"use strict";
	console.log('launchApplication('+id+');');
	if (id === "http://com.jaguar.tizen/settings") {
		Settings.init();
		Settings.show();
		return;
	}

	var app = getAppByID(id);
	console.log(app);
	if ( !! app) {
		if( app != tizen.application.getCurrentApplication() ){
			tizen.application.launch(app.id, onLaunchSuccess, onError);
			tizen.application.getCurrentApplication().exit();
		}
	} else {
		alert("Application is not installed!");
	}
}

/* Code from topBar.js */

function getAppByID(id) {
	"use strict";
	var j, i = 0;
	for (j = 0; j < appList.length; ++j) {
		if (id === appList[j].id) {
			return appList[j];
		}
	}

	return null;
}

function getAppByName(appName) {
	"use strict";
	for (var j = 0; j < appList.length; ++j) {
		if (appName.toString().trim().toLowerCase() === appList[j].appName.toString().trim().toLowerCase()) {
			return appList[j];
		}
	}

	return null;
}

/* Based on code from installedApps.js */

function onFrameClick(appData) {
	"use strict";
	//launch application
	var i;
	try {
		var scriptCallback = function(path, status) {
			if (status === "ok") {
				Settings.init();
			}
		};

		for (i = 0; i < appList.length; ++i) {
			if (appList[i].id === appData.id) {
				if (appData.id === "http://com.intel.tizen/intelPocSettings") {
					if (typeof Settings === 'undefined') {
						loadScript('./common/components/settings/js/settings.js', scriptCallback);
					} else {
						Settings.show();
					}
				} else {
					tizen.application.launch(appData.id, onLaunchSuccess, onError);
					tizen.application.getCurrentApplication().exit();
				}
				break;
			}
		}
	} catch (exc) {
		console.error(exc.message);
	}
}
function onLaunchSuccess(){}
function onError(){}

function initAppGrid(){
	"use strict";
	if (typeof tizen !== 'undefined') {
		try {
			// get the installed applications list
			tizen.application.getAppsInfo(onAppInfoSuccess, function(err) {
				// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
				window.setTimeout(function() {
					initAppGrid();
				}, 1000);

				onError(err);
			});
		} catch (exc) {
			console.error(exc.message);
		}
	}
}

function Right(str, len){
	return str.substring(str.length-len, str.length)
}
function Divisible(integer,by){
	return integer/by == Math.floor(integer/by);
}
function insertAppFrame(appFrame) {
	"use strict";
	var rootDiv = $("<div></div>").addClass("homeScrAppGridFrame").data("app-data", appFrame).click(function() {
		onFrameClick($(this).data("app-data"));
	});
	var innerDiv = $("<span></span>").addClass("homeScrAppGridImg").appendTo(rootDiv);
	$("<img />").data("src", appFrame.iconPath).appendTo(innerDiv);
	$("<br />").appendTo(innerDiv);
	var textDiv = $("<span />").addClass("homeScrAppGridText").appendTo(rootDiv);
	$("<span />").addClass("homeScrAppGridTitle").text(appFrame.appName.substring(0,11).replace("-","")).appendTo(textDiv);

	$('.hexrow').last().append(rootDiv);

	var img = new Image();
	var ctx = document.createElement('canvas').getContext('2d');

	img.onload = function() {
		var w = ctx.canvas.width = img.width;
		var h = ctx.canvas.height = img.height;

		ctx.drawImage(img, 0, 0);

		$("span.homeScrAppGridImg img").each(function() {
			if ($(this).data("src") === appFrame.iconPath && Right(appFrame.iconPath,4)=='.png') {
				$(this)[0].src = ctx.canvas.toDataURL();
			}
		});
	};

	img.onerror = img.onabort = function() {
		$("span.homeScrAppGridImg img").each(function() {
			if ($(this).data("src") === appFrame.iconPath) {
				$(this).attr("src", "");
			}
		});
	};

	img.src = appFrame.iconPath;
	//console.log("img "+img.src+" app "+appFrame.appName);

	index++;
	appList.push(appFrame);
}

function onAppInfoSuccess(list) {
	"use strict";
	try {
		var applications = [];
/*
		applications.push({
			id: "http://com.intel.tizen/intelPocSettings",
			appName: "Settings",
			show: true,
			iconPath: "./DNA_common/components/settings/icon.png"
		});
*/
		list.sort(function(x, y) {
			return x.appName > y.appName ? 1 : -1;
		});

	//empty the topbar array
	toptasks=[];
	//enumerate the topbar array
	$(list).each(function(index){
		var name = list[index].name;
		if( name != HomeScreenName ){
			icon = list[index].iconPath;
			id = list[index].id;
			if(registeredApps[name]){
				icon = registeredApps[name];
			}
			toptasks.push({"icon":icon,"id":id});
		}
	});
	//populate the topbar using the topbar tasks array
	$(toptasks).each(function(index){
		$("#topTask"+index+" img").attr("src", toptasks[index].icon);
		$("#topTask"+index+" img").on('click', function(){launchApplication(toptasks[index].id)});
	});
	
	//console.log(appList); //for grid
		for (i = 0; i < list.length; i++) {

			var app = list[i];
			var newApp = {
				id: app.id,
				appName: app.name,
				style: "background-image: url('" + app.iconPath + "');",
				iconPath: app.iconPath,
				css: "app_" + app.id.replace(/\./g, "_").replace(/\ /g, "_"),
				installed: true
			};
			if (registeredApps[app.name]) {
				newApp.style = "background-image: url('"+ registeredApps[app.name] + "');";
				newApp.iconPath = registeredApps[app.name];
			}
			applications.push(newApp);
		}

		var length = applications.length + extras;
		var equals = parseInt(length) == parseInt(appList.length)+1;

		if(installed>0 && applications.length!=installed){
			 location.reload();
		}
		
		installed = applications.length;
		
		if (equals) {
			for (var j = 0; j < applications.length; j++) {
				equals = applications[j].id === appList[j].id ? equals : false;
				equals = applications[j].appName === appList[j].appName ? equals : false;
				equals = applications[j].css === appList[j].css ? equals : false;
				equals = applications[j].iconPath === appList[j].iconPath ? equals : false;
			}
		} else {
			appList = [];
			var offset = 0;
			for (i = 0; i < applications.length; i++) {
				console.log('i: '+i+' offset:'+offset+' appname: '+applications[i].appName);
				if(applications[i].appName !== HomeScreenName){
				console.log('Divisible: '+(i>1 && Divisible(i-offset,5)));
					if(Divisible(i-offset,5)){
						$('#hexGridView #hexGrid').append($("<div></div>").addClass("hexrow"));
					}
					insertAppFrame(applications[i]);
				}else{
					offset=offset+1;
				}
			}
			if(Divisible(applications.length-offset,5)){
				$('#hexGridView #hexGrid').append($("<div></div>").addClass("hexrow"));
			}
			if(true){
				for (j=0;j<5-(applications.length-offset)%5;j++){
					insertAppFrame({iconPath:'',appName:'',id:0});
					extras++;
				}
				for (i = 1; i <= 8; i++) {
					$('#hexGridView #hexGrid').append($("<div></div>").addClass("hexrow"));
					for (j=1;j<=5;j++){
						insertAppFrame({iconPath:'',appName:'',id:0});
						extras++;
					}
				}
			}
		}
	} catch (exc) {
		console.log(exc.message);
	} finally {
		//Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
		window.setTimeout(function() {
			initAppGrid();
		}, 1000);

		if (null === listenerID) {
			listenerID = tizen.application.addAppInfoEventListener({
				oninstalled: function(appInfo) {
					console.log('The application ' + appInfo.name + ' is installed');
					initAppGrid();
				},
				onupdated: function(appInfo) {
					console.log('The application ' + appInfo.name + ' is updated');
					initAppGrid();
				},
				onuninstalled: function(appid) {
					console.log('The application ' + appid + ' is uninstalled');
					initAppGrid();
				}
			});
		}
	}
}

/* ==== ==== ==== init task launcher js code ==== ==== ==== */

function initTaskLauncher(){
	"use strict";
	if (typeof tizen !== 'undefined') {
		try {
			// get the installed applications list
			tizen.application.getAppsInfo(onTaskInfoSuccess, function(err) {
				// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
				window.setTimeout(function() {
					initTaskLauncher();
				}, 1000);

				onError(err);
			});
		} catch (exc) {
			console.error(exc.message);
		}
	}
}
function onTaskInfoSuccess(list){
	try {

		for (i = 0; i < list.length; i++) {
			var app = list[i];
			var newApp = {
				id: app.id,
				appName: app.name,
				style: "background-image: url('file://" + app.iconPath + "');",
				iconPath: app.iconPath,
				css: "app_" + app.id.replace(/\./g, "_").replace(/\ /g, "_"),
				installed: true
			};
			if (registeredApps[app.name]) {
				newApp.style = "background-image: url('"+ registeredApps[app.name] + "');";
				newApp.iconPath = registeredApps[app.name];
			}
			applications.push(newApp);
		}

		for (i = 0; i < 7; i++) {
			var taskDiv = $("<div><img /></div>").addClass("topTask");
			$(taskDiv).attr('id','topTask'+i);
			$("#topBar").append(taskDiv);
		}
	} catch (exc) {
		console.error(exc.message);
	}
}
