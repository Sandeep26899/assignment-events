import winston from 'winston';

class LoggerService {
    private readonly logger: winston.Logger;
  
    constructor() {
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: `logs-of-${new Date().toDateString()}`,
            dirname: 'logs',
          }),
        ],
      });
    }
  
    log(message: string): void {
      this.logger.log('info', message);
    }
  
    error(message: string, trace?: unknown): void {
      this.logger.error(message, { trace });
    }
  
    warn(message: string): void {
      this.logger.warn(message);
    }
  
    info(message: string, trace?: string): void {
      this.logger.info(message, trace);
    }
  
    debug(message: string): void {
      this.logger.debug(message);
    }
  }
  
  export default  new LoggerService();