import { signale, basicLog } from '../utils/signale'
import { checkSubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { prettifyXml } from '../utils/prettifyXml'
import { SolaceClient } from '../common/solace-client'
import { prettyPrint } from '@base2/pretty-print-object';

const validateConfig = (filePath: string, config: Config) => {
  const data = config['sub']
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    signale.error(`No configuration for 'sub' found in ${filePath}`)
    process.exit(1)
  }
}

const receive = async (
  options: ClientOptions
) => {
  const subscriber = new SolaceClient(options);
  await subscriber.connect();
  subscriber.subscribe(options, printMessage);
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    subscriber.exit();
  });
}

const prettyJSON = (str: string) => {
  try {
      var obj = JSON.parse(str);
      return prettyPrint(obj, {
        indent: '  ',
        singleQuotes: false
      });
  } catch (e) {
      return false;
  }
  return true;
}

const prettyXML = (str: string, indent: number) => {
  if (str.startsWith('<')) {
    var result = prettifyXml(str, {indent: indent, newline: '\n'});
    return result;
  } else
    return str;
}

const printMessage = (message:any, mode:any, level: any) => {
  if (mode === 'pretty') {
    // signale.log('Will do pretty print .. later!')
    basicLog.messageReceived(message.getDestination());
    basicLog.messageProperties(message.dump(0))
    var payload = message.getBinaryAttachment();
    var prettyPayload = prettyJSON(payload);
    if (prettyPayload)
      basicLog.messagePayload(prettyPayload);
    else
      basicLog.messagePayload(prettyXML(payload.trimStart(), 2));
  } else {
    basicLog.messageReceived(message.getDestination());
    var payload = message.getBinaryAttachment();
    level === 'PROPS' && basicLog.messageProperties(message.dump(0));
    level === 'PAYLOAD' && basicLog.messagePayload(payload.trim());
    level === 'ALL' && basicLog.messageRecvDump(message.dump(0), payload.trim());
  }
}

const sub = (options: ClientOptions) => {
  const { save, view, config } = options

  if (typeof view === 'string') {
    options = loadConfig('sub', view);
    basicLog.printConfig('sub', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('sub', 'stm-cli-config.json');
    basicLog.printConfig('sub', options);
    process.exit(0);

  }

  if (save && options) {
    basicLog.printConfig('sub', options);
    saveConfig('sub', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('sub', config);
    basicLog.printConfig('sub', options);
  }

  // fixup topic-queue conflict
  if (options.queue) options.topic = false;

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkSubTopicExists(options.topic, options.queue);

  receive(options);
}

export default sub

export { sub }
