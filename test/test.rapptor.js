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
