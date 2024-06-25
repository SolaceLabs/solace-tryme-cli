import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { fileExists, updateAndLoadFeedInfo, processPlainPath, readFile, writeJsonFile, loadLoadFeedInfo } from '../utils/config';
import { communityRepoUrl, defaultEventFeedsFile, defaultFakerRulesFile, defaultFeedAnalysisFile, 
        defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultStmFeedsHome } from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkItalic } from '../utils/chalkUtils';
import { getLocalEventFeeds } from '../utils/listfeeds';

const contribute = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const { Select, Confirm, Input, List } = require('enquirer');
  var { feedName } = options;

  if (!feedName) {
    const pPickFeed = new Select({
      name: 'localFeed',
      message: `Pick a local event feed \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
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

  Logger.info('Let us first update the feed information\n')

  var info:any = loadLoadFeedInfo(feedName);
  console.log('Current', info);

  info.name = feedName

  const pCloned = new Confirm({
    message: `${chalkBoldWhite('Have you cloned the EVENT-FEEDS repo')} ${communityRepoUrl}?`,
  });
  
  await pCloned.run()
    .then((answer:any) => {
      if (!answer) {
        Logger.error('Please clone the event feeds repo locally and try again');
        process.exit(1)
      }
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pRepoPath = new Input({
    message: 'Enter the cloned EVENT-FEEDS repo path:',
    initial: '',
    validate: (value: string) => {  return !!value; }
  });
  
  var localRepo = '';
  var infoUpdated = false;

  await pRepoPath.run()
    .then((answer:any) => localRepo = answer)
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  if (!localRepo) {
    Logger.error('Please clone the event feeds repo locally and specify the full path of the local repo!');
    process.exit(1)
  }

  const repoPath = processPlainPath(`${localRepo}`);
  try {
    if (!fileExists(repoPath)) {
      Logger.error('Specified local repo path does not exist, clone the event feeds repo locally and try again');
      process.exit(1)
    }

    if (!fileExists(`${repoPath}/.git`)) {
      Logger.error('Specified local repo is not a valid Git repository, clone the event feeds repo locally and try again');
      process.exit(1)
    }

    if (!fileExists(`${repoPath}/${defaultEventFeedsFile}`)) {
      Logger.error('Specified local repo is not a valid EVENT-FEEDS repository, clone the event feeds repo locally and try again');
      process.exit(1)
    }
  } catch (error:any) {
    Logger.error('Error while checking the local repo path, clone the event feeds repo locally and try again');
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    process.exit(1)
  }

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
    message: 'Contributor name or organization name:',
    initial: info.contributor
  });

  await pFeedContributor.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.contributor !== answer;
      info.contributor = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pGitUser = new Input({
    message: 'GitHub username:',
    initial: info.github
  });

  await pGitUser.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.github !== answer;
      info.github = answer
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

  const pFeedTags = new List({
    name: 'tags',
    message: 'Feed keywords (as a comma-separated values):',
    initial: info.tags,
    validate: (value: string) => {  return !!value; }
  });
  
  await pFeedTags.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.tags !== (answer ? answer.split(',').map((t: string) => t.trim()).join(', ') : '');
      info.tags = answer ? answer.split(',').map((t: string) => t.trim()).join(', ') : ''
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  console.log('Updated', info);
  if (infoUpdated) {
    const pFeedChanged = new Confirm({
      message: `${chalkBoldWhite('Feed info has changed and the feed will be updated, do you want to proceed?')}`,
    });
    
    await pFeedChanged.run()
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
  }

  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  const analysis:any = readFile(`${feedPath}/${defaultFeedAnalysisFile}`);

  try {
    fs.mkdirSync(`${repoPath}/${feedName}`, { recursive: true })
    fs.copyFileSync(`${feedPath}/${defaultFeedAnalysisFile}`, `${repoPath}/${feedName}/${defaultFeedAnalysisFile}`)
    fs.copyFileSync(`${feedPath}/${defaultFeedInfoFile}`, `${repoPath}/${feedName}/${defaultFeedInfoFile}`)
    fs.copyFileSync(`${feedPath}/${defaultFeedRulesFile}`, `${repoPath}/${feedName}/${defaultFeedRulesFile}`)
    fs.copyFileSync(`${feedPath}/${defaultFakerRulesFile}`, `${repoPath}/${feedName}/${defaultFakerRulesFile}`)
    fs.copyFileSync(`${feedPath}/${defaultFeedSchemasFile}`, `${repoPath}/${feedName}/${defaultFeedSchemasFile}`)
    fs.copyFileSync(`${feedPath}/${analysis.fileName}`, `${repoPath}/${feedName}/${analysis.fileName}`)

    var feeds = readFile(`${repoPath}/${defaultEventFeedsFile}`);
    feeds.push(info);

    writeJsonFile(`${repoPath}/${defaultEventFeedsFile}`, feeds, true);

    // update local feedinfo 
    info.contributed = true;
    info.lastUpdated = new Date().toISOString();    
    writeJsonFile(`${feedPath}/${defaultFeedInfoFile}`, info, true);


    console.log(`
${chalkBoldWhite(`Change directory to ${localRepo} and commit the changes, and create a PR.`)}
${chalkBoldWhite('Once the PR is reviewed and merged, your feed is will be publicly available for use by all users.')}
`);
  } catch (error: any) {
    Logger.logDetailedError('feed copy failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    
    console.log(`\n\n${chalkBoldLabel('However, you can follow the steps to contribute your event feed to EVENT-FEEDS repo for public access')}:`)
    console.log(`
${chalkBoldWhite('1. Copy the feed directory to the local repo')}

${chalkItalic('$')} ${chalkBoldWhite(`cp -r "${defaultStmFeedsHome}/${feedName}" ${localRepo}`)}

${chalkBoldWhite(`2. Open the ${localRepo}/${defaultEventFeedsFile} file and add the following feed info as last element in the array.`)}

${chalkBoldWhite(JSON.stringify(info, null, 2))}

${chalkBoldWhite('3. Commit the changes to your EVENT-FEEDS repository.')}

${chalkBoldWhite('4. Create a PR on the GitHub for review.')}

${chalkBoldWhite('Once the PR is reviewed and merged, your feed is will be publicly available for use by all users.')}
  `)

    return false;
  }

  Logger.success('Goodbye 👋')
}

export default contribute

export { contribute }
