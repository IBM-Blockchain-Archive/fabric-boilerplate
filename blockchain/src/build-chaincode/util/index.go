package util

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
	"encoding/json"
)

var UsersIndexName = "_users"
var ThingsIndexName = "_things"

var indexNames = []string{
	UsersIndexName,
	ThingsIndexName,
}

func WriteIDToBlockchainIndex(stub shim.ChaincodeStubInterface, indexName string, id string) ([]byte, error) {
	index, err := GetIndex(stub, indexName)
	if err != nil {
		return nil, err
	}

	index = append(index, id)

	jsonAsBytes, err := json.Marshal(index)
	if err != nil {
		return nil, errors.New("Error marshalling index '" + indexName + "': " + err.Error())
	}

	err = stub.PutState(indexName, jsonAsBytes)
	if err != nil {
		return nil, errors.New("Error storing new " + indexName + " into ledger")
	}

	return []byte(id), nil
}

func ResetIndexes(stub shim.ChaincodeStubInterface, logger *shim.ChaincodeLogger) error {
	for _, indexName := range indexNames {
		// Marshal the index
		var emptyIndex []string

		empty, err := json.Marshal(emptyIndex)
		if err != nil {
			return errors.New("Error marshalling")
		}

		err = stub.PutState(indexName, empty);
		if err != nil {
			return errors.New("Error deleting index")
		}

		logger.Infof("Delete with success from ledger: " + indexName)
	}

	return nil
}

func GetIndex(stub shim.ChaincodeStubInterface, indexName string) ([]string, error) {
	indexAsBytes, err := stub.GetState(indexName)
	if err != nil {
		return nil, errors.New("Failed to get " + indexName)
	}

	var index []string
	err = json.Unmarshal(indexAsBytes, &index)
	if err != nil {
		return nil, errors.New("Error unmarshalling index '" + indexName + "': " + err.Error())
	}

	return index, nil
}

func DoesIDExistInIndex(stub shim.ChaincodeStubInterface, idToRetrieve string, indexName string) (bool, error) {
	index, err := GetIndex(stub, indexName)
	if err != nil {
		return false, err
	}

	for _, indexElement := range index {
		if indexElement == idToRetrieve {
			return true, nil
		}
	}

	return false, nil
}