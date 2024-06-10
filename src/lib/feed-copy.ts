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
      message: `Pick the event feed (↑↓ keys to ${chalkBoldVariable('move')} and ↵ to ${chalkBoldVariable('submit')})`,
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
    message: 'Enter local feed name',
    initial: feedName
  });
  
  await promptLocal.run()
    .then((answer:any) => localFeedName = answer)
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });
  
  const feedsPath = processPlainPath(`${defaultStmFeedsHome}`);
  if (!fileExists(feedsPath)) {
    Logger.error('Local repo path does not exist, something wrong!');
    process.exit(1)
  }

  const localFeedPath = processPlainPath(`${feedsPath}/${localFeedName}`);
  if (fileExists(localFeedPath)) {
    const { Confirm } = require('enquirer');

    const prompt = new Confirm({
      message: `${chalkBoldWhite('A feed by name ${localFeedName} already exists, do you want to overwrite it?')}`
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
  writeJsonFile(`${localFeedPath}/${defaultFeedInfoFile}`, info);
  data = await loadGitFeedFile(feedName, defaultFeedSchemasFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedSchemasFile}`, data);
  data = await loadGitFeedFile(feedName, defaultFeedRulesFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedRulesFile}`, data);
  data = await loadGitFeedFile(feedName, defaultFeedSchemasFile);
  writeJsonFile(`${localFeedPath}/${defaultFeedSchemasFile}`, data);

  const prompt3 = new Input({
    message: 'Do you want to update the image url that represents the feed:',
    initial: info.img
  });

  await prompt3.run()
    .then((answer:any) => {
      info.img = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt4 = new Input({
    message: 'Do you want to update the title of the feed:',
    initial: feedName
  });

  // await prompt4.run()
  //   .then((answer:any) => {
  //     info.title = answer
  //   })
  //   .catch((error:any) => {
  //     Logger.logDetailedError('interrupted...', error)
  //     process.exit(1);
  //   });

  const prompt5 = new Input({
    message: 'Do you want to update the description of the feed',
    initial: info.description
  });

  await prompt5.run()
    .then((answer:any) => {
      info.description = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt6 = new Input({
    message: 'Do you want to update your contributor:',
    initial: info.contributor
  });

  await prompt6.run()
    .then((answer:any) => {
      info.contributor = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });

  const prompt7 = new Input({
    message: 'Do you want to update the domain of the feed:',
    initial: info.domain
  });

  await prompt7.run()
    .then((answer:any) => {
      info.domain = answer
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    }); 

  const prompt8 = new List({
    name: 'tags',
    message: 'Do you want to update tags that identifies the feed context better (as a comma-separated values):',
    initial: info.tags
  });
  
  await prompt8.run()
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