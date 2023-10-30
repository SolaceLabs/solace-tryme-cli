import solace = require('solclientjs')

declare global {

  type CommandType = 'publish' | 'receive' | 'request' | 'reply' | 
                      'queue' | 'client-profile' | 'acl-profile' | 'client-username' |
                      'connection' | 'sempconnection'

  type SempOperationType = 'CREATE' | 'UPDATE' | 'DELETE'

  type PublisherAcknowledgeMode = solace.MessagePublisherAcknowledgeMode.PER_MESSAGE | solace.MessagePublisherAcknowledgeMode.WINDOWED

  type MessageConsumerAcknowledgeMode = solace.MessageConsumerAcknowledgeMode.AUTO | solace.MessageConsumerAcknowledgeMode.CLIENT

  type OutputMode = 'pretty' | 'default'

  interface SempConnectionOptions {
    // connect options
    sempUrl: string
    sempVpn: string
    sempUsername: string
    sempPassword: string
    
  }

  interface SempOperationOptions {
    // operation
    operation: CommandType

    // QUEUE
    addSub: boolean
    removeSub: boolean

    queueName?: string
    accessType?: string
    addSubscriptions?: string | string[] | any
    removeSubscriptions?: string | string[] | any
    deadMessageQueue?: string
    deliveryCountEnabled?: string
    egressEnabled?: string
    ingressEnabled?: string
    respectTtlEnabled?: string
    redeliveryEnabled?: string
    maxRedeliveryCount?: number
    partitionCount?: number
    partitionRebalanceDelay?: number
    partitionRebalanceMaxHandoffTime?: number
    nonOwnerPermission?: string
    
    // Help Examples
    helpExamples?: boolean
  }
  
  interface ConnectionOptions {
    // connect options
    url: string
    vpn: string
    username: string
    password: string

    connectionTimeout?: number
    connectionRetries?: number

    reconnectRetries?: number
    reconnectRetryWait?: number

    keepAlive?: number
    keepAliveIntervalLimit?: number

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
  }
   
  interface OperationOptions {
    // operation
    mode: CommandType

    // misc.
    count?: number
    interval?: number
    clientName?: string
    description?: string

    // topic info
    topic: string | string[] | any
    queue: any
    createIfMissing: boolean

    // publish options
    message?: string | Buffer
    stdin?: boolean
    timeToLive?: number
    dmqEligible?: boolean
    messageId?: string
    messageType?: string
    correlationKey?: string
    deliveryMode?: string
    replyToTopic?: string
    userProperties?: Record<string, string | string[]>

    // Receiver options
    replyMessage?: string | Buffer
    pretty?: boolean

    // Help Examples
    helpExamples?: boolean
  }
  interface ConfigOptions {
    // config options
    save?: boolean | string
    view?: boolean | string
    update?: boolean | string
    exec?: boolean | string
  }
  interface ClientOptions extends SempConnectionOptions, SempOperationOptions, ConnectionOptions, OperationOptions, ConfigOptions {
    [key: string]: any | undefined
  }

  type Config = {
    [key in CommandType]?:
      | ClientOptions
  }

}

export { }
