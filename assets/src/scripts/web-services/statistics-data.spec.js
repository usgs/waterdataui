import {MOCK_STATISTICS_RDB} from 'ui/mock-service-data';

import {fetchSiteStatistics, fetchSitesStatisticsRDB} from './statistics-data';


describe('statistics-data', () => {

    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchSiteStatisticsRDB', () => {

        const sites = ['05370000'];
        const statType = 'median';
        const params = ['00060'];

        it('Gets a full year of statistical data', () => {
            /* eslint no-use-before-define: 0 */
            fetchSitesStatisticsRDB({sites: sites, statType: statType, params: params});
            const request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                response: MOCK_STATISTICS_RDB,
                status: 200
            });
            expect(request.url).toContain('statTypeCd=median');
            expect(request.url).toContain('parameterCd=00060');
            expect(request.url).toContain('sites=05370000');
        });
    });

    describe('fetchSiteStatistics', () => {
        let request;
        let promise;

        const siteno = '05370000';
        const statType = 'median';
        const params = ['00060'];

        beforeEach(() => {
            promise = fetchSiteStatistics({siteno, statType, params});
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                response: MOCK_STATISTICS_RDB,
                status: 200
            });
        });

        it('Gets a full year of statistical data', () => {
            expect(request.url).toContain('statTypeCd=median');
            expect(request.url).toContain('parameterCd=00060');
            expect(request.url).toContain('sites=05370000');
        });

        it('Parses the data as expected', (done) => {
            promise.then((resp) => {
                expect(resp).toEqual({
                    '00060': {
                        '153885': [{
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '1',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '16'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '2',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '16'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '3',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '16'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '4',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '5',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '6',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '7',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '8',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '9',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '10',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '11',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '12',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }, {
                            agency_cd: 'USGS',
                            site_no: '05370000',
                            parameter_cd: '00060',
                            ts_id: '153885',
                            loc_web_ds: '',
                            month_nu: '1',
                            day_nu: '13',
                            begin_yr: '1969',
                            end_yr: '2017',
                            count_nu: '49',
                            p50_va: '15'
                        }]
                    }
                });
                done();
            });
        });
    });
});