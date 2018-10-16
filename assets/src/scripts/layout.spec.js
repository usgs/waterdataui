import { select } from 'd3-selection';
import { layout, invalidate } from './layout';


describe('layout', () => {
    let layoutRoot;

    beforeEach(() => {
        layoutRoot = select('body').append('div');
    });

    afterEach(() => {
        layoutRoot.remove();
    });

    it('has this bound to current node', () => {
        layoutRoot.call(layout(function () {
            expect(this).toBe(layoutRoot.node());
        }));
        layoutRoot.call(invalidate());
    });

    it('invalidation accumulates layout data', () => {
        let acc;
        layoutRoot.call(layout(function (data) {
            expect(data).toBeDefined();
            acc = data;
        }));
        layoutRoot.call(invalidate({'rootInfo': '1'}));
        layoutRoot.call(invalidate({'rootInfo2': '2'}));
        layoutRoot.call(invalidate({'rootInfo': '3'}));
        expect(acc).toEqual({
            'rootInfo': '3',
            'rootInfo2': '2'
        });
    });

    it('invalidation accumulates layout data on children', () => {
        let acc;
        layoutRoot.call(layout(function (data) {
            expect(data).toBeDefined();
            acc = data;
        }));
        layoutRoot.append('div')
            .call(invalidate({'child1': '1'}));
        layoutRoot.append('div')
            .call(invalidate({'child2': '2'}));
        expect(acc).toEqual({
            'child1': '1',
            'child2': '2'
        });
    });
});
