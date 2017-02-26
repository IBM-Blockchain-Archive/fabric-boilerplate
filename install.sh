#!/bin/bash -e
hash docker || (echo "Please install docker first"; exit 1;)
hash docker-compose || (echo "Please install docker-compose first"; exit 1;)

echo "Getting baseimage..."
docker pull hyperledger/fabric-baseimage:x86_64-0.2.2
docker tag hyperledger/fabric-baseimage:x86_64-0.2.2 hyperledger/fabric-baseimage:latest

echo "Downloading go dependencies..."
docker-compose run utils bash -c 'cd blockchain/src/build-chaincode && GOPATH=$(pwd)/../.. govend -v' && sudo chown -R $USER blockchain

echo "Downloading images..."
docker-compose pull

echo "Building images..."
docker-compose build

echo "Done! Start with docker-compose up."