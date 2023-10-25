import { Logger } from '../utils/logger'
import { checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { RequestClient } from '../common/request-client'
import { defaultPublishTopic, defaultRequestTopic } from '../utils/defaults'

const request = async (
  options: ClientOptions
) => {
  const requestor = new RequestClient(options);
  await requestor.connect();
  requestor.request();

  process.on('SIGINT', function () {
    'use strict';
    requestor.exit();
  });
  process.stdin.resume();
}

const requestor = (options: ClientOptions) => {
  const { save, view, config, helpExamples } = options

  if (helpExamples) {
    console.log(`
Examples:
// send request on default topic ${defaultRequestTopic} to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default' and receive reply 
stm request

// send request on default topic ${defaultRequestTopic} to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'.
stm request -t ${defaultRequestTopic}

// send request on the specified topic to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'.
stm request -U ws://localhost:8008 -v default -u default -p default -t stm/inventory
    `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('request', view);
    Logger.printConfig('request', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('request', 'stm-cli-config.json');
    Logger.printConfig('request', options);
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('request', options);
    saveConfig('request', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('request', config);
    Logger.printConfig('request', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkPubTopicExists(options.topic);

  request(options);
}

export default requestor

export { requestor }
