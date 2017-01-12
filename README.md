# Fabric boilerplate
This is a boilerplate application to get you up and running quickly with your own blockchain application. With this boilerplate you get an application that you can run locally as well as on IBM Bluemix. There is a simple AngularJS frontend application, a NodeJS backend application and of course a blockchain network. Locally, the boilerplate starts up a blockchain network using Docker containers; on Bluemix you can use the Blockchain service.

The boilerplate uses Hyperledger Fabric **v0.6.1-developer-preview** and **HFC 0.6.5**.

This boilerplate has been created and is maintained by the IBM CIC Groningen Blockchain team

## Prerequisites
- [Go](https://golang.org/)
- [Govend](https://github.com/govend/govend) 
Once you have installed _go_, you can download the package with `go get -u github.com/govend/govend`.
**Important:** Be sure your `GOPATH` variable is defined, the directory exists, you have the right permissions to read/write in it and the installation (command above) completes correctly (empty output in console). Furthermore, to be able to use `govend` bin to download the _vendor_ directory, you need to add your `GOPATH/bin` to the global `PATH` variable. For instance, add them to *.bash_profile* or *.profile* (e.g.):
```
export GOPATH=/whatever/directory/you/want
# e.g. /home/john/gopath  or  /Users/John/mygopath
export PATH=$PATH:$GOPATH/bin
```
**Important:** Remember to restart any instance of terminal running in order to apply the changes.

You can test the installation running the following command (once you cloned the project):
`npm run installgo`

**Please pay attention to this step or you will not be able to build your chaincode.**
- [NodeJS](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Nodemon](https://github.com/remy/nodemon)

Once you have installed _node_ and _npm_, you can install the module with: `npm install nodemon -g`

## Preparing your environment

### Cloning and installing
Use git clone from your preferred workspace folder to clone your project-code with:  
1. git clone https://github.com/IBM-Blockchain/fabric-boilerplate.git   
2. cd `fabric-boilerplate` and run `npm install`  

### Setting up Hyperledger Fabric
1. Pull _peer_ image: `docker pull hyperledger/fabric-peer:x86_64-0.6.1-preview`
2. Pull _membersrvc_ image: `docker pull hyperledger/fabric-membersrvc:x86_64-0.6.1-preview`
3. Pull _fabric-baseimage_ image: `docker pull hyperledger/fabric-baseimage:x86_64-0.2.1` (note: be sure you do not have already an image with the same tag, in that case, rename/tag first the current _hyperledger/fabric-baseimage_ to something else)
4. Change tag to the _fabric-baseimage:xx_ to _latest_: `docker tag hyperledger/fabric-baseimage:x86_64-0.2.1 hyperledger/fabric-baseimage:latest`
This will prepare a docker baseimage in which the chaincode will be launched and deployed.

**Important:** Be sure after all the above procedure you have the following docker images (with correct commit code) in `docker images`:
```
hyperledger/fabric-baseimage    latest                 930520b2a511
hyperledger/fabric-baseimage    x86_64-0.2.1           930520b2a511
hyperledger/fabric-membersrvc   x86_64-0.6.1-preview   b3654d32e4f9
hyperledger/fabric-peer         x86_64-0.6.1-preview   21cb00fb27f4
```

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

To make local development easier there is a script that will cleanup your environment, start the blockchain network and run the app. From your _WORKSPACE/fabric-boilerplate_ folder:

**Warning:** This script ask you either to clean or not your environment. Be aware answering **yes** you will **permanently deleted** all your containers (not images).

> ./start.sh

## Running on Bluemix
First run the following:
```
npm run build-css
```
This way _node-sass_ will create the complete _.css_ file composing all the _.scss_ ones.

### Registering and enrolling users
The SDK needs to register and enroll an admin user and any other users you would like to add. When this takes place the SDK receives enrollment certificates (ECerts) for each user. You only get these certificates once. So if you would redeploy or restart your app on Bluemix and the SDK wants to register and enroll the users again this would fail. Our solution to this problem is to register and enroll the users from your local environment before you deploy. When the ECerts are received, you can then push the app to Bluemix, including the ECerts. So the app that runs on Bluemix does not have to register and enroll the users again, because the ECerts are already available.

### Deploying chaincode
We managed to make all the procedure as much automatic as possible. Now you can upload your app and it will deploys on Bluemix and push all testData automatically with one command! (explained below)

Perform the following steps to run the application on Bluemix:

1. Create a Blockchain Service on Bluemix
2. Update the _manifest.yml_ file (it is in the root of the project):
    - replace the name and host. The values can be anything, as long as they are unique
    - replace the name of the service. This should be the name of the Blockchain Service you just created
3. Copy the credentials of the Blockchain Service and overwrite the credentials in `credentials.json` in _blockchain/deployBluemix_. The suggestion is to get the credentials directly from the Bluemix Blockchain service dashboard.
If you retrieve your Service Credentials from a [console](https://new-console.ng.bluemix.net/) instance of Bluemix then you will need to edit your _credentials.json_.  Add `"credentials": {` to line 2 and then add a closing `}` to the final line.
4. Download the TLS certificate; you can find the url at the bottom of the _credentials.json_
5. Rename the file to `certificate.pem`
6. Save the certificate in `src/build-chaincode` and `blockchain/deployBluemix`

**Deployment and uploading procedure**

The first and fundamental operation to do in the beginning is to register and enroll all the users, in order to collect all their private keys which are going to be used every time the application communicates with the _Member Service_.
Therefore, we will procede with 2 separated steps:
1. Deployment of the chaincode (and it includes registering and enrolling all the users and adding all the data contained in `testData.json`)
2. Uploading of the app to your Bluemix space

**1. Deployment**

This will:
- Register and enroll users to the _Bluemix MemberService_. That means, _WebAppAdmin_ user plus all the others listed in `testData.json`.
It also saves the ECerts (private keys) in `blockchain/deployBluemix/keyValStore-[SHORT_ID_YOUR_NETWORK]`.
- Send a deploy request to one of your _Bluemix Peer_. That means, deploying the chaincode and it also stores the _chaincodeID_ in `blockchain/deployBluemix/chaincode_id`.
- Send an invoke request (with all the test data) to one of your _Bluemix Peer_.
Run from the root folder of project:
```
npm run deploy
```
Then open the dashboard of the blockchain service on Bluemix. Wait until you see the chaincode id appear on the `Network` tab.  Ensure that it is running on all four peers and that all the way at the end it says `Up for x seconds/minutes`. If this is the case, then your chaincode has been deployed successfully!

**Note:** It can take 2-3 minutes.

**IMPORTANT:** Do not remove the keys once they are generated or it will be necessary to recreate the blockchain service, as the keys are unique and the _membersrvc_ will not create again for the same user once he is in its list.


**2. Uploading app**

This will push the app to your Bluemix space.

**IMPORTANT:** Be sure your `manifest.yml` is configured correctly before executing the command below.

**Note:** If you only want to push a new version of the application, you have to be sure the *chaincode_id* file is inside `blockchain/deployBluemix` and it contains the correct id listed under your bluemix blockchain service.

To avoid the auto-deployment be sure `blockchain/deployBluemix/chaincode_id` exists (do not add it in your `.cfignore`!).

Viceversa - Remove `blockchain/deployBluemix/chaincode_id` if you want your application to deploy a new chaincode.


Run from the root folder of project:
```
npm run push

```
For assistance with the cloud foundry cli, visit the [cloud foundry](https://github.com/cloudfoundry/cli#downloads) repo.  There are prerequisites for using the cf cli, such as homebrew.

**Debugging**

After the app has been pushed to Bluemix you can view the logs with:
```
cf logs [NAME_OF_THE_APP] --recent
```
Where `NAME_OF_THE_APP` is the app name you provided in the `manifest.yml` file

# Debugging chaincode
To check if your chaincode compiles before you deploy it, run `npm run gobuild`

# Troubleshooting
**T:** I have troubles with registering and enrolling users / Login / Invoking and Querying / I get the following errore in console `msg: 'Error:Failed to launch chaincode spec(Could not get deployment transaction for ... - LedgerError - ResourceNotFound: ledger: resource not found)' }`

**S:** Check `govend` is installed correctly (Prerequisites, `npm run installgo`) and you have a `vendor` directory under `src/build-chaincode`.
If everything is good with your _vendors_, try to run `npm run gobuild` and see if you are able to build your chaincode, to be sure there are no errors in your code.
If any of these steps help, search for a similar error in the issues section and open eventually a new one.

**T:** I am using a Windows machine and I have troubles running `npm install` / `node-gyp` .

**S:** Consider to have all the necessary to build node modules on Windows. Have a look at this [discussion](https://github.com/IBM-Blockchain/fabric-boilerplate/issues/7).

**T:** I can build the chaincode in local with `go build` or `npm run gobuild`; the server logs state my chaincode was successfully deployed and it returns a chaincode id; the app is up and running and I can browse the login page. Nevertheless:

I cannot login / During the deployment phase I have the following log from one of my peers:
```
Step 1 : FROM hyperledger/fabric-baseimage
Pulling repository docker.io/hyperledger/fabric-baseimage

********************
14:10:16.370 [dockercontroller] deployImage -> ERRO 01f Error building images: Tag latest not found in repository docker.io/hyperledger/fabric-baseimage
14:10:16.370 [dockercontroller] deployImage -> ERRO 020 Image Output:
```
or
```
Step 1 : FROM hyperledger/fabric-baseimage
---> 7cfcd874dfa0
Step 2 : COPY . $GOPATH/src/build-chaincode/
---> 756380302601
Removing intermediate container c656bb6a30db
Step 3 : WORKDIR $GOPATH
---> Running in a1bfaaf2fbb4
---> 35add88b3768
Removing intermediate container a1bfaaf2fbb4
Step 4 : RUN go install build-chaincode && cp src/build-chaincode/vendor/github.com/hyperledger/fabric/peer/core.yaml $GOPATH/bin && mv $GOPATH/bin/build-chaincode $GOPATH/bin/cde006ac528126c74bf3fb5467a8af93fb6f0254929bfb102911f40d77bbab11
---> Running in 1ebcca6f4c47
src/build-chaincode/utils/utils.go:5:2: cannot find package "github.com/hyperledger/fabric/core/chaincode/shim" in any of:
/opt/go/src/github.com/hyperledger/fabric/core/chaincode/shim (from $GOROOT)
/opt/gopath/src/github.com/hyperledger/fabric/core/chaincode/shim (from $GOPATH)
src/build-chaincode/utils/utils.go:8:2: cannot find package "github.com/pkg/errors" in any of:
/opt/go/src/github.com/pkg/errors (from $GOROOT)
/opt/gopath/src/github.com/pkg/errors (from $GOPATH)
```
The server logs something like:
```
error: [SDK] error on query: {"error":{"code":2,"metadata":{"_internal_repr":{}}},"msg":"Error: sql: no rows in result set"}
error:
{ error: { code: 2, metadata: { _internal_repr: {} } },
msg: 'Error: sql: no rows in result set' }
(node:25810) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 13): [object Object]
```

**S:** You are probably using a wrong version of the `fabric-baseimage`. Please go back to _Setting up Hyperledger Fabric_ section and follow carefully all the steps.

**T:** I deployed the application on Bluemix, I can see the chaincode deployed correctly and the application running and accessible, nevertheless **I cannot login**.

**S:** That can be caused by a wrong deployment (due to a bad connection, for instance).
Check into the logs of your application running on Bluemix if there is any meaningful error.
Be sure you have under `blockchain/deployBluemix/keyValStore-[SHORT_ID_YOUR_NETWORK]` the keys for each user you try to login with.
Check that into the logs of your chaincode container on the Bluemix service you have the complete output of the invoke request starting with:
`[invoke] INFO : -- Invoking function add_test_data with args`.

A possible way to solve the issue is doing the following:
1. Remove the *chaincode_id* file
2. Deploy again
3. Push the application again (which will contain the updated _chaincodeID_)

If the problem persists, look first for similar discussions about that issue and eventually open a new one.

# Support and documentation
[Hyperledger project](https://www.hyperledger.org/)

[Hyperleder Fabric Complete Doc](https://hyperledger-fabric.readthedocs.io/en/latest/)

[Official Hyperledger slack channel](https://hyperledgerproject.slack.com)

[IRC](freenode.net) channel #hyperledger

[Working Group Meetings](https://wiki.hyperledger.org/community/calendar-public-meetings)

[Hyperledger Fabric Wiki](https://wiki.hyperledger.org/) 

[Learn chaincode](https://github.com/IBM-Blockchain/learn-chaincode)

[Hyperldger Fabric Client SDK (HFC)](https://fabric-sdk-node.readthedocs.io/en/latest/)