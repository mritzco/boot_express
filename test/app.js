// Express setup
(function() {
  'use strict';
  /**
   * Include all modules to wire the app.
   * Returns app object so any module can have access to the core objects / config
   */
  const debug = require('debug')('boot:main'),
    express_module = require('express'),
    express = express_module(),
    http = require('http').createServer(express),
    router = express_module.Router(),
    boot = require('index'),
    config = boot.config('test/config.json'), // test app running inside a directory. Pass empty usually
    stackTrace = require('stack-trace'),
    app = {
      config: config,
      env: express.get('env'),
      dir: __dirname,
      servers: {
        express_module,
        express,
        router,
        http,
        mysql: null
      }
    };

  /**
   * If node crashes, this will run
   */
  process.on('uncaughtException', function(err) {
    // handle the error safely
    var last = stackTrace.get()[0];
    debug('uncaughtException', err, last);
  });

  /**
   * Bootstraps all services and servers
   * @method
   * @return {null}
   */
  function bootstrap() {
    /**
     * Uncomment if you use UTF8 languages.
     */
    // express.use(UTF8Urls);

    /**
     * Connects to the db's in configuration and adds to app.servers
     * Supports: mysql (uses own mysqlpool), redis, rethinkdb
     * Keys in config:
     * config: {
     *  [mysql|redis|rethink] : { [environment]: {configuration} }
     * }
     */
    boot.db(app);

    /**
     * Sets common used middleware, bodyparser, json, helmet, cors
     */
    boot.commons(app);


    /**
     * Mounts modules in specific paths following config file.
     * Uses 'routes' key by default, where:
     * routes: [
     *   {
     *    "mountpath": "/locations",            // URL subpath
     *    "module": "locations/locations_router"// Module (returns router)
     *   }
     * ]
     */
     boot.routes.mount(app);

    /**
     * Mounts modules in specific paths following config file.
     * Uses 'static' key by default, where:
     * @example
     * static: [
     *   {
     *     "url": "/icons", // URL path
     *     "dir": "icons"   // File path (directory)
     *   }
     * ]
     *
     * @type {[type]}
     */
    boot.routes.static(app);

    /**
     * Simple middleware, restrict access based on the presence of a key in headers.
     * If key is not present, it will add an error, boot.error_handler will act on it.
     * @requires config.api_keys
     */
    // express.use( boot.access_keys( app ));  //Config.api_keys []

    /**
     * Uncomment to mount secured paths static and modules
     * @requires config.[param2name]
     *
     * Similar format as before
     */
    // boot.routes.mount(app, 'routes_secured');
    // boot.routes.static(app, 'static_secured');

    // ----------- Choose your global response when nothing matches

    /**
     * 1) Catch all and return forbidden 403
     * 2) Return a custom message
     * 3) Return a file
     * 4) Redirects somwhere
     */
    // express.all(/^(.*)$/, boot.routes.catchall);
    // express.all(/^(.*)$/, boot.routes.sendContent("Hi there"));
    // express.all(/^(.*)$/, boot.routes.sendFile('sample.html', 'test'));
    // express.all(/^(.*)$/, boot.routes.redirect('sample.html'));
    /**

    /**
     * Final error handler. If any error occurred, or you implemented access restrictions
     * using next(something) this function will run.
     *
     * error_handler will return a 500 plus the error when not in production.
     * You can override what the function does by passing a second parameter
     * @example
     * function myHandler(err,[req, res, next]) {
     *   // Check error do something, maybe send to login, or show main page.
     * }
     */
    express.use(boot.error_handler(app));
  }


  /**
   * Runs the server. Only index.js should call this method.
   * Other classes can require ('app') to get access to all the same
   * resources instances.
   *
   * @method
   * @param  {integer} port the port number to run the app
   * @return {app}     in every case app is returned.
   */
  app.run = function(port) {
    bootstrap();

    if (!port) port = config.port[app.env] || 5000;

    http.listen(port, function() {
      debug('http running on: %s', port);
      return this;
    });
  };

  module.exports = app;
})();
