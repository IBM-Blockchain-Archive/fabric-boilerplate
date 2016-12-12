// General utilities for chaincode
package data

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"build-chaincode/utils"
	"encoding/json"
	"github.com/pkg/errors"
)

var logger = shim.NewLogger("data")

func main() {
	logger.SetLevel(shim.LogInfo)
}

var indexStrings = map[string]string{
	"User":              "_users",
    "Thing":             "_things",
}

// Interface for saveable objects
type BlockchainItemer interface {
	GetId() string // TODO: just make everything have an Id field.
	SetId(string)
	GetIndexStr() string
	GetIdPrefix() string
}

type User struct {
	Id           string   `json:"id"` //Used to register with CA
	Salt         string   `json:"salt"`
	Hash         string   `json:"hash"`
	FirstName    string   `json:"firstName"`
	LastName     string   `json:"lastName"`
	Things      []string `json:"things"`
	Address      string   `json:"address"`
	PhoneNumber  string   `json:"phoneNumber"`
	EmailAddress string   `json:"emailAddress"`
	Role         int64    `json:"role"`
}

func (u User) GetId() string         { return u.Id }
func (u User) SetId(id string)       { u.Id = id }
func (u User) GetIdPrefix() string { return "u" }
func (u User) GetIndexStr() string { return indexStrings[utils.GetTypeName(u)] }

type Thing struct {
	Id          string `json:"id"`
	Description string `json:"description"`
}

func (t Thing) GetId() string         { return t.Id }
func (t Thing) SetId(id string)       { t.Id = id }
func (t Thing) GetIdPrefix() string { return "u" }
func (t Thing) GetIndexStr() string { return indexStrings[utils.GetTypeName(t)] }

var ExampleStatus = map[string]bool{
	"CREATED":        	true,
	"UPDATE_REQUIRED":      true,
	"VALIDATION_REQUIRED":  true,
	"EXPIRED": 		true,
	"ACCEPTED":        	true,
	"DECLINED":	 	true,
}

var Roles = map[string]int64{
	"role1":  1,
	"role2":    2,
}

/*
	Public functions

*/

func GetIndexString(objectName string) string {
	idxStr := indexStrings[objectName]
	logger.Debugf("Returning indexstring for %v: %v", objectName, idxStr)
	return idxStr
}


// Save an object to the blockchain (and to the index). Generate an id if it doesn't exist yet.
func Save(stub shim.ChaincodeStubInterface, object BlockchainItemer) error {
	id := object.GetId()
	indexString := object.GetIndexStr()
	idPrefix := object.GetIdPrefix()

	if indexString == "" {
		return errors.New("Indexstring not found")
	}

	if id == "" {
		idBytes, err := utils.CreateId(stub, indexString, idPrefix)
		if err != nil {
			return errors.New("Could not create id")
		}
		id = string(idBytes)
		object.SetId(id)
	}
	return utils.Put(stub, object, indexString, id)
}

// Reset all index strings.
func ResetIndexes(stub shim.ChaincodeStubInterface) error {
	indexes := indexStrings
	logger.Infof("indexes: %v", indexes)
	for _, v := range indexes {
		// Marshal the index
		emptyIndex := make(map[string]bool)

		empty, err := json.Marshal(emptyIndex)
		if err != nil {
			return errors.New("Error marshalling")
		}
		err = stub.PutState(v, empty)

		if err != nil {
			return errors.New("Error deleting index")
		}
		logger.Debugf("Delete with success from ledger: " + v)
	}
	return nil
}
