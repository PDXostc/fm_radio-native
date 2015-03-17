/* ==== ==== ==== init bottom bar js code ==== ==== ==== */

var Slide=[];
var homescreenTimeout;
var BottomBar = {};


BottomBar.TemplateHTML = "DNA_common/components/bottomBar/bottomBar.html";

BottomBar.LogoTimeoutMouseDown = function (e){
		console.log("BottomBar.LogoTimeoutMouseDown()");
			homescreenTimeout = setTimeout(function() {
				clearTimeout(homescreenTimeout);
				if(tizen.application.getCurrentApplication().appInfo.packageId != "JLRPOCX001"){
					tizen.application.getCurrentApplication().exit();
				}
			}, 2500);
		}
		
BottomBar.LogoTimeoutMouseUp = function (e){
			clearTimeout(homescreenTimeout);
		}
		
BottomBar.pageUpdate = function () {
		$('#bottomBar').replaceWith(BottomBar.bottomBarHTML.valueOf());
		
		$("#bottomBarLogoImg").mousedown(BottomBar.LogoTimeoutPress);
		
		$("#bottomBarLogoImg").mouseup(BottomBar.LogoTimeoutMouseUp);

		$("#volumeIndicator").click(function (e){
			$("#volumeSlider").toggle();
		});
		/* ==== ==== ==== init volume slider touch events ==== ==== ==== */

		$("#volumeSlider").on('mousedown',volDown);
		$("#volumeSlider").on('mouseout',volOut);
		$("#volumeSlider").on('mouseover',volOver);
		$("#volumeSlider").on('mousemove',volMove);
		$("#volumeSlider").on('touchstart',volDown);
		$("#volumeSlider").on('touchleave',volOut);
		$("#volumeSlider").on('touchend',volOut);
		$("#volumeSlider").on('touchmove',volMove);

		$("body").mouseup(function(e){
			Slide.mousedown=0; Slide.button=0;
		});
		depenancyMet("BottomBar.settingsIcon");
	}

BottomBar.includeHTMLSucess = function(linkobj) {
		console.log("BottomBar.includeHTMLSucess()");
		BottomBar.import = linkobj.path[0].import;
		console.log(BottomBar.import);
		BottomBar.bottomBarHTML = BottomBar.import.getElementById('bottomBar');
		setTimeout(BottomBar.pageUpdate,2000);
	}

BottomBar.includeHTMLFailed = function(linkobj) {
	console.log("load bottomBar.html failed");
	console.log(linkobj);
};
	
includeHTML(BottomBar.TemplateHTML, BottomBar.includeHTMLSucess, BottomBar.includeHTMLFailed);

/* ==== ==== ==== init volume slider js code ==== ==== ==== */

function volDown(e){
	console.log("voldown 1");
	Slide.mousedown=1; Slide.button=1;
	volMove(e);
}
function volOut(){
	console.log("volout 0");
	Slide.mousedown=0;
}
function volOver(){
	if(Slide.button)
		Slide.mousedown=1;
	console.log("volover "+Slide.mousedown);
}
function volMove(e){
	var height=e.target.offsetHeight;
	var yloc=e.pageY || e.originalEvent.targetTouches[0].clientY;
	console.log("mouse move "+height+" "+yloc);
	console.warn(e);
	if(Slide.mousedown){
		//TODO: replace e.target.offsetHeight and e.pageY for touch events!
		
		//pull some coordinates and percentages
		var parentOffset = height-120; //seems to be offset by topbar height
		var relY = Math.floor((yloc - parentOffset)/8.96);
		
		//quick and dirty math
		if(relY<1) relY=1;
		if(relY>100) relY=100;
		var invY = 100-relY;
		jqY = Math.floor((invY+1)*0.92+163); //From 163 to 255 = 92 different discreet volume settings
		
		//update appropriate onscreen widgets
		$("#volumeCrop").width(invY+'%');
		$("#volumeSlideCrop").height(invY+'.1%');
		$("#volumeKnob").css('top',(relY*8.80-70)+'px');
		
		//encode some stringified json (jqY = level 163 to 255) and send to most
		var jsonenc = {"api":"setTone","dest":"volume","level":jqY,"incr":0};
		most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	}
}
// Volume control update timer; this keeps the volume control slider synchronized
// when moving from widget to widget.

var volumeTimer = setInterval(refreshVolume, 2000);
var previousVolume = -1, curVolume=0;

// This is called by a periodic timer to cause a volumeQuery command to be sent to MOST. This is done so that when
// navigating from screen to screen, the volume control slider on the visible screen will stay in synch with the
// current MOST volume setting.
//
var volLogCnt=0;

function refreshVolume() {
								
	var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
	
	volLogCnt++;
	if(volLogCnt == 5)
	{
		//console.log("MOSTLOG refreshVolume query");
		volLogCnt=0;
	}
	if (typeof(most)!=="undefined") {
		most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	}	
}
// Sets the variable which holds the latest updated volume
// received from the MOST extension.
var volLogCntCB=0;

var volumeQueryCB = function(response) {

	volLogCnt++;
	if(volLogCntCB == 5)
	{	
		 console.log("MOSTLOG: volumeQueryCB " + response);
		 volLogCntCB=0;
	}
	curVolume = response;
	var sl = (curVolume - 159)/4;
		
	$(".noVolumeSlider").val(sl);
};


