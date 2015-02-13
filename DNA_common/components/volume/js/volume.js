console.log("start of volume.js");
var volumeSettingsPage={};
volumeSettingsPage.TemplateHTML = "DNA_common/components/volume/volume.html";

volumeSettingsPage.ShowPage = function() { 
		console.log('volume page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#volumePage').removeClass('hidden');

				/* ==== ==== ==== volume slider js code ==== ==== ==== */

		var settingsSlide=[];
		//var homescreenTimeout;
		//var BottomBar = {};
		//BottomBar.TemplateHTML = "DNA_common/components/bottomBar/bottomBar.html";

/*		BottomBar.LogoTimeoutMouseDown = function (e){
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
				}*/
				
/*		BottomBar.pageUpdate = function () {
				$('#bottomBar').replaceWith(BottomBar.bottomBarHTML.valueOf());
				
				$("#bottomBarLogoImg").mousedown(BottomBar.LogoTimeoutPress);
				
				$("#bottomBarLogoImg").mouseup(BottomBar.LogoTimeoutMouseUp);

				$("#volumeIndicator").click(function (e){
					$("#settings-volumeSlider").toggle();
				});
				/* ==== ==== ==== init volume slider touch events ==== ==== ==== */
/*
				$("#settings-volumeSlider").on('mousedown',volDown);
				$("#settings-volumeSlider").on('mouseout',volOut);
				$("#settings-volumeSlider").on('mouseover',volOver);
				$("#settings-volumeSlider").on('mousemove',volMove);
				$("#settings-volumeSlider").on('touchstart',volDown);
				$("#settings-volumeSlider").on('touchleave',volOut);
				$("#settings-volumeSlider").on('touchend',volOut);
				$("#settings-volumeSlider").on('touchmove',volMove);

				$("body").mouseup(function(e){
					Slide.mousedown=0; Slide.button=0;
				});
			}*/

/*		BottomBar.includeHTMLSucess = function(linkobj) {
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
			
		includeHTML(BottomBar.TemplateHTML, BottomBar.includeHTMLSucess, BottomBar.includeHTMLFailed);*/

		/* ==== ==== ==== init volume slider js code ==== ==== ==== */

		function volDown(e){
			console.log("voldown 1");
			settingsSlide.mousedown=1; settingsSlide.button=1;
			volMove(e);
		}
		function volOut(){
			console.log("volout 0");
			settingsSlide.mousedown=0;
		}
		function volOver(){
			if(settingSlide.button)
				settingSlide.mousedown=1;
			console.log("volover "+settingSlide.mousedown);
		}
		function volMove(e){
			var height=e.target.offsetHeight;
			var yloc=e.pageY || e.originalEvent.targetTouches[0].clientY;
			console.log("mouse move "+height+" "+yloc);
			console.warn(e);
			if(settingSlide.mousedown){
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
				$("#settingsVolumeSlideCrop").height(invY+'.1%');
				$("#settings-volumeKnob").css('top',(relY*8.80-70)+'px');
				
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
				console.log("MOSTLOG refreshVolume query");
				volLogCnt=0;
			}
			most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
			
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


	};

volumeSettingsPage.HidePage = function() { 
		console.log('volume page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#volumePage').addClass('hidden');
	};

volumeSettingsPage.pageUpdate = function() {
	console.log("volume pageUpdate()");

	$("#settingsVolumeSlider").on('mousedown',volDown);
	$("#settingsVolumeSlider").on('mouseout',volOut);
	$("#settingsVolumeSlider").on('mouseover',volOver);
	$("#settingsVolumeSlider").on('mousemove',volMove);
	$("#settingsVolumeSlider").on('touchstart',volDown);
	$("#settingsVolumeSlider").on('touchleave',volOut);
	$("#settingsVolumeSlider").on('touchend',volOut);
	$("#settingsVolumeSlider").on('touchmove',volMove);

	$("body").mouseup(function(e){
		settingSlide.mousedown=0; settingSlide.button=0;
	});

	if (!$('#settingsPage').length) {
		setTimeout(volumeSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(volumeSettingsPage.import.getElementById('volumePage'));
		Settings.addUpdateSettingsPage('volume','settings',volumeSettingsPage.ShowPage);
		var close_button = document.getElementById('volumeBackArrow').onclick = volumeSettingsPage.HidePage;
	}
};

volumeSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded volume.html");
   volumeSettingsPage.import = linkobj.path[0].import;
   volumeSettingsPage.volumePageHTML = volumeSettingsPage.import.getElementById('volumePage');
   volumeSettingsPage.volumeDeviceHTML = volumeSettingsPage.import.getElementById('volumeDeviceTemplate');   
   onDepenancy("Settings.settingsPage",volumeSettingsPage.pageUpdate,"Bluetooth");
   //volumeSettingsPage.pageUpdate();
};

volumeSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load volume.html failed");
	console.log(linkobj);
};


includeHTML(volumeSettingsPage.TemplateHTML, volumeSettingsPage.includeHTMLSucess, volumeSettingsPage.includeHTMLFailed);

console.log("end of volume.js");
	
