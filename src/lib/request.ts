import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { RequestClient } from '../common/request-client'
import { displayHelpExamplesForRequest } from '../utils/examples';
import { defaultRequestMessage, delay } from '../utils/defaults';
import { saveOrUpdateCommandSettings } from '../utils/config';

const request = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const { count, interval } = options;
  const requestor = new RequestClient(options);
  try {
    await requestor.connect();

    var message:any = options.message as string;
    optionsSource.message === 'default' ? message = defaultRequestMessage : message;
    var topicName = (typeof options.topic === 'object') ? options.topic[0] : options.topic;
    requestor.request(topicName, message);
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }
}

const requestor = (options: MessageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options
  
  if (helpExamples) {
    displayHelpExamplesForRequest()
    process.exit(0);
  }
  
  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkPubTopicExists(options.topic);

  // if subscriptions are specified, remove the default subscription at pos-0
  checkForCliTopics('topic', options, optionsSource);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }

  request(options, optionsSource);
}

export default requestor

export { requestor }
