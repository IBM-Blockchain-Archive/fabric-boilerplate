'use strict';
const jwt = require('jsonwebtoken');

// Get current blockchain height
exports.getID = function(request){
    return jwt.decode(request.headers['x-access-token']).userId
};
