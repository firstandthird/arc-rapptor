const aug = require('aug');
const confi = require('confi-lite');

const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
const config = confi(confPath);
const logrAll = require('logr-all');
const cache = require('@firstandthird/memory-cache');

const log = logrAll(config.log || {});

log(['init', 'cold-start'], 'Function initialized');

const cacheReply = function(req, fn) {
  log(['request'], { message: `${req.method} ${req.path}`, path: req.path, query: req.query });
  return cache.memo(`response-${req.path}`, () => {
    log(['cache', 'miss'], { message: `cache miss for ${req.path}` });
    return fn();
  });
}


module.exports = { log, cache, config, aug, cacheReply };
