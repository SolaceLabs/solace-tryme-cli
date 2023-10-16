import concat from 'concat-stream'
import { checkPubTopicExists, checkConnectionParamsExists, defaultMessage } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { SolaceClient } from '../common/solace-client'
import { stmLog } from '../utils/logger'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const send = async (
  options: ClientOptions
) => {
  const { count, interval } = options;
  const publisher = new SolaceClient(options);
  await publisher.connect();
  let message = options.message as string;
  for (var iter=count, n=1;iter > 0;iter--, n++) {
    if (message === defaultMessage)
      publisher.publish(options.topic, message.concat(` [${n}]`));
    else
      publisher.publish(options.topic, message);

    if (delay) await delay(interval)
  }

  publisher.disconnect();
}

const pub = (options: ClientOptions) => {
  const { save, view, config } = options

  if (typeof view === 'string') {
    options = loadConfig('pub', view);
    stmLog.printConfig('pub', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('pub', 'stm-cli-config.json');
    stmLog.printConfig('pub', options);
    process.exit(0);

  }

  if (save && options) {
    stmLog.printConfig('pub', options);
    saveConfig('pub', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('pub', config);
    stmLog.printConfig('pub', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkPubTopicExists(options.topic);

  if (options.stdin) {
    stmLog.ctrlDToPublish();
    process.stdin.pipe(
      concat((data) => {
        options.message = data.toString().slice(0, -1)
        send(options)
      }),
    )
  } else {
    send(options)
  }
}

export default pub

export { pub }
