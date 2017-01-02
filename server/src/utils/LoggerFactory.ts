import {LoggerInstance} from 'winston';
import {LoggerSettings} from './LoggerSettings';
import * as winston from 'winston';

export class LoggerFactory {
  public static create(): LoggerInstance {
    return new winston.Logger(new LoggerSettings().getLoggerSettings());
  }
}