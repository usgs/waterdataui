const { scaleLinear, scaleTime } = require('d3-scale');
const { select } = require('d3-selection');

const { getNearestTime, createTooltip } = require('./tooltip');

describe('Hydrograph tooltip module', () => {

    let data = [12, 13, 14, 15, 16].map(hour => {
        return {
            time: new Date(`2018-01-03T${hour}:00:00.000Z`),
            label: 'label',
            value: hour
        };
    });

    describe('getNearestTime', () => {
        it('Return null if the length of the data array is less than two', function() {
            expect(getNearestTime([], data[0].time)).toBeNull();
            expect(getNearestTime([data[1]], data[0].time)).toBeNull();
        });

        it('return correct data points via getNearestTime' , () => {
            // Check each date with the given offset against the hourly-spaced
            // test data.
            function expectOffset(offset, side) {
                for (let [index, datum] of data.entries()) {
                    let expected;
                    if (side === 'left' || index === data.length - 1) {
                        expected = {datum, index};
                    } else {
                        expected = {datum: data[index + 1], index: index + 1};
                    }
                    let time = new Date(datum.time.getTime() + offset);
                    let returned = getNearestTime(data, time);

                    expect(returned.datum.time).toBe(expected.datum.time);
                    expect(returned.datum.index).toBe(expected.datum.index);
                }
            }

            let hour = 3600000;  // 1 hour in milliseconds

            // Check each date against an offset from itself.
            expectOffset(0, 'left');
            expectOffset(1, 'left');
            expectOffset(hour / 2 - 1, 'left');
            expectOffset(hour / 2, 'left');
            expectOffset(hour / 2 + 1, 'right');
            expectOffset(hour - 1, 'right');
        });
    });

    describe('createTooltip', () => {
        let svg;
        let xScale, yScale, compareXScale, currentTsData, compareTsData, isCompareVisible;
        beforeEach(() => {
            svg = select('body')
                .append('svg');

            xScale = scaleTime()
                .range([0, 100])
                .domain([data[0].time, data[4].time]);
            yScale = scaleLinear()
                .range([0, 100])
                .domain([12, 16]);
            let lastYearStart = new Date(data[0].time);
            let lastYearEnd = new Date(data[4].time);
            compareXScale = scaleTime()
                .range([0, 100])
                .domain([
                    lastYearStart.setFullYear(data[0].time.getFullYear() - 1),
                    lastYearEnd.setFullYear(data[4].time.getFullYear() - 1)
                ]
            );
            currentTsData = data;
            compareTsData = [12, 13, 14, 15, 16].map(hour => {
                return {
                    time: new Date(`2017-01-03T${hour}:00:00.000Z`),
                    label: 'label',
                    value: hour + 1
                };
            });
            isCompareVisible = false;

            createTooltip(svg, {xScale, yScale, compareXScale, currentTsData, compareTsData, isCompareVisible});
        });

        afterEach(() => {
            svg.remove();
        });

        it('Add tooltip elements', () => {
            expect(svg.selectAll('line').size()).toBe(1);
            expect(svg.selectAll('circle').size()).toBe(2);
            expect(svg.selectAll('text').size()).toBe(2);
            expect(svg.selectAll('.overlay').size()).toBe(1);
        });


    });
});
