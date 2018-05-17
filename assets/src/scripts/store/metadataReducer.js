const addIanaTimeZone = function(metadata, action) {
    return {
        ...metadata,
        ianaTimeZone: action.ianaTimeZone
    };
};

const addMonitoringLocationId = function(metadata, action) {
    return {
        ...metadata,
        identifier: action.identifier
    }
};

export const metadataReducer = function(metadata={}, action) {
    switch (action.type) {
        case 'LOCATION_IANA_TIME_ZONE_SET': return addIanaTimeZone(metadata, action);
        case 'MONITORING_LOCATION_IDENTIFIER_SET': return addMonitoringLocationId(metadata, action);
        default: return metadata;
    }
};