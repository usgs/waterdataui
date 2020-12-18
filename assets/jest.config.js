module.exports = {
    verbose: true,
    transform: {
        '^.+\\.js$': 'buble-jest'
    },
    collectCoverageFrom: [
        '**/*.{js,jsx}',
        '!*.js',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/coverage/**',
        '!**/polyfills.js',
        '!**/monitoring-location/index.js',
        '!**/network/index.js'
    ],
    clearMocks: true,
    restoreMocks: true,
    moduleNameMapper: {
        '^ui/(.*)$': '<rootDir>src/scripts/$1',
        '^ml/(.*)$': '<rootDir>src/scripts/monitoring-location/$1',
        '^d3render/(.*)$': '<rootDir>src/scripts/d3-rendering/$1',
        '^map/(.*)$': '<rootDir>src/scripts/monitoring-location/components/map/$1',
        '^dvhydrograph/(.*)$': '<rootDir>src/scripts/monitoring-location/components/daily-value-hydrograph',
        '^ivhydrograph/(.*)$': '<rootDir>src/scripts/monitoring-location/components/hydrograph/$1',
        '^network/(.*)$': '<rootDir>src/scripts/network/$1'
    }
};