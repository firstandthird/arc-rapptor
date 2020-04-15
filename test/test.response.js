const tap = require('tap');

tap.test('response method ', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const globalHandler = response((req) => {
    return reply.html('yay');
  });
  // cors is true in the config:
  const corsResult = await globalHandler({
    path: '/',
    method: 'options',
    headers: {},
    query: { blah: true }
  });
  t.match(corsResult, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
  });

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
  }, { cors: false });
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

tap.test('response method', async t => {
  const { reply, response } = require('../');
  const handler = response((req) => {
    t.equal(req.path, '/api');
    t.equal(req.method, 'post');
    return reply.html('yay');
  });
  const res = await handler({
    http: {
      path: '/api',
      method: 'post'
    },
    headers: {},
    query: { blahblah: true }
  });
  t.end();
});
