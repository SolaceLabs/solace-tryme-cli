import { checkConnectionParamsExists, checkFeedRunOptions } from '../utils/checkparams';
import { loadLocalFeedFile, loadGitFeedFile } from '../utils/config';
import { Logger } from '../utils/logger';
import { defaultFeedInfoFile, defaultFeedRulesFile, defaultMessagePublishConfig } from '../utils/defaults';
import { SolaceClient } from '../common/feed-publish-client';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkEventCounterLabel, chalkItalic, colorizeTopic } from '../utils/chalkUtils';
import { getLocalEventFeeds, getGitEventFeeds, getFeedEvents, getGitFeedEvents } from '../utils/listfeeds';
import sleep from 'sleep-promise';
import feedRunApi from './feed-run-api';
// @ts-ignore
import { generateEvent } from '@solace-labs/solace-data-generator';
const selectedMessages: any[] = [];
const eventFeedTimers: any[] = [];
const publishStats:any = {};

const feedRun = async (options: ManageFeedPublishOptions, optionsSource: any) => {
  const { helpExamples } = options
  var feedName: string = '';
  var eventNames: string[] = [];
  var gitFeed = false;

  if (helpExamples) {
    // TODO
    process.exit(0);
  }

  checkFeedRunOptions(options, optionsSource);

  var cmdLine = false;
  if (options.useDefaults) {
    cmdLine = true;
    var feedInfo = await loadLocalFeedFile(options.feedName, defaultFeedInfoFile);
    // if (feedInfo.type === 'restapi_feed')
    //   return feedRunApi(options, optionsSource);

    var events = getFeedEvents(options.feedName);
    if (events.length === 0) {
      Logger.logDetailedError(`No events found in the feed`, feedName);
      Logger.error('exiting...')
      process.exit(1)
    }
    
    gitFeed = false;
    feedName = options.feedName;
    eventNames = options.eventNames = events.map((event:any) => event.name);
    options.count = 1;
    optionsSource.count = 'cli';
    options.interval = 1000;
    optionsSource.interval = 'cli';
    options.initialDelay = 0;
    optionsSource.initialDelay = 'cli';
    optionsSource.eventNames = 'cli';    
  } else {
    if (optionsSource.feedName === 'cli') {
      cmdLine = true;
      feedName = options.feedName;
      eventNames = options.eventNames;
      if (feedName && options.communityFeed)
        gitFeed = true;
      var feedInfo = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);

      if (feedInfo.type === 'restapi_feed')
        return feedRunApi(options, optionsSource);

      var events = gitFeed ? await getGitFeedEvents(feedName) : getFeedEvents(feedName);
      var eventsList:any = events.map((event:any) => {
        return {
          message: chalkBoldWhite(event.name) + ' - ' + chalkItalic(colorizeTopic(event.topic)),
          name: event.name,
        }
      })

      if (optionsSource.eventNames !== 'cli') {
        const { MultiSelect } = require('enquirer');
        const pPickEvent = new MultiSelect({
          name: 'localEvent',
          message: `Pick one or more event events \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
          `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
          `    ${chalkBoldLabel('<space>')} to ${chalkBoldVariable('select')}\n` +
          `    ${chalkBoldLabel('a')} to ${chalkBoldVariable('toggle choices to be enabled or disabled')}\n` +
          `    ${chalkBoldLabel('i')} to ${chalkBoldVariable('invert current selection')}\n` +
          `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
          choices: eventsList,
          initial: eventsList.map((e:any, index:number) => index)
        });

        var eventChoices: string | any[] = []
        await pPickEvent.run()
          .then((answer:any) => eventChoices = answer)
          .catch((error:any) => {
            Logger.logDetailedError('interrupted...', error)
            process.exit(1);
          });
        
        options.eventNames = eventChoices;
        optionsSource.eventNames = 'cli';
      } else {
        var missingEvents = eventNames.filter((e:any) => !eventsList.find((el:any) => el.name === e));
        if (missingEvents.length) {
          Logger.logError(`${missingEvents.join(', ')}: Events not defined in the feed...`)
          Logger.logError('exiting...')
          process.exit(1);
        }
        
        options.eventNames = eventNames;
        optionsSource.eventNames = 'cli';
      }
    } else if (optionsSource.eventNames === 'cli') {
      Logger.logError(`Missing event feed name...`)
      Logger.logError('exiting...')
      process.exit(1);
    }
  }

  // check for event in the feed
  if (!cmdLine) {
    const { Select, MultiSelect } = require('enquirer');
    const pFeedSource = new Select({
      name: 'source',
      message: `Pick the event feed source \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'Local Event Feeds',
        'Community Event Feeds'
      ]
    });

    var choice = undefined;
    await pFeedSource.run()
      .then((answer: any) => { choice = answer; })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
    
    if (choice === 'Local Event Feeds') {
      const pPickEvent = new Select({
        name: 'localFeed',
        message: `Pick the event feed \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
        `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
        `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
        choices: getLocalEventFeeds()
      });
  
      await pPickEvent.run()
        .then((answer:any) => feedName = answer)
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });
    } else if (choice === 'Community Event Feeds') {
      var gitFeeds = await getGitEventFeeds();
      if (!gitFeeds || !gitFeeds.length) {
        Logger.logError('no feeds found in the repository...')
        process.exit(1);
      }

      const promptFeed = new Select({
        name: 'gitFeed',
        message: `Pick the event feed \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
        `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
        `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
        choices: gitFeeds
      });
  
      await promptFeed.run()
        .then((answer:any) => feedName = answer, gitFeed = true)
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });        

    }

    options.feedName = feedName;
    options.communityFeed = gitFeed;

    var feedInfo = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);
    if (feedInfo.type === 'restapi_feed')
      return feedRunApi(options, optionsSource);

    var events = gitFeed ? await getGitFeedEvents(feedName) : getFeedEvents(feedName);
    if (events.length === 0) {
      Logger.logDetailedError(`No events found in the feed`, feedName);
      Logger.error('exiting...')
      process.exit(1)
    }
    
    var eventsList:any = events.map((event:any) => {
      return {
        message: chalkBoldWhite(event.name) + ' - ' + chalkItalic(colorizeTopic(event.topic, '$')),
        eventName: event.name,
        eventTopic: event.topic,
        // name: event.name,
        name: event.name + '      ' + event.topic
      }
    })
    const pPickEvent = new MultiSelect({
      name: 'localEvent',
      message: `Pick one or more event events \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('<space>')} to ${chalkBoldVariable('select')}\n` +
      `    ${chalkBoldLabel('a')} to ${chalkBoldVariable('toggle choices to be enabled or disabled')}\n` +
      `    ${chalkBoldLabel('i')} to ${chalkBoldVariable('invert current selection')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: eventsList,
      initial: eventsList.map((e:any, index:number) => index)
    });

    var eventChoices: string | any[] = []
    await pPickEvent.run()
      .then((answer:any) => eventChoices = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
    
    options.eventNames = eventChoices;
    optionsSource.eventNames = 'cli';
  } else {
    var feedInfo = loadLocalFeedFile(feedName, defaultFeedInfoFile);
    if (feedInfo.type === 'restapi_feed')
      return feedRunApi(options, optionsSource);

    var events = getFeedEvents(feedName);
    if (events.length === 0) {
      Logger.logDetailedError(`No events found in the feed`, feedName);
      Logger.error('exiting...')
      process.exit(1)
    }
    
    options.eventNames = [];
    events.map((event:any) => {
      options.eventNames.push(event.name + '      ' + event.topic);
    })
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

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

  var feed = gitFeed ? await loadGitFeedFile(feedName, defaultFeedRulesFile) : loadLocalFeedFile(feedName, defaultFeedRulesFile);

  options.readyForExit = options.eventNames.length;
  options.eventNames.forEach((eventName:any) => {
    var feedRule:any = undefined;
    var name = eventName.split('      ')[0];
    var topic = eventName.split('      ')[1];
    feed.forEach((rule:any) => {
      if (rule.messageName === name && rule.topic === topic) {
        feedRule = rule;
      }
    })

    if (!feedRule) {
      Logger.logWarn(`No feed rule found for name '${name}' in the feed '${feedName}'`)
      return;
    }

    let publishInterval = optionsSource.interval === 'cli' ? options.interval :
                            feedRule.publishSettings?.hasOwnProperty('interval') ? 
                              parseInt(feedRule.publishSettings?.interval) : defaultMessagePublishConfig.interval;
    if (optionsSource.rate === 'cli' && optionsSource.frequency === 'cli') {
      let rate = options.rate ? options.rate : 1.0;
      let freq = 1000;
      switch (options.frequency) {
        case 'msg/s':
          freq = 1000;
          break;
        case 'msg/m':
          freq = 60000;
          break;
        case 'msg/h':
          freq = 3600000;
          break;
        default:
          freq = 1000; // Default to 1 second if undefined
      }

      publishInterval = rate > 1.0 ? freq / rate : freq * rate;
    }

    selectedMessages.push({
      message: feedRule.messageName, 
      topic: feedRule.topic,
      rule: feedRule,
      options: options,
      optionsSource: optionsSource,
      count: optionsSource.count === 'cli' ? options.count : 
              feedRule.publishSettings?.hasOwnProperty('count') ? 
                parseInt(feedRule.publishSettings?.count) : defaultMessagePublishConfig.count,
      interval: publishInterval,
      rate: optionsSource.rate === 'cli' ? options.rate :
              feedRule.publishSettings?.hasOwnProperty('rate') ? 
                parseInt(feedRule.publishSettings?.rate) : defaultMessagePublishConfig.rate,
      frequency: optionsSource.frequency === 'cli' ? options.frequency :
              feedRule.publishSettings?.hasOwnProperty('frequency') ? 
                parseInt(feedRule.publishSettings?.frequency) : defaultMessagePublishConfig.frequency,
      delay: optionsSource.initialDelay === 'cli'? options.initialDelay :
              feedRule.publishSettings?.hasOwnProperty('delay') ? 
                parseInt(feedRule.publishSettings?.delay) : defaultMessagePublishConfig.initialDelay,
      published: 0
    });
  });

  for (var i=0; i<selectedMessages.length; i++) {
    var msg = selectedMessages[i];
    addEventFeedTimer({...msg}, publisher);
  }

  setInterval(() => {
    var completed = selectedMessages.length;
    eventFeedTimers.forEach((t) => {
      if (t.completed && t.message.count >= publishStats[`${t.message.message}-${t.message.topic}`]) {
        completed--;
      }
    });

    if (!completed) {
      Logger.logSuccess('all event feeds published...')
      Logger.logSuccess('exiting...');
      process.exit(0);
    }
  }, 3000);

  setInterval(() => {
    if (options.readyForExit === 0) {
      if (options.waitBeforeExit) {
        setTimeout(function exit() {
          Logger.logWarn(`exiting session (waited-before-exit set for ${options.waitBeforeExit})...`);
          publisher.exit();
        }, options.waitBeforeExit * 1000);
      } else {
        publisher.exit();
      }
    }
  }, 2000);
}

async function publishFeed(publisher:any, msg:any) {
  if (publisher.exited) {
    return;
  }
  var {topic, payload} = generateEvent(msg.rule);
  publisher.publish(topic, payload, msg.options.payloadType, msg.published++);
  publishStats[`${msg.message}-${msg.topic}`]++;
  Logger.success(`published ` +  
                chalkEventCounterLabel(msg.message ? msg.message : 
                  msg.rule.eventName ? msg.rule.eventName : msg.ruleMessageName));
  if (msg.count > 0 && publishStats[`${msg.message}-${msg.topic}`] >= msg.count) {
    var index = eventFeedTimers.findIndex((t) => t.name === msg.message && t.topic === msg.topic);
    if (index < 0) {
      console.error('Hmm... could not find the timer');
      return;
    }
    clearInterval(eventFeedTimers[index].timer);
    eventFeedTimers[index].completed = true;
  }
}

function addEventFeedTimer(msg: any, publisher: any) {
  // console.log('Timer', msg);
  sleep(msg.delay).then(() => { 
    if (!msg.count || msg.count >= 1) {
      eventFeedTimers.push({
        name: msg.message,
        topic: msg.topic,
        message: msg,
        timer: setInterval(publishFeed, msg.interval, publisher, msg)
      });
    }
    publishStats[`${msg.message}-${msg.topic}`] = 0;
    publishFeed(publisher, msg);
  });
}

export default feedRun

export { feedRun }
