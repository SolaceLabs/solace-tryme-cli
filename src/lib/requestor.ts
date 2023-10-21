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
Example:
// send request messages and and receive reply(s)
stm request
stm request -t ${defaultRequestTopic}
stm request -U ws://localhost:8008 -v default -u default -p default -t stm/inventory
    `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('requestor', view);
    Logger.printConfig('requestor', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('requestor', 'stm-cli-config.json');
    Logger.printConfig('requestor', options);
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('requestor', options);
    saveConfig('requestor', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('requestor', config);
    Logger.printConfig('requestor', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkPubTopicExists(options.topic);

  request(options);
}

export default requestor

export { requestor }
