import solace = require('solclientjs')

declare global {

  type CommandType = 'publisher' | 'receiver' | 'requestor' | 'replier' | 'connection'

  // type DeliveryMode = solace.MessageDeliveryModeType.DIRECT | solace.MessageDeliveryModeType.PERSISTENT | solace.MessageDeliveryModeType.NON_PERSISTENT

  type PublisherAcknowledgeMode = solace.MessagePublisherAcknowledgeMode.PER_MESSAGE | solace.MessagePublisherAcknowledgeMode.WINDOWED

  type MessageConsumerAcknowledgeMode = solace.MessageConsumerAcknowledgeMode.AUTO | solace.MessageConsumerAcknowledgeMode.CLIENT

  type OutputMode = 'pretty' | 'default'

  // type LogLevel = solace.LogLevel.DEBUG | solace.LogLevel.ERROR | solace.LogLevel.WARN | solace.LogLevel.INFO | solace.LogLevel.DEBUG | solace.LogLevel.TRACE

  type FormatType = 'base64' | 'json' | 'hex'

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
    guaranteedRequestor?: boolean

    windowSize?: number

    receiveTimestamps?: boolean
    reapplySubscriptions?: boolean
    
    acknowledgeTimeout?: number
    acknowledgeMode?: PublisherAcknowledgeMode | MessageConsumerAcknowledgeMode

    logLevel?: string
  }
   
  type ConnectKeys = Pick<ClientOptions, keyof ConnectionOptions>; 

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
    addSubscription: boolean

    // publish options
    message?: string | Buffer
    stdin?: boolean
    timeToLive?: number
    dmqEligible?: boolean
    messageId?: string
    messageType?: string
    correlationId?: string
    correlationKey?: string
    deliveryMode?: string
    replyToTopic?: string
    userProperties?: Record<string, string | string[]>

    // Receiver options
    replyMessage?: string | Buffer
    pretty?: boolean
    dumpMessage?: boolean    

    // Help Examples
    helpExamples?: boolean
  }

  interface ConfigOptions {
    // config options
    save?: boolean | string
    view?: boolean | string
    config?: boolean | string
  }
  interface ClientOptions extends ConnectionOptions, OperationOptions, ConfigOptions {
  }

  type Config = {
    [key in CommandType]?:
      | ClientOptions
  }

}

export { }
