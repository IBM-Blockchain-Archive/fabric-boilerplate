package main

import (
	"testing"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"build-chaincode/entities"
)

func Test_WillReturnThatUserIsUnauthenticatedWhenUserDoesNotExist(t *testing.T) {
	scc := new(Chaincode)
	resultAsBytes, err := scc.Query(shim.NewMockStub("ex02", scc), "authenticateAsUser", []string{"john", "passw0rd"})

	if err != nil {
		t.Error(err.Error())
	}

	var result entities.UserAuthenticationResult
	err = json.Unmarshal(resultAsBytes, &result)
	if err != nil {
		t.Error(err.Error())
	}

	if result.Authenticated {
		t.Error("User does not exist so should not be authenticated")
	}
}

func Test_WillReturnThatUserIsAuthenticatedWhenUserExists(t *testing.T) {
	scc := new(Chaincode)
	stub := shim.NewMockStub("ex02", scc)
	user := entities.User{
		Hash: "passwordHash",
		Username: "john",
	}
	stub.State[user.Username], _ = json.Marshal(user)
	resultAsBytes, err := scc.Query(stub, "authenticateAsUser", []string{user.Username, user.Hash})

	if err != nil {
		t.Error(err.Error())
	}

	var result entities.UserAuthenticationResult
	err = json.Unmarshal(resultAsBytes, &result)
	if err != nil {
		t.Error(err.Error())
	}

	if !result.Authenticated {
		t.Error("User does exists so it should be authenticated")
	}
}