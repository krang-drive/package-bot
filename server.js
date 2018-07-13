const express = require('express');
const app = express();
const Client = require('node-rest-client').Client;
const client = new Client();

app.get('/start/:facilityId', (req, res) => {

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    // Generate between 100 and 200 packages for the facility to give to crowd source drivers
    const numPackages = getRandomInt(100, 200);

    // Array of packages to be sent to store
    const packages = [];

    // Synchronously generate N packages
    for(let i = 0; i < numPackages; i++) {
        let facilityId = req.params.facilityId;
        let packageId = '1Z' + Math.floor(Math.random() * 999999999999999);
        let deliveryLocation = '50 E New St. Dover, NJ';
        let signatureRequired = Math.round(Math.random()) ? true : false;
        let isDelivered = false;

        // Create Package JSON
        let pkg = {
            facilityID: facilityId,
            packageId: packageId,
            deliveryLocation: deliveryLocation,
            signatureRequired: signatureRequired,
            isDelivered: isDelivered
        }

        // Add to the packages array
        packages.push(pkg);
    }

    // Construct POST payload
    let args = {
        data: { packageData: packages },
        headers: { "Content-Type": "application/json" }
    };

    // Post package to store (must have an endpoint that accepts a POST for an array of packages. these can just be document inserts, no upsert/update necessary)
    let pkgPostReq = client.post('http://package-store:8080/packageSet', args, (data, response) => {
        console.log(data);

        let routeArgs = {
          data: req.params.facilityID,
          headers: { "Content-Type": "text/plain" }
        }
        let routePostReq = client.post(`http://route-manager:8080/facility`, routeArgs, (data,response) => {
          //res.send("sent")
          console.log("success");
        });
        routePostReq.on('error', (err) => {
          console.log('request err', err);
          //res.end();
        });
        //res.send('Sent');
    });

    // log any errors from the request
    pkgPostReq.on('error', (err) => {
        console.log('request error', err);
        //res.end();
    });



    res.send("sent");
});

/**
 * Health endpoint
 */
app.get('/', (req, res) => {
    res.send('package-bot');
})

app.listen(8080, () => console.log('App listening on port 8080!'));
