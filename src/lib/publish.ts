import * as fs from 'fs'
import concat from 'concat-stream'
import { checkConnectionParamsExists, checkForCliTopics, checkPubTopicExists } from '../utils/checkparams'
import { SolaceClient } from '../common/publish-client'
import { Logger } from '../utils/logger'
import { getDefaultMessage, delay } from '../utils/defaults';
import { displayHelpExamplesForPublish } from '../utils/examples';
import { fileExists, saveOrUpdateCommandSettings } from '../utils/config';

const publish = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  try {
    await publisher.connect()
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  process.on('SIGINT', function () {
    'use strict';
    Logger.logWarn('operation interrupted...')
    publisher.setExited(true);
    publisher.exit();
  });

  if (options.exitAfter) {
    setTimeout(function exit() {
      Logger.logWarn(`exiting session (exit-after set for ${options.exitAfter})...`);
      publisher.exit();
    }, options.exitAfter * 1000);
  }

  var message:any = options.message as string;
  message = optionsSource.message === 'default' ? getDefaultMessage() : message;

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

  if (count === 1) {
    for (var i=0; i<options.topic.length; i++) {
      if (optionsSource.message === 'default') message = getDefaultMessage();
      publisher.publish(options.topic[i], message, 0);
    } 
    if (options.waitBeforeExit) {
      setTimeout(function exit() {
        Logger.logWarn(`exiting session (waited-before-exit set for ${options.waitBeforeExit})...`);
        publisher.exit();
      }, options.waitBeforeExit * 1000);
    } else {
      publisher.exit();
    }
  } else {
    for (var iter=count ? count : 1, n=1;iter > 0;iter--, n++) {
      for (var i=0; i<options.topic.length; i++) {
        if (optionsSource.message === 'default') message = getDefaultMessage();
        publisher.publish(options.topic[i], message, n-1);
      }
      if (interval) await delay(interval)
    }
    if (options.waitBeforeExit) {
      setTimeout(function exit() {
        Logger.logWarn(`exiting session (waited-before-exit set for ${options.waitBeforeExit})...`);
        publisher.exit();
      }, options.waitBeforeExit * 1000);
    } else {
      publisher.exit();
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

  if (options.stdin) {
    Logger.ctrlDToPublish();
    process.stdin.pipe(
      concat((data) => {
        options.message = data.toString().slice(0, -1)
        optionsSource.message = 'cli'
        publish(options, optionsSource)
      }),
    )
  } else {
    publish(options, optionsSource)
  }
}

export default publisher

export { publisher }
