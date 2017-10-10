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

describe('FulfillmentLocationClient :: getLocations ::', function () {

    beforeEach(() => {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .reply(200, sampleLocations());
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('FL service returns 200 and a list of fulfillment locations', function () {
        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocations('Bearer X')
            .then(data => {
                expect(data).to.deep.equal(sampleLocations());
            });
    });
});

describe('FulfillmentLocationClient :: getLocation ::', function () {
    
    beforeEach(() => {
        nock('https://fulfillmentlocation.trdlnk.cimpress.io')
            .get("/v1/fulfillmentlocations")
            .reply(200, sampleLocations());
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('FL service returns 200 and a list of locations including the requested alphanum location id', function () {
        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "bqcjg7qbvep")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('FL service returns 200 and a list of locations but not including the requested alphanum location id', function () {
        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "a7uqagcx0nz")
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error).to.equal(`Location 'a7uqagcx0nz' not found`);
            });
    });

    it('FL service returns 200 and a list of locations including the requested internal location id', function () {
        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "189")
            .then(data => {
                expect(data).to.deep.equal(sampleLocations()[1]);
            })
            .catch(error => {
                expect(error).to.not.exist;
            });
    });

    it('FL service returns 200 and a list of locations but not including the requested internal location id', function () {
        let client = new FulfillmentLocationClient({log: defaultLogger()});

        return client.getLocation('Bearer X', "180")
            .then(data => {
                expect(data).to.not.exist;
            })
            .catch(error => {
                expect(error).to.equal(`Location '180' not found`);
            });
    });
});