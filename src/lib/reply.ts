import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkPersistenceParams } from '../utils/parse'
import { saveConfig, updateConfig, loadConfig } from '../utils/config'
import { ReplyClient } from '../common/reply-client'
import defaults from '../utils/defaults';

const reply = async (
  options: ClientOptions
) => {
  const replier = new ReplyClient(options);
  try {
    await replier.connect();
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }
  process.stdin.resume();
  process.on('SIGINT', function () {
    console.log('GRI')
    'use strict';
    replier.exit();
  });
}

const replier = (options: ClientOptions, optionsSource: any) => {
  const { save, view, update, exec, helpExamples } = options

  if (checkPersistenceParams(options) > 1) {
    Logger.error('Invalid configuration request, cannot mix save, update, view and exec operations')
    Logger.error('Exiting')
    process.exit(0)
  }
  
  if (helpExamples) {
    console.log(`
Examples:
// receive request on default topic ${defaults.requestTopic} from broker 'default' 
// at broker URL 'ws://localhost:8008' with username 'default' and password 'default' 
// and send reply
stm reply

// receive request on default topic ${defaults.requestTopic} from broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default' // and send reply
stm reply -t ${defaults.requestTopic}

// receive request on specified topics from broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default' and send reply
stm reply -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm reply -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"
    `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('reply', view);
    Logger.printConfig('reply', options);
    Logger.success('Exiting...')
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('reply', 'stm-cli-config.json');
    Logger.printConfig('reply', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (save && options) {
    Logger.printConfig('reply', options);
    saveConfig('reply', options, optionsSource);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (update && options) {
    const savedOptions = loadConfig('reply', update);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    options = { ...savedOptions, ...options }
    updateConfig('reply', options, optionsSource);
    Logger.printConfig('reply', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (exec) {
    const savedOptions = loadConfig('reply', exec);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    options = { ...savedOptions, ...options }
    Logger.printConfig('reply', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkSubTopicExists(options);

  reply(options);
}

export default replier

export { replier }
