const express = require('express');
const router = express.Router();
const authorize = require('./auth/auth.controller');

/* GET home page */
router.get('/', (req, res) => {
    res.render('client/index');
});

/* SET CORS HEADERS FOR API */
router.all('/api/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

router.all('/api/*', authorize.verify);

/* API ROUTES */
router.use('/api/v1/thing', require('./api/v1/thing'));
router.use('/api/v1/user', require('./api/v1/user'));

module.exports = router;
