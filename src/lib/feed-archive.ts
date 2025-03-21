import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { chalkBoldLabel, chalkBoldVariable } from '../utils/chalkUtils'
import { fileExists, loadGitFeedFile, loadLocalFeedFile, writeJsonFile } from '../utils/config';
import { defaultFakerRulesFile, defaultFeedAnalysisFile, defaultFeedApiEndpointFile, defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile } from '../utils/defaults';
import { getGitEventFeeds, getLocalEventFeeds } from '../utils/listfeeds';

const feedArchive = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var feedName = '';
  var gitFeed = false;
  var info = null;

  const { Select, Input, AutoComplete } = require('enquirer');
  if (optionsSource.communityOnly === 'cli') {
    gitFeed = optionsSource.communityOnly === 'cli' ? options.communityFeed : false;
    feedName = optionsSource.feedName === 'cli' ? options.feedName : '';
  } else {
    const pFeedSource = new Select({
      name: 'source',
      message: `Pick the feed source \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'Local Event Feeds',
        'Community Event Feeds'
      ]
    });

    await pFeedSource.run()
      .then((answer:any) => {
        gitFeed = answer === 'Community Event Feeds' ? true : false;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  if (!gitFeed && !feedName) {
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
  } else if (gitFeed && !feedName) {
    var feeds = await getGitEventFeeds();
    if (!feeds || !feeds.length) {
      Logger.logError('no feeds found on the community...')
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

  if (!options.archiveFile) {
    const pArchiveFile = new Input({
      message: 'Enter Archive file',
      initial: 'feed-archive.zip',
      validate: (value: string) => {  return !!value; }
    });
    
    await pArchiveFile.run()
      .then((answer:any) => options.archiveFile = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  info = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);
  if (!info) {
    Logger.logError(`Feed '${feedName}' not found...`)
    process.exit(1);
  }

  const zlib = require("zip-lib");

  var exportPath = `${process.cwd()}/export`;
  var zipPath = `${exportPath}/${feedName}`;
  if (fileExists(exportPath)) fs.rmdirSync(exportPath, { recursive: true });
  fs.mkdirSync(exportPath, { recursive: true });

  var data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedInfoFile) : loadLocalFeedFile(feedName, defaultFeedInfoFile);
  writeJsonFile(`${zipPath}/${defaultFeedInfoFile}`, data);
  if (info.type === 'asyncapi_feed') {
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedAnalysisFile) : loadLocalFeedFile(feedName, defaultFeedAnalysisFile);
    writeJsonFile(`${zipPath}/${defaultFeedAnalysisFile}`, data);
    var asyncApiFile = data.fileName;
    data = gitFeed ? await loadGitFeedFile(feedName, asyncApiFile) : loadLocalFeedFile(feedName, asyncApiFile);
    writeJsonFile(`${zipPath}/${asyncApiFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFakerRulesFile) : loadLocalFeedFile(feedName, defaultFakerRulesFile);
    writeJsonFile(`${zipPath}/${defaultFakerRulesFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedSchemasFile) : loadLocalFeedFile(feedName, defaultFeedSchemasFile);
    writeJsonFile(`${zipPath}/${defaultFeedSchemasFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedRulesFile) : loadLocalFeedFile(feedName, defaultFeedRulesFile);
    writeJsonFile(`${zipPath}/${defaultFeedRulesFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedSchemasFile) : loadLocalFeedFile(feedName, defaultFeedSchemasFile);
    writeJsonFile(`${zipPath}/${defaultFeedSchemasFile}`, data);
  } else if (info.type === 'restapi_feed') {
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFakerRulesFile) : loadLocalFeedFile(feedName, defaultFakerRulesFile);
    writeJsonFile(`${zipPath}/${defaultFakerRulesFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedApiEndpointFile) : loadLocalFeedFile(feedName, defaultFeedApiEndpointFile);
    writeJsonFile(`${zipPath}/${defaultFeedApiEndpointFile}`, data);
    data = gitFeed ? await loadGitFeedFile(feedName, defaultFeedRulesFile) : loadLocalFeedFile(feedName, defaultFeedRulesFile);
    writeJsonFile(`${zipPath}/${defaultFeedRulesFile}`, data);
  }

  await zlib.archiveFolder(exportPath , options.archiveFile.endsWith('.zip') ? options.archiveFile : options.archiveFile + '.zip').then(function () {
    fs.rmdirSync(exportPath, { recursive: true });
  }, function (err:any) {
    fs.rmdirSync(exportPath, { recursive: true });
    Logger.logDetailedError('feed archival failed...', err)
    Logger.error('exiting...');
    process.exit(1);
  });

  Logger.success(`Feed ${feedName} archived successfully!`);
  Logger.success('exiting...');
  process.exit(0);
}

export default feedArchive;