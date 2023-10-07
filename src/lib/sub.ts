import { signale, basicLog } from '../utils/signale'
import { checkSubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { SolaceClient } from '../common/solace-client'

const validateConfig = (filePath: string, config: Config) => {
  const data = config['sub']
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    signale.error(`No configuration for 'sub' found in ${filePath}`)
    process.exit(1)
  }
}

const receive = async (
  options: ClientOptions
) => {
  const subscriber = new SolaceClient(options);
  await subscriber.connect();
  subscriber.subscribe(options.topic, printMessage);
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    subscriber.exit();
  });
}

const printMessage = (message:any, mode:any, level: any) => {
  if (mode === 'pretty') {
    // signale.log('Will do pretty print .. later!')
    basicLog.messagePrettyDump(message.dump(0), message.getBinaryAttachment());
  } else {
    basicLog.messageReceived(message.getDestination());
    level === 'PROPS' && basicLog.messageProperties(message.dump(0));
    level === 'PAYLOAD' && basicLog.messagePayload(message.getBinaryAttachment());
    level === 'ALL' && basicLog.messageDump(message.dump(), message.getBinaryAttachment());
  }
}

const sub = (options: ClientOptions) => {
  const { save, view, config } = options

  if (typeof view === 'string') {
    options = loadConfig('sub', view);
    basicLog.printConfig('sub', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('sub', 'stm-cli-config.json');
    basicLog.printConfig('sub', options);
    process.exit(0);

  }

  if (save && options) {
    basicLog.printConfig('sub', options);
    saveConfig('sub', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('sub', config);
    basicLog.printConfig('sub', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkSubTopicExists(options.topic);

  receive(options);
}

export default sub

export { sub }
