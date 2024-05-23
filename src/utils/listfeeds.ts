import * as fs from 'fs'
import { loadLocalFeedFile, loadGitFeedFile, processPlainPath } from './config';
import { defaultEventFeedsFile, defaultFeedAnalysisFile, defaultFeedInfoFile, defaultGitFeedRepo, defaultGitRepo, defaultStmFeedsHome } from './defaults';

export const getLocalEventFeeds = () => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}`);
  var localFeeds: any[] = [];
  const files:any = fs.readdirSync(`${feedPath}`);
  files.forEach((fileName: string) => {
    var filePath = `${feedPath}/${fileName}`
    var stat = fs.lstatSync(filePath);
    if (stat.isDirectory() && fs.existsSync(`${filePath}/${defaultFeedInfoFile}`)) {
      localFeeds.push(fileName)
    }
  })

  return localFeeds;
}

export const getFeedEvents = (feedName:any) => {
  var events: any[] = [];
  var data = loadLocalFeedFile(feedName, defaultFeedAnalysisFile)
  Object.keys(data.messages).forEach((messageName) => {
    var sendEvents = data.messages[messageName].send;
    if (sendEvents.length) {
      sendEvents.forEach((_event:any) => {
        events.push({
          name: messageName,
          topic: _event.topicName
        });
      })
    }
  });

  return events;
}

export const getGitFeedEvents = async (feedName:any) => {
  var events: any[] = [];
  var data = await loadGitFeedFile(feedName, defaultFeedAnalysisFile)
  Object.keys(data.messages).forEach((messageName) => {
    var sendEvents = data.messages[messageName].send;
    if (sendEvents.length) {
      sendEvents.forEach((_event:any) => {
        events.push({
          name: messageName,
          topic: _event.topicName
        });
      })
    }
  });

  return events;
}


export const getGitEventFeeds = async () => {
  var gitFeeds: any[] = [];
  try {
    await fetch(`${defaultGitRepo}/${defaultEventFeedsFile}`)
      .then(async (response) => {
        const data = await response.json();
        data.forEach((d: any) => gitFeeds.push(d));
      })
  } catch (error:any) {
    ;
  }
  
  return gitFeeds;
}
