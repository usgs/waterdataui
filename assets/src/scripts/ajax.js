// http://www.html5rocks.com/en/tutorials/es6/promises/

export const get = function (url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                if (window.ga) {
                    window.ga('send', 'event', 'serviceFailure', req.status, url);
                }
                reject(Error(`Failed with status ${req.status}: ${req.statusText}`));
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject(Error('Network Error'));
        };

        // Make the request
        req.send();
    });
};

export const sendAjaxRequest = function (url, payload=null, method='GET', headers) {
    return new Promise(function (resolve, reject) {
        const req = new XMLHttpRequest();
        req.open(method, url);

        Object.keys(headers).forEach(k => {
            req.setRequestHeader(k, headers[k]);
        });

        req.onload = function () {
            if (req.status === 200) {
                resolve(req.response);
            } else {
                if (window.ga) {
                    window.ga('send', 'event', 'serviceFailure', req.status, url);
                }
                reject(Error(`Failed with status ${req.status}: ${req.statusText}`));
            }
        };

        req.onerror = function() {
            reject(Error('Network Error'));
        };

        // Make the request
        req.send(payload);
    });
};

export const post = function (url, payload, headers) {
    return sendAjaxRequest(url, payload, 'POST', headers);
};

window.testGet = get;
window.testPost = post;
