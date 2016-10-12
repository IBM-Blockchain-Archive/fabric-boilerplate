var credentials = require('./deployBluemix/credentials.json').credentials;
var app_users = require('../testdata/testData.json').users;

var environments = {

    production : {
        network:{
            peers: credentials.peers,
            ca: credentials.ca,
            users: credentials.users,
            app_users: app_users
        },
        chaincode:{
            deployed_name: null,
            projectName: 'build-chaincode'
        }
    },
    development : {
        network:{
            peers: [
                {
                    discovery_host: 'localhost',
                    discovery_port: 7051
                }
            ],
            ca : {
                ca : {
                    url :  "localhost:7054"
                }
            },
            users: [
                {
                    enrollId: "WebAppAdmin",
                    enrollSecret: "DJY27pEnl16d"
                }
            ],
            app_users: app_users
        },
        chaincode:{
            projectName: 'build-chaincode', // The directory under src where your chaincode is
            auto_redeploy: true, 			// watch the filesystem for changes to the chaincode file,
            deployed_name: null
        }
    }
};


// cf env to check if we are in bluemix.
module.exports = environments[process.env.NODE_ENV] || environments.development;
