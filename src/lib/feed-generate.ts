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

  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    fileName = options.fileName;
  } else {
    const { Input } = require('enquirer');
    const prompt = new Input({
      message: 'Enter AsyncAPI file',
      initial: 'asyncapi.json'
    });

    await prompt.run()
      .then((answer: string) => {
        fileName = answer;
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
        feedName = answer;
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
  createFeed(fileName, feedName, data, rules, schemas);
  await loadFeedInfo(feedName, feedType)

  Logger.success(`Successfully created event feed ${feedName}`);
  Logger.success('exiting...');
  process.exit(0);
}

export default generate

export { generate }
