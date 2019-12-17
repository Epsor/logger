interface Logger {
  silly(message: string, data?: object): void;
  verbose(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, data?: object): void;
}

declare const logger: Logger;

export default logger;
