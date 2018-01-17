const { addAccessibility } = require('./svgAccessibility');
const { select } = require('d3-selection');

describe('svgAccessibility addAccessibility tests', () => {

    let svg;
    beforeEach( () => {
        svg = select('body').append('svg');
    });

    afterEach( () => {
        select('svg').remove();
    });

    it('Should add a title, desc, and aria attributes', () => {
        addAccessibility({
            svg: svg,
            title: 'This is a title',
            description: 'This is a description',
            isInteractive: false
        });

        expect(svg.attr('title')).toBe('This is a title');
        expect(svg.attr('desc')).toBe('This is a description');
        const labelledBy = svg.attr('aria-labelledby');
        expect(labelledBy).toContain('title');
        expect(labelledBy).toContain('desc');
    });

    it('Should not add a tabindex if isInteractive is false', () => {
        addAccessibility({
            svg: svg,
            title: 'This is a title',
            description: 'This is a description',
            isInteractive: false
        });
        expect(svg.attr('tabindex')).toBeNull();
    });

    it('Should add a tabindex if isInteractive is true', () => {
        addAccessibility({
            svg: svg,
            title: 'This is a title',
            description: 'This is a description',
            isInteractive: true
        });
        expect(svg.attr('tabindex')).toBe('0');
    });
});