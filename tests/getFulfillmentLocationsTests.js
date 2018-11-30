'use strict';

const expect = require('chai').expect;
const nock = require('nock');
const sinon = require('sinon');

const FulfillmentLocationClient = require('../src/fulfillmentLocation');

// ----- Helpers -----

const defaultLogger = () => ({
    info: sinon.stub(),
    error: sinon.stub()
});

const sampleLocations = () => (
    [
        {
            timeZone: "Europe/London",
            internalFulfillerId: 70,
            internalFulfillmentLocationId: 110,
            fulfillerId: "a2wgr294u",
            fulfillmentLocationId: "b7uqagcx0nw"
        },
        {
            timeZone: "Europe/Paris",
            internalFulfillerId: 70,
            internalFulfillmentLocationId: 189,
            fulfillerId: "a2wgr294u",
            fulfillmentLocationId: "bqcjg7qbvep"
        }
    ]
);

// ----- END -----

describe('getLocations :: without cache ::', function () {
    
    it('FL returns 200 :: returns list of fulfillment locations correctly', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken:'Bearer X'})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('FL returns 200 :: skipCache set :: returns fresh list of fulfillment locations correctly', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io', {reqheaders: {
                'Cache-Control': 'no-cache',
                'X-Cache-Id': (value) => value!= null
            }})
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'Bearer X', skipCache: true})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('FL returns 200 :: returns list of fulfillment locations correctly including archived fulfillers', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: true})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({log: defaultLogger()});
        return client.getLocations({accessToken: 'Bearer X', showArchived: true})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('FL returns 200 :: skipCache set :: returns list of fresh fulfillment locations correctly including archived fulfillers', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io', {reqheaders: {
            'Cache-Control': 'no-cache',
            'X-Cache-Id': (value) => value!= null
        }})
            .get("/v1/fulfillmentlocations")
            .query({showArchived: true})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({log: defaultLogger()});
        return client.getLocations({accessToken: 'Bearer X', showArchived: true, skipCache: true})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('FL returns 500 :: returns an error', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(500, 'Unable to load locations');

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(500);
                expect(error.response.data).to.equal('Unable to load locations');
            });
    });

    it('FL service returns 404 for invalid alphanum id', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .reply(404);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(404);
            });
    });

    it('FL service returns 401 for unauthorized user', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .reply(401);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(401);
            });
    });

    it('FL service returns 403 for forbidden', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .reply(403);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(403);
            });
    });

    it('Authorization parameter is not passed :: returns an error', function () {
        nock.cleanAll();

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations()
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.message).to.equal('Missing Authorization parameter');
            });
    });

    it('Authorization parameter is of an invalid format :: returns an error', function () {
        nock.cleanAll();

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations({accessToken: 'invalid-format'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.message).to.equal('Invalid format for Authorization parameter: "invalid-format". Authorization parameter should be in the following format: "Bearer [token]"');
            });
    });
});

describe('getLocations :: with cache ::', function () {
    
    it('FL returns 200 :: returns list of fulfillment locations correctly', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });
        
    it('FL returns 200 :: skipCache set :: returns list of fresh fulfillment locations correctly', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io', {reqheaders: {
            'Cache-Control': 'no-cache',
            'X-Cache-Id': (value) => value!= null
        }})
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations({accessToken: 'Bearer X', skipCache: true})
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('locations are in the cache and uses the value in the cache', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations({accessToken: 'Bearer X'})
            .then(_data => {
                nock('https://fulfillmentlocation.trdlnk.cimpress.io')
                    .get("/v1/fulfillmentlocations")
                    .times(1)
                    .reply(500, 'Unable to load locations');

                client.getLocations({accessToken: 'Bearer X'})
                    .then(data => {
                        expect(data).to.deep.equal(sampleLocations());
                    })
                    .catch(error => {
                        expect(error).to.not.exist;
                    });
            });
    });

    it('FL returns 500 :: returns an error', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .query({showArchived: false})
            .times(1)
            .reply(500, 'Unable to load locations');

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations({accessToken: 'Bearer X'})
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(500);
                expect(error.response.data).to.equal('Unable to load locations');
            });
    });
});