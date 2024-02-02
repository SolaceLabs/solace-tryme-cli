import { Logger } from './logger'
import { loadCommandFromConfig, updateVisualizeConfig } from './config';
import { defaultConfigFile } from './defaults';

const visualize = async (options: MessageClientOptions) => {
  const configFile = options.config ? options.config : defaultConfigFile;
  const visualizationPort = options.visualizationPort ? options.visualizationPort : 0;
  updateVisualizeConfig(configFile, 'on');

  const config = loadCommandFromConfig('connection', options);
  const url = new URL(config.url);
  console.log(config.url, '\n', url);
  console.log(url.hostname, config.url.substring(config.url.lastIndexOf(':')+1), config.username, "******");
  var publicDir = __dirname.substring(0, __dirname.lastIndexOf('solace-tryme-cli') + 16);

  const express = require('express');
  const app = express();
  app.use(express.static(publicDir + '/public'));
  app.use(function(req:any, res:any, next:any) {
    console.log('Request on ', req.path);
    next();
  });
  
  app.get('/config', (req:any, res:any) => {
    var configuration = {
      "MQTT_HOST": `${url.hostname}`,
      "MQTT_PORT": (url.hostname === 'localhost' ? 8000: 8443),
      "MQTT_USER_NAME":   `${config.username}`,
      "MQTT_PASSWORD": `${config.password}`
    };

    res.json(configuration);
  })

  app.post('/config', (req:any, res:any) => {
    console.log('Received: ', req.body);
    res.send("Success");
  })

  let http = require('http');
  let server = http.createServer(app);
  server.listen(visualizationPort, () => {
    console.info(`App listening on port ${server.address().port}`);
    var opener = require("opener");
    opener(`http://localhost:${server.address().port}`)
  });

  process.on('SIGINT', function () {
    'use strict';
    updateVisualizeConfig(configFile, 'off');
    Logger.logWarn('exiting...')
    process.exit(0);
  });

}
export default visualize

export { visualize }
