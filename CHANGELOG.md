# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.1] - 2017-10-11
### Added
- Implemented client for Fulfillment Location service, with caching.

## [0.2] - 2018-10-03
### Added
- Enable showArchived flag for listing fulfillment locations.

## [1.0] - 2018-11-29
### Changed
- Aditional properties of getLocations and getLocation moved to a single object paramenter `options`. 

### Added
- Added new skipCache option that disables all the caches.

## [1.0.1] - 2018-11-29
### Fix
- Solve critical vulnerability caused by  growl, a dependency of mocha.
