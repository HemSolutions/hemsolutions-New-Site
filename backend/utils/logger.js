const winston = require('winston');

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'hemsolutions-api'
  },
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? combine(timestamp(), json())
        : combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, ...metadata }) => {
              let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
              if (Object.keys(metadata).length > 0 && metadata.service === undefined) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              return msg;
            })
          )
    })
  ]
});

module.exports = logger;
