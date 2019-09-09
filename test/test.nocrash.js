const tap = require('tap');

tap.test('no crash if no default.json', async t => {
  const { config, response } = require('../');
  t.isA(response, 'function');
  t.ok(config);
  t.ok(config.log);
  t.end();
});
