/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*global Utils */

/**
 * @module CarTheme
 **/
(function ($) {
    "use strict";
     /**
     * Represents HTML5 audio element which is utilizing Audio Service API to get/set status of currently playing song (tested with wav audio files).
     * Audio resources are passed to the player as an array of songs and stored in {{#crossLink "AudioPlayer/model:property"}}{{/crossLink}} property.
     *
     * This class requires following components:
     *
     * * {{#crossLink "ButtonControlsObj"}}{{/crossLink}} component
     *
     * Audio player is extended by option to set buttons to control audio playback (play/pause, next, previous, shuffle, repeat), time progress bar, spectrum analyzer, info panel, volume control.
     *
     * Use following snippet to include component in your `index.html` file: 
     *
     *     <script type="text/javascript" src="./common/components/audioPlayer/audioPlayer.js"></script>
     *
     * and following code to initialize:
     * 
     *     $('#multimediaPlayer').audioAPI('init', [], "#audioPlayer", "#videoPlayer");
     *
     * @class AudioPlayer
     * @constructor
     */
    var AudioPlayer = {
            thisObj: null,
            /** 
             * Array of song objects. Every song object is expected to have album, artist, name, path and image properties.
             * @property model
             * @type {Array}
             * @default null
             */
            model: [],
            /** 
             * HTML audio or video DOM element.
             * @property player
             * @type {Any}
             * @default null
             */
            player: null,
            playerType: "AUDIO",
            /** 
             * HTML audio DOM element.
             * @property audio
             * @type {Audio}
             * @default null
             */
            audio: null,
            /** 
             * HTML video DOM element.
             * @property video
             * @type {Video}
             * @default null
             */
            video: null,
            /** 
             * Indicates if audio timeupdate event listener was registered.
             * @property timeUpdateListenerLoaded
             * @type {Boolean}
             * @default false
             */
            timeUpdateListenerLoaded: false,
            /** 
             * Instance of audio service API.
             * @property audioPlayerService
             * @type {AudioService}
             * @default null
             */
            audioPlayerService: null,

            /** 
             * Selector of audio control buttons (play/pause, next, previous, shuffle, repeat).
             * @property ctrlButtonsSelector
             * @default null
             */
            ctrlButtonsSelector: null,
            /** 
             * Selector of audio time progress bar.
             * @property timeProgressBarSelelector
             * @default null
             */
            timeProgressBarSelelector: null,
            /** 
             * Selector of audio spectrum analyzer.
             * @property spectrumAnalyzerSelelector
             * @default null
             */
            spectrumAnalyzerSelelector: null,
            /** 
             * Selector of audio info panel.
             * @property infoPanelSelector
             * @default null
             */
            infoPanelSelector: null,
            /** 
             * Selector of audio thumbnail image.
             * @property thumbnailSelector
             * @default null
             */
            thumbnailSelector: null,
            /** 
             * Selector of audio volume control.
             * @property volumeControlSelector
             * @default null
             */
            volumeControlSelector: null,
            /** 
             * Indicates if repeat option of audio/video player is turned on.
             * @property repeatOn
             * @type {Boolean}
             * @default false
             */
            repeatOn: false,
            /** 
             * Indicates if shuffle option of audio player is turned on.
             * @property shuffleOn
             * @type {Boolean}
             * @default false
             */
            shuffleOn: false,
            /** 
             * Indicates if audio/video is playing (is not paused).
             * @property playOn
             * @type {Boolean}
             * @default false
             */
            playOn: false,
            /** 
             * Indicates the index of the loaded audio/video.
             * @property index
             * @type {Number}
             * @default 0
             */
            index: 0,
            /** 
             * Indicates the current playback position in percentage (0% - 100%) in the loaded audio/video.
             * @property position
             * @type {Number}
             * @default 0
             */
            position: 0,
            /** 
             * Indicates the current playback position in the loaded audio/video.
             * @property currentTime
             * @type {Number}
             * @default 0
             */
            currentTime: 0,
            /** 
             * Indicates the length of the loaded audio/video.
             * @property duration
             * @type {Number}
             * @default 0
             */
            duration: 0,
            /** 
             * Indicates the volume in percentage (0% - 100%) of the loaded audio/video.
             * @property volume
             * @type {Number}
             * @default 0
             */
            volume: 100,
            indexChangedCallback: null,
            /**
             * Sets the audio spectrum analyzer selector.
             * 
             * @method setSpectrumAnalyzerSelector
             * @param selector {String} Audio spectrum analyzer selector.
             */
            setSpectrumAnalyzerSelector: function (selector) {
                AudioPlayer.spectrumAnalyzerSelelector = selector;
            },
            /**
             * Sets the audio control buttons selector.
             * 
             * @method setControlButtonsSelector
             * @param selector {String} Audio control buttons selector.
             */
            setControlButtonsSelector: function (selector) {
                AudioPlayer.ctrlButtonsSelector = selector;
            },
            /**
             * Sets the audio time progress bar selector.
             * 
             * @method setTimeProgressBarSelector
             * @param selector {String} Audio time progress bar selector.
             */
            setTimeProgressBarSelector: function (selector) {
                AudioPlayer.timeProgressBarSelelector = selector;
            },
            /**
             * Sets the audio info panel selector.
             * 
             * @method setInfoPanelSelector
             * @param selector {String} Audio info panel selector.
             */
            setInfoPanelSelector: function (selector) {
                AudioPlayer.infoPanelSelector = selector;
            },
            /**
             * Sets the audio info panel selector.
             * 
             * @method setThumbnailSelector
             * @param selector {String} Audio info panel selector.
             */
            setThumbnailSelector: function (selector) {
                AudioPlayer.thumbnailSelector = selector;
            },
            /**
             * Sets the audio volume control selector.
             * 
             * @method setVolumeControlSelector
             * @param selector {String} Audio volume control selector.
             */
            setVolumeControlSelector: function (selector) {
                AudioPlayer.volumeControlSelector = selector;
            },
            addIndexChangeListener: function(indexChangeCallback) {
                AudioPlayer.indexChangeCallback = indexChangeCallback;
            },
            /**
             * Initializes the audio player user interface, binds the audio controls (control buttons, volume control, time progress bar, ...), adds audio events listeners,
             * gets the status from audio service API, loads appropriate song from passed model/playlist and updates the UI. 
             * 
             * @method init
             * @param modelLib {Array} Array of audio songs.
             */
            init: function (modelLib, audioPlayerSelector, videoPlayerSelector) {
                AudioPlayer.thisObj = this;
                if (!!modelLib && modelLib.length) {
                    AudioPlayer.model = modelLib;
                }
                if (!!audioPlayerSelector && audioPlayerSelector !== "") {
                    AudioPlayer.audio = $(audioPlayerSelector).get(0);
                }
                if (!!videoPlayerSelector && videoPlayerSelector !== "") {
                    AudioPlayer.video = $(videoPlayerSelector).get(0);
                }
                if (!!AudioPlayer.audio) {
                    AudioPlayer.player = AudioPlayer.audio;
                    AudioPlayer.playerType = "AUDIO";
                } else if (!!AudioPlayer.video) {
                    AudioPlayer.player = AudioPlayer.video;
                    AudioPlayer.playerType = "VIDEO";
                }

                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    $(AudioPlayer.ctrlButtonsSelector).buttonControls('initAudioPlayerButtons');
                    $(AudioPlayer.ctrlButtonsSelector).unbind();
                    $(AudioPlayer.ctrlButtonsSelector).bind('previousSong', function () {
                        console.log("previousSong clicked");
                        AudioPlayer.previous();
                    });
                    $(AudioPlayer.ctrlButtonsSelector).bind('nextSong', function () {
                        console.log("nextSong clicked");
                        AudioPlayer.next();
                    });
                    $(AudioPlayer.ctrlButtonsSelector).bind('playSong', function () {
                        console.log("playSong clicked");
                        AudioPlayer.playOn = !AudioPlayer.playOn;
                        AudioPlayer.playPause(AudioPlayer.playOn);
                    });
                    $(AudioPlayer.ctrlButtonsSelector).bind('shuffleSong', function () {
                        console.log("shuffleSong clicked");
                        AudioPlayer.shuffleOn = !AudioPlayer.shuffleOn;
                        AudioPlayer.updateUIControls();
                    });
                    $(AudioPlayer.ctrlButtonsSelector).bind('repeatSong', function () {
                        console.log("repeatSong clicked");
                        AudioPlayer.repeatOn = !AudioPlayer.repeatOn;
                        AudioPlayer.updateUIControls();
                    });
                }

                if (AudioPlayer.volumeControlSelector !== null) {
                    $(AudioPlayer.volumeControlSelector).noUiSlider({
                        range: [0, 100],
                        step: 1,
                        start: 50,
                        handles: 1,
                        connect: "lower",
                        orientation: "horizontal",
                        slide: function (aaa, ccc) {
                            var volumeSlider = parseInt($(AudioPlayer.volumeControlSelector).val(), 10);
                            console.log("new volume: " + volumeSlider);
                            AudioPlayer.volume = volumeSlider;
                            AudioPlayer.setAudioVolume(volumeSlider);
                        }
                    });
                    AudioPlayer.setAudioVolume(50);
                }

                if (AudioPlayer.timeProgressBarSelelector !== null) {
                    $(AudioPlayer.timeProgressBarSelelector).timeProgressBar("init");
                    $(AudioPlayer.timeProgressBarSelelector).bind('positionChanged', function (e, data) {
                        console.log("positionChanged " + data.position);
                        AudioPlayer.setAudioPosition(data.position);
                    });
                }

                AudioPlayer.registerPlayerListeners(AudioPlayer.audio, "AUDIO");
                AudioPlayer.registerPlayerListeners(AudioPlayer.video, "VIDEO");

                AudioPlayer.updateUIControls();
            },
            registerPlayerListeners: function(player, type) {
                if (!!player) {
                    player.addEventListener('canplay', function () {
                        console.log("canplay " + type);
                        AudioPlayer.playPause(AudioPlayer.playOn);
                    }, false);

                    player.addEventListener('canplaythrough', function () {
                        console.log("canplaythrough " + type);
                        AudioPlayer.playPause(AudioPlayer.playOn);
                    }, false);

                    player.addEventListener('play', function () {
                        console.log("play " + type);
                    }, false);

                    player.addEventListener('playing', function () {
                        console.log("playing " + type);
                    }, false);

                    player.addEventListener('error', function () {
                        console.log("error " + type);
                    }, false);

                    player.addEventListener('waiting', function () {
                        console.log("waiting " + type);
                    }, false);

                    player.addEventListener('timeupdate', function () {
                        //console.log("timeupdate " + type + " " + player.currentTime + " " + player.duration);
                        if (!!player.currentTime && !isNaN(player.currentTime) && player.currentTime !== "Infinity" && player.currentTime > 0 &&
                            !!player.duration && !isNaN(player.duration) && player.duration !== "Infinity" && player.duration > 0) {
                            AudioPlayer.currentTime = player.currentTime;
                            AudioPlayer.duration = player.duration;
                        }

                        AudioPlayer.updateProgressInfoPanel();
                        AudioPlayer.spectrumAnalyzer(AudioPlayer.playOn);
                    }, false);

                    player.addEventListener('ended', function () {
                        AudioPlayer.next();
                    });
                }
            },
            playAudioContent: function(audioContent, indexToPlay, play, type) {
                if (!!AudioPlayer.player) {
                    AudioPlayer.player.pause();
                    AudioPlayer.player.src = "";
                }
                AudioPlayer.model = audioContent;
                AudioPlayer.playOn = play;
                AudioPlayer.playerType = type;
                if (type === "AUDIO") {
                    AudioPlayer.player = AudioPlayer.audio;
                } else if (type === "VIDEO") {
                    AudioPlayer.player = AudioPlayer.video;
                }
                AudioPlayer.loadAudio(indexToPlay);
            },
            /**
             * Updates the audio UI controls and panels according to loaded song and audio status.
             * 
             * @method updateUIControls
             */
            updateUIControls: function () {
                AudioPlayer.playPauseButtons(AudioPlayer.playOn);
                AudioPlayer.shuffleButton(AudioPlayer.shuffleOn);
                AudioPlayer.repeatButton(AudioPlayer.repeatOn);
                AudioPlayer.nextButton(AudioPlayer.index, AudioPlayer.repeatOn, AudioPlayer.shuffleOn);
                AudioPlayer.previousButton(AudioPlayer.index, AudioPlayer.repeatOn, AudioPlayer.shuffleOn);
                AudioPlayer.spectrumAnalyzer(AudioPlayer.playOn);
                AudioPlayer.volumeControl(AudioPlayer.volume);
                AudioPlayer.updateAudioInfoPanel(AudioPlayer.index);
                AudioPlayer.updateProgressInfoPanel();
            },
            /**
             * Sets the audio play/pause button to active/inactive state.
             * 
             * @method playPauseButtons
             * @param isPaused {Boolean} State of play/pause button.
             */
            playPauseButtons: function (isPaused) {
                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    if (isPaused) {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonPauseActive');
                    } else {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonPlayActive');
                    }
                }
            },
            /**
             * Sets the audio shuffle button to active/inactive state.
             * 
             * @method shuffleButton
             * @param isActive {Boolean} State of shuffle button.
             */
            shuffleButton: function (isActive) {
                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    if (isActive) {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonShuffleActive');
                    } else {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonShuffleInactive');
                    }
                }
            },
            /**
             * Sets the audio repeat button to active/inactive state.
             * 
             * @method repeatButton
             * @param isActive {Boolean} State of repeat button.
             */
            repeatButton: function (isActive) {
                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    if (isActive) {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonRepeatActive');
                    } else {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonRepeatInactive');
                    }
                }
            },
            /**
             * Sets the audio next button to active/inactive state.
             * 
             * @method nextButton
             * @param index {Number} Index of the song.
             * @param repeat {Boolean} State of the repeat option.
             * @param shuffle {Boolean} State of the shuffle option.
             */
            nextButton: function (index, repeat, shuffle) {
                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    if (repeat || shuffle || index < AudioPlayer.model.length - 1) {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonNextActive');
                    } else {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonNextInactive');
                    }
                }
            },
            /**
             * Sets the audio previous button to active/inactive state.
             * 
             * @method previousButton
             * @param index {Number} Index of the song.
             * @param repeat {Boolean} State of the repeat option.
             * @param shuffle {Boolean} State of the shuffle option.
             */
            previousButton: function (index, repeat, shuffle) {
                if (AudioPlayer.ctrlButtonsSelector !== null) {
                    if (repeat || shuffle || index > 0) {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonPreviousActive');
                    } else {
                        $(AudioPlayer.ctrlButtonsSelector).buttonControls('buttonPreviousInactive');
                    }
                }
            },
            /**
             * Sets the audio spectrum analyzer to active/inactive state.
             * 
             * @method spectrumAnalyzer
             * @param playOn {Boolean} State of the audio playback.
             */
            spectrumAnalyzer: function (playOn) {
                if (AudioPlayer.spectrumAnalyzerSelelector !== null) {
                    if (playOn) {
                        $(AudioPlayer.spectrumAnalyzerSelelector).spectrumAnalyzer('spectrumAnalyzerRandomize');
                    } else {
                        $(AudioPlayer.spectrumAnalyzerSelelector).spectrumAnalyzer('clearSpectrumAnalyzer');
                    }
                }
            },
            /**
             * Sets the audio volume control.
             * 
             * @method volumeControl
             * @param volume {Number} Volume of the audio in percentage (0% - 100%).
             */
            volumeControl: function (volume) {
                if (volume > 100) {
                    volume = 100;
                } else if (volume < 0) {
                    volume = 0;
                }
                AudioPlayer.volume = volume;
                if (AudioPlayer.volumeControlSelector !== null) {
                    $(AudioPlayer.volumeControlSelector).val(volume);
                }
                AudioPlayer.setAudioVolume(volume);
            },
            /**
             * Sets the audio volume.
             * 
             * @method setAudioVolume
             * @param volume {Number} Volume of the audio in percentage (0% - 100%).
             */
            setAudioVolume: function (volume) {
                if (volume > 100) {
                    volume = 100;
                } else if (volume < 0) {
                    volume = 0;
                }
                AudioPlayer.volume = volume;
                AudioPlayer.player.volume =  volume / 100;
            },
            /**
             * Updates the audio info panel (artist, album, name).
             * 
             * @method updateAudioInfoPanel
             * @param index {Number} Index of the song.
             */
            updateAudioInfoPanel: function (index) {
                if (AudioPlayer.model.length && index >= 0 && index < AudioPlayer.model.length ) {
                    var audioContent = AudioPlayer.model[index],
                        objInfo = {};

                    if (!!audioContent) {
                        if (AudioPlayer.infoPanelSelector !== null) {
                            objInfo.title = 'NOW PLAYING';
                            objInfo.artist = Utils.getArtistName(audioContent);
                            objInfo.album = Utils.getAlbumName(audioContent);
                            objInfo.name = Utils.getMediaItemTitle(audioContent);
                            $(AudioPlayer.infoPanelSelector).infoPanel('show', objInfo);
                        }
                        if (AudioPlayer.thumbnailSelector !== null) {
                            $(AudioPlayer.thumbnailSelector).get(0).src = Utils.getThumbnailPath(audioContent, AudioPlayer.playerType);
                        }
                    }
                }
            },
            /**
             * Updates the audio time progress bar.
             * 
             * @method updateProgressInfoPanel
             */
            updateProgressInfoPanel: function () {
                if (AudioPlayer.duration < 0) {
                    AudioPlayer.duration = 0;
                }

                if (AudioPlayer.currentTime < 0) {
                    AudioPlayer.currentTime = 0;
                }

                if (AudioPlayer.currentTime > AudioPlayer.duration) {
                    AudioPlayer.currentTime = AudioPlayer.duration;
                }

                AudioPlayer.position = (AudioPlayer.currentTime / AudioPlayer.duration) * 100;

                if (AudioPlayer.position < 0) {
                    AudioPlayer.position = 0;
                }

                if (AudioPlayer.position > 100) {
                    AudioPlayer.position = 100;
                }

                var remainingTime = AudioPlayer.duration - AudioPlayer.currentTime,
                    durationMins = Math.floor(remainingTime / 60, 10),
                    durationSecs = Math.round(remainingTime) - durationMins * 60,
                    estimationTime = '-' + durationMins + ':' + (durationSecs > 9 ? durationSecs : '0' + durationSecs),
                    initProgressBarObj = {
                        count: AudioPlayer.model.length,
                        index: AudioPlayer.model.length <= 0 ? 0 : AudioPlayer.index + 1,
                        estimation: estimationTime,
                        position: AudioPlayer.position
                    };

                if (AudioPlayer.timeProgressBarSelelector !== null) {
                    $(AudioPlayer.timeProgressBarSelelector).timeProgressBar("show", initProgressBarObj);
                }
            },
            /**
             * Sets and loads the audio source.
             * 
             * @method loadAudio
             * @param index {Number} Index of the song.
             */
            loadAudio: function (index, delay) {
                if (!AudioPlayer.model.length || index < 0 || index > AudioPlayer.model.length - 1 || !AudioPlayer.player) {
                    return;
                }

                AudioPlayer.player.pause();
                AudioPlayer.player.src = "";
                AudioPlayer.index = index;
                AudioPlayer.position = 0;
                AudioPlayer.currentTime = 0;
                AudioPlayer.duration = 0;

                var audioContent = AudioPlayer.model[index];

                if (!!audioContent) {
                    if (!!audioContent.contentURI && audioContent.contentURI !== "") {
                        if (typeof(delay) === 'undefined') {
                            AudioPlayer.player.src = audioContent.contentURI;
                            AudioPlayer.player.load();
                        } else {
                            setTimeout(function() {
                                AudioPlayer.player.src = audioContent.contentURI;
                                AudioPlayer.player.load();
                            }, delay);
                        }
                    }
                    if (!!audioContent.duration && audioContent.duration >= 0) {
                        AudioPlayer.duration = audioContent.duration / 1000;
                    }
                }
                AudioPlayer.updateUIControls();
            },
            play: function (index) {
                if (index !== AudioPlayer.index) {
                    AudioPlayer.loadAudio(index);
                }
            },
            /**
             * Sets the position/current time of loaded song.
             * 
             * @method setAudioPosition
             * @param position {Number} Position in percentage of song.
             */
            setAudioPosition: function (position) {
                if (position > 100) {
                    position = 100;
                } else if (position < 0) {
                    position = 0;
                }
                AudioPlayer.currentTime = position / 100 * AudioPlayer.duration;
                if (!!AudioPlayer.player) {
                    AudioPlayer.player.currentTime = AudioPlayer.currentTime;
                }
                AudioPlayer.updateProgressInfoPanel();
            },
            /**
             * Starts/pauses playback of the song.
             * 
             * @method playPause
             * @param playing {Boolean} State of song playback.
             */
            playPause: function (playing) {
                AudioPlayer.playOn = playing;
                if (!!AudioPlayer.player && AudioPlayer.player.currentSrc !== "") {
                    if (AudioPlayer.playOn) {
                        AudioPlayer.player.play();
                    } else {
                        AudioPlayer.player.pause();
                    }
                } else {
                    AudioPlayer.playOn = false;
                }
                AudioPlayer.updateUIControls();
            },
            /**
             * Sets next, random (if shuffle is on) index of song or first index (if repeat is on) and loads it from model.
             * 
             * @method next
             */
            next: function () {
                if (AudioPlayer.model.length) {
                    var newIndex = AudioPlayer.index, previousIndex = AudioPlayer.index;

                    if (AudioPlayer.shuffleOn) {
                        while (newIndex === AudioPlayer.index) {
                            newIndex = Math.floor((Math.random() * AudioPlayer.model.length));
                        }
                    } else if (AudioPlayer.repeatOn && AudioPlayer.index >= AudioPlayer.model.length - 1) {
                        newIndex = 0;
                    } else if (AudioPlayer.index < AudioPlayer.model.length - 1) {
                        newIndex = AudioPlayer.index + 1;
                    } else {
                        AudioPlayer.playOn = false;
                    }

                    if (newIndex !== previousIndex && !!AudioPlayer.indexChangeCallback) {
                        AudioPlayer.indexChangeCallback(newIndex);
                    }

                    AudioPlayer.loadAudio(newIndex, 150);
                }
            },
            /**
             * Sets previous, random (if shuffle is on) index of song or last index (if repeat is on) and loads it from model.
             * 
             * @method previous
             */
            previous: function () {
                if (AudioPlayer.model.length) {
                    var newIndex = AudioPlayer.index, previousIndex = AudioPlayer.index;

                    if (AudioPlayer.shuffleOn) {
                        while (newIndex === AudioPlayer.index) {
                            newIndex = Math.floor((Math.random() * AudioPlayer.model.length));
                        }
                    } else if (AudioPlayer.repeatOn && AudioPlayer.index <= 0) {
                        newIndex = AudioPlayer.model.length - 1;
                    } else if (AudioPlayer.index > 0) {
                        newIndex = AudioPlayer.index - 1;
                    }

                    if (newIndex !== previousIndex && !!AudioPlayer.indexChangeCallback) {
                        AudioPlayer.indexChangeCallback(newIndex);
                    }

                    AudioPlayer.loadAudio(newIndex, 150);
                }
            },
            getCurrentPlayerType: function () {
                return AudioPlayer.playerType;
            }
        };

    /** 
     * jQuery extension method for {{#crossLink "AudioPlayer"}}{{/crossLink}} plugin.
     * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
     * @method audioAPI
     * @for jQuery
     * @return Result of called method.
     */
    $.fn.audioAPI = function (method) {
        // Method calling logic
        if (AudioPlayer[method]) {
            return AudioPlayer[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return AudioPlayer.init.apply(this, arguments);
        }

        $.error('Method ' + method + ' does not exist on jQuery.audioAPI');
    };
}(jQuery));
