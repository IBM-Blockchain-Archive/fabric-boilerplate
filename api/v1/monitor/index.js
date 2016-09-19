'use strict';

var express = require('express');
var controller = require('./block.controller');

var router = express.Router();

router.get('/block/:amount', controller.list)

module.exports = router;