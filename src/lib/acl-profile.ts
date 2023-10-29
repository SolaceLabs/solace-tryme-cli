import { saveConfig, loadConfig } from '../utils/config'
import { Logger } from '../utils/logger'
import { checkSempConnectionParamsExists, checkSempQueueParamsExists, 
        checkSempQueueSubscriptionTopicExists, checkSempQueuePartitionSettings } from '../utils/parse'
import { SempClient } from '../common/aclprofile-client'

const invoke = async (
  options: ClientOptions
) => {
  const client = new SempClient(options);
  try {
    await client.manageAclProfile();
  } catch (error:any) {
    Logger.error('Exiting...')
    process.exit(1)
  }

  Logger.success('Exiting...')
  process.exit(0);
}

const aclProfile = (options: ClientOptions, optionsSource: object) => {
  const { save, view, exec, helpExamples } = options

  if (helpExamples) {
        console.log(`
Examples:
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

  if (exec) {
    const savedOptions = loadConfig('queue', exec);
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

export default aclProfile

export { aclProfile }
