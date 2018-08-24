// Find the way to make multiple storages compatible OR
// create multiple classes to use different storages
// sudo add-apt-repository ppa:chris-lea/redis-server

(function() {
  "use strict";
  /* variables & includes */
  const r = require('rethinkdb');


  let methods = Object.assign({}, require("./storage_interface")),
    conn = null;


  methods.connect = function(config, callback) {
    // console.log('[rethink.connect] config:', config);
    r.connect(config, function (err, _conn){
      if (err) throw err;
      conn = _conn;
      // console.log('[rethink] Connection successfull');
      return callback(err,_conn);
    });
  }

  methods.select = function (table, fields, callback) {
    r.table(table).pluck(fields).run(conn, function (err, cursor){
      if (err) return callback(err);
      cursor.toArray(function(err, res){
        // console.log('[rethink.select.toArray]', err, res);
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
  methods.get =  function(table, id, callback) {
      if (!callback || typeof callback !== 'function') {
          return callback ('[rethink.get] Missing callback');
      }
      if (!id) {
          return callback('[rethink.get] Missing ID');
      }
    r.table(table).get(id).run(conn, callback);
  }
  /**
   * Replaces a single record in db
   * @method
   * @param  {string}   table    Table named
   * @param  {object}   obj      JSON dataList
   * @param  {Function} callback
   * @return {(err, res:bool)}        Callback parameters
   */
  methods.replace = function (table, obj, callback) {
      if (!callback || typeof callback !== 'function') {
          return callback ('[rethink.replace] Missing callback');
      }
      if (!obj.hasOwnProperty("id") || obj.id.length === 0) {
          return callback ('[rethink.replace] Missing id for replace');
      }
      if (!table) {
          return callback('[rethink.replace] Missing table');
      }
      r.table(table).get(obj.id).replace(obj).run(conn, (err, res)=> {
          callback(err || res.errors>1, res);
      });
  }
  methods.insert = function (table, obj, callback) {
      if (!callback || typeof callback !== 'function') {
          return callback ('[rethink.replace] Missing callback');
      }
      // We don't check ID maybe manually set
      if (!table) {
          return callback('[rethink.replace] Missing table');
      }
      r.table(table).insert(obj).run(conn, (err, res)=> {
          console.log("[insert]",res);
          callback(err || res.errors>1, res);
      });
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
