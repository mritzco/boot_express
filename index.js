/**
 * boot_express
 *
 */
'use strict';


const boot_express = {
  config: require('configuration'),
  commons: require('common_mw'),
  db: require('dbs'),
  access_keys: require('access_keys'),
  access_servers: require('access_servers'),
  routes: require('routes'),
  UTF8Urls: require('UTF8Urls'),
  error_handler: require('error_handler')
};

exports = module.exports = boot_express;
