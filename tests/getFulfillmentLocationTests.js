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

const sampleLocation = () => (
    {
        timeZone: "Europe/London",
        internalFulfillerId: 70,
        internalFulfillmentLocationId: 110,
        fulfillerId: "a2wgr294u",
        fulfillmentLocationId: "b7uqagcx0nw"
    }
);

// ----- END -----

describe('getLocation :: without cache ::', function () {

    afterEach(() => {
        nock.cleanAll();
    });

    it('FL service returns 200 and the location requested (using alphanum id)', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/bqcjg7qbvep")
            .reply(200, sampleLocation());

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("bqcjg7qbvep", 'Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocation());
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('FL service returns 404 for invalid alphanum id', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/a7uqagcx0nz")
            .reply(404, "Location 'a7uqagcx0nz' not found");

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("a7uqagcx0nz", 'Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(404);
                expect(error.additionalData).to.equal(`Location 'a7uqagcx0nz' not found`);
            });
    });

    it('FL service returns 200 and the location requested (using internal id)', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/189")
            .reply(200, sampleLocation());

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("189", 'Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocation());
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('FL service returns 404 for invalid internal id', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/180")
            .reply(404, "Location '180' not found");

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("180", 'Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(404);
                expect(error.additionalData).to.equal(`Location '180' not found`);
            });
    });

    it('FL service returns 401 for unauthorized user', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/180")
            .reply(401);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("180", 'Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.status).to.equal(401);
            });
    });

    it('FL service returns 403 for forbidden', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/180")
            .reply(403);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation("180", 'Bearer X')
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

        return client.getLocation("180")
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

        return client.getLocation("180", "invalid-format")
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.message).to.equal('Invalid format for Authorization parameter: "invalid-format". Authorization parameter should be in the following format: "Bearer [token]"');
            });
    });
});

describe('getLocation :: with cache ::', function () {
    
    afterEach(() => {
        nock.cleanAll();
    });

    it('FL service returns 200 and the location requested (using alphanum id)', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/bqcjg7qbvep")
            .reply(200, sampleLocation());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation("bqcjg7qbvep", 'Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocation());
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('location is in cache and uses the value in the cache', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/bqcjg7qbvep")
            .reply(200, sampleLocation());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client
            .getLocation("bqcjg7qbvep", 'Bearer X')
            .then(_data => {
                // FL service is now returning a 404; client should use data in cache
                nock('https://fulfillmentlocation.trdlnk.cimpress.io')
                    .get("/v1/fulfillmentlocations/bqcjg7qbvep")
                    .reply(500, "Unable to load information for 'bqcjg7qbvep'");

                client
                    .getLocation('Bearer X', "bqcjg7qbvep")
                    .then(data => {
                        expect(data).to.deep.equal(sampleLocation());
                    })
                    .catch(error => {
                        expect(error).to.not.exist;
                    });
            });
    });

    it('FL service returns 404 for invalid alphanum id', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/a7uqagcx0nz")
            .reply(404, "Location 'a7uqagcx0nz' not found");

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation("a7uqagcx0nz", 'Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.equal(`Location 'a7uqagcx0nz' not found`);
            });
    });

    it('FL service returns 200 and the location requested (using internal id)', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/189")
            .reply(200, sampleLocation());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation("189", 'Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocation());
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('FL service returns 404 for invalid internal id', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/180")
            .reply(404, "Location '180' not found");

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation("180", 'Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.equal(`Location '180' not found`);
            });
    });
});