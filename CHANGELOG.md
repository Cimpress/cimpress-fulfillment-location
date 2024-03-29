# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.8] - 2022-01-07
### Fix
- Fix incomplete package deployment

## [1.0.7] - 2022-01-07
### Fix
- Remove dependency on non-standard Error.captureStackTrace() method

## [1.0.6] - 2021-03-16
### Fix
- Applying security vulnerabilities patches

## [1.0.5] - 2020-08-28
### Changed
- Move to Node.js major version 12

### Fixed
- On error from Fulfillment Location, fix the returned name of the error

## [1.0.4] - 2020-01-23
### Add
- Add the posibility of filtering fulfillment locations by fulfiller

## [1.0.3] - 2019-09-10
### Fix
- Applying security vulnerabilities patches

## [1.0.2] - 2019-06-23
### Fix
- Updating axios and bunch of dev dependencies to reduce vulnerabilities

## [1.0.1] - 2018-11-29
### Fix
- Solve critical vulnerability caused by growl, a dependency of mocha.

## [1.0] - 2018-11-29
### Changed
- Aditional properties of getLocations and getLocation moved to a single object paramenter `options`. 

### Added
- Added new skipCache option that disables all the caches.

## [0.2] - 2018-10-03
### Added
- Enable showArchived flag for listing fulfillment locations.


## [0.1] - 2017-10-11
### Added
- Implemented client for Fulfillment Location service, with caching.




