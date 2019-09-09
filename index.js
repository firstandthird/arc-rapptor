const aug = require('aug');
const confi = require('confi-lite');
const path = require('path');

let config = {
  log: {
    initLog: false,
    unhandledRejection: true,
    uncaughtException: true
  }
};
try {
  const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
  config = confi(confPath, process.env.NODE_ENV || 'dev', config);
} catch (e) {
  /* don't crash */
}
const logrAll = require('logr-all');
const reply = require('arc-reply');

const log = logrAll(config.log || {});

log(['init', 'cold-start'], 'Function initialized');

const logRequest = function(req) {
  // // architect version 6 uses different keys names:
  const method = req.method || req.httpMethod;
  const query = req.queryStringParameters || req.query;
  log(['request'], { message: `${method} ${req.path}`, path: req.path, query });
};

const response = async function(fn) {
  return async function(req) {
    let res = null;
    const start = new Date().getTime();
    let statusCode = null;
    try {
      res = await fn(req);
      statusCode = res.statusCode;
    } catch (e) {
      log(['error'], e);
      statusCode = 500;
      res = {
        statusCode,
        body: 'Server error'
      };
    }
    const finish = new Date().getTime();
    const duration = finish - start;
    const method = req.httpMethod || req.method;
    const query = req.queryStringParameters || req.query;
    log(['request', statusCode], { statusCode, path, method, duration, query });
    return res;
  };
};

module.exports = { log, config, aug, logRequest, reply, response };
