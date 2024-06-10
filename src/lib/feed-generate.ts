import { Logger } from '../utils/logger'
import { createFeed, loadFeedInfo } from '../utils/config';
import analyze from './feed-analyze';
import { formulateRules, formulateSchemas } from './feed-ruleset';

const getPotentialFeedName = (fileName: string) => {
  var feedName = fileName.split('/').pop();
  feedName = feedName?.split('.').shift() ?? ''; // Add nullish coalescing operator to provide a default value
  return feedName;
}

const generate = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var { fileName, feedName, feedType } = options;
  var feed:any = {};
  const { Input } = require('enquirer');

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
  loadFeedInfo(feed);

  Logger.success(`Successfully created event feed ${feedName}`);
  Logger.success('exiting...');
  process.exit(0);
}

export default generate

export { generate }
