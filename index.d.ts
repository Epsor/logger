interface Logger {
  info(message: string, data?: object): void;
  error(message: string, data?: object): void;
}

declare const logger: Logger;

export default logger;
