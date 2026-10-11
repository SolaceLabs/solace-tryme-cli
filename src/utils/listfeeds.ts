import * as fs from 'fs'
import { loadLocalFeedFile, loadGitFeedFile, processPlainPath } from './config';
import { defaultEventFeedsFile, defaultFeedAnalysisFile, defaultFeedInfoFile, defaultGitFeedRepo, defaultGitRepo, defaultStmFeedsHome } from './defaults';

export const getLocalEventFeeds = () => {
  const localFeeds: any[] = [];
  const feedPath = processPlainPath(`${defaultStmFeedsHome}`);
  if (!fs.existsSync(`${feedPath}`)) 
    return localFeeds;
  
  const files:any = fs.readdirSync(`${feedPath}`);
  files.forEach((fileName: string) => {
    const filePath = `${feedPath}/${fileName}`
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory() && fs.existsSync(`${filePath}/${defaultFeedInfoFile}`)) {
      localFeeds.push(fileName)
    }
  })

  return localFeeds;
}

export const getFeedEvents = (feedName:any) => {
  const events: any[] = [];
  const data = loadLocalFeedFile(feedName, defaultFeedAnalysisFile)
  Object.keys(data.messages).forEach((messageName) => {
    const sendEvents = data.messages[messageName].send;
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
  const gitFeeds: any[] = [];
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

export const getGitFeedEvents = async (feedName:any) => {
  const events: any[] = [];
  const data = await loadGitFeedFile(feedName, defaultFeedAnalysisFile)
  Object.keys(data.messages).forEach((messageName) => {
    const sendEvents = data.messages[messageName].send;
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