const { select } = require('d3-selection');

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

/**
 * Wrap long svg text labels into multiple lines.
 * From: https://bl.ocks.org/ericsoco/647db6ebadd4f4756cae
 * @param  {String} text
 * @param  {Number} width
 */
export function wrap(text, width) {
    text.each(function() {
        var breakChars = ['/', '&', '-'],
            text = select(this),
            textContent = text.text(),
            spanContent;

        breakChars.forEach(char => {
            // Add a space after each break char for the function to use to determine line breaks
            textContent = textContent.replace(char, char + ' ');
        });

        var words = textContent.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy') || 0),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

        /* eslint no-cond-assign: 0 */
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                spanContent = line.join(' ');
                breakChars.forEach(char => {
                    // Remove spaces trailing breakChars that were added above
                    spanContent = spanContent.replace(char + ' ', char);
                });
                tspan.text(spanContent);
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
        }
    });
}
