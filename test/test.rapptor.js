const tap = require('tap');
const nunjucks = require('nunjucks');

tap.test('rapptor', async t => {
  const { config, log, cache, aug } = require('../');
  t.equal(typeof log, 'function');
  // init nunjucks:
  const env = nunjucks.configure(`${__dirname}/views`, { autoescape: true });
  env.addFilter('shorten', (str, count) => str.slice(0, count || 5));
  let count = 0;
  // // declare a render function:
  const render = function(request) {
    const forceUpdate = (request.query.update === '1');
    return cache.memo('home', () => {
      count++;
      log(['pagedata'], 'getting slugs');
      const html = nunjucks.render('test.njk', {
        value: 17
      });
      return html;
    }, config.viewCacheDuration, forceUpdate);
  };
  const request = {
    query: {}
  };
  let result = await render(request);
  t.match(result, 'The value is 17');
  t.equal(count, 1);
  result = await render(request);
  t.match(result, 'The value is 17');
  t.equal(count, 1);
  t.end();
});