export const loadingIndicator = function(elem, {showLoadingIndicator, sizeClass}) {
    elem.select('.loading-indicator').remove();
    if (showLoadingIndicator) {
        elem.append('i')
            .attr('class', `loading-indicator fas ${sizeClass} fa-spin fa-spinner`);
    }
};