
const { getIanaTimeZone, getLocationIdentifier } = require('./metadataSelector');


describe('metadataSelector', () => {
    const state1 = {
        metadata: {
            identifier: '089533901',
            ianaTimeZone: 'America/Phoenix'
        }
    };
    const state2 = {
        metadata: {
            identifier: '089533901'
        }
    };

    describe('getLocationIdentifier', () => {
        it('gets the location id', () => {
            expect(getLocationIdentifier(state1)).toEqual('089533901');
        });
    });

    describe('getIanaTimeZone', () => {
        it('gets the time zone', () => {
            expect(getIanaTimeZone(state1)).toEqual('America/Phoenix');
        });

        it('returns null if time zone is unavailable', () => {
            expect(getIanaTimeZone(state2)).toBeNull();
        });
    });
});