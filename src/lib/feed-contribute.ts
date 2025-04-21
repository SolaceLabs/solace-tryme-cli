import { Logger } from '../utils/logger'
import * as fs from 'fs'
import { processPlainPath, readFile, writeJsonFile, loadLoadFeedInfo } from '../utils/config';
import { defaultEventFeedsFile, defaultFakerRulesFile, defaultFeedAnalysisFile, 
        defaultFeedApiEndpointFile, 
        defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultStmFeedsHome, defaultGitRepo, 
        defaultFeedSessionFile} from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite } from '../utils/chalkUtils';
import { getLocalEventFeeds } from '../utils/listfeeds';
import { prettyJSON } from '../utils/prettify';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import yaml from 'js-yaml';

const contribute = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const { Confirm, Input, List, AutoComplete } = require('enquirer');
  var { feedName } = options;
  var userEmail, contributionChanges = ''

  if (!feedName) {
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
  const feedLocalPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);

  Logger.info('Let us first update the feed information\n')

  var info:any = loadLoadFeedInfo(feedName);
  Logger.logMessage(`${chalkBoldWhite('Current Feed Information:')}\n` + prettyJSON(JSON.stringify(info)));

  if (info.contributed) {
    const pContributed = new Confirm({
      message: `${chalkBoldWhite('It appears that the feed has been contributed to community already, do you want to update?')}`,
    });
    await pContributed.run()
      .then((answer:any) => {
        if (!answer) {
          Logger.success('Goodbye 👋');
          process.exit(0)
        }
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        Logger.error('Goodbye 👋');
        process.exit(1);
      });
  }

  var infoUpdated = false;

  // Take user input

  const pFeedDesc = new Input({
    message: `${chalkBoldWhite('Feed description')}\n` +
    `${chalkBoldLabel('Hint')}: A brief description on the scope and purpose of the feed\n`,
      initial: info.description,
    validate: (value: string) => {  return !!value; }
  });
  
  await pFeedDesc.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.description !== answer;
      info.description = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedDomain = new Input({
    message: `${chalkBoldWhite('Feed domain')}\n` +
    `${chalkBoldLabel('Hint')}: A high-level business domain that the feed can be identified with\n`,
    initial: info.domain,
    validate: (value: string) => {  return !!value; }
  });

  await pFeedDomain.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.domain !== answer;
      info.domain = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    }); 

  const pFeedIcon = new Input({
    message: `${chalkBoldWhite('Feed icon (an URL or a base64 image data)')}\n` +
    `${chalkBoldLabel('Hint')}: Leave blank to use a default feed icon\n`,
    initial: info.img
  });

  const pFeedTags = new List({
    name: 'tags',
    message: `${chalkBoldWhite('Feed keywords (as a comma-separated values)')}\n` +
    `${chalkBoldLabel('Hint')}: Keywords that the feed's scope and purpose can be identified with\n`,
    initial: info.tags,
    validate: (value: string) => {  return !!value; }
  });
  
  await pFeedTags.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.tags !== answer.join(', ');
      info.tags = answer.join(', ');
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
  
  await pFeedIcon.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.img !== answer;
      info.img = answer ? answer : 'assets/img/defaultfeed.png'
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedContributor = new Input({
    message: `${chalkBoldWhite('Contributor name')}\n` +
    `${chalkBoldLabel('Hint')}: Contributor name for attribution. If not specified the contribution will be attributed to Solace Community!\n`,
    initial: info.contributor
  });

  await pFeedContributor.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.contributor !== answer;
      // Make sure there is a list of unique contributors
      info.contributor = [...new Set([...info.contributor.split(','), answer.split(',')].flat())].join(',');
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pGitUser = new Input({
    message: `${chalkBoldWhite('GitHub handle')}\n` +
    `${chalkBoldLabel('Hint')}: Contributor's GitHub handle for attribution. If not specified the contribution will be attributed to Solace Community!\n`,
    initial: info.github
  });

  await pGitUser.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.github !== answer;
      answer ? info.github = answer : info.github = 'solacecommunity-bot';
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  do {
    const pUserEmail = new Input({
      message: `${chalkBoldWhite('Your email')}\n` +
      `${chalkBoldLabel('Hint')}: Contact information for communication related to the contribution\n` +
      `      ${chalkBoldLabel('Note:')} This is intended solely for internal communication and will not be shared publicly\n` 
    });

    await pUserEmail.run()
      .then((answer:any) => {
        userEmail = answer
        infoUpdated = true
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } while (!userEmail);

  const pContributionChanges = new Input({
    message: `${chalkBoldWhite('Additional information to accompany your pull request)')}\n` +
    `${chalkBoldLabel('Hint')}: Information related to the feed's purpose, changes (if updated), use cases and useful references related to the domain/API.\n`,
  });

  await pContributionChanges.run()
    .then((answer:any) => {
      contributionChanges = answer
      infoUpdated = true
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  // Add the contributionChanges and userEmail to an TESTazureFunctionInfo object
  const azureFunctionInfo = {
    contributionChanges,
    userEmail
  }

  // Update the feed info
  info.lastUpdated = new Date().toISOString();   
  info.contributed = true; 
  
  Logger.logMessage(`${chalkBoldWhite('Updated Feed Information:')}\n` + prettyJSON(JSON.stringify(info)));

  if (infoUpdated) {
    const pFeedChanged = new Confirm({
      message: `${chalkBoldWhite('Feed info has changed and the feed will be updated, do you want to proceed?')}`,
    });
    
    await pFeedChanged.run()
      .then((answer:any) => {
        if (answer) {
          Logger.info('Creating PR...\n\n\n');
          createPR(feedName, info, azureFunctionInfo, feedLocalPath).then(link => {
            if (link) {
              Logger.success(`PR created successfully at ${link}`);
            } else {
              Logger.error('Error creating PR');
              process.exit(1);
            }
          })
        }
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } else {
    Logger.info('No changes detected. Exiting...')
  }
}

async function createPR (feedName:string, info:any, azureFunctionInfo:any, feedLocalPath:string, ) {
  let PRLink = null
  // const azureFunctionURL = 'http://127.0.0.1:7071/api/triggerContribute'
  const azureFunctionURL = 'https://stm-contribute.azurewebsites.net/api/triggerContribute'
  // Query EVENT-FEEDS.json
  try {
    const response = await fetch(`${defaultGitRepo}/${defaultEventFeedsFile}`);
    if (response.ok) {
      var communityFeeds = await response.json();
    } else {
      throw new Error(`Failed to fetch EVENT-FEEDS.json: ${response.status} ${response.statusText}`);
    }
  } catch (error:any) {
    Logger.logDetailedError('Failed to fetch EVENT-FEEDS.json', error)
    process.exit(1);
  }

  // Remove the feed info from the list if it already exists
  communityFeeds = communityFeeds.filter((feed:any) => feed.name !== feedName);
  // Add the feed info to the communityFeeds list
  communityFeeds.push(info);

  // POST request to open PR with the files
  let functionBody = null
  try {
    if (info.type === 'asyncapi_feed') {
      const analysis:any = readFile(`${feedLocalPath}/${defaultFeedAnalysisFile}`);
      //  Create a new FormData object
      let formData = new FormData();

      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedAnalysisFile}`)), defaultFeedAnalysisFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedSchemasFile}`)), defaultFeedSchemasFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedRulesFile}`)), defaultFeedRulesFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedSessionFile}`)), defaultFeedSessionFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFakerRulesFile}`)), defaultFakerRulesFile);
      
      let analysisContent = fs.readFileSync(`${feedLocalPath}/${analysis.fileName}`, 'utf-8')
      // Handle yaml spec files
      if (analysis.fileName.endsWith('.yaml') || analysis.fileName.endsWith('.yml')) {
        analysisContent = JSON.stringify(yaml.load(analysisContent));
        analysis.fileName = analysis.fileName.replace(/\.(yaml|yml)$/, '.json');
      }
      formData.append('files', analysisContent, analysis.fileName);
      formData.append('files', JSON.stringify(info), defaultFeedInfoFile);
      formData.append('files', JSON.stringify(communityFeeds), 'EVENT_FEEDS.json');
      formData.append('files', JSON.stringify(azureFunctionInfo), 'azureFunctionInfo.json');
      functionBody = await executeFunction(azureFunctionURL, formData)
    } else if (info.type === 'restapi_feed') {

      //  Create a new FormData object
      let formData = new FormData();
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedApiEndpointFile}`)), defaultFeedApiEndpointFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedRulesFile}`)), defaultFeedRulesFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedSessionFile}`)), defaultFeedSessionFile);
      formData.append('files', JSON.stringify(await readFile(`${feedLocalPath}/${defaultFakerRulesFile}`)), defaultFakerRulesFile);
      formData.append('files', JSON.stringify(info), defaultFeedInfoFile);
      formData.append('files', JSON.stringify(communityFeeds), 'EVENT_FEEDS.json');
      formData.append('files', JSON.stringify(azureFunctionInfo), 'azureFunctionInfo.json');

      functionBody = await executeFunction(azureFunctionURL, formData)
    }
  } catch (error:any) {
    Logger.logDetailedError('Function Failed. Contact community@solace.com for help', error)
    Logger.alert('Please create a PR manually. See https://github.com/solacecommunity/solace-event-feeds for more details.')
    process.exit(1);
  }

  if (functionBody.PRLink) {
    // Update the local feedInfo file with the new info
    writeJsonFile(`${feedLocalPath}/${defaultFeedInfoFile}`, info, true);
    return functionBody.PRLink
  } else {
    Logger.error(`Error creating PR! \n${JSON.stringify(functionBody, null, 2)}`)
    process.exit(1);
  }
}

async function executeFunction (azureFunctionURL:string, formData:FormData) {
  try {
    const response: AxiosResponse = await axios.post(azureFunctionURL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,  
      maxBodyLength: Infinity      
    });

    let body  = response.data
    if(response.status === 200) {
      return body
    } else {
      Logger.error(`Error executing function:\n${JSON.stringify(body, null, 2)}`)
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`Error executing function: contact community@solace.com for help.`)
    axios.isAxiosError(error) ? Logger.error(`\n${JSON.stringify(error.response?.data, null, 2)}`) : null
    process.exit(1);
  }
}

export default contribute

export { contribute }
