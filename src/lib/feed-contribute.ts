import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { fileExists, loadFeedInfo, processPlainPath, readFile, writeJsonFile } from '../utils/config';
import { communityRepoUrl, defaultEventFeedsFile, defaultFakerRulesFile, defaultFeedAnalysisFile, 
        defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultStmFeedsHome } from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkItalic } from '../utils/chalkUtils';
import { getLocalEventFeeds } from '../utils/listfeeds';

const contribute = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const { Select, Confirm, Input, List } = require('enquirer');
  var { feedName } = options;

  if (!feedName) {
    const prompt0 = new Select({
      name: 'localFeed',
      message: `Pick a local event feed \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: getLocalEventFeeds()
    });

    await prompt0.run()
      .then((answer:any) => feedName = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  Logger.info('Let us first update the feed information\n')

  var info:any = loadFeedInfo(feedName);
  console.log('Current', info);

  info.name = feedName

  const prompt = new Confirm({
    message: `${chalkBoldWhite('Have you cloned the EVENT-FEEDS repo')} ${communityRepoUrl}?`,
  });
  
  await prompt.run()
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

  const prompt2 = new Input({
    message: 'Enter the cloned EVENT-FEEDS repo path:',
    initial: ''
  });
  
  var localRepo = '';
  var infoUpdated = false;

  await prompt2.run()
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

  const prompt4 = new Input({
    message: 'Feed description:',
    initial: info.description
  });

  await prompt4.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.description !== answer;
      info.description = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

    const prompt3 = new Input({
      message: 'Feed icon (an URL or a base64 image data):',
      hint: 'Leave blank to use default feed icon',
      initial: info.img
    });
  
    await prompt3.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.img !== answer;
      info.img = answer ? answer : 'assets/img/defaultfeed.png'
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt5 = new Input({
    message: 'Contributor name or organization name:',
    initial: info.contributor
  });

  await prompt5.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.contributor !== answer;
      info.contributor = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt6 = new Input({
    message: 'GitHub username:',
    initial: info.github
  });

  await prompt6.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.github !== answer;
      info.github = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt7 = new Input({
    message: 'Feed domain:',
    initial: info.domain
  });

  await prompt7.run()
    .then((answer:any) => {
      if (!infoUpdated) infoUpdated = info.domain !== answer;
      info.domain = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    }); 

  const prompt8 = new List({
    name: 'tags',
    message: 'Feed keywords (as a comma-separated values):',
    initial: info.tags
  });
  
  await prompt8.run()
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
    const prompt9 = new Confirm({
      message: `${chalkBoldWhite('Feed info has changed and the feed will be updated, do you want to proceed?')}`,
    });
    
    await prompt9.run()
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
