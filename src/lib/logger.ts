// A simple logger utility. In a real application, you might use a more
// robust logging library like Winston or Pino.

type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

function log(level: LogLevel, message: string, data: Record<string, any> = {}) {
  const logEntry: LogData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  
  const output = JSON.stringify(logEntry);

  switch (level) {
    case 'info':
      console.log(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
}

export const logger = {
  info: (message: string, data?: Record<string, any>) => log('info', message, data),
  warn: (message: string, data?: Record<string, any>) => log('warn', message, data),
  error: (message: string, data?: Record<string, any>) => log('error', message, data),
};