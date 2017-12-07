# Cimpress Fulfillment Location client

### Usage
In order to use the client, install the package by running:
```
npm install cimpress-fulfillment-location --save
```

Once the package is avialable, you can retrieve a specific fulfillment location as such:
```
const fulfillmentLocationId = 'abcd1234';
let client = new FulfillmentLocationClient({
    log: defaultLogger,
    cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 }
});

client.getLocation(fulfillmentLocationId, req.headers.authorization)
    .then(fulfillmentLocation => {
        // do stuff
    });
```

Otherwise, you can retrieve a list of all the fulfillment locations you have access to like this:
```
let client = new FulfillmentLocationClient({
    log: defaultLogger
});

client.getLocations(req.headers.authorization)
    .then(fulfillmentLocations => {
        // do stuff
    });
```

### Prerequisites
* [Node.js](https://nodejs.org/en/)
