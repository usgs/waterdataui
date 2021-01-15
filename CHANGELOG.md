# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/usgs/waterdataui/compare/waterdataui-0.40.0...master)
### Added
- display of discrete ground water level data on the IV hydrograph.
- Added a selection for Celsius converted to Fahrenheit to the parameter table.

## [0.40.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.39.0...waterdataui-0.40.0) - 2021-01-06
### Added
- Instantaneous Values data availability information page.
- Additional analytics tracking.
- Added an inventory data menu on the monitoring location page which is context specific for the site.
- Added social media icons in the footer.

### Fixed
- Now using 365 days for one year graph and comparison -- focus line syncs with both current and compare series.
- Use tsID without any parsing when retrieving the statistical time series.

### Changed
- Using Jest to run javascript tests rather than karma/jasmine. This means eliminating Browserstack testing but we gain a supported testing ecosystem with built in coverage and better mocking capabilities.

## [0.39.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.38.0...waterdataui-0.39.0) - 2020-12-09
### Added
- Static image of the Instantaneous Values Hydrograph for users of Internet Explorer. 
- New colors for the compare line.
- Navigation bar and other changes to header and footer.
- Links for WaterAlert.
- Added a check to see if FIM sites are public. If not, the sites flood inundation layers are not shown even if available.
- Links to download data related to the currently displayed hydrograph.
- Show active sites in the RTN and RTS networks in the map.

### Changed
- Added a tooltip to the hydrograph title showing the selected variable description and show the short unitCode on the Y axis.
- Now using current preferred SIFTA URL.
- Using '00065' (Gage Height) as the default parameter code.
- On mobile, one finger scrolling of map is disabled; two finger drag and zoom is enabled

### Fixed
- Dynamically generated tooltips are now initialized properly by calling init on the node where the tooltip is created rather than on the entire DOM which was causing multiple tooltip markup to be created.

## [0.38.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.37.0...waerdataui-0.38.0) - 2020-10-30
### Added
- Cookie to control banner message.
- Added 'Days from today' custom selection.
- A set of device specific favicons.

### Changed
- Using Rollup/plugin-alias for module imports.
- Now using the new SIFTA service.
- Changed headers on network page to match monitoring location pages.
- Moved cooperators section to bottom of page.

### Fixed
 - Stopped end of median line from showing outside of graph area.
 - Custom brush handles now reposition when user clicks and holds.

## [0.37.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.36.0...waterdataui-0.37.0) - 2020-09-16
### Added
- Added custom handles and hint text to  brush graph.
- Added rel="noopener" attribute to links with target="_blank" attribute.

### Changed 
- Changed the word 'Toggle' to 'Display' for the 'median' checkbox.
- Moved the 'provisional data statement' to a separate page--added link below graph.

### Fixed
- Issue that removed tick marks from main graph's brush area
- Issue where networks/monitoring-locations/ caused an error

## [0.36.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.35.0...waterdataui-0.36.0) - 2020-08-25
### Changed
- Removed custom tooltips and replaced with USWDS tooltip component.
- Decreased opacity of the upstream basin polygon.
- Updated the NWIS time series data graph to display data for entire days of selected custom dates.
- Changed "Summary" heading to "Summary of All Available Data"


### Added
- Updated monitoring location page custom date range selection to use USWDS date range picker
- Added basemaps and hydro overlay from The National Map to replace existing basemaps on monitoring location and network pages.
- Added Meta Tags for Facebook and Twitter images using graph image server.


## [0.35.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.34.0...waterdataui-0.35.0) - 2020-07-30
### Changed
- Using the latest guidance for the contents of the government banner from USWDS

### Added
- Parameter selection list now has radio buttons to indicate selection.

## [0.34.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.33.0...waterdataui-0.34.0) - 2020-07-07
### Added
- The DV graph shows min, mean, and maximum statistics if available.
- List of affiliated networks for a monitoring location on its page.
- Classic page link now uses the inventory if no IV time series data is available for the site.
- Support for limited containerized deployments.
- Radio buttons for switching between available DV Time Series graphs

## [0.33.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.32.0...waterdataui-0.33.0) - 2020-06-10
### Changed
- Moved graph-server to it's own repo <https://github.com/usgs/wdfn-graph-server>

### Added
- The current IV data now appear in a table within an accordion below the parameter selection list.
- Waterwatch flood levels to gage height graph on monitoring location page

## [0.32.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.31.0...waterdataui-0.32.0)
### Added
- Daily value graph now handles masked data
- The timeSeriesId is now a parameter on the graph image server to show a specific time series for
a parameter code.

### Changed
- Updated to use the latest USWDS/WDFN-VIZ packages

## [0.31.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.30.0...waterdataui-0.31.0) - 2020-04-29
### Changed
- Major rework of how the monitoring location Redux state code is organized. 

### Added
- The new statistical time series service is used to fetch the available statistical
time series and if daily max and a water level parameter code, the time series is displayed.

## [0.30.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.29.0...waterdataui-0.30.0) - 2020-04-13
### Added
- Add config variable, TOUCHPOINT_SCRIPT, which is used to add the touchpoint script
to the monitoring-location pages. By default the script is empty and the feature is disabled.

### Fixed
- Fixed bug when drawing custom time series and then changing the time was drawing extraneous lines
- Fixed scaling of the brush on mobile.
- Styling on the secondary y axis

### Changed
- Replaced the range input slider with an svg slider for moving the cursor tooltip point
in the UV and DV graphs. The slider now is appropriately scaled on mobile.

## [0.29.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.28.0...waterdataui-0.29.0) - 2020-04-02
### Added
- Added Brush to DV graph.
- Added Networks Page with a map and a table for all the sites
- Configurable notices in the banner

### Fixed
- Fixed bug where when switching parameters and the brush selection was not being properly set.


## [0.28.0 ](https://github.com/usgs/waterdataui/compare/waterdataui-0.27.0...waterdataui-0.28.0) - 2020-03-27
### Added
- Added period of record for each parameter in the monitoring location page parameter selection list.
- Added OpenAPI documentation to the graph-server along with a Swagger UI served at /api/graph-images/api-docs

## Fixed
- Fixed bug that made compare time series disappear when the brush was adjusted by adding
offsets to time series state in order to adjust x scale.
- Added DV legend.

### Changed
- Scaling on the UV hydrograph is now more flexible. It is designed to have no less than 3 tick marks
but no more than 8. Format changes depending on how wide a time range is being graphed.

## [0.27.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.26.0...waterdataui-0.27.0) - 2020-03-11
### Changed
- All IV time series are now available for drawing on the hydrograph not just those in the last 7 days.
- Added brush handle fill.
- Updated to latest wdfn-viz 1.4.0 and implemented the new build guidance.

### Added
- The state of the UI for the hydrograph is now preserved in the hash portion of the url and state 
can be restored by pasting the url into a browser window.
- Added upstream basin to NLDI map on the monitoring location pages.
- Added both hover and a cursor slider tooltip capability to the DV graph.
- Added width integer parameter to the graph-server which allows the user to return the width of the image.

## [0.26.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.25.0...waterdataui-0.26.0) - 2020-02-12
### Added
- Daily value graph. This has a feature toggle and is valid for only a single site. Sites without
data will show an info alert.
### Added
- Networks page.

## [0.25.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.24.0...waterdataui-0.25.0)
### Fixed
- Brush selection is now maintained when selecting a new variable.

### Added
- Image server now accepts startDT and endDT (ISO-8601 dates) to set the range of the hydrograph

## [0.24.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.23.0...waterdataui-0.24.0)
### Changed
- Refactored the lib/redux module and renamed to d3-redux. The use of the Redux store is now 
explicit in the calls rather than saving it in local storage on a d3 node.

### Added
- Added a brush feature to the hydrograph.

## [0.23.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.22.0...waterdataui-0.23.0)
### Added
- Image server now accepts the period parameter which should be a ISO-8601 duration format. 
However please note that NWIS only accepts periods using xxD.
- Image server shows site name and number above the graph

## [0.22.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.21.0...waterdataui-0.22.0) - 2019-12-12
### Changed
- NLDI data is now loaded into redux store
- Legend expand/collapse is available when nldi data is present
- Legend is initially collapsed on small devices when nldi data or flood data is present

### Fixed
- The latest version of Docker did not work with the graph-server image. It now uses a 
debian image and it also uses the Chromimum that is downloaded with puppeteer.

## [0.21.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.20.0...waterdataui-0.21.0) - 2019-10-24
### Added
- Added a checkbox to enable/disable median line on hydrograph 

### Changed
- Conditionally displayed the method description based on the number of methods.
- Updated to use wdfn-viz which updates the USWDS version to 2.2.1
- Only selected description's time series will now appear in the hydrograph's tooltip.
- Include the selected method's description, if defined, in the hydrograph title.
- Monitoring location points will now render on top of the upstream/downstream lines on the map

## [0.20.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.19.0...waterdataui-0.20.0) - 2019-10-04
### Added
- Added a second Y-axis for temperature parameters
- Added picker to pick a method description that will be highlighted in the hydrograph.
- Added feature toggle to enable/disable picker for method description

### Changed
- Changed how the lower bound on symlog scales are calculated to be closer to the minimum y-value on the plot

### Fixed
- Fixed issue where invalid cooperator data would cause the a monitoring location page to error

## [0.19.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.18.0...waterdataui-0.19.0) - 2019-09-20
### Added
- Added support for user specified date ranges
- Site Page now contains a Monitoring Camera section with proof of concept implementation.
- Added NLDI navigation results

### Changed
- Graph server now serves routes from /api/graph-images
- A selected set of parameter codes show the Y axis reversed

## [0.18.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.17.0...waterdataui-0.18.0) - 2019-05-28
### Added
- Map now contains Leaflet layer control to toggle satellite and gray with hydro layers

### Changed
- Uses symlog scale now included in D3 rather than our proprietary version
- Reduce the number of ticks on the discharge hydrographs if there are too many to fit on a screen without overlapping
- Simplify calls to NWISWeb
- Project uses wdfn-viz npm package to provide USGS visual identification. This required updating 
the project styles to use USWDS 2.0.x
- Moved the USGS watermark to the center of the hydrograph.

## [0.17.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.16.0...waterdataui-0.17.0) - 2019-03-06
### Added
- Add Docker config for server-rendering PNGs
- Use a Puppeteer/Chrome process pool for server rendering

### Changed
- Links in monitoring-location now use configurable endpoints.

## [0.16.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.15.0...waterdataui-0.16.0)
### Added
- A server to generate graph images.

## [0.15.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.14.0...waterdataui-0.15.0) - 2019-02-26
### Fixed
- Fixed the issue causing hydrograph date/time not to display on Internet Explorer
- Fixed the issue that was causing the extended time series fetch to fail.
- Page now renders when data values for the initial time series is all zeros.

## [0.14.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.13.0...waterdataui-0.14.0) - 2018-12-04
### Changed
- The Browserify/Babel build tooling was replaced with Rollup/Bublé.
- Added additional ticks and labels to fill in gaps on graphs with log plots
- Using Firefox headless to run tests for travis and default.
- Renamed Javascript modules to follow dash-case rather than camelCase

## [0.13.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.12.0...waterdataui-0.13.0) - 2018-09-11
### Changed
- Cooperator logos are always loaded via https

## [0.12.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.11.0...waterdataui-0.12.0) - 2018-08-03
### Changed
- Cooperator logos lookup changed from static json file to external, SIFTA-based service

## [0.11.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.10.0...waterdataui-0.11.0) - 2018-06-06
### Changed
- Cooperator logos lookup changed from the SIFTA site service to json file

## [0.10.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.9.0...waterdataui-0.10.0) - 2018-06-01
### Added
- Loading indicators for initial time series load and for loading extended data
- Added no data alert for sites with no time series data.


### Changed
- The node.js-based graph server was updated to render PNGs rather than SVGs
- Cooperator logos may be activated on a per-district basis
- BrowserStack and SauceLabs Karma test runners were added, and some browser-specific bugs fixed.
- Hydrograph shows data in the location's local timezone as determined by the weather service
- Font size of tooltips; larger size when fewer tips are present, smaller when more tip present
- Refactor the Redux state to put the median statistics in its own property so that the data does
not have to be coerced into a time series.
- Embedded hydrograph is time zone aware.
- Scrolling added to the 'provisional statement' in IFrame embed

### Fixed
- A bug with the graph watermark intercepting mouseover events driving the tooltips was fixed.
- Remove sourcemap reference from autotrack.js (Analytics script)
- Added dynamic left margin for tooltip text to prevent overlap with y-axis labels
- Bug that caused incorrect font styling on tooltips
- Various accessibility violations
- Tooltips that were hard to read when they overlapped graph lines

## [0.9.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.8.0...waterdataui-0.9.0) - 2018-05-10
### Fixed
- Safari only bug where extended time range graphs with median data would crash the browser.


## [0.8.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.7.0...waterdataui-0.8.0) - 2018-05-08
### Added
- Hydrograph can now show either last 7 days, last 30 days, or the last year of data for
the selected timeseries. The Show last year feature also works for the three date ranges.
- The beginnings of a node.js-based graph server was added, which returns an SVG image.
- Content group tag wdfn_tng to the google analytics script.
- Added a descriptive label and tooltip to the flood slider control.
- Cooperator logos


### Changed
- Cursor location / tooltip defaults to last point in the time series.
- Upgraded to Font Awesome 5.1
- Date labels moved to and centered in areas between midnight tick marks
- Projects were isolated in separate directories with Makefiles binding them together.
- Change incorrect spelling "timeseries" to "time series"
- Label change on toggle from "Show last year" to "Compare to last year"
- New colors for provisional, approved, and estimated time series
- Median data is shown using a step function
- Use paths relative to setup.py for data files during wheel builds


### Fixed
- Estimated time series points are now shown.


## [0.7.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.6.0...waterdataui-0.7.0) - 2018-04-23
### Added
- Tooltips are provided for metadata elements for those that USGS defines on NWIS help pages.
- Information alert for provisional data.
- Basic meta tags, title and description, for Twitter card and Open Graph
- Rough draft for USGS logo watermark

### Changed
- Timeseries graph legend now shows markers with the appropriate colors representing Approved, Estimated, and
Provisional for the lines that are currently visible on the graph.
- Audible/Show Last Year controls are shown below the timeseries legend on mobile.
- Timeseries tooltip no longer shows unmasked qualifiers in the tooltip.
- Refactored the shape of the state to separate domain data, application state, and ui state and created
slice reducers for the different parts.
- Location metadata table placed in an accordion

### Fixed
- Tooltip is redrawn correctly when changing from portrait to landscape on mobile.
- Handle tooltips on touch devices
- Metadata tooltips are not clipped by their containing div element


## [0.6.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.5.0...waterdataui-0.6.0) - 2018-04-06
### Added
- Play/Stop button to play the audible sound for the timeseries graph
- Legend appears on the map describing the map features
- Initialize the gage height slider with the current value of gage height
- Crawlable state/County pages that can be used to find the monitor locations for a particular state/county

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


## [0.5.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.4.0...waterdataui-0.5.0) - 2018-03-30
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

## [0.4.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.3.0...waterdataui-0.4.0) - 2018-03-26
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

## [0.3.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.2.0...waterdataui-0.3.0)  - 2018-03-09
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

## [0.2.0](https://github.com/usgs/waterdataui/compare/waterdataui-0.1.0...waterdataui-0.2.0) - 2018-02-23
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


## [0.1.0](https://github.com/usgs/waterdataui/tree/waterdataui-0.1.0) - 2018-02-13
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