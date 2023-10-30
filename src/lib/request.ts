import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkPersistenceParams } from '../utils/parse'
import { saveConfig, updateConfig, loadConfig } from '../utils/config'
import { RequestClient } from '../common/request-client'
import defaults from '../utils/defaults';

const request = async (
  options: ClientOptions
) => {
  const requestor = new RequestClient(options);
  try {
    await requestor.connect();
    requestor.request();
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }

  process.on('SIGINT', function () {
    'use strict';
    requestor.exit();
  });
  process.stdin.resume();
}

const requestor = (options: ClientOptions, optionsSource: any) => {
  const { save, view, update, exec, helpExamples } = options

  if (checkPersistenceParams(options) > 1) {
    Logger.error('Invalid configuration request, cannot mix save, update, view and exec operations')
    Logger.error('Exiting')
    process.exit(0)
  }
  
  if (helpExamples) {
    console.log(`
Examples:
// send request on default topic ${defaults.requestTopic} to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default' and receive reply 
stm request

// send request on default topic ${defaults.requestTopic} to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'.
stm request -t ${defaults.requestTopic}

// send request on the specified topic to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'.
stm request -U ws://localhost:8008 -v default -u default -p default -t stm/inventory
    `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('request', view);
    Logger.printConfig('request', options);
    Logger.success('Exiting...')
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('request', 'stm-cli-config.json');
    Logger.printConfig('request', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (save && options) {
    Logger.printConfig('request', options);
    saveConfig('request', options, optionsSource);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (update && options) {
    const savedOptions = loadConfig('request', update);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    options = { ...savedOptions, ...options }
    updateConfig('request', options, optionsSource);
    Logger.printConfig('request', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (exec) {
    const savedOptions = loadConfig('request', exec);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    // if (optionsSource.topic === 'cli' && options.topic && options.topic.length) delete savedOptions.topic
    // if (optionsSource.userProperties === 'cli' && options.userProperties && options.userProperties.length) delete savedOptions.userProperties        
    // options = { ...savedOptions, ...options }
    
    options = { ...savedOptions, ...options }
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
