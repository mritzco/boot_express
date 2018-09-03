/**
 * boot_express
 *
 */
'use strict';

const stackTrace = require('stack-trace'),
    debug= require('debug-env')('boot:main');

const boot_express = {
  config: require('./lib/configuration'),
  commons: require('./lib/common_mw'),
  db: require('./lib/dbs'),
  access_keys: require('./lib/access_keys'),
  access_servers: require('./lib/access_servers'),
  routes: require('./lib/routes'),
  UTF8Urls: require('./lib/UTF8Urls'),
  error_handler: require('./lib/error_handler')
};

/**
 * If node crashes, this will run
 */
process.on('uncaughtException', function(err) {
  // handle the error safely
  // console.log("[err]",err);
  var last = stackTrace.get()[0];
  if (debug.error.name === 'debug' || debug.error.name ==='pino') {
      debug.error('uncaughtException', err, last);
  } else {
      console.log('uncaughtException', err, last);
  }
});

exports = module.exports = boot_express;
