const pino = require('pino');

let logger;

if (process.env.NODE_ENV !== 'production') {
  // In development: pretty print to console
  logger = pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });
} else {
  // In production: use default structured logging
  logger = pino({
    level: 'info',
  });
}

module.exports = logger;
