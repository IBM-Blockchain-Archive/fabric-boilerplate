#!/bin/bash
DIR="$(pwd)"
BC="$DIR/blockchain"
NETWORK_PEER="dev-"

printf "###################################################\n"
printf "#####     HYPERLEDGER FABRIC START SCRIPT     #####\n"
printf "###################################################\n\n"

clear_all() {
    rm $BC/deployLocal/latest_deployed 2>/dev/null
    printf "Latest deployed removed\n"

    rm -rf /var/hyperledger/production && rm -rf $BC/deployLocal/keyValueStore 2>/dev/null
    printf "keyValStore and var files removed\n"

    docker rm -f $(docker ps -a -q) 2>/dev/null
    printf "All docker containers removed\n"

    docker rmi `docker images | grep $NETWORK_PEER | awk '{print $1}'` 2>/dev/null
    printf "All chaincode images removed\n"
    docker rmi $(docker images -qf "dangling=true") 2>/dev/null
    printf "All untagged images removed\n"
}
ask() {
  local response
  local msg="${1:-$1} [Y/N] "; shift
  read -r $4 -p "$msg" response || echo
  case "$response" in
    [yY][eE][sS]|[yY]) $1 ;;
    *) $2 ;;
  esac
}
ask "Do you want to clear the environment?" clear_all return
# run docker-compose
docker-compose up -d 2>/dev/null
printf "Starting docker containers...\n"
sleep 10
printf "Docker containers up and running\n"
# start server, catch ctrl+c to clean up
trap 'kill -TERM "$PID" 2>/dev/null' SIGINT
npm run start &
PID=$!
wait $PID
ask "Do you want to clear the environment?" clear_all return
exit 0
