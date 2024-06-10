import * as fs from 'fs'
import { Parser } from '@asyncapi/parser';
import { Logger } from '../utils/logger'
import { chalkBoldWhite, chalkBoldLabel, chalkBoldVariable, chalkBoldTopicSeparator, chalkWhite, colorizeTopic, wrapContent } from '../utils/chalkUtils'
import { ManageFeedClientOptionsEmpty } from '../utils/instances';
import analyze from './feed-analyze';
import { loadLocalFeedFile, loadGitFeedFile, processPlainPath, readFile } from '../utils/config';
import { defaultFeedAnalysisFile, defaultFeedInfoFile, defaultGitRepo, defaultStmFeedsHome } from '../utils/defaults';
import { getGitEventFeeds, getLocalEventFeeds } from '../utils/listfeeds';

const preview = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var feedName, fileName, gitFeed = undefined;

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    fileName = options.fileName;
    if (feedName && options.communityFeed)
      gitFeed = true;
  } else {    
    const { Select } = require('enquirer');
    const prompt = new Select({
      name: 'source',
      message: `Pick the preview source \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'AsyncAPI File',
        'Local Event Feeds',
        'Community Event Feeds'
      ]
    });

    var choice = undefined;
    await prompt.run()
      .then((answer: any) => { choice = answer; })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
    
    const { Input } = require('enquirer');
    if (choice === 'AsyncAPI File') {
      const prompt = new Input({
        message: 'Enter AsyncAPI file',
        initial: 'asyncapi.json'
      });
      
      await prompt.run()
        .then((answer:any) => fileName = answer)
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });
    } else if (choice === 'Local Event Feeds') {
      var feeds = getLocalEventFeeds();
      if (!feeds || !feeds.length) {
        Logger.logError('no local feeds found...')
        process.exit(1);
      }
      const prompt = new Select({
        name: 'localFeed',
        message: `Pick the event feed \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
        `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
        `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
        choices: feeds
      });
  
      await prompt.run()
        .then((answer:any) => feedName = answer, gitFeed = false)
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
        message: `Pick the event feed (↑↓ keys to ${chalkBoldVariable('move')} and ↵ to ${chalkBoldVariable('submit')})`,
        choices: gitFeeds
      });
  
      await promptFeed.run()
        .then((answer:any) => feedName = answer)
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });        

      gitFeed = true;
    }
  }

  var data:any = undefined;
  if (fileName) {
    options.fileName = fileName;
    data = await analyze(options, optionsSource);
  } else if (feedName) {
    options.feedName = feedName;
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedAnalysisFile) : loadLocalFeedFile(feedName, defaultFeedAnalysisFile);
  }
    
  if (!data) {
    Logger.logWarn('operation interrupted...')
    process.exit(1);
  }

  var result:any = [];
  data.info['x-ep-application-domain-name'] && result.push(chalkBoldLabel('├──Application Domain: ') + chalkBoldWhite(data.info['x-ep-application-domain-name']))
  data.info['title'] && result.push(chalkBoldLabel('├──Application: ') + chalkBoldWhite(data.info['title']))
  data.info['description'] && result.push(chalkBoldLabel('│   │           ') + chalkWhite(wrapContent(chalkBoldLabel('│   │           '), data.info['description'])));
  data.info['version'] && result.push(chalkBoldLabel('│   ├──Version: ') + chalkBoldWhite(data.info['version']));
  data.info['x-ep-state-name'] && result.push(chalkBoldLabel('│   ├──State: ') + chalkBoldWhite(data.info['x-ep-state-name']));
  result.push(chalkBoldLabel('├──Events'));

  let sendAdded = false;
  Object.keys(data.messages).forEach((messageName) => {
    var sendEvents = data.messages[messageName].send;
    if (sendEvents.length) {
      if (!sendAdded) {
        result.push(chalkBoldLabel('│   ├──Send Events'));
        sendAdded = true;
      }

      sendEvents.forEach((_event:any) => {
        result.push(chalkBoldLabel('│   │   ├──Event: ') + chalkBoldWhite(messageName))
        _event?.message.description &&
          result.push(chalkBoldLabel('│   │   │   │     ') + 
                        chalkWhite(wrapContent(chalkBoldLabel('│   │   │   │     '), _event?.message.description)));

        _event?.message['x-ep-event-version'] && result.push(chalkBoldLabel('│   │   │   ├──Version: ') + chalkBoldWhite(_event?.message['x-ep-event-version']));
        _event?.message['x-ep-event-state-name'] && result.push(chalkBoldLabel('│   │   │   ├──State: ') + chalkBoldWhite(_event?.message['x-ep-event-state-name']));
        _event.topicName && result.push(chalkBoldLabel('│   │   │   ├──Topic: ') + colorizeTopic(_event.topicName))
        _event.topicDescription && 
          result.push(chalkBoldLabel('│   │   │   │                    ') + 
                chalkWhite(wrapContent(chalkBoldLabel('│   │   │   ├──                  '), _event.topicDescription)));

        if (_event.message && _event.message.payload) {
          _event.message.payload['x-ep-schema-name'] &&
            result.push(chalkBoldLabel('│   │   │   ├──Schema: ') + 
              chalkBoldWhite(_event.message.payload['x-ep-schema-name']) +
              (_event.message.contentType ? chalkBoldWhite(' [' + _event.message.contentType + ']') : ''))  
          _event.message.payload['x-ep-schema-version'] && 
            result.push(chalkBoldLabel('│   │   │   │   ├──Version: ') + chalkBoldWhite(_event.message.payload['x-ep-schema-version']));
          _event.message.payload['x-ep-schema-state-name'] && 
            result.push(chalkBoldLabel('│   │   │   │   ├──State: ') + chalkBoldWhite(_event.message.payload['x-ep-schema-state-name']));
        }
      })
    }
  });
  
  let receiveAdded = false;
  Object.keys(data.messages).forEach((messageName) => {
    var receiveEvents = data.messages[messageName].receive;
    if (receiveEvents.length) {
      if (!receiveAdded) {
        result.push(chalkBoldLabel('│   ├──Receive Events'));
        receiveAdded = true;
      }

      receiveEvents.forEach((_event:any) => {
        result.push(chalkBoldLabel('│   │   ├──Event: ') + chalkBoldWhite(messageName))
        _event?.message.description &&
          result.push(chalkBoldLabel('│   │   │   │     ') + 
                        chalkWhite(wrapContent(chalkBoldLabel('│   │   │   │     '), _event?.message.description)));

        _event?.message['x-ep-event-version'] && result.push(chalkBoldLabel('│   │   │   ├──Version: ') + chalkBoldWhite(_event?.message['x-ep-event-version']));
        _event?.message['x-ep-event-state-name'] && result.push(chalkBoldLabel('│   │   │   ├──State: ') + chalkBoldWhite(_event?.message['x-ep-event-state-name']));
        _event.topicName && result.push(chalkBoldLabel('│   │   │   ├──Topic: ') + colorizeTopic(_event.topicName))
        _event.topicDescription && 
          result.push(chalkBoldLabel('│   │   │   │                    ') + 
                chalkWhite(wrapContent(chalkBoldLabel('│   │   │   ├──                  '), _event.topicDescription)));

        if (_event.message && _event.message.payload) {
          _event.message.payload['x-ep-schema-name'] &&
            result.push(chalkBoldLabel('│   │   │   ├──Schema: ') + 
              chalkBoldWhite(_event.message.payload['x-ep-schema-name']) +
              (_event.message.contentType ? chalkBoldWhite(' [' + _event.message.contentType + ']') : ''))  
          _event.message.payload['x-ep-schema-version'] && 
            result.push(chalkBoldLabel('│   │   │   │   ├──Version: ') + chalkBoldWhite(_event.message.payload['x-ep-schema-version']));
          _event.message.payload['x-ep-schema-state-name'] && 
            result.push(chalkBoldLabel('│   │   │   │   ├──State: ') + chalkBoldWhite(_event.message.payload['x-ep-schema-state-name']));
        }

        if (_event.consumers) {
          Object.keys(_event.consumers).forEach((consumerName: string) => {
            const consumer = _event.consumers[consumerName];
            result.push(chalkBoldLabel('│   │   │   ├──Consumers '))
            result.push(chalkBoldLabel('│   │   │   │   ├──Consumer: ') + chalkBoldWhite(consumer.name));
            const subscriptions = consumer.topicSubscriptions;
            if (subscriptions) {
              result.push(chalkBoldLabel('│   │   │   │   │   ├──Subscriptions '));
              subscriptions.forEach((sub:any) => {
                result.push(chalkBoldLabel('│   │   │   │   │   │    ') + chalkBoldWhite(sub));
              })
            }
          })
        }

      })
    }
  });

  let schemaAdded = false;
  Object.keys(data.schemas).forEach((schemaName) => {
    if (!schemaAdded) {
      result.push(chalkBoldLabel('├──Schemas'));
      schemaAdded = true;
    }

    let _schema = data.schemas[schemaName]
    result.push(chalkBoldLabel('│   ├──Schema: ') + chalkBoldWhite(schemaName))
    _schema.description &&
      result.push(chalkBoldLabel('│   │   │      ') + 
                    chalkWhite(wrapContent(chalkBoldLabel('│   │   ├──        '), _schema.description)));
    _schema['x-ep-schema-version'] && result.push(chalkBoldLabel('│   │   ├──Version: ') + chalkBoldWhite(_schema['x-ep-schema-version']));
    _schema['x-ep-schema-state-name'] && result.push(chalkBoldLabel('│   │   ├──State: ') + chalkBoldWhite(_schema['x-ep-schema-state-name']));
    _schema.title && result.push(chalkBoldLabel('│   │   ├──Title: ') + colorizeTopic(_schema.title) +
              (_schema.type ? chalkBoldWhite(' [' + _schema.type + ']') : ''));
    !_schema.title && _schema.type && result.push(chalkBoldLabel('│   │   ├──Type: ') + chalkBoldWhite(_schema.type));
  });

  Logger.logDetailedSuccess('Summary: \n', result.join('\n'));

}

export default preview

export { preview }
