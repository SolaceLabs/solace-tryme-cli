import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { saveOrUpdateCommandSettings } from '../utils/config'
import { ReplyClient } from '../common/reply-client'
import { displayHelpExamplesForReply } from '../utils/examples'

const reply = async (
  options: MessageClientOptions
) => {
  const replier = new ReplyClient(options);
  try {
    await replier.connect();
    replier.subscribe(options.topic);
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  Logger.logInfo('press Ctrl-C to exit');  
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    replier.exit();
  });
}

const replier = (options: MessageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options
  
  if (helpExamples) {
    displayHelpExamplesForReply()
    process.exit(0);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  // checkSubTopicExists(options);

  // if subscriptions are specified, remove the default subscription at pos-0
  checkForCliTopics('topic', options, optionsSource);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }

  reply(options);
}

export default replier

export { replier }
