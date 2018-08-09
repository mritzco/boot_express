(function() {
    'use strict';

    /* Dependencies */
    const compress = require('compression'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      helmet = require('helmet');
    function setup_common(app) {

        if (process.env.NODE_ENV === 'production') {
          const ex_pino = require('express-pino-logger')({ name: 'http' });
          app.servers.express.use(ex_pino);
        }
        app.servers.express.use(helmet());
        app.servers.express.use(cors());
        app.servers.express.use(compress());
        app.servers.express.use(bodyParser.json());
        app.servers.express.use(bodyParser.urlencoded({ extended: true }));
        app.servers.express_module.json();  // For JSON Submissions
    }

    exports = module.exports = setup_common;
}());
