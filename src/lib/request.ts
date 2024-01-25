import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { SolaceClient } from '../common/request-client'
import { displayHelpExamplesForRequest } from '../utils/examples';
import { defaultRequestMessage, delay } from '../utils/defaults';
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config';

const request = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const requestor = new SolaceClient(options);
  var message:any = options.message as string;
  optionsSource.message === 'default' ? message = defaultRequestMessage : message;
  
  var file:any = options.file as string;
  if (file) {
    if (!fileExists(file)) {
      Logger.logSuccess(`missing file '${file}'`);
      Logger.logError('exiting...')
      process.exit(1)
    }
    
    try {
      var content = fs.readFileSync(file, 'utf-8')
      var obj = JSON.parse(content);
      message = JSON.stringify(obj);
    } catch (error: any) {
      Logger.logDetailedError('read file failed', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      Logger.logError('exiting...')
      process.exit(1)
    }  
  }

  try {
    await requestor.connect();
    // if (options.replyToTopic)
    //   requestor.subscribe(options.replyToTopic)
    var topicName = (typeof options.topic === 'object') ? options.topic[0] : options.topic;
    requestor.request(topicName, message);
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (options.exitAfter) {
    setTimeout(function exit() {
      Logger.logWarn(`exiting session (exit-after set for ${options.exitAfter})...`);
      requestor.exit();
    }, options.exitAfter * 1000);
  }

  process.on('SIGINT', function () {
    'use strict';
    Logger.logWarn('operation interrupted...')
    requestor.exit();
  });
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
