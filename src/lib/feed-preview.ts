import { Logger } from '../utils/logger'
import { chalkBoldWhite, chalkBoldLabel, chalkBoldVariable, chalkWhite, colorizeTopic, wrapContent } from '../utils/chalkUtils'
import { loadLocalFeedFile, loadGitFeedFile, readAsyncAPIFile } from '../utils/config';
import { defaultFeedAnalysisFile, defaultFeedApiEndpointFile, defaultFeedInfoFile } from '../utils/defaults';
import { getGitEventFeeds, getLocalEventFeeds } from '../utils/listfeeds';
import { analyze, analyzeEP, analyzeV2, load } from './feed-analyze';
import { AsyncAPIDocumentInterface } from '@asyncapi/parser';

const preview = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var feedName, fileName, feedView, gitFeed = undefined;

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    fileName = options.fileName;
    if (feedName && options.communityFeed)
      gitFeed = true;
  } else {    
    const { Select } = require('enquirer');
    const pFeedSource = new Select({
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
    await pFeedSource.run()
      .then((answer: any) => { choice = answer; })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
    
    const { Input, AutoComplete } = require('enquirer');
    if (choice === 'AsyncAPI File') {
      const pFilename = new Input({
        message: 'Enter AsyncAPI file',
        // initial: 'asyncapi.json',
        validate: (value: string) => {  return !!value; }
      });
      
      await pFilename.run()
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
  }

  if (optionsSource.feedView === 'cli') {
    feedView = options.feedView;
  } else {
    feedView = 'default';
  }

  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  const reverseView = feedView === 'provider';
  var data:any = undefined;
  var info:any = undefined;
  var type:any = undefined;
  if (fileName) {
    const asyncApiSchema = readAsyncAPIFile(fileName);  
    const loaded:any = await load(asyncApiSchema);
    const document = loaded.document as AsyncAPIDocumentInterface;
    if (!document) {
      Logger.error('Unable to load AsyncAPI document');
      Logger.error('exiting...');
      process.exit(1);
    }
    data = loaded.epSpecification ? await analyzeEP(document, reverseView) : 
                loaded.asyncApiVersion && loaded.asyncApiVersion.startsWith('2') ? 
                  await analyzeV2(document, reverseView) : await analyze(document, reverseView);
    data.fileName = fileName.lastIndexOf('/') >= 0 ? fileName.substring(fileName.lastIndexOf('/')+1) : fileName;
    type = "file";
  } else if (feedName) {
    options.feedName = feedName;
    info = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);
    if (info.type === 'asyncapi_feed') 
      data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedAnalysisFile) : loadLocalFeedFile(feedName, defaultFeedAnalysisFile);
    else if (info.type === 'restapi_feed')
      data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedApiEndpointFile) : loadLocalFeedFile(feedName, defaultFeedApiEndpointFile);
    type = info.type;
  }
    
  if (!data) {
    Logger.logWarn('operation interrupted...')
    process.exit(1);
  }

  var result:any = [];
  let noOfSendEvents = 0;
  let noOfReceiveEvents = 0;
  if (type === 'file' || type === 'asyncapi_feed') {
    data.info['x-ep-application-domain-name'] && result.push(chalkBoldLabel('├──Application Domain: ') + chalkBoldWhite(data.info['x-ep-application-domain-name']))
    data.info['title'] && result.push(chalkBoldLabel('├──Application: ') + chalkBoldWhite(data.info['title']))
    data.info['description'] && result.push(chalkBoldLabel('│   │           ') + chalkWhite(wrapContent(chalkBoldLabel('│   │           '), data.info['description'])));
    data.info['version'] && result.push(chalkBoldLabel('│   ├──Version: ') + chalkBoldWhite(data.info['version']));
    data.info['x-ep-state-name'] && result.push(chalkBoldLabel('│   ├──State: ') + chalkBoldWhite(data.info['x-ep-state-name']));
    result.push(chalkBoldLabel('├──Events'));

    let sendAdded = false;
    Object.keys(data.messages).forEach((messageName) => {
      var sendEvents = data.messages[messageName].send;
      noOfSendEvents += sendEvents.length;
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
      noOfReceiveEvents += receiveEvents.length;
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
  } else if (type === 'restapi_feed') {
    info['name'] && result.push(chalkBoldLabel('├──Feed: ') + chalkBoldWhite(info['name']))
    info['description'] && result.push(chalkBoldLabel('│   │           ') + chalkWhite(wrapContent(chalkBoldLabel('│   │           '), info['description'])));
    info['domain'] && result.push(chalkBoldLabel('│   ├──Domain: ') + chalkBoldWhite(info['domain']));
    info['tags'] && result.push(chalkBoldLabel('│   ├──Tags: ') + chalkBoldWhite(info['tags']));
    result.push(chalkBoldLabel('├──Endpoint'));
    result.push(chalkBoldLabel('│   ├──URL: ') + chalkBoldWhite(data['apiUrl']));
    result.push(chalkBoldLabel('│   ├──Auth Type: ') + chalkBoldWhite(data['apiAuthType']));
    data['apiKeyUrlParam'] && result.push(chalkBoldLabel('│   ├──Key Param: ') + chalkBoldWhite(data['apiKeyUrlParam']));
    data['apiKey'] && result.push(chalkBoldLabel('│   ├──Key: ') + chalkBoldWhite("*******"));
    data['apiToken'] && result.push(chalkBoldLabel('│   ├──Token: ') + chalkBoldWhite("*******"));
    data['xapiPairs'] && result.push(chalkBoldLabel('│   ├──X-API Pairs '));
    if (data['xapiPairs']) {
      data['xapiPairs'].forEach((pair:any) => {
        result.push(chalkBoldLabel('│   │   ├──Header Key: ') + chalkBoldWhite(pair.key));
      })
    }
    result.push(chalkBoldLabel('│   ├──Topic: ') + colorizeTopic(data['topic'], '$'));
  }

  Logger.logDetailedSuccess('Summary: \n', result.join('\n'), false);

  if (type === 'file' || type === 'asyncapi_feed') {
    if (!noOfReceiveEvents && !noOfSendEvents) {
      Logger.logWarn('No Events Found');
    }
    if (noOfReceiveEvents && !noOfSendEvents) {
      Logger.logWarn('No Publishable Events Found');
    }
  }
}

export default preview

export { preview }
