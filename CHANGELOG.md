# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
## [Unreleased]

### Added
- Tooltips are provided for metadata elements for those that USGS defines on NWIS help pages.

### Fixed
- Tooltip is redrawn correctly when changing from portrait to landscape on mobile.
- Handle tooltips on touch devices


## [0.6.0] - 2018-04-06
### Added
- Play/Stop button to play the audible sound for the timeseries graph
- Legend appears on the map describing the map features
- Initialize the gage height slider with the current value of gage height
- Crawable state/County pages that can be used to find the monitor locations for a particular state/county

### Changed
- Font sizing and responsive layout changes
- Limit y-axis lower bound to nearest power of 10 on logarithmic scales
- Site Summary table includes site visits, peak values, annual data reports, and groundwater network sites

### Fixed
- Timeseries SVG has the correct title and desc tag contents.
- Series with no points are not considered when determining the default parameter.
- Remove source maps from CSS build
- Include only real-time parameters with recent data in a site's description
- Tooltip points are not created for points containing infinite y-axis value
- Single points appear in sparklines
- Map includes the location of the site with flood layers are included
- Firefox bug where the time series graph legend would resize as things were added to it.
- Limit y-axis tick count on small device widths and log scales.
- Precipitation tooltips now show the correct accumulated values


## [0.5.0] - 2018-03-30
### Added
- Description metatag and text on page generated from site data
- Decorator that can be used to return a 404 for views. This is part of the work to add feature flags.
- Feature flags for the audio, embed, and hydrologic pages
- Tooltips appear for all time series shown on the graph

### Changed
- Data series summary table rolls up by parameter group
- Generating hashed asset names when building
- Header and footer now comply with the latest USGS visual standards
- Time series graph controls have now been moved next to the legend, beneath the graph.

### Fixed
- No longer show parameters that have no data or masks for the last seven days in the
"Select a timeseries" list.

## [0.4.0] - 2018-03-26
### Added
- Title to timeseries graph
- Dismissable banner which shows the beta status and feedback link
- Slider to give time series detail at a specific date
- Icon to provide iframe for embedding timeseries graph

### Changed
- Disabled zooming the map on scroll wheel unless the map has focus.
- Precipitation timeseries is now shown as accumulated precipitation over the 7 days.
- Show last year checkbox is disabled if a timeseries does not have data from last year.
- The select timeseries table is not shown if a site has not timeseries data.
- Tooltips display masked data as the value of the data point.
- Select timeseries list no longer contains columns for parameter code or timeseries availability.
Parameter codes can be found in the tooltip. A scrollbar will appear for long timeseries lists.

### Fixed
- Screen reader only tables are now fully hidden on Firefox.
- Timeseries without any data are not shown the the select timeseries table.
- Sparklines will appear to any timeseries with current data
- Graph y axis label now wraps.
- Monitoring locations with no timeseries data no longer show the timeseries graph.
- Parameters with no data points in current or last year data are omitted from the select table

## [0.3.0] - 2018-03-09
### Added
- Sparklines added to "Select a timeseries" table.
- Ability to show multiple time series for a parameter code.
- Link to page to provide feedback.
- For sites that have flood inundation mapping information, show the flood inundation
layers with a slider to control the gage height.

### Changed
- Time series graph legend was simplified. Current year, previous year, and median are
shown on separate lines and doesn't dynamically shift position as the window is resized.
- Data gaps of more than 72 minutes are shown.
- Only IV data is shown in the select a time series list.

## [0.2.0] - 2018-02-23
### Added
- Previous year value is added to the tooltip when shown.
- Tooltip uses a focus line in addition to the focus circle to show location on the time series line.
- Clicking on the median stats circles toggles the visibility of the labels.
- Masked qualifiers shown using a fill pattern on the  time series graph
- Qualifier description are shown in the time series tooltip
- Return json-ld for /monitoring-location/{siteno} endpoint when accept headers ask for application/ld+json
- Ability to pick from available time series for display on the time series graph.
- Configurable Google Analytics, both project specific and general USGS analytics.
- Added contact us link to /monitoring-location pages

### Changed
- Tooltip text is now fixed in the corner and the font style and color match the line style/color
used for the time series line.
- Using new endpoint to get the national aquifer code information and regenerated all data files
- Using the qualifier description in the tooltip
- Use log scale for data less than one on the time series graph
- Dates are shown with the time zone.
- Improved svg accessibility by adding the compare year time series sr-only table and by adding
a column for qualifier.


## [0.1.0] - 2018-02-13
### Added
- Initial repo set up with metadata files.
- Monitoring-location/{siteno} pages with the following features:
  * Facebook and Twitter links.
  * Last 7 day discharge time series graph using a linear scale.
  * Ability to compare to last year's discharge time series graph.
  * Median discharge statistics for the period of record for the 7 days shown on the time series graph.
  * Distinguish between approved and estimated values on the time series graph.
  * Tooltip which shows the current year and previous year values on the time series graph.
  * Legend for the time series graph.
  * Map showing the location of the monitoring location.
  * Data series table showing the available time series and its period of record.
  * Monitoring location meta data table.
  * Added elements to make the time series graph more accessible as well as screen reader
  only tables that include the data shown on the time series graph.
- Ability to query by agency_cd to monitoring-location/{siteno}.
- Ability to handle monitoring-location/{siteno} which identifies more than one monitoring-location .
- Hydrological-unit/{huc} pages for huc2, huc4, huc6, and huc8. Each page shows the next level of huc pages for
{huc}. For huc8, the page containsa link to a page containing the monitoring locations for that huc 8.
- Hydrological-unit/{huc}/monitoring-locations pages which in addition to the huc information, shows a table of
links to the monitoring-locations that are within {huc}.

[Unreleased]: https://github.com/usgs/waterdataui/compare/waterdataui-0.6.0...master
[0.6.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.5.0...waterdataui-0.6.0
[0.5.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.4.0...waterdataui-0.5.0
[0.4.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.3.0...waterdataui-0.4.0
[0.3.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.2.0...waterdataui-0.3.0
[0.2.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.1.0...waterdataui-0.2.0
[0.1.0]: https://github.com/usgs/waterdataui/tree/waterdataui-0.1.0
