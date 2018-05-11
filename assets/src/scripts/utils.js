const { select } = require('d3-selection');
const { DateTime } = require('luxon');

/**
 * Determine the unicode variant of an HTML decimal entity
 *
 * @param someString
 * @returns {string}
 */
export function unicodeHtmlEntity(someString) {
    let numericValue = parseInt(someString.slice(2, -1), 10);
    if (numericValue) {
        return String.fromCharCode(numericValue);
    } else {
        return '';
    }
}

/**
 * Determine if a string contains an HTML decimal entity
 *
 * @param someString
 * @returns {array} or {null}
 */
export function getHtmlFromString(someString) {
    let re = /&(?:[a-z]+|#\d+);/g;
    return someString.match(re);
}

/**
 * Replace html entities with unicode entities
 *
 * @param someString
 * @returns {*}
 */
export function replaceHtmlEntities(someString) {
    let entities = getHtmlFromString(someString);
    if (entities) {
        for (let entity of entities) {
            let unicodeEntity = unicodeHtmlEntity(entity);
            someString = someString.replace(entity, unicodeEntity);
        }
    }
    return someString;
}

/**
 * Calculate the difference in days between two Date objects
 *
 * @param date1
 * @param date2
 * @returns {number}
 */
export function deltaDays(date1, date2) {
    let one_day_ms = 24*60*60*1000;
    let date1_ms = date1.getTime();
    let date2_ms = date2.getTime();

    let delta_ms = date2_ms - date1_ms;

    return Math.round(delta_ms/one_day_ms);
}

/**
 * Determine if two sets are equal
 *
 * @param set1
 * @param set2
 * @returns {boolean}
 */
export function setEquality(set1, set2) {
    let sizeEqual = set1.size === set2.size;
    let itemsEqual = [...set1].every(x => {
        return set2.has(x);
    });
    return sizeEqual && itemsEqual;
}


const TEXT_WRAP_LINE_HEIGHT = 1.1;  // ems
//const TEXT_WRAP_BREAK_CHARS = ['/', '&', '-'];
const TEXT_WRAP_BREAK_CHARS = [];

/**
 * Wrap long svg text labels into multiple lines.
 * Based on: https://bl.ocks.org/ericsoco/647db6ebadd4f4756cae
 * @param  {String} text
 * @param  {Number} width
 */
export function wrap(text, width, break_chars=TEXT_WRAP_BREAK_CHARS) {
    text.each(function () {
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
        for (const word of textContent.split(/\s+/)) {
            // Add this word to the line
            line.push(word);
            tspan.text(line.join(' '));

            // If we exceeded the line width, remove the last word from the array
            // and append this tspan to the DOM node.
            if (tspan.node().getComputedTextLength() > width) {
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
}

/**
 * This will execute the equivalent media query as the USWDS given a minWidth.
 * For example, this SASS:
 *     @media($medium-screen)
 * is equivalent to:
 *     mediaQuery(mediumScreenPx)
 * @param  {Number} minWidth
 * @return {Boolean} true if the media query is active at the given width
 */
export const mediaQuery = function (minWidth) {
    return window.matchMedia(`screen and (min-width: ${minWidth}px)`).matches;
};

/**
 * Calculate the start time of a time range based on a time-delta string and the end time
 *
 * @param period -- ISO duration for date range of the time series
 * @param endTime -- the end time
 * @param ianaTimeZone -- Internet Assigned Numbers Authority designation for a time zone
 * @returns {int}
 */
export const calcStartTime = function (period, endTime, ianaTimeZone) {
    let startTime = new DateTime.fromMillis(endTime, {zone: ianaTimeZone});
    switch (period) {
        case 'P7D':
            startTime = startTime.minus({days: 7});
            break;
        case 'P30D':
            startTime = startTime.minus({days: 30});
            break;
        case 'P1Y':
            startTime = startTime.minus({years: 1});
            break;
        default:
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
export const callIf = function (condition, func) {
    return function (...args) {
        if (condition) {
            func(...args);
        }
    };
};
