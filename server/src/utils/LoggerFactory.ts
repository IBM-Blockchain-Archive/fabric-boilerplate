import {LoggerInstance} from 'winston';
import {LoggerSettings} from './LoggerSettings';
import * as winston from 'winston';

export class LoggerFactory {
  private static logger: LoggerInstance = null;

  public create(): LoggerInstance {
    if (LoggerFactory.logger === null) {
      LoggerFactory.logger = new winston.Logger(new LoggerSettings().getLoggerSettings());
    }

    return LoggerFactory.logger;
  }
}