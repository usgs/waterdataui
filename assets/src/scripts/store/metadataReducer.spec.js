
const { metadataReducer } = require('./metadataReducer');


describe('metadataReducer', () => {

    describe('LOCATION_IANA_TIME_ZONE_SET', () => {

        it('should add the time zome', () => {
            expect(metadataReducer({}, {
                type: 'LOCATION_IANA_TIME_ZONE_SET',
                ianaTimeZone: 'America/Juneau'
            })).toEqual({
                ianaTimeZone: 'America/Juneau'
            });
        });
    });

    describe('MONITORING_LOCATION_IDENTIFIER_SET', () => {

        it('should add the location id', () => {
            expect(metadataReducer({}, {
                type: 'MONITORING_LOCATION_IDENTIFIER_SET',
                identifier: '6730012'
            })).toEqual({
                identifier: '6730012'
            });
        });
    });
});