# Cimpress Fulfillment Location client

### Usage
In order to use the client, install the package by running:
```
npm install cimpress-fulfillment-location --save
```

Once the package is available, you can retrieve a specific fulfillment location as such:
```
const fulfillmentLocationId = 'abcd1234';
let client = new FulfillmentLocationClient({
    log: defaultLogger,
    cacheConfig: { stdTTL: 4 * 60 * 60, checkperiod: 5 * 60 },
    timeout: 2000
});

client.getLocation(fulfillmentLocationId, {
    authorization: "Your access token",
    skipCache: false, // Skips the cache so the results will be fresh, if not set is false by default
})
    .then(fulfillmentLocation => {
        // do stuff
    });
```

Otherwise, you can retrieve a list of all the fulfillment locations you have access to like this:
```
let client = new FulfillmentLocationClient({
    log: defaultLogger
});

client.getLocations({
    authorization: "Your access token",
    showArchived: false, // By default is false, shows archived fulfillment locations
    skipCache: false // Skips the cache so the results will be fresh, if not set is false by default
})
    .then(fulfillmentLocations => {
        // do stuff
    });

```

### Prerequisites
* [Node.js](https://nodejs.org/en/)
