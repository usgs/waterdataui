import {brushX} from 'd3-brush';
import {event} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {appendXAxis} from '../../../d3-rendering/axes';
import {link} from '../../../lib/d3-redux';
import {getDVGraphBrushOffset} from '../../selectors/daily-value-time-series-selector';
import {Actions} from '../../store/daily-value-time-series';

import {getXAxis} from './selectors/axes';
import {getBrushLayout} from './selectors/layout';
import {getBrushXScale, getBrushYScale} from './selectors/scales';
import {getCurrentTimeSeriesSegments} from './selectors/time-series-data';

import {drawDataSegments} from './time-series-graph';
import {mediaQuery} from '../../../utils';
import config from '../../../config';

/*
 * Renders a brush element within container for the daily value graph
 * @param {D3 selection} container
 * @param {Redux store} store
 */
export const drawGraphBrush = function(container, store) {
    let customHandle;
    let layoutHeight;

    const brushed = function() {
        const CENTERING_DIVISOR_LARGE_SCREEN = 3;
        const CENTERING_DIVISOR_SMALL_SCREEN = 2.3;
        // if the user clicks a point in the brush area without making an actual selection, remove the custom handles
        if (event.selection == null) {
            customHandle.attr('display', 'none');
        }
        customHandle.attr('transform', function(d, index) {
            const yPositionForCustomHandle = mediaQuery(config.USWDS_LARGE_SCREEN) ?
                -layoutHeight / CENTERING_DIVISOR_LARGE_SCREEN :
                -layoutHeight / CENTERING_DIVISOR_SMALL_SCREEN;
            return `translate(${event.selection[index]}, ${yPositionForCustomHandle})`;
        });

        if (!event.sourceEvent || event.sourceEvent.type === 'zoom') {
            return;
        }
        const xScale = getBrushXScale(store.getState());
        const brushRange = event.selection || xScale.range();

        // Only adjust the main hydrograph when user is done adjusting the time range.
        if (event.sourceEvent.type === 'mouseup' || event.sourceEvent.type === 'touchend') {
            const adjustedBrush = brushRange.map(xScale.invert, xScale);

            store.dispatch(Actions.setDVGraphBrushOffset(
                adjustedBrush[0]- xScale.domain()[0],
                xScale.domain()[1] - adjustedBrush[1]));
        }
    };

    const div = container.append('div')
        .attr('class', 'hydrograph-container');
    div.append('svg')
        .classed('brush-svg', true)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .call(link(store,(elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.bottom + layout.margin.top}`);
            }, getBrushLayout
            ))
        .call(svg => {
            svg.append('g')
                .call(link(store,(elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`),
                                getBrushLayout
                ))
                .call(link(store, appendXAxis, createStructuredSelector({
                    xAxis: getXAxis('BRUSH'),
                    layout: getBrushLayout
                })))
                .call(link(store, drawDataSegments, createStructuredSelector({
                    segments: getCurrentTimeSeriesSegments,
                    xScale: getBrushXScale,
                    yScale: getBrushYScale,
                    enableClip: () => false
                })));

        })
        .call(link(store, (svg, {layout, graphBrushOffset, xScale}) => {
            let selection;
            layoutHeight = layout.height;

            const graphBrush = brushX()
                .on('brush end', brushed);

            svg.select('.brush').remove();

            const group = svg.append('g').attr('class', 'brush')
                .attr('transform', `translate(${layout.margin.left},${layout.margin.top})`);

            graphBrush.handleSize([1]); // make default handle 1px wide
            graphBrush.extent([[0, 0], [layout.width - layout.margin.right, layout.height - layout.margin.bottom - layout.margin.top]]);

            /* Draws the custom brush handle using an SVG path. The path is drawn twice, once for the handle
            * on the left hand side, which in d3 brush terms is referred to as 'east' (data type 'e'), and then
            * inverted for the right hand custom handle. Here 'east' will be a value of either 1 or 0 (in effect, making
            * it a boolean value of 'east' or 'not east' */
            const brushResizePath = function(d) {
                let east = d.type === 'e' ? 1:0,
                    x = east ? 1 : -1,
                    y = layoutHeight / 2;

                // Create the svg path using the standard SVG commands M, A, V etc. and substituted variables.
                return `M ${.5 * x},${y} 
                    A6,6 0 0 ${east} ${6.5 * x},${y + 6}
                    V${2 * y - 6}
                    A6,6 0 0 ${east} ${.5 * x},${2 * y}
                    Z
                    M${2.5 * x},${y + 8}
                    V${2 * y - 8}
                    M${4.5 * x},${y + 8}
                    V${2 * y - 8}`;
            };

            /* Attaches the custom brush handle to the DOM and binds d3 brush data placeholders 'w' for the west end (right side)
            * and 'e' for east end of the brush area */
            customHandle = group.selectAll('.handle--custom')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('path')
                .attr('class', 'handle--custom')
                .attr('d', brushResizePath);

            // Creates the brush
            group.call(graphBrush);

            // Add a class so the default handles can have styling that won't conflict with the slider handle
            svg.selectAll('.handle').classed('standard-brush-handle', true);

            svg.select('.brush-text-hint').remove();
            // Add the hint text after the brush is created so that the words sit on top of the brush area
            svg.call(svg => {
                svg.append('text')
                    .classed('brush-text-hint', true)
                    .text('drag handles to change timeframe')
                    .call(link(store,(elem, layout) => elem.attr('transform', `translate(${layout.width / 2 + layout.margin.left}, 10)`),
                        getBrushLayout
                    ));
            });

            if (graphBrushOffset) {
                const [startMillis, endMillis] = xScale.domain();
                selection = [
                    xScale(startMillis + graphBrushOffset.start),
                    xScale(endMillis - graphBrushOffset.end)
                ];
            } else {
                selection = xScale.range();
            }

            graphBrush.move(group, selection);

        }, createStructuredSelector({
            layout: getBrushLayout,
            graphBrushOffset: getDVGraphBrushOffset,
            xScale: getBrushXScale
        })));
};
