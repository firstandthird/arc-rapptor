const tap = require('tap');

tap.test('crash if bad default.json', async t => {
  process.env.SHARED_PATH = `${__dirname}/bad`;
  try {
    const { config, response } = require('../');
    t.fail('did not throw error from bad json');
  } catch (e) {
    t.end();
  }
});
