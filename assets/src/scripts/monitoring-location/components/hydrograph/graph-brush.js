import {brushX} from 'd3-brush';
import {event} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {appendXAxis} from '../../../d3-rendering/axes';
import {link} from '../../../lib/d3-redux';
import {Actions} from '../../store/instantaneous-value-time-series-state';

import {getBrushXAxis} from './selectors/axes';
import {getCurrentVariableLineSegments} from './selectors/drawing-data';
import {getBrushLayout} from './selectors/layout';
import {getBrushXScale, getBrushYScale} from './selectors/scales';
import {isVisible} from './selectors/time-series-data';
import {drawDataLines} from './time-series-lines';

export const drawGraphBrush = function(container, store) {
    const brushed = function(customHandle, height) {
        const selection = event.selection;
        if (selection == null) {
            customHandle.attr('display', 'none');
        } else {
            customHandle.attr('display', null).attr('transform', function(d, i) { return 'translate(' + [selection[i], - height / 4] + ')'; });
        }
        
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
                    visible: isVisible('current'),
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
                .extent([[0, 0], [layout.width - layout.margin.right, layout.height - layout.margin.bottom - layout.margin.top]]);                
            
            const group = svg.append('g').attr('class', 'brush')
                .attr('transform', `translate(${layout.margin.left},${layout.margin.top})`)
                .call(graphBrush);
            
            const brushResizePath = function(d) {
                let e = +(d.type == 'e'),
                    x = e ? 1 : -1,
                    y = layout.height / 2;
                return 'M' + (.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8);
            };
            
            const customHandle = group.selectAll('.handle--custom')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('path')
                .attr('class', 'handle--custom')
                .attr('stroke', '#000')
                .attr('cursor', 'ew-resize')
                .attr('d', brushResizePath);
            
            graphBrush.on('brush end', brushed(customHandle, layout.height));


            svg.select('.brush').remove();


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