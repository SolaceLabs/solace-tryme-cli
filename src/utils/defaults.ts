import solace from "solclientjs";

const os = require('os');

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const defaultMetaKeys = [
  'config',
  'name',
  'save',
]

export const defaultMessageHint = JSON.stringify({
  osType: "OS_TYPE",
  freeMem: "FREE_MEM",
  totalMem: "TOTAL_MEM",
  dateTime: "DATE_TIME"
})

export const getDefaultMessage = () => {
  return {
    osType: os.type(),
    freeMem: os.freemem(),
    totalMem: os.totalmem(),
    dateTime: (new Date()).toISOString()
  }
}

export const defaultRequestMessageHint = JSON.stringify({
  osType: "boolean",
  freeMem: "boolean",
  totalMem: "boolean",
  dateTime: "boolean",
})
export const defaultRequestMessage = {
  osType: true,
  freeMem: true,
  totalMem: true,
  dateTime: true
}

export const getDefaultTopic = (commandType: CommandType) => {
  switch (commandType) {
    case 'send': return 'solace/try/me';
    case 'receive': return 'solace/try/me';
    case 'request': return 'solace/try/me/request';
    case 'reply': return 'solace/try/me/request';
  }
}

export const getDefaultClientName = (type: string) => {
  return `stm_${type}_${Math.random().toString(16).substring(2, 10)}`
}
export const defaultLastVersionCheck = 'stm-cli-last-version-check'
export const defaultConfigFile = 'stm-cli-config.json'

export const commandConnection = 'connection'
export const commandSend = 'send'
export const commandReceive = 'receive'
export const commandRequest = 'request'
export const commandReply = 'reply'
export const commandSempConnection = 'sempconnection'
export const commandQueue = 'queue'
export const commandClientProfile = 'client-profile'
export const commandAclProfile = 'acl-profile'
export const commandClientUsername = 'client-username'
export const commandGroupMessage = 'message'
export const commandGroupManage = 'manage'
export const commandGroupUnknown = 'unknown'
export const baseCommands = [ commandConnection, commandSend, commandReceive, commandRequest, commandReply,
                              commandSempConnection, commandQueue, commandAclProfile, commandClientProfile, commandClientUsername,
                              commandGroupMessage, commandGroupManage ]
export const messagingCommands = [ commandSend, commandReceive, commandRequest, commandReply ]
export const manageCommands = [ commandQueue, commandAclProfile, commandClientProfile, commandClientUsername ]

export const getCommandGroup = (command:any) => {
  if ([ commandConnection, commandSend, commandReceive, commandRequest, commandReply].includes(command))
    return 'message'
  else if ([ commandSempConnection, commandQueue, commandClientProfile, commandAclProfile, commandClientUsername].includes(command))
    return 'manage'
  return 'unknown'
}

export const defaultMessageConnectionConfig:any = {
  // CONNECTION
  url: 'ws://localhost:8008',
  vpn: 'default',
  username: 'default',
  password: 'default',
  command: 'connection',
  name: 'connection',
  visualization: 'off',
  visualizationPort: 0,


  // connection settings
  compressionLevel: 0,
  connectionTimeout: 3000,
  connectionRetries: 3,
  connectRetriesPerHost: 3,
  generateReceiveTimestamps: false,
  generateSendTimestamps: false,
  generateSequenceNumber: false,
  ignoreDuplicateSubscriptionError: true,
  ignoreSubscriptionNotFoundError: true,
  includeSenderId: false,
  keepAliveInterval: 3000,
  keepAliveIntervalLimit: 3,
  readTimeout: 10000,
  reapplySubscriptions: true,
  reconnectRetries: 3,
  reconnectRetryWait: 3000,
  sendBufferMaxSize: 65536,
  // log level
  logLevel: 'ERROR',

  // place holders
  config: '',
  save: false,
}

export const defaultMessageConfig:any = {
  // acknowledgeImmediately: false,
  appMessageId: undefined,
  appMessageType: undefined,
  asReplyMessage: false,
  correlationId: undefined,
  correlationKey: undefined,
  deliveryMode: 'PERSISTENT',
  // destination:  NOT CONSIDERED, as we want o support only Message to TOPICS
  dmqEligible: false,
  partitionKeysCount: undefined,
  partitionKeys: [],
  elidingEligible: false,
  priority: undefined,
  replyToTopic: undefined,
  timeout: 5000,
  // senderId:  NOT CONSIDERED as we want the session includeSenderId to cover this
  // senderTimeStamp: NOT CONSIDERED as we want thr generateSendTimestamps to cover this
  // sequenceNumber: NOT CONSIDERED as we want thr generateSequenceNumber to cover this
  timeToLive: undefined,
  // userCos: NOT CONSIDERED
  // userData: NOT CONSIDERED
  userPropertyMap: undefined,
  payloadType: "text",
  outputMode: 'DEFAULT',
  pretty: false
}

export const defaultMessagePublishConfig:any = {
  ...defaultMessageConfig,
  count: 1,
  interval: 1000,
  initialDelay: 0,
  clientName: undefined,
  description: 'Publish application created via Solace Try-Me CLI',
  stdin: false,
  topic: [ getDefaultTopic('send') ],
  message: undefined,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'WINDOWED',
  acknowledgeImmediately: false,
  acknowledgeTimeout: 2000,
  enabled: true, // guaranteed publisher
  guaranteedPublisher: true,
  windowSize: 50,

  command: 'send',
  name: 'send',
}

export const defaultMessageReceiveConfig:any = {
  ...defaultMessageConfig,
  count: 1,
  interval: 3000,
  clientName: undefined,
  description: 'Receive application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('send') ],
  message: undefined,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'AUTO',
  acknowledgeTimeout: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,
  
  command: 'receive',
  name: 'receive',
}

export const defaultMessageRequestConfig:any = {
  count: 1,
  interval: 1000,

  clientName: undefined,
  description: 'Request application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('request') ],
  message: undefined,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'PER_MESSAGE',
  acknowledgeImmediately: false,
  acknowledgeTimeout: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,

  payloadType: "text",
  outputMode: 'DEFAULT',
  pretty: false,

  command: 'request',
  name: 'request',
}

export const defaultMessageReplyConfig:any = {
  clientName: undefined,
  description: 'Reply application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('reply') ],
  message: undefined,
  file: undefined,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'PER_MESSAGE',
  acknowledgeImmediately: false,
  acknowledgeTimeout: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,

  waitBeforeExit: 0,
  exitAfter: 0,
  traceVisualization: false,

  payloadType: "text",
  outputMode: 'DEFAULT',
  pretty: false,
  
  command: 'reply',
  name: 'reply',
}

export const defaultManageConnectionConfig:any = {
  // CONNECTION
  sempUrl: 'http://localhost:8080/SEMP/v2/config',
  sempVpn: 'default',
  sempUsername: 'admin',
  sempPassword: 'admin',

  // place holders
  config: '',
  save: false,
  description: 'SEMP manage application created via Solace Try-Me CLI',

  command: 'sempconnection',
  name: 'sempconnection',
}

export const defaultManageQueueConfig:any = {
  accessType: "exclusive",
  consumerAckPropagationEnabled: true,
  deadMsgQueue: "#DEAD_MSG_QUEUE",
  deliveryCountEnabled: false,
  deliveryDelay: 0,
  egressEnabled: true,
  ingressEnabled: true,
  maxBindCount: 1000,
  maxDeliveredUnackedMsgsPerFlow: 10000,
  maxMsgSize: 10000000,
  maxMsgSpoolUsage: 5000,
  maxRedeliveryCount: 0,
  maxTtl: 0,
  owner: "default",
  partitionCount: 0,
  partitionRebalanceDelay: 5,
  partitionRebalanceMaxHandoffTime: 3,
  permission: "consume",
  queue: 'stm-queue',
  redeliveryDelayEnabled: false,
  redeliveryDelayInitialInterval: 1000,
  redeliveryDelayMaxInterval: 64000,
  redeliveryDelayMultiplier: 200,
  redeliveryEnabled: true,
  rejectLowPriorityMsgEnabled: false,
  rejectLowPriorityMsgLimit: 0,
  rejectMsgToSenderOnDiscardBehavior: "when-queue-enabled",
  respectMsgPriorityEnabled: false,
  respectTtlEnabled: false,
  addSubscriptions: [ getDefaultTopic('send') ],
  removeSubscriptions: [],
  listSubscriptions: false,
  
  // operations
  operation: "CREATE",
  
  command: 'queue',
  name: 'queue',
}

export const defaultManageAclProfileConfig:any = {
  aclProfile: 'stm-acl-profile',
  clientConnectDefaultAction: "allow",
  publishTopicDefaultAction: "allow",
  subscribeTopicDefaultAction: "allow",

  // operations
  operation: "CREATE",
  
  command: 'acl-profile',
  name: 'acl-profile',
}

export const defaultManageClientProfileConfig:any = {
  clientProfile: 'stm-client-profile',
  allowGuaranteedEndpointCreateDurability: 'all',
  allowGuaranteedEndpointCreateEnabled: true,
  allowGuaranteedMsgReceiveEnabled: true,
  allowGuaranteedMsgSendEnabled: true,
  compressionEnabled: true,
  elidingEnabled: true,
  maxEgressFlowCount: 1000,
  maxIngressFlowCount: 1000,
  maxSubscriptionCount: 256,
  rejectMsgToSenderOnNoSubscriptionMatchEnabled: true,


  // operations
  operation: "CREATE",
  
  command: 'client-profile',
  name: 'client-profile',
}

export const defaultManageClientUsernameConfig:any = {
  clientUsername: 'stm-client',
  aclProfile: "stm-acl-profile",
  clientProfile: "stm-client-profile",
  enabled: true,
  clientPassword: "",

  // operations
  operation: "CREATE",
  
  command: 'client-username',
  name: 'client-username',
}

export const defaultFeedConfig:any = {
  feedName: "stm-asyncapi_feed",
  feedType: "asyncapi",
  communityFeed: false,
  fileName: "",
  eventNames: [],
  communityOnly: true,
  localOnly: true,
  verbose: false,
  uiPortal: false,
  managePort: 0
}

export const getDefaultConfig = (commandType:any) => {
  switch (commandType) {
    case 'send': return defaultMessagePublishConfig
    case 'receive': return defaultMessageReceiveConfig
    case 'request': return defaultMessageRequestConfig
    case 'reply': return defaultMessageReplyConfig
    case 'queue': return defaultManageQueueConfig
    case 'client-profile': return defaultManageClientProfileConfig
    case 'acl-profile': return defaultManageAclProfileConfig
    case 'client-username': return defaultManageClientUsernameConfig
    case 'connection': return defaultMessageConnectionConfig
    case 'sempconnection': return defaultManageConnectionConfig
  }
  return undefined
}

export const getCommandDescription = (commandType:any) => {
  switch (commandType) {
    case 'connection': return "VPN connection settings"
    case 'send': return "Send Message"
    case 'receive': return "Receive Message"
    case 'request': return "Send Request Message"
    case 'reply': return "Send Reply Message"
    case 'sempconnection': return "Manage VPN SEMP connection settings"
    case 'queue': return "Manage Queue command"
    case 'client-profile': return "Manage Client Profile command"
    case 'acl-profile': return "Manage ACL Profile command"
    case 'client-username': return "Manage Client Username command"
  }
}

export const getType = (message:solace.Message) => {
  switch (message.getType()) {
    case 0: return 'BINARY';
    case 1: return 'MAP';
    case 2: return 'STREAM';
    case 3: return 'TEXT';
    default: return 'UNKNOWN';
  }
}

export const homedir = require('os').homedir();
export const defaultStmHome = `${homedir}/.stm`
export const defaultStmFeedsHome = `${defaultStmHome}/feeds`
export const defaultStmTempFeedsHome = `${defaultStmHome}/feeds/tmp`
export const defaultFeedAnalysisFile = 'analysis.json'
export const defaultFakerRulesFile = 'fakerrules.json'
export const defaultFeedInfoFile = 'feedinfo.json'
export const defaultFeedRulesFile = 'feedrules.json'
export const defaultFeedSchemasFile = 'feedschemas.json'
export const defaultEventFeedsFile = 'EVENT_FEEDS.json'
export const defaultFeedApiEndpointFile = 'feedapi.json'
export const defaultGitRepo = 'https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main';
export const defaultGitFeedRepo = 'https://github.com/solacecommunity/solace-event-feeds/tree/main';
export const defaultProjectName = 'solace-tryme-cli'
export const communityRepoUrl = 'https://github.com/solacecommunity/solace-event-feeds';
export const supportedFeedTypes = [ 'asyncapi_feed', 'restapi_feed' ]; //, 'custom_feed'