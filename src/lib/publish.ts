import concat from 'concat-stream'
import { checkConnectionParamsExists, checkForCliTopics, checkPubTopicExists, checkSaveParameters } from '../utils/checkparams'
import { SolaceClient } from '../common/publish-client'
import { Logger } from '../utils/logger'
import { defaultMessage, delay } from '../utils/defaults';
import { displayHelpExamplesForPublish } from '../utils/examples';
import { saveOrUpdateCommandSettings } from '../utils/config';

const publish = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  try {
    await publisher.connect()
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }

  var message:any = options.message as string;
  message = optionsSource.message === 'default' ? defaultMessage : message;

  if (count === 1) {
    for (var i=0; i<options.topic.length; i++) {
      publisher.publish(options.topic[i], message);
    } 
  } else {
    for (var iter=count ? count : 1, n=1;iter > 0;iter--, n++) {
      for (var i=0; i<options.topic.length; i++) {
        publisher.publish(options.topic[i], message);
      }
      if (interval) await delay(interval)
    }
  }

  publisher.disconnect();
}

const publisher = (options: MessageClientOptions, optionsSource: any) => {
  const { helpExamples, save, saveTo } = options

  if (helpExamples) {
    displayHelpExamplesForPublish()
    process.exit(0);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkPubTopicExists(options.topic);

  // check save options
  checkSaveParameters(options);

  if (save || saveTo) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }

  // if subscriptions are specified, remove the default subscription at pos-0
  checkForCliTopics('topic', options, optionsSource);

  if (options.stdin) {
    Logger.ctrlDToPublish();
    process.stdin.pipe(
      concat((data) => {
        options.message = data.toString().slice(0, -1)
        optionsSource.message = 'cli'
        publish(options, optionsSource)
      }),
    )
  } else {
    publish(options, optionsSource)
  }
}

export default publisher

export { publisher }
