(function() {
  'use strict';
  /* variables & includes */
  const debug = require('debug-env')('boot:config'),
    fs = require('fs-extra');

  /* Fix partial configurations with an all defaults file */
  const _config = {
    name: 'Node API server',
    port: {
      development: 5000,
      testing: 7000,
      production: 80
    },
    routes: [],
    static: []
  };

  function load(path = './config.json') {
    let config;
    try {
      config = fs.readJsonSync(path);
      config = Object.assign({}, _config, config);
    } catch (err) {
      if (err.errno === -2 && err.code === 'ENOENT') {
        debug('No config.json file found');
        config = create_config();
      } else {
        debug('Configuration file cannot be parsed:\n', err);
      }
    }
    return config;
  }
  function create_config() {
    debug('Default config file written to ./config.json');
    fs.writeJsonSync('./config.json', _config, { spaces: 2 });
    return _config;
  }

  exports = module.exports = load;
})();
