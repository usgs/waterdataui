import {brushX, brushSelection} from 'd3-brush';
import { event } from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {appendXAxis} from '../../d3-rendering/axes';
import {link} from '../../lib/d3-redux';
import {Actions} from '../../store';

import {getBrushXAxis} from './axes';
import {currentVariableLineSegmentsSelector} from './drawing-data';
import {getBrushLayout} from './layout';
import {getBrushXScale, getBrushYScale} from './scales';
import {isVisibleSelector} from './time-series';
import {drawDataLines} from './time-series-data';

export const drawGraphBrush = function(container, store) {

    const brushed = function() {
        if (!event.sourceEvent || event.sourceEvent.type === 'zoom') {
            return;
        }
        const xScale = getBrushXScale('current')(store.getState());
        const brushRange = event.selection || xScale.range();

        // Only about the main hydrograph when user is done adjusting the time range.
        if (event.sourceEvent.type === 'mouseup' || event.sourceEvent.type === 'touchend') {
            store.dispatch(Actions.setHydrographXRange(brushRange.map(xScale.invert, xScale)));
        }
    };

    const graphBrush = brushX()
        .on('brush end', brushed);

    const div = container.append('div')
        .attr('class', 'hydrograph-container');
    div.append('svg')
        .classed('brush-svg', true)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .call(link(store,(elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.bottom}`);
                elem.attr('width', layout.width);
                elem.attr('height', layout.height);
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
                    tsLinesMap: currentVariableLineSegmentsSelector('current'),
                    xScale: getBrushXScale('current'),
                    yScale: getBrushYScale,
                    tsKey: () => 'current',
                    layout: getBrushLayout,
                    enableClip: () => false
                })));
        })
        .call(link(store, (svg, {layout, isHydrographXRange}) => {
            let selection;

            const brushElem = svg.select('.brush');
            if (isHydrographXRange && brushElem.size() !== 0) {
                selection = brushSelection(brushElem.node());
            }
            if (!selection) {
                selection = [0, layout.width - layout.margin.right];
            }
            brushElem.remove();

            const group = svg.append('g').attr('class', 'brush')
                .attr('transform', `translate(${layout.margin.left},${layout.margin.top})`);

            graphBrush.extent([[0, 0], [layout.width - layout.margin.right, layout.height - layout.margin.bottom]]);

            // Creates the brush
            group.call(graphBrush);

            // Fill & round corners of brush handles
            svg.selectAll('.handle').classed('brush-handle-fill', true)
                .attr('rx',15).attr('ry',15)

            graphBrush.move(group, selection);

        }, createStructuredSelector({
            layout: getBrushLayout,
            isHydrographXRange: (state) => state.ui.hydrographXRange !== undefined
        })));
};