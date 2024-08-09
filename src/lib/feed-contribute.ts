import { Logger } from '../utils/logger'
import { processPlainPath, readFile, writeJsonFile, loadLoadFeedInfo } from '../utils/config';
import { defaultEventFeedsFile, defaultFakerRulesFile, defaultFeedAnalysisFile, 
        defaultFeedApiEndpointFile, 
        defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultStmFeedsHome, defaultGitRepo } from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite } from '../utils/chalkUtils';
import { getLocalEventFeeds } from '../utils/listfeeds';

const contribute = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const { Select, Confirm, Input, List } = require('enquirer');
  var { feedName } = options;
  var userEmail, contributionChanges = ''

  if (!feedName) {
    const pPickFeed = new Select({
      name: 'localFeed',
      message: `Pick a local event feed \n\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: getLocalEventFeeds()
    });

    await pPickFeed.run()
      .then((answer:any) => feedName = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }
  const feedLocalPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);

  Logger.info('Let us first update the feed information\n')

  var info:any = loadLoadFeedInfo(feedName);
  console.log('Current', info);

  if (info.contributed) {
    const pContributed = new Confirm({
      message: `${chalkBoldWhite('It appears that the feed has been contributed already, do you want to update?')}`,
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
      message: 'Feed description:',
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
      message: 'Feed domain:',
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
      message: 'Feed icon (an URL or a base64 image data):',
      hint: 'Leave blank to use default feed icon',
      initial: info.img
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
    message: 'Comma separated Contributor(s) name or organization name:',
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
    message: 'GitHub username (optional):',
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

  const pFeedTags = new List({
    name: 'tags',
    message: 'Feed keywords (as a comma-separated values):',
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

  const pContributionChanges = new Input({
    message: 'Add extra details to be accompanied with your pull request: ',
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

  const pUserEmail = new Input({
    message: 'Put your email to be notified on updates. Note: This will not be public',
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

  // Add the contributionChanges and userEmail to an TESTazureFunctionInfo object
  const azureFunctionInfo = {
    contributionChanges,
    userEmail
  }

  // Update the feed info
  info.lastUpdated = new Date().toISOString();   
  info.contributed = true; 
  
  console.log('Updated', info);

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
  // const azureFunctionURL = 'http://localhost:7071/api/triggerContribute'
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
      
      // Create form-data body payload 
      let formData = new FormData();
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedAnalysisFile}`))]), defaultFeedAnalysisFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedSchemasFile}`))]), defaultFeedSchemasFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedRulesFile}`))]), defaultFeedRulesFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFakerRulesFile}`))]), defaultFakerRulesFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${analysis.fileName}`))]), analysis.fileName);
      formData.append('files', new Blob([JSON.stringify(info)]), defaultFeedInfoFile);
      formData.append('files', new Blob([JSON.stringify(communityFeeds)]), 'EVENT_FEEDS.json');
      formData.append('files', new Blob([JSON.stringify(azureFunctionInfo)]), 'azureFunctionInfo.json');

      functionBody = await executeFunction(azureFunctionURL, formData)
    } else if (info.type === 'restapi_feed') {

      // Create form-data body payload 
      let formData = new FormData();
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedApiEndpointFile}`))]), defaultFeedApiEndpointFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFeedRulesFile}`))]), defaultFeedRulesFile);
      formData.append('files', new Blob([JSON.stringify(await readFile(`${feedLocalPath}/${defaultFakerRulesFile}`))]), defaultFakerRulesFile);
      formData.append('files', new Blob([JSON.stringify(info)]), defaultFeedInfoFile);
      formData.append('files', new Blob([JSON.stringify(communityFeeds)]), 'EVENT_FEEDS.json');
      formData.append('files', new Blob([JSON.stringify(azureFunctionInfo)]), 'azureFunctionInfo.json');

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
    let response: Response = await fetch(azureFunctionURL, {
      method: 'POST',
      body: formData,
    });

    let body  = await response.json()

    if(response.ok) {
      return body
    } else {
      Logger.error(`Error executing function:\n${JSON.stringify(body, null, 2)}`)
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`Error executing function: contact community@solace.com for help`)
    process.exit(1);
  }
}

export default contribute

export { contribute }
