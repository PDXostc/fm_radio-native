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
 * Temporary 'string' frequency when in DIRECT_TUNING state
@property directTuningFreqStr {String}
 */
var directTuningFreqStr;

/**
 * Useful constants
@property constants {Object}
 */
var constants = {
    'FREQ_MAX_LIMIT': 108000000,
    'FREQ_MIN_LIMIT': 88000000
};

/**
 * Station presets channel/frequency values
 * We use the actual {int} here for values, as we have to feed FMRadioService
 * with {int} frequencies
@property presets {Object}
 */
var presets = {
    'num_1': 100.7,
    'num_2': 98.5,
    'num_3': 94.3,
    'num_4': 105.7,
    'num_5': 89.3,
    'num_6': 88.5
};

/**
 * Keycode Constant
 *
@property KEYCODE_ESC {Number}
 */
var KEYCODE_ESC = 27;

/**
 * Time to wait for direct tuning flashing timer
 *
@property DIRECT_TUNING_TIMER {Number} (in ms)
 */
var DIRECT_TUNING_FLASH_TIME = 1000;

/**
 * Interval variable used to make Digits flash
 * It is important to set the flashInterval to 'null' when
 * not in use to indicate that there's no animation going on
 *
@property flashInterval {Object}
 */
var flashInterval = null;

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
    console.error("DEBUG: freqIsValid(" + freq + ") called");
    var freqHz;
    if (typeof freq == "number" ) {
        // the 'Number' version assume freq. already in Hz
        freqHz = freq;
    } else if (typeof freq == "string" ) {
        // basic initial checks
        if (freq.charAt(freq.length-1) == ".") {
            console.error("DEBUG: freqIsValid : FALSE");
            return false;
        }
        freqHz = (parseFloat(freq)) * 1000000;
    }

    // then check against the freq range.
    if ((freqHz >= constants.FREQ_MIN_LIMIT) &&
        (freqHz <= constants.FREQ_MAX_LIMIT)) {
        console.error("DEBUG: freqIsValid : TRUE");
        return true;
    } else {
        console.error("DEBUG: freqIsValid : FALSE");
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
                element.classList.remove("dna-green");
                element.classList.add("dna-orange");

                okBtn.classList.remove("dna-green");
                okBtn.classList.add("dna-orange");
            } else {
                element.classList.add("dna-green");
                element.classList.remove("dna-orange");

                okBtn.classList.add("dna-green");
                okBtn.classList.remove("dna-orange");
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
    flashInterval = setInterval(flashStationIdDigits, DIRECT_TUNING_FLASH_TIME);
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
        var frequency = fmradio.frequency();
        setStationIdFrequency(frequency);
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

/****************************************************************************
 * TIMER CALLBACKS    *******************************************************
 ****************************************************************************/

function flashStationIdDigits() {

    // we just toggle dash opacity while animating direct tuning
    if (curDashOpacity == 0)
        curDashOpacity = 1;
    else
        curDashOpacity = 0;

    setStationIdFrequency(directTuningFreqStr, true, curDashOpacity);
}

/****************************************************************************
 * JQUERY EVENT HANDLERS    *************************************************
 ****************************************************************************/

/**
 * Catch key up events (keyboard keys)
 *
 * @method keyup
 * @param  handler {function} Callback called when element is clicked
 * @static
 */
$(document).keydown(function(e) {
    if (e.keyCode == KEYCODE_ESC) {
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
        var frequency = fmradio.frequency() - 100000;

        if (frequency < constants.FREQ_MIN_LIMIT)
            frequency = constants.FREQ_MAX_LIMIT;

        setFMRadioFrequency(frequency);
        console.log("main.js : setting frequency to " + frequency);

        // Change the Station ID from the JS layer for now
        // TODO: check if better to update from a onFrequenyChanged handler
        setStationIdFrequency(frequency);
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
        setStationIdFrequency(frequency);
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
    console.error("DEBUG: key_OK.click called..." + directTuningFreqStr);
    if (state == "STATE_DIRECT_TUNING_FULL") {
        // Changing the actual tuned frequency is only done
        // through setStationIdFrequency with Number parameter
        var freqHz = (parseFloat(directTuningFreqStr)) * 100000;
        console.error("DEBUG: freqHz..." + freqHz);
        if (freqIsValid(freqHz)) {
            setFMRadioFrequency(freqHz);
            setStationIdFrequency(freqHz);
            goBackToNormal();
        }
    }
});
