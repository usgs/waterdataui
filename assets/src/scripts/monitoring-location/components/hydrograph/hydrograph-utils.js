
/*
* Local helper function that sorts between 'custom' (user defined)  and the default time period options
* @param {String} periodCode the time period code from the timespan radio buttons
* @return {Boolean} if the value is or is not a 'custom' (user defined) time period
* */
export const isPeriodCustom = function(periodCode) {
    return periodCode !== 'P7D' && periodCode !== 'P30D' && periodCode !== 'P1Y' ?  true : false;
};


/*
* Helper function that sorts between 'custom' (user defined)  and the default time period options
* There are two general categories of user selected time periods (noted as 'period' in the code) for display on the hydrograph.
* The first category contains time periods that are pre-defined in the application like 7 days, 30 days, and one year.
* The second category are 'custom' time periods defined by the user through use of a calender date picker or days in an input field.
* The 'period' information is passed in the URL as a parameter (such as &period=P1D). In the following line the period is
* parsed into a 'custom' (or not) category and then parts are used to set the checked radio buttons and form fields as needed
* @param {String} the time period code from the timespan radio buttons
* @return {Object} parsed period code values
* */
export const parsePeriodCode = function(periodCode) {
    const currentUserInputCustomTimeRangeSelectionButton = isPeriodCustom(periodCode) ? 'custom' : periodCode;
    const userInputNumberOfDays = periodCode !== null ? periodCode.slice(1,-1) : '';

    return {
        'currentUserInputCustomTimeRangeSelectionButton' : currentUserInputCustomTimeRangeSelectionButton,
        'userInputNumberOfDays': userInputNumberOfDays
    };
};