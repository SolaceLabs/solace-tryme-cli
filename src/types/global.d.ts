import solace = require('solclientjs')

declare global {

  type CommandType = 'send' | 'receive' | 'request' | 'reply' | 
                      'queue' | 'client-profile' | 'acl-profile' | 'client-username' |
                      'connection' | 'sempconnection' | 'all'

  type OperationType = 'LIST' | 'LIST_ITEM' | 'CREATE' | 'UPDATE' | 'DELETE'

  type PublisherAcknowledgeMode = solace.MessagePublisherAcknowledgeMode.PER_MESSAGE | solace.MessagePublisherAcknowledgeMode.WINDOWED

  type MessageConsumerAcknowledgeMode = solace.MessageConsumerAcknowledgeMode.AUTO | solace.MessageConsumerAcknowledgeMode.CLIENT

  type MessageDeliveryModeType = solace.MessageDeliveryModeType.DIRECT | solace.MessageDeliveryModeType.NON_PERSISTENT | solace.MessageDeliveryModeType.PERSISTENT

  type OutputMode = 'pretty' | 'compact'

  interface StmConfigOptions {
    // broker connect options
    url: string | undefined
    vpn: string | undefined
    username: string | undefined
    password: string | undefined
    
    // semp connect options
    sempUrl: string | undefined
    sempVpn: string | undefined
    sempUsername: string | undefined
    sempPassword: string | undefined

    // file/command options
    config: string | undefined
    name: string | undefined

    // help examples
    helpExamples?: boolean
  }

  interface MessageConnectionOptions {
    connectionTimeout?: number
    connectionRetries?: number

    reconnectRetries?: number
    reconnectRetryWait?: number

    keepalive?: number
    keepaliveIntervalLimit?: number

    readTimeout?: number

    sendTimestamps?: boolean
    includeSenderId?: boolean
    generateSequenceNumber?: boolean
    sendBufferMaxSize?: number
    guaranteedPublisher?: boolean

    windowSize?: number

    receiveTimestamps?: boolean
    reapplySubscriptions?: boolean
    
    acknowledgeTimeout?: number
    acknowledgeMode?: PublisherAcknowledgeMode | MessageConsumerAcknowledgeMode

    logLevel?: string
    visualization?: string | boolean
    visualizationPort?: number
  }

  interface MessageOperationOptions {
    // operation
    command: CommandType

    // misc.
    count?: number
    interval?: number
    clientName?: string
    description?: string

    // topic
    topic: string[] | any

    // messaging operation options
    queue: any
    createIfMissing: boolean | undefined
    file?: string | undefined
    message?: string | Buffer
    stdin?: boolean
    timeToLive?: number
    dmqEligible?: boolean
    partitionKey?: string
    partitionKeys?: string[] | any
    messageId?: string
    messageType?: string
    correlationKey?: string
    deliveryMode?: string
    replyToTopic?: string
    userProperties?: Record<string, string | string[]>

    waitBeforeExit?: number
    exitAfter?: number
    outputMode?: string
    traceVisualization?: boolean

    // Help Examples
    helpMore?: boolean
  }
  interface MessageInitOptions extends StmConfigOptions {
    [key: string]: any | undefined
  }

  interface MessageClientOptions extends StmConfigOptions, MessageConnectionOptions, MessageOperationOptions {
    [key: string]: any | undefined
  }
  
    
  interface ManageConnectionOptions {
    // connect options
    // already captured in StmConfigOptions
  }

  interface ManageOperationOptions {
    // operation
    command: CommandType
    list?: string | boolean
    create?: string | boolean
    update?: string | boolean
    delete?: string | boolean
    save?: string | boolean
    operation?: OperationType

    // QUEUE
    queue?: string
    owner?: string
    addSubscriptions?: string | string[] | any
    removeSubscriptions?: string | string[] | any
    listSubscriptions?: boolean
    accessType?: string
    deadMessageQueue?: boolean
    deliveryCountEnabled?: boolean
    deliveryDelay?: number
    egressEnabled?: boolean
    ingressEnabled?: boolean
    maxMsgSize?: number
    maxMsgSpoolUsage?: number
    maxRedeliveryCount?: number
    partitionCount?: number
    partitionRebalanceDelay?: number
    partitionRebalanceMaxHandoffTime?: number
    permission?: string
    redeliveryEnabled?: boolean
    respectTtlEnabled?: boolean

    // ACL Profile
    aclProfileName?: string
    clientConnectDefaultAction?: string
    publishTopicDefaultAction?: string
    subscribeTopicDefaultAction?: string
  
    // Client Profile
    clientProfileName?: string
    allowGuaranteedEndpointCreateDurability?: string
    allowGuaranteedEndpointCreateEnabled?: boolean
    allowGuaranteedMsgReceiveEnabled?: boolean
    allowGuaranteedMsgSendEnabled?: boolean
    compressionEnabled?: boolean
    elidingEnabled?: boolean
    maxEgressFlowCount?: number
    maxIngressFlowCount?: number
    maxSubscriptionCount?: number
    rejectMsgToSenderOnNoSubscriptionMatchEnabled?: boolean

    // Client Username
    // aclProfileName - already present in the ACL Profile
    // clientProfileName - already present in the Client Profile
    clientUsername?: string
    enabled?: boolean
    clientPassword?: string

    // Help Examples
    helpMore?: boolean
    helpExamples?: boolean
  }
  interface ManageInitOptions extends StmConfigOptions {
    [key: string]: any | undefined
  }

  interface ManageClientOptions extends StmConfigOptions, ManageConnectionOptions, ManageOperationOptions {
    [key: string]: any | undefined
  }

}

export { }
