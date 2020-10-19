import {queryWeatherService} from 'ui/web-services/models';

/*
 * Synchronous Redux action to update the IANA time zone
 * @param {String} timeZone
 * @return {Object} Redux action
 */
const setIanaTimeZone = function(timeZone) {
    return {
        type: 'SET_IANA_TIME_ZONE',
        timeZone
    };
};

/*
 * Asynchronous Redux action to fetch the time zone using the site's location
 * @param {String} latitude
 * @param {String} longitude
 * @return {Function} which returns a promise which resolves when the fetch is completed
 */
const retrieveIanaTimeZone = function(latitude, longitude) {
    return function(dispatch) {
        return queryWeatherService(latitude, longitude).then(
            resp => {
                const tzIANA = resp.properties.timeZone || null; // set to time zone to null if unavailable
                dispatch(setIanaTimeZone(tzIANA));
            },
            () => {
                dispatch(setIanaTimeZone(null));
            }
        );
    };
};

export const timeZoneReducer = function(ianaTimeZone='', action) {
    switch (action.type) {
        case 'SET_IANA_TIME_ZONE':
            return action.timeZone;
        default:
            return ianaTimeZone;
    }
};

export const Actions = {
    setIanaTimeZone,
    retrieveIanaTimeZone
};