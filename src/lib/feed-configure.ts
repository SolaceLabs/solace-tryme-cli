import { getAllFeeds, getFeed, loadLocalFeedFile, updateRules } from '../utils/config';
import { defaultFakerRulesFile, defaultFeedInfoFile, defaultProjectName } from '../utils/defaults';
import { getLocalEventFeeds } from '../utils/listfeeds';
import { Logger } from '../utils/logger'
import { fakeDataObjectGenerator, fakeDataValueGenerator, fakeEventGenerator } from './feed-datahelper';
import { chalkBoldLabel, chalkBoldVariable } from '../utils/chalkUtils';
// @ts-ignore
import { generateEvent } from '@solace-labs/solace-data-generator';
import Fuse from 'fuse.js';

const manage = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const managePort = options.managePort ? options.managePort : 0;
  var feedName: string | undefined = options.feedName;
  var publicDir = __dirname.substring(0, __dirname.lastIndexOf(defaultProjectName) + defaultProjectName.length);
  var feedInfo: any = undefined;
  
  if (feedName) {
    Logger.success(`loading broker feed info ${feedName}`)
    feedInfo = loadLocalFeedFile(feedName, defaultFeedInfoFile);
  } 
  else {
    var feeds = getLocalEventFeeds();
    if (!feeds || !feeds.length) {
      Logger.logError('no local feeds found...')
      process.exit(1);
    }

    const { select } = require('inquirer-select-pro');
    const choices = [{ value: 'All Event Feeds', name: 'All Event Feeds'}];
    feeds.map((feed) => {
      choices.push({
        value: feed,
        name: feed
      })
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
    } catch(error:any) {
      Logger.logDetailedError('interrupted...', error)
      process.exit(1);
    } 

    if (feedName === 'All Event Feeds') {
      feedName = undefined;
      Logger.success(`will explore all available feeds`)
    }    
  }

  const express = require('express');
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(publicDir + '/public'));
  app.use(express.json()); 
  app.use(function(req:any, res:any, next:any) {
    // console.log('Request: ', req.method, ' on ', req.path);
    if (req.path.startsWith('/index.html')) {
      res.redirect(302, '/feeds.html');
      res.end();
    }

    next();
  });
  
  app.get('/feeds', (req:any, res:any) => {
    if (req.query.feed) {
      var feed = getFeed(req.query.feed);
      res.json(feed);
    } else {
      var feeds = getAllFeeds();
      res.json(feeds);    
    }

  })

  app.get('/fakerrules', (req:any, res:any) => {
    if (!req.query.feed) {
      res.status(201).json({error: 'missing feed name'})
    }

    var rules = loadLocalFeedFile(req.query.feed, defaultFakerRulesFile);
    res.json(rules);    
  })

  app.post('/feedrules', async (req:any, res:any) => {
    var feed = req.body;
    var result = await updateRules(feed.name, feed.rules);
    if (result) 
      res.status(200).json({success: 'updated feed rules successfully'});
    else
      res.status(201).json({error: 'unknown feed'})
  })

  app.post('/fakedata', (req:any, res:any) => {
    var data = req.body;
    try {
      var fakedData = fakeDataValueGenerator(data);
      res.status(200).json(fakedData)
    } catch (error: any) {
      res.status(201).json({error: error.toString() });
    }
  })

  app.post('/fakepayload', (req:any, res:any) => {
    var data = req.body;
    try {
      var fakedData = fakeDataObjectGenerator(data);
      res.status(200).json(fakedData)
    } catch (error: any) {
      res.status(201).json({error: error.toString() });
    }
  })

  app.post('/fakedata', (req:any, res:any) => {
    var data = req.body;
    try {
      var fakedData = fakeDataValueGenerator(data);
      res.status(200).json(fakedData)
    } catch (error: any) {
      res.status(201).json({error: error.toString() });
    }
  })

  app.post('/fakeevent', async (req:any, res:any) => {
    var data = req.body;
    var result = [];
    try {
      for (var i=0; i<data.count; i++) {
        var {topic, payload} = generateEvent(data.rule);
        result.push({ topic, payload });
      }
      res.status(200).json(result)
    } catch (error: any) {
      res.status(201).json({error: error.toString() });
    }
  })

  app.post('/exit', (req:any, res:any) => {
    console.log('exiting...')
    setTimeout(process.exit(0), 2000)
  })

  let http = require('http');
  let server = http.createServer(app);
  server.listen(managePort, () => {
    console.info(`App listening on port ${server.address().port}`);
    var opener = require("opener");
    if (feedName) {
      console.log(`Accessible at http://localhost:${server.address().port}/feeds.html?feed=${feedName}`);
      opener(`http://localhost:${server.address().port}/feeds.html?feed=${feedName}`)
    } else {
      console.log(`Accessible at http://localhost:${server.address().port}/feeds.html`);
      opener(`http://localhost:${server.address().port}/feeds.html`)
    }
  });

  process.on('SIGINT', function () {
    'use strict';
    Logger.logWarn('exiting...')
    process.exit(0);
  });

}
export default manage

export { manage }
