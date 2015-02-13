/* ==== ==== ==== init top bar js code ==== ==== ==== */

var TopBar = {};
var first=true;

TopBar.TemplateHTML = "DNA_common/components/topBar/topBar.html";

TopBar.topbarBack = function() {
	if(tizen.application.getCurrentApplication().appInfo.packageId != "JLRPOCX001"){
		tizen.application.launch('JLRPOCX001.HomeScreen', TopBar.backButtonWin, TopBar.backButtonFail);
		//Uncomment for Singletasking mode
		//tizen.application.getCurrentApplication().exit();
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
						"Fingerprint":"/DNA_common/images/fingerprint_inactive.png",
						"Multimedia Player":"/DNA_common/images/mediaplayer_inactive.png",
						"SmartDeviceLink":"/DNA_common/images/sdl_inactive.png",
						"syspopup-app":"/DNA_common/images/syspopup-app_inactive.png",
						"ApplicationVisibility":"/DNA_common/images/app_visibility_inactive.png",
						"Dialer":"/DNA_common/images/dialer_inactive.png",
						"Keyboard":"/DNA_common/images/keyboard_inactive.png",
						"MiniBrowser":"/DNA_common/images/mini_browser_inactive.png", 
						"Tizen":"/DNA_common/images/tizen_inactive.png",
						"gestureGame":"/DNA_common/images/gesture_game_inactive.png",
						"saythis":"/DNA_common/images/say_this_inactive.png",
						"Cameras":"/DNA_common/images/camera_icon.png",
						"FMRADIO":"/DNA_common/images/fmradio.png"
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
	var innerDiv = $("<span></span>").addClass("homeScrAppGridImg").attr("id","hex"+$(".homeScrAppGridFrame").size()).appendTo(rootDiv);
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
				$(this).attr("class", "draggable");
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
	if(first){
		var applications = [];
		/*applications.push({
			id: "http://com.intel.tizen/intelPocSettings",
			appName: "Settings",
			show: true,
			iconPath: "./DNA_common/components/settings/icon.png"
		});*/
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
			$("#topTask"+index+" img").attr("class", "draggable");
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
			if(false){
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
	}first=false;//(!first)
		if (jQuery.ui) {
			$(".topTask img").draggable({
				opacity:0.7,delay:1000,zIndex:2000,scroll:false,
				helper:"clone",appendTo:"body",
				revert:function(valid){
					if(!valid){
						dnaDropLaunch(this);//this.contents().replaceWith("<img>");
						onUpdateTopBar();
					}
					return false; // might this be better served by event.preventDefault, or event.stopPropagation, or !valid?
				},
				start: function(event,ui){
					$(this).css("visibility","hidden");
					ui.helper.animate({width:115,height:115},0);
					ui.helper.animate({width:150,height:150});
				},
				stop: function(){
					$(this).css("visibility","visible");
				}

			});
			$(".homeScrAppGridImg img").draggable({
				opacity:0.7,delay:1000,zIndex:2000,scroll:false,
				helper:"clone",appendTo:"body",
				revert:"invalid",
				start: function(event,ui){
					$(this).css("visibility","hidden");
					ui.helper.animate({width:115,height:115},0);
					ui.helper.animate({width:150,height:150});
				},
				stop: function(){
					$(this).css("visibility","visible");
				}
			});
			$(".droppable").droppable({
				tolerance:"intersect",
				drop: function(event,ui){
					if(ui.helper.context.parentElement.classList[0]=="homeScrAppGridImg")
						dnaGridLaunch(ui.helper.context.parentElement.id,event.target.id);
					else
						dnaSwitchLaunch(ui.helper.context.parentElement.id,event.target.id);
					onUpdateTopBar(); //this line placed here seems to make topbar apps unclickable...
				}
			});
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
			var taskDiv = $("<div></div>").addClass("topTask droppable");
			$(taskDiv).attr('id','topTask'+i);
			$("#topBar").append(taskDiv);
		}
	} catch (exc) {
		console.error(exc.message);
	}
	onStartTopBar();
	return true;
}
function isPopulated(id){
	return (typeof $("#topTask"+id+" img").attr("src")===typeof undefined);
}
function incrementId(id){
	return (id.substring(0, id.length - 1)+(parseInt(rightMost(id))+1));
}
function shiftLeft(){
	console.log("f:shiftleft");
	var id2=0;
	var lastBlank=false, recheck=false, flush=false;
	while(flush==false){
		for(var id=1;id<=6;id++){
			id2=id-1;
			if(!isPopulated(id) && isPopulated(id2)){
				$("#topTask"+id2).html($("#topTask"+id).html());
				$("#topTask"+id).html("");
				if(lastBlank==true) recheck=true;
				$("#topTask"+id2).find("img").css("visibility", "visible");
			}else{
				lastBlank=true;
			}
		}
		flush=!recheck;
		recheck=false;
	}
	return true;
}
function removeClones(id){
	//removes all duplicates of the icon at the given id number
	for(var id2=0;id2<=6;id2++){
		if(id2!=id){ //don't remove the id itself
			if($("#topTask"+id2).find("img").attr("src")==$("#topTask"+id).find("img").attr("src")){
				$("#topTask"+id2).html("");
			}
		}
	}
}

function rightMost(text){
	return text.slice(-1);
}
function dnaGridLaunch(id1,id2){
	//Adding from App Grid
	var x=$("#"+id1).contents().slice(0,1).clone().css("visibility","visible");
	$("#"+id2).html(x);
	$("#"+id2).click(function(){
		$("#"+id1).parent().click();
	});
	console.log(id2+" handler now points to parent of "+id1);
	removeClones(rightMost(id2));
	shiftLeft();
	return true;
}
function dnaSwitchLaunch(id1,id2){
	//Moving from topbar
	if(id1!==id2){
		var x=$("#"+id1).contents();
		$("#"+id2).html(x);
		$("#"+id1).html("");
	}
	removeClones(rightMost(id2));
	shiftLeft();
	return true;
}
function dnaDropLaunch(element){
	//Dragging off topbar
	element.parent().html("");
	shiftLeft();
	return true;
}

function supports_html5_storage() {
	//Check for html5 localstorage support: Returns true or false
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

var dataResolved=false;
var updateText='resolved';
var name="";

function addLineToFile(file, line){

}
function getLineFromFile(file, line){

}

function setIcons(id,text){
	addLineToFile('./Documents/.topbar.ini',id)
	addLineToFile('./Documents/.topbar.ini',text)
	return localStorage.setItem(x,JSON.stringify(y));
}
function getIcons(id){
	return JSON.parse(localStorage.getItem(id) || getFile('./Documents/.topbar.ini',id) || null);
}

function onStartTopBar(){
	//check for the existence of the data and repopulate
	try {
		//read the data
		for(tasks=0;tasks<7;tasks++){
			name="topTask"+tasks;
			//replace icons
			$('#'+name).html(getIcons(name));
			updateText+="Retrieved ::"+name+" : "+getIcons(name);
		}
		console.log(updateText);
		dataResolved=true;
	} catch (exc) {
		console.log(':: No data was retrieved for customizable topbar. '+exc.message);
	}
}

function onUpdateTopBar(){
	//add/move/remove? save data
	if(dataResolved){
	console.log(':: Updating topbar data object');
	updateText="";
		try {
			//overwrite data
			for(tasks=0;tasks<7;tasks++){
				name="topTask"+tasks;
				//save icons
				setIcons(name,$('#'+name).html());
				
				//check icons
				updateText+="Saved ::"+name+" : "+getIcons(name);
			}
			console.log('updated'+updateText);
		} catch (exc) {
			console.log(':: Could not save data during top bar update: ' + exc.message);
		}
	}
}
