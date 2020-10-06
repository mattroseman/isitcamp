const DEBUG = process.env.DEBUG == 'true';
const LOGGER = require('pino')({
  level: DEBUG ? 'debug' : 'info',
  prettyPrint: {
    colorize: true,
    translateTime: true,
    ignore: 'pid,hostname'
  }
});

module.exports = LOGGER;
