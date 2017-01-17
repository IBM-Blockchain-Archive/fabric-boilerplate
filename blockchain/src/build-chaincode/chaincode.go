package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"os"
	"build-chaincode/util"
	"build-chaincode/entities"
)

var logger = shim.NewLogger("fabric-boilerplate")
//======================================================================================================================
//	 Structure Definitions
//======================================================================================================================
//	SimpleChaincode - A blank struct for use with Shim (An IBM Blockchain included go file used for get/put state
//					  and other IBM Blockchain functions)
//======================================================================================================================
type SimpleChaincode struct {
}

//======================================================================================================================
//	Invoke - Called on chaincode invoke. Takes a function name passed and calls that function. Passes the
//  		 initial arguments passed are passed on to the called function.
//======================================================================================================================

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, functionName string, args []string) ([]byte, error) {
	logger.Infof("Invoke is running " + functionName)

	if functionName == "init" {
		return t.Init(stub, "init", args)
	} else if functionName == "resetIndexes" {
		return nil, util.ResetIndexes(stub, logger)
	} else if functionName == "addUser" {
		return nil, t.addUser(stub, args[0], args[1])
	} else if functionName == "addTestdata" {
		return nil, t.addTestdata(stub, args[0])
	} else if functionName == "createThing" {

		thingAsJSON := args[0]

		var thing entities.Thing
		if err := json.Unmarshal([]byte(thingAsJSON), &thing); err != nil {

			return nil, errors.New("Error while unmarshalling thing, reason: " + err.Error())
		}

		thingAsBytes, err := json.Marshal(thing);
		if err != nil {
			fmt.Println("Error marshalling thing, reason: " + err.Error())

			return nil, errors.New("Error")
		}

		util.StoreObjectInChain(stub, thing.ThingID, util.ThingsIndexName, thingAsBytes)

		return nil, nil
	}

	return nil, errors.New("Received unknown invoke function name")
}

//======================================================================================================================
//	Query - Called on chaincode query. Takes a function name passed and calls that function. Passes the
//  		initial arguments passed are passed on to the called function.
//======================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, functionName string, args []string) ([]byte, error) {
	logger.Infof("Query is running " + functionName)

	if functionName == "getUser" {
		consumer, err := util.GetUser(stub, args[0])

		if err != nil {
			return nil, err
		}

		return json.Marshal(consumer)
	} else if functionName == "authenticateAsUser" {
		user, _ := util.GetUser(stub, args[0])

		return json.Marshal(t.authenticateAsUser(stub, user, args[1]))
	} else if functionName == "getThingsByUserID" {
		thingsByUserID, err := util.GetThingsByUserID(stub, args[0])

		if err != nil {
			return nil, errors.New("could not retrieve things by user id: " + args[0] + ", reason: " +
				err.Error())
		}

		resultAsBytes, err := json.Marshal(thingsByUserID)
		if err != nil {
			return nil, errors.New("Could not marshal thingsByUserID result, reason: " +
				err.Error())
		}

		return resultAsBytes, nil
	}

	return nil, errors.New("Received unknown query function name")
}

//======================================================================================================================
//  Main - main - Starts up the chaincode
//======================================================================================================================

func main() {
	// LogDebug, LogInfo, LogNotice, LogWarning, LogError, LogCritical (Default: LogDebug)
	logger.SetLevel(shim.LogInfo)

	logLevel, _ := shim.LogLevel(os.Getenv("SHIM_LOGGING_LEVEL"))
	shim.SetLoggingLevel(logLevel)

	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting SimpleChaincode: %s", err)
	}
}

//======================================================================================================================
//  Init Function - Called when the user deploys the chaincode
//======================================================================================================================

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	return nil, nil
}

//======================================================================================================================
//  Invoke Functions
//======================================================================================================================

func (t *SimpleChaincode) addUser(stub shim.ChaincodeStubInterface, index string, userJSONObject string) error {
	id, err := util.WriteIDToBlockchainIndex(stub, util.UsersIndexName, index)
	if err != nil {
		return errors.New("Error creating new id for user " + index)
	}

	err = stub.PutState(string(id), []byte(userJSONObject))
	if err != nil {
		return errors.New("Error putting user data on ledger")
	}

	return nil
}

func (t *SimpleChaincode) addTestdata(stub shim.ChaincodeStubInterface, testDataAsJson string) error {
	var testData entities.TestData
	err := json.Unmarshal([]byte(testDataAsJson), &testData)
	if err != nil {
		return errors.New("Error while unmarshalling testdata")
	}

	for _, user := range testData.Users {
		err = t.storeObjectInChain(stub, util.UsersIndexName, &user)
		if err != nil {
			return errors.New("error in storing object, reason: " + err.Error())
		}
	}

	for _, thing := range testData.Things {
		err = t.storeObjectInChain(stub, util.ThingsIndexName, &thing)
		if err != nil {
			return errors.New("error in storing object, reason: " + err.Error())
		}
	}

	return nil
}

func (t *SimpleChaincode) storeObjectInChain(chaincodeStub shim.ChaincodeStubInterface, indexName string,
testDataElement entities.TestDataElement) error {
	testDataElementAsJSON, err := json.Marshal(testDataElement)
	if err != nil {
		return errors.New(fmt.Sprintf("Error marshalling %T ", testDataElementAsJSON))
	}

	fmt.Println("adding ", testDataElementAsJSON)

	id, err := util.WriteIDToBlockchainIndex(chaincodeStub, indexName, testDataElement.ID())
	if err != nil {
		return errors.New(fmt.Sprintf("Error creating new id for %T", testDataElementAsJSON))
	}

	err = chaincodeStub.PutState(string(id), []byte(testDataElementAsJSON))
	if err != nil {
		return errors.New(fmt.Sprintf("Error putting %T data on ledger", testDataElementAsJSON))
	}

	return nil;
}

//======================================================================================================================
//		Query Functions
//======================================================================================================================

func (t *SimpleChaincode) authenticateAsUser(stub shim.ChaincodeStubInterface, user entities.User,
passwordHash string) (entities.UserAuthenticationResult) {
	if user == (entities.User{}) {
		fmt.Println("User not found")
		return entities.UserAuthenticationResult{
			User: user,
			Authenticated: false,
		}
	}

	if user.Hash != passwordHash {
		fmt.Println("Hash does not match")
		return entities.UserAuthenticationResult{
			User: user,
			Authenticated: false,
		}
	}

	return entities.UserAuthenticationResult{
		User: user,
		Authenticated: true,
	}
}

