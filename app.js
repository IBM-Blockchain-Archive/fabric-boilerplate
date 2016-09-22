const express       = require('express');
const path          = require('path');
const morgan        = require('morgan');
const logger        = require('./utils/logger');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const config        = require('./config');
const blockchain    = require('./blockchain/blockchain');

const port = (process.env.VCAP_APP_PORT || 8080);
const host = (process.env.VCAP_APP_HOST || 'localhost');

const app = express();

// initialize blockchain
blockchain.init();

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
const cfenv = require('cfenv');

app.use(morgan('dev', { 'stream': logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/client')));

// routes
app.use('/auth', require('./auth'));
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res) => {
    logger.error(err);
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  logger.error(err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: true,
  });
});

// In development, start the application with 'nodemon ./bin/www'
// The following block is for deployment on Bluemix / production
if (process.env.NODE_ENV !== 'development') {
  app.listen(port);
}
// print a message when the server starts listening
logger.info("[NodeJS] Express server listening at http://" + host + ':' + port)

module.exports = app;
