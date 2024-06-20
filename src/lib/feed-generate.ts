import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { createApiFeed, createFeed, fileExists, updateAndLoadFeedInfo, loadGitFeedFile, loadLocalFeedFile, processPlainPath, writeConfig, writeJsonFile } from '../utils/config';
import analyze from './feed-analyze';
import { formulateRules, formulateSchemas } from './feed-ruleset';
import { prettyJSON } from '../utils/prettify';
import { defaultFakerRulesFile, defaultFeedApiEndpointFile, defaultFeedInfoFile, defaultFeedRulesFile, defaultStmFeedsHome } from '../utils/defaults';
import { chalkBoldVariable, chalkBoldWhite } from '../utils/chalkUtils';
import { fa } from '@faker-js/faker';
import { fakerRulesJson } from '../utils/fakerrules';

const getPotentialFeedName = (fileName: string) => {
  var feedName = fileName.split('/').pop();
  feedName = feedName?.split('.').shift() ?? '';// Add nullish coalescing operator to provide a default value
  return feedName;
}

const getPotentialTopicFromFeedName = (name: string) => {
  var feedName = name.replaceAll(' ', '').replaceAll('-', '/').toLowerCase();
  return feedName;
}

const generate = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var { fileName, feedName, feedType } = options;
  var feed:any = {};
  const { Input } = require('enquirer');

  if (optionsSource.feedType === 'cli' || options.feedType === 'api') {
    return generateAPIFeed(options, optionsSource);
  }

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    fileName = options.fileName;
  } else {
    const prompt = new Input({
      message: 'Enter AsyncAPI file',
      initial: 'asyncapi.json'
    });

    await prompt.run()
      .then((answer: string) => {
        fileName = answer.trim();
        options.fileName = fileName;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });

    const prompt2 = new Input({
      message: 'Enter feed name',
      initial: getPotentialFeedName(fileName)
    });

    await prompt2.run()
      .then((answer: string) => {
        feed.name = answer.trim();
        feedName = answer.trim();
        options.feedName = feedName;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  if (!fileName) {
    Logger.logError("required option '--file-name <ASYNCAPI_FILE>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!feedName) {
    Logger.logError("required option '--feed-name <FEED_NAME>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  const data = await analyze(options, optionsSource);
  const rules = await formulateRules(JSON.parse(JSON.stringify(data)));
  const schemas = await formulateSchemas(JSON.parse(JSON.stringify(data)));

  const prompt3 = new Input({
    message: 'Feed description',
    initial: data.info.description
  });

  await prompt3.run()
    .then((answer: string) => {
      feed.description = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt4 = new Input({
    message: 'Feed icon (an URL or a base64 image data):',
    hint: 'Leave blank to use default feed icon',
    initial: ''
  });

  await prompt4.run()
    .then((answer: string) => {
      feed.img = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt5 = new Input({
    message: 'Feed type',
    initial: feedType ? feedType : 'stmfeed'
  });

  await prompt5.run()
    .then((answer: string) => {
      feed.type = answer.trim();
      options.feedType = feedType;
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt6 = new Input({
    message: 'Contributor name or organization name',
    initial: ''
  });

  await prompt6.run()
    .then((answer: string) => {
      feed.contributor = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt7 = new Input({
    message: 'GitHub username',
    initial: ''
  });

  await prompt7.run()
    .then((answer: string) => {
      feed.github = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt8 = new Input({
    message: 'Feed domain',
    initial: ''
  });

  await prompt8.run()
    .then((answer: string) => {
      feed.domain = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt9 = new Input({
    message: 'Feed keywords (as a comma-separated values):',
    initial: ''
  });

  await prompt9.run()
    .then((answer: string) => {
      feed.tags = answer ? answer.split(',').map((t: string) => t.trim()).join(', ') : ''
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  createFeed(fileName, feedName, data, rules, schemas);
  feed.lastUpdated = new Date().toISOString();
  updateAndLoadFeedInfo(feed);

  Logger.success(`Successfully created event feed ${feedName}`);
  Logger.success('exiting...');
  process.exit(0);
}

const generateAPIFeed = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var { feedName } = options;
  var feed:any = { type: 'apifeed', name: feedName };
  var apiRules:any = {
    publishSettings: {
      "count": 20,
      "interval": 1,
      "delay": 0
    }
  }

  var apiEndpoint:any = {};
  var localFeedPath = '';
  
  const { Input, Confirm } = require('enquirer');
  if (optionsSource.feedName === 'cli') {
    const feedsPath = processPlainPath(`${defaultStmFeedsHome}`);
    if (!fileExists(feedsPath)) {
      Logger.error('Local repo path does not exist, something wrong!');
      process.exit(1)
    }

    localFeedPath = processPlainPath(`${feedsPath}/${feedName}`);
    if (fileExists(localFeedPath)) {
      const prompt = new Confirm({
        message: chalkBoldWhite(`A feed by name ${feedName} already exists, do you want to overwrite it?`)
      });
      
      await prompt.run()
        .then((answer:any) => {
          if (!answer) {
            Logger.success('exiting...');
            process.exit(1)
          }
        })
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });

        feed = await loadLocalFeedFile(feedName, defaultFeedInfoFile);
        if (feed && feed.type !== 'apifeed') {
          Logger.logError(`the existing feed is not of 'apifeed' type, try creating a new feed`);
          process.exit(1);
        }
        apiEndpoint = await loadLocalFeedFile(feedName, defaultFeedApiEndpointFile);
        apiRules = await loadLocalFeedFile(feedName, defaultFeedRulesFile);
    }
  } else {
    const pFeedNme = new Input({
      message: 'Feed Name:',
      initial: ''
    });
  
    await pFeedNme.run()
      .then((answer: string) => {
        feed.name = answer.trim();
        feedName = answer.trim();
        options.feedName = feedName;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  const pApiUrl = new Input({
    message: chalkBoldWhite('API Endpoint URL: ') +
             'Prefix the path and query parameters with ' + chalkBoldVariable('$') +  
             ', e.g. http://api.com/' + chalkBoldVariable('$') + 'type?limit=' + 
             chalkBoldVariable('$') + 'limit):\n',
    initial: apiEndpoint?.apiUrl ? apiEndpoint?.apiUrl : ''
  });

  await pApiUrl.  run()
    .then((answer: string) => {
      apiEndpoint.apiUrl = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pApiKey = new Input({
    message: 'API Key (if required):',
    initial: apiEndpoint?.apiKey ? apiEndpoint?.apiKey : ''
  });

  await pApiKey.run()
    .then((answer: string) => {
      apiEndpoint.apiKey = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  if (apiEndpoint.apiKey) {
    const pApiKeyUrl = new Input({
      message: 'URL to generate personal API Key:',
      initial: apiEndpoint?.apiKeyUrl ? apiEndpoint?.apiKeyUrl : ''
    });
  
    await pApiKeyUrl.run()
      .then((answer: string) => {
        apiEndpoint.apiKeyUrl = answer.trim();
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });

    const pApiKeyEmbedded = new Confirm({
      message: 'Is the API Key embedded in the URL?',
    });
    
    await pApiKeyEmbedded.run()
      .then((answer:any) => {
        apiEndpoint.apiKeyUrlEmbedded = answer;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });

    if (apiEndpoint.apiKeyUrlEmbedded) {
      const pApiKeyUrlParam = new Input({
        message: 'URL parameter of the API Key (without the ' + chalkBoldVariable('$') + '):',
        initial: apiEndpoint?.apiKeyUrlParam ? apiEndpoint?.apiKeyUrlParam : ''
      });
    
      await pApiKeyUrlParam.run()
        .then((answer: string) => {
          apiEndpoint.apiKeyUrlParam = answer.trim();
          if (!apiEndpoint.apiKeyUrlParam) {
            Logger.logError('API Key URL parameter cannot be empty')
            process.exit(1);
          }

          if (apiEndpoint.apiUrl.indexOf('$' + apiEndpoint.apiKeyUrlParam) < 0) {
            Logger.logError('Specified API Key URL parameter not found in the API endpoint URL')
            process.exit(1);
          }
        })
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });
    }
  }

  if (apiEndpoint.apiUrl.includes('$')) {
    Logger.logWarn('API endpoint URL contains placeholders, cannot test the endpoint validity now - don\'t forget to configure parameter rules')
  } else {
    // check if the API endpoint is valid
    try {
      var headers:any = { Accept: 'application/json' };
      if (apiEndpoint.apiKey) {
        headers['Authorization'] = `Bearer ${feed.apiKey}`;
      }

      var result = await (await fetch(`${apiEndpoint.apiUrl}`, {
        headers: headers
      })).json();
      Logger.logInfo('Testing API endpoint');
      Logger.logDetailedSuccess('Received response from the API endpoint', prettyJSON(JSON.stringify(result)));
      Logger.logInfo('API endpoint is valid');
    } catch (error) {
      Logger.logError('API endpoint is not valid');
      fs.rmSync(localFeedPath, { recursive: true, force: true });
      process.exit(1);
    }
  }

  const pTopic = new Input({
    message: chalkBoldWhite('Topic Destination: ') +
             'Surround the topic parameters with curly braces matching API endpoint URL\'s path _or_ query parameters, if used!' +  
             ' e.g. order/created/' + chalkBoldVariable('{orderId}') + '):\n',
    initial: apiEndpoint?.topic ? apiEndpoint?.topic : 'solace/feed/' + getPotentialTopicFromFeedName(feed.name)
  });

  await pTopic.run()
    .then((answer: string) => {
      var topic = answer.trim();      
      apiEndpoint.topic = topic.split('/').map((t:any) => t.startsWith('{') ? t : t.toLowerCase()).join('/');
      if (apiEndpoint.topic.includes('{')) {
        var params = apiEndpoint.topic.split('/').filter((t:any) => t.startsWith('{')).map((t:any) => t.substring(1, t.length-1));
        var apiUrl = new URL(apiEndpoint.apiUrl);
        var apiParams = apiUrl.pathname.split('/').filter((t:any) => t.startsWith('$'));
        for (const [key, value] of apiUrl.searchParams)
          apiParams.push(value);

        for (var i=0; i<params.length; i++) {
          var p:string = params[i];
          if (!apiParams.includes('$' + p)) {
            Logger.logDetailedError('Specified topic parameter not found in the URL parameters', chalkBoldVariable(p));
            Logger.success('exiting...');
            process.exit(1);          
          }
        }
      }
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pCount = new Input({
    message: 'Number of events:',
    initial: apiRules.publishSettings ? apiRules.publishSettings.count : '20'
  });

  await pCount.run()
    .then((answer: string) => {
      apiRules.publishSettings.count = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
    
    const pInterval = new Input({
      message: 'Interval (in secs):',
      initial: apiRules.publishSettings ? apiRules.publishSettings.interval : '3'
    });
  
    await pInterval.run()
      .then((answer: string) => {
        apiRules.publishSettings.interval = answer.trim();
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  
  const pDelay = new Input({
    message: 'Initial Delay (in secs):',
    initial: apiRules.publishSettings ? apiRules.publishSettings.delay : '0'
  });

  await pDelay.run()
    .then((answer: string) => {
      apiRules.publishSettings.delay = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pDescription = new Input({
    message: 'Feed description',
    initial: feed?.description ? feed?.description : ''
  });

  await pDescription.run()
    .then((answer: string) => {
      feed.description = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const feedImg = new Input({
    message: 'Feed icon (an URL or a base64 image data):',
    hint: 'Leave blank to use default feed icon',
    initial: feed?.img ? feed?.img : ''
  });

  await feedImg.run()
    .then((answer: string) => {
      feed.img = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pContributor = new Input({
    message: 'Contributor name or organization name',
    initial: feed?.contributor ? feed?.contributor : ''
  });

  await pContributor.run()
    .then((answer: string) => {
      feed.contributor = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pGitUser = new Input({
    message: 'GitHub username',
    initial: feed?.github ? feed?.github : ''
  });

  await pGitUser.run()
    .then((answer: string) => {
      feed.github = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pDomain = new Input({
    message: 'Feed domain',
    initial: feed?.domain ? feed?.domain : ''
  });

  await pDomain.run()
    .then((answer: string) => {
      feed.domain = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pTags = new Input({
    message: 'Feed keywords (as a comma-separated values):',
    initial: feed?.tags ? feed?.tags : ''
  });

  await pTags.run()
    .then((answer: string) => {
      feed.tags = answer ? answer.split(',').map((t: string) => t.trim()).join(', ') : ''
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  writeJsonFile(`${feedPath}/${defaultFeedInfoFile}`, feed, true);
  writeJsonFile(`${feedPath}/${defaultFeedApiEndpointFile}`, apiEndpoint, true);
  writeJsonFile(`${feedPath}/${defaultFakerRulesFile}`, fakerRulesJson)
  feed.lastUpdated = new Date().toISOString();

  const rules:any = {};
  if (apiEndpoint.apiUrl.includes('$') || apiEndpoint.apiUrl.includes('{')) {
    var apiUrl = new URL(apiEndpoint.apiUrl);
    var params = apiUrl.pathname.split('/').filter((t:any) => t.startsWith('$')).map((t:any) => t.substring(1, t.length));
    for (var i=0; i<params.length; i++) {
      var p:string = params[i];
      if (apiEndpoint.apiKeyUrlEmbedded && p === apiEndpoint.apiKeyUrlParam)
        continue;

      rules[p] = {
        "name": p,
        "schema": {
          "type": "string"
        },
        "rule": {
          "name": p,
          "type": "string",
          "group": "StringRules",
          "rule": "alpha",
          "casing": "mixed",
          "minLength": 10,
          "maxLength": 10
        }
      }
    }

    for (const [key, value] of apiUrl.searchParams) {
      if (apiEndpoint.apiKeyUrlEmbedded && value === '$' + apiEndpoint.apiKeyUrlParam)
        continue;

      if (value.startsWith('$')) {
        var p = value.substring(1, value.length);
        rules[p] = {
          "name": p,
          "schema": {
            "type": "string"
          },
          "rule": {
            "name": p,
            "type": "string",
            "group": "StringRules",
            "rule": "alpha",
            "casing": "mixed",
            "minLength": 10,
            "maxLength": 10
          }
        }      
      }
    }    
  }

  var feedRule = {
    rules: rules,
    publishSettings: apiRules.publishSettings
  }

  writeJsonFile(`${feedPath}/${defaultFeedRulesFile}`, feedRule, true);

  Logger.success(`Successfully created event feed ${feedName}`);
  Logger.success('exiting...');
  process.exit(0);
}
  
export default generate

export { generate }
