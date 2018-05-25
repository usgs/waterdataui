const StatisicsDataInjector = require('inject-loader!./statisticsData');


describe('statisticsData', () => {

    describe('fetchSiteStatisticsRDB', () => {
        let ajaxMock;
        let statisticsData;

        const sites = ['05370000'];
        const statType = 'median';
        const params = ['00060'];

        beforeEach(() => {
            /* eslint no-use-before-define: 0 */
            let getPromise = Promise.resolve(MOCK_RDB);

            ajaxMock = {
                get: function () {
                    return getPromise;
                }
            };
            spyOn(ajaxMock, 'get').and.callThrough();
            statisticsData = StatisicsDataInjector({'./ajax': ajaxMock});
        });

        it('Gets a full year of statistical data', () => {
            statisticsData.fetchSitesStatisticsRDB({sites: sites, statType: statType, params: params});
            expect(ajaxMock.get).toHaveBeenCalled();
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('statTypeCd=median');
            expect(ajaxUrl).toContain('parameterCd=00060');
            expect(ajaxUrl).toContain('sites=05370000');
        });
    });

    describe('fetchSiteStatistics', () => {
        let ajaxMock;
        let statisticsData;

        const site = '05370000';
        const statType = 'median';
        const params = ['00060'];

        beforeEach(() => {
            let getPromise = Promise.resolve(MOCK_RDB);

            ajaxMock = {
                get: function() {
                    return getPromise;
                }
            };
            spyOn(ajaxMock, 'get').and.callThrough();
            statisticsData = StatisicsDataInjector({'./ajax': ajaxMock});
        });

        it('Gets a full year of statistical data', () => {
            statisticsData.fetchSiteStatistics({site, statType, params});
            expect(ajaxMock.get).toHaveBeenCalled();
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('statTypeCd=median');
            expect(ajaxUrl).toContain('parameterCd=00060');
            expect(ajaxUrl).toContain('sites=05370000');
        });

        it('Parses the data as expected', (done) => {
            statisticsData.fetchSiteStatistics({site, statType, params}).then((resp) => {
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

const MOCK_RDB = `#
#
# US Geological Survey, Water Resources Data
# retrieved: 2018-01-25 16:05:49 -05:00	(natwebsdas01)
#
# This file contains USGS Daily Statistics
#
# Note:The statistics generated are based on approved daily-mean data and may not match those published by the USGS in official publications.
# The user is responsible for assessment and use of statistics from this site.
# For more details on why the statistics may not match, visit http://help.waterdata.usgs.gov/faq/about-statistics.
#
# Data heading explanations.
# agency_cd       -- agency code
# site_no         -- Site identification number
# parameter_cd    -- Parameter code
# station_nm      -- Site name
# loc_web_ds      -- Additional measurement description
#
# Data for the following 1 site(s) are contained in this file
# agency_cd   site_no      parameter_cd   station_nm (loc_web_ds)
# USGS        05370000     00060          EAU GALLE RIVER AT SPRING VALLEY, WI
#
# Explanation of Parameter Codes
# parameter_cd	Parameter Name
# 00060         Discharge, cubic feet per second
#
# Data heading explanations.
# month_nu    ... The month for which the statistics apply.
# day_nu      ... The day for which the statistics apply.
# begin_yr    ... First water year of data of daily mean values for this day.
# end_yr      ... Last water year of data of daily mean values for this day.
# count_nu    ... Number of values used in the calculation.
# p50_va      ... 50 percentile (median) of daily mean values for this day.
#
agency_cd	site_no	parameter_cd	ts_id	loc_web_ds	month_nu	day_nu	begin_yr	end_yr	count_nu	p50_va
5s	15s	5s	10n	15s	3n	3n	6n	6n	8n	12s
USGS	05370000	00060	153885		1	1	1969	2017	49	16
USGS	05370000	00060	153885		1	2	1969	2017	49	16
USGS	05370000	00060	153885		1	3	1969	2017	49	16
USGS	05370000	00060	153885		1	4	1969	2017	49	15
USGS	05370000	00060	153885		1	5	1969	2017	49	15
USGS	05370000	00060	153885		1	6	1969	2017	49	15
USGS	05370000	00060	153885		1	7	1969	2017	49	15
USGS	05370000	00060	153885		1	8	1969	2017	49	15
USGS	05370000	00060	153885		1	9	1969	2017	49	15
USGS	05370000	00060	153885		1	10	1969	2017	49	15
USGS	05370000	00060	153885		1	11	1969	2017	49	15
USGS	05370000	00060	153885		1	12	1969	2017	49	15
USGS	05370000	00060	153885		1	13	1969	2017	49	15
`;
