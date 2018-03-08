const { select } = require('d3-selection');

const { attachToNode } = require('./map');

describe('map module', () => {
    let mapNode;

    beforeEach(() => {
        select('body')
            .append('div')
                .attr('id', 'map');
        mapNode = document.getElementById('map');
    });

    afterEach(() => {
        select('#map').remove();
    });
});