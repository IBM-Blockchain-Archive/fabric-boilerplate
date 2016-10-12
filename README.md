# Fabric boilerplate
This is a boilerplate application to get you up and running quickly with your own blockchain application. With this boilerplate you get an application that you can run locally as well as on IBM Bluemix. There is a simple AngularJS frontend application, a NodeJS backend application and of course a blockchain network. Locally, the boilerplate starts up a blockchain network using Docker containers; on Bluemix you can use the Blockchain service.

The boilerplate uses Hyperledger Fabric **v0.5-developer-preview** and **HFC 0.5.4**.

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
1. Pull _peer_ image: `docker pull rikmoedt/fabric-peer:0.5-dp`
2. Pull _membersrvc_ image: `docker pull rikmoedt/fabric-membersrvc:0.5-dp`
3. Pull _fabric-baseimage_ image: `docker pull rikmoedt/fabric-baseimage`
4. Change tag to the _fabric-baseimage_: `docker tag rikmoedt/fabric-baseimage hyperledger/fabric-baseimage` (note: be sure you do not have already an image with the same tag, in that case, rename first the current _hyperledger/fabric-baseimage_ to something else)

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
First run the app locally once. This way nodeSass will create the .css file~~, and the latest version of the chaincode has been copied to the folder inside the $GOPATH. Deploying the application on Bluemix is not yet as easy as we would like. There are two reasons that make it more difficult:~~
Much easier now! :)

### Registering and enrolling users
The SDK needs to register and enroll an admin user and any other users you would like to add. When this takes place the SDK receives enrollment certificates (eCerts) for each user. You only get these certificates once. So if you would redeploy or restart your app on Bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from your local environment before you deploy. When the eCerts are received, you can then push the app to Bluemix, including the eCerts. So the app that runs on Bluemix does not have to register and enroll the users again, because the eCerts are already available.


### Deploying chaincode
We managed to make all the procedure as much automatic as possible. Now you can upload your app and it will deploys on Bluemix and push all testData automatically with one command! (explained below)

Perform the following steps to run the application on Bluemix:

- Create a Blockchain Service on Bluemix
- Update the manifest.yml file (it is in the root of the project):
    - replace the name and host on lines 5 and 6. The values can be anything, as long as they are unique
    - replace the name of the service on line 10. This should be the name of the Blockchain Service you just created
- Copy the credentials of the Blockchain Service and overwrite the credentials in `credentials.json` in _blockchain/deployBluemix_. The suggestion is to get the credentials directly from the Bluemix Blockchain service dashboard.
If you retrieve your Service Credentials from a [new console](https://new-console.ng.bluemix.net/#overview) instance of Bluemix then you will need to edit your credentials.json.  Add `"credentials": {` to line 2 and then add a closing `}` to the final line.
- Download the tls certificate; you can find the url at the bottom of the _credentials.json_
- Save the certificate in `blockchain/deployBluemix`
- Rename the file to `certificate.pem`

**Automatic one-call deployment**

Note: This method is suggested for fresh installations, that is both application and chaincode will be replaced with new ones. Do not use this method if you do not want to bind your application to a new chaincode.

If you want only to push a new version of the application, you have to be sure the _chaincode_id_ file is inside _blockchain/deployBluemix/_ and it contains the correct id.

To avoid the auto-deployment be sure `blockchain/deployBluemix/chaincode_id` exists (do not add it in your .cfignore!).

Viceversa - Remove `blockchain/deployBluemix/chaincode_id` if you want your application to deploy a new chaincode.

Then you can run:

> cf push

For assistance with the cloud foundry cli, visit the [cloud foundry](https://github.com/cloudfoundry/cli#downloads) repo.  There are prerequisites for using the cf cli, such as homebrew.

**Manual deployment**

Note: Use this method to only deploy and invoke testData. This is also very useful in case you register issues with the automatic procedure and you would like to debug and identify the problem.

Run from the root folder of project:

> NODE_ENV=production SERVICE=BLOCKCHAIN_SERVICE_NAME DEPLOYANDEXIT=true GOPATH=$(pwd) GPRC_TRACE=all DEBUG=hfc node app.js

- Open the dashboard of the blockchain service on Bluemix. Wait until you see the chaincode id appear on the `Network` tab.  Ensure that it is running on all four peers and that all the way at the end it says `Up for x seconds/mintues`. After you initial deployment, each of the four peers should have two blocks - genesis block and the deployed chaincode. If this is the case, then your chaincode has been deployed successfully!

Both the methods register and enroll the webappadmin user and all the data listed in the testData/testData.json file and saves the eCerts in `blockchain/deployBluemix/keyValueStore`. This also deploys the chaincode and saves the chaincodeID in `blockchain/deployBluemix/chaincode_id`.

**Debugging**

After the app has been pushed to Bluemix you can view the logs with:
> cf logs [NAME_OF_THE_APP] --recent

Where NAME_OF_THE_APP is the app name you provided in the manifest.yml file

# Debugging chaincode
To check if your chaincode compiles before you deploy it, run `npm run gobuild`

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/    
Official Hyperledger slack channel:  https://hyperledgerproject.slack.com   
IRC:                                #hyperledger on freenode.net    
Working Group Meetings:             https://github.com/hyperledger/hyperledger/wiki/PublicMeetingCalendar    
Wiki:                               https://github.com/hyperledger/hyperledger/wiki     
Learn chaincode:                    https://github.com/IBM-Blockchain/learn-chaincode    
HFC:                                https://www.npmjs.com/package/hfc/
