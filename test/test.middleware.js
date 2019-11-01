const tap = require('tap');

tap.test('runs "before" middleware', async t => {
  const { reply, response } = require('../');
  const handler = response((req) => {
    return reply.html('yay');
  }, {
    middleware: [{
      before(req) {
        req.headers.beforeMiddleware = 1;
      },
      after(req, res) {
        res.headers.beforeMiddleware = req.headers.beforeMiddleware;
        res.headers.afterMiddleware = 1;
      }
    }, {
      before(req, res) {
        req.headers.beforeMiddleware++;
      },
      after(req, res) {
        res.headers.afterMiddleware++;
      }
    }]
  });
  const response1 = await handler({
    path: '/',
    httpMethod: 'get',
    headers: {},
    query: {}
  });
  t.match(response1.headers, {
    beforeMiddleware: 2,
    // afterMiddleware: 2
  }, 'all midddlwares execute');

  const beforeHandler = response(req => {
    t.fail('request handler should not run if before middleware aborted preemptively');
    return reply.html('boo');
  }, {
    middleware: [{
      before(req) {
        return reply.html('yay');
      },
      after(req) {
        t.ok(false, 'after middleware does not run if before middleware aborted handler');
      }
    }]
  });
  const beforeResponse = await beforeHandler({
    path: '/',
    httpMethod: 'get',
    headers: {},
    query: {}
  });
  t.match(beforeResponse, {
    body: 'yay'
  }, 'before middleware can abort further processing and return a response');

  const afterHandler = response(req => {
    return reply.html('boo');
  }, {
    middleware: [{
      after(req, res) {
        return reply.html('yay');
      }
    }]
  });
  const afterResponse = await afterHandler({
    path: '/',
    httpMethod: 'get',
    headers: {},
    query: {}
  });
  t.match(afterResponse, {
    body: 'yay'
  }, 'after middleware can override a response');
  t.end();
});
