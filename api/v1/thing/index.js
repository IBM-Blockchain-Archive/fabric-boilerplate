'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();

router.get('/', controller.list);
router.get('/:thingId', controller.detail);
router.post('/', controller.add);

module.exports = router;
