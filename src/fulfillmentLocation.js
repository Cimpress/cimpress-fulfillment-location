'use strict';

const DEFAULT_URL = "https://fulfillmentlocation.trdlnk.cimpress.io";

const nodeCache = require('node-cache');
let flCache;
let axios = require('axios');

// --- Predefined errors ---

function UnauthorizedError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Unauthorized';
    this.status = 401;
    this.additionalData = extra;
}

function ForbiddenError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Forbidden';
    this.status = 403;
    this.additionalData = extra;
}

function NotFoundError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Not found';
    this.status = 404;
    this.additionalData = extra;
}

// --- END ---

const handleAuthorization = (authorization, reject) => {
    if ( !authorization ) {
        return reject(new Error('Missing Authorization parameter'));
    }

    if ( authorization.indexOf('Bearer ') !== 0 ) {
        return reject(new Error(`Invalid format for Authorization parameter: "${authorization}". Authorization parameter should be in the following`
            + ` format: "Bearer [token]"`));
    }
};

const handleError = (err, reject) => {
    if ( err.status === 401 || (err.response && err.response.status === 401) ) {
        return reject(new UnauthorizedError(err.statusText || err.message, err.data || err.response.data));
    }
    if ( err.status === 403 || (err.response && err.response.status === 403) ) {
        return reject(new ForbiddenError(err.statusText || err.message, err.data || err.response.data));
    }
    if ( err.status === 404 || (err.response && err.response.status === 404) ) {
        return reject(new NotFoundError(err.statusText || err.message, err.data || err.response ? err.response.data : err));
    }
    return reject(err);
};

class FulfillmentLocationClient {

    constructor(c) {
        let config = c || {};
        this.url = config.url || DEFAULT_URL;
        this.log = config.log;
        this.useCaching = !!config.cacheConfig;
        if ( config.cacheConfig ) {
            flCache = new nodeCache(config.cacheConfig);
        }
        this.timeout = config.timeout || 2000;
    }

    getLocation(locationId, options) {

        return new Promise((resolve, reject) => {
            const opts = options || {};
            handleAuthorization(opts.authorization, reject);
            const instance = axios.create({
                baseURL: this.url,
                timeout: this.timeout
            });

            instance.defaults.headers.common['Authorization'] = opts.authorization;

            if ( !this.useCaching || opts.skipCache) {
                return this._getFulfillmentLocationFromService(instance, locationId, opts)
                    .then(location => {
                        return resolve(location);
                    })
                    .catch(err => {
                        return reject(err);
                    });
            }

            const cacheKey = 'fulfillmentLocation_' + locationId + '_' + opts.authorization;
            flCache.get(cacheKey, (err, fulfillmentLocation) => {

                if ( err ) {
                    this.log.error(`Failed to read from node-cache (key=${cacheKey})`, err);
                }

                if ( err || (fulfillmentLocation == undefined) ) {

                    return this._getFulfillmentLocationFromService(instance, locationId, opts)
                        .then(location => {
                            flCache.set(cacheKey, location);
                            return resolve(location);
                        })
                        .catch(err => {
                            return reject(err);
                        });

                } else {
                    return resolve(fulfillmentLocation);
                }

            });
        });
    }

    getLocations(options) {

        return new Promise((resolve, reject) => {
            const opts = options || {};
            handleAuthorization(opts.authorization, reject);
            const instance = axios.create({
                baseURL: this.url,
                timeout: this.timeout
            });
    
            instance.defaults.headers.common['Authorization'] = opts.authorization;
    
            if ( !this.useCaching || opts.skipCache) {
                return this._getFulfillmentLocationsFromService(instance, opts)
                    .then(locations => {
                        return resolve(locations);
                    })
                    .catch(err => {
                        return reject(err);
                    });
            }

            const cacheKey = 'fulfillmentLocations_' + opts.authorization;
            flCache.get(cacheKey, (err, fulfillmentLocations) => {

                if ( err ) {
                    this.log.error(`Failed to read from node-cache (key=${cacheKey})!?`, err);
                }

                if ( err || (fulfillmentLocations == undefined) ) {

                    return this._getFulfillmentLocationsFromService(instance, opts)
                        .then(locations => {
                            flCache.set(cacheKey, locations);
                            return resolve(locations);
                        })
                        .catch(err => {
                            return reject(err);
                        });

                } else {
                    return resolve(fulfillmentLocations);
                }

            });
        });
    }

    _getFulfillmentLocationFromService(instance, fulfillmentLocationId, options) {
        return new Promise((resolve, reject) => {
            const endpoint = this.url + "/v1/fulfillmentlocations/" + fulfillmentLocationId;
            const requestConfig = {
                method: 'GET',
                url: endpoint,
                timeout: this.timeout,
                headers: {}
            };
            
            if(options.skipCache){
                requestConfig.headers['Cache-Control'] = 'no-cache';
                requestConfig.headers['X-Cache-Id'] = Math.random();
            }

            if ( this.log && this.log.info ) {
                this.log.info("->" + endpoint, requestConfig);
            }

            instance
                .request(requestConfig)
                .then(res => {
                    
                    if ( this.log && this.log.info ) {
                        this.log.info("<-" + endpoint, res.data);
                    }

                    return resolve(res.data || []);
                })
                .catch(err => {
                    if ( this.log && this.log.error ) {
                        this.log.error("<-" + endpoint, err);
                    }

                    return handleError(err, reject);
                });
        });
    }

    _getFulfillmentLocationsFromService(instance, options) {
        return new Promise((resolve, reject) => {
            const endpoint = this.url + "/v1/fulfillmentlocations";
            const requestConfig = {
                method: 'GET',
                url: endpoint,
                params:{
                    showArchived: options.showArchived || false
                },
                headers: {},
                timeout: this.timeout
            };

            if(options.skipCache){
                requestConfig.headers['Cache-Control'] = 'no-cache';
                requestConfig.headers['X-Cache-Id'] = Math.random();
            }

            if ( this.log && this.log.info ) {
                this.log.info("->" + endpoint, requestConfig);
            }
            
            instance
            .request(requestConfig)
                .then((res) => {

                    if ( this.log && this.log.info ) {
                        this.log.info("<-" + endpoint, res.data);
                    }

                    return resolve(res.data || []);
                })
                .catch((err) => {

                    if ( this.log && this.log.error ) {
                        this.log.error("<-" + endpoint, err);
                    }

                    return handleError(err, reject);
                });
        });
    }
}

module.exports = FulfillmentLocationClient;