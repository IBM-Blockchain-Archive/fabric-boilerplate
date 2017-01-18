# Fabric boilerplate
This is a boilerplate application to get you up and running quickly with your own blockchain application. With this boilerplate you get an application that you can run locally as well as on IBM Bluemix. There is a simple AngularJS frontend application, a NodeJS backend application and of course a blockchain network. Locally, the boilerplate starts up a blockchain network using Docker containers; on Bluemix you can use the Blockchain service.

The boilerplate uses Hyperledger Fabric v0.6-developer-preview and HFC 0.6.5.

This boilerplate has been created and is maintained by the IBM CIC Groningen Blockchain team.

## Prerequisites
- Docker and docker-compose (https://www.docker.com/)

To have good support in your IDE it's advisable to also install TypeScript, TSLint and Golang.  

## Getting started
1. `git clone` this repo  
2. `cd` into the main directory and run `npm install`  (or, if you don't have npm, `./install.sh`).

This will pull the baseimage, download the Go dependencies of the chaincode and build your containers.

## Running the application
To run the application, simply do `docker-compose up`.

This will start the three tiers of our application in separate containers:  
1. One validating peer  
2. The memberservice  
3. The NodeJS server, which registers the users and deploys the chaincode on first boot  
4. The Angular frontend, which connects to the server through a REST API.  

The app is running on `http://localhost:4200/`. You can login with the user credentials you find in `resources/testData.json`  

## Development
Both the frontend and the server use filewatchers. Any change in the source files will trigger the transpiler and restart that part of the application.  

Every time you pull changes, update the package.json of the server or client or change anything that might affect deployment of chaincode: `docker-compose build`.  

When you end docker-compose, the containers still exist. They keep state:  
- Memberservice:  
  - The registered users and webAppAdmin  
- Peer:  
  - World state and ledger  
- Server:  
  - chaincodeId of the last deployment  
  - keyValStore with the private keys of the users  

So if you start the app again, you can use your old chaincode. If you want to clear, just run with `docker-compose --force-recreate`.  

// TODO: chaincode deployment!

## Tests
Chaincode, angular and NodeJS should all be unit tested. We will create a container that can run all of them.

## Updating the Fabric
1. Update the HFC client in the package.json  
2. Update the commit level in `blockchain/src/build-chaincode/vendor.yml`.
3. Delete the `blockchain/src/build-chaincode/vendor` directory  
4. `npm run govend` from the project root  
5. Update the baseimage and tag as latest
6. `docker-compose build`  

# Troubleshooting
- `no rows in result set`: The memberservice remembers something outdated. Stop your app and run `./clean.sh`.
- `name or token does not match`: The info in blockchain/data/keyValStore does not match with the connected memberservice. `./clean.sh`.
- `Can't connect to docker daemon.`: `sudo usermod -aG docker $(whoami)`, logout and login again.
- `Error: /usr/src/app/node_modules/grpc/src/node/extension_binary/grpc_node.node: invalid ELF header`: The node_modules of the server were built outside of the container. Delete this directory and make a change in `server/package.json`. Then do `docker-compose build server`.

HFC:

- `handshake failed`: is there a `certificate.pem` in the `blockchain/src/build-chaincode` dir?

## Running on Bluemix

### Registering and enrolling users
The SDK needs to register and enroll an admin user and any other users you would like to add. When this takes place the SDK receives enrollment certificates (eCerts) for each user. You only get these certificates once. So if you would redeploy or restart your app on Bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from your local environment before you deploy. When the eCerts are received, you can then push the app to Bluemix, including the eCerts. So the app that runs on Bluemix does not have to register and enroll the users again, because the eCerts are already available.  

**Don't lose server/resources/keyValueStore-bluemix!** or else you'll have to recreate the blockchain service on Bluemix.

### Deploying chaincode and the app
The easiest way to deploy a chaincode is to do it from you local environment before you push the app to Bluemix. We made a script that deploys the chaincode and stores the chaincodeID in a file. After that you push the app to Bluemix (including the chaincodeID file), your app can interact with the chaincode.

Perform the following steps to run the application on Bluemix:
#### Credentials
- Create a Blockchain Service on Bluemix
- Update the manifest.yml file in the root of the project:
    - replace the names and hosts of both servers. The values can be anything, as long as they are unique.
    - change the settings in `client/src/environments` to refer to the correct API endpoint of the server
    - replace the name of the service on the last line of the manifest. This should be the name of the Blockchain Service you just created.
- Copy the credentials of the Blockchain Service and overwrite the credentials in `server/resources/credentials.json`. If you retrieve your Service Credentials from a [new console](https://new-console.ng.bluemix.net/#overview) instance of Bluemix then you will need to edit your credentials.json. Add `"credentials": {` to line 2 and then add a closing `}` to the final line.  Your finished payload should be 233 lines.  
- Delete the `resources/keyValStore-bluemix` directory if it exists, it contains keys to the previously used service.

#### Deployment
- Get into our CloudFoundry container by running `npm run cf`.  
- From within the container, register the users and deploy the chaincode with `cd server && npm run deploy` (This can take about 30 seconds)
- Open the dashboard of the blockchain service on Bluemix. Wait until you see the chaincode id appear on the `Network` tab. Ensure that it is running on all four peers and that all the way at the end it says `Up for x seconds/minutes`. After your initial deployment, each of the four peers should have two blocks - a genesis block and the deployed chaincode. If this is the case, then your chaincode has been deployed successfully!
- Deploy app to Bluemix: cd up one level and do `cf push`, still from within the container.

For assistance with the cloud foundry cli, visit the [cloud foundry](https://github.com/cloudfoundry/cli#downloads) repo. There are prerequisites for using the cf cli, such as homebrew.

After the app has been pushed to Bluemix, you can view the logs with:

`cf logs [NAME_OF_THE_APP] --recent`

Where NAME_OF_THE_APP is the app name you provided in the manifest.yml file.

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/    
Official Hyperledger slack channel: https://hyperledgerproject.slack.com   
IRC:                                #hyperledger on freenode.net    
Working Group Meetings:             https://github.com/hyperledger/hyperledger/wiki/PublicMeetingCalendar    
Wiki:                               https://github.com/hyperledger/hyperledger/wiki     
Learn chaincode:                    https://github.com/IBM-Blockchain/learn-chaincode    
HFC:                                https://www.npmjs.com/package/hfc/

# Flow of the startup

blockchainApp - starts different components of the blockchain sequentially:

- A logger: will be the logger for the process
- A blockchain: Will configure the blockchain and checks if the blockchain needs to be deployed on bluemix or not. It uses the following files:
    - BlockchainFactory: determines if application is bluemix or not and start the following processes:
        - BlockchainBluemix: deploys on bluemix
        - BlockchainLocal: deploys locally
    - ChaincodeBluemixConfig and ChaincodeLocalConfig
        - both use ChaincodeEnviroment config to extend their own config.
- A blockchainService: connects the node to the blockchain network, enrolls users who have the rights to invoke and query and check if a redeploy is needed.
- Testdata: creates an instance of testdata. Testdata.js/.ts will use resources/testdata to invoke new testdata.
