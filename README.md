# Prerequisites
- Go
- NodeJS
- Docker
- Nodemon (npm install nodemon -g)


# Preparing your environment

## Clone this repo
Use git clone from you preferred workspace folder to clone your project-code with:
1. git clone [ project git url ]  
2. cd `fabric-boilerplate` and run `npm install`

## Setting up Hyperledgerr
Create the following folder structure in your Go path: $GOPATH/src/github.com/hyperledger  

$GOPATH/src/github.com/  
----hyperledger/  
----chaincode/  
---------fabric-boilerplate/ 
------------vendor/  
---------------github.com/  
------------------hyperledger/ 

Go to the hyperleder folder and clone the fabric code:
> cd $GOPATH/src/github.com/hyperledger     
> git clone https://github.com/hyperledger-archives/fabric.git
> git checkout v0.5-developer-preview

Once the repository is cloned, run the following command:
> bash fabric/scripts/provision/docker.sh 0.0.10

This will prepare a docker baseimage in which the chaincode will be launched and deployed.


Copy the fabric folder that you just cloned and past it in 
$GOPATH/src/github.com/chaincode/fabric-boilerplate/vendor/github.com/hyperledger

Copy the chaincode.go file from the /chaincode/fabric-boilerplate folder inside the project to the fabric-boilerplate folder inside your $GOPATH



# Running the application automatically


From you WORKSPACE/fabric-boilerplate folder:
> ./start.sh

Carefull if you also have other docker containers running

Check if it's running by visiting `localhost:7050/chain` in your browser. 

# Running on Bluemix
Deploying the application on Bluemix is not yet as easy as we would like. 
There are two reasons that make it more difficult:

Registering and enrolling users
The SDK needs to register and enroll an admin user and any other user you would like to add. When this takes place the SDK receives enrollment certficates (eCerts) for each user. You only get these certificates ones. So if you would redeploy or restart you app on bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from you local environment before you deploy. When the eCerts are received, you can then push the app to bluemix, including the eCerts. So The app that runs on bluemix does not have to register and enroll the users again, because the eCerts are already available.

Deploying chaincode
The easiest way to deploy a chaincode is to do it from you local environment before you push the app to bluemix. We made a script that deploys the chaincode and stores the chaincodeID in a file. After that you push the app to bluemix (including the chaincodeID file) and you app can interact with the chaincode

Do the following steps to run the application on Bluemix

1. Create a Blockchain Service on Bluemix
2. Update line 10 of the manifest.yaml in the project root folder with the name of the Blockchain service you just created
3. Copy the credentials of the Blockchain Service and save as `credentials.json` in blockchain/deployBluemix
4. Download the tls certificate, you can find the url at the bottom of the credentials.json
5. Save the certificate in blockchain/deployBluemix
6. Copy the cerfificate to `$GOPATH/src/github.com/chaincode/fabric-boilerplate/` and rename the file to certificate.pem

7. Register users and deploy chaincode
go to fabric-boilerplate/blockchain/deployBluemix
> node deployAndRegister.js

(This can take about 30 seconds)

This registers and enrolls the webappadmin user and all users listed in the testData/testData.json file and saves the eCerts in blockchain/deployBluemix/keyValueStore
This also deploys the chaincode and saves the chaincodeID in blockchain/deployBluemix/latest_deployed

8. Deploy app to bluemix
Go back to the project root folder
use the cloud foundry cli, login to you bluemix environment and deploy the app with
> cf push


## NodeJS app
The application is configured to run with nodemon and node-sass to automatically restart the server when you make changes during development.
Make sure you have the npm package `nodemon` installed. You can do so with `sudo npm install -g nodemon`.

> cd [project]  
> npm start

If you want to run it manually, do 'node bin/www'. 

The server will start with deploying the chaincode.

# Troubleshooting

"Error: sql: no rows in result set" or "Error: identity or token do not match". Shutdown your docker container and the nodejs app and run `rm -rf /var/hyperledger/production && rm -rf /tmp/keyValStore` this remove the stored keys/certificates. Now restart the containers and your app. If that alone did not solve it, remove the ubstf_vp_1 and ubstf_membersrvc_1 containers and run `docker-compose up` again and restart the app. 

"Error:Failed to launch chaincode spec(Could not get deployment transaction for ....... - LedgerError - ResourceNotFound: ledger: resource not found)"
The application is setup to use a previously deployed chaincode so you don't have to redploy the chaincode everytime you make a change to the nodeJS app. But sometimes (after restarting you containers for example) it does need to redeploy. To make this happen remove the reference to the old deploy by removing `latest_deployed` file inside the [project]/blockchain/data/ folder. 


# Bluemix
Make sure you have the cloud foundry cli installed. You can install the cf command line interface by following the instruction on https://docs.cloudfoundry.org/cf-cli/install-go-cli.html.

Push the application from the terminal with:
> cf push [application name] -c "node app.js"

You can change the settings of deployment in the manifest.yml file. For instructions on possible parameters have a look at https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html.

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/  
Offical Hyperledger slack channel:  https://hyperledgerproject.slack.com 
IRC:                                #hyperledger on freenode.net  
Working Group Meetings:             https://github.com/hyperledger/hyperledger/wiki/PublicMeetingCalendar  
Wiki:                               https://github.com/hyperledger/hyperledger/wiki   
Learn chaincode:                    https://github.com/IBM-Blockchain/learn-chaincode  