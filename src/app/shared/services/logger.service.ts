import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environment/environment';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isProduction = environment.production;

  error = (message: string, data?: any, source?: string): void => {
    this.log(LogLevel.ERROR, message, data, source);
  };

  warn = (message: string, data?: any, source?: string): void => {
    this.log(LogLevel.WARN, message, data, source);
  };

  info = (message: string, data?: any, source?: string): void => {
    this.log(LogLevel.INFO, message, data, source);
  };

  debug = (message: string, data?: any, source?: string): void => {
    if (!this.isProduction) {
      this.log(LogLevel.DEBUG, message, data, source);
    }
  };

  logHttpError = (error: HttpErrorResponse, context?: string): void => {
    const errorData = {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      context: context || 'HTTP Request'
    };

    this.error(`HTTP ${error.status} Error: ${error.statusText}`, errorData, 'HttpInterceptor');
  };

  private log = (level: LogLevel, message: string, data?: any, source?: string): void => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]${source ? ` [${source}]` : ''}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(`🚨 ${prefix}`, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`⚠️ ${prefix}`, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(`ℹ️ ${prefix}`, message, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`🐛 ${prefix}`, message, data || '');
        break;
    }
  };
}
