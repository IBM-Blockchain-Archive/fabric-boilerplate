# Fabric boilerplate
This is a boilerplate application to get you up and running quickly with your own blockchain application. With this boilerplate you get an application that you can run locally as well as on IBM Bluemix. There is a simple AngularJS frontend application, a NodeJS backend application and of course a blockchain network. Locally, the boilerplate starts up a blockchain network using Docker containers; on Bluemix you can use the Blockchain service.

The boilerplate uses Hyperledger Fabric v0.5-developer-preview and HFC 0.5.3.

This boilerplate has been created and is maintained by the IBM CIC Groningen Blockchain team

## Prerequisites
- Go (https://golang.org/)
- Govend (go get -u github.com/govend/govend)
- NodeJS (https://nodejs.org/)
- Docker (https://www.docker.com/)
- Nodemon (npm install nodemon -g)

## Preparing your environment

### Clone this repo
Use git clone from your preferred workspace folder to clone your project-code with:  
1. git clone https://github.com/IBM-Blockchain/fabric-boilerplate.git   
2. cd `fabric-boilerplate` and run `npm install`  

### Setting up Hyperledger

If everything went fine until now, you should have a folder called vendor in src/build-chaincode.  
> bash src/build-chaincode/vendor/github.com/hyperledger/fabric/scripts/provision/docker.sh 0.0.10

This will prepare a docker baseimage in which the chaincode will be launched and deployed. This process takes quite a while.

## Running the application automatically
From your WORKSPACE/fabric-boilerplate folder:

> docker-compose up

This will start up a local blockchain network with two validating peers and a memberservice.
The first time you run this script it will take a little while to download the necessary images.

You can see if your local blockchain network is running by going to `localhost:7050/chain` in your browser.
Once the network is up and running, open a second terminal and from your WORKSPACE/fabric-boilerplate folder:

> npm start

This will start up a NodeJS application that serves the frontend, deploys the chaincode to the network and will register the users with the memberservice. The application is configured to run with nodemon and node-sass to automatically restart the server when you make changes during development.

Check if the app is running at `http://localhost:8080/` in your browser. You can login with the user credentials you find in `testData/testData.json`  


To make local development easier there is a script that will cleanup your environment, start the blockchain network and run the app. From your WORKSPACE/fabric-boilerplate folder:

!Warning: this script removes all the docker containers that are running. If you are using docker for other applications as well at the moment and don't want to lose your container, don't run this script!

> ./start.sh

## Running on Bluemix
First run the app locally once. This way nodeSass will create the .css file, and the latest version of the chaincode has been copied to the folder inside the $GOPATH. Deploying the application on Bluemix is not yet as easy as we would like. There are two reasons that make it more difficult:

### Registering and enrolling users
The SDK needs to register and enroll an admin user and any other users you would like to add. When this takes place the SDK receives enrollment certificates (eCerts) for each user. You only get these certificates once. So if you would redeploy or restart your app on Bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from your local environment before you deploy. When the eCerts are received, you can then push the app to Bluemix, including the eCerts. So the app that runs on Bluemix does not have to register and enroll the users again, because the eCerts are already available.


### Deploying chaincode
The easiest way to deploy a chaincode is to do it from you local environment before you push the app to Bluemix. We made a script that deploys the chaincode and stores the chaincodeID in a file. After that you push the app to Bluemix (including the chaincodeID file) and your app can interact with the chaincode.

Perform the following steps to run the application on Bluemix:

- Create a Blockchain Service on Bluemix
- Update the manifest.yml file (it is in the root of the project):
    - replace the name and host on lines 5 and 6. The values can be anything, as long as they are unique
    - replace the name of the service on line 10. This should be the name of the Blockchain Service you just created
- Copy the credentials of the Blockchain Service and overwrite the credentials in `credentials.json` in blockchain/deployBluemix.  If you retrieve your Service Credentials from a [new console](https://new-console.ng.bluemix.net/#overview) instance of Bluemix then you will need to edit your credentials.json.  Add `"credentials": {` to line 2 and then add a closing `}` to the final line.  Your finished payload should be 202 lines.  

- Register users and deploy chaincode  
Go to fabric-boilerplate/blockchain/deployBluemix
> GOPATH="$(pwd)/../.." node deployAndRegister.js

(This can take about 30 seconds)

This registers and enrolls the webappadmin user and all users listed in the testData/testData.json file and saves the eCerts in blockchain/deployBluemix/keyValueStore. This also deploys the chaincode and saves the chaincodeID in blockchain/deployBluemix/latest_deployed.

- Open the dashboard of the blockchain service on Bluemix. Wait until you see the chaincode id appear on the `Network` tab.  Ensure that it is running on all four peers and that all the way at the end it says `Up for x seconds/mintues`. After you initial deployment, each of the four peers should have two blocks - genesis block and the deployed chaincode. If this is the case, then your chaincode has been deployed successfully!


- Deploy app to Bluemix
Go back to the project root folder.
Use the cloud foundry cli, login to your Bluemix environment and deploy the app with
> cf push

For assistance with the cloud foundry cli, visit the [cloud foundry](https://github.com/cloudfoundry/cli#downloads) repo.  There are prerequisites for using the cf cli, such as homebrew.  

After the app has been pushed to Bluemix you can view the logs with:
> cf logs [NAME_OF_THE_APP] --recent

Where NAME_OF_THE_APP is the app name you provided in the manifest.yml file

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/    
Official Hyperledger slack channel:  https://hyperledgerproject.slack.com   
IRC:                                #hyperledger on freenode.net    
Working Group Meetings:             https://github.com/hyperledger/hyperledger/wiki/PublicMeetingCalendar    
Wiki:                               https://github.com/hyperledger/hyperledger/wiki     
Learn chaincode:                    https://github.com/IBM-Blockchain/learn-chaincode    
HFC:                                https://www.npmjs.com/package/hfc/
