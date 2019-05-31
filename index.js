const aug = require('aug');
const confi = require('confi-lite');
const logrAll = require('logr-all');
const cache = require('@firstandthird/memory-cache');

// load rapptor
module.exports = (configPath = `${process.cwd()}/conf`) => {
  const config = confi(configPath);
  const log = logrAll(config.log || {});
  return { log, cache, config, aug };
};
