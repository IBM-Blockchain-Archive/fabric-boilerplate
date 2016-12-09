package query

import (
	"build-chaincode/data"
	"build-chaincode/utils"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/pkg/errors"
	"strconv"
)

var logger = shim.NewLogger("query")

var Functions = map[string]func(shim.ChaincodeStubInterface,[]string)([]byte, error) {
    "authenticate": authenticate,
    "get_user": get_user,
    "get_thing": get_thing,
    "get_all_things": get_all_things,
}

//=================================================================================================================================
//	Query - Called on chaincode query. Takes a function name passed and calls that function. Passes the
//  		initial arguments passed are passed on to the called function.
//
//=================================================================================================================================
func Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	logger.Infof("-- Querying function %v with args %v", function, args)

	return Functions[function](stub, args)

	return nil, errors.New("Received unknown query function name")
}

//=================================================================================================================================
//	 Main - main - Starts up the chaincode
//=================================================================================================================================

func main() {
	// LogDebug, LogInfo, LogNotice, LogWarning, LogError, LogCritical (Default: LogDebug)
	logger.SetLevel(shim.LogDebug)
}

//==============================================================================================================================
//		Query Functions
//==============================================================================================================================

func authenticate(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	userId := args[0]

	logger.Infof("Trying to authenticate user: %v", userId)

	var user data.User
	err := utils.Get(stub, &user, userId)
	if err != nil {
		return []byte(`{ "authenticated": false, "certRole": -1  }`), nil
	}

	userJson, err := json.Marshal(user)
	if err != nil {
		return []byte(`{ "authenticated": false, "certRole": -1  }`), nil
	}

	var str string

    str = `{ "authenticated": true, "certRole": ` + strconv.FormatInt(user.Role, 10) + `,"user": ` + string(userJson) + `}`

	logger.Infof("User %v authenticated with success", userId)

	// validate passwords
	return []byte(str), nil
}

func get_user(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var item data.User
	err := utils.Get(stub, &item, args[0])
	if err != nil { return nil, errors.Wrap(err, "Could not get user") }
	itemJson, err := json.Marshal(item)
	if err != nil { return nil, errors.Wrap(err, "Could not marshal user to json") }
	return itemJson, err
}

func get_thing(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var item data.Thing
	err := utils.Get(stub, &item, args[0])
	if err != nil { return nil, errors.Wrap(err, "Could not get thing") }
	itemJson, err := json.Marshal(item)
	if err != nil { return nil, errors.Wrap(err, "Could not marshal thing to json") }
	return itemJson, err
}

func get_all_things(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	item, err := get_user(stub, []string{args[0]})
	if err != nil {
		return nil, errors.Wrap(err, "Could not get user "+args[0])
	}

	var user data.User
	err = json.Unmarshal(item, &user)
	if err != nil {
		return nil, errors.Wrap(err, "Could not unmarshal user")
	}
	logger.Debugf("Things: %v", user.Things)
	var result []data.Thing
	for _, t := range user.Things {
		objInBytes, _ := get_thing(stub, []string{t})
		var obj data.Thing
		err = json.Unmarshal(objInBytes, &obj)
		if err != nil {
			return nil, errors.Wrap(err, "Error unmarshalling")
		}
		result = append(result, obj)
	}
	return json.Marshal(result)
}
