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
    }
    else {
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
