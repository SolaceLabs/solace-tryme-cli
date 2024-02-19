import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config'
import { SolaceClient } from '../common/reply-client'
import { displayHelpExamplesForReply } from '../utils/examples'
import { getDefaultMessage } from '../utils/defaults'
import { StdinRead } from '../utils/stdinread'

const reply = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const replier = new SolaceClient(options);
  var interrupted = false;

  try {
    await replier.connect();
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

  process.on('SIGINT', function () {
    'use strict';
    if (interrupted) return;
    interrupted = true;
    Logger.logWarn('operation interrupted...')
    replier.exit();
  });

  var message:any = options.message as string;
  message = (optionsSource.defaultMessage === 'cli') ? getDefaultMessage() : message;

  var contentType:any = options.contentType as string;

  var file:any = options.file as string;
  if (file) {
    if (!fileExists(file)) {
      Logger.logSuccess(`missing file '${file}'`);
      Logger.logError('exiting...')
      process.exit(1)
    }
    
    try {
      message = fs.readFileSync(file, 'utf-8')
    } catch (error: any) {
      Logger.logDetailedError('read file failed', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      Logger.logError('exiting...')
      process.exit(1)
    }  
  }

  if (options.stdin) {
    Logger.ctrlDToPublish();
    var readLines = new StdinRead();
    await readLines.getData();
    message = readLines.data();
  }

  try {
    replier.subscribe(options.topic, message, contentType);
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  Logger.logInfo('press Ctrl-C to exit');  
  process.stdin.resume();
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
