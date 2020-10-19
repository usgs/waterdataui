import {select} from 'd3-selection';

import {renderMaskDefs} from 'd3render/data-masks';

describe('d3-rendering/data-masks', () => {
   describe('renderMaskDefs', () => {
       let testSvg;
       const patterns = [{
           patternId: 'this-pattern',
           patternTransform: 'rotate(45)'
       }, {
           patternId: 'that-pattern',
           patternTransform: 'skewX(30)'
       }];
       beforeEach(() => {
           testSvg = select('body').append('svg');
           let defs = testSvg.append('defs');
           renderMaskDefs(defs, 'my-graph-pattern-mask', patterns);
       });

       afterEach(() => {
           testSvg.remove(testSvg);
       });

       it('Expect a mask element to be created', () => {
           const masks = testSvg.selectAll('#my-graph-pattern-mask');

           expect(masks.size()).toBe(1);
       });

       it('Expect two patterns elements to be created', () => {
           const patternElems = testSvg.selectAll('pattern');
           expect(patternElems.size()).toBe(2);

           const thisPattern = patternElems.filter('#this-pattern');
           const thatPattern = patternElems.filter('#that-pattern');
           expect(thisPattern.attr('patternTransform')).toEqual('rotate(45)');
           expect(thisPattern.select('rect').attr('mask')).toEqual('url(#my-graph-pattern-mask)');
           expect(thatPattern.attr('patternTransform')).toEqual('skewX(30)');
           expect(thatPattern.select('rect').attr('mask')).toEqual('url(#my-graph-pattern-mask)');
       });
   }) ;
});