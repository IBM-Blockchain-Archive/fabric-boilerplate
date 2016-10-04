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
        }
    },
    development : {
        network:{
            peers: [
                {
                    discovery_host: 'localhost',
                    discovery_port: 7051,
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
            deployed_name: null,  // hashed cc name from prev deployment. Makes sure no redeploy is needed!
            auto_redeploy: true 	// watch the filesystem for changes to the chaincode file
        }
    }
}


// cf env to check if we are in bluemix.
module.exports = environments[process.env.NODE_ENV] || environments.development;
