const Logr = require('logr');
const config = require('./config');
const log = Logr.createLogger(config.log);
log(['init', 'cold-start'], 'Function initialized');
module.exports = log;
