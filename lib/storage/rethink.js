// Find the way to make multiple storages compatible OR
// create multiple classes to use different storages
// sudo add-apt-repository ppa:chris-lea/redis-server

(function() {
  'use strict';
  /* variables & includes */
  const r = require('rethinkdb'),
    debug = require('debug-env')('api:rethink');

  let methods = Object.assign({}, require('./storage_interface')),
    conn = null;

  methods.connect = function(config, callback) {
    // console.log('[rethink.connect] config:', config);
    r.connect(config, function(err, _conn) {
      if (err) throw err;
      conn = _conn;
      // console.log('[rethink] Connection successfull');
      return callback(err, _conn);
    });
  };

// Run a db discovery to check indexes, use getAll ('filter', index) when available
  methods.select = function(table, fields, filter, callback) {
    debug.trace('[select]', table, fields, filter);
    let sequence = r.table(table)
    if (filter) sequence = sequence.filter(filter)
    if (fields && fields !== '*') sequence = sequence.pluck(fields)


    sequence
      .run(conn, function(err, cursor) {
        if (err) {
          debug.error('[select]', table, fields, filter, err);
          return callback(err);
        }
        cursor.toArray(function(err, res) {
          debug.trace('[select.toArray]', err);
          return callback(err, res);
        });
      });
  };
  /**
   * Find single or multiple matches on a field
   * @method
   * @param  {string} table  Table names
   * @param  {string} field  Field names
   * @param  {Array} values List of values to matches
   * @param {function} callback
   * @return {Array}        Array of matches
   */
  methods.match = function(table, fields, matchfield, values, callback) {

      if (!Array.isArray(values)) values = [values];

      let sequence = r.table(table)
      sequence = sequence.getAll(...values, {index:matchfield});
      if (fields && fields !== '*') sequence = sequence.pluck(fields);

      sequence
          .run(conn, (err,cursor)=> {
              cursor.toArray(function(err, res) {
                return callback(err, res);
              });

          });
  }

  /**
   * Retrieves a single row / obj in db
   * @method
   * @param  {string}   table    table named
   * @param  {string}   id       row id
   * @param  {Function} callback
   * @return {(err, item)}       callback parameters
   */
  methods.get = function(table, id, callback) {
    if (!callback || typeof callback !== 'function') {
      return callback('[rethink.get] Missing callback');
    }
    if (!id) {
      return callback('[rethink.get] Missing ID');
    }
    r
      .table(table)
      .get(id)
      .run(conn, callback);
  };
  /**
   * Replaces a single record in db
   * @method
   * @param  {string}   table    Table named
   * @param  {object}   obj      JSON dataList
   * @param  {Function} callback
   * @return {(err, res:bool)}        Callback parameters
   */
  methods.replace = function(table, obj, callback) {
    if (!callback || typeof callback !== 'function') {
      return callback('[rethink.replace] Missing callback');
    }
    if (!obj.hasOwnProperty('id') || obj.id.length === 0) {
      return callback('[rethink.replace] Missing id for replace');
    }
    if (!table) {
      return callback('[rethink.replace] Missing table');
    }
    r
      .table(table)
      .get(obj.id)
      .replace(obj)
      .run(conn, (err, res) => {
        callback(err || res.errors > 1, res);
      });
  };
  methods.insert = function(table, obj, callback) {
    if (!callback || typeof callback !== 'function') {
      return callback('[rethink.replace] Missing callback');
    }
    // We don't check ID maybe manually set
    if (!table) {
      return callback('[rethink.replace] Missing table');
    }
    r
      .table(table)
      .insert(obj)
      .run(conn, (err, res) => {
        debug('[insert]', res);
        callback(err || res.errors > 1, res);
      });
  };

  methods.delete = function(table, id, callback) {
    if (!callback || typeof callback !== 'function') {
      throw '[rethink.delete] Missing callback';
    }
    if (!table) throw 'Missing table';
    r
        .table(table)
        .filter({id})
        .delete()
        .run(conn, (err, res)=>{
            debug("[delete]",res);
            callback(err, res);
        });
  };

  /**
   * For debuggging and creating new methods
   * @method
   * @return {object} Rethink and an open connection
   */
  methods.getraw = function() {
      // console.log("[conn]",conn);
      return {r, conn};
  }



  // methods.disconnect = function(callback) {
  //   throw "disconnect method not implemented!";
  // };
  //
  // methods.query = function(sql, values, callback) {
  //   throw "query method not implemented!";
  // };
  // /* Allows to call as function */
  // methods.sql = function() {
  //   throw "sql method not implemented!";
  // };
  // methods.escape = function() {
  //   throw "escape method not implemented!";
  // };
  // methods.format = function() {
  //   throw "format method not implemented!";
  // };
  module.exports = methods;
})();
