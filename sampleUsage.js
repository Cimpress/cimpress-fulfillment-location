'use strict';

const FulfillmentLocationClient = require('./src/fulfillmentLocation');
const fulfillmentLocationService = new FulfillmentLocationClient({
    log: {
        info: (message) => {
            console.log(message);
        }
    }
});

// Fill this in with a v2 token
const authorization = 'Bearer [token]';

const locationId = 'a7uqagcx0nz';
console.log('Fetching location from FL service...');
fulfillmentLocationService
    .getLocation(locationId, authorization)
    .then(location => {
        console.log('Location Info');
        console.log(location);
    })
    .catch(error => {
        console.error('Error from FL client');
        console.error(error);
    });