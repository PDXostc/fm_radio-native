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
 * STATE_SCANNING_SCAN      : User has entered scanning mode. waiting for a channel
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
 * Useful constants
@property constants {Object}
 */
var constants = {
    'NUM_OF_PRESETS'           : 6,                     // Number of presets to load
    'FREQ_MAX_LIMIT'           : 108000000,             // Higher end of valid freq.
    'FREQ_MIN_LIMIT'           : 88000000,              // Lower end of valid freq.
    'KEYCODE_ESC'              : 27,                    // Keycode for "ESCAPE" char
    'DIRECT_TUNING_FLASH_TIME' : 1000,                  // flashing timer timeout
    'MOUSE_HOLD_TIMEOUT_TIME'  : 2000,                  // Time to wait for mousehold
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
@property flashInterval {Object}
 */
var mouseHoldTimeout = null;

/**
 * Currently shown dash opacity in direct tuning animation
 *
@property curDashOpacity {Number}
 */
var curDashOpacity = 1.0;

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
 * If freq. is a number : it is assumed in Hz and validation is against range only
 * If freq. is a string : it is assumed string representation of a float (with .)
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
 * Set the actual FMRadio frequency (tune-in)
 *
 * @method setFMRadioFrequency
 * @param  freqHz {Number}
 * @static
 */
function setFMRadioFrequency(freqHz) {
    if (fmradio) {
        try {
            fmradio.setFrequency(freqHz, function(error) {
                console.error("fmradio.setFrequency error : " + error.message);
            });
        } catch(e) {
            console.error("setFMRadioFrequency error catch : " + e);
        }
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
function setStationIdFrequency(freq, dash, opacity) {
    if(typeof(dash)==='undefined') dash = false;

    var element = document.getElementById("station-id");
    if (typeof freq == "number" ) {
        var freqMHz = freq / 1000000;
        element.innerHTML = freqMHz.toFixed(1);
    } else if (typeof freq == "string" ) {
        var strLength = freq.length;
        if (strLength > 0) {
            var index;
            if (freq.charAt(0) == "1") index = 2; else index = 1;
            var subStr = freq.substr(0, Math.min(strLength-1, index) + 1);

            // subStr length can never be > than index + 1;
            if (subStr.length < (index + 1)) {
                element.innerHTML = freq;
            } else {
                element.innerHTML = subStr + ".";
            }

            // Now, show the remaining digit from freq is any
            if (freq.length > subStr.length) {
                element.innerHTML += freq.charAt(freq.length-1);
            }

            // Lastly, check for validity and set color and OK button accordingly.
            var okBtn = document.getElementById("numOK");
            if (!freqIsValid(element.innerHTML)) {
                okBtn.classList.remove("dna-orange");
                okBtn.classList.add("fm-gray");
            } else {
                okBtn.classList.add("dna-orange");
                okBtn.classList.remove("fm-gray");
            }
        } else {
            element.innerHTML = freq;
        }

        // Add the "flashing dash" at the end if in direct tuning mode
        // 'dash' should only be used with 'String' mode. Note that the
        // is not showned on STATE_DIRECT_TUNING_FULL
        if (dash && (state != "STATE_DIRECT_TUNING_FULL")) {
            element.innerHTML += "<span style=\"opacity: " + opacity + ";\">_</span>";
        }
    } else {
        console.error("Bad Station frequency type !");
        return;
    }
    // Add the "fm" at the very end
    element.innerHTML += '<span class="fm-designation">FM</span>';
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
                    directTuningFreqStr = directTuningFreqStr.substring(0, strLength-1);
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
                    directTuningFreqStr = directTuningFreqStr.substring(0, strLength-1);
                    state = "STATE_DIRECT_TUNING_2";
                }
                break;
            case "STATE_DIRECT_TUNING_4":
                if (add) {
                    directTuningFreqStr += num_value;
                    stopFlash();
                    state = "STATE_DIRECT_TUNING_FULL";
                } else {
                    directTuningFreqStr = directTuningFreqStr.substring(0, strLength-1);
                    state = "STATE_DIRECT_TUNING_3";
                }
                break;
            case "STATE_DIRECT_TUNING_FULL":
                // We can't enter any more digits at this point.
                if (!add) {
                    startFlash();
                    directTuningFreqStr = directTuningFreqStr.substring(0, strLength-1);
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
        setStationIdFrequency(directTuningFreqStr, true, curDashOpacity);
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
function startFlash() {
    flashInterval = setInterval(flashStationIdDigitsCB, constants.DIRECT_TUNING_FLASH_TIME);
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
    try {
        fmradio.addOnFrequencyChangedListener(function(signal_value){
            console.log("DEBUG : frequencychanged SIGNAL received : " + signal_value);
            setStationIdFrequency(signal_value);
        });
    } catch(e) {
        console.error("addFrequencyChangedListener failed with error : " + e);
    }
}

/**
 * Initialize application components and register button events.
 *
 * @method init
 * @static
 */
var init = function () {

    $(".bar").each(function(i) {
        fluctuate($(this));
    });

    // Keypad-container is dynamically positionned over preset-container
    var preset = document.getElementById("presets-container");
    var keypad = document.getElementById("keypad-container");
    if (preset.getBoundingClientRect) {
        var r = preset.getBoundingClientRect();
        keypad.style.top = (r.top - 100) + "px";
        keypad.style.left = (((r.left + r.width)/2) - (keypad.clientWidth/2)) + "px";
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
        try {
            fmradio.enable(function(error) {
                console.error("FMRadio.enable internal error : " + error.message);
                state = "STATE_ERROR";
                return;
            });
        } catch(e) {
            console.error("FMRadio.enable Exception caught : " + e);
            state = "STATE_ERROR";
            return;
        }

        // Set initial statio-id frequency
        // Since FMRadioService should never stop, the "last" station
        // frequency is still rendering inside fmradio daemon, so we're
        // just fetching that frequency and tune it in.
        /*try {
            var frequency = fmradio.frequency();
        } catch(e) {
            console.error("FMRadio.frequency Exception caught : " + e);
            state = "STATE_ERROR";
            return;
        }*/
        //setStationIdFrequency(frequency);

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
    // frequencies in 'presets' should all valid Numbers (-1 when unset)
    for (i = 0; i < presets.length; i++) {
        localStorage.setItem(constants.PRESET_PREFIX + "preset" + i, presets[i]);
    }
    // TODO: use JSON instead !
    // localStorage.setItem("locations", JSON.stringify(locations));
}

function loadPresetsList() {
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
 * @param object {Object} The Object on which to adjust classes
 * @param beforeClass {String} The CSS class to remove
 * @param afterClass {String} The CSS class to add
 * @static
 **/
function buttonUserFeedback(object, beforeClass, afterClass) {
    var element = document.getElementById(object.attr("id"));
    element.classList.add(afterClass);
    element.classList.remove(beforeClass);
}


/****************************************************************************
 * TIMER CALLBACKS    *******************************************************
 ****************************************************************************/

function flashStationIdDigitsCB() {

    // we just toggle dash opacity while animating direct tuning
    if (curDashOpacity == 0)
        curDashOpacity = 1;
    else
        curDashOpacity = 0;

    setStationIdFrequency(directTuningFreqStr, true, curDashOpacity);
}

function mouseHoldCB(presetNumStr) {
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
    // Interaction with 'manual tuning' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        // TODO:
        // fetch interval from WebAPI interval
        var frequency = fmradio.frequency() - 100000;

        if (frequency < constants.FREQ_MIN_LIMIT)
            frequency = constants.FREQ_MAX_LIMIT;

        setFMRadioFrequency(frequency);
        console.log("main.js : setting frequency to " + frequency);

        // Change the Station ID from the JS layer for now
        // TODO: check if better to update from a onFrequenyChanged handler
        //setStationIdFrequency(frequency);
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
    // Interaction with 'manual tuning' is only possible on STATE_NORMAL
    if (state == "STATE_NORMAL") {
        var frequency = fmradio.frequency() + 100000;

        if (frequency > constants.FREQ_MAX_LIMIT)
            frequency = constants.FREQ_MIN_LIMIT;

        frequency = clip (frequency, constants.FREQ_MIN_LIMIT,
                                     constants.FREQ_MAX_LIMIT);
        setFMRadioFrequency(frequency);
        console.log("main.js : setting frequency to " + frequency);

        // Change the Station ID from the JS layer for now
        // TODO: check if better to update from a onFrequenyChanged handler
        //setStationIdFrequency(frequency);
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
            startFlash();
            curDashOpacity = 1;
            setStationIdFrequency(directTuningFreqStr, true, curDashOpacity);
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
    if (state == "STATE_DIRECT_TUNING_FULL") {
        // Changing the actual tuned frequency is only done
        // through setStationIdFrequency with Number parameter
        var freqHz = (parseFloat(directTuningFreqStr)) * 100000;
        if (freqIsValid(freqHz)) {
            setFMRadioFrequency(freqHz);
            //setStationIdFrequency(freqHz);
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

    // Extract pressed preset # from the element's id
    // freqHz *must* be a number to feed freqIsValid()
    var index = $(this).attr('preset');
    var freqHz = parseInt(presets[index]);

    // Tune-in the preset frequency
    if (freqIsValid(freqHz)) {
        setFMRadioFrequency(freqHz);
        //setStationIdFrequency(freqHz);
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
    buttonUserFeedback($(this), "dna-orange", "fm-gray");
});

// TODO: REMOVE THIS !
$( ".small-title" ).click(function() {
    localStorage.removeItem(constants.PRESET_PREFIX + "preset0");
    localStorage.removeItem(constants.PRESET_PREFIX + "preset1");
    localStorage.removeItem(constants.PRESET_PREFIX + "preset2");
    localStorage.removeItem(constants.PRESET_PREFIX + "preset3");
    localStorage.removeItem(constants.PRESET_PREFIX + "preset4");
    localStorage.removeItem(constants.PRESET_PREFIX + "preset5");
});

