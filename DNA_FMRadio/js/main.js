/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:             main.js
* Version:              1.0
* Date:                 Feb. 2015
* Project:              DNA_FMRadio
* Contributors:         Frederic Plourde
*
*
*/

/**
 * Very Simple Application state tracker mechanism for operations
 * like keypad direct tuning and scanning.
 * Possible states are :
 *
 * STATE_NORMAL             : Main app state under normal operation
 * STATE_DIRECT_TUNING_1    : User has entered direct tuning. Ready to input digit 1
 * STATE_DIRECT_TUNING_2    : User has entered digit1, ready to input digit 2
 * STATE_DIRECT_TUNING_3    : User has entered digit2, ready to input digit 3
 * STATE_DIRECT_TUNING_4    : User has entered digit3, ready to input digit 4
 * STATE_DIRECT_TUNING_FULL : User has entered digit4, no more digits can be entered
 * STATE_SEEKING            : User has launched a seek. waiting for a stationFound
 * STATE_SCANNING_SEEK_DW   : User has entered scanning down mode. waiting for a channel
 * STATE_SCANNING_SEEK_UP   : User has entered scanning up mode. waiting for a channel
 * STATE_SCANNING_SHOW      : System found a station and is rendering for 5 seconds.
 * STATE_ERROR              : FMRadio{Service,Extension} had an unrecoverable error
 *
@property state {String}
 */
var state = "STATE_NORMAL";

/**
 * Very simple mouse down/up states for tracking
 * mousehold gestures.
 * Possible states are :
 *
 * STATE_MOUSE_UP           : The mouse's left button is not pressed
 * STATE_MOUSE_DOWN         : The mouse's left button is pressed
 *
@property state {String}
 */
var mouseState = "STATE_MOUSE_UP";

/**
 * Temporary 'string' frequency when in DIRECT_TUNING state
@property directTuningFreqStr {String}
 */
var directTuningFreqStr;

/**
 * Frequency that was current before a scan is initiated
@property preScanFrequency {Number}
 */
var preScanFrequency;

/**
 * Useful constants
@property constants {Object}
 */
var constants = {
    'NUM_OF_PRESETS'           : 6,                     // Number of presets to load
    'FREQ_MAX_LIMIT'           : 108000000,             // Higher end of valid freq.
    'FREQ_MIN_LIMIT'           : 88000000,              // Lower end of valid freq.
    'KEYCODE_ESC'              : 27,                    // Keycode for "ESCAPE" char
    'FLASH_TIME'               : 500,                   // flashing timer timeout
    'MOUSE_HOLD_TIMEOUT_TIME'  : 2000,                  // Time to wait for mousehold
    'SCAN_WAIT_TIMEOUT_TIME'   : 5000,                  // Time to wait when scanning
    'PRESET_PREFIX'            : "com.jlr.dna-fmradio." // presets localStorage pref.
};

/**
 * Station presets channel/frequency values
 * We use the actual {int} here for values, as we have to feed FMRadioService
 * There should be constants.NUM_OF_PRESETS presets in the array
 * Value (-1) means the preset is not defined.
 * with {int} frequencies in Hz
@property presets {Object}
 */
var presets = [
                -1,
                -1,
                -1,
                -1,
                -1,
                -1
];

/**
 * Interval variable used to make Digits flash
 * It is important to set the flashInterval to 'null' when
 * not in use to indicate that there's no animation going on
 *
@property flashInterval {Object}
 */
var flashInterval = null;

/**
 * Timeout variable used to track mousehold gestures
 *
@property mouseHoldTimeout {Object}
 */
var mouseHoldTimeout = null;

/**
 * Timeout variable used to track scanWaits
 *
@property scanWaitTimeout {Object}
 */
var scanWaitTimeout = null;

/**
 * Currently shown dash opacity in direct tuning animation
 *
@property curDashOpacity {Number}
 */
var curDashOpacity = 1.0;

/**
 * Currently shown big digits opacity in "scanning wait" animations
 *
@property curDigitsOpacity {Number}
 */
var curDigitsOpacity = 1.0;

/**
 * Utility function to replace a single char in a string by another one
 *
 * @method setCharAt
 * @param  str   {String} The String in which replacement will occur
 * @param  index {Number} The index of the char to replace
 * @param  chr   {String} The new character
 * @static
 */
function setCharAt(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

/**
 * Helper function to clip a number between two limits
 *
 * @method clip
 * @param  n     {Number} The number to clip
 * @param  lower {Number} The lower limit
 * @param  upper {Number} The upper limit
 * @static
 */
function clip(n, lower, upper) {
  return Math.max(lower, Math.min(n, upper));
}

/**
 * Validates if the passed-in frequency (String) is in the correct
 * range / follows the right format.
 * This function supports input freq. as a number OR as a string.
 * If freq. is a number : Is assumed in Hz and validation is against range only
 * If freq. is a string : Is assumed string representation of a float (with .)
 *
 * @method freqIsValid
 * @param  freq {String} Frequency to validate.
 * @static
 */
function freqIsValid(freq) {
    var freqHz;
    if (typeof freq == "number" ) {
        // the 'Number' version assume freq. already in Hz
        freqHz = freq;
    } else if (typeof freq == "string" ) {
        // basic initial checks
        if (freq.charAt(freq.length-1) == ".") {
            return false;
        }
        freqHz = (parseFloat(freq)) * 1000000;
    }

    // then check against the freq range.
    if ((freqHz >= constants.FREQ_MIN_LIMIT) &&
        (freqHz <= constants.FREQ_MAX_LIMIT)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Set StationID Big Digits frequency value
 * This function supports input freq. as a number OR as a string.
 * If freq. is a number : automatic truncation will happen to fit XXX.X
 * If freq. is a string : caller needs to send correct format. No check made.
 *
 * @method setStationIdFrequency
 * @param  freq {number,string} Frequency to set. Can be either string or number
 * @static
 */
function setStationIdFrequency(freq, opacity, dash, dashOpacity) {
    console.error("DEBUG: entered setStationIdFrequency, opacity = " + opacity);
    var innerHTML;

    // default values
    if(typeof(opacity) === 'undefined') opacity = 1;
    if(typeof(dash) === 'undefined') dash = false;

    var element = document.getElementById("station-id");

    // We always put the frequency inside <span> tags to enable
    // easy transparency setting.
    innerHTML = "<span style=\"opacity: " + opacity + ";\">";

    if (typeof freq == "number" ) {
        console.error("DEBUG: number");
        var freqMHz = freq / 1000000;
        innerHTML += freqMHz.toFixed(1);
        console.error("DEBUG: frequencyID innerHTML = " + innerHTML);
    } else if (typeof freq == "string" ) {
        console.error("DEBUG: string");
        var strLength = freq.length;
        if (strLength > 0) {
            var index;
            if (freq.charAt(0) == "1") index = 2; else index = 1;
            var subStr = freq.substr(0, Math.min(strLength-1, index) + 1);

            // subStr length can never be > than index + 1;
            if (subStr.length < (index + 1)) {
                innerHTML += freq;
            } else {
                innerHTML += subStr + ".";
            }

            // Now, show the remaining digit from freq is any
            if (freq.length > subStr.length) {
                innerHTML += freq.charAt(freq.length-1);
            }

            // Lastly, check for validity and set color and OK button accordingly.
            var okBtn = document.getElementById("numOK");
            if (!freqIsValid(innerHTML)) {
                okBtn.classList.remove("dna-orange");
                okBtn.classList.add("fm-gray");
            } else {
                okBtn.classList.add("dna-orange");
                okBtn.classList.remove("fm-gray");
            }
        } else {
            innerHTML += freq;
        }

        // Add the "flashing dash" at the end if in direct tuning mode
        // 'dash' should only be used with 'String' mode. Note that the
        // is not showned on STATE_DIRECT_TUNING_FULL
        if (dash && (state != "STATE_DIRECT_TUNING_FULL")) {
            innerHTML += "<span style=\"opacity: " +
                                 dashOpacity + ";\">_</span>";
        }
    } else {
        console.error("Bad Station frequency type !");
        return;
    }

    console.error("DEBUG: frequencyID innerHTML = " + innerHTML);
    // We close the <span>
    innerHTML += "</span>";
    console.error("DEBUG: frequencyID innerHTML = " + innerHTML);

    // Add the "fm" at the very end
    innerHTML += "<span class=\"fm-designation\">FM</span>";

    console.error("DEBUG: frequencyID innerHTML = " + innerHTML);
    element.innerHTML = innerHTML;
}

/**
 * Modify StationId Big Digits frequency according to last Direct Tuning input
 * This method can only be called when in one of the 'direct tuning' states
 *
 * @method updateStationIdDigit
 * @param  num_value {Number} Numerical value of the single digit to set
 * @static
 */
function updateStationIdDigit(add, num_value) {
    console.error("DEBUG: entered updateStationIdDigit");


    if (state.indexOf("DIRECT_TUNING") > -1) {
        var strLength = directTuningFreqStr.length;

        /* We can only start frequency value with '1', '8' or '9' */
        if ((strLength == 0) && ((num_value != "1") &&
                                 (num_value != "8") &&
                                 (num_value != "9"))) {
            return;
        }

        // First, update the state machine, since we added or removed a digit
        switch(state) {
            case "STATE_NORMAL":
                console.error("STATE_ERROR: keypad-box cannot be clicked" +
                              "(hidden) when in STATE_NORMAL");
                break;
            case "STATE_DIRECT_TUNING_1":
                if (add) {
                    directTuningFreqStr += num_value;
                    state = "STATE_DIRECT_TUNING_2";
                }
                break;
            case "STATE_DIRECT_TUNING_2":
                if (add) {
                    directTuningFreqStr += num_value;
                    state = "STATE_DIRECT_TUNING_3";
                } else {
                    directTuningFreqStr =
                        directTuningFreqStr.substring(0, strLength-1);
                    state = "STATE_DIRECT_TUNING_1";
                }
                break;
            case "STATE_DIRECT_TUNING_3":
                if (add) {
                    directTuningFreqStr += num_value;
                    if (directTuningFreqStr.charAt(0) == "1")
                        state = "STATE_DIRECT_TUNING_4";
                    else {
                        stopFlash();
                        state = "STATE_DIRECT_TUNING_FULL";
                    }
                } else {
                    directTuningFreqStr =
                        directTuningFreqStr.substring(0, strLength-1);
                    state = "STATE_DIRECT_TUNING_2";
                }
                break;
            case "STATE_DIRECT_TUNING_4":
                if (add) {
                    directTuningFreqStr += num_value;
                    stopFlash();
                    state = "STATE_DIRECT_TUNING_FULL";
                } else {
                    directTuningFreqStr =
                        directTuningFreqStr.substring(0, strLength-1);
                    state = "STATE_DIRECT_TUNING_3";
                }
                break;
            case "STATE_DIRECT_TUNING_FULL":
                // We can't enter any more digits at this point.
                if (!add) {
                    startFlash("dash");
                    directTuningFreqStr =
                        directTuningFreqStr.substring(0, strLength-1);
                    if (directTuningFreqStr.charAt(0) == "1")
                        state = "STATE_DIRECT_TUNING_4";
                    else
                        state = "STATE_DIRECT_TUNING_3";
                }
                break;
            case "STATE_ERROR":
                // It's a noop
                break;
            default:
                console.error("Invalid STATE in keypad-box.click !");
        }
        curDashOpacity = 1;
        setStationIdFrequency(directTuningFreqStr, 1, true, curDashOpacity);
    } else {
        console.error("updateStationIdDigit should be called only when in" +
                      "one of the STATE_DIRECT_TUNING_XX modes!");
    }
}

/**
 * Start "flashing dash" interval timer animation
 *
 * @method startFlash
 * @static
 */
function startFlash(component) {

    console.error("DEBUG : startFlash component = " + component);
    // Flashing should NEVER happen at the same time for
    // Scanning_wait and Direct_tuning modes... so we can safely
    // reuse flashInterval interval variable.

    if(typeof(component) === 'undefined')
        console.error("Call to startFlash must have an argument !");
    if (component == "dash") {
        flashInterval = setInterval(flashStationIdDashCB,
                                constants.FLASH_TIME);
    } else if (component == "digits") {
        curDigitsOpacity = 0;
        flashInterval = setInterval(flashStationIdDigitsCB,
                                constants.FLASH_TIME);
    } else {
        console.error("Wrong startFlash parameter");
    }
}

/**
 * Stop "flashing dash" interval timer animation
 *
 * @method stopFlash
 * @static
 */
function stopFlash() {
    clearInterval(flashInterval);
    flashInterval = null;
}

/**
 * Put state back to Normal state.
 *
 * @method goBackToNormal
 * @param  num_value {Number} Numerical value of the single digit to set
 * @static
 */
function goBackToNormal() {
    console.error("DEBUG: entered goBackToNormal");

    var keypad = document.getElementById("keypad-container");
    var preset = document.getElementById("presets-container");
    var okBtn = document.getElementById("numOK");
    var stationId = document.getElementById("station-id");

    // Show/Hide/Stop back
    keypad.classList.add("hidden");
    preset.classList.remove("hidden");
    stopFlash();

    // Put state back to normal
    state = "STATE_NORMAL";

    // Put colors back
    okBtn.classList.remove("dna-green");
    okBtn.classList.add("dna-orange");
    stationId.classList.remove("dna-green");
    stationId.classList.add("dna-orange");
}

/* faked audio visualizer */
function fluctuate(bar) {
    var hgt = Math.random() * 10;
    hgt += 1;
    var t = hgt * 30;

    bar.animate({
        height: hgt
    }, t, function() {
        fluctuate($(this));
    });
}

function addSignalListeners() {
    console.error("DEBUG: entered addSignalListeners");

    try {
        fmradio.addOnFrequencyChangedListener(function(signal_value){
            console.log("DEBUG : frequencychanged SIGNAL received : " + signal_value);
            setStationIdFrequency(signal_value);
        });
    } catch(e) {
        console.error("addFrequencyChangedListener failed with error : " + e);
    }

    try {
        fmradio.addOnStationFoundListener(function(signal_value){
            console.log("DEBUG : StationFound SIGNAL received : " + signal_value);

            setStationIdFrequency(signal_value);

            // update the state with regard to current seek/scan state
            if (state == "STATE_SEEKING") {
                console.log("DEBUG : back to STATE_NORMAL");
                state = "STATE_NORMAL";
                buttonUserFeedback("smartCancelBtn", "", "hidden");
            } else if (state.indexOf("STATE_SCANNING_SEEK") > -1){
                console.log("DEBUG : back to STATE_SCANNING_WAIT");
                startFlash("digits");

                // Launch scan_wait pause timer
                if (scanWaitTimeout != null) {
                    clearTimeout(scanWaitTimeout);
                    scanWaitTimeout = null;
                }

                scanWaitTimeout = setTimeout(scanWaitCB,
                                  constants.SCAN_WAIT_TIMEOUT_TIME,
                                  state.substr(state.length - 2));

                state = "STATE_SCANNING_WAIT";
            }
        });
    } catch(e) {
        console.error("addStationFoundListener failed with error : " + e);
    }
}

/**
 * Initialize application components and register button events.
 *
 * @method init
 * @static
 */
var init = function () {
    console.error("DEBUG: entered init");

    $(".bar").each(function(i) {
        fluctuate($(this));
    });

    // Keypad-container is dynamically positionned over preset-container
    var preset = document.getElementById("presets-container");
    var keypad = document.getElementById("keypad-container");
    if (preset.getBoundingClientRect) {
        var r = preset.getBoundingClientRect();
        keypad.style.top = (r.top - 100) + "px";
        keypad.style.left = (((r.left + r.width)/2) -
                              (keypad.clientWidth/2)) + "px";
    } else {
        console.error("Browser does not support getBoundingClientRect !");
    }

    var bootstrap = new Bootstrap(function (status) {
        $("#topBarIcons").topBarIconsPlugin('init', 'news');
        $("#clockElement").ClockPlugin('init', 5);
        $("#clockElement").ClockPlugin('startTimer');
        $('#bottomPanel').bottomPanel('init');

        if (tizen.speech) {
            setupSpeechRecognition();
        } else {
            console.log("Store: Speech Recognition not running, " +
                        "voice control will be unavailable");
        }
    });

    if (fmradio) {
        // We start by registering our various signal listeners
        addSignalListeners();

        // We are initializing (enabling) the FMRadioService at boot-up time.
        if (!callEnable()) {
            state = "STATE_ERROR";
            return;
        }

        // Load presets
        // TODO: load the presets from persistent memory
        loadPresetsList();

        // Set station memory slots presets frequencies
        for (i = 0; i < presets.length; i++) {
            var element = document.getElementById("preset_" + i);
            if (presets[i] != -1) {
                var freqMHz = parseFloat(presets[i] / 1000000);
                element.innerHTML = freqMHz;
            } else {
                element.innerHTML = "empty";
            }
        }

    } else {
        // If underlying FMRadioService/Extension is not present, trouble!
        console.error("Could not find underlying FMRadioExtension !");

        /* To prevent user from accessing radio features when there's no
         * underlying FMRadioExtension/Service, we set the state to 'error' */
        state = "STATE_ERROR";
    }
};


/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init);

function setupSpeechRecognition() {
    console.log("Store setupSpeechRecognition");
    Speech.addVoiceRecognitionListener({
        onapplicationinstall : function() {
            console.log("Speech application install invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.installApp(_applicationDetail.id);
            }
        },
        onapplicationuninstall : function() {
            console.log("Speech application uninstall invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.uninstallApp(_applicationDetail.id);
            }
        }

    });
}

function savePresetsList() {
    console.error("DEBUG: entered savePresetsList");

    // frequencies in 'presets' should all valid Numbers (-1 when unset)
    for (i = 0; i < presets.length; i++) {
        localStorage.setItem(constants.PRESET_PREFIX + "preset" + i, presets[i]);
    }
    // TODO: use JSON instead !
    // localStorage.setItem("locations", JSON.stringify(locations));
}

function loadPresetsList() {
    console.error("DEBUG: entered loadPresetsList");

    for (i = 0; i < presets.length; i++) {
        var val = localStorage.getItem(constants.PRESET_PREFIX + "preset" + i);
        if ((val != null) && (!isNaN(val)))
            presets[i] = val;
    }
    // TODO: use JSON instead !
    /*var locations_preParse = localStorage.getItem("locations");
    var locations = JSON.parse();
    if (locations == null)
        locations = [];
    return presets;*/
}

/**
 * Method that adjust class on a passed-in element to show user that
 * he is interacting with this element.
 * @method buttonUserFeedback
 * @param objectOrId {Object,String} The Object or Id (string)
 * @param beforeClass {String} The CSS class to remove
 * @param afterClass {String} The CSS class to add
 * @static
 **/
function buttonUserFeedback(objectOrId, beforeClass, afterClass) {
    console.error("DEBUG: entered buttonUserFeedback");

    var element;
    if (typeof objectOrId == "string" ) {
        element = document.getElementById(objectOrId);
    } else {
        element = document.getElementById(objectOrId.attr("id"));
    }
    if (beforeClass != "")
        element.classList.remove(beforeClass);
    if (afterClass != "")
        element.classList.add(afterClass);
}

/****************************************************************************
 * CALLS TO FMRadioExtension methods ****************************************
 ****************************************************************************/

/**
 * Call FMRadioService enablement
 *
 * @method callEnable
 * @static
 */
function callEnable() {
    try {
        fmradio.enable(function(error) {
            console.error("FMRadio.enable internal error : " + error.message);
            return false;
        });
    } catch(e) {
        console.error("FMRadio.enable Exception caught : " + e);
        return false;
    }
    return true;
}

/**
 * Set the actual FMRadio frequency (tune-in)
 *
 * @method callSetFrequency
 * @param  freqHz {Number}
 * @static
 */
function callSetFrequency(freqHz) {
    console.error("DEBUG: entered callSetFrequency");

    try {
        fmradio.setFrequency(freqHz, function(error) {
            console.error("fmradio.setFrequency error : " + error.message);
        });
    } catch(e) {
        console.error("callSetFrequency error catch : " + e);
        return false;
    }
    return true;
}

/**
 * Seek down or seek up
 *
 * @method callSeek
 * @param  direction {Boolean}
 * @static
 */
function callSeek(direction) {
    console.error("DEBUG: entered callSeek");

    try {
        if (direction) {
            console.log("DEBUG2");
            fmradio.seekup(function(error) {
                console.log("DEBUG3");
                console.error("fmradio.seekup error : " + error.message);
            });
        } else {
            console.log("DEBUG4");
            fmradio.seekdown(function(error) {
                console.log("DEBUG5");
                console.error("fmradio.seekdown error : " + error.message);
            });
        }
    } catch(e) {
        console.log("DEBUG6");
        console.error("callSeek error catch : " + e);
        return false;
    }
    console.log("DEBUG7");
    return true;
}

/**
 * Call Seek cancellation in the service
 *
 * @method callCancelSeek
 * @static
 */
function callCancelSeek() {
    try {
        fmradio.cancelSeek(function(error) {
            console.error("FMRadio.cancelSeek internal error : " +
                          error.message);
            return false;
        });
    } catch(e) {
        console.error("FMRadio.cancelSeek Exception caught : " + e);
        return false;
    }
    return true;
}

/****************************************************************************
 * TIMER CALLBACKS    *******************************************************
 ****************************************************************************/

function flashStationIdDigitsCB() {
    console.error("DEBUG: entered flashStationIdDigitsCB, curOpacity = " + curDigitsOpacity);

    // We just toggle digits opacity
    if (curDigitsOpacity == 0)
        curDigitsOpacity = 1;
    else
        curDigitsOpacity = 0;

    setStationIdFrequency(fmradio.frequency(), curDigitsOpacity);
}

function flashStationIdDashCB() {
    console.error("DEBUG: entered flashStationIdDashCB");

    // We just toggle dash opacity
    if (curDashOpacity == 0)
        curDashOpacity = 1;
    else
        curDashOpacity = 0;

    setStationIdFrequency(directTuningFreqStr, 1, true, curDashOpacity);
}

function mouseHoldCB(presetNumStr) {
    console.error("DEBUG: entered mouseHoldCB");

    // We have a mousehold on 'preset_num' button!
    var presetNum = parseInt(presetNumStr);
    presets[presetNum] = parseInt(fmradio.frequency());

    // Make the change appear on the fm-radio-box
    var element = document.getElementById("preset_" + presetNumStr);
    var freqMHz = parseFloat(presets[presetNum] / 1000000);
    element.innerHTML = freqMHz;

    // we save the preset in localStore as soon as it's updated
    savePresetsList();

    // we kill the timer just to make sure
    clearTimeout(mouseHoldTimeout);
    mouseDownTimeout = null;
}

function scanWaitCB(direction) {
    console.error("DEBUG: entered scanWaitCB, direction = " + direction);

    stopFlash();

    var dir;
    if (direction == "DW")
        dir = false;
    else
        dir = true;

    // We launch another seek operation in the same direction
    if (callSeek(dir)) {
        state = "STATE_SCANNING_SEEK_" + direction;
        buttonUserFeedback("smartCancelBtn", "hidden", "");
    }
}


/****************************************************************************
 * JQUERY EVENT HANDLERS    *************************************************
 ****************************************************************************/

/**
 * Catch key up events (keyboard keys)
 *
 * @method keyup
 * @param  handler {function} Callback called when element is clicked
 * @istatic
 */
$(document).keydown(function(e) {
    console.error("DEBUG: entered $(document).keydown");

    if (e.keyCode == constants.KEYCODE_ESC) {
        if (state.indexOf("STATE_DIRECT_TUNING") >= 0) {
            goBackToNormal();
            setStationIdFrequency(fmradio.frequency());
        }
    }
});

/**
 * Decreases FMRadioService frequency by 0.1 MHz
 *
 * @method TuneDownBtn.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#TuneDownBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#TuneDownBtn\" ).click");

    // Interaction with 'manual tuning' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        // TODO:
        // fetch interval from WebAPI interval
        var frequency = fmradio.frequency() - 100000;

        if (frequency < constants.FREQ_MIN_LIMIT)
            frequency = constants.FREQ_MAX_LIMIT;

        callSetFrequency(frequency);
    }
});


/**
 * Increases FMRadioService frequency by 0.1 MHz
 *
 * @method TuneUpBtn.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#TuneUpBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#TuneUpBtn\" ).click");

    // Interaction with 'manual tuning' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        var frequency = fmradio.frequency() + 100000;

        if (frequency > constants.FREQ_MAX_LIMIT)
            frequency = constants.FREQ_MIN_LIMIT;

        callSetFrequency(frequency);
    }
});

/**
 * Seek down
 *
 * @method SeekDownBth.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#SeekDownBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#SeekDownBtn\" ).click");

    // Interaction with 'seek' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {

        if (callSeek(false)) {
            state = "STATE_SEEKING";
            buttonUserFeedback("smartCancelBtn", "hidden", "");
        }
    }
});

/**
 * Seek up
 *
 * @method SeekUpBth.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#SeekUpBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#SeekUpBtn\" ).click");

    // Interaction with 'seek' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        if (callSeek(true)) {
            state = "STATE_SEEKING";
            buttonUserFeedback("smartCancelBtn", "hidden", "");
        }
    }
});

/**
 * Scan down
 *
 * @method ScanDownBth.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#ScanDownBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#ScanDownBtn\" ).click");

    // Interaction with 'scan' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        preScanFrequency = fmradio.frequency();
        if (callSeek(false)) {
            state = "STATE_SCANNING_SEEK_DW";
            buttonUserFeedback("smartCancelBtn", "hidden", "");
        }
    }
});

/**
 * Scan up
 *
 * @method ScanUpBth.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#ScanUpBtn" ).click(function() {
    console.error("DEBUG: entered $( \"#ScanUpBtn\" ).click");

    // Interaction with 'scan' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        preScanFrequency = fmradio.frequency();
        if (callSeek(true)) {
            state = "STATE_SCANNING_SEEK_UP";
            buttonUserFeedback("smartCancelBtn", "hidden", "");
        }
    }
});

/**
 * React to user clicking on big numbers station frequency
 * When station-id is clicked, a state machine starts to track
 * user entering big numbers station frequency number by number
 *
 * @method station-id.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#station-id" ).click(function() {
    console.error("DEBUG: entered $( \"#station-id\" ).click");

    var keypad = document.getElementById("keypad-container");
    var preset = document.getElementById("presets-container");

    /* state machine states to validate in this element click
     * For clarity of all the states, we use a switch-case here
     * even if many branches do the exact same thing */
    switch(state) {
        case "STATE_NORMAL":
            state = "STATE_DIRECT_TUNING_1";
            preset.classList.add("hidden");
            keypad.classList.remove("hidden");
            directTuningFreqStr = "";
            startFlash("dash");
            curDashOpacity = 1;
            setStationIdFrequency(directTuningFreqStr,
                                  1, true, curDashOpacity);
            break;

        case "STATE_SCANNING_WAIT":
            // means we tune in this scanned station. User likes it !
            state = "STATE_NORMAL";
            buttonUserFeedback("smartCancelBtn", "", "hidden");
            stopFlash();
            if (scanWaitTimeout != null) {
                    clearTimeout(scanWaitTimeout);
                    scanWaitTimeout = null;
            }
            setStationIdFrequency(fmradio.frequency(), 1);
            break;

        default:
            console.log("MODAL keypad is currently shown. Can't click here")
    }
});

/**
 * React to user clicking on keypad num buttons
 *
 * @method keypad-box.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( ".clickable-key" ).click(function() {
    console.error("DEBUG: entered $( \".clickable-key\" ).click");

    // the clicked element's index
    var num = $(this).attr('index');
    updateStationIdDigit(true, num);
});

/**
 * React to user clicking on the DEL keypad button
 *
 * @method key_DEL.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#key_DEL" ).click(function() {
    console.error("DEBUG: entered $( \"#key_DEL\" ).click");

    updateStationIdDigit(false);
});

/**
 * React to user clicking on the OK keypad button
 *
 * @method key_OK.click
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( "#key_OK" ).click(function() {
    console.error("DEBUG: entered $( \"#key_OK\" ).click");

    if (state == "STATE_DIRECT_TUNING_FULL") {
        // Changing the actual tuned frequency is only done
        // through setStationIdFrequency with Number parameter
        var freqHz = (parseFloat(directTuningFreqStr)) * 100000;
        if (freqIsValid(freqHz)) {
            callSetFrequency(freqHz);
            goBackToNormal();
        }
    }
});

/**
 * React to user *clicking* on the presets box CLASS
 * When user "clicks" on a memory slots, means he wants to load
 * the station as current.
 *
 * @method  fm-radio-box.click()
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$( ".fm-radio-box" ).click(function() {
    console.error("DEBUG: entered $( \".fm-radio-box\" ).click");

    // Extract pressed preset # from the element's id
    // freqHz *must* be a number to feed freqIsValid()
    var index = $(this).attr('preset');
    var freqHz = parseInt(presets[index]);

    // Tune-in the preset frequency
    if (freqIsValid(freqHz)) {
        callSetFrequency(freqHz);
    }
});

/**
 * React to user *mousedown* on the presets box CLASS
 * We are using mousedown and mouseup events here to implement the
 * 2-second mousehold when user wants to save stations as presets
 *
 * @method  fm-radio-box.mousedown()
 * @param  handler {function} Callback called when element is pressed-down
 * @static
 */
$( ".fm-radio-box" ).mousedown(function() {
    console.error("DEBUG: entered $( \".fm-radio-box\" ).mousedown");

    mouseState = "STATE_MOUSE_DOWN";
    buttonUserFeedback($(this), "fm-gray", "dna-orange");

    // sanity check. mouseDownTimeout should not be already set on mousedown
    if (mouseHoldTimeout != null)
        clearTimeout(mouseHoldTimeout);

    mouseHoldTimeout = setTimeout(mouseHoldCB,
                                  constants.MOUSE_HOLD_TIMEOUT_TIME,
                                  $(this).attr('preset'));
});

/**
 * React to user *mouseup* on the presets box CLASS
 * We are using mousedown and mouseup events here to implement the
 * 2-second mousehold when user wants to save stations as presets
 *
 * @method  fm-radio-box.mouseup()
 * @param  handler {function} Callback called when element mouse is released
 * @static
 */
$( ".fm-radio-box" ).mouseup(function() {
    console.error("DEBUG: entered $(\".fm-radio-box\" ).mouseup");

    mouseState = "STATE_MOUSE_UP";
    buttonUserFeedback($(this), "dna-orange", "fm-gray");

    if (mouseHoldTimeout != null) {
        clearTimeout(mouseHoldTimeout);
        mouseHoldTimeout = null;
    }
});

/**
 * React to keypadbox mousedown
 *
 * @method  keypad-box.mousedown()
 * @param  handler {function} Callback called when element is mousedowned
 * @static
 */
$( ".keypad-box" ).mousedown(function() {
    console.error("DEBUG: entered $( \".keypad-box\" ).mousedown");

    buttonUserFeedback($(this), "fm-gray", "dna-orange");
});

/**
 * React to keypadbox mouseup
 *
 * @method  keypad-box.mouseup()
 * @param  handler {function} Callback called when element is mouseuped
 * @static
 */
$( ".keypad-box" ).mouseup(function() {
    console.error("DEBUG: entered $( \".keypad-box\" ).mouseup");

    buttonUserFeedback($(this), "dna-orange", "fm-gray");
});

/**
 * React to smartCancelButton (cancel seek/scan)
 *
 * @method smartCancelBtn.click
 * @param  handler {function} Callback called when element is mouseuped
 * @static
 */
$( "#smartCancelBtn" ).click(function() {
    console.error("DEBUG: entered $( \"smartCancelBtn\" ).click");

    // We can only cancel an ongoing "seek"
    if (state == "STATE_SEEKING") {
        if (callCancelSeek()) {
            state = "STATE_NORMAL";
            buttonUserFeedback($(this), "", "hidden");
        }
    } else if (state.indexOf("STATE_SCANNING_SEEK") > -1) {
        if (callCancelSeek()) {
            state = "STATE_NORMAL";
            buttonUserFeedback($(this), "", "hidden");
        }
        callSetFrequency(preScanFrequency);
    } else if (state == "STATE_SCANNING_WAIT") {
        // scanwaitTimeout is currently ticking...so to stop it from firing.
        clearTimeout(scanWaitTimeout);
        scanWaitTimeout = null;

        stopFlash();

        // we hide the smartCancelbutton and put everything back to normal
        buttonUserFeedback($(this), "", "hidden");
        state = "STATE_NORMAL"
        callSetFrequency(preScanFrequency);
    } else {
        console.error("smartCancelBtn.click() state error !");
    }
});
