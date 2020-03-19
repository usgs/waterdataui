import {DateTime, Interval} from 'luxon';

/*
 * Return ticks between startDateTime and endDateTime where the tick marks are interval apart and
 * start at startOffset
 * @param {DateTime} startDateTime
 * @param {DateTime} endDateTime
 * @param {Object} interval - a Luxon object that can be used in the .plus method to set the length between tick marks
 * @param {Object} startOffset - a Luxon object than can be used in the .plus method to set where the first tick mark begins
 * @return {Array of Number} - tick marks in milliseconds.
 */
const getTicks = function(startDateTime, endDateTime, interval, startOffset ) {
    let dateTime;
    const startOffsetKind = Object.keys(startOffset)[0];
    if (startOffsetKind === 'years') {
        dateTime = startDateTime.startOf('year');
    } else if (startOffsetKind === 'months') {
        dateTime = startDateTime.startOf('month');
    } else {
        dateTime = startDateTime.startOf('day');
    }
    dateTime = dateTime.plus(startOffset);

    let result = [];
    while (dateTime < endDateTime) {
        result.push(dateTime.toMillis());
        dateTime = dateTime.plus(interval);
    }
    return result;
};

/*
 * Returns an array of tickCount tick marks between startDate and endDate. The tick marks will
 * always start on unit where unit represents a string that can be used by the Luxon method .startOf.
 * @param {Number} startMillis in milliseconds
 * @param {Number} endMillis in milliseconds
 * @param {String} unit - string that can be used with the luxon method .startOf
 * @param {String} tickCount - the desired number of ticks
 * @param {String} ianaTimeZone - used when converting time in milliseconds to DateTime.
 * @return {Array of Number} - tick marks in milliseconds.
 */
const getDefaultTicks = function (startMillis, endMillis, unit, tickCount, ianaTimeZone) {
        const tickInterval = (endMillis - startMillis) / (tickCount + 1);
        const endDateTime = DateTime.fromMillis(endMillis, {zone: ianaTimeZone});
        let result = [];

        let dateTime = DateTime.fromMillis(startMillis + tickInterval, {zone: ianaTimeZone});
        while (dateTime < endDateTime) {
            let tickDateTime = dateTime.startOf(unit);
            result.push(tickDateTime.toMillis());
            dateTime = dateTime.plus(tickInterval);
        }

        return result;
    };

/**
 * Generate the values for ticks to place on a time series graph along with an appropriate format function
 * that can be used to produce a string representing the tick value. This should be used for time series that have
 * minute accuracy.
 *
 * @param startMillis - start datetime in the form of milliseconds since 1970-01-01 UTC
 * @param endMillis - end datetime in the form of milliseconds since 1970-01-01 UTC
 * @param ianaTimeZone - Internet Assigned Numbers Authority designation for a time zone
 * @returns {Object} with two properties, dates {Array of Number timestamp in milliseconds} and
 *      format {String} the format that should be used used to display the dates.
 */
export const generateTimeTicks = function(startMillis, endMillis, ianaTimeZone) {
    const startDateTime = DateTime.fromMillis(startMillis, {zone: ianaTimeZone});
    const endDateTime = DateTime.fromMillis(endMillis, {zone: ianaTimeZone});
    const length = Interval.fromDateTimes(startDateTime, endDateTime);
    const dayCount = length.count('days');
    const weekCount = length.count('weeks');
    const monthCount = length.count('months');
    const yearCount = length.count('years');

    /*
     * Returns a function that takes timeInMillis parameters and returns a string that using format to generate the string.
     */
    const formatFnc = (format) => {
        return function(timeInMillis)  {
            return DateTime.fromMillis(timeInMillis, {zone: ianaTimeZone}).toFormat(format);
        };
    };

    let result = {
        dates: [],
        format: null
    };

    if (length.count('hours') <= 4) {
        // Generates 4 ticks that are on the start of a minute
        result = {
            dates: getDefaultTicks(startMillis, endMillis, 'minute', 4, ianaTimeZone),
            format: formatFnc('MMM dd HH:mm')
        };
    } else if (dayCount <= 3) {
        // Generates 4 tick marks that are on the start of a hour
        result = {
            dates: getDefaultTicks(startMillis, endMillis,'hour', 4, ianaTimeZone),
            format: formatFnc('MMM dd HH:mm')
        };
    } else if (dayCount > 3 && dayCount <= 8) {
        // Tick marks every day
        result = {
            dates: getTicks(startDateTime, endDateTime,{days: 1}, {days: 1}),
            format: formatFnc('MMM dd')
        };

    } else if (dayCount > 8 && dayCount <= 15) {
        // Tick marks every other day
        result = {
            dates: getTicks(startDateTime, endDateTime,{days: 2}, {days: 1}),
            format: formatFnc('MMM dd')
        };
    } else if (dayCount > 15 && dayCount <= 29) {
        //Tick marks every fourth day
        result = {
            dates: getTicks(startDateTime, endDateTime,{days: 4}, {days: 1}),
            format: formatFnc('MMM dd')
        };
    } else if (weekCount > 4 && weekCount <= 8) {
        //Tick marks every week
        result = {
            dates: getTicks(startDateTime, endDateTime,{weeks: 1}, {days: 3}),
            format: formatFnc('MMM dd')
        };
    } else if (weekCount > 8 && weekCount <= 15) {
        // Tick marks every other week
        result = {
            dates: getTicks(startDateTime, endDateTime,{weeks: 2}, {days: 7}),
            format: formatFnc('MMM dd')
        };
    } else if (weekCount > 15 && monthCount <= 8) {
        //Tick marks every month
        result = {
            dates: getTicks(startDateTime, endDateTime,{months: 1}, {months : 1}),
            format: formatFnc('MMM yyyy')
        };
    } else if (monthCount > 8 && monthCount <= 15) {
        //Tick marks every other month
        result = {
            dates: getTicks(startDateTime, endDateTime,{months: 2}, {months: 1}),
            format: formatFnc('MMM yyyy')
        };
    } else if (monthCount > 15 && monthCount <= 29){
        // Tick marks every 4 months
        result = {
            dates: getTicks(startDateTime, endDateTime,{months: 4}, {months: 2}),
            format: formatFnc('MMM yyyy')
        };
    } else if (monthCount > 29 && monthCount <= 43) {
        // Tick marks every 6 months
        result = {
            dates: getTicks(startDateTime, endDateTime,{months: 6}, {months: 3}),
            format: formatFnc('MMM yyyy')
        };
    } else if (monthCount > 43 && yearCount <= 8) {
        // Tick marks every year
        result = {
            dates: getTicks(startDateTime, endDateTime,{years: 1}, {years: 1}),
            format: formatFnc('yyyy')
        };
    } else {
        // Generate 7 tick marks and put them at the beginning of the year of that date.
        result = {
            dates: getDefaultTicks(startMillis, endMillis, 'year', 7, ianaTimeZone),
            format: formatFnc('yyyy')
        };
    }

    return result;
};