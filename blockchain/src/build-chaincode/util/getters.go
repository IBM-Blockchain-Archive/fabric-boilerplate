package util

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
	"encoding/json"
	"build-chaincode/entities"
)

func GetCurrentBlockchainUser(stub shim.ChaincodeStubInterface) (entities.User, error) {
	userIDAsBytes, err := stub.ReadCertAttribute("userID")
	if err != nil {
		return entities.User{}, errors.New("Could not retrieve user by certificate. Reason: " + err.Error())
	}

	return GetUser(stub, string(userIDAsBytes))
}

func GetThingsByUserID(stub shim.ChaincodeStubInterface, userID string) ([]string, error) {
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

		if thing.UserID == userID {
			thingIDs = append(thingIDs, thing.ThingID)
		}
	}

	return thingIDs, nil
}

func GetUser(stub shim.ChaincodeStubInterface, username string) (entities.User, error) {
	userAsBytes, err := stub.GetState(username)
	if err != nil {
		return entities.User{}, errors.New("Could not retrieve information for this user")
	}

	var user entities.User
	if err = json.Unmarshal(userAsBytes, &user); err != nil {
		return entities.User{}, errors.New("Cannot get user, reason: " + err.Error())
	}

	return user, nil
}

func GetAllUsers(stub shim.ChaincodeStubInterface) ([]entities.User, error) {
	usersIndex, err := GetIndex(stub, UsersIndexName)
	if err != nil {
		return []entities.User{}, errors.New("Could not retrieve userIndex, reason: " + err.Error())
	}

	var users []entities.User
	for _, userID := range usersIndex {
		userAsBytes, err := stub.GetState(userID)
		if err != nil {
			return []entities.User{}, errors.New("Could not retrieve user with ID: " + userID + ", reason: " + err.Error())
		}

		var user entities.User
		err = json.Unmarshal(userAsBytes, &user)
		if err != nil {
			return []entities.User{}, errors.New("Error while unmarshalling user, reason: " + err.Error())
		}

		users = append(users, user)
	}

	return users, nil
}
