'use strict';

var express = require('express');
var controller = require('./auth.controller');

var router = express.Router();

router.post('/login', controller.login)
// controller.verify route is middleware called from app.js

module.exports = router;