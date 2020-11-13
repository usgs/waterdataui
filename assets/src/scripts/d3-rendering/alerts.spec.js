import {select} from 'd3-selection';

import {drawInfoAlert, drawErrorAlert, drawSuccessAlert, drawWarningAlert} from 'd3render/alerts';

describe('alerts module', () => {
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

    describe('drawInfoAlert', () => {
        it('Creates a info alert with title and body', () => {
            drawInfoAlert(container, {
                title: 'This is a info',
                body: 'This is a info body'
            });

            expect(container.selectAll('.usa-alert--info').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('This is a info');
            expect(container.selectAll('p').text()).toBe('This is a info body');
        });

        it('Remove the previous alert and replaces with new title and body', () => {
            drawInfoAlert(container, {
                title: 'This is a info',
                body: 'This is a info body'
            });
            drawInfoAlert(container, {
                title: 'Another info',
                body: 'Another info body'
            });

            expect(container.selectAll('.usa-alert--info').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('Another info');
            expect(container.selectAll('p').text()).toBe('Another info body');
        });

        it('Removes the previous alert and does not replace it if title and body are null', () => {
            drawInfoAlert(container, {
                title: 'This is a info',
                body: 'This is a info body'
            });
            drawInfoAlert(container, {
                title: '',
                body: ''
            });
            expect(container.selectAll('.usa-alert--info').size()).toBe(0);
        });
    });

    describe('drawWarningAlert', () => {
        it('Creates a warning alert with title and body', () => {
            drawWarningAlert(container, {
                title: 'This is a warning',
                body: 'This is a warning body'
            });

            expect(container.selectAll('.usa-alert--warning').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('This is a warning');
            expect(container.selectAll('p').text()).toBe('This is a warning body');
        });

        it('Remove the previous alert and replaces with new title and body', () => {
            drawWarningAlert(container, {
                title: 'This is a warning',
                body: 'This is a warning body'
            });
            drawWarningAlert(container, {
                title: 'Another warning',
                body: 'Another warning body'
            });

            expect(container.selectAll('.usa-alert--warning').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('Another warning');
            expect(container.selectAll('p').text()).toBe('Another warning body');
        });

        it('Removes the previous alert and does not replace it if title and body are null', () => {
            drawWarningAlert(container, {
                title: 'This is a warning',
                body: 'This is a warning body'
            });
            drawWarningAlert(container, {
                title: '',
                body: ''
            });
            expect(container.selectAll('.usa-alert--warning').size()).toBe(0);
        });
    });

    describe('drawErrorAlert', () => {
        it('Creates a error alert with title and body', () => {
            drawErrorAlert(container, {
                title: 'This is a error',
                body: 'This is a error body'
            });

            expect(container.selectAll('.usa-alert--error').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('This is a error');
            expect(container.selectAll('p').text()).toBe('This is a error body');
        });

        it('Remove the previous alert and replaces with new title and body', () => {
            drawErrorAlert(container, {
                title: 'This is a error',
                body: 'This is a error body'
            });
            drawErrorAlert(container, {
                title: 'Another error',
                body: 'Another error body'
            });

            expect(container.selectAll('.usa-alert--error').size()).toBe(1);
            expect(container.selectAll('h3').text()).toBe('Another error');
            expect(container.selectAll('p').text()).toBe('Another error body');
        });

        it('Removes the previous alert and does not replace it if title and body are null', () => {
            drawErrorAlert(container, {
                title: 'This is a error',
                body: 'This is a error body'
            });
            drawErrorAlert(container, {
                title: '',
                body: ''
            });
            expect(container.selectAll('.usa-alert--error').size()).toBe(0);
        });
    });
});