import { checkConnectionParamsExists } from '../utils/checkparams';
import { loadLocalFeedFile, loadGitFeedFile, loadGitApiFeedRuleFile, loadLocalApiFeedRuleFile } from '../utils/config';
import { Logger } from '../utils/logger';
import { defaultFeedApiEndpointFile, defaultFeedRulesFile, defaultFeedInfoFile } from '../utils/defaults';
import { SolaceClient } from '../common/feed-publish-client';
import { chalkEventCounterLabel, chalkEventCounterValue, chalkItalic, colorizeTopic } from '../utils/chalkUtils';
import sleep from 'sleep-promise';
import { fakeDataValueGenerator } from './feed-datahelper';

const selectedEndpoints: any[] = [];
const eventFeedTimers: any[] = [];
const publishStats:any = {};

const feedRunApi = async (options: ManageFeedPublishOptions, optionsSource: any) => {
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

  var apiFeed = options.communityFeed ? loadGitFeedFile(options.feedName, defaultFeedApiEndpointFile) : loadLocalFeedFile(options.feedName, defaultFeedApiEndpointFile);
  var apiFeedInfo = options.communityFeed ? loadGitFeedFile(options.feedName, defaultFeedInfoFile) : loadLocalFeedFile(options.feedName, defaultFeedInfoFile);
  var apiFeedRule = options.communityFeed ? loadGitFeedFile(options.feedName, defaultFeedRulesFile) : loadLocalFeedFile(options.feedName, defaultFeedRulesFile);
  
  if (apiFeed.apiUrl.includes('$') && !apiFeedRule) {
    Logger.logError('api endpoint contains placeholders, please configure parameter rules...')
    Logger.logError('exiting...')
    process.exit(1);
  }

  selectedEndpoints.push({
    options: options,
    optionsSource: optionsSource,
    info: apiFeedInfo,
    api: apiFeed,
    rule: apiFeedRule, 
    name: apiFeedInfo.name,
    topic: optionsSource.topic === 'cli' ? options.topic : 
            apiFeedRule?.hasOwnProperty('topic') ? apiFeedRule.topic : 'solace/feed/' + apiFeedInfo.name.toLowerCase(),
    count: optionsSource.count === 'cli' ? options.count : 
            apiFeedRule.publishSettings?.hasOwnProperty('count') ? apiFeedRule.publishSettings?.count : 20,
    interval: optionsSource.interval === 'cli' ? options.interval :
            apiFeedRule.publishSettings?.hasOwnProperty('interval') ? apiFeedRule.publishSettings?.interval : 3,
    delay: optionsSource.initialDelay === 'cli'? options.initialDelay :
            apiFeedRule.publishSettings?.hasOwnProperty('delay') ? apiFeedRule.publishSettings?.delay : 0,
    published: 0
  });

  for (var i=0; i<selectedEndpoints.length; i++) {
    var endpoint = selectedEndpoints[i];
    addEventFeedTimer(endpoint, publisher);
  }

  setInterval(() => {
    var completed = selectedEndpoints.length;
    eventFeedTimers.forEach((t) => {
      if (t.completed && t.published >= publishStats[`${t.api.topic}`]) {
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

  // process.stdin.resume();
}

async function publishFeed(publisher:any, feed:any) {
  try {
    var headers:any = { Accept: 'application/json' };

    var apiUrl = feed.api.apiUrl;
    var apiKey = feed.api.apiKey;
    var apiRules = feed.rule.rules;
    if (feed.api.apiKeyUrlEmbedded) 
      apiUrl = apiUrl.replaceAll(`$${feed.api.apiKeyUrlParam}`, apiKey);
  
    if (!feed.api.apiKeyUrlEmbedded && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    var params = Object.keys(apiRules);
    var ruleData:any = {};
    if (params.length > 0) {
      for (var i=0; i<params.length; i++) {
        ruleData[params[i]] = await fakeDataValueGenerator({rule: apiRules[params[i]].rule, count: 1});
      }
    }
  
    var topic = feed.api.topic;
    for (var j=0; j<params.length; j++) {
      apiUrl = apiUrl.replaceAll(`$${params[j]}`, ruleData[params[j]]);
      topic = topic.replaceAll(`{${params[j]}}`, ruleData[params[j]]);
    }

    (async () => {
      var payload = await (await fetch(`${apiUrl}`, {
        headers: headers
      })).json();

      if (!payload) {
        Logger.logError('no data received from the API feed...')
      } else {
        Logger.logSuccess('data received from the API feed...')
      }

      publisher.publish(topic, payload, feed.options.payloadType, feed.published++);
      publishStats[`${feed.api.topic}`]++;
      Logger.info(chalkEventCounterValue(publishStats[`${feed.api.topic}`]) + ' ' +  chalkEventCounterLabel(feed.name));
      if (publishStats[`${feed.api.topic}`] >= feed.count) {
        var index = eventFeedTimers.findIndex((t) => t.name === feed.name);
        if (index < 0) {
          console.error('Hmm... could not find the timer');
          return;
        }
        clearInterval(eventFeedTimers[index].timer);
        eventFeedTimers[index].completed = true;
    
        if (publishStats[`${feed.api.topic}`] >= feed.count) {
          Logger.logSuccess('exiting...');
          process.exit(0);
        }
      }
  
    })();
  } catch (error:any) {
    Logger.logDetailedError(`fetch from api endpoint list failed with error`, `${error.toString()}`)
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

function addEventFeedTimer(feed: any, publisher: any) {
  // console.log('Timer', msg);
  sleep(feed.delay * 1000).then(() => { 
    publishStats[`${feed.api.topic}`] = 0;
    eventFeedTimers.push({
      name: feed.name,
      timer: setInterval(publishFeed, feed.interval * 1000, publisher, feed)
    });
  });
}

export default feedRunApi

export { feedRunApi }