/**
 * Express middleware, decodes UTF8 URL's
 * When request is not parseable it returns Bad Request header (400)
 *
 * @method
 * @return {function} middleware function(req, res, next)
 */
(function() {
  'use strict';
  /* variables & includes */
  let debug = require('debug')('boot:UTF8'),
    url = require('url');

  module.exports = function(req, res, next) {
    try {
      // Fix URL
      if (req.url === decodeURI(req.url)) return next();
      // there's only a referer on navigation, not on direct access
      req.url = req.headers.referer ? url.parse(decodeURI(req.headers.referer)).path : decodeURI(req.url);

      debug('Parsed URL: ', req.url);
      next();
    } catch (e) {
      // Responds with 400 Bad Request
      res.sendStatus(400);
    }
  };
})();
