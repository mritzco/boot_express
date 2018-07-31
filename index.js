/**
 * boot_express
 *
 */
'use strict';


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

exports = module.exports = boot_express;
