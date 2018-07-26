(function() {
  "use strict";
  /* variables & includes */
  let methods = {};

  methods.connect = function(config, callback) {
    throw "connect method not implemented!";
  };
  methods.disconnect = function(callback) {
    throw "disconnect method not implemented!";
  };

  methods.query = function(sql, values, callback) {
    throw "query method not implemented!";
  };
  /* Allows to call as function */
  methods.sql = function() {
    throw "sql method not implemented!";
  };
  methods.escape = function() {
    throw "escape method not implemented!";
  };
  methods.format = function() {
    throw "format method not implemented!";
  };
  module.exports = methods;
})();
