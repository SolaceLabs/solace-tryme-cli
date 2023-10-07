import concat from 'concat-stream'
import { checkPubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { SolaceClient } from '../common/solace-client'
import { basicLog } from '../utils/signale'
import delay from '../utils/delay'

const send = async (
  options: ClientOptions
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  await publisher.connect();
  for (var iter=count;iter > 0;iter--) {
    publisher.publish(options.topic, options.message);
    if (delay) await delay(interval)
  }

  publisher.disconnect();
}

const pub = (options: ClientOptions) => {
  const { save, view, config } = options

  if (typeof view === 'string') {
    options = loadConfig('pub', view);
    basicLog.printConfig('pub', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('pub', 'stm-cli-config.json');
    basicLog.printConfig('pub', options);
    process.exit(0);

  }

  if (save && options) {
    basicLog.printConfig('pub', options);
    saveConfig('pub', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('pub', config);
    basicLog.printConfig('pub', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkPubTopicExists(options.topic);

  if (options.stdin) {
    basicLog.ctrlDToPublish();
    process.stdin.pipe(
      concat((data) => {
        options.message = data
        send(options)
      }),
    )
  } else {
    send(options)
  }
}

export default pub

export { pub }
