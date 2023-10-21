import * as fs from 'fs'
import path from 'path'
import { Signal } from './logger'
import { 
  defaultUrl,
  defaultBroker,
  defaultUserName,
  defaultPassword,
  defaultPublishTopic,
  defaultSubscribeTopic,
  defaultRequestTopic,
  defaultMessage,
  defaultPublisherDescription,
  defaultReceiverDescription,
  defaultReplierDescription,
  defaultCount,
  defaultInterval,
  defaultLogLevel
} from './defaults'

const defaultPath = `${process.cwd()}/stm-cli-config.json`

const fileExists = (filePath: string) => fs.existsSync(filePath)

const writeFile = (filePath: string, data: Config) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    Signal.error(error)
    process.exit(1)
  }
}

const readFile = (path: string) => {
  try {
    const config = fs.readFileSync(path, 'utf-8')
    return JSON.parse(config) as Config
  } catch (error) {
    Signal.error(error)
    process.exit(1)
  }
}

const mergeConfig = (oldConfig: Config, newConfig: Config) => Object.assign({}, oldConfig, newConfig)

const processPath = (savePath: boolean | string) => {
  let filePath = ''
  if (savePath === true) {
    filePath = defaultPath
  } else if (typeof savePath === 'string') {
    filePath = path.normalize(savePath)
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(filePath)
    }
    filePath = filePath.concat(savePath.endsWith('.json') ? '' : '.json');
  }
  return filePath
}

const removeUselessOptions = (
  opts:ClientOptions    
) => {
  const { save, view, config, ...rest } = opts

  rest.clientName && rest.clientName.startsWith('stm_') && delete rest.clientName;
  
  return rest
}

const parseClientOptions = (
  opts: ClientOptions
) => {
  const {
    url,
    vpn,
    username,
    password,
    connectionTimeout,
    connectionRetries,
    reconnectRetries,
    reconnectRetryWait,
    keepAlive,
    keepAliveIntervalLimit,
    readTimeout,
    sendTimestamps,
    includeSenderId,
    generateSequenceNumber,
    sendBufferMaxSize,
    guaranteedPublisher,
    windowSize,
    receiveTimestamps,
    reapplySubscriptions,
    acknowledgeTimeout,
    acknowledgeMode,
    logLevel,
  } = opts;
  const {
    count,
    interval,
    clientName,
    description,
    topic,
    queue,
    createIfMissing,
    addSubscription,
    message,
    stdin,
    timeToLive,
    dmqEligible,
    messageId,
    messageType,
    correlationId,
    correlationKey,
    deliveryMode,
    replyToTopic,
    userProperties,
    pretty,
    dumpMessage,
  } = opts;

  return (
    {
      "connection": {
        url,
        vpn,
        username,
        password,
        connectionTimeout,
        connectionRetries,
        reconnectRetries,
        reconnectRetryWait,
        keepAlive,
        keepAliveIntervalLimit,
        readTimeout,
        sendTimestamps,
        includeSenderId,
        generateSequenceNumber,
        sendBufferMaxSize,
        guaranteedPublisher,
        windowSize,
        receiveTimestamps,
        reapplySubscriptions,
        acknowledgeTimeout,
        acknowledgeMode,
        logLevel,
      },
      "operation": {
        count,
        interval,
        clientName,
        description,
        topic,
        queue,
        createIfMissing,
        addSubscription,
        message,
        stdin,
        timeToLive,
        dmqEligible,
        messageId,
        messageType,
        correlationId,
        correlationKey,
        deliveryMode,
        replyToTopic,
        userProperties,
        pretty,
        dumpMessage,
      }
    }
  )
}

const compareConnectionConfiguration = (updated: any, current: any) => {
  let count:number = 0;
  if (current.url && updated.url && updated.url !== current.url) console.log(`[${++count}] URL changed: ${current.url} => ${updated.url}`)
  if (current.vpn && updated.vpn && updated.vpn !== current.vpn) console.log(`[${++count}] VPN changed: ${current.vpn} => ${updated.vpn}`)
  if (current.username && updated.username && updated.username !== current.username) console.log(`[${++count}] Username changed: ${current.username} => ${updated.username}`)
  if (current.password && updated.password && updated.password !== current.password) console.log(`[${++count}] Password changed: ${current.password} => ${updated.password}`)
  if (current.connectionTimeout && updated.connectionTimeout && updated.connectionTimeout !== current.connectionTimeout) console.log(`[${++count}] Connection Timeout changed: ${current.connectionTimeout} => ${updated.connectionTimeout}`)
  if (current.connectionRetries && updated.connectionRetries && updated.connectionRetries !== current.connectionRetries) console.log(`[${++count}] Connection Retries changed: ${current.connectionRetries} => ${updated.connectionRetries}`)
  if (current.reconnectRetries && updated.reconnectRetries && updated.reconnectRetries !== current.reconnectRetries) console.log(`[${++count}] Reconnect Retries changed: ${current.reconnectRetries} => ${updated.reconnectRetries}`)
  if (current.reconnectRetryWait && updated.reconnectRetryWait && updated.reconnectRetryWait !== current.reconnectRetryWait) console.log(`[${++count}] Reconnect Retry Wait changed: ${current.reconnectRetryWait} => ${updated.reconnectRetryWait}`)
  if (current.keepAlive && updated.keepAlive && updated.keepAlive !== current.keepAlive) console.log(`[${++count}] KeepAlive changed: ${current.keepAlive} => ${updated.keepAlive}`)
  if (current.keepAliveIntervalLimit && updated.keepAliveIntervalLimit && updated.keepAliveIntervalLimit !== current.keepAliveIntervalLimit) console.log(`[${++count}] KeepAlive Interval Limit changed: ${current.keepAliveIntervalLimit} => ${updated.keepAliveIntervalLimit}`)
  if (current.readTimeout && updated.readTimeout && updated.readTimeout !== current.readTimeout) console.log(`[${++count}] Read Timeout changed: ${current.readTimeout} => ${updated.readTimeout}`)
  if (current.sendTimestamps && updated.sendTimestamps && updated.sendTimestamps !== current.sendTimestamps) console.log(`[${++count}] Send Timestamps changed: ${current.sendTimestamps} => ${updated.sendTimestamps}`)
  if (current.includeSenderId && updated.includeSenderId && updated.includeSenderId !== current.includeSenderId) console.log(`[${++count}] Include SenderID changed: ${current.includeSenderId} => ${updated.includeSenderId}`)
  if (current.generateSequenceNumber && updated.generateSequenceNumber && updated.generateSequenceNumber !== current.generateSequenceNumber) console.log(`[${++count}] Generate Sequence Number changed: ${current.generateSequenceNumber} => ${updated.generateSequenceNumber}`)
  if (current.sendBufferMaxSize && updated.sendBufferMaxSize && updated.sendBufferMaxSize !== current.sendBufferMaxSize) console.log(`[${++count}] Send Buffer Max Size changed: ${current.sendBufferMaxSize} => ${updated.sendBufferMaxSize}`)
  if (current.guaranteedPublisher && updated.guaranteedPublisher && updated.guaranteedPublisher !== current.guaranteedPublisher) console.log(`[${++count}] Guaranteed Publisher changed: ${current.guaranteedPublisher} => ${updated.guaranteedPublisher}`)
  if (current.windowSize && updated.windowSize && updated.windowSize !== current.windowSize) console.log(`[${++count}] Window Size changed: ${current.windowSize} => ${updated.windowSize}`)
  if (current.receiveTimestamps && updated.receiveTimestamps && updated.receiveTimestamps !== current.receiveTimestamps) console.log(`[${++count}] Receive Timestamps changed: ${current.receiveTimestamps} => ${updated.receiveTimestamps}`)
  if (current.reapplySubscriptions && updated.reapplySubscriptions && updated.reapplySubscriptions !== current.reapplySubscriptions) console.log(`[${++count}] Reapply Subscriptions changed: ${current.reapplySubscriptions} => ${updated.reapplySubscriptions}`)
  if (current.acknowledgeTimeout && updated.acknowledgeTimeout && updated.acknowledgeTimeout !== current.acknowledgeTimeout) console.log(`[${++count}] Acknowledge Timeout changed: ${current.acknowledgeTimeout} => ${updated.acknowledgeTimeout}`)
  if (current.acknowledgeMode && updated.acknowledgeMode && updated.acknowledgeMode !== current.acknowledgeMode) console.log(`[${++count}] Acknowledge Mode changed: ${current.acknowledgeMode} => ${updated.acknowledgeMode}`)
  if (current.logLevel && updated.logLevel && updated.logLevel !== current.logLevel) console.log(`[${++count}] Log Level changed: ${current.logLevel} => ${updated.logLevel}`)

  return count;
}

const validateConfig = (commandType: CommandType, filePath: string, config: Config) => {
  const data = config[commandType]
  if (!config || typeof config !== 'object' || Object.keys(config).length === 0) {
    Signal.error(`Invalid configuration file ${filePath}`)
    process.exit(1)
  }

  if (!config.connection) {
    Signal.error(`Missing connection in file ${filePath}`)
    process.exit(1)
  }

  if (!config[commandType]) {
    Signal.error(`No configuration for ${commandType} found in ${filePath}`)
    process.exit(1)
  }

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    Signal.error(`No configuration for ${commandType} found in ${filePath}`)
    process.exit(1)
  }
}

const enrichConfiguration = (
  config: Config,
  commandType: CommandType
) => {
  var opts:ClientOptions = { ...config[commandType], ...config.connection } as ClientOptions
  if (!opts.url) opts.url = defaultUrl
  if (!opts.vpn) opts.vpn = defaultBroker
  if (!opts.username) opts.username = defaultUserName
  if (!opts.password) opts.password = defaultPassword
  if (!opts.topic) opts.topic = (commandType === 'publisher') ? defaultPublishTopic : 
                                  (commandType === 'requestor' ? defaultRequestTopic : 
                                    [ defaultSubscribeTopic ])
  if (!opts.message) opts.message = defaultMessage
  if (!opts.description && commandType === 'publisher') opts.description = defaultPublisherDescription
  if (!opts.description && commandType === 'receiver') opts.description = defaultReceiverDescription
  if (!opts.description && commandType === 'requestor') opts.description = defaultReplierDescription
  if (!opts.count) opts.count = defaultCount
  if (!opts.interval) opts.interval = defaultInterval
  if (!opts.logLevel) opts.logLevel = defaultLogLevel
  return opts;
}


const saveConfig = (
  commandType: CommandType,
  opts: ClientOptions
) => {
  try {
    const filePath = processPath(opts.save!)
    if (!filePath.endsWith('.json')) filePath.concat('.json')
    const parsedData:any = parseClientOptions(opts)
    let data:any = {}
    data[commandType] = removeUselessOptions(parsedData.operation)
    data["connection"] = parsedData.connection;
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      if (compareConnectionConfiguration(data.connection, config.connection) > 0) {
        var prompt = require('prompt-sync')();
        var confirmation = prompt('Changes detected in the connection settings, do you want to overwrite (y/n):');
        if (!['Y', 'YES'].includes(confirmation.toUpperCase()))
          process.exit(0);
      }
      data = mergeConfig(config, data)
    }
    writeFile(filePath, data)
    Signal.success(`Configurations saved to ${filePath}`)
  } catch (error) {
    Signal.error(error)
    process.exit(1)
  }
}

function loadConfig(commandType: 'publisher', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'receiver', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'requestor', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'replier', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: CommandType, loadPath: boolean | string) {
  try {
    const filePath = processPath(loadPath)
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      validateConfig(commandType, filePath, config)
      return enrichConfiguration(config, commandType)      
    } else {
      Signal.error(`Configuration file ${filePath} not found`)
      process.exit(1)
    }
  } catch (error) {
    Signal.error(error)
    process.exit(1)
  }
}

export { saveConfig, loadConfig }

export default saveConfig