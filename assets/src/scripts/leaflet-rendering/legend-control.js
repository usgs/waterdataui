import config from '../config.js';
import {mediaQuery} from '../utils';

export const LegendControl = L.Control.extend({
    options: {
        position: 'bottomright',
        addExpandButton: true
    },

    initialize: function(options) {
        L.setOptions(this, options);
        L.Control.prototype.initialize.apply(this, options);
    },

    onAdd: function() {
        let container = L.DomUtil.create('div', 'legend');
        if (this.options.addExpandButton) {
            this.expandButtonContainer = L.DomUtil.create('div', 'legend-expand-container', container);
            this.expandButtonContainer.setAttribute('hidden', true);
            let buttonLabel = L.DomUtil.create('span', '', this.expandButtonContainer);
            buttonLabel.innerHTML = 'Legend';
            this.expandButton = L.DomUtil.create('button', 'legend-expand usa-button-secondary', this.expandButtonContainer);
            this.expandButton.innerHTML = '<i class="fas fa-compress"></i>';
            this.expandButton.title = 'Hide legend';
        }
        this.legendListContainer = L.DomUtil.create('div', 'legend-list-container', container);

        if (this.options.addExpandButton) {
            // Set up click handler for the expandButton
            L.DomEvent.on(this.expandButton, 'click', function () {
                if (this.expandButton.title === 'Hide legend') {
                    this.expandButton.innerHTML = '<i class="fas fa-expand"></i>';
                    this.expandButton.title = 'Show legend';
                    this.legendListContainer.setAttribute('hidden', true);
                } else {
                    this.expandButton.innerHTML = '<i class="fas fa-compress"></i>';
                    this.expandButton.title = 'Hide legend';
                    this.legendListContainer.removeAttribute('hidden');
                }
            }, this);
        }
        return container;
    },
    getLegendListContainer: function() {
        return this.legendListContainer;
    },
    showExpandButton: function(show) {
        if (show) {
            this.expandButtonContainer.removeAttribute('hidden');
        } else {
            this.expandButtonContainer.setAttribute('hidden', true);
        }
    },
    compressLegendOnSmallDevices: function() {
        this.showExpandButton(true);
        if (mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
            if (this.expandButton.title === 'Show legend') {
                this.expandButton.click();
            }
        } else {
            if (this.expandButton.title === 'Hide legend') {
                this.expandButton.click();
            }
        }
    }
});

export const legendControl = function(options) {
    return new LegendControl(options);
};
