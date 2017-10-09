'use strict';

const expect = require('chai').expect;

describe('Index', () => {

    it('Exports correctly', () => {

        let exported = require('../src/index');
        expect(exported).to.deep.equal({
            FulfillmentLocationClient: require('../src/fulfillmentLocation')
        });

    });

});