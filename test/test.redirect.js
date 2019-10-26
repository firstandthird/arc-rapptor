const tap = require('tap');

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
  const response3 = await handler({
    path: '/',
    httpMethod: 'get',
    headers: {},
    query: { blah: true }
  });
  t.equal(response3.statusCode, 200, 'root route does not redirect');
  t.end();
});
