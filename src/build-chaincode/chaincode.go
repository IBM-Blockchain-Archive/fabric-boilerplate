package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"os"
	"build-chaincode/query"
	"build-chaincode/invoke"
)

type SimpleChaincode struct {}

var logger = shim.NewLogger("fabric-boilerplate")

// Init - is called when the chaincode is deployed
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	bytes, err := invoke.Init(stub, function, args)
	if err != nil { logger.Errorf("Error invoking Init: %v \n %v", function, err) }
	return bytes, err
}

// Invoke - handles all the invoke functions
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	bytes, err := invoke.Invoke(stub, function, args)
	if err != nil { logger.Errorf("Error invoking %v: %v", function, err) }
	return bytes, err
}

// Query - handles all the query functions
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	bytes, err := query.Query(stub, function, args)
	if err != nil { logger.Errorf("Error querying %v: %v", function, err) }
	return bytes, err
}

// Main - starts up the chaincode
func main() {
	logger.SetLevel(shim.LogInfo)

	logLevel, _ := shim.LogLevel(os.Getenv("SHIM_LOGGING_LEVEL"))
	shim.SetLoggingLevel(logLevel)

	err := shim.Start(new(SimpleChaincode))
	if err != nil { logger.Errorf("Error starting chaincode:", err) }
}
