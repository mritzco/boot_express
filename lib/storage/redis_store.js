// Find the way to make multiple storages compatible OR
// create multiple classes to use different storages
// sudo add-apt-repository ppa:chris-lea/redis-server

(function() {
  "use strict";
  /* variables & includes */

  const redis = require("redis");
  let methods = Object.assign({}, require("storage/storage_interface")),
    // priv = {},
    client = null;

  methods.connect = function(options, callback) {
    let opts = Object.assign(
      {},
      {
        host: "localhost",
        port: 6379
      },
      options
    );

    client = redis.createClient(opts.options);

    client.on("connect", function() {
      if (callback) return callback();
    });
  };
  methods.disconnect = function(callback) {
    client.quit();
    client = null;
    if (callback) callback();
  };

  methods.query = function(sql, values, callback) {};
  methods.sql = function() {
    throw "sql method not implemented!";
  };
  methods.escape = function() {
    throw "escape method not implemented!";
  };
  methods.format = function() {
    throw "format method not implemented!";
  };

  methods.set = function(path, data, callback) {
    client.set(path, data, callback);
  };
  methods.del = function(path, callback) {
    client.del(path, callback);
  };
  methods.del_patt = function(searchStr, callback) {
    client.keys(searchStr, function(err, matches) {
      if (err) return callback(err);
      for (var i = 0, len = matches.length; i < len; i++) {
        client.del(JSON.parse(matches[i]), callback);
      }
      callback(null, matches.length);
    });
  };
  methods.find = function(searchStr, callback) {
    client.keys(searchStr, function(err, matches) {
      if (err) return callback(err);
      callback(null, matches);
    });
  };

  methods.append = function(path, newel, dump, callback) {
    client.get(path, function(err, data) {
      if (err) {
        callback(err);
      } else {
        data.push(newel);
        if (dump) {
          module.exports.save_and_dump(path, data, callback);
        } else {
          module.exports.save(path, data, callback);
        }
      }
    });
  };

  module.exports = methods;
})();
