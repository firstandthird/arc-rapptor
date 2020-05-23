const confi = require('confi-lite');
const path = require('path');

let config = {
  log: {
    initLog: false,
    unhandledRejection: true,
    uncaughtException: true,
    logger(msg) {
      if (msg.includes('"level":"ERROR"')) {
        console.error(msg);
      } else {
        console.log(msg);
      }
    },
    reporters: {
      json: {
        reporter: require('logr-json'),
        options: {
          timestamp: false,
          tagsObject: true
        }
      }
    }
  }
};
// go ahead and crash if conf is not set up correctly
const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
config = confi(confPath, process.env.NODE_ENV || 'dev', config);

module.exports = config;
