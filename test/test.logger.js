const tap = require('tap');

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
  }, { cors: false });
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
