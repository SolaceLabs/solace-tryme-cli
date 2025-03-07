import { Logger } from '../utils/logger'
import { chalkBoldLabel, chalkBoldVariable, chalkBoldWhite } from '../utils/chalkUtils'
import { getGitEventFeeds, getLocalEventFeeds } from '../utils/listfeeds';
import Fuse, { FuseResult } from 'fuse.js';
import { loadGitFeedFile, loadLocalFeedFile } from '../utils/config';
import { defaultFeedAnalysisFile } from '../utils/defaults';
import { load } from 'js-yaml';

const IMPORTER_URL = 'https://ep-asyncapi-importer.cfapps.ca10.hana.ondemand.com/importer';
const epExport = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const cloudSettings:any = {};

  var feedName, gitFeed = undefined;

  const startLoadingSimulator = (message:string, interval: number) => {
    let dots = 0;
    const intervalId = setInterval(() => {
      process.stdout.write(`\r${message}${'.'.repeat(dots)}`);
      dots = (dots + 1) % 4;
    }, interval);
  
    return intervalId;
  }

  const stopLoadingSimulator = (intervalId: any) => {
    clearInterval(intervalId);
    process.stdout.write('\n');
  }

  const verifyToken = async (region: string, token: string) => {
    const response = await fetch(
      `${IMPORTER_URL}/validate-token?urlRegion=${region}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          epToken: btoa(token),
        }),
      }
    );

    const result = await response.json();
    if (result.msgs[0] !== 'SUCCESS') {
      Logger.error('Token verification failed');
      Logger.error('exiting...');
      process.exit(1);
    }
  }
  
  const fetchDomains = async (region:string, token:string) => {
    const domainFetchTimer = startLoadingSimulator("Fetching domains", 250);  
    const response = await fetch(
      `${IMPORTER_URL}/appdomains?urlRegion=${region}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          epToken: btoa(token),
        }),
      }
    );
    if (!response.ok) {
      stopLoadingSimulator(domainFetchTimer);
      Logger.logDetailedError('Fetch domains failed...', response.statusText);
      Logger.error('exiting...');
      process.exit(1);
    }

    stopLoadingSimulator(domainFetchTimer);
    const domains = (await response.json()).applicationDomains;
    return domains;
  }
  
  const fetchWithTimeout = async (url:string, options:any, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeout);

      fetch(url, options)
        .then(async (response) => {
          clearTimeout(timer);
          await response.json().then((data) => {
            cloudSettings.logs = JSON.stringify(data, null, 2);
          });
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          cloudSettings.logs = err.message;
          reject(err);
        });
    });
  };

  const exportFeed = async (spec: any) => {
    const exportFeedTimer = startLoadingSimulator("Exporting feed", 250);
    const response:any|Error = await fetchWithTimeout(
      `${IMPORTER_URL}?appDomainId=${cloudSettings.domainId}&urlRegion=${cloudSettings.region}&newVersionStrategy=${cloudSettings.incrementVersionStrategy}&eventsOnly=${cloudSettings.exportEventsOnly}&disableCascadeUpdate=${cloudSettings.disableCascadeUpdate}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          epToken: btoa(cloudSettings.token),
          asyncApiSpec: btoa(JSON.stringify(spec)),
        }),
      },
      60000 // timeout
    );
    stopLoadingSimulator(exportFeedTimer);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }    

  const showLogs = (optionsSource.showLogs === 'cli' && options.showLogs);
  if (optionsSource.feedName === 'cli' || optionsSource.fileName === 'cli') {
    feedName = options.feedName;
    if (feedName && options.communityFeed)
      gitFeed = true;
  } else {    
    const { Select } = require('enquirer');
    const pFeedSource = new Select({
      name: 'source',
      message: `Pick the preview source \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'Local Event Feeds',
        'Community Event Feeds'
      ]
    });

    var choice = undefined;
    await pFeedSource.run()
      .then((answer: any) => { choice = answer; })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
    
    if (choice === 'Local Event Feeds') {
      var feeds = getLocalEventFeeds();
      if (!feeds || !feeds.length) {
        Logger.logError('no local feeds found...')
        process.exit(1);
      }

      const { select } = require('inquirer-select-pro');
      const choices = feeds.map((feed) => {
        return {
          value: feed,
          name: feed
        }
      });
  
      try {
        let fuse = new Fuse(choices, {
          keys: ['name'],
          includeScore: true,
        });
                
        const answer = await select({
          message: `Pick the feed [Found ${choices.length}, displaying ${choices.length > 10 ? 10 : choices.length}]\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
          `    ${chalkBoldLabel('<char>>')} enter search string to refine the list\n` +
          `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
          `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
          required: true,
          multiple: false,
          options: async (input = '') => {
            if (!input) return choices;
            if (fuse) {
              const result = fuse.search(input).map(({ item }: { item: { name: string; value: string } }) => item);
              return result;
            }
            return [];
          }
        });
        
        feedName = answer;
        gitFeed = false;
      } catch(error:any) {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      } 
    } else if (choice === 'Community Event Feeds') {
      var feeds = await getGitEventFeeds();
      if (!feeds || !feeds.length) {
        Logger.logError('no feeds found in the repository...')
        process.exit(1);
      }
      const { select } = require('inquirer-select-pro');
      const choices = feeds.map((feed) => {
        return {
          value: feed.name,
          name: feed.name
        }
      });
  
      try {
        let fuse = new Fuse(choices, {
          keys: ['name'],
          includeScore: true,
        });
                
        const answer = await select({
          message: `Pick the feed [Found ${choices.length}, displaying ${choices.length > 10 ? 10 : choices.length}]\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
          `    ${chalkBoldLabel('<char>>')} enter search string to refine the list\n` +
          `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
          `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
          required: true,
          multiple: false,
          options: async (input = '') => {
            if (!input) return choices;
            if (fuse) {
              const result = fuse.search(input).map(({ item }: { item: { name: string; value: string } }) => item);
              return result;
            }
            return [];
          }
        });
        
        feedName = answer;
        gitFeed = true;
      } catch(error:any) {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      } 
    }
  }

  // load feed details
  let analysis = gitFeed ? await loadGitFeedFile(feedName, defaultFeedAnalysisFile) : 
                            await loadLocalFeedFile(feedName, defaultFeedAnalysisFile);
  if (!analysis) {
    Logger.logError('error loading feed details...')
    process.exit(1);
  }

  cloudSettings.specFile = analysis.fileName;
  let spec = gitFeed ? await loadGitFeedFile(feedName, analysis.fileName) :
                      await loadLocalFeedFile(feedName, analysis.fileName);
  if (!spec) {
    Logger.logError('error loading AsyncAPI document...')
    process.exit(1);
  }

  cloudSettings.spec = spec;

  const { Select, Input, Toggle, Password } = require('enquirer');

  // Event Portal Settings
  const pCloudRegion = new Select({
    name: 'region',
    message: `Pick the solace cloud region \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
              `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
              `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
    choices: [
      'US',
      'SG',
      'AU',
      'EU'
    ]
  });

  await pCloudRegion.run()
    .then((answer: any) => { cloudSettings.region = answer; })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });    

  // const pToken = new Password({    
  const pToken = new Password({
    message: `Solace Event Portal Token\n${chalkBoldLabel('Hint')}: The token is neither stored nor used after the current operation.\n`,
    validate: (value: string) => {  return !!value; }
  });

  await pToken.run()
    .then((answer: string) => {
      cloudSettings.token = answer.trim();
    })
    .catch((error:any) => {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    });    
  
  // verify token
  await verifyToken(cloudSettings.region, cloudSettings.token);

  // fetch domains
  const domains = await fetchDomains(cloudSettings.region, cloudSettings.token);
  if (!domains || !domains.length) {
    Logger.logError('no domains found...')
    process.exit(1);
  }

  const { select } = require('inquirer-select-pro');
  const choices = domains.map((domain:any) => {
    return {
      value: domain.name,
      name: domain.name
    }
  });  

  try {
    interface SearchResult {
      name: string;
      value: string;
    }
    
    let fuse = new Fuse(choices, {
      keys: ['name'],
      includeScore: true,
    });  
  
    const answer = await select({
      message: `Pick the target domain [Found ${choices.length}, displaying ${choices.length > 10 ? 10 : choices.length}]\n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
      `    ${chalkBoldLabel('<char>>')} enter search string to refine the list\n` +
      `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
      `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      required: true,
      multiple: false,
      options: async (input = '') => {
        if (!input) return choices;
        if (fuse) {
          const result = fuse.search<SearchResult>(input).map(({ item }: { item: { name: string; value: string } }) => item);
          return result;
        }
        return [];
      }
    });
    
    var domain = domains.find((d:any) => d.name === answer);
    cloudSettings.domainName = domain.name;
    cloudSettings.domainId = domain.id;
  } catch(error:any) {
    Logger.logDetailedError('interrupted...', error)
    process.exit(1);
  } 

  try {
    const pIncrementStrategy = new Select({
      name: 'source',
      message: `Pick the increment version strategy \n${chalkBoldLabel('Hint')}: Shortcut keys for navigation and selection\n` +
                `    ${chalkBoldLabel('↑↓')} keys to ${chalkBoldVariable('move')}\n` +
                `    ${chalkBoldLabel('↵')} to ${chalkBoldVariable('submit')}\n`,
      choices: [
        'Major',
        'Minor',
        'Patch'
      ]
    });

    await pIncrementStrategy.run()
      .then((answer: any) => { cloudSettings.incrementVersionStrategy = answer.toUpperCase(); })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });    
  } catch(error:any) {
    Logger.logDetailedError('interrupted...', error)
    process.exit(1);
  }

  try {
    const pExportEvents = new Toggle({
      message: 'Export Events only',
      enabled: 'True',
      disabled: 'False'
    });    

    await pExportEvents.run()
      .then((answer: any) => { cloudSettings.exportEventsOnly = answer; })
      .catch(console.error);
  } catch(error:any) {
    Logger.logDetailedError('interrupted...', error)
    process.exit(1);
  } 

  try {
    const pCascadeUpdate = new Toggle({
      message: 'Disable cascade update',
      enabled: 'True',
      disabled: 'False'
    });

    await pCascadeUpdate.run()
      .then((answer: any) => { cloudSettings.disableCascadeUpdate = answer; })
      .catch(console.error);      
  } catch(error:any) {
    Logger.logDetailedError('interrupted...', error)
    process.exit(1);
  } 
  
  // Export the feed
  try {
    await exportFeed(cloudSettings.spec);
    if (showLogs) {
      Logger.info('Export logs...');
      console.log(cloudSettings.logs);
    }
  } catch (error:any) {
    Logger.logDetailedError('Export failed...', error);
    process.exit(1);
  }

  Logger.success('Export completed successfully...');
  process.exit(0);
}

export default epExport

export { epExport }
