// General utilities for chaincode
package utils

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"reflect"
	"github.com/pkg/errors"
	"strconv"
	"crypto/sha256"
	"encoding/hex"
)

var logger = shim.NewLogger("utils")

func main() {
	logger.SetLevel(shim.LogInfo)
}


// Get an object from the world state by id (key)
func Get(stub shim.ChaincodeStubInterface, item interface{}, id string) (error) {
	logger.Infof("Getting %v with id %v", reflect.TypeOf(item), id)
	if id == "" { return errors.New("Id is empty.")}

	b, err := stub.GetState(id)
	if err != nil { return errors.Wrap(err, "Error getting "+reflect.TypeOf(item).Name()+" from ledger: "+id)}

	if string(b) == "" { return errors.New("Not found: "+reflect.TypeOf(item).Name()+" with id "+id)}
	return json.Unmarshal(b, &item)
}

// Put an object onto the world state
func Put(stub shim.ChaincodeStubInterface, object interface{}, indexStr string, id string) (error) {
	// append the id to the array of indexes
	logger.Debugf("Storing %v %v", indexStr, id)

	_, err := append_id(stub, indexStr, id, true)

	if err != nil { return errors.Wrap(err, "Error appending new id "+id+" to "+indexStr) }
	logger.Debugf("Id %v appended to index: %v", id, indexStr)

	// Store the object on the blockchain
	item, err := json.Marshal(object)
	err = stub.PutState(id, item)
	if err != nil { return errors.Wrap(err, "Error putting data into ledger") } // TODO: (determine) is there a rollback of the append_id if this happens?

	logger.Infof("Created %v %v", reflect.TypeOf(object), id)

	return nil
}

// if "toAppend" is false then "id" contains the prefix to create a new ID
func append_id(stub shim.ChaincodeStubInterface, indexStr string, id string, toAppend bool) ([]byte,error) {
	// Retrieve existing index
    logger.Debugf("Appending ID "+id+" in indexes "+indexStr)
	tmpIndex, err := GetIndex(stub, indexStr)
	if err != nil { return nil, errors.Wrap(err, "Error getting "+indexStr) }

	if !toAppend {
		id += strconv.Itoa(len(tmpIndex)+1)
	}


	// Append the id to the index
    _, exists := tmpIndex[id]
	if !exists {
        tmpIndex[id] = true
	}

	// Marshal the index
	jsonAsBytes, err := json.Marshal(tmpIndex)
	if err != nil {
		return nil,errors.Wrap(err, "Error storing new '" + indexStr + "' into ledger")
	}

	// Store the index into the ledger
	err = stub.PutState(indexStr, jsonAsBytes)
	if err != nil {
		return nil,errors.Wrap(err, "Error storing new '" + indexStr + "' into ledger")
	}

	return []byte(id),nil
}

// Create a new id and append to index
func CreateId(stub shim.ChaincodeStubInterface, indexStr string, idPrefix string) ([]byte,error) {
	return append_id(stub, indexStr, idPrefix, false)
}


func GetIndex(stub shim.ChaincodeStubInterface, indexStr string) (map[string]bool, error) {
	indexAsBytes, err := stub.GetState(indexStr)
	if err != nil { return nil,errors.Wrap(err, "Failed to get: " + indexStr)}
	var index map[string]bool
	err = json.Unmarshal(indexAsBytes, &index)
	return index, err
}

// Calculate the hash over an array of strings
func CalculateHash(args []string) string {
	var str = ""
	for _,v := range args {
		str += v
	}
	hasher := sha256.New()
	hasher.Write([]byte(str))
	return hex.EncodeToString(hasher.Sum(nil))
}

// Convert an array to a comma separated string
func ArrayToString(array []string) string {
	if len(array) == 0 { return "" }
	var str = array[0]
	for _,v := range array[1:] {
		str += ", "+v
	}
	logger.Debugf("Array transformed in string "+str)
	return str
}

func GetTypeName(object interface{}) (string) {
	if reflect.TypeOf(object).Kind() == reflect.Slice {
		return reflect.TypeOf(object).Elem().Name()
	}
	return reflect.TypeOf(object).Name()
}
