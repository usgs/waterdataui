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