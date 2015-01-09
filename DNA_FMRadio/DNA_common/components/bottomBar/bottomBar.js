/**
 * @module CarTheme
 **/
 
$("#bottomBar").remove();
$("body").append('<div id="bottomBar" class="shadowSmall"></div>');

function loadSettings(){
	if (typeof Settings === 'undefined') {
		loadScript('./DNA_common/components/settings/js/settings.js', function(path, status) {
			if (status === "ok") {
				Settings.silentinit();
			}
		});
	}
	$('#settingsMenu').toggle();
}

(function ($) {
    "use strict";
    /**
     * Class which provides methods to fill content of bottom bar for JQuery plugin. Use following snippet to include component in your `index.html` file:
     * 
     *     <script type="text/javascript" src="./common/components/bottomBar/bottomBar.js"></script>
     *
     * and following code to initialize:
     *
     *     $('#bottomBar').bottomBar('init', true);
     *
     * @class BottomBar
     * @constructor
     * @static
     */

    var BottomBar = {
            /**
             * Holds current object of this JQuery plugin.
             * @property thisObj {Object}
             */
            thisObj: null,
            /** 
             * Initializes bottom bar.
             * @method init
             * @param backButtonDisabled {Bool} Indicates if bottom bar should contain back button.
             * @parama volumeSliderDisabled
             */
            init: function (backButtonDisabled,volumeSliderDisabled) {
            	
            	volumeSliderDisabled = (volumeSliderDisabled == undefined)? false:true;
            	
				//$("#settingsMenu").remove();
				//$("#settingsicon").remove();
				$("#bottomBarLogoImg").remove();
				$("#volumeSlider").remove();
				$("#volume").remove();

				var CloseButton='';
                if (!backButtonDisabled) {
                    CloseButton='<img id="closeApp" src="./DNA_common/images/Kill_App_Off.png" onclick="$(\'#' + this.attr('id') + '\').bottomBar(\'onBackButtonClick\');">';
                }
               	this.append('<div id="settingsMenu"></div>');
						this.append('<img id="settingsIcon">');
						Settings.pageUpdate();
						this.append('<img id="bottomBarLogoImg" src="./DNA_common/images/JLR-Logo.png" onclick="launchApplication(\'intelPoc10.HomeScreen\')">');
                
                if($('#volumeControl').length == 0){
	                if(!volumeSliderDisabled){
						$("#volumeSlider").remove();
	                	this.append(
						'<div id="volumeSlider" onmousedown="volDown();" onmouseout="volOut();" onmouseover="volOver();" onmousemove="volMove(arguments[0]);">' +
							'<div id="volumeChannel"><div id="volumeSlideCrop">' +
								'<img id="volumeIndicator2" src="./DNA_common/images/VolSlideFull.png">' +
							'</div></div><br clear="all">' +
							'<div id="volumeKnob">' +
								'<img src="./DNA_common/images/VolSlideCtrl.png">' +
							'</div>' +
							'<span id="VolLabel">Volume</span>' +
						'</div>');

	                	this.append(
						'<div id="volume" onclick="$(\'#volumeSlider\').toggle();">' +
							'<div id="volumeCrop">' +
								'<img id="volumeIndicator" src="./DNA_common/images/VolFull.png">' +
							'</div>' +
						'</div>');
	                	
	                }
                }
                
                BottomBar.thisObj = this;
            },
            /** 
             * Method is invoked after click on back button, fires clickOnBackButton event and causes application exit.
             * @method onBackButtonClick
             */
            onBackButtonClick: function () {
                BottomBar.thisObj.trigger("clickOnBackButton");
                if (typeof tizen !== "undefined") {
                    tizen.application.getCurrentApplication().exit();
                }
            }
        };

    /** 
     * jQuery constructor for {{#crossLink "BottomBar"}}{{/crossLink}} plugin.
     * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
     * @for jQuery
     * @method bottomBar
     * @return Result of called method.
     */
    $.fn.bottomBar = function (method) {
        // Method calling logic
        if (BottomBar[method]) {
            return BottomBar[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return BottomBar.init.apply(this, arguments);
        }

        $.error('Method ' +  method + ' does not exist on jQuery.infoPanelAPI');
    };
}(jQuery));

/* ==== ==== ==== init new volume slider js code ==== ==== ==== */
    var Slide=[];
	$("body").mouseup(function(e){
		Slide.mousedown=0; Slide.button=0;
    });
	function volDown(){
		Slide.mousedown=1; Slide.button=1;
    }
	function volOut(){
		Slide.mousedown=0;
    }
	function volOver(){
		if(Slide.button)
			Slide.mousedown=1;
    }
	function volMove(e){
		if(Slide.mousedown){
			//pull some coordinates and percentages
			var parentOffset = e.target.offsetHeight-120; //seems to be offset by topbar height
			var relY = Math.floor((e.pageY - parentOffset)/8.96);
			
			//quick and dirty math
			if(relY<1) relY=1;
			if(relY>100) relY=100;
			var invY = 100-relY;
			jqY = Math.floor((invY+1)*0.92+163); //From 163 to 255 = 92 different discreet volume settings
			
			//update appropriate onscreen widgets
			$("#volumeCrop").width(invY+'%');
			$("#volumeSlideCrop").height(invY+'%');
			$("#volumeKnob").css('top',(relY*8.80-70)+'px');
			
			//encode some stringified json (jqY = level 163 to 255) and send to most
			var jsonenc = {"api":"setTone","dest":"volume","level":jqY,"incr":0};
			most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
		}
    }
/* ==== ==== ==== quit new volume slider js code ==== ==== ==== */

// Volume control update timer; this keeps the volume control slider synchronized
// when moving from widget to widget.

var volumeTimer = setInterval(refreshVolume, 2000);
var previousVolume = -1, curVolume=0;

// This is called by a periodic timer to cause a volumeQuery command to be sent to MOST. This is done so that when
// navigating from screen to screen, the volume control slider on the visible screen will stay in synch with the
// current MOST volume setting.
//
function refreshVolume() {
								
	var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
	//console.log("JE: refreshVolume query");
	//most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	
}
// One or both of these will need to set the variable which holds the latest updated volume
// received from the MOST.
var volumeQueryCB = function(response) {
	 console.log("JE js: volumeQueryCB " + response);
	 curVolume = response;
	var sl = (curVolume - 159)/4;
		
	$(".noVolumeSlider").val(sl);
};
	
var volumeSetCB = function(response) {
	  console.log("JE js: volumeSetCB " + response);
};	
