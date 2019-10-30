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

const middlewareBefore = (req, options) => {
  // todo
};

const middlewareAfter = (req, options) => {
  // todo
};

const runHandler = (requestHandler, req, options) => {
  try {
    return requestHandler(req);
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
