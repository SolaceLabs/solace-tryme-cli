import concat from 'concat-stream'
import { checkPubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, updateConfig, loadConfig } from '../utils/config'
import { SolaceClient } from '../common/publish-client'
import { Logger } from '../utils/logger'
import defaults from '../utils/defaults';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const send = async (
  options: ClientOptions
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  try {
    await publisher.connect()
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }

  let message = options.message as string;
  for (var iter=count ? count : 1, n=1;iter > 0;iter--, n++) {
    if (message === defaults.message)
      publisher.publish(options.topic, (count && count > 1) ? message.concat(` [${n}]`) : message);
    else
      publisher.publish(options.topic, message);

    if (delay && interval) await delay(interval)
  }

  publisher.disconnect();
}

const publisher = (options: ClientOptions, optionsSource: any) => {
  const { save, view, update, exec, helpExamples } = options

  if (helpExamples) {
        console.log(`
Examples:
// publish a message to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'
stm publish

// publish on topic ${defaults.publishTopic} to broker 'default' at broker URL 'ws://localhost:8008' 
// with username 'default' and password 'default'
stm publish -t ${defaults.publishTopic}

// publish 5 messages with 3 sec interval between publish on topic '${defaults.publishTopic}' 
// to broker 'default' at broker URL 'ws://localhost:8008' with username 'default' and password 'default'.
stm publish -U ws://localhost:8008 -v default -u default -p default -t ${defaults.publishTopic} -c 5 -i 3000
        `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('publish', view);
    Logger.printConfig('publish', options);
    Logger.success('Exiting...')
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('publish', 'stm-cli-config.json');
    Logger.printConfig('publish', options);
    Logger.success('Exiting...')
    process.exit(0);

  }

  if (save && options) {
    Logger.printConfig('publish', options);
    saveConfig('publish', options, optionsSource);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (update && options) {
    Logger.printConfig('publish', options);
    const savedOptions = loadConfig('publish', update);
    options = { ...savedOptions, ...options }
    updateConfig('publish', options, optionsSource);
    Logger.printConfig('publish', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (exec) {
    const savedOptions = loadConfig('publish', exec);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    options = { ...savedOptions, ...options }
    Logger.printConfig('publish', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkPubTopicExists(options.topic);

  if (options.stdin) {
    Logger.ctrlDToPublish();
    process.stdin.pipe(
      concat((data) => {
        options.message = data.toString().slice(0, -1)
        send(options)
      }),
    )
  } else {
    send(options)
  }
}

export default publisher

export { publisher }
