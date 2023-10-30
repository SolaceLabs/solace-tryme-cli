const defaults = {
  count: 1,
  dmqEligible: false,
  sendTimestamps: false,
  includeSenderId: false,
  generateSequenceNumber: false,
  guaranteedPublisher: false,
  receiveTimestamps: false,
  reapplySubscriptions: false,
  createIfMissing: false,
  deadMessageQueue: '#DEAD_MSG_QUEUE',
  deliveryCountEnabled: false,
  egressEnabled: true,
  ingressEnabled: true,
  interval: 1000,
  logLevel: 'ERROR',
  maxRedeliveryCount: 3,
  message: 'Hello from Solace Try-Me CLI Publisher',
  nonOwnerPermission: 'no-access',
  partitionCount: 0,
  partitionRebalanceDelay: 5,
  partitionRebalanceMaxHandoffTime: 3,
  password: 'default',
  publisherDescription: 'Publisher created via Solace Try-Me CLI',
  publishTopic: 'stm/cli/topic',
  receiverDescription: 'Receiver created via Solace Try-Me CLI',
  redeliveryEnabled: true,
  replierDescription: 'Replier created via Solace Try-Me CLI',
  replyMessage: 'Hello reply from Solace Try-Me CLI Replier',
  requestMessage: 'Hello request from Solace Try-Me CLI Requestor',
  requestorDescription: 'Requestor created via Solace Try-Me CLI',
  requestTopic: 'stm/cli/request',
  respectTtlEnabled: false,
  sempPassword: 'admin',
  sempUrl: 'http://localhost:8080',
  sempUsername: 'admin',
  sempVpn: 'default',
  subscribeTopic: 'stm/cli/topic',
  url: 'ws://localhost:8008',
  username: 'default',
  vpn: 'default',

  // dummy holders
  topic: '',
  description: '',
}

export const getDefaultTopic = (commandType: CommandType) => {
  switch (commandType) {
    case 'publish': return defaults.publishTopic; break;
    case 'receive': return defaults.subscribeTopic; break;
    case 'request': return defaults.requestTopic; break;
    case 'reply': return defaults.requestTopic; break;
  }
}

export const getDefaultClientName = () => {
  return `stm_${Math.random().toString(16).substring(2, 10)}`
}

export default defaults;
