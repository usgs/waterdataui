/**
 * Hydrograph charting module.
 */
import { bisector, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLog, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { line } from 'd3-shape';
import { timeDay } from 'd3-time';
import { timeFormat } from 'd3-time-format';


export default class Hydrograph {
    /**
     * @param {Array} data IV data as returned by models/getTimeseries
     * @param {String} title y-axis label
     * @param {Node} element Dom node to insert
     */
    constructor({data=[], title='Data', element=document.body}) {
        this._data = data;
        this._title = title;
        this._element = element;

        // Define width, height and margin for the SVG.
        // Use a fixed size, and scale to device width using CSS.
        this._width = 800;
        this._height = this._width / 2;
        this._margin = {
            top: 20,
            right: 75,
            bottom: 45,
            left: 50
        };

        if (this._data && this._data.length) {
            this._drawChart();
        } else {
            this._drawMessage('No data is available for this site.');
        }
    }

    _drawChart() {
        // Set up parent element and SVG
        this._element.innerHTML = '';
        const svg = select(this._element)
            .append('div')
            .attr('class', 'hydrograph-container')
            .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${this._width} ${this._height}`);

        // We'll actually be appending to a <g> element
        const plot = svg.append('g')
            .attr('transform', `translate(${this._margin.left},${this._margin.top})`);

        // Create x/y scaling for the full (100%) view.
        const {xScale, yScale} = this._createScales();

        // Draw the graph components with the given scaling.
        this._plotAxes(plot, xScale, yScale);
        this._plotDataLine(plot, xScale, yScale);
        this._plotTooltips(plot, xScale, yScale);
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

    _createScales() {
        // Calculate max and min for data
        const xExtent = extent(this._data, d => d.time);
        const yExtent = extent(this._data, d => d.value);

        // Add 20% of the y range as padding on both sides of the extent.
        let yPadding = 0.2 * (yExtent[1] - yExtent[0]);
        yExtent[0] -= yPadding;
        yExtent[1] += yPadding;

        const xScale = scaleTime()
            .range([0, this._width - this._margin.right])
            .domain(xExtent);

        const yScale = scaleLog()
            .nice()
            .range([this._height - (this._margin.top + this._margin.bottom), 0])
            .domain(yExtent);

        return {xScale, yScale};
    }

    _plotAxes(plot, xScale, yScale) {
        const m = this._margin;

        // Add x-axis
        const xAxis = axisBottom()
            .scale(xScale)
            .ticks(timeDay)
            .tickFormat(timeFormat('%b %d, %Y'))
            .tickSizeOuter(0);
        plot.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this._height - (m.top + m.bottom)})`)
            .call(xAxis);

        const tickCount = 5;
        const yDomain = yScale.domain();
        const tickSize = (yDomain[1] - yDomain[0]) / tickCount;

        // Add y-axis and a text label
        const yAxis = axisLeft()
            .scale(yScale)
            .tickValues(Array(tickCount).fill(0).map((_, index) => {
                return yDomain[0] + index * tickSize;
            }))
            .tickFormat(format('d'))
            .tickSizeInner(-this._width + m.right)
            .tickSizeOuter(0);
        plot.append('g')
            .attr('class', 'y-axis')
            .call(yAxis)
            .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', this._height / -2 + m.top)
                .attr('y', 6)
                .attr('dy', '0.71em')
                .text(this._title);
    }

    _plotDataLine(plot, xScale, yScale) {
        const newLine = line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.value));

        plot.append('path')
            .datum(this._data)
            .classed('line', true)
            .attr('d', newLine);
    }

    _plotTooltips(plot, xScale, yScale) {
        let bisectDate = bisector(d => d.time).left;

        let focus = plot.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('circle')
            .attr('r', 7.5);

        focus.append('text');

        let data = this._data;
        plot.append('rect')
            .attr('class', 'overlay')
            .attr('width', this._width)
            .attr('height', this._height)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', function () {
                let time = xScale.invert(mouse(this)[0]);
                let index = bisectDate(data, time, 1);

                let datum;
                let d0 = data[index - 1];
                let d1 = data[index];
                if (d0 && d1) {
                    datum = time - d0.time > d1.time - time ? d1 : d0;
                } else {
                    datum = d0 || d1;
                }

                focus.attr('transform', `translate(${xScale(datum.time)}, ${yScale(datum.value)})`);

                // Draw text, anchored to the left or right, depending on
                // which side of the graph the point is on.
                let isFirstHalf = index < data.length / 2;
                focus.select('text')
                    .text(() => datum.label)
                    .attr('text-anchor', isFirstHalf ? 'start' : 'end')
                    .attr('x', isFirstHalf ? 15 : -15)
                    .attr('dy', isFirstHalf ? '.31em' : '-.31em');
            });
    }
}
