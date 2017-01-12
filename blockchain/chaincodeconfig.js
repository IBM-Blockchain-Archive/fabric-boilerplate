const serviceRegex = /^ibm-blockchain/;
var app_users = require('../testdata/testData.json').users;

// if the app is running in Bluemix, get credentials from env var. Otherwise from json.
function getCredentials(){
    if (process.env.VCAP_SERVICES) {
        var services = JSON.parse(process.env.VCAP_SERVICES);
        var blockchainServiceName = Object.keys(services).filter(function(svcName){
            return svcName.match(serviceRegex);
        })[0];
        console.log('Found service:', blockchainServiceName);
        var service = services[blockchainServiceName];

        if(service) {
            var specificService;

            if(process.env.SERVICE) {
                specificService = service.filter(function (s) {
                    return s.name == process.env.SERVICE;
                })[0];
            }
            if(!specificService) specificService = service[service.length -1];

            console.log('Using credentials from VCAP_SERVICES: ', specificService.name);
            return specificService.credentials; //['ibm-blockchain-5-prod'][0].credentials;
        }
    } else {
        console.log('Using credentials from file.');
        return require('./deployBluemix/credentials.json').credentials; // Maybe we can get rid of this when we only deploy from bluemix.
    }
}

var credentials = getCredentials();
if(process.env.NODE_ENV == 'production' && !credentials) throw 'Credentials not found.';

var adminUser = {};
if(credentials) {
    adminUser = credentials.users.filter(function(u){
        return u.enrollId === "WebAppAdmin";
    })[0];
}

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
            projectName: 'build-chaincode',
            deployed_dir: 'blockchain/deployBluemix',
            webAppAdmin: {
                enrollId: adminUser.enrollId,
                enrollSecret: adminUser.enrollSecret
            }
        },
        cert: credentials.cert
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
            app_users: app_users
        },
        chaincode:{
            projectName: 'build-chaincode',   // src/projectname/chaincode.go
            autoRedeploy: true, 		// watch the filesystem for changes in the chaincode
            deployed_dir: 'blockchain/deployLocal',
            webAppAdmin: {
                enrollId: 'WebAppAdmin',
                enrollSecret: 'DJY27pEnl16d'
            }
        }
    }
};

// cf env to check if we are in bluemix.
module.exports = environments[process.env.NODE_ENV] || environments.development;
