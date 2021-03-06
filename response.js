const reply = require('arc-reply');
const log = require('./log');
const config = require('./config');

const normalize = (req, options) => {
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
      if (req.isBase64Encoded) {
        req.body = JSON.parse(new Buffer(req.body, 'base64').toString());
      } else {
        req.body = JSON.parse(req.body);
      }
    } catch (e) {
      // do nothing
    }
  }
  req.method = req.httpMethod || req.method;
  if (req.requestContext && req.requestContext.http && req.requestContext.http.method) {
    req.method = req.requestContext.http.method;
  }
  if (req.requestContext && req.requestContext.http && req.requestContext.http.path) {
    req.path = req.requestContext.http.path;
  }
  return req;
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

module.exports = function(requestHandler, passedOptions = {}) {
  // merge global and local handler options:
  const options = Object.assign({}, config.response || {}, passedOptions);
  // default is true:
  const redirectTrailingSlash = options.redirectTrailingSlash === undefined ? true : options.redirectTrailingSlash;
  return async function(req) {
    normalize(req, options);
    // handle any cors preflight requests:
    if (options.cors && req.method.toLowerCase() === 'options') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: 'CORS'
      };
    }
    // remove any trailing slash from path if it isn't '/':
    if (redirectTrailingSlash && req.method.toLowerCase() === 'get' && req.path.endsWith('/') && req.path !== '/') {
      return reply.redirect(req.path.replace(/\/$/, ''));
    }
    const start = new Date().getTime();
    // the main request handler:
    const res = await runHandler(requestHandler, req, options);
    // allow cors on individual routes as well:
    if (options.cors) {
      // make sure headers are present
      if (!res.headers) {
        res.headers = {};
      }
      res.headers['Access-Control-Allow-Origin'] = '*';
    }
    const finish = new Date().getTime();
    const duration = finish - start;
    const logObject = {
      statusCode: res.statusCode,
      path: req.path,
      method: req.method,
      duration,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers.referer || '',
      query: req.queryStringParameters
    };
    log(['request', res.statusCode], logObject);
    return res;
  };
};
