import {brushX} from 'd3-brush';
import {event} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {appendXAxis} from '../../../d3-rendering/axes';
import {link} from '../../../lib/d3-redux';
import {Actions} from '../../store/instantaneous-value-time-series-state';

import {getBrushXAxis} from './selectors/axes';
import {getCurrentVariableLineSegments} from './drawing-data';
import {getBrushLayout} from './selectors/layout';
import {getBrushXScale, getBrushYScale} from './selectors/scales';
import {isVisibleSelector} from './selectors/time-series-data';
import {drawDataLines} from './time-series-lines';

export const drawGraphBrush = function(container, store) {

    const brushed = function() {
        if (!event.sourceEvent || event.sourceEvent.type === 'zoom') {
            return;
        }
        const xScale = getBrushXScale('current')(store.getState());
        const brushRange = event.selection || xScale.range();

        // Only about the main hydrograph when user is done adjusting the time range.
        if (event.sourceEvent.type === 'mouseup' || event.sourceEvent.type === 'touchend') {

            const adjustedBrush = brushRange.map(xScale.invert, xScale);

            store.dispatch(Actions.setIVGraphBrushOffset(
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
                    xAxis: getBrushXAxis,
                    layout: getBrushLayout
                })))
                .call(link(store, drawDataLines, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    tsLinesMap: getCurrentVariableLineSegments('current'),
                    xScale: getBrushXScale('current'),
                    yScale: getBrushYScale,
                    tsKey: () => 'current',
                    enableClip: () => false
                })));
        })
        .call(link(store, (svg, {layout, hydrographBrushOffset, xScale}) => {
            let selection;

            const graphBrush = brushX()
                .on('brush end', brushed);

            svg.select('.brush').remove();

            const group = svg.append('g').attr('class', 'brush')
                .attr('transform', `translate(${layout.margin.left},${layout.margin.top})`);

            graphBrush.extent([[0, 0], [layout.width - layout.margin.right, layout.height - layout.margin.bottom - layout.margin.top]]);

            // Creates the brush
            group.call(graphBrush);

            // Fill & round corners of brush handles
            svg.selectAll('.handle').classed('brush-handle-fill', true)
                .attr('rx', 15).attr('ry', 15);

            if (hydrographBrushOffset) {
                const [startMillis, endMillis] = xScale.domain();
                selection = [
                    xScale(startMillis + hydrographBrushOffset.start),
                    xScale(endMillis - hydrographBrushOffset.end)
                ];
            } else {
                selection = xScale.range();
            }
            if (selection[1] - selection[0] > 0) {
                graphBrush.move(group, selection);
            }

        }, createStructuredSelector({
            layout: getBrushLayout,
            hydrographBrushOffset: (state) => state.ivTimeSeriesState.ivGraphBrushOffset,
            xScale: getBrushXScale('current')
        })));
};