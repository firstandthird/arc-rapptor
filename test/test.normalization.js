const tap = require('tap');

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
    body: new Buffer('{ "isJson": true }').toString('base64'),
    isBase64Encoded: true
  });
  t.match(response1.headers, { 'content-type': 'application/json; charset=utf8' });
  const response2 = await handler({
    path: '/api',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{ "isJson": true }',
    isBase64Encoded: false
  });
  t.match(response2.headers, { 'content-type': 'application/json; charset=utf8' });

  t.end();
});
