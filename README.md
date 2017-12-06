# Cimpress Fulfillment Location client

This repository is maintained by the [Logistics Quoting & Planning Squad](mailto:LogisticsQuotingandPlanning@cimpress.com).
It contains a simple client to help getting information from the Fulfillment Location service owned by the [TRDLNK squad](mailto:TrdelnikSquad@cimpress.com).

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

You may also run `node sampleUsage.js` as an example.

### Prerequisites
* [Node.js](https://nodejs.org/en/)

### Other QP Resources
* [qp-node-components](https://mcpstash.cimpress.net/projects/QP/repos/qp-node-components/browse)
* [qp-validators](https://mcpstash.cimpress.net/projects/QP/repos/qp-validators/browse)
* [simple-coam-auth](https://mcpstash.cimpress.net/projects/QP/repos/simple-coam-auth/browse)
* [qp-quoter-client](https://mcpstash.cimpress.net/projects/QP/repos/qp-quoter-client/browse)