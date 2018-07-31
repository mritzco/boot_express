(function() {
  'use strict';
  /* variables & includes */
  const debug = require('debug')('boot:mysql'),
    mysql = require('mysql');
  let pool = null,
    methods = Object.assign({}, require('./storage_interface'));

  methods.connect = function(config, callback) {
    function _connect() {
      debug('[mysqlpool.connecting] %j', config.host);
      pool = mysql.createPool(config);

      pool.on('connection', function(connection) {
        if (callback) return callback();
      });
    }

    _connect();
  };
  methods.disconnect = function(callback) {
    if (!pool) return callback();
    pool.end(function(err) {
      pool = null;
      if (callback) callback(err);
    });
  };
  /*
     * Can call with:
     * Sql to run
     * values to query [optional]
     * callback
     */
  methods.query = function(sql, values, callback) {
    if (!callback) {
      callback = values;
      values = null;
    }
    if (!pool) {
      debug('error', 'mysqlpool.query', 'Pool has not been initialized');
      return callback('pool has not been initialized');
    }

    pool.getConnection(function(err, connection) {
      function _finally(err, rows) {
        connection.release();
        if (err) {
          debug('error', 'mysqlpool.query', {
            err: err,
            sql: sql,
            values: values
          });
          return callback(err, rows);
        }

        callback(err, rows);
      }
      if (err) {
        if (connection) connection.release();
        return debug('error', err, sql);
      }
      debug('[mysqlpool.query]', sql);
      if (values) {
        connection.query(sql, values, _finally);
      } else {
        connection.query(sql, _finally);
      }
    });
  };
  /* Allows to call as function */
  methods.sql = function() {
    var args = Array.prototype.slice.call(arguments);
    var sql = args.shift();
    var callback = args.pop();
    if (!sql || !callback) {
      return callback('Incorrect number of parameters');
    }
    //~ debug(arguments); debug(sql, args); debug(dl.queries[sql]);
    methods.query(sql, args, callback);
  };
  methods.escape = mysql.escape;
  methods.format = mysql.format;
  module.exports = methods;
})();
