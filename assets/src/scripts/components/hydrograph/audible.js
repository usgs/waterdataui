const { max, min } = require('d3-array');
const { scaleLinear } = require('d3-scale');
const { select } = require('d3-selection');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { flatPointsSelector } = require('./timeseries');
const { tsDatumSelector } = require('./tooltip');

const { dispatch, link } = require('../../lib/redux');
const { Actions } = require('../../store');


// Higher tones get lower volume
const volumeScale = scaleLinear().range([2, .3]);


const AudioContext = window.AudioContext || window.webkitAudioContext;
const getAudioContext = memoize(function () {
    return AudioContext ? new AudioContext() : null;
});

// Create a compressor node, to prevent clipping noises
const getCompressor = memoize(audioCtx => {
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, getAudioContext().currentTime);
    compressor.knee.setValueAtTime(40, getAudioContext().currentTime);
    compressor.ratio.setValueAtTime(12, getAudioContext().currentTime);
    compressor.attack.setValueAtTime(0, getAudioContext().currentTime);
    compressor.release.setValueAtTime(0.25, getAudioContext().currentTime);
    return compressor;
});

const getOscillator = function(audioCtx, value) {
    const oscillator = audioCtx.createOscillator();
    //oscillator.type = 'triangle';
    oscillator.type = 'sine';

    // Set the frequency, in hertz
    oscillator.frequency.value = value;

    return oscillator;
};

const getGainNode = function(audioCtx, value) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volumeScale(value);
    gainNode.gain.value = 1;

    return gainNode;
};

export const createSound = function (value) {
    const audioCtx = getAudioContext();
    const oscillator = getOscillator(audioCtx, value);
    const gainNode = getGainNode(audioCtx, value);
    const compressor = getCompressor(audioCtx);

    // Connect the oscillator to the gainNode to modulate volume
    oscillator.connect(gainNode);

    // Connect the gainNode to the compressor to address clipping
    gainNode.connect(compressor);

    // Connect the compressor to the output context
    compressor.connect(audioCtx.destination);

    // Start the oscillator
    oscillator.start();

    // This rapidly ramps sound down
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, .2);
};

const audibleScale = function (domain) {
    return scaleLinear().domain(domain).range([80, 1500]);
};

export const audibleInterfaceOnSelector = state => state.audibleInterfaceOn;

export const audibleScaleSelector = memoize(tsKey => createSelector(
    flatPointsSelector(tsKey),
    (points) => {
        return audibleScale([
            min(points.map((datum) => datum.value)),
            max(points.map((datum) => datum.value))
        ]);
    }
));

export const audibleUI = function (elem) {
    if (!AudioContext) {
        console.warn('AudioContext not available');
        return;
    }

    elem.append('audio')
        .attr('id', 'audible-controls')
        .attr('controls', true)
        .attr('muted', true)
        .style('width', '100%')
        .on('change', function () {
            console.log(arguments);
        });

    elem.append('input')
        .attr('type', 'checkbox')
        .attr('id', 'audible-checkbox')
        .attr('aria-labelledby', 'audible-label')
        .on('click', dispatch(function () {
            return Actions.toggleAudibleInterface(this.checked);
        }))
        .call(link(function (checked) {
            select(this).attr('checked', checked);
        }, audibleInterfaceOnSelector));

    elem.append('label')
        .attr('id', 'audible-label')
        .attr('for', 'audible-checkbox')
        .text('Audible Interface');

    // Listen for focus changes, and play back the audio representation of
    // the selected points.
    // FIXME: Handle more than just the first current time series.
    elem.call(link(function (elem, {datum, enabled, scale}) {
        if (!enabled) {
            return;
        }
        if (!datum) {
            return;
        }
        createSound(scale(datum.value));
    }, createStructuredSelector({
        datum: tsDatumSelector('current'),
        enabled: audibleInterfaceOnSelector,
        scale: audibleScaleSelector('current')
    })));
};
