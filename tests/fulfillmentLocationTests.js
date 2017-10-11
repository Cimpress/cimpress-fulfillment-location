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

describe('getLocations :: FL returns 200 ::', function () {

    it('returns list of fulfillment locations correctly', function () {
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
});

describe('getLocations :: FL returns 500 ::', function () {

    it('returns an error', function () {
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

describe('FulfillmentLocationClient :: getLocation ::', function () {

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