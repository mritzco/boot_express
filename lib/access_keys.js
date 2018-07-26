(function() {
  'use strict';
  /* variables & includes */

  let debug = require('debug')('boot:keyRestrict'),
    methods = {};

  /* private functions and public methods */
  /**
   * Secures the app with a Key, basic
   * @method
   * @param  {json} options {env, api_keys [ debug ]}
   * @return {function}     Express middleware
   */
  module.exports = function(app) {


    return function(req, res, next) {
      if (!app.config.hasOwnProperty("api_keys") || !app.config.api_keys) {
          throw ('No keys provided, use API keys or remove from bootstrap');
      }
      if (app.env !== 'production') {
        debug(
          'Not production, Production ok: %s',
          app.config.api_keys.indexOf(req.headers['x-api']) !== -1
        );
        return next();
      }
      if (app.config.api_keys.indexOf(req.headers['x-api']) !== -1) {
        debug('Keys OK', req.url);
        next();
      } else {
        debug('Missing key', req.url, req.headers);
        next({ error: 'Calling API without a key' });
      }
    };
  };
})();
