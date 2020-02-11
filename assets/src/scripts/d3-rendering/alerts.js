
/*
 * Remove existing alert in elem if any, then render an alert of kind with the title and body.
 * If title and body are null strings nothing will be rendered.
 * @param {D3 selection} elem
 * @param {String} kind - should be 'success', 'warning', 'error', or 'info'
 * @param {String} title
 * @param {String} body
 */
const drawAlert = function(elem, {kind, title, body}) {
    elem.select('.usa-alert').remove();
    if (title || body) {
        const alertDiv = elem.append('div')
            .attr('class', `usa-alert usa-alert--${kind}`);
        const alertBody = alertDiv.append('div')
            .attr('class', 'usa-alert__body');
        if (title) {
            alertBody.append('h3')
                .attr('class', 'usa-alert__heading')
                .text(title);
        }
        if (body) {
            alertBody.append('p')
                .attr('class', 'usa-alert__text')
                .text(body);
        }
    }
};

/*
 * Remove existing alert in elem if any, then render success alert with the title and body.
 * If title and body are null strings nothing will be rendered.
 * @param {D3 selection} elem
 * @param {String} title
 * @param {String} body
 */
export const drawSuccessAlert = function(elem, {title, body}) {
    drawAlert(elem, {
        kind:'success',
        title,
        body
    });
};

/*
 * Remove existing alert in elem if any, then render info alert with the title and body.
 * If title and body are null strings nothing will be rendered.
 * @param {D3 selection} elem
 * @param {String} title
 * @param {String} body
 */
export const drawInfoAlert = function(elem, {title, body}) {
    drawAlert(elem, {
        kind: 'info',
        title,
        body
    });
};

/*
 * Remove existing alert in elem if any, then render warning alert with the title and body.
 * If title and body are null strings nothing will be rendered.
 * @param {D3 selection} elem
 * @param {String} title
 * @param {String} body
 */
export const drawWarningAlert = function(elem, {title, body}) {
    drawAlert(elem, {
        kind: 'warning',
        title,
        body
    });
};

/*
 * Remove existing alert in elem if any, then render error alert with the title and body.
 * If title and body are null strings nothing will be rendered.
 * @param {D3 selection} elem
 * @param {String} title
 * @param {String} body
 */
export const drawErrorAlert = function(elem, {title, body}) {
    drawAlert(elem, {
        kind: 'error',
        title,
        body
    });
};