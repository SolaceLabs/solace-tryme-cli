import { Faker } from '@faker-js/faker'
import solace = require('solclientjs')

declare global {
  type CommandType = 'pub' | 'sub'

  // type DeliveryMode = solace.MessageDeliveryModeType.DIRECT | solace.MessageDeliveryModeType.PERSISTENT | solace.MessageDeliveryModeType.NON_PERSISTENT

  type PublisherAcknowledgeMode = solace.MessagePublisherAcknowledgeMode.PER_MESSAGE | solace.MessagePublisherAcknowledgeMode.WINDOWED

  type OutputMode = 'pretty' | 'default'

  type DumpMode = 'PROPS' | 'PAYLOAD | ALL'

  // type LogLevel = solace.LogLevel.DEBUG | solace.LogLevel.ERROR | solace.LogLevel.WARN | solace.LogLevel.INFO | solace.LogLevel.DEBUG | solace.LogLevel.TRACE

  type FormatType = 'base64' | 'json' | 'hex'

  interface ConnectOptions {
    // connect options
    url: string
    vpn: string
    username: string
    password: string
    count: number
    interval: number
    clientName?: string
    description?: string

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
    acknowledgeMode?: PublisherAcknowledgeMode


    logLevel?: string
  }
   
  interface ClientOptions extends ConnectOptions {
    // operation
    mode: CommandType

    // topic info
    topic: any

    // publish options
    message: string | Buffer
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

    // subscriber options
    outputMode?: OutputMode
    dumpLevel?: DumpMode
    dumpMessage?: boolean
    
    // config options
    save?: boolean | string
    view?: boolean | string
    config?: boolean | string
  }

  interface Subscription {
    topic: string,
  }

  type Config = {
    [key in CommandType]?:
      | ClientOptions
  }

}

export { }
