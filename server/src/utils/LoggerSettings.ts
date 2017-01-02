import {LoggerOptions} from 'winston';
import * as winston from 'winston';
import * as path from 'path';
import {Config} from '../config';

export class LoggerSettings {
    public getLoggerSettings(): LoggerOptions {
        return {
            transports: [
                new winston.transports.File({
                    level: 'warn',
                    filename: path.join(Config.getServerDirectory(), '../logs.log'),
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
        };
    }
}