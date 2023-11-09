const os = require('os');

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const defaultMetaKeys = [
  'config',
  'name',
  'from',
  'to',
  'save',
  'saveTo'
]

export const defaultMessageHint = JSON.stringify({
  osType: "OS_TYPE",
  freeMem: "FREE_MEM",
  totalMem: "TOTAL_MEM",
  timeZone: "TIME_ZONE"
})
export const defaultMessage = {
  osType: os.type(),
  freeMem: os.freemem(),
  totalMem: os.totalmem(),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export const defaultRequestMessageHint = JSON.stringify({
  osType: "boolean",
  freeMem: "boolean",
  totalMem: "boolean",
  timeZone: "boolean",
})
export const defaultRequestMessage = {
  osType: true,
  freeMem: true,
  totalMem: true,
  timeZone: true
}

export const getDefaultTopic = (commandType: CommandType) => {
  switch (commandType) {
    case 'publish': return 'stm/cli/topic';
    case 'receive': return 'stm/cli/topic';
    case 'request': return 'stm/cli/request';
    case 'reply': return 'stm/cli/request';
  }
}

export const getDefaultClientName = () => {
  return `stm_${Math.random().toString(16).substring(2, 10)}`
}
export const defaultConfigFile = 'stm-cli-config.json'

export const commandConnection = 'connection'
export const commandPublish = 'publish'
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
export const baseCommands = [ commandConnection, commandPublish, commandReceive, commandReply,
                              commandSempConnection, commandQueue, commandAclProfile, commandClientUsername,
                              commandGroupMessage, commandGroupManage ]

export const getCommandGroup = (command:any) => {
  if ([ commandConnection, commandPublish, commandReceive, commandRequest, commandReply].includes(command))
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


  // connection settings
  compressionLevel: 0,
  connectTimeoutInMsecs: 3000,
  connectRetries: 3,
  connectRetriesPerHost: 3,
  generateReceiveTimestamps: false,
  generateSendTimestamps: false,
  generateSequenceNumber: false,
  ignoreDuplicateSubscriptionError: true,
  ignoreSubscriptionNotFoundError: true,
  includeSenderId: false,
  keepAliveIntervalInMsecs: 3000,
  keepAliveIntervalsLimit: 3,
  readTimeoutInMsecs: 10000,
  reapplySubscriptions: false,
  reconnectRetries: 3,
  reconnectRetryWaitInMsecs: 3000,
  sendBufferMaxSize: 65536,
  // log level
  logLevel: 'ERROR',

  // place holders
  config: '',
  from: '',
  to: '',
  save: false,
  saveTo: false
}

export const defaultMessageConfig:any = {
  acknowledgeImmediately: false,
  applicationMessageId: undefined,
  applicationMessageType: undefined,
  asReplyMessage: false,
  correlationId: undefined,
  correlationKey: undefined,
  deliveryMode: 0,  // DIRECT
  // destination:  NOT CONSIDERED, as we want o support only Message to TOPICS
  dmqEligible: true,
  elidingEligible: false,
  priority: undefined,
  replyTo: undefined,
  // senderId:  NOT CONSIDERED as we want the session includeSenderId to cover this
  // senderTimeStamp: NOT CONSIDERED as we want thr generateSendTimestamps to cover this
  // sequenceNumber: NOT CONSIDERED as we want thr generateSequenceNumber to cover this
  timeToLive: undefined,
  // userCos: NOT CONSIDERED
  // userData: NOT CONSIDERED
  userPropertyMap: undefined,
}

export const defaultMessagePublishConfig:any = {
  ...defaultMessageConfig,
  count: 1,
  interval: 3000,
  clientName: undefined,
  description: 'Publish application created via Solace Try-Me CLI',
  stdin: false,
  topic: [ getDefaultTopic('publish') ],
  message: defaultMessageHint,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'PER_MESSAGE',
  acknowledgeTimeoutInMsecs: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,
  outputMode: 'COMPACT',

  command: 'publish',
  name: 'publish',
}

export const defaultMessageReceiveConfig:any = {
  ...defaultMessageConfig,
  count: 1,
  interval: 3000,
  clientName: undefined,
  description: 'Receive application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('publish') ],
  message: defaultMessageHint,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'AUTO',
  acknowledgeTimeoutInMsecs: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,
  outputMode: 'COMPACT',
  
  command: 'receive',
  name: 'receive',
}

export const defaultMessageRequestConfig:any = {
  clientName: undefined,
  description: 'Request application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('request') ],
  message: defaultRequestMessageHint,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'PER_MESSAGE',
  acknowledgeTimeoutInMsecs: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,
  outputMode: 'COMPACT',

  command: 'request',
  name: 'request',
}

export const defaultMessageReplyConfig:any = {
  clientName: undefined,
  description: 'Reply application created via Solace Try-Me CLI',

  topic: [ getDefaultTopic('reply') ],
  message: defaultRequestMessageHint,
  queue: undefined,
  createIfMissing: undefined,

  acknowledgeMode: 'PER_MESSAGE',
  acknowledgeTimeoutInMsecs: 2000,
  enabled: false, // guaranteed publisher
  windowSize: 50,
  outputMode: 'COMPACT',

  command: 'reply',
  name: 'reply',
}

export const defaultManageConnectionConfig:any = {
  // CONNECTION
  sempUrl: 'http://localhost:8080',
  sempVpn: 'default',
  sempUsername: 'admin',
  sempPassword: 'admin',

  // place holders
  config: '',
  from: '',
  to: '',
  save: false,
  saveTo: false,

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
  owner: "",
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
  addSubscriptions: [ getDefaultTopic('publish') ],
  removeSubscriptions: [],
  listSubscriptions: false,
  
  operation: 'CREATE',
  command: 'queue',
  name: 'queue',
}

export const defaultManageAclProfileConfig:any = {
  aclProfile: 'stm-acl-profile',
  clientConnectDefaultAction: "allow",
  publishTopicDefaultAction: "allow",
  subscribeTopicDefaultAction: "allow",

  operation: 'CREATE',
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


  operation: 'CREATE', 
  command: 'client-profile',
  name: 'client-profile',
}

export const defaultManageClientUsernameConfig:any = {
  clientUsername: 'stm-client',
  aclProfile: "stm-acl-profile",
  clientProfile: "stm-client-profile",
  enabled: true,
  clientPassword: "",

  operation: 'CREATE',
  command: 'client-username',
  name: 'client-username',
}

export const getDefaultConfig = (commandType:any) => {
  switch (commandType) {
    case 'publish': return defaultMessagePublishConfig
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
    case 'publish': return "Publish Application"
    case 'receive': return "Receive Application"
    case 'request': return "Request Application"
    case 'reply': return "Reply Application"
    case 'sempconnection': return "Manage VPN SEMP connection settings"
    case 'queue': return "Manage Queue command"
    case 'client-profile': return "Manage Client Profile command"
    case 'acl-profile': return "Manage ACL Profile command"
    case 'client-username': return "Manage Client Username command"
  }
}
