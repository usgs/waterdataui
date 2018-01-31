/**
 * Hydrograph charting module.
 */
const { bisector, extent, min, max, range } = require('d3-array');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');
const { timeFormat } = require('d3-time-format');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { getTimeseries, getPreviousYearTimeseries, getMedianStatistics, parseMedianData } = require('../../models');
const { unicodeHtmlEntity, getHtmlFromString } = require('../../utils');

const { appendAxes, updateYAxis, createAxes } = require('./axes');
const { createScales, createXScale, updateYScale } = require('./scales');


// Define width, height and margin for the SVG.
// Use a fixed size, and scale to device width using CSS.
const WIDTH = 800;
const HEIGHT = WIDTH / 2;

const ASPECT_RATIO_PERCENT = `${100 * HEIGHT / WIDTH}%`;
const MARGIN = {
    top: 20,
    right: 75,
    bottom: 50,
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
        this._yLabel = yLabel;
        this._title = title;
        this._desc = desc;
        this._element = element;
        this._tsData = {};
        this._medianStatsData = medianStats;

        if (data && data.length) {
            this._tsData.current = data;
            this._drawChart();
        } else {
            this._drawMessage('No data is available for this site.');
        }
    }

    /**
     * Add a new time series to the Hydrograph. The time series is assumed to be
     * data that is over the same date range in a different year.
     * @param {Array} data - IV data as returned by models.getTimeseires
     */
    addCompareTimeSeries(data) {
        //Save data - will be needed in order to implement the tooltips
        this._tsData.compare = data;

        // Update the yScale by determining the new extent
        const currentYExtent = extent(this._tsData.current.concat(this._medianStatsData), d => d.value);
        const yExtent = extent(data, d => d.value);
        const yDataExtent = [min([yExtent[0], currentYExtent[0]]), max([yExtent[1], currentYExtent[1]])];
        updateYScale(this.scale.yScale, yDataExtent);

        // Create a x scale for the new data
        const xScale = createXScale(data, WIDTH - MARGIN.right);

        // Update the yAxis
        updateYAxis(this.axis.yAxis, this.scale.yScale);
        this.svg.select('.y-axis')
            .call(this.axis.yAxis);

        //Update the current ts line
        select('#ts-current')
            .attr('d', this.currentLine(this._tsData.current));

        //remove the median stats plot and recreate
        this.svg.selectAll('#median-point').remove();
        this.svg.selectAll('#median-text').remove();
        this._plotMedianPoints();

        // Add the new time series
        this._plotDataLine(this.plot, {xScale: xScale, yScale: this.scale.yScale}, 'compare');
    }

    /**
     * Remove the compare time series from the plot and rescale
     */
    removeCompareTimeSeries() {
        // Remove the compare time series
        this.svg.select('#ts-compare').remove();
        this.svg.select('.x-top-axis').remove();

        delete this._tsData.compare;

        // Update the y scale and  redraw the axis
        const currentYExtent = extent(this._tsData.current.concat(this._medianStatsData), d => d.value);
        updateYScale(this.scale.yScale, currentYExtent);
        updateYAxis(this.axis.yAxis, this.scale.yScale);
        this.svg.select('.y-axis')
            .call(this.axis.yAxis);

        //Redraw the current ts
        select('#ts-current')
            .attr('d', this.currentLine(this._tsData.current));
        //remove the median stats plot and recreate
        this.svg.selectAll('#median-point').remove();
        this.svg.selectAll('#median-text').remove();
        this._plotMedianPoints();
    }

    _drawChart() {
        // Set up parent element and SVG
        this.svg = select(this._element)
            .append('div')
            .attr('class', 'hydrograph-container')
            .style('padding-bottom', ASPECT_RATIO_PERCENT)
            .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

        addSVGAccessibility({
            svg: this.svg,
            title: this._title,
            description: this._desc,
            isInteractive: true
        });

        addSROnlyTable({
            container: this._element,
            columnNames: [this._title, 'Time'],
            data: this._tsData.current.map((value) => {
                return [value.value, value.time];
            })
        });
        // We'll actually be appending to a <g> element
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

        // Create x/y scaling for the full (100%) view.
        this.scale = createScales(
            this._tsData.current.concat(this._medianStatsData),
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
        this.currentLine = this._plotDataLine(this.plot, this.scale, 'current');
        this.medianPoints = this._plotMedianPoints();
        this._plotTooltips(this.plot, this.scale, 'current');
        this._plotLegend();
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
        let tsLine = line()
            .x(d => scale.xScale(d.time))
            .y(d => scale.yScale(d.value));

        plot.append('path')
            .datum(this._tsData[tsDataKey])
            .classed('line', true)
            .attr('id', 'ts-' + tsDataKey)
            .attr('d', tsLine);
        return tsLine;
    }

    _plotMedianPoints() {
        let xscale = this.scale.xScale;
        let yscale = this.scale.yScale;
        this.plot.selectAll('medianPoint')
            .data(this._medianStatsData)
            .enter()
            .append('circle')
            .attr('id', 'median-point')
            .attr('x', function(d) {
                return xscale(d.time);
            })
            .attr('y', function(d) {
                return yscale(d.value);
            })
            .attr('cx', function(d) {
                return xscale(d.time);
            })
            .attr('cy', function(d) {
                return yscale(d.value);
            });

        this.plot.selectAll('medianPointText')
            .data(this._medianStatsData)
            .enter()
            .append('text')
            .text(function(d) {
                return d.label;
            })
            .attr('id', 'median-text')
            .attr('x', function(d) {
                return xscale(d.time) + 5;
            })
            .attr('y', function(d) {
                return yscale(d.value);
            });
    }

    _plotLegend() {

        let legend = this.svg.selectAll('.legend')
            .data([0])
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(50, ${HEIGHT-15})`);

        let legendGroup1 = legend.append('g');

        let compareMarker = legendGroup1.append('line')
            .attr('id', 'ts-compare')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', -4)
            .attr('y2', -4)
            .style("stroke", "black");

        let compareMarkerWidth = compareMarker.node().getBBox().width;

        legendGroup1.append('text')
            .attr('x', compareMarkerWidth + 5)
            .attr('y', 0)
            .text('Previous Year');

        let legendGroup1Box = legendGroup1.node().getBBox();

        let legendGroup2 = legend.append('g');

        let circleMarker = legendGroup2.append('circle')
            .attr('r', '4px')
            .attr('x', legendGroup1Box.x + legendGroup1Box.width + 40)
            .attr('y', -4)
            .attr('cx', legendGroup1Box.x + legendGroup1Box.width + 40)
            .attr('cy', -4)
            .attr('fill', '#f96713');

        let circleMarkerBox = circleMarker.node().getBBox();

        legendGroup2.append('text')
            .attr('x', circleMarkerBox.x + circleMarkerBox.width + 10)
            .attr('y', 0)
            .text('Median Discharge');

        let legendGroup2Box= legendGroup2.node().getBBox();

        let legendGroup3 = legend.append('g');

        let tsMarker = legendGroup3.append('line')
            .attr('class', 'line')
            .attr('x1', legendGroup2Box.x + legendGroup2Box.width + 40)
            .attr('x2', legendGroup2Box.x + legendGroup2Box.width + 60)
            .attr('y1', -4)
            .attr('y2', -4)
            .style("stroke", "#02274B");

        let tsMarkerBox = tsMarker.node().getBBox();

        legendGroup3.append('text')
            .attr('x', tsMarkerBox.x + tsMarkerBox.width + 10)
            .attr('y', 0)
            .text('Current Year');

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
                let isFirstHalf = index < this._tsData[tsDataKey].length / 2;
                focus.select('text')
                    .text(() => datum.label)
                    .attr('text-anchor', isFirstHalf ? 'start' : 'end')
                    .attr('x', isFirstHalf ? 15 : -15)
                    .attr('dy', isFirstHalf ? '.31em' : '-.31em');
            });
    }

    _getNearestTime(time, tsDataKey) {
        let index = bisectDate(this._tsData[tsDataKey], time, 1);

        let datum;
        let d0 = this._tsData[tsDataKey][index - 1];
        let d1 = this._tsData[tsDataKey][index];
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
    let hydrograph;
    let getLastYearTS;
    let timeSeries = getTimeseries({sites: [siteno]});
    let medianStatistics = getMedianStatistics({sites: [siteno]});
    Promise.all([timeSeries, medianStatistics]).then((data) => {
        let series = data[0];
        let unit = series[0].variableName.split(' ').pop();
        let htmlEntities = getHtmlFromString(unit);
        if (htmlEntities !== null) {
            for (let htmlEntity of htmlEntities) {
                let unicodeEntity = unicodeHtmlEntity(htmlEntity);
                unit = unit.replace(htmlEntity, unicodeEntity);
            }
        }
        let stats = data[1];
        let seriesStartDate = series[0].seriesStartDate;
        let seriesEndDate = series[0].seriesEndDate;
        let plotableStats = parseMedianData(stats, seriesStartDate, seriesEndDate, unit);
        let dataIsValid = series && series[0] &&
            !series[0].values.some(d => d.value === -999999);
        hydrograph = new Hydrograph({
            element: node,
            data: dataIsValid ? series[0].values : [],
            medianStats: plotableStats,
            yLabel: dataIsValid ? series[0].variableDescription : 'No data',
            title: dataIsValid ? series[0].variableName : '',
            desc: dataIsValid ? series[0].variableDescription + ' from ' +
                formatTime(series[0].seriesStartDate) + ' to ' +
                formatTime(series[0].seriesEndDate) : ''
        });
        if (dataIsValid) {
            getLastYearTS = getPreviousYearTimeseries({
                site: node.dataset.siteno,
                startTime: seriesStartDate,
                endTime: seriesEndDate
            });
        }
    }, () => {
        hydrograph = new Hydrograph({
            element: node,
            data: []
        })
    });
    let lastYearInput = node.getElementsByClassName('hydrograph-last-year-input');
    if (lastYearInput.length > 0) {
        lastYearInput[0].addEventListener('change', (evt) => {
            if (evt.target.checked) {
                getLastYearTS.then((series) => {
                    hydrograph.addCompareTimeSeries(series[0].values);
                });
            } else {
                hydrograph.removeCompareTimeSeries();
            }
        });
    }
}

module.exports = {Hydrograph, attachToNode};
