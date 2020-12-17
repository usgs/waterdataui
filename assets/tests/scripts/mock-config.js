export default {
    TIMESERIES_AUDIO_ENABLED: true,
    FIM_GIS_ENDPOINT: 'https:/fakelegendservice.com/',
    NWIS_INVENTORY_ENDPOINT: 'https://fakenwis.usgs.gov/inventory',
    NETWORK_ENDPOINT: 'https://fakeogcservice.com/observations/collections',
    OBSERVATIONS_ENDPOINT: 'https://fakeogcservice.com/observations/collections/monitoring-locations',
    TNM_USGS_TOPO_ENDPOINT : 'https://fakeusgstopo.com',
    TNM_USGS_IMAGERY_ONLY_ENDPOINT: 'https://fakeimageryonly.com',
    TNM_USGS_IMAGERY_TOPO_ENDPOINT: 'https://fakeimagerytopo.com',
    TNM_HYDRO_ENDPOINT: 'https://faketnmhydro.com',
    SERVICE_ROOT: 'https://fakeserviceroot.com',
    uvPeriodOfRecord: {
        '00010': {
            begin_date: '01-02-2001',
            end_date: '10-15-2015'
        },
        '00060': {
            begin_date: '04-01-1991',
            end_date: '10-15-2007'
        },
        '00093': {
            begin_date: '11-25-2001',
            end_date: '03-01-2020'
        },
        '00067': {
            begin_date: '04-01-1990',
            end_date: '10-15-2006'
        }
    }
};

jest.mock('ui/config');