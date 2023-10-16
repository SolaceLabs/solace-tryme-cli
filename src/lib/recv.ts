import { stmLog } from '../utils/logger'
import { checkSubTopicExists, checkConnectionParamsExists } from '../utils/parse'
import { saveConfig, loadConfig } from '../utils/config'
import { prettyXML, prettyJSON } from '../utils/prettify'
import { SolaceClient } from '../common/solace-client'

const receive = async (
  options: ClientOptions
) => {
  const receiver = new SolaceClient(options);
  await receiver.connect();
  receiver.subscribe(options, printMessage);
  process.stdin.resume();
  process.on('SIGINT', function () {
    'use strict';
    receiver.exit();
  });
}
const printMessage = (message:any, pretty:boolean) => {
  if (pretty) {
    // signale.log('Will do pretty print .. later!')
    stmLog.messageReceived(message.getDestination());
    stmLog.messageProperties(message.dump(0))
    var payload = message.getBinaryAttachment();
    var prettyPayload = prettyJSON(payload);
    if (prettyPayload)
      stmLog.messagePayload(prettyPayload);
    else
      stmLog.messagePayload(prettyXML(payload.trimStart(), 2));
  } else {
    stmLog.messageReceived(message.getDestination());
    var payload = message.getBinaryAttachment();
    stmLog.messageRecvDump(message.dump(0), payload.trim());
  }
}

const recv = (options: ClientOptions) => {
  const { save, view, config } = options

  if (typeof view === 'string') {
    options = loadConfig('recv', view);
    stmLog.printConfig('recv', options);
    process.exit(0);
  } else if (typeof view === 'boolean') {
    options = loadConfig('recv', 'stm-cli-config.json');
    stmLog.printConfig('recv', options);
    process.exit(0);

  }

  if (save && options) {
    stmLog.printConfig('recv', options);
    saveConfig('recv', options);
    process.exit(0);
  }

  if (config) {
    options = loadConfig('recv', config);
    stmLog.printConfig('recv', options);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  // check publish topic found
  checkSubTopicExists(options);

  receive(options);
}

export default recv

export { recv }
