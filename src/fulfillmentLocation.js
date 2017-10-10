'use strict';

const DEFAULT_URL = "https://fulfillmentlocation.trdlnk.cimpress.io";

const nodeCache = require('node-cache');
const flCache = new nodeCache({stdTTL: 4 * 60 * 60, checkperiod: 5 * 60});
let axios = require('axios');

class FulfillmentLocationClient {

    constructor(c) {
        let config = c || {};
        this.url = config.url || DEFAULT_URL;
        this.log = config.log;
        this.useCaching = config.useCaching !== false;
        this.timeout = config.timeout || 2000;
    }

    getLocation(authorization, locationId) {
        return this.getLocations(authorization)
            .then(locations => {
                const location = locations.find(x => x.internalFulfillmentLocationId == locationId || x.fulfillmentLocationId == locationId);
                if ( location ) {
                    return Promise.resolve(location);
                }
                return Promise.reject(`Location '${locationId}' not found`);
            });
    }

    getLocations(authorization) {

        const instance = axios.create({
            baseURL: this.url,
            timeout: this.timeout
        });

        instance.defaults.headers.common['Authorization'] = authorization;

        if ( !this.useCaching ) {
            return this._getFromServicePromise(instance);
        }

        return new Promise((resolve, reject) => {
            const cacheKey = 'fulfillmentLocations_' + authorization;
            flCache.get(cacheKey, (err, fulfillmentLocations) => {

                if ( err ) {
                    this.log.error(`Failed to read from node-cache (key=${cacheKey})!?`, err);
                }

                if ( err || (fulfillmentLocations == undefined) ) {

                    return this._getFromServicePromise(instance)
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

    _getFromServicePromise(instance) {
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