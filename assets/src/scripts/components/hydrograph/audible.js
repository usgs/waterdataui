import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import memoize from 'fast-memoize';
import { createSelector, createStructuredSelector } from 'reselect';
import { tsCursorPointsSelector } from './cursor';
import { xScaleSelector, yScaleSelector } from './scales';
import { allTimeSeriesSelector } from './timeSeries';
import config from '../../config';
import { dispatch, link } from '../../lib/redux';
import { Actions } from '../../store';

// Higher tones get lower volume
const volumeScale = scaleLinear().range([2, .3]);

const AudioContext = config.TIMESERIES_AUDIO_ENABLED ? window.AudioContext || window.webkitAudioContext : null;
const getAudioContext = memoize(function () {
    return new AudioContext();
});

export const createSound = memoize(/* eslint no-unused-vars: off */ tsKey => {
    const audioCtx = getAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();

    // Connect the oscillator to the gainNode to modulate volume
    oscillator.type = 'sine';
    oscillator.connect(gainNode);

    // Connect the gainNode to the compressor to address clipping
    gainNode.connect(compressor);

    // Connect the compressor to the output context
    compressor.connect(audioCtx.destination);

    // Start the oscillator
    oscillator.start();

    // Initialize with null values so the first pass of updateSound doesn't
    // create a transition.
    oscillator.frequency.setTargetAtTime(null, audioCtx.currentTime, 0);
    gainNode.gain.setTargetAtTime(null, audioCtx.currentTime, 0);

    return {oscillator, gainNode, compressor};
});

export const updateSound = function ({enabled, points}) {
    const audioCtx = getAudioContext();
    for (const tsKey of Object.keys(points)) {
        const point = points[tsKey];
        const {compressor, oscillator, gainNode} = createSound(tsKey);

        compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
        compressor.knee.setValueAtTime(40, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

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

const audibleInterfaceOnSelector = state => state.timeSeriesState.audiblePlayId !== null;

const audibleScaleSelector = createSelector(
    yScaleSelector,
    (yScale) => {
        return scaleLinear()
            .domain(yScale.domain())
            .range([80, 1500]);
    }
);

const audiblePointsSelector = createSelector(
    allTimeSeriesSelector,
    tsCursorPointsSelector('current'),
    tsCursorPointsSelector('compare'),
    audibleScaleSelector,
    (allTimeSeries, currentPoints, comparePoints, yScale) => {
        // Set null points for all time series, so we can turn audio for those
        // points off when toggling to other time series.
        let points = Object.keys(allTimeSeries).reduce((points, tsID) => {
            points[tsID] = null;
            return points;
        }, {});

        // Get the pitches for the current-year points
        points = Object.keys(currentPoints).reduce((points, tsID) => {
            const pt = currentPoints[tsID];
            points[tsID] = yScale(pt.value);
            return points;
        }, points);

        // Get the pitches for the compare-year points
        return Object.keys(comparePoints).reduce((points, tsID) => {
            const pt = comparePoints[tsID];
            points[tsID] = yScale(pt.value);
            return points;
        }, points);
    }
);

export const audibleUI = function (elem) {
    // Only enable the audio interface on dev tiers.
    if (!config.TIMESERIES_AUDIO_ENABLED) {
        return;
    }

    if (!AudioContext) {
        console.warn('AudioContext not available');
        return;
    }

    const button = elem.append('button')
        .classed('usa-button-secondary', true)
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .html('Audible&nbsp;');
    button.append('i')
        .classed('fas', true);
    button.call(link(function(elem, audibleOn) {
            if (audibleOn) {
                elem.attr('title', 'Stop')
                    .attr('ga-event-action', 'stopAudible');
            } else {
                elem.attr('title', 'Play')
                    .attr('ga-event-action', 'playAudible');
            }
            elem.select('i')
                .classed('fa-play', !audibleOn)
                .classed('fa-stop', audibleOn);
        }, audibleInterfaceOnSelector))
        .call(link(function(elem, xScale) {
            const domain = xScale.domain();
            elem.attr('data-max-offset', domain[1] - domain[0]);
        }, xScaleSelector('current')))
        .on('click', dispatch(function() {
            const button = select(this);
            if (button.attr('title') === 'Play') {
                return Actions.startTimeSeriesPlay(button.attr('data-max-offset'));
            } else {
                return Actions.stopTimeSeriesPlay();
            }
        }));

    // Listen for focus changes, and play back the audio representation of
    // the selected points.
    // TODO: Handle more than just the first time series of each tsKey. This can
    // piggyback on work to support multiple tooltip selections.
    elem.call(link(function (elem, {enabled, points}) {
        updateSound({
            points,
            enabled
        });
    }, createStructuredSelector({
        enabled: audibleInterfaceOnSelector,
        points: audiblePointsSelector
    })));
};
