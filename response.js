const reply = require('arc-reply');
const log = require('./log');

const normalizeHeaders = (req, options) => {
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
};

// middlewares must run sequentially and abort if any returns a response:
/* eslint-disable no-await-in-loop */
const runMiddleware = async(req, res, key, options) => {
  if (!options.middleware) {
    return;
  }
  for (let i = 0; i < options.middleware.length; i++) {
    const m = options.middleware[i];
    if (m[key]) {
      const responseResult = (key === 'after') ? await m.after(req, res, options) : await m.before(req, options);
      if (responseResult !== undefined) {
        return responseResult;
      }
    }
  }
};

const runHandler = async(requestHandler, req, options) => {
  try {
    // if any "before" middleware returns a response, just short-circuit and return it:
    let res = await runMiddleware(req, {}, 'before', options);
    if (res !== undefined) {
      return res;
    }
    res = requestHandler(req);
    // if any "after" middleware returns a response, return it instead:
    const afterResponse = await runMiddleware(req, res, 'after', options);
    if (afterResponse !== undefined) {
      return afterResponse;
    }
    return res;
  } catch (e) {
    log(['error'], e);
    return {
      statusCode: 500,
      body: 'Server error'
    };
  }
};

module.exports = function(requestHandler, options = {}) {
  // default is true:
  const redirectTrailingSlash = options.redirectTrailingSlash === undefined ? true : options.redirectTrailingSlash;
  return async function(req) {
    const method = req.httpMethod || req.method;
    // remove any trailing slash from path if it isn't '/':
    if (redirectTrailingSlash && method.toLowerCase() === 'get' && req.path.endsWith('/') && req.path !== '/') {
      return reply.redirect(req.path.replace(/\/$/, ''));
    }
    const start = new Date().getTime();
    normalizeHeaders(req, options);
    // the main request handler:
    const res = await runHandler(requestHandler, req, options);
    const finish = new Date().getTime();
    const duration = finish - start;
    const logObject = {
      statusCode: res.statusCode,
      path: req.path,
      method,
      duration,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers.referer || '',
      query: req.queryStringParameters
    };
    log(['request', res.statusCode], logObject);
    return res;
  };
};
