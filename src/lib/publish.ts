import * as fs from 'fs'
import { checkConnectionParamsExists, checkForCliTopics, checkPubTopicExists, checkPubQueueExists } from '../utils/checkparams'
import { SolaceClient } from '../common/publish-client'
import { Logger } from '../utils/logger'
import { getDefaultMessage, delay } from '../utils/defaults';
import { displayHelpExamplesForPublish } from '../utils/examples';
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config';
import { StdinRead } from '../utils/stdinread'

const publish = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  var interrupted = false;
  try {
    await publisher.connect()
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  process.on('SIGINT', function () {
    'use strict';
    if (interrupted) return;
    interrupted = true;
    Logger.logInfo('operation interrupted...')
    publisher.setExited(true);
    publisher.exit();
  });

  if (options.exitAfter) {
    setTimeout(function exit() {
      Logger.logWarn(`exiting session (exit-after set for ${options.exitAfter})...`);
      publisher.exit();
    }, options.exitAfter * 1000);
  }

  var payloadType:any = options.payloadType as string;
  var message:any = options.message as string;

  var file:any = options.file as string;
  if (file) {
    if (!fileExists(file)) {
      Logger.logSuccess(`missing file '${file}'`);
      Logger.logError('exiting...')
      process.exit(1)
    }
    
    try {
      if (Logger.isBinaryFile(file)) {
        message = fs.readFileSync(file, 'binary');
        payloadType = 'bytes';
      } else {
        message = fs.readFileSync(file, 'utf8');
      }

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

  if (count === 1) {
    if (options.queue) {
      for (var i=0; i<options.queue.length; i++) {
        if (optionsSource.file !== 'cli' && optionsSource.stdin !== 'cli' && optionsSource.message !== 'cli')
          message = optionsSource.emptyMessage === 'cli' ? "" : getDefaultMessage();
      
        publisher.deliver(options.queue[i], message, payloadType, 0);
      } 
    } else {
      for (var i=0; i<options.topic.length; i++) {
        if (optionsSource.file !== 'cli' && optionsSource.stdin !== 'cli' && optionsSource.message !== 'cli')
          message = optionsSource.emptyMessage === 'cli' ? "" : getDefaultMessage();
      
        publisher.publish(options.topic[i], message, payloadType, 0);
      } 
    }    
    if (options.waitBeforeExit) {
      setTimeout(function exit() {
        Logger.logWarn(`exiting session (wait-before-exit set for ${options.waitBeforeExit})...`);
        publisher.exit();
      }, options.waitBeforeExit * 1000);
    } else {
      setTimeout(function exit() {
        publisher.exit();
      }, 1500);
    }
  } else {
    for (var iter=count ? count : 1, n=1;iter > 0;iter--, n++) {
      if (options.queue) {
        for (var i=0; i<options.queue.length; i++) {
          if (optionsSource.file !== 'cli' && optionsSource.stdin !== 'cli' && optionsSource.message !== 'cli')
            message = optionsSource.emptyMessage === 'cli' ? "" : getDefaultMessage();
          publisher.deliver(options.queue[i], message, payloadType, n-1);
        }
      } else {
        for (var i=0; i<options.topic.length; i++) {
          if (optionsSource.file !== 'cli' && optionsSource.stdin !== 'cli' && optionsSource.message !== 'cli')
            message = optionsSource.emptyMessage === 'cli' ? "" : getDefaultMessage();
          publisher.publish(options.topic[i], message, payloadType, n-1);
        }
      }
      if (interval) await delay(interval)
    }
    if (options.waitBeforeExit) {
      setTimeout(function exit() {
        Logger.logWarn(`exiting session (wait-before-exit set for ${options.waitBeforeExit})...`);
        publisher.exit();
      }, options.waitBeforeExit * 1000);
    } else {
      setTimeout(function exit() {
        publisher.exit();
      }, 1500);
    }
  }
}

const publisher = (options: MessageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options

  if (helpExamples) {
    displayHelpExamplesForPublish()
    process.exit(0);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkPubTopicExists(options.topic);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }

  // if subscriptions are specified, remove the default subscription at pos-0
  checkForCliTopics('topic', options, optionsSource);

  publish(options, optionsSource)
}

export default publisher

export { publisher }
