var CONFIG = {
    TIMESERIES_AUDIO_ENABLED: true,
    MULTIPLE_TIME_SERIES_METADATA_SELECTOR_ENABLED: true,
    FIM_GIS_ENDPOINT: 'https:/fakelegendservice.com'
};

var mockOscillator = function() {
    var connect = function() { return null; };
    var start = function() { return null; };
    var frequency = {
        setTargetAtTime : function() { return null; }
    };
    return {
        type: '',
        connect: connect,
        start: start,
        frequency: frequency
    };
};

var mockGain = function() {
    var connect = function() { return null; };
    var gain = {
        setTargetAtTime: function() { return null; }
    };
    return {
        connect: connect,
        gain: gain
    };
};

var mockCompressor = function() {
    var connect = function() { return null; };
    var threshold = {
        setValueAtTime: function() { return null; }
    };
    var knee = {
        setValueAtTime: function() { return null; }
    };
    var ratio = {
        setValueAtTime: function() { return null; }
    };
    var attack = {
        setValueAtTime: function() { return null; }
    };
    var release = {
        setValueAtTime: function() { return null; }
    };
    return {
        connect: connect,
        threshold: threshold,
        knee: knee,
        ratio: ratio,
        attack: attack,
        release: release
    };
};

var MockAudioContext = function() {
    this.createOscillator = mockOscillator;
    this.createGain = mockGain;
    this.createDynamicsCompressor = mockCompressor;
};

window.AudioContext = MockAudioContext;
