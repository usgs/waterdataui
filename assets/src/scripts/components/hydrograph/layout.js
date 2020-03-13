// Define constants for the time series graph's aspect ratio and margins as well as a
// selector function which will return the width/height to use.

import memoize from 'fast-memoize';
import { createSelector } from 'reselect';

import config from '../../config';
import {getCurrentParmCd} from '../../selectors/time-series-selector';
import {mediaQuery} from '../../utils';

import {tickSelector} from './domain';
import {TEMPERATURE_PARAMETERS} from './time-series';


export const ASPECT_RATIO = 1 / 2;
export const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 25,
    right: 25,
    bottom: 10,
    left: 45
};
const MARGIN_SMALL_DEVICE = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 0
};
export const CIRCLE_RADIUS = 4;
export const CIRCLE_RADIUS_SINGLE_PT = 1;

export const BRUSH_HEIGHT = 100;
export const BRUSH_MOBILE_HEIGHT = 50;


export const SPARK_LINE_DIM = {
    width: 60,
    height: 30
};


/*
 * Returns a selector function. This function returns an object containing the following properties:
 *  @prop {Number} - height - This is the height of the svg containing hydrograph
 *  @prop {Number} - width - This is the width of the svg containing hydrgoraph
 *  @prop {Object} - margin - Has top, bottom, left, right Number properties which define the margins
 *      with the enclosing svg for the hydrograph. Typically the area in the margins are used for axis
 *      labels and graph titles.
 * @param {String} kind - Either 'BRUSH' or 'MAIN'. If null 'MAIN' is assumed
 * @return {Selector function}
 */
export const getLayout = memoize(kind => createSelector(
    (state) => state.ui.width,
    (state) => state.ui.windowWidth,
    tickSelector,
    (width, windowWidth, tickDetails) => {
        const isDesktop = mediaQuery(config.USWDS_SITE_MAX_WIDTH);
        const height = kind === 'BRUSH' ? isDesktop ? BRUSH_HEIGHT : BRUSH_MOBILE_HEIGHT : width * ASPECT_RATIO;
        const margin = isDesktop ? MARGIN : MARGIN_SMALL_DEVICE;
        const tickLengths = tickDetails.tickValues.map(v => tickDetails.tickFormat(v).length);
        const approxLabelLength = Math.max(...tickLengths) * 10;
        const isTemperatureParameter =
            TEMPERATURE_PARAMETERS.celsius.concat(TEMPERATURE_PARAMETERS.fahrenheit).includes(parmCd);
        return {
            width: width,
            height: height,
            windowWidth: windowWidth,
            margin: {
                ...margin,
                top: kind === 'BRUSH' ? 0 : margin.top,
                left: margin.left + approxLabelLength,
                right: margin.right + approxLabelLength
            }
        };
    }
));

export const getMainLayout = getLayout();
export const getBrushLayout = getLayout('BRUSH');