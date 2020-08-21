var CONFIG = {
    TIMESERIES_AUDIO_ENABLED: true,
    FIM_GIS_ENDPOINT: 'https:/fakelegendservice.com',
    NWIS_INVENTORY_ENDPOINT: 'https://fakenwis.usgs.gov/inventory',
    NETWORK_ENDPOINT: 'https://fakeogcservice.com/observations/collections',
    OBSERVATIONS_ENDPOINT: 'https://fakeogcservice.com/observations/collections/monitoring-locations',
    TNM_USGS_TOPO_ENDPOINT : 'https://fakeusgstopo.com',
    TNM_USGS_IMAGERY_ONLY_ENDPOINT: 'https://fakeimageryonly.com',
    TNM_USGS_IMAGERY_TOPO_ENDPOINT: 'https://fakeimagerytopo.com',
    TNM_HYDRO_ENDPOINT: 'https://faketnmhydro.com',
    uvPeriodOfRecord: {
        '00010': {
            begin_date: '01-02-2001',
            end_date: '10-15-2015'
        },
        '00067': {
            begin_date: '04-01-1990',
            end_date: '10-15-2006'
        },
        '00093': {
            begin_date: '11-25-2001',
            end_date: '03-01-2020'
        }
    }
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
