import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkForCliTopics } from '../utils/checkparams'
import { SolaceClient } from '../common/request-client'
import { displayHelpExamplesForRequest } from '../utils/examples';
import { delay, getDefaultMessage } from '../utils/defaults';
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config';
import { StdinRead } from '../utils/stdinread'

const request = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  const { count, interval } = options;
  const requestor = new SolaceClient(options);
  var interrupted = false;

  try {
    await requestor.connect()
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
    if (interrupted) return;
    interrupted = true;
    Logger.logInfo('operation interrupted...')
    requestor.exit();
  });

  var payloadType:any = options.payloadType as string;
  var message:any = options.message as string;
  message = (optionsSource.message !== 'cli' && (optionsSource.defaultMessage === 'default' || optionsSource.defaultMessage === 'cli')) ? getDefaultMessage() : message;
  
  var file:any = options.file as string;
  if (file) {
    if (!fileExists(file)) {
      Logger.logError(`missing file '${file}'`);
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
    // if (options.replyToTopic)
    //   requestor.subscribe(options.replyToTopic)
    var topicName = (typeof options.topic === 'object') ? options.topic[0] : options.topic;
    if (count === 1) {
      requestor.request(topicName, message, payloadType, 1);
    } else {
      for (var iter=count ? count : 1, n=1;iter > 0;iter--, n++) {
        requestor.request(topicName, message, payloadType, n);
        if (interval) await delay(interval)        
      }
    }

    if (options.waitBeforeExit) {
      setTimeout(function exit() {
        Logger.logWarn(`exiting session (wait-before-exit set for ${options.waitBeforeExit})...`);
        requestor.exit();
      }, options.waitBeforeExit * 1000);
    } else {
      setTimeout(function exit() {
        requestor.exit();
      }, 1500);
    }
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
