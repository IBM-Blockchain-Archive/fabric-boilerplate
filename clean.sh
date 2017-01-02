#!/bin/bash
#BLOCKCHAIN_DIR="blockchain/data"
#rm -rf $BLOCKCHAIN_DIR/chaincodeId
#rm -rf $BLOCKCHAIN_DIR/keyValueStore

docker-compose rm -f
docker rm -f -v $(docker ps -a --no-trunc | grep 'go install build-chaincode' | cut -d ' ' -f 1) 2>/dev/null
docker rm -f -v $(docker ps -a | grep 'dev-vp' | awk '{print $1}') 2>/dev/null
docker rmi $(docker images | grep 'dev-vp' | awk '{print $1}') 2>/dev/null
docker rmi $(docker images -qf 'dangling=true') 2>/dev/null
