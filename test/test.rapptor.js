const tap = require('tap');

tap.test('arc-rapptor', t => {
  process.env.SHARED_PATH = __dirname;
  const { config, log, aug, reply } = require('../');
  t.isA(reply.json, 'function', 'exports json reply method from arc-reply');
  t.isA(reply.html, 'function', 'exports html reply method from arc-reply');
  t.isA(reply.redirect, 'function', 'exports redirect reply method from arc-reply');
  t.match(aug({ val1: 1 }, { val2: 3 }, { val2: 2, val3: 3 }), {
    val1: 1,
    val2: 2,
    val3: 3
  }, 'exports an aug (object deep-clone) function');
  t.ok(config.json, 'loads the config from default.json');
  t.ok(config.log, 'loads the base config');
  const oldLog = console.log;
  let val = '';
  console.log = (param) => {
    val = param;
  };
  log(['pagedata'], 'getting slugs');
  t.isA(val, 'string', 'exports a log function');
  t.end();
});

tap.test('response method ', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const handler = response((req) => {
    return reply.html('yay');
  });
  const response1 = await handler({
    path: '/api',
    method: 'get',
    headers: {},
    query: { blah: true }
  });
  const response2 = await handler({
    path: '/api',
    method: 'post',
    headers: {},
    query: { blahblah: true }
  });
  t.match(response1, {
    headers: { 'content-type': 'text/html; charset=utf8' },
    body: 'yay',
    statusCode: 200
  });
  t.match(response2, {
    headers: { 'content-type': 'text/html; charset=utf8' },
    body: 'yay',
    statusCode: 200
  });
  const asyncHandler = response(async(req) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return reply.html('yay');
  });
  const asyncResponse = await asyncHandler({
    path: '/api',
    method: 'get',
    headers: {},
    query: { blah: true }
  });
  t.match(asyncResponse, {
    headers: { 'content-type': 'text/html; charset=utf8' },
    body: 'yay',
    statusCode: 200
  });
  const error = response((req) => {
    throw new Error('error');
  });
  const errResult = await error({
    path: '/api',
    httpMethod: 'get',
    headers: {},
    query: { blah: true }
  });
  t.match(errResult, {
    statusCode: 500,
    body: 'Server error'
  });
  t.end();
});

tap.test('default logger method uses console.log/console.error as needed ', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  let logCalled = false;
  const log = console.log;
  console.log = (input) => {
    t.match(input, '"level":"INFO"');
    logCalled = true;
  };
  const handler = response((req) => {
    return reply.html('yay');
  });
  const response1 = await handler({
    path: '/api',
    method: 'get',
    headers: {},
    query: { blah: true }
  });
  t.ok(logCalled);
  let errCalled = false;
  const error = response((req) => {
    throw new Error('error');
  });
  console.log = log;
  const consoleError = console.error;
  console.error = (input) => {
    t.match(input, '"level":"ERROR"');
    errCalled = true;
  }
  const errResult = await error({
    path: '/api',
    method: 'get',
    headers: {},
    query: { blah: true }
  });
  t.ok(errCalled);
  console.log = log;
  console.error = consoleError;
  t.end();
});

tap.test('response method redirectTrailingSlash', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const handler = response((req) => {
    return reply.html('yay');
  });
  const response1 = await handler({
    path: '/api/',
    httpMethod: 'get',
    headers: {},
    query: { blah: true }
  });
  t.match(response1, {
    headers: { Location: '/api' },
    statusCode: 301
  }, 'redirectTrailingSlash is true by default');

  const handler2 = response((req) => {
    return reply.html('yay');
  }, { redirectTrailingSlash: false });
  const response2 = await handler2({
    path: '/api/',
    httpMethod: 'get',
    headers: {},
    query: { blah: true }
  });
  t.match(response2, {
    statusCode: 200
  }, 'redirectTrailingSlash can be set to false');
  t.end();
});

tap.test('response method normalizes req and response', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const handler = response((req) => {
    t.match(req.headers['content-type'], 'application/json', 'headers normalized as lowercase');
    t.match(req.queryStringParameters, {}, 'req.queryStringParameters is always present');
    t.match(req.pathParameters, {}, 'req.pathParameters is always present');
    t.match(req.body, { isJson: true }, 'JSON string is always converted to object');
    return reply.json({ okay: true });
  });
  const response1 = await handler({
    path: '/api',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    body: new Buffer('{ "isJson": true }').toString('base64')
  });
  t.match(response1.headers, { 'content-type': 'application/json; charset=utf8' });
  t.end();
});
