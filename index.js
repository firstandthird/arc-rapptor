const aug = require('aug');
const confi = require('confi-lite');
const path = require('path');

const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
const config = confi(confPath, process.env.NODE_ENV || 'dev', {
  log: {
    initLog: false,
    unhandledRejection: true,
    uncaughtException: true
  }
});
const logrAll = require('logr-all');
const reply = require('arc-reply');

const log = logrAll(config.log || {});

log(['init', 'cold-start'], 'Function initialized');

const logRequest = function(req) {
  if (req.queryStringParameters) {
    req.query = req.queryStringParameters;
  }
  if (req.httpMethod) {
    req.method = req.httpMethod;
  }
  log(['request'], { message: `${req.method} ${req.path}`, path: req.path, query: req.query });
};

module.exports = { log, config, aug, logRequest, reply };
