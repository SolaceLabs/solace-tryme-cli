import { Logger } from '../utils/logger'
import { checkSubTopicExists, checkConnectionParamsExists, checkPersistenceParams } from '../utils/parse'
import { saveConfig, updateConfig, loadConfig } from '../utils/config'
import { SolaceClient } from '../common/receive-client'
import defaults from '../utils/defaults';

const receive = async (
  options: ClientOptions
) => {
  const receiver = new SolaceClient(options);
  try {
    await receiver.connect();
    receiver.subscribe(options);
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    receiver.exit();
  });
}

const receiver = (options: ClientOptions, optionsSource: any) => {
  const { save, view, update, exec, helpExamples } = options

  if (checkPersistenceParams(options) > 1) {
    Logger.error('Invalid configuration request, cannot mix save, update, view and exec operations')
    Logger.error('Exiting')
    process.exit(0)
  }
  
  if (helpExamples) {
    console.log(`
Examples:
// subscribe and receive message on ${defaults.publishTopic} on broker 'default' at broker URL 'ws://localhost:8008' 
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
    Logger.success('Exiting...')
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('receive', 'stm-cli-config.json');
    Logger.printConfig('receive', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (save && options) {
    Logger.printConfig('receive', options);
    saveConfig('receive', options, optionsSource);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (update && options) {
    const savedOptions = loadConfig('receive', update);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    // if (optionsSource.topic === 'cli' && options.topic && options.topic.length) delete savedOptions.topic
    // if (optionsSource.userProperties === 'cli' && options.userProperties && options.userProperties.length) delete savedOptions.userProperties    

    // remove subscription info
    if ((typeof options.topic === 'string' && options.topic === "") ||
        (typeof options.topic === 'object' && options.topic.length === 1 && options.topic[0] === "")) {
      delete options.topic;
      delete savedOptions.topic;
    } 
    
    if (typeof options.userProperties === 'string' && options.userProperties === "") {
      delete options.userProperties;
      delete savedOptions.userProperties;
    }
    
    options = { ...savedOptions, ...options }
    updateConfig('receive', options, optionsSource);
    Logger.printConfig('receive', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (exec) {
    const savedOptions = loadConfig('receive', exec);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    if (optionsSource.topic === 'cli' && options.topic && options.topic.length) delete savedOptions.topic
    if (optionsSource.userProperties === 'cli' && options.userProperties && options.userProperties.length) delete savedOptions.userProperties    

    options = { ...savedOptions, ...options }
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
