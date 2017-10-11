'use strict';

const DEFAULT_URL = "https://fulfillmentlocation.trdlnk.cimpress.io";

const nodeCache = require('node-cache');
let flCache;
let axios = require('axios');

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

    getLocation(authorization, locationId) {
        
        const instance = axios.create({
            baseURL: this.url,
            timeout: this.timeout
        });

        instance.defaults.headers.common['Authorization'] = authorization;

        if ( !this.useCaching ) {
            return this._getFulfillmentLocationFromService(instance, locationId);
        }

        return new Promise((resolve, reject) => {
            const cacheKey = 'fulfillmentLocation_' + locationId + '_' + authorization;
            flCache.get(cacheKey, (err, fulfillmentLocation) => {

                if ( err ) {
                    this.log.error(`Failed to read from node-cache (key=${cacheKey})!?`, err);
                }

                if ( err || (fulfillmentLocation == undefined) ) {

                    return this._getFulfillmentLocationFromService(instance, locationId)
                        .then(function (location) {
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

    getLocations(authorization) {

        const instance = axios.create({
            baseURL: this.url,
            timeout: this.timeout
        });

        instance.defaults.headers.common['Authorization'] = authorization;

        if ( !this.useCaching ) {
            return this._getFulfillmentLocationsFromService(instance);
        }

        return new Promise((resolve, reject) => {
            const cacheKey = 'fulfillmentLocations_' + authorization;
            flCache.get(cacheKey, (err, fulfillmentLocations) => {

                if ( err ) {
                    this.log.error(`Failed to read from node-cache (key=${cacheKey})!?`, err);
                }

                if ( err || (fulfillmentLocations == undefined) ) {

                    return this._getFulfillmentLocationsFromService(instance)
                        .then(function (locations) {
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

    _getFulfillmentLocationFromService(instance, fulfillmentLocationId) {
        return new Promise((resolve, reject) => {
            const endpoint = this.url + "/v1/fulfillmentlocations/" + fulfillmentLocationId;
            const requestConfig = {
                method: 'GET',
                url: endpoint,
                qs: {
                    showArchived: false
                },
                timeout: this.timeout
            };

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

                    return reject(err);
                });
        });
    }

    _getFulfillmentLocationsFromService(instance) {
        return new Promise((resolve, reject) => {
            const endpoint = this.url + "/v1/fulfillmentlocations";
            const requestConfig = {
                method: 'GET',
                url: endpoint,
                qs: {
                    showArchived: false
                },
                timeout: this.timeout
            };

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

                    return reject(err);
                });
        });
    }
}

module.exports = FulfillmentLocationClient;