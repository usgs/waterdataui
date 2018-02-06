const { lineSegmentsSelector } = require('./points');


describe('Points module', () => {
    describe('line segment selector', () => {
        it('should separate on approved', () => {
            expect(lineSegmentsSelector('current')({
                tsData: {
                    current: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 10,
                        qualifiers: ['P'],
                        approved: true,
                        estimated: false
                    }, {
                        value: 10,
                        qualifiers: ['P'],
                        approved: true,
                        estimated: false
                    }]
                }
            })).toEqual([{
                classes: {
                    approved: false,
                    estimated: false
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            }, {
                classes: {
                    approved: true,
                    estimated: false
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: true,
                    estimated: false
                }, {
                    value: 10,
                    qualifiers: ['P'],
                    approved: true,
                    estimated: false
                }]
            }]);
        });

        it('should separate on estimated', () => {
            expect(lineSegmentsSelector('current')({
                tsData: {
                    current: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: true
                    }, {
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: true
                    }]
                }
            })).toEqual([{
                classes: {
                    approved: false,
                    estimated: false
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            }, {
                classes: {
                    approved: false,
                    estimated: true
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: true
                }, {
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: true
                }]
            }]);
        });

        it('should ignore masked values', () => {
            expect(lineSegmentsSelector('current')({
                tsData: {
                    current: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }]
                }
            })).toEqual([{
                classes: {
                    approved: false,
                    estimated: false
                },
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            }]);
        });
    });
});
