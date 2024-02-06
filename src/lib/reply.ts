import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config'
import { SolaceClient } from '../common/reply-client'
import { displayHelpExamplesForReply } from '../utils/examples'
import { getDefaultMessage } from '../utils/defaults'

const reply = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const replier = new SolaceClient(options);
  var message:any = options.message as string;
  optionsSource.message === 'default' ? message = getDefaultMessage() : message;

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
    await replier.connect();
    replier.subscribe(options.topic, message, optionsSource.message === 'cli');
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (options.exitAfter) {
    setTimeout(function exit() {
      Logger.logWarn(`exiting session (exit-after set for ${options.exitAfter})...`);
      replier.exit();
    }, options.exitAfter * 1000);
  }

  Logger.logInfo('press Ctrl-C to exit');  
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    Logger.logWarn('operation interrupted...')
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

  reply(options, optionsSource);
}

export default replier

export { replier }
