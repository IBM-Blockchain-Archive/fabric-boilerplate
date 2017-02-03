package invokeAndQuery

import (
	"build-chaincode/entities"
	"build-chaincode/util"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type Users struct {
	ChaincodeStub shim.ChaincodeStubInterface
}

func (t *Users) GetAll() (entities.Users, error) {
	users, err := util.GetAllUsers(t.ChaincodeStub)
	if err != nil {
		return entities.Users{}, err
	}

	return entities.Users {
		Users: users,
	}, nil
}