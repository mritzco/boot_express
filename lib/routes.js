(function() {
  'use strict';
  /* variables & includes */
  const debug = require('debug-env')('boot:routes');
  let methods = {};

  /**
   * Mounts headless rest routes using a generic class. Needs a supporting
   * table and schema
   * @example
   * "rest_routes": [
   *      {
   *        "mountpath": "/contacts",
   *        "table": "contacts"
   *      }
   *  ]
   * @method
   * @param  {object} app                        Result of running app.js
   * @param  {String} [routes_key="rest_routes"] key in config
   * @return {null}                            
   */
  methods.mount_rest = function(app, routes_key = "rest_routes") {
    if (!app.config.hasOwnProperty(routes_key)) return;
    const gen_rest = require("rest/router");
    app.config[routes_key].forEach(function(item) {
      debug(" [mount_rest]" + item.mountpath + ' ~ ' + item.table);
      app.servers.express.use(item.mountpath, gen_rest(item.table));
    });
  };

  /**
   * Mounts routes under routes_key
   * @example
   * routes: [
   *  {
   *    "mountpath": "/schemas",
   *    "module": "schemas/schemas_router"
   *  }
   * ]
   * @method
   * @param  {object} app               Result of running app.js
   * @param  {String} [routes='routes'] key where routes are found
   * @return {none}
   */
  methods.mount = function(app, routes_key = 'routes') {
    if (!app.config.hasOwnProperty(routes_key)) return;
    app.config[routes_key].forEach(function(item) {
      debug(' + ' + item.mountpath + ' ~ ' + item.module);
      app.servers.express.use(item.mountpath, require(item.module));
    });
  };
  /**
   * Mounts folders on static routes_secured
   * @example
   *  "static": [
   *   {
   *       "url": "/",
   *       "dir": "public"
   *   }
   *  ]
   *
   * @method
   * @param  {Object} app               Results of running app.js
   * @param  {String} [routes='static'] By default static but another key can be passed
   * @return {none}
   */
  methods.static = function(app, routes_key = 'static') {
    if (!app.config.hasOwnProperty(routes_key)) throw '[routes] Application has no static routes';

    app.config[routes_key].forEach(function(item) {
      app.servers.express.use(item.url, app.servers.express_module.static(item.dir));

      debug(' + ' + item.url + ' ~' + item.dir);
    });
  };

  methods.catchall = function(req, res, next) {
    debug('catchall', req.params);
    // res.sendStatus(403);
    next( {status:403, msg: 'Not found'});
  };
  /**
   * Sends a file from filesystem and sets the root of navigation
   * This allows you to send a subdir as the root or subdir
   * @example
   * res.sendFile('index.html', { root: 'public' });
   *
   * @method
   * @param  {string} file __filename
   * @param  {String} root  p
   * @return {null}      Sends File via response
   */
  methods.sendFile = function(file, root) {
    return function(req, res, next) {
      res.sendFile(file, { root });
    };
  };

  /**
   * Sends a file from filesystem and sets the root of navigation
   * This allows you to send a subdir as the root or subdir
   * @example
   * res.sendFile('index.html', { root: 'public' }); // send a file
   *
   * @method
   * @param  {string} file __filename
   * @param  {String} root Root directory for relative filenames.
   * @return {null}      Sends File via response
   */
  methods.sendContent = function(content) {
    debug('[sendContent]', content);
    return function(req, res, next) {
      res.send(content);
    };
  };
  // Common middleware
  methods.redirect = function(path_to, status = 302) {
    return function(req, res, next) {
      res.redirect(status, path_to);
    };
  };

  /**
   * Middleware to use as an error handler, can use as delegate
   * If error setter already set a different status it render the status and error as JSON
   * @method
   * @param  {string} path_to      location to redirect to
   * @param  {Number} [status=302] status (def 302 redirect)
   * @return {null}
   * @example
   *   express.use(
   *   boot.error_handler(
   *     app,
   *     boot.routes.redirect_on_error('/login')
   *   )
   * );
   */
  methods.redirect_on_error = function(path_to, status = 302) {
    return function(err, req, res, next) {
      if (!err.hasOwnProperty("status")  || err.status === 302 || err.status === 301) {
          res.redirect(err.status || status, path_to);
      } else {
          res.status(err.status || status).json(err);
      }
    };
  };
  module.exports = methods;
})();
