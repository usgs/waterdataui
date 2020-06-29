import {legendControl} from './legend-control';

describe('leaflet-rendering/legend-control', () => {
    let mapDiv;
    let map;
    const MAP_ID = 'test-map';

    beforeEach(() => {
        mapDiv = document.createElement('div');
        mapDiv.setAttribute('id', MAP_ID);
        document.body.appendChild(mapDiv);

        map = L.map(MAP_ID, {
            center: [0, 0],
            zoom: 1
        });
    });

    afterEach(() => {
        mapDiv.remove();
    });

    describe('Initializing legendControl', () => {
        it('expect to have an empty legend control with an expand button that is hidden by default', () => {
            const control = legendControl();
            map.addControl(control);

            const controlContainer = control.getContainer();
            const listContainer = control.getLegendListContainer();
            expect(controlContainer).toBeDefined();
            expect(listContainer).toBeDefined();
            expect(listContainer.hasChildNodes()).toBe(false);
            expect(listContainer.hasAttribute('hidden')).toBe(false);
            const expandButtonContainer = controlContainer.getElementsByClassName('legend-expand-container');
            expect(expandButtonContainer.length).toBe(1);
            expect(expandButtonContainer[0].hasAttribute('hidden')).toBe(true);
            expect(expandButtonContainer[0].getElementsByClassName('legend-expand').length).toBe(1);
        });

        it('expect to have an empty legend control without an expand button if addExpandButton option is false', () => {
            const control = legendControl({
                addExpandButton: false
            });

            map.addControl(control);

            const expandButtonContainer = mapDiv.getElementsByClassName('legend-expand-container');
            expect(expandButtonContainer.length).toBe(0);
        });
    });

    describe('showExpandButton', () => {
        let control;
        beforeEach(() => {
            control = legendControl();
            map.addControl(control);
        });

        it('Expect that calling showExpandButton with true shows the expand button', () => {
            control.showExpandButton(true);
            const expandButtonContainer = mapDiv.getElementsByClassName('legend-expand-container')[0];

            expect(expandButtonContainer.hasAttribute('hidden')).toBe(false);
        });

        it('Expect that calling showExpandButton with a second time with false hides the expand button', () => {
            control.showExpandButton(true);
            control.showExpandButton(false);
            const expandButtonContainer = mapDiv.getElementsByClassName('legend-expand-container')[0];

            expect(expandButtonContainer.hasAttribute('hidden')).toBe(true);
        });
    });

    describe('clicking the expand button', () => {
        let control;
        let listContainer;
        let expandButton;
        beforeEach(() => {
            control = legendControl();
            map.addControl(control);
            control.showExpandButton(true);

            listContainer = control.getLegendListContainer();
            expandButton = control.getContainer().getElementsByClassName('legend-expand')[0];
        });

        it('clicking the expand button hides the legend', () => {
            expandButton.click();

            expect(listContainer.hasAttribute('hidden')).toBe(true);
            expect(expandButton.title).toEqual('Show legend');
        });

        it('clicking the expand button a second time hides the legend', () => {
            expandButton.click();
            expandButton.click();

            expect(listContainer.hasAttribute('hidden')).toBe(false);
            expect(expandButton.title).toEqual('Hide legend');
        });
    });
});