import { Logger } from '../utils/logger'
import { checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { ReplyClient } from '../common/reply-client'
import { defaultRequestTopic } from '../utils/defaults'

const reply = async (
  options: ClientOptions
) => {
  const replier = new ReplyClient(options);
  await replier.connect();
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    replier.exit();
  });
}

const replier = (options: ClientOptions) => {
  const { save, view, config, helpExamples } = options

  if (helpExamples) {
    console.log(`
Example:
stm reply
stm reply -t ${defaultRequestTopic}
stm reply -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm reply -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"
    `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('replier', view);
    Logger.printConfig('replier', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('replier', 'stm-cli-config.json');
    Logger.printConfig('replier', options);
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('replier', options);
    saveConfig('replier', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('replier', config);
    Logger.printConfig('replier', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkSubTopicExists(options);

  reply(options);
}

export default replier

export { replier }
