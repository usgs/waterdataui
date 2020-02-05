import memoize from "fast-memoize";
import {createSelector} from "reselect";
import {tickSelector} from "../hydrograph/domain";
import {mediaQuery} from "../../utils";
import config from "../../config";
import {BRUSH_HEIGHT, BRUSH_MOBILE_HEIGHT} from "../hydrograph/layout";

export const ASPECT_RATIO = 1 / 2;
export const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 25,
    right: 25,
    bottom: 10,
    left: 65
};
const MARGIN_SMALL_DEVICE = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 0
};

/*
 * Returns a selector function. This function returns an object containing the following properties:
 *  @prop {Number} - height - This is the height of the svg containing hydrograph
 *  @prop {Number} - width - This is the width of the svg containing hydrgoraph
 *  @prop {Object} - margin - Has top, bottom, left, right Number properties which define the margins
 *      with the enclosing svg for the hydrograph. Typically the area in the margins are used for axis
 *      labels and graph titles.
 * @return {Selector function}
 */
export const getLayout = createSelector(
    (state) => state.ui.width,
    (state) => state.ui.windowWidth,
    (width, windowWidth) => {
        const isDesktop = mediaQuery(config.USWDS_SITE_MAX_WIDTH);
        const height =  width * ASPECT_RATIO;
        const margin = isDesktop ? MARGIN : MARGIN_SMALL_DEVICE;
        return {
            width: width,
            height: height,
            windowWidth: windowWidth,
            margin: margin
        };
    }
);