# Migrating from openblockchain to Hyperledger
As of 28-04-2016 this project runs with the Hyperledger fabric instead of the Openblockchain fabric.

This readme is updated and if you started fresh you can follow along  like normal, but if you already run the openblockchain fabric here a instructions to migrate:
Install the fabric like its a new project, follow:
- Installing Hyperledger locally
- Building Hyperledger
- Running Hyperledger

After that follow the instructions below to update "membersrvc.yaml", "core.yaml" and "Vagrantfile".
After you have updated both the yaml files, you might need to re-build the peer and memberservice.

Follow the updated instructions below to startup the certificate authority and your peer.

You can delete the old "$GO_Path/src/github.com/openblockchain" and the "obc-dev-env" (from you workspace) folder.

# Preparing your environment

Please follow the following steps to set up a local sandbox environment for development.

##Installing Hyperledger locally
Follow these steps: https://github.com/hyperledger/fabric/blob/master/docs/dev-setup/devenv.md

##Building Hyperledger
Follow these steps: https://github.com/hyperledger/fabric/blob/master/README.md

##Running Hyperledger
Follow these steps: https://github.com/hyperledger/fabric/blob/master/docs/API/SandboxSetup.md

#Clone this repo
To run the whole sandbox environment locally, we suggest you go for the following folder setup, based on the instructions for setting up the development environment:

Example:
WORKSPACE/  
---[project]/  
------app.js  
------blockchain/  
---------blockchain.js  
---------chaincodeconfig.js 
------chaincode/
---------[project-chaincode]/
-------------chaincode.go
------client/  
---[general-chaincode]/  
------[project-chaincode]/   
---------chaincode.go

Where [project] and [project-chaincode] are your respective project name and chaincode folder name.

Important: Note that [general-chaincode] is in tree-view at the same level of your [project]. It will contain all the chaincode file (divided by subdirectories) of your blockchain projects (considering you could have multiple).

Use git clone from the WORKSPACE folder to clone your project-code and your chaincode with:
1. git clone [ project git url ]
2. git clone [ chaincode git url ] or copy the chaincode file from you project-code/chaindcode folder
3. cd project-code && npm install

### Replace memberships list
Important: you need to replace the “membersrvc.yaml” file in “$GO_Path/src/github.com/hyperledger/fabric/membersrvc/” with the yaml file from the “project-code/chaincode” folder

### Enable security
Important: you need to enable security by changing a line in the file "$GO_Path/src/github.com/hyperledger/fabric/peer/core.yaml". On line 383 set the boolean for "enabled" to "true".

### Synchronize Vagrant chaincode folder with your local one
Important: you need to add the following line to "$GO_Path/src/github.com/hyperledger/fabric/devenv/Vagrantfile" in order to make the chaincode accessible inside the Vagrant box. Replace "LOCAL_PATH_TO_CHAINCODE_FOLDER" with the path to you chaincode:
  
> config.vm.synced_folder "LOCAL_PATH_TO_CHAINCODE_FOLDER", "/opt/gopath/src/chaincode"

LOCAL_PATH_TO_CHAINCODE_FOLDER should point to your [general-chaincode] directory, while you can keep the same path for the second argument. For instance:
> config.vm.synced_folder "/home/user/WORKSPACE/general-chaincode", "/opt/gopath/src/chaincode"

and your [project] directory should be (in this specific case) in "/home/user/WORKSPACE/" as well.

### Set up chaincode config file
In chaincodeconfig.js (in [project]/blockchain) the git url is the [general-chaincode] directory above with its subdirectories. So, whether you have your [general-chaincode] written in "WORKSPACE/chaincode" the git url should be '[chaincodefolder]/project'.
Chaincodeconfig.js has the location of the chaincode git repo (to deploy to bluemix) OR the location on your filesystem of the chaincode.

This is an overview of the local settings for chaincodeconfig.js based on the above folder configuration:
chaincode:{
    zip_url: 'http://localhost:8080/cc.zip', 	        // routes/serve_chaincode_zip
    unzip_dir: '[project]', 							// subdirectroy of chaincode after unzipped
    git_url: 'chaincode/[project-chaincode]',           // File url in the obc-dev-env container: $GOPATH/src/...
    deployed_name: null,     						    // hashed cc name from prev deployment. Makes sure no redeploy is needed!
    global_path: '../chaincode/[project-chaincode]',    // the path to the chaincode dir on this machine.
    local_path: 'chaincode/[project-chaincode]',        // the path to your local chaincode related to the specific project
    auto_redeploy: true, 						        // watch the filesystem for changes
    invoke_test_data: true 					            // Whether it should fill the chaincode with test data after deployment or not.
}

# Architecture 
The 'server' directory contains a NodeJS server. The connection to the blockchain is managed from the blockchain subdirectory.

Credentials.json has the connection details for the IBM Blockchain service. 


# Running Local Blockchain nodes
Go to the "$GO_Path/src/github.com/hyperledger/fabric/devenv" directory in your terminal and type:

`vagrant ssh`

If you have used the correct folder structure as described above you can start the vagrant box with your chaincode directory in the WORKSPACE directory mounted in it under the following folder:

Repeat the step above to start a second vagrant ssh session, and in the two different vagrant ssh sessions you do the following:

1: (certificate authority)  
cd $GOPATH/src/github.com/hyperledger/fabric/membersrvc  
./membersrvc  
2: (peer)  
cd $GOPATH/src/github.com/hyperledger/fabric/peer  
./peer peer  

The obcca-server and obc-peer should already be build while running the instructions above. Again, read the openblockchain instructions for more info. When it's running you can start the server.

If you are getting a "protocol error" change the security setting on your local "$GOPATH/src/github.com/" folder so Vagrant has access to it.

# NODEJS SERVER

The nodejs application is configured to run locally for development and on bluemix for production.

## Local

### Nodemon
The application is configured to run with nodemon and node-sass to automatically restart the server when you make changes during development.
Make sure you have the npm package `nodemon` installed. You can do so with `sudo npm install -g nodemon`.

> cd [project-folder]  
> npm start

If you want to run it manually, do 'node bin/www'. 

The server will start with deploying the chaincode.

## Bluemix

Make sure you have the cloud foundry cli installed. You can install the cf command line interface by following the instruction on https://docs.cloudfoundry.org/cf-cli/install-go-cli.html.

Push the application from the terminal with:
> cf push [application name] -c "node app.js"

You can change the settings of deployment in the manifest.yml file. For instructions on possible parameters have a look at https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html.

# Debug

## Swagger UI

### Installing

Follow these steps: https://github.com/hyperledger/fabric/blob/master/docs/API/CoreAPI.md#using-swagger-js-plugin

### Running it

Follow these steps in your terminal (locally): 
> cd /opt/gopath/src/github.com/hyperledger/fabric/core/rest
> http-server -a 0.0.0.0 -p 5554 --cors

Navigate to the /swagger-ui/dist directory and click on the index.html file to bring up the Swagger-UI interface inside your browser.
> Type in the address http://localhost:5554/rest_api.json and click Explore.

## Chaincode debug

To see the logging of your chaincode:
1. Run your app
2. Start a seperate 'vagrant ssh' session
3. Run 'docker ps'
4. Copy the newest docker image name (it is the first one, the name looks something like this: dev-jdoe-c814cf80954dccf7334db9d3ad765009376fed5d742cda0479c75e245e2d85aa770157225034b272d2188b80eb91d07726f663c3f743200c12d2c6c20c52b02b)
5. Run 'docker attach IMAGE_NAME' 

# Support and documentation
Hyperledger project:                https://www.hyperledger.org/
Offical Hyperledger slack channel:  https://hyperledgerproject.slack.com  (register with your IBM e-mail)
IRC:                                #hyperledger on freenode.net
Working Group Meetings:             https://github.com/hyperledger/hyperledger/wiki/PublicMeetingCalendar
Wiki:                               https://github.com/hyperledger/hyperledger/wiki
IBM Blockchain JS SDK:              https://github.com/IBM-Blockchain/ibm-blockchain-js
Learn chaincode:                    https://github.com/IBM-Blockchain/learn-chaincode