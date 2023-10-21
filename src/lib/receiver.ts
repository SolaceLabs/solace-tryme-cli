import { Signal, Logger } from '../utils/logger'
import { checkSubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { prettyXML, prettyJSON } from '../utils/prettify'
import { SolaceClient } from '../common/receive-client'
import { defaultPublishTopic } from '../utils/defaults'

const receive = async (
  options: ClientOptions
) => {
  const receiver = new SolaceClient(options);
  await receiver.connect();
  receiver.subscribe(options);
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    receiver.exit();
  });
}

const receiver = (options: ClientOptions) => {
  const { save, view, config, helpExamples } = options

  if (helpExamples) {
    console.log(`
Example:
// direct receiver with topic(s) subscription
stm receive
stm receive -t ${defaultPublishTopic}
stm receive -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm receive -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"

// guaranteed receiver from a queue
stm receive -q my_queue
stm receive -U ws://localhost:8008 -v default -u default -p default -q my_queue --create-if-missing -t stm/inventory stm/logistics
  `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('receiver', view);
    Logger.printConfig('receiver', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('receiver', 'stm-cli-config.json');
    Logger.printConfig('receiver', options);
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('receiver', options);
    saveConfig('receiver', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('receiver', config);
    Logger.printConfig('receiver', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkSubTopicExists(options);

  receive(options);
}

export default receiver

export { receiver }
