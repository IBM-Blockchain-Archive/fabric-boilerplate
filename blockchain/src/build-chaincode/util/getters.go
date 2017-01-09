package util

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
	"encoding/json"
	"build-chaincode/entities"
)

func GetCurrentBlockchainUser(stub shim.ChaincodeStubInterface) (entities.Client, error) {
	userIDAsBytes, err := stub.ReadCertAttribute("userID")
	if err != nil {
		return entities.Client{}, errors.New("Could not retrieve user by certificate. Reason: " + err.Error())
	}

	return GetClient(stub, string(userIDAsBytes))
}

func GetThingsByClientID(stub shim.ChaincodeStubInterface, clientID string) ([]string, error) {
	thingsIndex, err := GetIndex(stub, ThingsIndexName)
	if err != nil {
		return []string{}, errors.New("Unable to retrieve thingsIndex, reason: " + err.Error())
	}

	thingIDs := []string{}
	for _, thingID := range thingsIndex {
		thingAsBytes, err := stub.GetState(thingID)
		if err != nil {
			return []string{}, errors.New("Could not retrieve thing for ID " + thingID + " reason: " + err.Error())
		}

		var thing entities.Thing
		err = json.Unmarshal(thingAsBytes, &thing)
		if err != nil {
			return []string{}, errors.New("Error while unmarshalling thingAsBytes, reason: " + err.Error())
		}

		if thing.ClientID == clientID {
			thingIDs = append(thingIDs, thing.ThingID)
		}
	}

	return thingIDs, nil
}

func GetClient(stub shim.ChaincodeStubInterface, username string) (entities.Client, error) {
	consumerAsBytes, err := stub.GetState(username)

	if err != nil {
		return entities.Client{}, errors.New("Could not retrieve information for this client")
	}

	var consumer entities.Client

	err = json.Unmarshal(consumerAsBytes, &consumer)
	if err != nil {
		return entities.Client{}, errors.New("User not a client user, reason: " + err.Error())
	}

	return consumer, nil
}

func GetAllClients(stub shim.ChaincodeStubInterface) ([]entities.Client, error) {
	clientsIndex, err := GetIndex(stub, ClientsIndexName)
	if err != nil {
		return []entities.Client{}, errors.New("Could not retrieve clientIdex, reason: " + err.Error())
	}

	var clients []entities.Client
	for _, clientID := range clientsIndex {
		clientAsBytes, err := stub.GetState(clientID)
		if err != nil {
			return []entities.Client{}, errors.New("Could not retrieve client with ID: " + clientID + ", reason: " + err.Error())
		}

		var client entities.Client
		err = json.Unmarshal(clientAsBytes, &client)
		if err != nil {
			return []entities.Client{}, errors.New("Error while unmarshalling client, reason: " + err.Error())
		}

		clients = append(clients, client)
	}

	return clients, nil
}
