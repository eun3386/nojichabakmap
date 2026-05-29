/* eslint-disable no-console */
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...optionalParams: unknown[]): void => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: unknown[]): void => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  },
};
