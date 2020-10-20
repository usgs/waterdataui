/*
 * Note the audible interface is not currently enabled and will likely need a major implementation
 * The current patterns of putting the selectors in a separate module from rendering code and
 * updating the selectors to use is* or get* pattern.
 */
import {scaleLinear} from 'd3-scale';
import memoize from 'fast-memoize';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {isAudiblePlaying, getAudiblePoints} from 'ivhydrograph/selectors/audible-data';
import {getMainXScale} from 'ivhydrograph/selectors/scales';


// Higher tones get lower volume
const volumeScale = scaleLinear().range([2, .3]);

const AudioContext = config.TIMESERIES_AUDIO_ENABLED ? window.AudioContext || window.webkitAudioContext : null;
const getAudioContext = memoize(function() {
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

export const updateSound = function({enabled, points}) {
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

/*
 * Renders the audible control if enabled.
 */
export const audibleUI = function(elem, store) {
    if (!config.TIMESERIES_AUDIO_ENABLED) {
        return;
    }

    if (!AudioContext) {
        console.warn('AudioContext not available');
        return;
    }

    const button = elem.append('button')
        .classed('usa-button', true)
        .classed('usa-button--outline', true)
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .html('Audible&nbsp;');
    button.append('i')
        .classed('fas', true);
    button.call(link(store, function(elem, audibleOn) {
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
        }, isAudiblePlaying))
        .call(link(store, function(elem, xScale) {
            const domain = xScale.domain();
            elem.attr('data-max-offset', domain[1] - domain[0]);
        }, getMainXScale('current')))
        .on('click', () =>  {
            if (button.attr('title') === 'Play') {
                store.dispatch(Actions.startTimeSeriesPlay(button.attr('data-max-offset')));
            } else {
                store.dispatch(Actions.stopTimeSeriesPlay());
            }
        });

    // Listen for focus changes, and play back the audio representation of
    // the selected points.
    // TODO: This does not correctly handle parameter codes with multiple time series.
    elem.call(link(store,function(elem, {enabled, points}) {
        updateSound({
            points,
            enabled
        });
    }, createStructuredSelector({
        enabled: isAudiblePlaying,
        points: getAudiblePoints
    })));
};
