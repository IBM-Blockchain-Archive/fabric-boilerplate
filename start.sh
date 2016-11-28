#!/bin/bash
DIR="$(pwd)"
# Change to the project name
PROJECT="$(pwd)"
BC="$DIR/blockchain"

printf "\nProject: $PROJECT \n"
printf "Current directory: $DIR \n"
printf "Blockchain directory: $BC \n"

clear_all()
{
    rm $BC/deployLocal/chaincode_id 2>/dev/null
    printf "Latest deployed removed\n"
    
    rm -rf $BC/deployLocal/keyValueStore 2>/dev/null
    printf "keyValStore and var files removed\n"
    
    docker rm -f $(docker ps -a -q) 2>/dev/null
    printf "All docker containers removed\n"
    
    docker rmi $(docker images | grep "dev-" | awk '{print $1}') 2>/dev/null
    docker rmi $(docker images -qf "dangling=true") 2>/dev/null
    printf "All docker useless images removed\n"
}

clear_all

# run docker-compose
docker-compose up -d 2>/dev/null
printf "Starting docker containers...\n"
sleep 10
printf "Docker containers up and running\n"

# start server, catch ctrl+c to clean up
trap 'kill -TERM "$PID" 2>/dev/null' SIGINT
npm start &
PID=$!
wait $PID

clear_all

exit 0
