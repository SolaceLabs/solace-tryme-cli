import * as fs from 'fs'
import { Parser } from '@asyncapi/parser';
import { Logger } from '../utils/logger'
import { chalkBoldWhite, chalkBoldLabel, chalkBoldVariable, chalkBoldTopicSeparator, chalkWhite, colorizeTopic, wrapContent } from '../utils/chalkUtils'
import { ManageFeedClientOptionsEmpty } from '../utils/instances';
import analyze from './feed-analyze';
import { fileExists, loadGitFeedFile, processPlainPath, readFile, writeJsonFile } from '../utils/config';
import { defaultFakerRulesFile, defaultFeedAnalysisFile, defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultGitRepo, defaultStmFeedsHome } from '../utils/defaults';
import { getGitEventFeeds } from '../utils/listfeeds';

const copyLocal = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var feedName = '';
  var localFeedName = '';
  var gitFeeds: any[] = [];

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
  } else {
    const { Select } = require('enquirer');

    gitFeeds = await getGitEventFeeds();
    if (!gitFeeds || !gitFeeds.length) {
      Logger.logError('no feeds found in the repository...')
      process.exit(1);
    }

    const promptFeed = new Select({
      name: 'gitFeed',
      message: `Pick the community event feed \n\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: gitFeeds
    });

    await promptFeed.run()
      .then((answer:any) => feedName = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });        
  }

  const { Input, List } = require('enquirer');
  
  const promptLocal = new Input({
    message: `${chalkBoldWhite('Feed name')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current name\n`,
    initial: feedName,
    validate: (value: string) => {  return !!value; }
  });
  
  await promptLocal.run()
    .then((answer:any) => localFeedName = answer)
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
  
  const feedsPath = processPlainPath(`${defaultStmFeedsHome}`);
  if (!fileExists(feedsPath)) {
    Logger.error('Local feeds folder does not exist, something wrong!');
    process.exit(1)
  }

  const localFeedPath = processPlainPath(`${feedsPath}/${localFeedName}`);
  if (fileExists(localFeedPath)) {
    const { Confirm } = require('enquirer');

    const pFeedOverwrite = new Confirm({
      message: chalkBoldWhite(`A feed by name ${localFeedName} already exists, do you want to overwrite it?`)
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

      fs.rmSync(localFeedPath, { recursive: true, force: true });
  }
    
  var data = await loadGitFeedFile(feedName, defaultFeedAnalysisFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedAnalysisFile}`, data);
  var asyncApiFile = data.fileName;
  data = await loadGitFeedFile(feedName, asyncApiFile);
  writeJsonFile(`${localFeedPath}/${asyncApiFile}`, data);
  data = await loadGitFeedFile(feedName, defaultFakerRulesFile);
  writeJsonFile(`${localFeedPath}/${defaultFakerRulesFile}`, data);
  var info = await loadGitFeedFile(feedName, defaultFeedInfoFile);
  info.name = localFeedName;
  writeJsonFile(`${localFeedPath}/${defaultFeedInfoFile}`, info);
  data = await loadGitFeedFile(feedName, defaultFeedSchemasFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedSchemasFile}`, data);
  data = await loadGitFeedFile(feedName, defaultFeedRulesFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedRulesFile}`, data);
  data = await loadGitFeedFile(feedName, defaultFeedSchemasFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedSchemasFile}`, data);

  const pImageOverwrite = new Input({
    message: `${chalkBoldWhite('Feed icon (an URL or a base64 image data)')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current icon\n`,
    initial: info.img
  });

  await pImageOverwrite.run()
    .then((answer:any) => {
      info.img = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedDesc = new Input({
    message: `${chalkBoldWhite('Feed description')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current description\n`,
    initial: info.description,
    validate: (value: string) => {  return !!value; }
  });

  await pFeedDesc.run()
    .then((answer:any) => {
      info.description = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedContributor = new Input({
    message: `${chalkBoldWhite('Contributor name')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current contributor info\n`,
    initial: info.contributor
  });

  await pFeedContributor.run()
    .then((answer:any) => {
      info.contributor = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const pFeedDomain = new Input({
    message: `${chalkBoldWhite('Feed domain')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current contributor info\n`,
    initial: info.domain,
    validate: (value: string) => {  return !!value; }
  });

  await pFeedDomain.run()
    .then((answer:any) => {
      info.domain = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    }); 

  const pFeedTags = new List({
    name: 'tags',
    message: `${chalkBoldWhite('Feed keywords (as a comma-separated values)')}\n` +
    `${chalkBoldLabel('Hint')}: Hit ${chalkBoldLabel('↵')} to keep the current contributor info\n`,
    initial: info.tags,
    validate: (value: string) => {  return !!value; }
  });
  
  await pFeedTags.run()
    .then((answer:any) => {
      info.tags = answer ? answer.join(', ') : ''
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
    
  info.lastUpdated = new Date().toISOString();
  writeJsonFile(`${localFeedPath}/${defaultFeedInfoFile}`, info);
  Logger.success(`Feed ${localFeedName} copied successfully!`);
  Logger.success('exiting...');
  process.exit(0);
}

export default copyLocal;