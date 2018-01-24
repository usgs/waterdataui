/**
 * Hydrograph charting module.
 */
const { bisector, extent, min, max } = require('d3-array');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');

const { appendAxes, createAxes } = require('./axes');
const { createScales } = require('./scales');
const { addSVGAccessibility , addSROnlyTable } = require('../accessibility');


// Define width, height and margin for the SVG.
// Use a fixed size, and scale to device width using CSS.
const WIDTH = 800;
const HEIGHT = WIDTH / 2;
const ASPECT_RATIO_PERCENT = `${100 * HEIGHT / WIDTH}%`;
const MARGIN = {
    top: 20,
    right: 75,
    bottom: 45,
    left: 50
};


// Function that returns the left bounding point for a given chart point.
const bisectDate = bisector(d => d.time).left;

class Hydrograph {
    /**
     * @param {Array} data IV data as returned by models/getTimeseries
     * @param {String} yLabel y-axis label
     * @param {String} title for svg's title attribute
     * @param {String} desc for svg's desc attribute
     * @param {Node} element Dom node to insert
     */
    constructor({data=[], yLabel='Data', title='', desc='', element}) {
        this._yLabel = yLabel;
        this._title = title;
        this._desc = desc;
        this._element = element;
        this.scale;
        this.axis;
        this.tsData = {};

        if (data && data.length) {
            this.tsData.current = data;
            this._drawChart();
        } else {
            this._drawMessage('No data is available for this site.');
        }
    }

    addTimeSeries({data, legendLabel}) {
        this.tsData[legendLabel] = data;
        const yExtent = extent(data, d => d.value);
        const currentYDomain = this.scale.yScale.domain();
        this.scale.yScale.domain([min([yExtent[0], currentYDomain[0]]), max([yExtent[1], currentYDomain[1]])])
        const {xScale, yScale } = createScales(data,
            WIDTH - MARGIN.right,
            HEIGHT - (MARGIN.top + MARGIN.bottom));
        const newLine = line()
            .x(d => xScale(d.time))
            .y(d => this.scale.yScale(d.value));

        this.plot.append('path')
            .datum(data)
            .classed('line', true)
            .attr('d', newLine);

        //Update the yaxis
        select('.y-axis')
            .call(this.axis.yAxis);

        //Update the current ts
        select('#ts-current')
            .attr('d', this.currentLine(this.tsData.current));
    }

    _drawChart() {
        // Set up parent element and SVG
        this._element.innerHTML = '';
        let svg = select(this._element)
            .append('div')
            .attr('class', 'hydrograph-container')
            .style('padding-bottom', ASPECT_RATIO_PERCENT)
            .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

        addSVGAccessibility({
            svg: svg,
            title: this._title,
            description: this._desc,
            isInteractive: true
        });

        addSROnlyTable({
            container: this._element,
            columnNames: [this._title, 'Time'],
            data: this.tsData.current.map((value) => {
                return [value.value, value.time];
            })
        });
        // We'll actually be appending to a <g> element
        this.plot = svg.append('g')
            .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

        // Create x/y scaling for the full (100%) view.
        this.scale = createScales(
            this.tsData.current,
            WIDTH - MARGIN.right,
            HEIGHT - (MARGIN.top + MARGIN.bottom)
        );
        this.axis = createAxes(this.scale.xScale, this.scale.yScale, -WIDTH + MARGIN.right);

        // Draw the graph components with the given scaling.
        appendAxes({
            plot: this.plot,
            xAxis: this.axis.xAxis,
            yAxis: this.axis.yAxis,
            xLoc: {x: 0, y: HEIGHT - (MARGIN.top + MARGIN.bottom)},
            yLoc: {x: 0, y: 0},
            yLabelLoc: {x: HEIGHT / -2 + MARGIN.top, y: -35},
            yTitle: this._yLabel
        });
        this._plotDataLine(this.plot, this.scale, 'current');
        this._plotTooltips(this.plot, this.scale, 'current');
    }

    _drawMessage(message) {
        // Set up parent element and SVG
        this._element.innerHTML = '';
        const alertBox = select(this._element)
            .append('div')
            .attr('class', 'usa-alert usa-alert-warning')
            .append('div')
            .attr('class', 'usa-alert-body');
        alertBox.append('h3')
            .attr('class', 'usa-alert-heading')
            .html('Hydrograph Alert');
        alertBox.append('p')
            .html(message);
    }

    _plotDataLine(plot, scale, tsDataKey) {
        this.currentLine = line()
            .x(d => scale.xScale(d.time))
            .y(d => scale.yScale(d.value));

        plot.append('path')
            .datum(this.tsData[tsDataKey])
            .classed('line', true)
            .attr('id', 'ts-' + tsDataKey)
            .attr('d', this.currentLine);
    }

    _plotTooltips(plot, scale, tsDataKey) {
        // Create a node to hightlight the currently selected date/time.
        let focus = plot.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('circle')
            .attr('r', 7.5);

        focus.append('text');

        plot.append('rect')
            .attr('class', 'overlay')
            .attr('width', WIDTH)
            .attr('height', HEIGHT)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', (d, i, nodes) => {
                // Get the nearest data point for the current mouse position.
                let time = scale.xScale.invert(mouse(nodes[i])[0]);
                let {datum, index} = this._getNearestTime(time, tsDataKey);

                // Move the focus node to this date/time.
                focus.attr('transform', `translate(${scale.xScale(datum.time)}, ${scale.yScale(datum.value)})`);

                // Draw text, anchored to the left or right, depending on
                // which side of the graph the point is on.
                let isFirstHalf = index < this.tsData[tsDataKey].length / 2;
                focus.select('text')
                    .text(() => datum.label)
                    .attr('text-anchor', isFirstHalf ? 'start' : 'end')
                    .attr('x', isFirstHalf ? 15 : -15)
                    .attr('dy', isFirstHalf ? '.31em' : '-.31em');
            });
    }

    _getNearestTime(time, tsDataKey) {
        let index = bisectDate(this.tsData[tsDataKey], time, 1);

        let datum;
        let d0 = this.tsData[tsDataKey][index - 1];
        let d1 = this.tsData[tsDataKey][index];
        if (d0 && d1) {
            datum = time - d0.time > d1.time - time ? d1 : d0;
        } else {
            datum = d0 || d1;
        }

        // Return the nearest data point and its index.
        return {
            datum,
            index: datum === d0 ? index - 1 : index
        };
    }
}


module.exports = Hydrograph;
