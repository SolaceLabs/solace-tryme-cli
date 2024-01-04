import path from 'path';
import { Logger } from './logger'
import { updateVisualizeConfig } from './config';
import { defaultConfigFile } from './defaults';

const visualize = (options: ManageClientOptions) => {
  const configFile = options.config ? options.config : defaultConfigFile;

  updateVisualizeConfig(configFile, 'on');

  var liveServer = require("live-server");

  var params = {
    port: options.port, // Set the server port. Defaults to 8080.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "html", // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    ignore: '', // comma-separated string for paths to ignore
    file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  };
  Logger.logSuccess('Starting visualization server');
  liveServer.start(params);
  Logger.logSuccess('Opening visualization...');

  process.on('SIGINT', function () {
    'use strict';
    updateVisualizeConfig(configFile, 'off');
    Logger.logWarn('exiting...')
    process.exit(0);
  });

}
export default visualize

export { visualize }
