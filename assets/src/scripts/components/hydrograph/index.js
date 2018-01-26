/**
 * Hydrograph charting module.
 */
const { bisector } = require('d3-array');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');
const { timeFormat } = require('d3-time-format');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { getTimeseries, getSiteStatistics, parseRDB, readTS, parseMedianData } = require('../../models');

const { appendAxes, createAxes } = require('./axes');
const { createScales } = require('./scales');


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


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


class Hydrograph {
    /**
     * @param {Array} data IV data as returned by models/getTimeseries
     * @param {Array} calculated median for discharge
     * @param {String} yLabel y-axis label
     * @param {String} title for svg's title attribute
     * @param {String} desc for svg's desc attribute
     * @param {Node} element Dom node to insert
     */
    constructor({data=[], medianStats=[], yLabel='Data', title='', desc='', element}) {
        this._data = data;
        this._medianStats = medianStats;
        this._yLabel = yLabel;
        this._title = title;
        this._desc = desc;
        this._element = element;

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
            data: this._data.map((value) => {
                return [value.value, value.time];
            })
        });
        // We'll actually be appending to a <g> element
        const plot = svg.append('g')
            .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

        // Create x/y scaling for the full (100%) view.
        const {xScale, yScale} = createScales(
            this._data,
            WIDTH - MARGIN.right,
            HEIGHT - (MARGIN.top + MARGIN.bottom)
        );
        const {xAxis, yAxis} = createAxes(xScale, yScale, -WIDTH + MARGIN.right);

        // Draw the graph components with the given scaling.
        appendAxes({
            plot,
            xAxis,
            yAxis,
            xLoc: {x: 0, y: HEIGHT - (MARGIN.top + MARGIN.bottom)},
            yLoc: {x: 0, y: 0},
            yLabelLoc: {x: HEIGHT / -2 + MARGIN.top, y: -35},
            yTitle: this._yLabel
        });
        this._plotDataLine(plot, xScale, yScale);
        this._plotMedianPoints(plot, xScale, yScale);
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

    _plotDataLine(plot, xScale, yScale) {
        const newLine = line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.value));

        plot.append('path')
            .datum(this._data)
            .classed('line', true)
            .attr('d', newLine);
    }

    _plotMedianPoints(plot, xScale, yScale) {
        plot.selectAll('circle')
            .data(this._medianStats)
            .enter()
            .append('circle')
            .attr('r', '8px')
            .attr('fill', 'blue')
            .attr('cx', function(d) {
                return xScale(d.time);
            })
            .attr('cy', function(d) {
                return yScale(d.value);
            });
    }

    _plotTooltips(plot, xScale, yScale) {
        // Create a node to highlight the currently selected date/time.
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
                let time = xScale.invert(mouse(nodes[i])[0]);
                let {datum, index} = this._getNearestTime(time);

                // Move the focus node to this date/time.
                focus.attr('transform', `translate(${xScale(datum.time)}, ${yScale(datum.value)})`);

                // Draw text, anchored to the left or right, depending on
                // which side of the graph the point is on.
                let isFirstHalf = index < this._data.length / 2;
                focus.select('text')
                    .text(() => datum.label)
                    .attr('text-anchor', isFirstHalf ? 'start' : 'end')
                    .attr('x', isFirstHalf ? 15 : -15)
                    .attr('dy', isFirstHalf ? '.31em' : '-.31em');
            });
    }

    _getNearestTime(time) {
        let index = bisectDate(this._data, time, 1);

        let datum;
        let d0 = this._data[index - 1];
        let d1 = this._data[index];
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


function attachToNode(node, {siteno}) {
    let ts = getTimeseries({sites: [siteno]});
    let medianStats = getSiteStatistics({sites: [siteno]});
    Promise.all([ts, medianStats]).then(function(values) {
        let tsDataResp = values[0];
        let medianStatsResp = values[1];
        let series = readTS(tsDataResp);
        let medianStats = parseMedianData(parseRDB(medianStatsResp), series[0].values);
        let dataIsValid = series[0] && !series[0].values.some(d => d.value === -999999);
        new Hydrograph({
            element: node,
            data: dataIsValid ? series[0].values: [],
            medianStats: medianStats,
            yLabel: dataIsValid ? series[0].variableDescription : 'No data',
            title: dataIsValid ? series[0].variableName : '',
            desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
        });
    });
}

module.exports = {Hydrograph, attachToNode};
