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
try {
  const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
  config = confi(confPath, process.env.NODE_ENV || 'dev', config);
} catch (e) {
  console.log(e);
  /* don't crash */
}

module.exports = config;
