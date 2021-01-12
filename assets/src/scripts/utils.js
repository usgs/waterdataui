import {bisector} from 'd3-array';
import {select} from 'd3-selection';
import {DateTime} from 'luxon';

/**
 * Determine the unicode variant of an HTML decimal entity
 *
 * @param someString
 * @returns {string}
 */
export const unicodeHtmlEntity = function(someString) {
    let numericValue = parseInt(someString.slice(2, -1), 10);
    if (numericValue) {
        return String.fromCharCode(numericValue);
    } else {
        return '';
    }
};

/**
 * Determine if a string contains an HTML decimal entity
 *
 * @param someString
 * @returns {array} or {null}
 */
export const getHtmlFromString = function(someString) {
    let re = /&(?:[a-z]+|#\d+);/g;
    return someString.match(re);
};

/**
 * Replace html entities with unicode entities
 *
 * @param someString
 * @returns {*}
 */
export const replaceHtmlEntities = function(someString) {
    let entities = getHtmlFromString(someString);
    if (entities) {
        for (let entity of entities) {
            let unicodeEntity = unicodeHtmlEntity(entity);
            someString = someString.replace(entity, unicodeEntity);
        }
    }
    return someString;
};

/**
 * Determine if two sets are equal
 *
 * @param set1
 * @param set2
 * @returns {boolean}
 */
export const setEquality = function(set1, set2) {
    let sizeEqual = set1.size === set2.size;
    let itemsEqual = Array.from(set1).every(x => {
        return set2.has(x);
    });
    return sizeEqual && itemsEqual;
};


const TEXT_WRAP_LINE_HEIGHT = 1.1;  // ems
//const TEXT_WRAP_BREAK_CHARS = ['/', '&', '-'];
const TEXT_WRAP_BREAK_CHARS = [];

/**
 * Wrap long svg text labels into multiple lines.
 * Based on: https://bl.ocks.org/ericsoco/647db6ebadd4f4756cae
 * @param  {D3 selection} text
 * @param  {Number} width
 * @param {Array of Strings} break_chars - these along with spaces are acceptable places to break on}
 */
export const wrap = function(text, width, break_chars=TEXT_WRAP_BREAK_CHARS) {
    text.each(function() {
        const elem = select(this);

        // To determine line breaks, add a space after each break character
        let textContent = elem.text();
        break_chars.forEach(char => {
            textContent = textContent.replace(char, char + ' ');
        });

        let x = elem.attr('x');
        let y = elem.attr('y');
        let dy = parseFloat(elem.attr('dy') || 0);

        let tspan = elem
            .text(null)
            .append('tspan')
                .attr('x', x)
                .attr('y', y)
                .attr('dy', dy + 'em');

        // Iteratively add each word to the line until we exceed the maximum width.
        let line = [];
        let lineCount = 0;
        const words = textContent.split(/\s+/);
        for (const word of words) {
            // Add this word to the line
            line.push(word);
            tspan.text(line.join(' '));

            // If we exceeded the line width, remove the last word from the array
            // and append this tspan to the DOM node.
            let tspanNode = tspan.node();
            if (tspanNode.getComputedTextLength() > width) {
                // Remove the last word and put it on the next line.
                line.pop();
                let spanContent = line.join(' ');
                line = [word];

                // Remove the spaces trailing break characters that were added above
                break_chars.forEach(char => {
                    spanContent = spanContent.replace(char + ' ', char);
                });

                // Insert this text as a tspan
                lineCount++;
                tspan.text(spanContent);
                tspan = elem
                    .append('tspan')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('dy', lineCount * TEXT_WRAP_LINE_HEIGHT + dy + 'em')
                        .text(word);
            }
        }
    });
};

/**
 * This will execute the equivalent media query as the USWDS given a minWidth.
 * For example, this SASS:
 *     @media($medium-screen)
 * is equivalent to:
 *     mediaQuery(mediumScreenPx)
 * @param  {Number} minWidth
 * @return {Boolean} true if the media query is active at the given width
 */
export const mediaQuery = function(minWidth) {
    return window.matchMedia(`screen and (min-width: ${minWidth}px)`).matches;
};

/**
 * Calculate the start time of a time range based on a time-delta string and the end time
 *
 * @param {String} period -- ISO duration for date range of the time series - which has the form of something like
 * P7D in which the 'P' stands for 'period', the '7' is units in the period, and 'D' is the type of unit
 * in this case 'Days.' There are only two unit types here, 'Days' or 'Years'
 * @param {Number} endTime -- the end time as universal time
 * @param {String} ianaTimeZone -- Internet Assigned Numbers Authority designation for a time zone
 * @returns {Number} the start time as universal time
 */
export const calcStartTime = function(period, endTime, ianaTimeZone) {
    const timePeriodCode = period !== null ? period.substr(period.length - 1) : null;
    const timePeriod = period !== null ? period.slice(1,-1) : null;
    const hoursInOneYear = 8760;

    let startTime = DateTime.fromMillis(endTime, {zone: ianaTimeZone});

    if (timePeriodCode === 'D') {
        startTime = startTime.minus({days: timePeriod});
    } else if (timePeriodCode === 'Y') {
        startTime = startTime.minus({hours: hoursInOneYear * timePeriod});
    } else {
        console.log('No known period specified');
    }

    return startTime.valueOf();
};

/**
 * Returns a function that will be a no-op if a condition is false.
 * Use to insert conditionals into declarative-style D3-chained method calls.
 * @param  {Boolean} condition If true, will run `func`
 * @param  {Function} func
 */
export const callIf = function(condition, func) {
    return function(...args) {
        if (condition) {
            func(...args);
        }
    };
};

/**
 * Function to parse RDB to Objects
 * @param {String} rdbData - containing RDB data
 * @returns {Array of Objects} - one for each data line in the RDB.
 */
export const parseRDB = function(rdbData) {
    const rdbLines = rdbData.split('\n');
    let dataLines = rdbLines.filter(rdbLine => rdbLine[0] !== '#').filter(rdbLine => rdbLine.length > 0);
    // remove the useless row
    dataLines.splice(1, 1);
    let recordData = [];
    if (dataLines.length > 0) {
        let headers = dataLines.shift().split('\t');
        for (let dataLine of dataLines) {
            let data = dataLine.split('\t');
            let dataObject = {};
            for (let i=0; i < headers.length; i++) {
                dataObject[headers[i]] = data[i];
            }
            recordData.push(dataObject);
        }
    }
    return recordData;
};

/*
 * Convert a temperature measurement in fahrenheit to celsius.
 * @param {Number} fahrenheit
 * @returns {Number} measurement in celsius
 */
export const convertFahrenheitToCelsius = function(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
};

/*
 * Convert a temperature measurement in celsius to fahrenheit.
 * @param {Number} celsius
 * @returns {Number} measurement in fahrenheit
 */
export const convertCelsiusToFahrenheit = function(celsius) {
    return celsius * 9/5 + 32;
};

/*
 * Return the variables sorted with the ones we care about first
 * @param {Array of variable Object}
 * @return {Array of variable Object}
 */
export const sortedParameters = function(variables) {
    const PARAM_PERTINENCE = {
        '00065': 0,
        '00060': 1,
        '72019': 2
    };
    const dataVars = variables ? Object.values(variables) : [];
    const pertinentParmCds = Object.keys(PARAM_PERTINENCE);
    const highPertinenceVars = dataVars.filter(x => pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aPertinence = PARAM_PERTINENCE[a.variableCode.value];
            const bPertinence = PARAM_PERTINENCE[b.variableCode.value];
            if (aPertinence < bPertinence) {
                return -1;
            } else {
                return 1;
            }
        });
    const lowPertinenceVars = dataVars.filter(x => !pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aDesc = a.variableDescription.toLowerCase();
            const bDesc = b.variableDescription.toLowerCase();
            if (aDesc < bDesc) {
                return -1;
            } else {
                return 1;
            }
        });
    return highPertinenceVars.concat(lowPertinenceVars);
};

/*
 * Return the data point nearest to time and its index.
 * @param {Array} data - array of Object where one of the keys is dateTime in Unix epoch.
 * @param {Date} time
 * @return {Object} - datum
 */
export const getNearestTime = function(data, time) {
    // Function that returns the left bounding point for a given chart point.
    if (data.length === 0) {
        return null;
    }
    const bisectDate = bisector(d => d.dateTime).left;
    let index = bisectDate(data, time, 1);
    let datum;
    let d0 = data[index - 1];
    let d1 = data[index];

    if (d0 && d1) {
        datum = time - d0.dateTime > d1.dateTime - time ? d1 : d0;
    } else {
        datum = d0 || d1;
    }

    // Return the nearest data point and its index.
    return datum;
};
