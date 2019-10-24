const aug = require('aug');
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
  /* don't crash */
}
const Logr = require('logr');
const reply = require('arc-reply');

const log = Logr.createLogger(config.log);

log(['init', 'cold-start'], 'Function initialized');

const response = function(fn, options = {}) {
  // default is true:
  const redirectTrailingSlash = options.redirectTrailingSlash === undefined ? true : options.redirectTrailingSlash;
  return async function(req) {
    const method = req.httpMethod || req.method;
    // remove any trailing slash from path if it isn't '/':
    if (redirectTrailingSlash && method.toLowerCase() === 'get' && req.path.endsWith('/')) {
      return reply.redirect(req.path.replace(/\/$/, ''));
    }
    let res = null;
    const start = new Date().getTime();
    let statusCode = null;
    // make sure query and path params always exist:
    req.queryStringParameters = req.queryStringParameters || {};
    req.pathParameters = req.pathParameters || {};
    // preserve the original headers
    req.headersRaw = Object.assign({}, req.headers);
    // and normalize the headers so you don't have to worry about case:
    req.headers = Object.keys(req.headersRaw).reduce((memo, key) => {
      memo[key.toLowerCase()] = req.headersRaw[key];
      return memo;
    }, {});
    if (req.headers['content-type'] === 'application/json' && req.body) {
      try {
        req.bodyRaw = req.body;
        req.body = JSON.parse(new Buffer(req.body, 'base64').toString());
      } catch (e) {
        // do nothing
      }
    }
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
    const logObject = {
      statusCode,
      path: req.path,
      method,
      duration,
      userAgent: req.headers['user-agent'] || req.headers['User-Agent'] || '',
      referer: req.headers.referer || req.headers.Referer || '',
      query: req.queryStringParameters
    };
    log(['request', statusCode], logObject);
    return res;
  };
};

module.exports = { log, config, aug, reply, response };
