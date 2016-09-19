var credentials = require('./credentials.json').credentials;

var environments = {

    production : {
        network:{
            peers: credentials.peers,
            ca: credentials.ca,
            users: credentials.users,
            app_users: [
                {
                    username: 'bill1',
                    secret: 'passw0rd',
                    usertype: 1
                },
                {
                    username: 'steven1',
                    secret: 'passw0rd',
                    usertype: 1
                }
            ],
        },
        chaincode:{
            deployed_name: "2e30490e222ca371bcbe9982b1a9306bbd3d6305def2fb996b521246c36cb1e5",
        }
    },
    development : {
        network:{
            peers: [
                {
                    discovery_host: 'localhost',
                    discovery_port: 30303,
                }
            ],
            ca : {
                ca : {
                    url :  "localhost:50051"
                }
            },
            users: [
                {
                    username: "WebAppAdmin",
                    secret: "DJY27pEnl16d",
                    enrollId: "WebAppAdmin",
                    enrollSecret: "DJY27pEnl16d"
                },
                {
                    username: "admin",
                    secret: "Xurw3yU9zI0l",
                    enrollId: "admin",
                    enrollSecret: "Xurw3yU9zI0l"
                }
            ],
            app_users: [
                {
                    username: 'emma1',
                    secret: 'passw0rd',
                    usertype: 1
                },
                {
                    username: 'bob1',
                    secret: 'passw0rd',
                    usertype: 1
                },
                {
                    username: 'jim1',
                    secret: 'passw0rd',
                    usertype: 1
                },
                {
                    username: 'john1',
                    secret: 'passw0rd',
                    usertype: 1
                },
                {
                    username: 'cl1',
                    secret: 'passw0rd',
                    usertype: 2
                },
                {
                    username: 'appr1',
                    secret: 'passw0rd',
                    usertype: 3
                },
                {
                    username: 'appr2',
                    secret: 'passw0rd',
                    usertype: 3
                }
            ]
        },
        chaincode:{
            deployed_name: null,     						    // hashed cc name from prev deployment. Makes sure no redeploy is needed!
            global_path: 'github.com/chaincode/BCBP',        	// the path to the chaincode dir on this machine.
            local_path: 'chaincode/BCBP',                     // the path to your local chaincode related to the specific project
            auto_redeploy: true 						        // watch the filesystem for changes
        }
    }
}


// for instance cf env to check if we are in bluemix.

module.exports = environments[process.env.NODE_ENV] || environments.development;
