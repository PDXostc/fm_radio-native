var _callbacks = {};
var _nextReplyId = 0;

var _on_enabled_listeners = {};
var _on_enabled_listener_id = 0;
var _on_enabled_listeners_count = 0

var _on_disabled_listeners = {};
var _on_disabled_listener_id = 0;
var _on_disabled_listeners_count = 0

var _on_frequency_changed_listeners = {};
var _on_frequency_changed_listener_id = 0;
var _on_frequency_changed_listeners_count = 0

var webFMListener = null;

function getNextReplyId() {
    return _nextReplyId++;
}

// Every posted message down the C extension stack automatically
// Gets a unique callback (back to upper JS caller-defined foos) so we
// can have concurrent calls and asynchronosity at the JS API level.
function postMessage(msg, callback) {
    var replyId = getNextReplyId();
    _callbacks[replyId] = callback;
    msg.replyId = replyId;
    extension.postMessage(JSON.stringify(msg));
}

var sendSyncMessage = function(msg) {
    return JSON.parse(extension.internal.sendSyncMessage(JSON.stringify(msg)));
};

// Main message listener treating messages coming from lower C extension.
extension.setMessageListener(function(msg) {
    var m = JSON.parse(msg);
    var replyId = m.replyId;
    var callback = _callbacks[replyId];

    // Signals going up from C ext --> JS/HTML
    if (m.cmd === 'signal') {
        if (!m.signal_name) {
            console.log('fm_radio_api.js: Invalid signal from Radio api');
            return;
        }

        if (m.signal_name === 'onenabled') {
            console.log('fm_radio_api.js: messageListener Enabled');
            handleOnEnabledSignal(m);
        } else if (m.signal_name === 'ondisabled') {
            console.log('fm_radio_api.js: messageListener Disabled');
            handleOnDisabledSignal(m);
        } else if (m.signal_name === 'onfrequencychanged') {
            console.log('fm_radio_api.js: messageListener FrequencyChanged');
            handleOnFrequencyChangedSignal(m);
        }
    } else if (!isNaN(parseInt(replyId)) && (typeof(callback) === 'function')) {
        // Error callbacks when C ext message handling fails.
        // Callback functions are defined by radio.XXX "callers" from main.js
        callback(m);
        delete m.replyId;
        delete _callbacks[replyId];
    } else {
        console.error('fm_radio_api.js: Invalid replyId from Radio api: ' +
                      replyId);
    }
});

function handleOnEnabledSignal(msg) {
    for (var key in _on_enabled_listeners) {
        var cb = _on_enabled_listeners[key];
        if (!cb || typeof(cb) !== 'function') {
            console.error('No enabled listener object found for id ' + key);
        }
        cb(msg.signal_name);
    }
}

function handleOnDisabledSignal(msg) {
    for (var key in _on_disabled_listeners) {
        var cb = _on_disabled_listeners[key];
        if (!cb || typeof(cb) !== 'function') {
            console.error('No disabled listener object found for id ' + key);
        }
        cb(msg.signal_name);
    }
}

function handleOnFrequencyChangedSignal(msg) {
    for (var key in _on_frequency_changed_listeners) {
        var cb = _on_frequency_changed_listeners[key];
        if (!cb || typeof(cb) !== 'function') {
            console.error('No frequencychanged listener found for id ' + key);
        }
        console.log("fm_radio_api.js: handleOnFrequencyChange : " +
                    msg.signal_params);
        cb(msg.signal_params);
    }
}

// ***************************************************************************
// EXPORTED JS METHOD APIs ***************************************************
// Those are accessible from upper JS code (like main.js)
// Actual C implementations of those functions will be
// done in the C extension (radio-extension.c)'s handle_XXX
// functions.

exports.enable = function(errorCallback) {
    var msg = { cmd: 'Enable' };
    console.log("fm_radio_api.js: entered export.enable");
    postMessage(msg, function(result) {
    if (result.isError) {
        console.error('fm_radio_api.js: Enable failed');
        if (errorCallback) {
            var error = { message: 'Enable failed' };
            if (result.errorMessage)
                error.message += ', error: ' + result.errorMessage;
                errorCallback(error);
            }
        }
    });
};

exports.setFrequency = function(freqVal, errorCallback) {
    var msg = { cmd: 'SetFrequency', frequency: freqVal};
    console.log("fm_radio_api.js: entered export.setFrequency,freq=" + freqVal);
    postMessage(msg, function(result) {
    if (result.isError) {
        console.error('fm_radio_api.js: SetFrequency failed');
        if (errorCallback) {
            var error = { message: 'SetFrequency failed' };
            if (result.errorMessage)
                error.message += ', error: ' + result.errorMessage;
                errorCallback(error);
            }
        }
    });
};

// ***************************************************************************
// EXPORTED DBUS SIGNAL LISTENER ADDERS **************************************
// Those are accessible from upper JS code (like main.js)
// Actual implementation of dbus signal subscriptions is done
// in the C extension code.
//

exports.addOnEnabledListener = function(listener) {
    console.log("fm_radio_api.js: entered export.addEnabledListener");
    if (!(listener instanceof Function) && listener != undefined) {
        console.error('fm_radio_api.js: AddEnabledListener failed');
        return;
    }

    for (var key in _on_enabled_listeners) {
        if (_on_enabled_listeners[key] == listener) {
            console.log('fm_radio_api.js: same listener added');
            return key;
        }
    }

    _on_enabled_listeners[++_on_enabled_listener_id] = listener;
    _on_enabled_listeners_count++;
    if (_on_enabled_listeners_count == 1) {
        var msg = { cmd: 'AddOnEnabledListener' };
        postMessage(msg, function(result) {
            if (result.isError) {
                console.error('fm_radio_api.js: AddEnabledListener failed');
            }
        });
    }

    return _on_enabled_listener_id;
};

exports.addOnDisabledListener = function(listener) {
    if (!(listener instanceof Function) && listener != undefined) {
        console.error('fm_radio_api.js: AddDisabledListener failed');
        return;
    }

    for (var key in _on_disabled_listeners) {
        if (_on_disabled_listeners[key] == listener) {
            console.log('fm_radio_api.js: same listener added');
            return key;
        }
    }

    _on_disabled_listeners[++_on_disabled_listener_id] = listener;
    _on_disabled_listeners_count++;
    if (_on_disabled_listeners_count == 1) {
        var msg = { cmd: 'AddOnDisabledListener' };
        postMessage(msg, function(result) {
            if (result.isError) {
                console.error('fm_radio_api.js: AddDisabledListener failed');
            }
        });
    }

    return _on_disabled_listener_id;
};

exports.addOnFrequencyChangedListener = function(listener) {
    console.log("fm_radio_api.js: entered export.addFrequencyChangedListener");
    if (!(listener instanceof Function) && listener != undefined) {
        console.error('fm_radio_api.js: AddFrequencyChangedListener failed');
        return;
    }

    for (var key in _on_frequency_changed_listeners) {
        if (_on_frequency_changed_listeners[key] == listener) {
            console.log('fm_radio_api.js: same listener added');
            return key;
        }
    }

    _on_frequency_changed_listeners[++_on_frequency_changed_listener_id] =
        listener;
    _on_frequency_changed_listeners_count++;
    if (_on_frequency_changed_listeners_count == 1) {
        var msg = { cmd: 'AddOnFrequencyChangedListener' };
        postMessage(msg, function(result) {
            if (result.isError) {
                console.error('fm_radio_api.js: AddFrequencyChangedLis failed');
            }
        });
    }

    return _on_frequency_changed_listener_id;
};
// ***************************************************************************
// EXPORTED DBUS PROPERTIES  *************************************************
// Those are accessible from upper JS code (like main.js)
//

exports.enabled = function () {
    var result = sendSyncMessage({ cmd: 'GetEnabled' });
    if (result.isError) {
        // TODO: Get WebAPIException throw BACK !
        return null;
    }

    if (result.value != undefined) {
        return result.value["enabled"];
    }
    console.log("fm_radio_api.js: exports.enabled failed!");
    return null;
};

exports.frequency = function () {
    var result = sendSyncMessage({ cmd: 'GetFrequency' });
    if (result.isError) {
        // TODO: Get WebAPIException throw BACK !
        return null;
    }

    if (result.value != undefined) {
        return result.value["frequency"];
    }
    console.log("fm_radio_api.js: exports.frequency failed!");
    return null;
};
