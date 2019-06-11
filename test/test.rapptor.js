const tap = require('tap');

tap.test('rapptor', async t => {
  process.env.SHARED_PATH = __dirname;
  const { config, log, aug, logRequest } = require('../');
  t.equal(typeof log, 'function', 'exports a log function');
  log(['pagedata'], 'getting slugs');
  t.match(aug({ val1: 1 }, { val2: 3 }, { val2: 2, val3: 3 }), {
    val1: 1,
    val2: 2,
    val3: 3
  }, 'exports an aug (object deep-clone) function');
  t.ok(config.json, 'loads and exports the config');
  const oldLog = console.log;
  let val = '';
  console.log = (param) => {
    val = param;
  };
  logRequest({
    method: 'get',
    path: '/',
    query: {
      'what-is-the-fastest-land-animal': 'the cheetah'
    }
  });
  console.log = oldLog;
  t.equal(val, 'level=INFO msg="get /" tag="request" path="/" query.what-is-the-fastest-land-animal="the cheetah"',
    'exports a logRequest function that logs incoming request objects');
  t.end();
});
