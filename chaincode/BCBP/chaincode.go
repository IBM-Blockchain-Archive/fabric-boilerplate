package main

import (
	"crypto/md5"
	"crypto/x509"
	"encoding/asn1"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"io/ioutil"
	"net/http"
	"net/url"
	"reflect"
	"strconv"
)

var logger = shim.NewLogger("bcbp")
//==============================================================================================================================
//	 Structure Definitions
//==============================================================================================================================
//	SimpleChaincode - A blank struct for use with Shim (An IBM Blockchain included go file used for get/put state
//					  and other IBM Blockchain functions)
//==============================================================================================================================
type SimpleChaincode struct {
}

type ECertResponse struct {
	OK string `json:"OK"`
}

type User struct {
	UserId       string   `json:"userId"` //Same username as on certificate in CA
	Salt         string   `json:"salt"`
	Hash         string   `json:"hash"`
	FirstName    string   `json:"firstName"`
	LastName     string   `json:"lastName"`
	Things       []string `json:"things"` //Array of thing IDs
	Address      string   `json:"address"`
	PhoneNumber  string   `json:"phoneNumber"`
	EmailAddress string   `json:"emailAddress"`
}

type Thing struct {
	ThingId     string `json:"thingId"`
	Description string `json:"description"`
}

// Variable to hold the name of the current user
var callerUserName string


//=================================================================================================================================
//  Evaluation map - Equivalant to an enum for Golang
//  Example:
//  if(!SomeStatus[strings.ToUpper(status)]) { return nil, errors.New("Status not recognized") }
//=================================================================================================================================
var SomeStatus = map[string]bool{
	"somestatus": true,
}

//TODO:
//-- when used with bluemix, add parameter to assign api url for CA

//=================================================================================================================================
//  Index collections - In order to create new IDs dynamically and in progressive sorting
//  Example:
//    signaturesAsBytes, err := stub.GetState(signaturesIndexStr)
//    if err != nil { return nil, errors.New("Failed to get Signatures Index") }
//    fmt.Println("Signature index retrieved")
//
//    // Unmarshal the signatures index
//    var signaturesIndex []string
//    json.Unmarshal(signaturesAsBytes, &signaturesIndex)
//    fmt.Println("Signature index unmarshalled")
//
//    // Create new id for the signature
//    var newSignatureId string
//    newSignatureId = "sg" + strconv.Itoa(len(signaturesIndex) + 1)
//
//    // append the new signature to the index
//    signaturesIndex = append(signaturesIndex, newSignatureId)
//    jsonAsBytes, _ := json.Marshal(signaturesIndex)
//    err = stub.PutState(signaturesIndexStr, jsonAsBytes)
//    if err != nil { return nil, errors.New("Error storing new signaturesIndex into ledger") }
//=================================================================================================================================
var usersIndexStr = "_users"
var thingsIndexStr = "_things"

var indexes = []string{usersIndexStr, thingsIndexStr}

//==============================================================================================================================
//	Run - Called on chaincode invoke. Takes a function name passed and calls that function. Converts some
//		  initial arguments passed to other things for use in the called function e.g. name -> ecert
//==============================================================================================================================
func (t *SimpleChaincode) Run(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	fmt.Println("run is running " + function)
	return t.Invoke(stub, function, args)
}

func (t *SimpleChaincode) Invoke(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	fmt.Println("invoke is running " + function + "with args")

    // Read user name from args
    callerUserName = args[len(args)-1]

	if function == "init" {
		return t.Init(stub, "init", args)
	} else if function == "reset_indexes" {
		return t.reset_indexes(stub, args)
	} else if function == "add_user" {
		return t.add_user(stub, args)
	} else if function == "add_thing" {
		return t.add_thing(stub, args)
	}

	return nil, errors.New("Received unknown invoke function name")
}

//=================================================================================================================================
//	Query - Called on chaincode query. Takes a function name passed and calls that function. Passes the
//  		initial arguments passed are passed on to the called function.
//
//  args[0] is the function name
//=================================================================================================================================
func (t *SimpleChaincode) Query(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
    fmt.Println("query is running " + function + " with args ")

     // Read user name from args
    callerUserName = args[len(args)-1]

	if args[0] == "get_user" {
		return t.get_user(stub, args[1])
	} else if args[0] == "get_thing" {
		return t.get_thing(stub, args)
	} else if args[0] == "get_all_things" {
		return t.get_all_things(stub, args)
	} else if args[0] == "authenticate" {
		return t.authenticate(stub, args)
	}

	return nil, errors.New("Received unknown query function name")
}

//=================================================================================================================================
//  Main - main - Starts up the chaincode
//=================================================================================================================================

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting SimpleChaincode: %s", err)
	}
}

//==============================================================================================================================
//  Init Function - Called when the user deploys the chaincode
//==============================================================================================================================

func (t *SimpleChaincode) Init(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	return nil, nil
}

//==============================================================================================================================
//  Utility Functions
//==============================================================================================================================
// Utility function to get the username from the caller certificate
func get_cert_username(stub *shim.ChaincodeStub) (string, error) {

//    userName, err := stub.ReadCertAttribute("userName")
//    if err != nil {
//        logger.Infof("Failed to get userName attribute from the certificate")
//		return "", errors.New("Failed to get userName attribute from the certificate")
//	}
//
//    logger.Infof("Successfully got the username attribute from the certificate: " + string(userName))

	return string(callerUserName), nil

}

// "create":  true -> create new ID, false -> append the id
func append_id(stub *shim.ChaincodeStub, indexStr string, id string, create bool) ([]byte, error) {

	indexAsBytes, err := stub.GetState(indexStr)
	if err != nil {
		return nil, errors.New("Failed to get " + indexStr)
	}
	fmt.Println(indexStr + " retrieved")

	// Unmarshal the index
	var tmpIndex []string
	json.Unmarshal(indexAsBytes, &tmpIndex)
	fmt.Println(indexStr + " unmarshalled")

	// Create new id
	var newId = id
	if create {
		newId += strconv.Itoa(len(tmpIndex) + 1)
	}

	// append the new id to the index
	tmpIndex = append(tmpIndex, newId)
	jsonAsBytes, _ := json.Marshal(tmpIndex)
	err = stub.PutState(indexStr, jsonAsBytes)
	if err != nil {
		return nil, errors.New("Error storing new " + indexStr + " into ledger")
	}

	return []byte(newId), nil

}

func calculate_hash(args []string) string {
	var str = ""
	for _, v := range args {
		str += v
	}
	hasher := md5.New()
	hasher.Write([]byte(str))
	return hex.EncodeToString(hasher.Sum(nil))
}

//==============================================================================================================================
//  Certificate Authentication
//==============================================================================================================================

func (t *SimpleChaincode) get_ecert(stub *shim.ChaincodeStub, name string) ([]byte, error) {

	var cert ECertResponse

	response, err := http.Get("http://localhost:5000/registrar/" + name + "/ecert") // Calls out to the HyperLedger REST API to get the ecert of the user with that name

	if err != nil {
		return nil, errors.New("Could not get ecert")
	}

	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body) // Read the response from the http callout into the variable contents

	if err != nil {
		return nil, errors.New("Could not read body")
	}

	err = json.Unmarshal(contents, &cert)

	if err != nil {
		return nil, errors.New("ECert not found for user: " + name)
	}

	return []byte(string(cert.OK)), nil
}

func (t *SimpleChaincode) get_cert_username(stub *shim.ChaincodeStub, encodedCert string) (string, error) {

	decodedCert, err := url.QueryUnescape(encodedCert) // make % etc normal //

	if err != nil {
		return "", errors.New("Could not decode certificate")
	}

	pem, _ := pem.Decode([]byte(decodedCert)) // Make Plain text   //

	x509Cert, err := x509.ParseCertificate(pem.Bytes)

	if err != nil {
		return "", errors.New("Couldn't parse certificate")
	}

	return x509Cert.Subject.CommonName, nil

}

func (t *SimpleChaincode) check_role(stub *shim.ChaincodeStub, encodedCert string) (int64, error) {
	ECertSubjectRole := asn1.ObjectIdentifier{2, 1, 3, 4, 5, 6, 7}

	decodedCert, err := url.QueryUnescape(encodedCert) // make % etc normal //

	if err != nil {
		return -1, errors.New("Could not decode certificate")
	}

	pem, _ := pem.Decode([]byte(decodedCert)) // Make Plain text   //

	x509Cert, err := x509.ParseCertificate(pem.Bytes) // Extract Certificate from argument //

	if err != nil {
		return -1, errors.New("Couldn't parse certificate")
	}

	var role int64
	for _, ext := range x509Cert.Extensions { // Get Role out of Certificate and return it //
		if reflect.DeepEqual(ext.Id, ECertSubjectRole) {
			role, err = strconv.ParseInt(string(ext.Value), 10, len(ext.Value)*8)

			if err != nil {
				return -1, errors.New("Failed parsing role: " + err.Error())
			}
			break
		}
	}

	return role, nil
}

//==============================================================================================================================
//  Invoke Functions
//==============================================================================================================================
func (t *SimpleChaincode) reset_indexes(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    for _,i := range indexes {
        // Marshal the index
        var emptyIndex []string

        empty, err := json.Marshal(emptyIndex)
	    if err != nil {
		  return nil,errors.New("Error marshalling")
	   }
        err = stub.PutState(i,empty);

        if err != nil { return nil, errors.New("Error deleting index") }
        logger.Infof("Delete with success from ledger: "+i)
    }
    return nil, nil
}

func (t *SimpleChaincode) add_user(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	//Args
	//			0				1
	//		  index		user JSON object (as string)

	id, err := append_id(stub, "usersIndexStr", args[0], false)
	if err != nil {
		return nil, errors.New("Error creating new id for user " + args[0])
	}

	err = stub.PutState(string(id), []byte(args[1]))
	if err != nil {
		return nil, errors.New("Error putting user data on ledger")
	}

	return nil, nil
}

func (t *SimpleChaincode) add_thing(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	// args
	// 		0			1
	//	   index	   thing JSON object (as string)

	id, err := append_id(stub, "thingsIndexStr", args[0], false)
	if err != nil {
		return nil, errors.New("Error creating new id for thing " + args[0])
	}

	err = stub.PutState(string(id), []byte(args[1]))
	if err != nil {
		return nil, errors.New("Error putting thing data on ledger")
	}

	return nil, nil

}

//==============================================================================================================================
//		Query Functions
//==============================================================================================================================

func (t *SimpleChaincode) get_user(stub *shim.ChaincodeStub, userID string) ([]byte, error) {

	bytes, err := stub.GetState(userID)

	if err != nil {
		return nil, errors.New("Could not retrieve information for this user")
	}

	return bytes, nil

}

func (t *SimpleChaincode) get_thing(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	//Args
	//			1
	//		thingID

	bytes, err := stub.GetState(args[1])

	if err != nil {
		return nil, errors.New("Error getting from ledger")
	}

	return bytes, nil

}

func (t *SimpleChaincode) get_all_things(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	indexAsBytes, err := stub.GetState(thingsIndexStr)
	if err != nil {
		return nil, errors.New("Failed to get " + thingsIndexStr)
	}
	fmt.Println(thingsIndexStr + " retrieved")

	// Unmarshal the index
	var thingsIndex []string
	json.Unmarshal(indexAsBytes, &thingsIndex)

	var things []Thing
	for _, thing := range thingsIndex {

		bytes, err := stub.GetState(thing)
		if err != nil {
			return nil, errors.New("Unable to get thing with ID: " + thing)
		}

		var t Thing
		json.Unmarshal(bytes, &t)
		things = append(things, t)
	}

	thingsAsJsonBytes, _ := json.Marshal(things)
	if err != nil {
		return nil, errors.New("Could not convert things to JSON ")
	}

	return thingsAsJsonBytes, nil
}

func (t *SimpleChaincode) authenticate(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	// Args
	//	0		1
	//	userId	password


    // TODO
    // - validate passwords?

	var u User

	username := args[0]

	user, err := t.get_user(stub, username)

    // If user can not be found in ledgerstore, return authenticated false
	if err != nil {
		return []byte(`{ "authenticated": false }`), nil
	}

    usernameFromCert, err := get_cert_username(stub)

    // If user certificate can not be found, return authenticated false
	if err != nil {
		return []byte(`{ "authenticated": false }`), nil
	}

    // This check might be redundant
    if (usernameFromCert != username){
        return []byte(`{ "authenticated": false }`), nil
    }

	//Check if the user is an employee, if not return error message
	err = json.Unmarshal(user, &u)
	if err != nil {
		return []byte(`{ "authenticated": false}`), nil
	}

    // Marshal the user object
    userAsBytes, err := json.Marshal(u)
	if err != nil {
		return []byte(`{ "authenticated": false}`), nil
	}

    // Return authenticated true, and include the user object
    str := `{ "authenticated": true, "user": ` + string(userAsBytes) + `  }`

	return []byte(str), nil
}
