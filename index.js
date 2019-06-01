const aug = require('aug');
const confi = require('confi-lite');

const confPath = process.env.SHARED_PATH || path.dirname(require.resolve('@architect/shared/conf/default.json'));
const config = confi(confPath);
const logrAll = require('logr-all');
const cache = require('@firstandthird/memory-cache');

// load config:
const log = logrAll(config.log || {});
module.exports = { log, cache, config, aug };
