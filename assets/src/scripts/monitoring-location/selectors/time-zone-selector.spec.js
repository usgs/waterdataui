import {getIanaTimeZone} from './time-zone-selector';

describe('monitoring-location/selectors/time-zone-selector', () => {
    describe('getIanaTimeZone', () => {
        it('returns null if saved time zone is null', () => {
            expect(getIanaTimeZone({
                ianaTimeZone: null
            })).toBeNull();
        });

        it('returns the time zone when present', () => {
            expect(getIanaTimeZone({
                ianaTimeZone: 'America/Los_Angeles'
            })).toEqual('America/Los_Angeles');
        });
    });
});