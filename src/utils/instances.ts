import solace from "solclientjs"

export class MessageClientOptionsEmpty implements StmConfigOptions, MessageConnectionOptions, MessageOperationOptions {
  url: string | undefined
  vpn: string | undefined
  username: string | undefined
  password: string | undefined
  sempUrl: string | undefined
  sempVpn: string | undefined
  sempUsername: string | undefined
  sempPassword: string | undefined
  config: string | undefined
  name: string | undefined
  save: boolean | string | undefined
  helpExamples?: boolean | undefined
  connectionTimeout?: number | undefined
  connectionRetries?: number | undefined
  reconnectRetries?: number | undefined
  reconnectRetryWait?: number | undefined
  keepalive?: number | undefined
  keepaliveIntervalLimit?: number | undefined
  readTimeout?: number | undefined
  sendTimestamps?: boolean | undefined
  includeSenderId?: boolean | undefined
  generateSequenceNumber?: boolean | undefined
  sendBufferMaxSize?: number | undefined
  guaranteedPublisher?: boolean | undefined
  windowSize?: number | undefined
  receiveTimestamps?: boolean | undefined
  reapplySubscriptions?: boolean | undefined
  acknowledgeTimeout?: number | undefined
  acknowledgeMode?: PublisherAcknowledgeMode | MessageConsumerAcknowledgeMode | undefined
  acknowledgeImmediately?: boolean | undefined
  logLevel?: string | undefined
  command: CommandType
  operation: OperationType
  count?: number | undefined
  interval?: number | undefined
  initialDelay?: number | undefined
  clientName?: string | undefined
  description?: string | undefined
  topic: any
  queue: any
  createIfMissing: boolean | undefined
  message?: string | Buffer | undefined
  defaultMessage?: boolean | undefined;
  emptyMessage?: boolean | undefined;
  file?: string | undefined
  stdin?: boolean | undefined
  timeToLive?: number | undefined
  dmqEligible?: boolean | undefined
  partitionKeysCount?: number | undefined
  partitionKeys?: any
  appMessageId?: string | undefined
  appMessageType?: string | undefined
  correlationId?: string | undefined
  correlationKey?: string | undefined
  deliveryMode?: string | undefined
  replyToTopic?: string | undefined
  userProperties?: Record<string, string | string[]> | undefined
  payloadType?: string | undefined
  outputMode?: string | undefined
  pretty?: boolean | undefined
  waitBeforeExit?: number | undefined;
  exitAfter?: number | undefined
  traceVisualization?: boolean | undefined;
  helpMore?: boolean | undefined
  visualization?: string | boolean | undefined
  visualizationPort?: number | undefined
  constructor(commandType: CommandType) {
    this.url = ""
    this.vpn = ""
    this.username = ""
    this.password = ""
    this.sempUrl = ""
    this.sempVpn = ""
    this.sempUsername = ""
    this.sempPassword = ""
    this.config = ""
    this.name = ""
    this.save = false
    this.helpExamples = false
    this.connectionTimeout = 1
    this.connectionRetries = 1
    this.reconnectRetries = 1
    this.reconnectRetryWait = 1
    this.keepalive = 1
    this.keepaliveIntervalLimit = 1
    this.readTimeout = 1
    this.sendTimestamps = false
    this.includeSenderId = false
    this.generateSequenceNumber = false
    this.sendBufferMaxSize = 1
    this.guaranteedPublisher = true
    this.windowSize = 1
    this.receiveTimestamps = false
    this.reapplySubscriptions = false
    this.acknowledgeTimeout = 1
    this.acknowledgeMode = (commandType === 'send') ? 
                              solace.MessagePublisherAcknowledgeMode.PER_MESSAGE :
                              solace.MessageConsumerAcknowledgeMode.AUTO
    this.acknowledgeImmediately = false;
    this.logLevel = ""
    this.command = commandType
    this.operation = "CREATE"
    this.count = 1
    this.interval = 1
    this.initialDelay = 0
    this.clientName = ""
    this.description = ""
    this.topic = []
    this.queue = ""
    this.createIfMissing = false
    this.message = ""
    this.defaultMessage = false;
    this.emptyMessage = false;
    this.file = ""
    this.stdin = false
    this.timeToLive = 1
    this.dmqEligible = false
    this.partitionKeysCount = 2;
    this.partitionKeys = []
    this.appMessageId = ""
    this.appMessageType = ""
    this.correlationKey = ""
    this.correlationId = ""
    this.deliveryMode = 'DIRECT'
    this.replyToTopic = ""
    this.userProperties = { "key": "value" }
    this.payloadType = "text/plain"
    this.outputMode = "FULL"
    this.pretty = false
    this.waitBeforeExit = 0;
    this.exitAfter = 0
    this.traceVisualization = false;
    this.helpMore = false
    this.visualization = false
    this.visualizationPort = 0
  }
}

export class ManageClientOptionsEmpty implements StmConfigOptions, ManageConnectionOptions, ManageOperationOptions {
  url: string | undefined
  vpn: string | undefined
  username: string | undefined
  password: string | undefined
  sempUrl: string | undefined
  sempVpn: string | undefined
  sempUsername: string | undefined
  sempPassword: string | undefined
  config: string | undefined
  name: string | undefined
  save: boolean | string | undefined
  helpExamples?: boolean | undefined
  command: CommandType
  operation: OperationType
  queue?: string | undefined
  owner?: string | undefined
  addSubscriptions?: any
  removeSubscriptions?: any
  listSubscriptions?: boolean | undefined;
  accessType?: string | undefined
  deadMessageQueue?: boolean | undefined
  deliveryCountEnabled?: boolean | undefined
  deliveryDelay?: number | undefined
  egressEnabled?: boolean | undefined
  ingressEnabled?: boolean | undefined
  maxMsgSize?: number | undefined
  maxMsgSpoolUsage?: number | undefined
  maxRedeliveryCount?: number | undefined
  partitionCount?: number | undefined
  partitionRebalanceDelay?: number | undefined
  partitionRebalanceMaxHandoffTime?: number | undefined
  permission?: string | undefined
  redeliveryEnabled?: boolean | undefined
  respectTtlEnabled?: boolean | undefined

  aclProfile?: string | undefined
  clientConnectDefaultAction?: string | undefined
  publishTopicDefaultAction?: string | undefined
  subscribeTopicDefaultAction?: string | undefined

  clientProfile?: string | undefined
  allowGuaranteedEndpointCreateDurability?: string | undefined
  allowGuaranteedEndpointCreateEnabled?: boolean | undefined
  allowGuaranteedMsgReceiveEnabled?: boolean | undefined
  allowGuaranteedMsgSendEnabled?: boolean | undefined
  compressionEnabled?: boolean | undefined
  elidingEnabled?: boolean | undefined
  maxEgressFlowCount?: number | undefined
  maxIngressFlowCount?: number | undefined
  maxSubscriptionCount?: number | undefined
  rejectMsgToSenderOnNoSubscriptionMatchEnabled?: boolean | undefined

  clientUsername?: string | undefined
  enabled?: boolean | undefined
  clientPassword?: string | undefined

  helpMore?: boolean | undefined
  constructor(commandType: CommandType) {
    this.url =  ""
    this.vpn =  ""
    this.username =  ""
    this.password =  ""
    this.sempUrl =  ""
    this.sempVpn =  ""
    this.sempUsername =  ""
    this.sempPassword =  ""
    this.config =  ""
    this.name =  ""
    this.save = false
    this.helpExamples =  false
    this.command =  commandType
    this.operation = "CREATE"
    this.queue =  ""
    this.owner = ""
    this.addSubscriptions =  []
    this.removeSubscriptions =  []
    this.listSubscriptions = false
    this.accessType =  ""
    this.deadMessageQueue =  false
    this.deliveryCountEnabled =  false
    this.deliveryDelay =  0
    this.egressEnabled =  false
    this.ingressEnabled =  false
    this.maxMsgSize =  0
    this.maxMsgSpoolUsage =  0
    this.maxRedeliveryCount =  0
    this.partitionCount =  0
    this.partitionRebalanceDelay =  0
    this.partitionRebalanceMaxHandoffTime =  0
    this.permission =  ""
    this.redeliveryEnabled =  false
    this.respectTtlEnabled =  false

    this.aclProfile = ""
    this.clientConnectDefaultAction = ""
    this.publishTopicDefaultAction = ""
    this.subscribeTopicDefaultAction = ""

    this.clientProfile = ""
    this.allowGuaranteedEndpointCreateDurability = ""
    this.allowGuaranteedEndpointCreateEnabled = true
    this.allowGuaranteedMsgReceiveEnabled = true
    this.allowGuaranteedMsgSendEnabled = true
    this.compressionEnabled = true
    this.elidingEnabled = true
    this.maxEgressFlowCount = 1000
    this.maxIngressFlowCount = 1000
    this.maxSubscriptionCount = 256
    this.rejectMsgToSenderOnNoSubscriptionMatchEnabled = true
  
    this.clientUsername = ""
    this.enabled = true
    this.clientPassword = ""

    this.helpMore =  false
  }
}

export class ManageFeedClientOptionsEmpty implements ManageFeedClientOptions {
  fileName: string
  outputPath: string
  outputName: string
  feedType: string
  feedView: string
  feedName: string
  useDefaults: boolean
  communityFeed: boolean
  eventNames: string[];
  communityOnly: boolean
  localOnly: boolean
  archiveFile: string
  uiPortal: boolean
  verbose: boolean

  managePort: number | undefined

  constructor() {
    this.fileName = "";
    this.outputPath = "";
    this.outputName = "";
    this.feedName = "";
    this.feedType = "";
    this.feedView = "default";
    this.useDefaults = false;
    this.communityFeed = false;
    this.eventNames = [];
    this.communityOnly = true;
    this.archiveFile = "";
    this.localOnly = true;
    this.verbose = false;
    this.uiPortal = false;
    this.managePort = 0;
  }
}
