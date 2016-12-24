const winston = require('winston');
require('winston-papertrail').Papertrail;

const transports = [
  new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  })
];

if (process.env.PAPERTRAIL_HOST) {
  transports.push(
      new winston.transports.Papertrail({
        level: process.env.DEBUG_LEVEL || 'info',
        host: process.env.PAPERTRAIL_HOST,
        port: process.env.PAPERTRAIL_PORT,
        handleExceptions: true,
        json: true,
        colorize: false
      })
  );
}

const logger = new winston.Logger({
  transports
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
