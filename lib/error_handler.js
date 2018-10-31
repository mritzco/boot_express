(function() {
  'use strict';
  const debug=require('debug-env')('boot:errors');
  /**
   * General error handler for express,
   * To use: When anything throws an error, express captures it, you can also call:
   * next(error)
   * This function willr return status 500 to client and:
   * production: no info
   * non production: the errors
   *
   * Example of running your own delegate
   * function myDelegate(err,req,res,next) {
   *   res.sendFile('index.html', { root: 'public' }); // send a file
   * }
   *
   * @method error_handler
   * @param  {Object}      app      Result of running app_name
   * @param  {function}      delegate If you want to do something else on error
   * @return {null}
   */
  function error_handler(app, delegate) {
    if (delegate && typeof delegate !== 'function') {
      throw 'Passed delegate is not a function';
    }

    return function(err, req, res, next) {
      if (res.headersSent) {
        debug.trace('[error_handler] headers already sent');
        return next(err);
      }
      if (app.env === 'production') {
        debug.trace('[error_handler.production] delegate:%s', (delegate? 'true': "false"), err);
        if (delegate) {
          return delegate(err, req, res, next);
        } else {
          // res.sendFile('index.html', { root: 'public' }); // send a file
          res.status(err.status || 500).json({}); // send an empty error
        }
      } else {
        debug.trace('[error_handler.non.production] delegate:%s', (delegate? 'true': "false"), err);
        if (delegate) {
          return delegate(err, req, res, next);
        } else {
          res.status(err.status || 500).json(err);
        }
      }
    };
  }

  exports = module.exports = error_handler;
})();
