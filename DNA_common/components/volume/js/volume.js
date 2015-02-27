console.log("start of volume.js");
var volumeSettingsPage={};
volumeSettingsPage.TemplateHTML = "DNA_common/components/volume/volume.html";
// Holds the Audio context for change audio (volumb and ballance in varous domains)
volumeSettingsPage.audioContext = null;
volumeSettingsPage.indexVolumeDomain = 1; // this should change when the domain of control changes.
volumeSettingsPage.indexMuteDomain = 2; // this should change when the domain of control changes.

// Lists all the audio domains
volumeSettingsPage.print_all_controls = function(context) {
	console.info("print_all_controls context:",context);
    for (var i = 0; i < context.volume_controls.length; i++)
        console.info("audio domain:",context.volume_controls[i].label,"index",i);
}

// Called when a connect to the audio context
volumeSettingsPage.connect_success = function (context) {
	volumeSettingsPage.audioContext = context;
    console.info("Connected to the audio system.");
    volumeSettingsPage.print_all_controls(volumeSettingsPage.audioContext);
}

// Called when a connect failes
volumeSettingsPage.connect_error = function (error) {
    console.info("Failed to connect to the audio system: " + error.message);
}

// Called when a connection is removed
volumeSettingsPage.disconnected = function (event) {
	volumeSettingsPage.audioContext = null;
    console.info("Connection to the audio system lost.");
}

/* Called to set the master volume
 * Note the index of indexVolumeDomain is selected as the default for controlling volume
 * This may need to change if there are changes in the audio domains
 * In the future it would be good to select the volume domain under control
 */
volumeSettingsPage.setMasterVolumb = function(vol) {
	if (volumeSettingsPage.audioContext) {
		volumeSettingsPage.audioContext.volume_controls[volumeSettingsPage.indexVolumeDomain].set_volume(vol);
	}
}

// Called to get the master volume note that this also has the index.
volumeSettingsPage.getMasterVolumb = function() {
	if (volumeSettingsPage.audioContext) {
		return volumeSettingsPage.audioContext.volume_controls[volumeSettingsPage.indexVolumeDomain].volume;
	} else {
		return 0;
	}
}

/* Called to set the master mute
 * Note the index of indexMuteDomain is selected as the default for controlling volume
 * This may need to change if there are changes in the audio domains
 * In the future it would be good to select the volume domain under control
 */
volumeSettingsPage.setMasterMute = function(mute) {
	if (volumeSettingsPage.audioContext) {
		volumeSettingsPage.audioContext.mute_controls[volumeSettingsPage.indexMuteDomain].set_muted(mute);
	}
}

// Called to get the master volume note that this also has the index.
volumeSettingsPage.getMasterMute = function() {
	if (volumeSettingsPage.audioContext) {
		return volumeSettingsPage.audioContext.mute_controls[volumeSettingsPage.indexMuteDomain].muted;
	} else {
		return false;
	}
}


window.tizen.audiosystem.connect(volumeSettingsPage.connect_success, volumeSettingsPage.connect_error);
window.tizen.audiosystem.addEventListener("disconnected", volumeSettingsPage.disconnected);

volumeSettingsPage.ShowPage = function() { 
		console.log('volume page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#volumePage').removeClass('hidden');

				/* ==== ==== ==== volume slider js code ==== ==== ==== */

		// Volume control update timer; this keeps the volume control slider synchronized
		// when moving from widget to widget.

		var volumeTimer = setInterval(refreshVolume, 2000);

		// This is called by a periodic timer to cause a volumeQuery command to be sent to MOST. This is done so that when
		// navigating from screen to screen, the volume control slider on the visible screen will stay in synch with the
		// current MOST volume setting.
		//

		function refreshVolume() {
			volumeSettingsPage.UpdateVolumeSlider(volumeSettingsPage.getMasterVolumb());
		}
	};

volumeSettingsPage.HidePage = function() { 
		console.log('volume page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#volumePage').addClass('hidden');
	};

volumeSettingsPage.OnVolumeSliderMinus = function() {
	console.log("OnVolumeSliderMinus");
	var vol = volumeSettingsPage.getMasterVolumb();
	if (vol>.05) {
		vol = vol - .05;
	} else {
		vol = 0;
	}
	volumeSettingsPage.setMasterVolumb(vol);
	volumeSettingsPage.UpdateVolumeSlider(vol);
}
volumeSettingsPage.OnVolumeSliderPlus = function() {
	console.log("OnVolumeSliderPlus");
	var vol = volumeSettingsPage.getMasterVolumb();
	if (vol<.95) {
		vol = vol + .05;
	} else {
		vol = 1;
	}
	volumeSettingsPage.setMasterVolumb(vol);
	volumeSettingsPage.UpdateVolumeSlider(vol);
}

volumeSettingsPage.onSliderChange = function() {
	var vol = $("#settingsVolumeSlider").attr("value") / 100;
	console.log("onSliderChange",vol,$("#settingsVolumeSlider").attr("value"));
	volumeSettingsPage.setMasterVolumb(vol);
}

volumeSettingsPage.UpdateVolumeSlider = function(vol) {
	$("#settingsVolumeSlider").attr("value",vol*100);
}

volumeSettingsPage.onMuteClick = function() {
	if ($("#volumePowerButton").children("div").hasClass("on")) {
		$("#volumePowerButton").children("div").removeClass("on").addClass("off");
		volumeSettingsPage.setMasterMute(true);
	} else {
		$("#volumePowerButton").children("div").removeClass("off").addClass("on");
		volumeSettingsPage.setMasterMute(false);
	}
}

volumeSettingsPage.pageUpdate = function() {
	console.log("volume pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(volumeSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(volumeSettingsPage.import.getElementById('volumePage'));
		Settings.addUpdateSettingsPage('volume','settings',volumeSettingsPage.ShowPage);
		$("#volumePowerButton").on("click",volumeSettingsPage.onMuteClick);
		$("#volumePowerButton").children("div").removeClass("off").addClass("on");
		$("#settingsVolumeSliderMinus").on('click',volumeSettingsPage.OnVolumeSliderMinus);
		$("#settingsVolumeSliderPlus").on('click',volumeSettingsPage.OnVolumeSliderPlus);
		$("#settingsVolumeSlider").attr("max",100);
		$("#settingsVolumeSlider").attr("min",0);
		$("#settingsVolumeSlider").on('change',volumeSettingsPage.onSliderChange);

		document.getElementById('volumeBackArrow').onclick = volumeSettingsPage.HidePage;
		volumeSettingsPage.UpdateVolumeSlider(volumeSettingsPage.getMasterVolumb());
	}
};

volumeSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded volume.html");
   volumeSettingsPage.import = linkobj.path[0].import;
   volumeSettingsPage.volumePageHTML = volumeSettingsPage.import.getElementById('volumePage');
   volumeSettingsPage.volumeDeviceHTML = volumeSettingsPage.import.getElementById('volumeDeviceTemplate');   
   onDepenancy("Settings.settingsPage",volumeSettingsPage.pageUpdate,"Bluetooth");
};

volumeSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load volume.html failed");
	console.log(linkobj);
};


includeHTML(volumeSettingsPage.TemplateHTML, volumeSettingsPage.includeHTMLSucess, volumeSettingsPage.includeHTMLFailed);

console.log("end of volume.js");
	
