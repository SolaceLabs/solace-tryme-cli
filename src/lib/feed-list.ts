import * as fs from 'fs'
import { Logger } from '../utils/logger'
import { ManageFeedClientOptionsEmpty } from '../utils/instances';
import { processPlainPath, readFile } from '../utils/config';
import { defaultFeedInfoFile, defaultGitFeedRepo, defaultGitRepo, defaultStmFeedsHome } from '../utils/defaults';
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite, chalkFeedAsyncAPIValue, chalkFeedOpenAPIValue, chalkFeedRestAPIValue, chalkFeedTypeHint } from '../utils/chalkUtils';
import { getGitEventFeeds } from '../utils/listfeeds';

const wordwrap = (str:any, width:any, brk:any, cut:any ) => {
  brk = brk || 'n';
  width = width || 75;
  cut = cut || false;

  if (!str) { return str; }

  var regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');
  return str.match( RegExp(regex, 'g') ).join( brk );
}

const list = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var communityOnly, localOnly = false;

  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  if (optionsSource.localOnly === 'cli' || optionsSource.communityOnly === 'cli') {
    communityOnly = optionsSource.communityOnly === 'cli' ? options.communityOnly : communityOnly;
    localOnly = optionsSource.localOnly === 'cli' ? options.localOnly : localOnly;
  } else {
    const { MultiSelect } = require('enquirer');
    const pFeedSource = new MultiSelect({
      name: 'feedSources',
      message: `Pick event feed sources \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('<space>')} to ${chalkBoldVariable('select')}\n` +
                `    ${chalkBoldLabel('a')} to ${chalkBoldVariable('toggle choices to be enabled or disabled')}\n` +
                `    ${chalkBoldLabel('i')} to ${chalkBoldVariable('invert current selection')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'Local Event Feeds',
        'Community Event Feeds'
      ],
      initial: [0, 1],
    });

    await pFeedSource.run()
      .then((answer: any) => {
        communityOnly = answer.includes('Community Event Feeds') ? true : false;
        localOnly = answer.includes('Local Event Feeds') ? true : false;
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  } 

  const feedPath = processPlainPath(`${defaultStmFeedsHome}`);

  var localFeeds: any[] = [];
  if (localOnly) {
    const files:any = fs.readdirSync(`${feedPath}`);
    files.forEach((fileName: string) => {
      var filePath = `${feedPath}/${fileName}`
      var stat = fs.lstatSync(filePath);
      if (stat.isDirectory() && fs.existsSync(`${filePath}/${defaultFeedInfoFile}`)) {
        var info = readFile(`${filePath}/${defaultFeedInfoFile}`);
        localFeeds.push(info);
      }
    })
  }

  var gitFeeds: any[] = [];
  if (communityOnly) {
    var gitFeeds = await getGitEventFeeds();
    if (!gitFeeds || !gitFeeds.length) {
      Logger.logError('invalid feeds git repo or no feeds found in the repository...')
      process.exit(1);
    }
  }
  
  var result:any = [];
  if (localFeeds.length) {
    Logger.await('Fetching Local Event Feeds...');
    Logger.logSuccess(`Local Event Feeds: ${localFeeds.length}`);
    localFeeds.forEach((feed: any) => {
      options.verbose && result.push(chalkBoldLabel(`──────────────────────────────────────────────────────────────────────`));
      if (feed.type === 'asyncapi_feed')
        result.push(chalkFeedAsyncAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else if (feed.type === 'openapi-feed')
        result.push(chalkFeedOpenAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else if (feed.type === 'restapi_feed')
        result.push(chalkFeedRestAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else
        result.push(chalkFeedTypeHint(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      options.verbose && feed.description && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Description')}: ${chalkBoldWhite(feed.description)}`));
      options.verbose && feed.contributor && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Contributor')}: ${chalkBoldWhite(feed.contributor)}`));
      options.verbose && feed.img && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Icon Image')}: ${chalkBoldWhite(feed.img)}`));
      options.verbose && feed.domain && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Domain')}: ${chalkBoldWhite(feed.domain)}`));
      options.verbose && feed.tags && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Tags')}: ${chalkBoldWhite(feed.tags)}`));
    })
    Logger.logSuccess('\n' + result.join('\n') + '\n');

  }

  result = [];
  if (gitFeeds.length) {
    Logger.await('Fetching Community Event Feeds...');
    Logger.logSuccess(`Community Event Feeds: ${gitFeeds.length}`);
    gitFeeds.forEach((feed: any) => {
      options.verbose && result.push(chalkBoldLabel(`──────────────────────────────────────────────────────────────────────`));
      if (feed.type === 'asyncapi_feed')
        result.push(chalkFeedAsyncAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else if (feed.type === 'openapi-feed')
        result.push(chalkFeedOpenAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else if (feed.type === 'restapi_feed')
        result.push(chalkFeedRestAPIValue(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      else
        result.push(chalkFeedTypeHint(`${('[' + feed.type + ']').padEnd(18, ' ')}`) + chalkBoldLabel(`${feed.name}`));
      options.verbose && feed.description && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Description')}: ${chalkBoldWhite(feed.description)}`));
      options.verbose && feed.contributor && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Contributor')}: ${chalkBoldWhite(feed.contributor)}`));
      options.verbose && feed.img && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Icon Image')}: ${chalkBoldWhite(feed.img)}`));
      options.verbose && feed.name && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Git Repo URL')}: ${chalkBoldWhite(encodeURI(defaultGitFeedRepo + '/' + feed.name))}`));
      options.verbose && feed.domain && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Domain')}: ${chalkBoldWhite(feed.domain)}`));
      options.verbose && feed.tags && result.push(chalkBoldLabel(`    ${chalkBoldVariable('Tags')}: ${chalkBoldWhite(feed.tags)}`));
    })
    Logger.logSuccess('\n' + result.join('\n') + '\n');

  }

}

export default list

export { list }
