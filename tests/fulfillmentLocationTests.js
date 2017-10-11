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
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations('Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('FL returns 500 :: returns an error', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .times(1)
            .reply(500, 'Nah, not working right now');

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations('Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(500);
                expect(error.response.data).to.equal('Nah, not working right now');
            });
    });
});

describe('getLocations :: with cache ::', function () {
    
    it('FL returns 200 :: returns list of fulfillment locations correctly', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations('Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });

    it('locations are in the cache and uses the value in the cache', function () {
        nock.cleanAll();

        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .times(1)
            .reply(200, sampleLocations());

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations('Bearer X')
            .then(_data => {
                nock('https://fulfillmentlocation.trdlnk.cimpress.io')
                    .get("/v1/fulfillmentlocations")
                    .times(1)
                    .reply(500, 'Unable to load locations');

                client.getLocations('Bearer X')
                    .then(data => {
                        expect(data).to.equal(sampleLocations());
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
            .times(1)
            .reply(500, 'Nah, not working right now');

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocations('Bearer X')
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(500);
                expect(error.response.data).to.equal('Nah, not working right now');
            });
    });
});

describe('getLocation :: without cache ::', function () {

    afterEach(() => {
        nock.cleanAll();
    });

    it('FL service returns 200 and the location requested (using alphanum id)', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/bqcjg7qbvep")
            .reply(200, sampleLocations()[1]);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "bqcjg7qbvep")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
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

        return client.getLocation('Bearer X', "a7uqagcx0nz")
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
            .reply(200, sampleLocations()[1]);

        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "189")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
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

        return client.getLocation('Bearer X', "180")
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.equal(`Location '180' not found`);
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
            .reply(200, sampleLocations()[1]);

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation('Bearer X', "bqcjg7qbvep")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('location is in cache and uses the value in the cache', function () {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations/bqcjg7qbvep")
            .reply(200, sampleLocations()[1]);

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client
            .getLocation('Bearer X', "bqcjg7qbvep")
            .then(_data => {
                // FL service is now returning a 404; client should use data in cache
                nock('https://fulfillmentlocation.trdlnk.cimpress.io')
                    .get("/v1/fulfillmentlocations/bqcjg7qbvep")
                    .reply(500, "Unable to load information for 'bqcjg7qbvep'");

                client
                    .getLocation('Bearer X', "bqcjg7qbvep")
                    .then(data => {
                        expect(data).to.deep.equal(sampleLocations()[1]);
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

        return client.getLocation('Bearer X', "a7uqagcx0nz")
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
            .reply(200, sampleLocations()[1]);

        let client = new FulfillmentLocationClient({
            log: defaultLogger(),
            cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
        });

        return client.getLocation('Bearer X', "189")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
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

        return client.getLocation('Bearer X', "180")
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.equal(`Location '180' not found`);
            });
    });
});