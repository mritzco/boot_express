(function() {
  'use strict';
  /* variables & includes */

  let debug = require('debug')('boot:db');

  /* private functions and public methods */
  function bootstrap_db(app) {
    //Connect mysql
    debug('Loading databases for env:', app.env);

    if (app.config.hasOwnProperty('rethink')) {
        debug("Connecting to rethink");
      app.servers.rethink = require('storage/rethink');
      app.servers.rethink.connect(app.config.rethink[app.env], function(err, conn) {
        if (err) throw err;
        debug('[rethink] has connected');
      });
    }

    if (app.config.hasOwnProperty('mysql')) {
        debug("Connecting to mysql");
      app.servers.mysql = require('storage/mysqlpool');
      app.servers.mysql.connect(app.config.mysql[app.env]);
    }
    // Connect redis
    if (app.config.hasOwnProperty('redis')) {
        debug("Connecting to redis");
      app.servers.redis = require('storage/redis_store');
      app.servers.redis.connect(app.config.redis[app.env]);
    }
  }

  exports = module.exports = bootstrap_db;
})();
