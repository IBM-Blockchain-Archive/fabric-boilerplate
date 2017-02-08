# Fabric boilerplate [![Build Status](https://travis.ibm.com/CICBlockchain/blockchain-boilerplate.svg?token=YkWWPxQZ9L5fZzx9KKEr&branch=master)](https://travis.ibm.com/CICBlockchain/blockchain-boilerplate)
This is a boilerplate application to get you up and running quickly with your own blockchain application. With this boilerplate you get an application that you can run locally as well as on IBM Bluemix. There is a simple Angular frontend application, a NodeJS backend application and of course a blockchain network, all running in containers. Locally, the boilerplate starts up a blockchain network using Docker containers; on Bluemix you can use the Blockchain service.

The boilerplate uses Hyperledger Fabric v0.6.1-preview and HFC 0.6.5.

It has been created and is maintained by the IBM CIC Benelux Blockchain team. Pull requests are more than welcome!

## Prerequisites
- Docker and docker-compose (https://www.docker.com/)

To have good support in your IDE it's advisable to also install NPM, TypeScript, TSLint and Golang.

## Getting started
1. `git clone` this repo  
2. `cd` into the main directory and run `npm install` (or, if you don't have npm, `./install.sh`).

This will pull the baseimage, peer and memberservie, download the Go dependencies of the chaincode and build your containers. It will take a while.  

To get rid of missing module errors in your IDE, also run `npm install` from the `server` and `client` directory. This is not mandatory to run the application.

## Running the application
To run the application, simply do `docker-compose up`.

This will start the three tiers of our application in separate containers:  
1. One validating peer  
2. The memberservice  
3. The NodeJS server, which registers the users and deploys the chaincode on first boot  
4. The Angular frontend, which connects to the server through a REST API.  

The app is running on `http://localhost:4200/`. You can login with the user credentials you find in `server/resources/testData.json`  

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

Currently if you change the chaincode you will have to recreate the containers. In the future we will add a filewatcher for the chaincode as well.

Notes:
- if anyone updates the npm packages all developers have to rebuild the containers  
- if you add angular components from your host environment, make sure you have the correct angular-cli version! To be sure you can enter the client container and do it from there.

## Updating the Fabric
1. Update the HFC client in the package.json  
2. Update the commit level in `blockchain/src/build-chaincode/vendor.yml`.
3. Delete the `blockchain/src/build-chaincode/vendor` directory  
4. `npm run govend` from the project root  
5. Update the baseimage and tag as latest
6. `docker-compose build`  

## Tests
We support unittests for the server, client and chaincode. Especially for writing chaincode we recommend a test-driven approach to save time. You can find the commands to run the tests in the package.json in the root:  
- `npm run test-go` (`blockchain/src/build-chaincode/chaincode_test.go` contains mock functions for the chaincode stub)
- `npm run test-server` (see the `server/tests` directory)
- `npm run test-client` (each component has its own test, courtesy of angular-cli)
- `npm run test-e2e` (needs the application to be running, it hits the API endpoints for end to end testing)
- `npm test` runs all the tests except for e2e.

You can also run the server tests directly from the server directory with `npm test` and `npm run e2e`.

# Troubleshooting
- `no rows in result set`: The memberservice remembers something outdated. Stop your app and run `./clean.sh`.
- `name or token does not match`: The info in blockchain/data/keyValStore does not match with the connected memberservice. `./clean.sh`.
- `Can't connect to docker daemon.`: `sudo usermod -aG docker $(whoami)`, logout and login again.
- `Error: /usr/src/app/node_modules/grpc/src/node/extension_binary/grpc_node.node: invalid ELF header`: The node_modules of the server were built outside of the container. Delete this directory and make a change in `server/package.json`. Then do `docker-compose build server`.

HFC:

- `handshake failed`: is there a `certificate.pem` in the `blockchain/src/build-chaincode` dir?
- NPM modules not found: `docker-compose build`

## Running on Bluemix

### Registering and enrolling users
The SDK needs to register and enroll an admin user and any other users you would like to add. When this takes place the SDK receives enrollment certificates (eCerts) for each user. You only get these certificates once. So if you would redeploy or restart your app on Bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from your local environment before you deploy. When the eCerts are received, you can then push the app to Bluemix, including the eCerts. So the app that runs on Bluemix does not have to register and enroll the users again, because the eCerts are already available.  

**Don't lose server/resources/keyValueStore-bluemix!** or else you'll have to recreate the blockchain service on Bluemix.

### Deploying chaincode and the app
The easiest way to deploy a chaincode is to do it from you local environment before you push the app to Bluemix. We made a script that deploys the chaincode and stores the chaincodeID in a file. After that you push the app to Bluemix (including the chaincodeID file), your app can interact with the chaincode.

Perform the following steps to run the application on Bluemix:
#### Credentials and urls
- Create a Blockchain Service on Bluemix
- Update the manifest.yml file in the root of the project:
    - replace the names and hosts of both servers. The values can be anything, as long as they are unique.
    - replace the name of the service on the last line of the manifest. This should be the name of the Blockchain Service you just created.
- Change the settings in `client/src/environments` to refer to the correct API endpoint of the server
- Copy the credentials of the Blockchain Service and overwrite the credentials in `server/resources/credentials.json`. If you retrieve your Service Credentials from a [new console](https://new-console.ng.bluemix.net/#overview) instance of Bluemix then you will need to edit your credentials.json. Add `"credentials": {` to line 2 and then add a closing `}` to the final line.  Your finished payload should be 233 lines.  
- If needed, change the cloudfoundry API url in the `Dockerfile`.
- Delete the `server/resources/keyValStore-bluemix` directory if it exists, it contains keys to the previously used service.

#### Deployment
- Get into our CloudFoundry container by running `npm run cf`.  
- From within the container, register the users and deploy the chaincode with `cd server && npm run deploy` (This can take a few minutes)
- Open the dashboard of the blockchain service on Bluemix. Wait until you see the chaincode id appear on the `Network` tab. Ensure that it is running on all four peers and that all the way at the end it says `Up for x seconds/minutes`. The blocks with transactions for the deployment and the invocation of the testdata function should be visible on the `Blockchain` tab.
- Deploy app to Bluemix: cd up one level and do `cf push`, still from within the container.

For assistance with the cloud foundry cli, visit the [cloud foundry](https://github.com/cloudfoundry/cli#downloads) repo.  

After the app has been pushed to Bluemix, you can view the logs with:

`cf logs [NAME_OF_THE_APP] --recent`

Where NAME_OF_THE_APP is the app name you provided in the manifest.yml file.

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/  
Official Hyperledger slack channel: https://hyperledgerproject.slack.com  
IRC:                                #hyperledger on freenode.net  
Wiki:                               https://wiki.hyperledger.org/  
HFC:                                https://www.npmjs.com/package/hfc/  
Bluemix                             https://console.ng.bluemix.net/docs/  
IBM on blockchain:                  https://www.ibm.com/blockchain/what-is-blockchain.html  