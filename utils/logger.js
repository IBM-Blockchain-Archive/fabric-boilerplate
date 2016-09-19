var winston = require('winston');
winston.emitErrs = true;

var logger = module.exports = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'warn',
            filename: './logs/logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            prettyPrint: true,
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
