const tap = require('tap');

tap.test('no crash if no default.json', async t => {
  const { response } = require('../');
  t.isA(response, 'function');
  t.end();
});
