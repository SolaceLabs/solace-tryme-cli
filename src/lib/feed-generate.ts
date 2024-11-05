import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { createApiFeed, createFeed, fileExists, updateAndLoadFeedInfo, loadGitFeedFile, loadLocalFeedFile, processPlainPath, writeConfig, writeJsonFile } from '../utils/config';
import analyze from './feed-analyze';
import { formulateRules, formulateSchemas } from './feed-ruleset';
import { prettyJSON } from '../utils/prettify';
import { defaultFakerRulesFile, defaultFeedApiEndpointFile, defaultFeedInfoFile, defaultFeedRulesFile, defaultStmFeedsHome, supportedFeedTypes } from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkFeedRestAPIValue } from '../utils/chalkUtils';
import { fa } from '@faker-js/faker';
import { fakerRulesJson } from '../utils/fakerrules';
import { validate } from '@asyncapi/parser/esm/validate';
import chalk from 'chalk';

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
  const { Input, Select } = require('enquirer');

  if (optionsSource.feedType === 'default') {
    const pFeedType = new Select({
      message: `${chalkBoldWhite('Pick a feed type')} \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: supportedFeedTypes
    });

    await pFeedType.run()
      .then((answer:any) => {
        feed.type = answer;
        optionsSource.feedType = 'cli';
        options.feedType = feed.type;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  if (feed.type === 'asyncapi_feed' && !fileName) {
    do {
      const pFilename = new Input({
        message: `${chalkBoldWhite('Enter AsyncAPI file')}\n` +
          `${chalkBoldLabel('Hint')}: Enter the full path to the AsyncAPI file\n`,
        initial: 'asyncapi.json',
        validate: (value: string) => {  return !!value; }
      });

      await pFilename.run()
        .then((answer: string) => {
          fileName = answer.trim();
          options.fileName = fileName;

          if (!fileExists(fileName)) {
            Logger.logError(`File ${fileName} does not exist, try again!`);
          }
        })
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });
    } while (!fileExists(fileName));
  }

  if (!feedName) {
    const pFeedName = new Input({
      message: `${chalkBoldWhite('Enter feed name')}\n` +
          `${chalkBoldLabel('Hint')}: A friendly name to identify the feed\n`,
      initial: feed.type === 'asyncapi_feed' ? getPotentialFeedName(fileName) : '',
      validate: (value: string) => {  return !!value; }
    });

    await pFeedName.run()
      .then((answer: string) => {
        feed.name = answer.trim();
        feedName = answer.trim();
        options.feedName = feedName;
        optionsSource.feedName = 'cli';
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } 

  if (optionsSource.feedType === 'cli' && options.feedType === 'restapi_feed') {
    return generateAPIFeed(options, optionsSource);
  }

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    fileName = options.fileName;
  } 
  
  const data = await analyze(options, optionsSource);
  const rules = await formulateRules(JSON.parse(JSON.stringify(data)));
  const schemas = await formulateSchemas(JSON.parse(JSON.stringify(data)));

  const pFeedDesc = new Input({
    message: `${chalkBoldWhite('Feed description')}\n` +
    `${chalkBoldLabel('Hint')}: A brief description on the scope and purpose of the feed\n`,
    initial: data.info.description,
    validate: (value: string) => {  return !!value; }
  });

  await pFeedDesc.run()
    .then((answer: string) => {
      feed.description = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedIcon = new Input({
    message: `${chalkBoldWhite('Feed icon (an URL or a base64 image data)')}\n` +
    `${chalkBoldLabel('Hint')}: Leave blank to use a default feed icon\n`,
    initial: ''
  });

  await pFeedIcon.run()
    .then((answer: string) => {
      feed.img = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedContributor = new Input({
    message: `${chalkBoldWhite('Contributor name')}\n` +
    `${chalkBoldLabel('Hint')}: Optional, can be updated at the time of feed contribution\n`,
    initial: ''
  });

  await pFeedContributor.run()
    .then((answer: string) => {
      feed.contributor = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pGitUser = new Input({
    message: `${chalkBoldWhite('GitHub handle')}\n` +
    `${chalkBoldLabel('Hint')}: Optional, can be updated at the time of feed contribution\n`,
    initial: ''
  });

  await pGitUser.run()
    .then((answer: string) => {
      feed.github = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedDomain = new Input({
    message: `${chalkBoldWhite('Feed domain')}\n` +
    `${chalkBoldLabel('Hint')}: A high-level business domain that the feed can be identified with\n`,
    initial: '',
    validate: (value: string) => {  return !!value; }
  });

  await pFeedDomain.run()
    .then((answer: string) => {
      feed.domain = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedTags = new Input({
    message: `${chalkBoldWhite('Feed keywords (as a comma-separated values)')}\n` +
    `${chalkBoldLabel('Hint')}: Keywords that the feed's scope and purpose can be identified with\n`,
    initial: '',
    validate: (value: string) => {  return !!value; }
  });

  await pFeedTags.run()
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

  Logger.hint(`What's next?\n` +
              `    You can either run the feed to stream events ${chalk.italic.greenBright('stm feed run')} or \n` +
              `    configure data generation rules to customize the content of the messages ${chalk.italic.greenBright('stm feed configure')}`);
  Logger.success('exiting...');
  process.exit(0);
}

const generateAPIFeed = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var { feedName } = options;
  var feed:any = { type: 'restapi_feed', name: feedName };
  var apiRules:any = {
    publishSettings: {
      "count": 0,
      "interval": 1000,
      "delay": 0
    }
  }

  var apiEndpoint:any = {};
  var localFeedPath = '';
  
  const { Input, Select, Confirm } = require('enquirer');

  const feedsPath = processPlainPath(`${defaultStmFeedsHome}`);
  if (!fileExists(feedsPath)) {
    Logger.error('Local repo path does not exist, something wrong!');
    process.exit(1)
  }

  localFeedPath = processPlainPath(`${feedsPath}/${feedName}`);
  if (fileExists(localFeedPath)) {
    const pFeedOverwrite = new Confirm({
      message: chalkBoldWhite(`A feed by name ${feedName} already exists, do you want to overwrite it?`)
    });
    
    await pFeedOverwrite.run()
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
      if (feed && feed.type !== 'restapi_feed') {
        Logger.logError(`the existing feed is not of 'restapi_feed' type, try creating a new feed`);
        process.exit(1);
      }
      apiEndpoint = await loadLocalFeedFile(feedName, defaultFeedApiEndpointFile);
      apiRules = await loadLocalFeedFile(feedName, defaultFeedRulesFile);
  }

  const pApiUrl = new Input({
    message: chalkBoldWhite('API Endpoint URL: ') +
            `\n${chalkBoldLabel('Hint')}: ` + 'Prefix the path and query parameters with ' + chalkBoldVariable('$') + ', if present\n' +
            `    e.g. http://api.com/` + chalkBoldVariable('$path') + '?limit=' + `${chalkBoldVariable('$limit')}:\n`,

    initial: apiEndpoint?.apiUrl ? apiEndpoint?.apiUrl : '',
    validate: (value: string) => {  return !!value; }
  });

  await pApiUrl.  run()
    .then((answer: string) => {
      apiEndpoint.apiUrl = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pApiAuthType = new Select({
    name: 'Authentication Type',
    message: chalkBoldWhite(`Pick the expected authentication type \n`) + 
              `${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
              `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
              `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
    choices: [
      'None',
      'API Key',
      'Basic Authentication',
      'Token Authentication',
      'X-API Authentication'
    ]
  });

  await pApiAuthType.run()
    .then((answer: any) => { apiEndpoint.apiAuthType = answer; })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
  
  if (apiEndpoint.apiAuthType === 'API Key') {
    const pApiKey = new Input({
      message: `${chalkBoldWhite('API Key')}\n` +
      `${chalkBoldLabel('Hint')}: A key to identify and authenticate API access\n`,
      initial: apiEndpoint?.apiKey ? apiEndpoint?.apiKey : '',
      validate: (value: string) => {  return !!value; }
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
        message: `${chalkBoldWhite('URL to generate personal API Key')}\n` +
        `${chalkBoldLabel('Hint')}: URL endpoint is used to generate API keys\n`,
        initial: apiEndpoint?.apiKeyUrl ? apiEndpoint?.apiKeyUrl : '',
        validate: (value: string) => {  return !!value; }
      });
    
      await pApiKeyUrl.run()
        .then((answer: string) => {
          apiEndpoint.apiKeyUrl = answer.trim();
        })
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });
    }

    apiEndpoint.apiKeyUrlEmbedded = true;

    const pApiKeyUrlParam = new Input({
      message: `${chalkBoldWhite('URL parameter of the API Key')}\n` +
      `${chalkBoldLabel('Hint')}: Parameter name should match case without the ${chalkBoldVariable('$')} symbol')`,
      initial: apiEndpoint?.apiKeyUrlParam ? apiEndpoint?.apiKeyUrlParam : '',
      validate: (value: string) => {  return !!value; }
    });
  
    await pApiKeyUrlParam.run()
      .then((answer: string) => {
        apiEndpoint.apiKeyUrlParam = answer.trim();
        if (!apiEndpoint.apiKeyUrlParam) {
          apiEndpoint.apiKeyUrlEmbedded = false;
        } else if (apiEndpoint.apiUrl.indexOf('$' + apiEndpoint.apiKeyUrlParam) < 0) {
          Logger.logError(`Specified API Key '${chalkBoldVariable(apiEndpoint.apiKeyUrlParam)}' URL parameter not found in the API endpoint URL`)
          process.exit(1);
        }
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } else if (apiEndpoint.apiAuthType === 'Basic Authentication') {
    const pApiToken = new Input({
      message: `${chalkBoldWhite('Credential (Base64 encoded string')}\n` +
      `${chalkBoldLabel('Hint')}: A Base64 encoded credential derived from user/password or user/secret pairs\n`,
      initial: apiEndpoint?.apiToken ? apiEndpoint?.apiToken : '',
      validate: (value: string) => {  return !!value; }
    });

    await pApiToken.run()
      .then((answer: string) => {
        apiEndpoint.apiToken = answer.trim();
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } else if (apiEndpoint.apiAuthType === 'Token Authentication') {
    const pApiToken = new Input({
      message: `${chalkBoldWhite('Credential (Base64 encoded string')}\n` +
      `${chalkBoldLabel('Hint')}: API security/access token\n`,
      initial: apiEndpoint?.apiToken ? apiEndpoint?.apiToken : '',
      validate: (value: string) => {  return !!value; }
    });

    await pApiToken.run()
      .then((answer: string) => {
        apiEndpoint.apiToken = answer.trim();
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } else if (apiEndpoint.apiAuthType === 'X-API Authentication') {
    var newPairs = [];
    var xapiPairs = apiEndpoint?.xapiPairs ? apiEndpoint?.xapiPairs : [];
    var pair = 0;
    var done = false;
    var restart = false;
    do {
      restart = false;
      var xApiPair = { 
        key: xapiPairs.length && xapiPairs[pair] ? xapiPairs[pair].key : '', 
        value: xapiPairs.length && xapiPairs[pair] ? xapiPairs[pair].value : ''
      };

      const pxApiKey = new Input({
        message: `${chalkBoldWhite('X-API Key')}\n` +
        `${chalkBoldLabel('Hint')}: X-API Key (Enter to skip marking the end of the key-value pairs)\n`,
        initial: xApiPair.key
      });

      await pxApiKey.run()
        .then((answer: string) => {
          xApiPair.key = answer.trim();
          if (xApiPair.key === '') {
            if (!newPairs.length) {
              Logger.logError('At least one key-value pair is required');
              restart = true;
            } else {
              restart = false;
              done = true;
            }
          }
        })
        .catch((error:any) => {
          Logger.logDetailedError('interrupted...', error)
          process.exit(1);
        });

      if (!done && !restart) {
        const pxApiValue = new Input({
          message: chalkBoldWhite('X-API Value:'),
          initial: xApiPair.value,
          validate: (value: string) => {  return !!value; }
        });

        await pxApiValue.run()
          .then((answer: string) => {
            xApiPair.value = answer.trim();
          })
          .catch((error:any) => {
            Logger.logDetailedError('interrupted...', error)
            process.exit(1);
          });

        newPairs.push(xApiPair);
        pair++;   
      }
    } while (!done);

    apiEndpoint.xapiPairs = newPairs;
  }
  
  if (apiEndpoint.apiUrl.includes('$')) {
    Logger.logWarn('API endpoint URL contains placeholders, cannot test the endpoint validity now - don\'t forget to configure parameter rules')
  } else {
    // check if the API endpoint is valid
    try {
      var headers:any = { Accept: 'application/json' };
      if (apiEndpoint.apiAuthType === 'Basic Authentication') {
        headers['Authorization'] = `Basic ${apiEndpoint.apiToken}`;
      } else if (apiEndpoint.apiAuthType === 'Token Authentication') {
        headers['Authorization'] = `Bearer ${apiEndpoint.apiToken}`;
      } else if (apiEndpoint.apiAuthType === 'X-API Authentication') {
        for (var i=0; i<apiEndpoint.xapiPairs.length; i++) {
          var xPair = apiEndpoint.xapiPairs[i];
          headers[xPair.key] = xPair.value;
        }
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
    message: chalkBoldWhite('API Endpoint URL: \n') +
            `${chalkBoldLabel('Hint')}: ` + 'Prefix the topic parameters with ' + chalkBoldVariable('$') + ', matching the API URL\'s\n' +
            `    ${chalkBoldVariable('path')} or ${chalkBoldVariable('query')} parameters, if used!\n` +
            '    e.g. order/created/' + chalkBoldVariable('$orderId') + '\n',
    initial: apiEndpoint?.topic ? apiEndpoint?.topic : 'solace/feed/' + getPotentialTopicFromFeedName(feed.name),
    validate: (value: string) => {  return !!value; }
  });

  await pTopic.run()
    .then((answer: string) => {
      var topic = answer.trim();      
      apiEndpoint.topic = topic.split('/').join('/');
      if (apiEndpoint.topic.includes('$')) {
        var topicParams = apiEndpoint.topic.split('/').filter((t:any) => t.startsWith('$'));
        var apiUrl = new URL(apiEndpoint.apiUrl);
        var apiParams = apiUrl.pathname.split('/').filter((t:any) => t.startsWith('$'));
        for (const [key, value] of apiUrl.searchParams)
          apiParams.push(value);

        for (var i=0; i<topicParams.length; i++) {
          var p:string = topicParams[i];
          if (!apiParams.includes(p)) {
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
    message: `${chalkBoldWhite('Number of events')}\n` +
    `${chalkBoldLabel('Hint')}: The total number of events to be published: 0 (infinite) or a valid count\n`,
    initial: apiRules.publishSettings ? apiRules.publishSettings.count : 0,
    validate: (value: string) => {  return !!value; }
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
      message: `${chalkBoldWhite('Publish interval')}\n` +
      `${chalkBoldLabel('Hint')}: The time gap (in milliseconds) between successive publish operations\n`,
      initial: apiRules.publishSettings ? apiRules.publishSettings.interval : 1000,
      validate: (value: string) => {  return !!value; }
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
    message: `${chalkBoldWhite('Initial delay')}\n` +
    `${chalkBoldLabel('Hint')}: The initial delay (in milliseconds) before the first publish operation starts\n`,
    initial: apiRules.publishSettings ? apiRules.publishSettings.delay : 0,
    validate: (value: string) => {  return !!value; }
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
    message: `${chalkBoldWhite('Feed description')}\n` +
    `${chalkBoldLabel('Hint')}: A brief description on the scope and purpose of the feed\n`,
    initial: feed?.description ? feed?.description : '',
    validate: (value: string) => {  return !!value; }
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
    message: `${chalkBoldWhite('Feed icon (an URL or a base64 image data)')}\n` +
    `${chalkBoldLabel('Hint')}: Leave blank to use a default feed icon\n`,
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
    message: `${chalkBoldWhite('Contributor name')}\n` +
    `${chalkBoldLabel('Hint')}: Optional, can be updated at the time of feed contribution\n`,
    initial: feed?.contributor ? feed?.contributor : '',
    validate: (value: string) => {  return !!value; }
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
    message: `${chalkBoldWhite('GitHub handle')}\n` +
    `${chalkBoldLabel('Hint')}: Optional, can be updated at the time of feed contribution\n`,
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
    message: `${chalkBoldWhite('Feed domain')}\n` +
    `${chalkBoldLabel('Hint')}: A high-level business domain that the feed can be identified with\n`,
    initial: feed?.domain ? feed?.domain : '',
    validate: (value: string) => {  return !!value; }
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
    message: `${chalkBoldWhite('Feed keywords (as a comma-separated values)')}\n` +
    `${chalkBoldLabel('Hint')}: Keywords that the feed's scope and purpose can be identified with\n`,
    initial: feed?.tags ? feed?.tags : '',
    validate: (value: string) => {  return !!value; }
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
  Logger.hint(`What's next?\n` +
    `    You can run the feed to stream events ${chalk.italic.greenBright('stm feed run')}`);
  Logger.success('exiting...');
  process.exit(0);
}
  
export default generate

export { generate }
