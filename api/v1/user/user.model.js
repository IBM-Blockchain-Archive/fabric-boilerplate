var crypto = require('crypto');
var logger = require('../../../utils/logger');
// Model for User object
/*
    {
        "userId"        :   String,
        "salt"          :   String,
        "hash"          :   String,
        "firstName"     :   String,
        "lastName"      :   String,
        "things"        :   [ thing, thing ],
        "address"       :   String,
        "phoneNumber"   :   String,
        "emailAddress"  :   String,
        "role"          :   Int,
        `
    }

    ROLE is retrieved from Certificate Authority
*/

function User   (   id,
                    password,
                    firstName,
                    lastName,
                    things,
                    address,
                    phoneNumber,
                    emailAddress,
                    role
                ) {
  
    for (var key in arguments){
        if(arguments[key] == null){
            logger.debug(arguments);
            throw new Error('Incorrect arguments for new User.');
        }
    }

    // Attributes for user object
    this.id                 =   id;
    this.firstName          =   firstName;
    this.lastName           =   lastName;
    this.things             =   things;
    // A hash is created based on a salt (random string) and the given password
    this.salt               =   crypto.randomBytes(16).toString('hex');
    this.hash               =   crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    this.address            =   address;
    this.phoneNumber        =   phoneNumber;
    this.emailAddress       =   emailAddress;
    this.role               =   role;

}

var method = User.prototype;

// Add a method to the User prototype
method.example = function() { return true };

module.exports = User;
