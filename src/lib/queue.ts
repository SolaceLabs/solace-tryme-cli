import { Logger } from '../utils/logger'
import { SempClient } from '../common/queue-client'
import { displayHelpExamplesForQueue } from '../utils/examples'
import { checkForCliTopics, checkSempConnectionParamsExists, checkSempQueueParamsExists, checkSempQueuePartitionSettings, 
        checkSempQueueSubscriptionTopicExists } from '../utils/checkparams';
import { saveOrUpdateCommandSettings } from '../utils/config';

const invoke = async (
  options: ManageClientOptions,
  optionsSource: any
) => {
  const client = new SempClient(options);
  try {
    await client.manageQueue();
  } catch (error:any) {
    Logger.logDetailedError(`queue ${options.operation?.toLocaleLowerCase()} failed with error`, `${error.toString()}`)
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.error('exiting...')
    process.exit(1)
  }

  Logger.logSuccess('exiting...')
  process.exit(0);
}

const queue = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options

  if (helpExamples) {
    displayHelpExamplesForQueue()
    process.exit(0);
  }

  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp queue operation params
  checkSempQueueParamsExists(options, optionsSource);

  // check semp queue operation params
  checkSempQueuePartitionSettings(options);

  // check publish topic found
  checkSempQueueSubscriptionTopicExists(options);

  // if subscriptions are specified, remove the default subscription at pos-0
  checkForCliTopics('addSubscriptions', options, optionsSource);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }
  
  invoke(options, optionsSource)
}

export default queue

export { queue }
