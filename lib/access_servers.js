(function() {
  'use strict';
  /* variables & includes */
  let debug = require('debug-env')('boot:restrict_server');
  module.exports = function(app) {

    return function(req, res, next) {
      //~ req.xhr :: is it ajax
      //~ console.log(req.headers);
      // For debugging the system
      //~ if (1) return next();

      var conn = {
        json: req.headers.accept || req.headers['content-type'] || '',
        origin: req.headers.origin || req.headers.host || '',
        auth: req.headers.authorization || '',
        x_req_with: req.headers['x-requested-with'] || '',
        user_agent: req.headers['user-agent'] || ''
      };

      function assert(prop, value, defValue = true) {
        return app.config.restrict.hasOwnProperty(prop) ? value : defValue;
      }

      var test_results = {
        json: assert('contenttype', conn.json.indexOf('json') !== -1),
        origin: assert('origin', app.config.allowed_origins.indexOf(conn.origin) !== -1),
        auth: assert('auth', conn.auth.length > 29),
        x_req: assert('app_name', app.config.allowed_systems.indexOf(conn.x_req_with) !== -1)
      };
      var isValid = test_results.json && test_results.origin && test_results.auth && test_results.x_req;

      let err = {
        json: 'Application type: must be JSON',
        origin: 'origin must be file:// or localhost',
        auth: 'Wrong authorization code',
        x_req: 'not a valid app, check app.configuration & x_req_with'
      };

      if (!isValid) {
        conn.reason = [];
        let reasons = test_results.filter( r =>  {
            console.log("[r]",r);
            return r === true;
        }).map( r => {
            return err[r];
        });

        if (!test_results.json) conn.reason.push(err.json);
        if (!test_results.origin) conn.reason.push(err.origin);
        if (!test_results.auth) conn.reason.push(err.auth);
        if (!test_results.x_req) conn.reason.push(err.x_req);
        console.log('restrict.refused', conn);
        res.sendStatus(403);
      } else {
        // console.log('restrict.isValid.accepted', conn);
        next();
      }
    };
  };
})();
