const tap = require('tap');

tap.test('cors preflight ', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const handler = response((req) => {
    return reply.html('yay');
  });
  const response1 = await handler({
    path: '/api',
    method: 'options',
    headers: {},
    query: { blah: true }
  });
  t.match(response1, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
  });
  t.end();
});


tap.test('disable all cors requests ', async t => {
  process.env.SHARED_PATH = __dirname;
  const { reply, response } = require('../');
  const handler = response((req) => reply.html('yay'), {
    disableCors: true
  });
  const response1 = await handler({
    path: '/api',
    method: 'options',
    headers: {},
    query: { blah: true }
  });
  t.match(response1, {
    statusCode: 200,
    body: 'yay'
  });
  t.end();
});
