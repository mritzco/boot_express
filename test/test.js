/*
 * Entry point of single core syncbook
 * server/index.js
 */
 /*global exports: true */
(function() {
    'use strict';
    /* let custom port run */
    const  port = (process.argv.length > 2 && Number.isInteger(parseInt(process.argv[2]))) ? parseInt(process.argv[2]) : null;

    /* variables & includes */
    exports = module.exports = require('./app').run(port);

    // For now used to call app only, later on can use for cluster or .run() to serve a container and run
}());
