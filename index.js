const aug = require('aug');
const confi = require('confi-lite');
const config = confi('@architect/shared/conf');
const logrAll = require('logr-all');
const cache = require('@firstandthird/memory-cache');

// load config:
const log = logrAll(config.log || {});
module.exports = { log, cache, config, aug };
