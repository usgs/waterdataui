import {select} from 'd3-selection';

import {drawInfoAlert, drawErrorAlert, drawSuccessAlert, drawWarningAlert} from './alerts';

fdescribe('alerts module', () => {
    let container;

    beforeEach(() => {
        container = select('body').append('div');
    });

    afterEach(()=> {
        container.remove();
    });

    describe('drawSuccessAlert', () => {
        it('Creates a success alert with title and body', () => {
            drawSuccessAlert(container, {
                title: 'This is a success',
                body: 'This is a success body'
            });

            expect(container.selectAll('.usa-alert--success').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('This is a success');
            expect(container.selectAll('p').text()).toBe('This is a success body');
        });

        it('Remove the previous alert and replaces with new title and body', () => {
            drawSuccessAlert(container, {
                title: 'This is a success',
                body: 'This is a success body'
            });
            drawSuccessAlert(container, {
                title: 'Another success',
                body: 'Another success body'
            });

            expect(container.selectAll('.usa-alert--success').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('Another success');
            expect(container.selectAll('p').text()).toBe('Another success body');
        });

        it('Removes the previous alert and does not replace it if title and body are null', () => {
            drawSuccessAlert(container, {
                title: 'This is a success',
                body: 'This is a success body'
            });
            drawSuccessAlert(container, {
                title: '',
                body: ''
            });
            expect(container.selectAll('.usa-alert--success').size()).toBe(0);
        });
    });
});