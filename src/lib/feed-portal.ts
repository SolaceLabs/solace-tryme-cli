import * as fs from 'fs'
import path from 'path';
import { processPlainPath, readFile } from '../utils/config';
import { defaultFeedInfoFile, defaultProjectName, defaultStmFeedsHome } from '../utils/defaults';
import { Logger } from '../utils/logger'
import { getGitEventFeeds } from '../utils/listfeeds';

const feedPortal = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const managePort = options.managePort ? options.managePort : 0;
  var publicDir = __dirname.substring(0, __dirname.lastIndexOf(defaultProjectName) + defaultProjectName.length);

  const express = require('express');
  const app = express();

  const feedsPath = process.env.STM_HOME
  ? path.resolve(process.env.STM_HOME)
  : path.resolve(process.env.HOME || '', '.stm/feeds');

  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(publicDir + '/public/feedportal/public'));
  app.use(express.json()); 
  app.use(function(req:any, res:any, next:any) {
    // console.log('Request: ', req.method, ' on ', req.path);
    next();
  });
  
  app.post('/feeds', async (req:any, res:any) => {
    const isLocal = req.query?.isLocal === true || req.query?.isLocal === 'true';
    var localFeeds: any[] = [];
    if (isLocal) {
      const files:any = fs.readdirSync(`${defaultStmFeedsHome}`);
      const feedPath = processPlainPath(`${defaultStmFeedsHome}`);
      files.forEach((fileName: string) => {
        var filePath = `${feedPath}/${fileName}`
        var stat = fs.lstatSync(filePath);
        if (stat.isDirectory() && fs.existsSync(`${filePath}/${defaultFeedInfoFile}`)) {
          var info = readFile(`${filePath}/${defaultFeedInfoFile}`);
          localFeeds.push(info);
        }
      })
    }

    var communityFeeds = await getGitEventFeeds();

    res.send({localFeeds, communityFeeds});
  });

  app.post('/localfeed', async (req:any, res:any) => {
    var feed = req.body;
    const files:any = fs.readdirSync(`${defaultStmFeedsHome}`);
    const feedPath = processPlainPath(`${defaultStmFeedsHome}`);
    var found = false;
    files.forEach((fileName: string) => {
      if (fileName === feed.feedName) {
        var filePath = `${feedPath}/${fileName}/${feed.fileName}`
        if (fs.existsSync(`${filePath}`)) {
          var content = readFile(`${filePath}`);
          res.send({content});
          found = true;
          return;
        }
      }
    })
  
    if (!found) res.send({});
  });

  app.post('/exit', (req:any, res:any) => {
    console.log('exiting...')
    setTimeout(process.exit(0), 2000)
  })

  // @ts-ignore
  app.get('/feeds', (req, res) => {
    fs.readdir(feedsPath, { withFileTypes: true }, (err, entries) => {
      if (err) {
        res.status(500).json({ error: 'Failed to read directory' });
        return;
      }

      const feedPromises = entries
        .filter((entry) => entry.isDirectory())
        .map((dir) => {
          const feedInfoPath = path.join(feedsPath, dir.name, 'feedinfo.json');
          const feedRulesPath = path.join(feedsPath, dir.name, 'feedrules.json');

          return new Promise((resolve) => {
            // Read feedinfo.json and feedrules.json in parallel
            Promise.all([
              fs.promises.readFile(feedInfoPath, 'utf8').catch(() => null),
              fs.promises.readFile(feedRulesPath, 'utf8').catch(() => null),
            ]).then(([feedInfoData, feedRulesData]) => {
              if (feedInfoData || feedRulesData) {
                try {
                  const feedInfo = feedInfoData ? JSON.parse(feedInfoData) : null;
                  const feedRules = feedRulesData ? JSON.parse(feedRulesData) : null;
                  resolve({ directory: dir.name, feedinfo: feedInfo, feedrules: feedRules });
                } catch (parseError) {
                  resolve(null);  // Ignore parsing errors
                }
              } else {
                resolve(null);  // No data found for this directory
              }
            });
          });
        });

      Promise.all(feedPromises).then((feeds) => {
        const validFeeds = feeds.filter((feed) => feed !== null);
        res.json(validFeeds);
      });
    });
  });

  app.listen(8081, () => {
    console.log(`Server is running on http://127.0.0.1:8081`);
  });

  let http = require('http');
  let server = http.createServer(app);
  server.listen(managePort, () => {
    console.info(`App listening on port ${server.address().port}`);
    var opener = require("opener");
    console.log(`Accessible at http://localhost:${server.address().port}/index.html`);
    opener(`http://localhost:${server.address().port}/index.html`)
  });

  process.on('SIGINT', function () {
    'use strict';
    Logger.logWarn('exiting...')
    process.exit(0);
  });

}

export default feedPortal

export { feedPortal }
