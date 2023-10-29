import { saveConfig, updateConfig, loadConfig } from '../utils/config'
import { Logger } from '../utils/logger'
import { checkSempConnectionParamsExists, checkSempQueueParamsExists, 
        checkSempQueueSubscriptionTopicExists, checkSempQueuePartitionSettings } from '../utils/parse'
import { SempClient } from '../common/queue-client'

const invoke = async (
  options: ClientOptions
) => {
  const client = new SempClient(options);
  try {
    await client.manageQueue();
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }

  Logger.success('Exiting...')
  process.exit(0);
}

const queue = (options: ClientOptions, optionsSource: any) => {
  const { save, view, update, exec, helpExamples } = options

  if (helpExamples) {
        console.log(`
Examples:
// create queue on broker 'default' at broker URL 'http://localhost:8008' 
// with semp username 'admin' and password 'admin' and default settings
stm queue --operation create --queue-name TestQ1

// create queue on broker 'default' at broker URL 'http://localhost:8008' 
// with semp username 'admin' and password 'admin', add specified subscriptions 
// and default queue settings
stm queue --operation create --queue-name TestQ2 -SU http://localhost:8080 -sv default -su admin -sp admin --add-subscriptions "stm/inventory/*"

// create queue on broker 'default' at broker URL 'http://localhost:8008' 
// with semp username 'admin' and password 'admin', with egress and ingress enabled 
// and default queue settings
stm queue --operation create --queue-name TestQ3 --access-type EXCLUSIVE --egress-enabled true --ingress-enabled true

// update queue - make it non-exclusive queue and set partition settings
stm queue --operation update --queue-name TestQ3 --access-type NON-EXCLUSIVE --partition-count 10 --partition-rebalance-delay 10 --partition-rebalance-max-handoff-time 10

// update queue - manage subscriptions
stm queue --operation update --queue-name TestQ3 --remove-subscriptions ">" --add-subscriptions "stm/inventory/*" "stm/logistics/*" 

// delete queue
stm queue --operation delete --queue-name TestQ3
        `);
    process.exit(0);
  }

  if (typeof view === 'string') {
    options = loadConfig('queue', view);
    Logger.printConfig('queue', options);
    Logger.success('Exiting...')
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('queue', 'stm-cli-config.json');
    Logger.printConfig('queue', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (save && options) {
    Logger.printConfig('queue', options);
    saveConfig('queue', options, optionsSource);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (update && options) {
    const savedOptions = loadConfig('queue', update);
    // remove subscription info
    if (options.addSubscriptions && options.addSubscriptions.length) delete savedOptions.addSubscriptions
    if (options.removeSubscriptions && options.removeSubscriptions.length) delete savedOptions.removeSubscriptions
    options = { ...savedOptions, ...options }
    updateConfig('queue', options, optionsSource);
    Logger.printConfig('queue', options);
    Logger.success('Exiting...')
    process.exit(0);
  }

  if (exec) {
    const savedOptions = loadConfig('queue', exec);
    // rid opts of default settings
    Object.keys(optionsSource).forEach((key:string) => {
      if (optionsSource[key] === 'default') {
        delete options[key];
      }
    })
    
    // // remove subscription info
    // if (options.addSubscriptions && options.addSubscriptions.length) delete savedOptions.addSubscriptions
    // if (options.removeSubscriptions && options.removeSubscriptions.length) delete savedOptions.removeSubscriptions
    // options = { ...options, ...savedOptions }
    options = { ...savedOptions, ...options }
    Logger.printConfig('queue', options);
  }

  
  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp queue operation params
  checkSempQueueParamsExists(options);

  // check semp queue operation params
  checkSempQueuePartitionSettings(options);

  // check publish topic found
  checkSempQueueSubscriptionTopicExists(options);

  invoke(options)
}

export default queue

export { queue }
