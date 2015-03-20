/* ==== ==== ==== init top bar variables ==== ==== ==== */

var TopBar = {};
var taskList = [];
	for(var i=0;i<7;i++)
		emptyIcon(i);
var first=true;
var topbarDnD=false;
//var dataResolved=false;
var updateText='resolved\n';
var name="";
var extras = 0, index = 0, icon = 0, id = 0, installed=0;
var appList = [], applications = [], topBarApplicationsModel = [], extraAppsModel = [], toptasks = [];
var HomeScreenName = "Home Screen";
var registeredApps;
var jReq = new XMLHttpRequest();
	jReq.onload = reqListener;
	jReq.open("get", "/DNA_common/json/apps.json", true);
	jReq.send();
function reqListener(e){
	registeredApps = JSON.parse(this.responseText)[0];
}

/* ==== ==== ==== init top bar js code ==== ==== ==== */

TopBar.TemplateHTML = "DNA_common/components/topBar/topBar.html";

TopBar.topbarBack = function() {
	if(tizen.application.getCurrentApplication().appInfo.packageId != "JLRPOCX001"){
		callApp('JLRPOCX001.HomeScreen');
	}
}

TopBar.toggleGrid = function(){
	$("#volumeSlider").hide();
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
	$("#appGridIcon").click(TopBar.toggleGrid);
	$(".exitButton").click(TopBar.toggleGrid);
	initAppGrid();
	initTaskLauncher();
}

TopBar.includeHTMLSuccess = function(linkobj) {
		console.log("TopBar.includeHTMLSuccess()");
		TopBar.import = linkobj.path[0].import;
		console.log(TopBar.import);
		TopBar.topBarHTML = TopBar.import.getElementById('topBar');
		setTimeout(TopBar.pageUpdate,200);
}

TopBar.includeHTMLFailed = function(linkobj) {
	console.log("load topBar.html failed");
	console.log(linkobj);
};

includeHTML("DNA_common/components/topBar/topBar.html", TopBar.includeHTMLSuccess, TopBar.includeHTMLFailed);

/* ==== ==== ==== init app grid js code ==== ==== ==== */

function onLaunchSuccess(x){
	$("#hexGridView").hide();
	$("#volumeSlider").hide();
	window.setTimeout(function() {
		tizen.application.getCurrentApplication().hide();
	}, 300);
}
function onSwitchSuccess(x){
	$("#hexGridView").hide();
	$("#volumeSlider").hide();
	tizen.application.getCurrentApplication().hide();
}
function onError(x){
	console.log(x);
}
function onRunningAppsContext(contexts,targetId){
	var target = "";
    for (var i = 0; i < contexts.length; i++) {
        if (contexts[i].appId == targetId) {
			tizen.application.launch(targetId, onSwitchSuccess, onError);
			target="found";
			console.log(targetId+" Switched!");
        }
    }
    if(target!=="found"){
		tizen.application.launch(targetId, onLaunchSuccess, onError);
		console.log(targetId+" Launched!");
	}
}
function callApp(appId){
	tizen.application.getAppsContext(function(e){onRunningAppsContext(e,appId)});
}

function launchApplication(id) {
	"use strict";
	console.log('launchApplication('+id+');');
	if (id === "http://com.jaguar.tizen/settings") {
		Settings.init();
		Settings.show();
		return;
	}

	var app = getAppByID(id);
	if ( !! app) {
		if( app != tizen.application.getCurrentApplication() ){
			callApp(app.id);
		}
	} else {
		console.log("Application is not installed!");
	}
}

/* Based on Legacy Code */

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
					if( appData.id != tizen.application.getCurrentApplication().appInfo.id ){
						callApp(appData.id);
					}else{TopBar.toggleGrid();}
				}
				break;
			}
		}
	} catch (exc) {
		console.error(exc.message);
	}
}

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
	return str.substring(str.length-len, str.length);
}
function After(str, len){
	return str.substring(len);
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
				if(registeredApps[id]){
					icon = registeredApps[id];
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
			if (registeredApps[app.id]) {
				newApp.style = "background-image: url('"+ registeredApps[app.id] + "');";
				newApp.iconPath = registeredApps[app.id];
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
				switch(applications[i].appName){
					case HomeScreenName:
					case 'crosswalk':
					case 'Dialer':
					case 'Rygel':
					case 'NFC Manager':
					case 'pkgmgr-install':
						offset=offset+1; //hide these apps from the App Grid for reasons
						break;
					default:
						if(Divisible(i-offset,5)){
							$('#hexGridView #hexGrid').append($("<div></div>").addClass("hexrow"));
						}
						insertAppFrame(applications[i]);
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
		if (topbarDnD && jQuery.ui) {
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
					onUpdateTopBar();
				}
			});
		}
	} catch (exc) {
		console.log(exc.message);
	}
}

/* ==== ==== ==== init task launcher js code ==== ==== ==== */

function initTaskLauncher(){
	"use strict";
	if (typeof tizen !== 'undefined') {
		try {
			//Update the topbar icon
			if(tizen.application.getCurrentApplication().appInfo.packageId == "JLRPOCX001")
				$("#homeScreenIcon").attr('src', '/DNA_common/images/Tizen.png');
			else
				$("#homeScreenIcon").attr('src', '/DNA_common/images/homescreen_icon.png');

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
			if (registeredApps[app.id]) {
				newApp.style = "background-image: url('"+ registeredApps[app.id] + "');";
				newApp.iconPath = registeredApps[app.id];
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
	Configuration.reload(onStartTopBar);
	return true;
}

/* ==== ==== ==== persistence functions ==== ==== ==== */

function supports_html5_storage() {
	//Check for html5 localstorage support: Returns true or false
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
function setIcons(){
	//localStorage.setItem(id,JSON.stringify(taskList[id]));
	for(id=0;id<7;id++){
		Configuration.set("Settings.topBar.task"+id,taskList[id]);
	}
	Configuration.save();
	initAppGrid();
}
function getIcons(id){
	//return JSON.parse(localStorage.getItem(id));
	return Configuration.get("Settings.topBar.task"+id);
}
function initIcon(){
	//initialize icons
	/*
	for(tasks=0;tasks<7;tasks++){
		if(JSON.stringify(getIcons(tasks)).length < 22)
			taskList[tasks] = {source:"", cb:""};
		else
			taskList[tasks]=getIcons(tasks);
	}*/
	taskList=[{source:"/DNA_common/images/navigation_inactive.png",	cb:"JLRPOCX015.Navigation"},
			  {source:"/DNA_common/images/browser_inactive.png",	cb:"JLRPOCX030.Browser"},
			  {source:"/DNA_common/images/dashboard_inactive.png",	cb:"JLRPOCX033.Dashboard"},
			  {source:"/DNA_common/images/hvac_inactive.png",		cb:"JLRPOCX008.HVAC"},
			  {source:"/DNA_common/images/weather_inactive.png",	cb:"JLRPOCX035.Weather"},
			  {source:"/DNA_common/images/fmradio.png", 		cb:"JLRPOCX004.FMRadio"},
			  {source:"/DNA_common/images/nfc_inactive.png", 		cb:"JLRPOCX034.NFC"}];
	displayTasks();
	initAppGrid();
}
function primeIcon(id,content){
	if(content.length>0){
		$("#topTask"+id).html("<img class='draggable' src='"+content+"''>");
		$("#topTask"+id).click(function(){
			if( taskList[id].cb != tizen.application.getCurrentApplication().appInfo.id ){
				callApp(taskList[id].cb);
			}
		});
	}else{
		$("#topTask"+id).html("");
	}
}

/* ==== ==== ==== topbar display code ==== ==== ==== */

function topbarDedupe(){
	for(i in taskList){
		for(n = 6; n >= 0; n--){
			if(n != i && taskList[n].cb == taskList[i].cb)
				taskList[i] = {source:"", cb:""};
		}
	}
}
function topbarReindex(){
    var temp = [], start=0;
    for(i in taskList){
    	if(taskList[i].source.length>0)
        	temp[start++] = taskList[i];
    }
    for(var n=start;n<7;n++){
    	temp[n] = {source:"", cb:""};
    }
	return temp;
}
function topbarRender(){
	for(var id=0;id<7;id++){
		primeIcon(id,taskList[id].source);
	}
}
function displayTasks(){
	//removes all icon duplicates
	topbarDedupe();

	//reindex the array
	taskList = topbarReindex();

	//render the topbar
	topbarRender();
	return true;
}

/* ==== ==== ==== dragging functions ==== ==== ==== */

function emptyIcon(task){
	taskList[task] = {source:"", cb:""};
}
function dropIcon(icon){
	var comparison1 = icon.attr("src");
	for(n = 0; n < 7; n++){
		var comparison2 = taskList[n].source;
		if(comparison1 == comparison2){
			taskList[n] = {source:"", cb:""};
		}
	}
}
function replaceIcon(id,icon){
	$("#hex"+id).children().css("visibility", "visible");
}
function addIconAtLocation(topbarLocation, gridIcon, clickListener){
	taskList[topbarLocation]={source:gridIcon, cb:clickListener};
}

function dnaGridLaunch(id1,id2){
	//Get ID Numbers
	id1=After(id1,3);
	id2=Right(id2,1);

		//Adding from App Grid
		var topbarLocation = id2;
		var gridIcon = $("#hex"+id1).parent().data()["appData"].style.slice(23).slice(0,-3); //"Grid Icon" is path to actual icon
		var clickListener = $("#hex"+id1).parent().data()["appData"].id; //"Click listener" is actual app ID

		addIconAtLocation(topbarLocation, gridIcon, clickListener);

	displayTasks();
	replaceIcon(id1, gridIcon); // Don't remove it from the app grid!
}
function dnaSwitchLaunch(id1,id2){
	//Get ID Numbers
	id1=Right(id1,1);
	id2=Right(id2,1);

	//Moving from topbar
	if(id1!==id2){
		var topbarLocation=id2;
		var gridIcon = taskList[id1].source;
		var clickListener = taskList[id1].cb;

		addIconAtLocation(topbarLocation, gridIcon, clickListener);
	}
	displayTasks();
}
function dnaDropLaunch(element){
	//Dragging off topbar
	dropIcon(element);
	displayTasks();
}

/* ==== ==== ==== event code for persistence ==== ==== ==== */

function onStartTopBar(){
	//check for the existence of the data and repopulate
	try {
		//initialize icons
		initIcon();
	} catch (exc) {
		console.log(':: No data was retrieved for customizable topbar. '+exc.message);
	}
}

function onUpdateTopBar(){
	//add/move/remove? save data
	try {
		//save icons
		setIcons();
	} catch (exc) {
		console.log(':: Could not save data during top bar update: ' + exc.message);
	}
}
