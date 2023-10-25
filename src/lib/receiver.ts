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
Examples:
// subscribe and receive message on ${defaultPublishTopic} on broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'
stm receive

// subscribe and receive message on specified topics on broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'
stm receive -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm receive -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"

// receive message from the specified queue on the broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'
stm receive -q my_queue

// receive message from the specified queue, optionally create the queue if found missing + add topic subscription on the broker 'default' 
// at broker URL 'ws://localhost:8008' with username 'default' and password 'default'
stm receive -U ws://localhost:8008 -v default -u default -p default -q my_queue --create-if-missing -t stm/inventory stm/logistics
  `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('receive', view);
    Logger.printConfig('receive', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('receive', 'stm-cli-config.json');
    Logger.printConfig('receive', options);
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('receive', options);
    saveConfig('receive', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('receive', config);
    Logger.printConfig('receive', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkSubTopicExists(options);

  receive(options);
}

export default receiver

export { receiver }
