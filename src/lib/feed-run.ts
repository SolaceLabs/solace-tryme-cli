import { checkConnectionParamsExists, checkFeedRunOptions } from '../utils/checkparams';
import { loadLocalFeedFile, loadGitFeedFile, loadGitFeedSessionFile, loadLocalFeedSessionFile } from '../utils/config';
import { Logger } from '../utils/logger';
import { defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSessionFile, defaultMessagePublishConfig } from '../utils/defaults';
import { SolaceClient } from '../common/feed-publish-client';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkEventCounterLabel, chalkItalic, colorizeTopic } from '../utils/chalkUtils';
import { getLocalEventFeeds, getGitEventFeeds, getFeedEvents, getGitFeedEvents } from '../utils/listfeeds';
import sleep from 'sleep-promise';
import feedRunApi from './feed-run-api';
// @ts-ignore
import { generateEvent } from '@solace-labs/solace-data-generator';
import { messagePropertiesJson } from '../utils/msgprops';
import { sessionPropertiesJson } from '../utils/sessionprops';

const selectedMessages: any[] = [];
const eventFeedTimers: any[] = [];
const publishStats:any = {};

const feedRun = async (options: ManageFeedPublishOptions, optionsSource: any) => {
  const { helpExamples, quiet } = options
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
  } else if (quiet && !options.lint) {
    if (optionsSource.feedName !== 'cli' || !options.feedName) {
      Logger.logError(`Missing event feed name...`)
      Logger.logError('exiting...')
      process.exit(1);
    }

    feedName = options.feedName;
    gitFeed = options.communityFeed;
    var feedInfo = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);    

    var events = gitFeed ? await getGitFeedEvents(feedName) : getFeedEvents(feedName);
    if (events.length === 0) {
      Logger.logDetailedError(`No events found in the feed`, feedName);
      Logger.error('exiting...')
      process.exit(1)
    }
    
    if (optionsSource.eventNames === 'cli') {
      var missingEvents = eventNames.filter((e:any) => !events.find((el:any) => el.name === e));
      if (missingEvents.length) {
        Logger.logError(`${missingEvents.join(', ')}: Events not defined in the feed...`)
        Logger.logError('exiting...')
        process.exit(1);
      }        
    } else {
      eventNames = options.eventNames = events.map((event:any) => event.name);
      options.eventNames = eventNames;
      optionsSource.eventNames = 'cli';      
    }
  
    options.count = (optionsSource.count === 'cli' ? options.count : 1);
    optionsSource.count = 'cli';
    options.interval = (optionsSource.interval === 'cli' ? options.interval : 1000);
    optionsSource.interval = 'cli';
    options.initialDelay = (optionsSource.initialDelay === 'cli' ? options.initialDelay : 0);
  } else if (!options.lint) {
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
          // name: event.name,
          name: event.name + '      ' + event.topic
        }
      })

      if (optionsSource.eventNames !== 'cli' && !quiet) {
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
      } else if (optionsSource.eventNames === 'cli') {
        var missingEvents = eventNames.filter((e:any) => !events.find((el:any) => el.name === e));
        if (missingEvents.length) {
          Logger.logError(`${missingEvents.join(', ')}: Events not defined in the feed...`)
          Logger.logError('exiting...')
          process.exit(1);
        }
        
        options.eventNames = eventNames;
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
  if (!cmdLine && !quiet && !options.lint) {
    const { Select, AutoComplete, MultiSelect } = require('enquirer');
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
      var feeds = getLocalEventFeeds();
      if (!feeds || !feeds.length) {
        Logger.logError('no local feeds found...')
        process.exit(1);
      }
      const choices = feeds.map((feed) => feed);
      try {
        const pFeedSelection = new AutoComplete({
          name: 'feed',
          message: `Pick the feed [Found ${choices.length}, displaying ${choices.length > 10 ? 10 : choices.length}]\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
          `    ${chalkBoldLabel('<char>>')} enter search string to refine the list\n` +
          `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
          `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
          required: true,
          limit: 10,
          multiple: false,
          choices: choices,
          validate: (value: string) => {  return !!value; }
        });
        
        await pFeedSelection.run()
          .then((answer:any) => {
            gitFeed = false;
            feedName = answer;
          })
          .catch((error:any) => {
            Logger.logDetailedError('interrupted...', error)
            process.exit(1);
          });
      } catch(error:any) {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      }   
    } else if (choice === 'Community Event Feeds') {
      var feeds = await getGitEventFeeds();
      if (!feeds || !feeds.length) {
        Logger.logError('no feeds found in the repository...')
        process.exit(1);
      }
      const choices = feeds.map((feed) => feed.name);
      try {
        const pFeedSelection = new AutoComplete({
          name: 'feed',
          message: `Pick the feed [Found ${choices.length}, displaying ${choices.length > 10 ? 10 : choices.length}]\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
          `    ${chalkBoldLabel('<char>>')} enter search string to refine the list\n` +
          `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
          `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
          required: true,
          limit: 10,
          multiple: false,
          choices: choices,
          validate: (value: string) => {  return !!value; }
        });
        
        await pFeedSelection.run()
          .then((answer:any) => {
            gitFeed = true;
            feedName = answer;
          })
          .catch((error:any) => {
            Logger.logDetailedError('interrupted...', error)
            process.exit(1);
          });
      } catch(error:any) {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      } 
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
  } else if (!options.lint) {
    var feedInfo = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);
    if (feedInfo.type === 'restapi_feed')
      return feedRunApi(options, optionsSource);

    var events = gitFeed ? await getGitFeedEvents(feedName) : getFeedEvents(feedName);
    if (events.length === 0) {
      Logger.logDetailedError(`No events found in the feed`, feedName);
      Logger.error('exiting...')
      process.exit(1)
    }
    
    if (optionsSource.eventNames === 'cli') {
      var foundEvents = events.filter((el:any) => options.eventNames.find((e:any) => el.name === e));

      options.eventNames = [];
      foundEvents.map((event:any) => {
        options.eventNames.push(event.name + '      ' + event.topic);
      })
      optionsSource.eventNames = 'cli';      
    } else {
      options.eventNames = events.map((event:any) => event.name + '      ' + event.topic);
      optionsSource.eventNames = 'cli';      
    }
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  // load feed rules
  var feed = gitFeed ? await loadGitFeedFile(feedName, defaultFeedRulesFile) : loadLocalFeedFile(feedName, defaultFeedRulesFile);

  function fixSessionSettings(sessionSettings: any, property: string, options: any, optionName: any = null) {
    if (sessionSettings[property] !== undefined && sessionSettings[property].exposed && sessionSettings[property].value !== undefined) {
      let optionProperty = optionName ? optionName : property;
      options[optionProperty] = sessionSettings[property].value !== undefined ? 
                                  sessionSettings[property].value : sessionSettings[property].default;
      if (sessionSettings[property].datatype === 'number') {
        options[optionProperty] = parseInt(options[optionProperty]);
      } else if (sessionSettings[property].datatype === 'boolean') {
        options[optionProperty] = options[optionProperty] === 'true' ? true : false;
      }
    }
  }

  // populate feed settings (session and message)
  var sessionSettings:any = null;
  try {
    sessionSettings = gitFeed ? await loadGitFeedSessionFile(feedName, defaultFeedSessionFile) : 
                              loadLocalFeedSessionFile(feedName, defaultFeedSessionFile);
  } catch (error:any) {
    sessionSettings = { ...sessionPropertiesJson };
  }

  if (sessionSettings) {
    fixSessionSettings(sessionSettings, 'connectRetriesPerHost', options);
    fixSessionSettings(sessionSettings, 'connectRetries', options, 'connectionRetries');
    fixSessionSettings(sessionSettings, 'connectTimeoutInMsecs', options, 'connectTimeout');
    fixSessionSettings(sessionSettings, 'reconnectRetries', options);
    fixSessionSettings(sessionSettings, 'reconnectRetryWaitInMsecs', options, 'reconnectRetryWait');
    fixSessionSettings(sessionSettings, 'readTimeoutInMsecs', options, 'readTimeout');
    fixSessionSettings(sessionSettings, 'includeSenderId', options);
    fixSessionSettings(sessionSettings, 'clientName', options);
    fixSessionSettings(sessionSettings, 'applicationDescription', options, 'description');
    fixSessionSettings(sessionSettings, 'generateReceiveTimestamps', options, 'receiveTimestamps');
    fixSessionSettings(sessionSettings, 'generateSendTimestamps', options, 'sendTimestamps');
    fixSessionSettings(sessionSettings, 'generateSequenceNumber', options);
    fixSessionSettings(sessionSettings, 'sendBufferMaxSize', options);
    fixSessionSettings(sessionSettings, 'keepAliveIntervalInMsecs', options, 'keepAlive');
    fixSessionSettings(sessionSettings, 'keepAliveIntervalsLimit', options, 'keepAliveIntervalLimit');
  }

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

    const msgOptions = { ...options };
    const defaultMessageSettings = messagePropertiesJson;
    getDefaultMessageSettings(defaultMessageSettings, msgOptions);
    if (feedRule.messageSettings && Object.keys(feedRule.messageSettings).length > 0) {
      getMessageSettings(defaultMessageSettings, feedRule.messageSettings, msgOptions);
    }
    
    selectedMessages.push({
      message: feedRule.messageName, 
      topic: feedRule.topic,
      rule: feedRule,
      options: {
        ...msgOptions
      },
      optionsSource: optionsSource,
      count: optionsSource.count === 'cli' ? options.count : 
              feedRule.publishSettings?.hasOwnProperty('count') ? 
                parseInt(feedRule.publishSettings?.count) : defaultMessagePublishConfig.count,
      interval: publishInterval,
      delay: optionsSource.initialDelay === 'cli'? options.initialDelay :
              feedRule.publishSettings?.hasOwnProperty('delay') ? 
                parseInt(feedRule.publishSettings?.delay) : defaultMessagePublishConfig.initialDelay,
      published: 0
    });
  });

  // fix publishConfirmation
  selectedMessages.forEach((msg:any) => {
    if (msg.options?.publishConfirmation === true) {
      options.publishConfirmation = true;
    }
  });

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

function fixDefaultMessageSettings(defaultSettings: any, property: string, options: any, optionName: any = null) {
  if (defaultSettings[property] !== undefined && defaultSettings[property].exposed) {
    let optionProperty = optionName ? optionName : property;
    options[optionProperty] = defaultSettings[optionProperty].default;
    if (defaultSettings[property].datatype === 'number') {
      options[optionProperty] = parseInt(options[optionProperty]);
    } else if (defaultSettings[property].datatype === 'boolean') {
      options[optionProperty] = options[optionProperty] === 'true' ? true : false;
    }      
  }

  return;
}

function fixMessageSettings(defaultSettings: any, messageSettings: any, property: string, options: any, optionName: any = null) {
  if (defaultSettings[property] !== undefined && defaultSettings[property].exposed && messageSettings[property] !== undefined) {
    let optionProperty = optionName ? optionName : property;
    options[optionProperty] = messageSettings[optionProperty];
    if (defaultSettings[property].datatype === 'number') {
      options[optionProperty] = parseInt(options[optionProperty]);
    } else if (defaultSettings[property].datatype === 'boolean') {
      options[optionProperty] = options[optionProperty] === 'true' ? true : false;
    }      
  }

  return;
}

const getMessageSettings = (defaultSettings: any, settings: any, msgOptions: any) => {
  if (settings && Object.keys(settings).length > 0) {
    fixMessageSettings(defaultSettings, settings, 'payloadType', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'publishConfirmation', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'appMessageId', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'appMessageType', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'correlationId', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'correlationKey', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'deliveryMode', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'dmqEligible', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'elidingEligible', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'replyToTopic', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'sequenceNumber', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'timeToLive', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'userProperties', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'httpContentType', msgOptions);
    fixMessageSettings(defaultSettings, settings, 'httpContentEncoding', msgOptions);
    if (settings.partitionKeys)
      msgOptions.partitionKeys = settings.partitionKeys;
  }
}

const getDefaultMessageSettings = (defaultSettings: any, msgOptions: any) => {
  fixDefaultMessageSettings(defaultSettings, 'payloadType', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'publishConfirmation', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'appMessageId', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'appMessageType', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'correlationId', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'correlationKey', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'deliveryMode', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'dmqEligible', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'elidingEligible', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'replyToTopic', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'sequenceNumber', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'timeToLive', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'userProperties', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'httpContentType', msgOptions);
  fixDefaultMessageSettings(defaultSettings, 'httpContentEncoding', msgOptions);
}

async function publishFeed(publisher:any, msg:any) {
  if (publisher.exited) {
    return;
  }
  var {topic, payload} = generateEvent(msg.rule);
  publisher.publish(topic, payload, msg.options, msg.published++);
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
