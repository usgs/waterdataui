# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
## [Unreleased]
### Changed
- Disabled zooming the map on scroll wheel unless the map has focus.
- Precipitation timeseries is now shown as accumulated precipitation over the 7 days.

##Fixed
- Screen reader only tables are now fully hidden on Firefox

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

[Unreleased]: https://github.com/usgs/waterdataui/compare/waterdataui-0.3.0...master
[0.3.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.2.0...waterdataui-0.3.0
[0.2.0]: https://github.com/usgs/waterdataui/compare/waterdataui-0.1.0...waterdataui-0.2.0
[0.1.0]: https://github.com/usgs/waterdataui/tree/waterdataui-0.1.0
