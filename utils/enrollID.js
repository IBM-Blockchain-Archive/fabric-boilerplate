'use strict';
const jwt = require('jsonwebtoken');

// Get current userName
exports.getID = function(request){
    return jwt.decode(request.headers['x-access-token']).id
};
