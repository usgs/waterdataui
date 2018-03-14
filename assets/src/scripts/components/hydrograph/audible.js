const { scaleLinear } = require('d3-scale');
const { select } = require('d3-selection');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { yScaleSelector } = require('./scales');
const { tsDatumSelector } = require('./tooltip');

const { dispatch, link } = require('../../lib/redux');
const { Actions } = require('../../store');


// Higher tones get lower volume
const volumeScale = scaleLinear().range([2, .3]);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const getAudioContext = memoize(function () {
    return new AudioContext();
});

export const createSound = memoize(/* eslint-disable no-unused-vars */ tsKey => {
    const audioCtx = getAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();

    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    // Connect the oscillator to the gainNode to modulate volume
    oscillator.type = 'sine';
    oscillator.connect(gainNode);

    // Connect the gainNode to the compressor to address clipping
    gainNode.connect(compressor);

    // Connect the compressor to the output context
    compressor.connect(audioCtx.destination);

    // Start the oscillator
    oscillator.start();

    return {oscillator, gainNode, compressor};
});

export const updateSound = function ({enabled, points}) {
    const audioCtx = getAudioContext();
    for (const tsKey of Object.keys(points)) {
        const point = points[tsKey];
        const {oscillator, gainNode} = createSound(tsKey);
        oscillator.frequency.setTargetAtTime(
            enabled && point ? point : null,
            audioCtx.currentTime,
            .2
        );
        gainNode.gain.setTargetAtTime(
            enabled && point ? volumeScale(point) : null,
            audioCtx.currentTime,
            .2
        );
    }
};

export const audibleInterfaceOnSelector = state => state.audibleInterfaceOn;

export const audibleScaleSelector = memoize(tsKey => createSelector(
    yScaleSelector,
    (scale) => {
        const audibleScale = scale.copy();
        audibleScale.range([80, 1500]);
        return audibleScale;
    }
));

export const audibleUI = function (elem) {
    if (!AudioContext) {
        console.warn('AudioContext not available');
        return;
    }

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
    // TODO: Handle more than just the first time series of each tsKey. This can
    // piggyback on work to support multiple tooltip selections.
    elem.call(link(function (elem, {enabled, datumCurrent, datumCompare, yScaleCurrent, yScaleCompare}) {
        updateSound({
            points: {
                current: datumCurrent ? yScaleCurrent(datumCurrent.value) : null,
                compare: datumCompare ? yScaleCompare(datumCompare.value) : null
            },
            enabled
        });
    }, createStructuredSelector({
        enabled: audibleInterfaceOnSelector,
        datumCurrent: tsDatumSelector('current'),
        datumCompare: tsDatumSelector('compare'),
        yScaleCurrent: audibleScaleSelector('current'),
        yScaleCompare: audibleScaleSelector('compare')
    })));
};
