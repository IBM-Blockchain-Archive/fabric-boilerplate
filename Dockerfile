#
#
# Build server and cient. Allows you to deploy chaincode with
# cd server && npm run deploy
#
# And to deploy the server and client to Bluemix with
# cf push.
#
# You can also use this container to do stuff like
# cf logs
#
FROM cesarev/fabric-boilerplate
RUN npm install -g grunt angular-cli
RUN apt-get update && apt-get install nano
RUN mkdir /usr/src/app/blockchain \
 && mkdir /usr/src/app/client \
 && mkdir /usr/src/app/server

# BLOCKCHAIN go
# NOTE: commented out because it only works if you have the chaincode here..
#ADD blockchain/src/build-chaincode/vendor.yml /tmp/src/build-chaincode/vendor.yml
#RUN cd /tmp/src/build-chaincode \
# && GOPATH=/tmp govend -v \
# && mv /tmp/src /usr/src/app/blockchain/src

# SERVER npm
ADD server/package.json /tmp/package.json
RUN cd /tmp \
 && npm install \
 && mv /tmp/node_modules /usr/src/app/server/node_modules

# CLIENT npm
ADD client/package.json /tmp/package.json
RUN cd /tmp \
 && npm install \
 && mv /tmp/node_modules /usr/src/app/client/node_modules

# RUN rm -rf /tmp/*
ENV API_ENDPOINT "https://api.eu-gb.bluemix.net"
ENV GOPATH "/usr/src/app/blockchain"
ENV NODE_ENV "production"

ADD . /usr/src/app

# Govend if needed
RUN cd blockchain/src/build-chaincode && govend -rtv

# Build server and client
RUN cd server && grunt build
RUN cd client && ng build --prod

# Set CloudFoundry url
RUN cf api $API_ENDPOINT

# Login and drop into shell
ENTRYPOINT cf login && bash