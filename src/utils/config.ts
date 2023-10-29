import * as fs from 'fs'
import path from 'path'
import { Logger } from './logger'
import defaults from './defaults'

const defaultPath = `${process.cwd()}/stm-cli-config.json`

const fileExists = (filePath: string) => fs.existsSync(filePath)

const writeFile = (filePath: string, data: Config) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error: any) {
    Logger.logDetailedError('error: file write failed - ', error.toString())
    if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const readFile = (path: string) => {
  try {
    const config = fs.readFileSync(path, 'utf-8')
    return JSON.parse(config) as Config
  } catch (error: any) {
    Logger.logDetailedError('error: read write failed - ', error.toString())
    if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    Logger.error('Exiting...')
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

const parseClientOptions = (
  opts: ClientOptions
) => {
  const { // connection
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
  const { // operation
    count,
    interval,
    clientName,
    description,
    topic,
    queue,
    createIfMissing,
    createSubscriptions,
    message,
    stdin,
    timeToLive,
    dmqEligible,
    messageId,
    messageType,
    correlationKey,
    deliveryMode,
    replyToTopic,
    userProperties,
    pretty,
  } = opts;
  const { // sempconnection
    sempUrl,
    sempVpn,
    sempUsername,
    sempPassword,
  } = opts;
  const { // sempoperation
    operation,
    queueName,
    accessType,
    addSubscriptions,
    removeSubscriptions,
    deadMessageQueue,
    deliveryCountEnabled,
    egressEnabled,
    ingressEnabled,
    respectTtlEnabled,
    redeliveryEnabled,
    maxRedeliveryCount,
    partitionCount,
    partitionRebalanceDelay,
    partitionRebalanceMaxHandoffTime,
    nonOwnerPermission    
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
        createSubscriptions,
        message,
        stdin,
        timeToLive,
        dmqEligible,
        messageId,
        messageType,
        correlationKey,
        deliveryMode,
        replyToTopic,
        userProperties,
        pretty,
      },
      "sempconnection": {
        sempUrl,
        sempVpn,
        sempUsername,
        sempPassword
      },
      "sempoperation": {
        operation,
        queueName,
        accessType,
        addSubscriptions,
        removeSubscriptions,
        deadMessageQueue,
        deliveryCountEnabled,
        egressEnabled,
        ingressEnabled,
        respectTtlEnabled,
        redeliveryEnabled,
        maxRedeliveryCount,
        partitionCount,
        partitionRebalanceDelay,
        partitionRebalanceMaxHandoffTime,
        nonOwnerPermission    
      }
    }
  )
}

const compareSempConnectionConfiguration = (updated: any, current: any) => {
  let count:number = 0;
  if (current.sempUrl && updated.sempUrl && updated.sempUrl !== current.sempUrl) console.log(`[${++count}] URL changed: ${current.sempUrl} => ${updated.sempUrl}`)
  if (current.sempVpn && updated.sempVpn && updated.sempVpn !== current.sempVpn) console.log(`[${++count}] VPN changed: ${current.sempVpn} => ${updated.sempVpn}`)
  if (current.sempUsername && updated.sempUsername && updated.sempUsername !== current.sempUsername) console.log(`[${++count}] Username changed: ${current.sempUsername} => ${updated.sempUsername}`)
  if (current.sempPassword && updated.sempPassword && updated.sempPassword !== current.sempPassword) console.log(`[${++count}] Password changed: ${current.sempPassword} => ${updated.sempPassword}`)

  return count;
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

const validateSempConfig = (commandType: CommandType, filePath: string, config: Config) => {
  const data = config[commandType]
  if (!config || typeof config !== 'object' || Object.keys(config).length === 0) {
    Logger.logDetailedError(`error: invalid configuration file - `, `${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!config.sempconnection) {
    Logger.logDetailedError(`error: missing connection configuration in file - `, `${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!config[commandType]) {
    Logger.logDetailedError(`error: missing configuration for - `, `${commandType} in ${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    Logger.logDetailedError(`error: missing configuration for - `, `${commandType} in ${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const validateConfig = (commandType: CommandType, filePath: string, config: Config) => {
  const data = config[commandType]
  if (!config || typeof config !== 'object' || Object.keys(config).length === 0) {
    Logger.logDetailedError(`error: invalid configuration file - `, `${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!config.hasOwnProperty('connection')) {
    Logger.logDetailedError(`error: missing connection configuration in file - `, `${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!config.hasOwnProperty(commandType)) {
    Logger.logDetailedError(`error: missing configuration for - `, `${commandType} in ${filePath}`)
    Logger.error('Exiting...')
    process.exit(1)
  }

  // if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
  //   Logger.logDetailedError(`error: missing configuration for - `, `${commandType} in ${filePath}`)
  //   Logger.error('Exiting...')
  //   process.exit(1)
  // }
}

const enrichConfiguration = (
  config: Config,
  commandType: CommandType
) => {
  var opts:ClientOptions = { ...config[commandType], ...config.connection } as ClientOptions
  if (!opts.url) opts.url = defaults.url
  if (!opts.vpn) opts.vpn = defaults.vpn
  if (!opts.username) opts.username = defaults.username
  if (!opts.password) opts.password = defaults.password
  if (!opts.topic) {
    switch (commandType) {
      case 'publish': opts.topic = defaults.publishTopic; break;
      case 'receive': opts.topic = [ defaults.subscribeTopic ]; break;
      case 'request': opts.topic = defaults.requestTopic; break;
      case 'reply': opts.topic = [ defaults.requestTopic ]; break;
    }
  }
  if (!opts.message) opts.message = defaults.message
  if (!opts.description && commandType === 'publish') opts.description = defaults.publisherDescription
  if (!opts.description && commandType === 'receive') opts.description = defaults.receiverDescription
  if (!opts.description && commandType === 'request') opts.description = defaults.requestorDescription
  if (!opts.description && commandType === 'reply') opts.description = defaults.replierDescription
  if (!opts.count) opts.count = defaults.count
  if (!opts.interval) opts.interval = defaults.interval
  if (!opts.logLevel) opts.logLevel = defaults.logLevel
  return opts;
}

const enrichSempConfiguration = (
  config: Config,
  commandType: CommandType
) => {
  var opts:ClientOptions = { ...config[commandType], ...config.sempconnection } as ClientOptions
  return opts;
}

const removeDefaultOptions = (
  opts: ClientOptions,
) => {
  const defaultKeys = Object.keys(defaults);
  for (var i=0; i<defaultKeys.length; i++) {
    if (opts[defaultKeys[i]]) delete opts[defaultKeys[i]];
  }
  return opts;
}
const saveConfig = (
  commandType: CommandType,
  opts: ClientOptions,
  optsSource: any
) => {
  try {
    const sempOp = ['queue', 'client-profile', 'acl-profile', 'client-username'].includes(commandType);
    const filePath = processPath(opts.save!)
    if (!filePath.endsWith('.json')) filePath.concat('.json')

    // rid opts of default settings
    // Object.keys(optsSource).forEach((key:string) => {
    //   if (!optsSource[key] || optsSource[key] === 'default') {
    //     delete opts[key];
    //   }
    // })

    const parsedData:any = parseClientOptions(opts)
    let data:any = {}
    if (sempOp) {
      data["sempconnection"] = parsedData.sempconnection
      if (fileExists(filePath)) {
        const config = readFile(filePath)
        if (config.sempconnection && compareSempConnectionConfiguration(data.sempconnection, config.sempconnection) > 0) {
          var prompt = require('prompt-sync')();
          var confirmation = prompt('Changes detected in the connection settings, do you want to overwrite (y/n):');
          if (!['Y', 'YES'].includes(confirmation.toUpperCase()))
            Logger.success('Exiting...')
            process.exit(0);
        }
        data[commandType] = parsedData.sempoperation;
        data = mergeConfig(config, data)
      }
    } else {
      parsedData.operation.clientName && parsedData.operation.clientName.startsWith('stm_') && delete parsedData.operation.clientName;
      data["connection"] = parsedData.connection;
      if (fileExists(filePath)) {
        const config = readFile(filePath)
        if (config.connection && compareConnectionConfiguration(data.connection, config.connection) > 0) {
          var prompt = require('prompt-sync')();
          var confirmation = prompt('Changes detected in the connection settings, do you want to overwrite (y/n):');
          if (!['Y', 'YES'].includes(confirmation.toUpperCase()))
            Logger.success('Exiting...')
            process.exit(0);
        }
        data[commandType] = parsedData.operation;
        data = mergeConfig(config, data)
      }
    }
    writeFile(filePath, data)
    Logger.logSuccess(`Configurations saved to ${filePath}`)
  } catch (error: any) {
    Logger.logDetailedError('error: file write failed - ', error.toString())
    if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const updateConfig = (
  commandType: CommandType,
  opts: ClientOptions,
  optsSource: any
) => {
  try {
    const sempOp = ['queue', 'client-profile', 'acl-profile', 'client-username'].includes(commandType);
    const filePath = processPath(opts.update!)
    if (!filePath.endsWith('.json')) filePath.concat('.json')

    // rid opts of default settings
    // Object.keys(optsSource).forEach((key:string) => {
    //   if (!optsSource[key] || optsSource[key] === 'default') {
    //     delete opts[key];
    //   }
    // })
    
    const parsedData:any = parseClientOptions(opts)
    parsedData.operation.clientName && parsedData.operation.clientName.startsWith('stm_') && delete parsedData.operation.clientName;
    let data:any = {}
    if (sempOp) {
      data["sempconnection"] = parsedData.sempconnection
      if (fileExists(filePath)) {
        const config = readFile(filePath)
        if (config.sempconnection && compareSempConnectionConfiguration(data.sempconnection, config.sempconnection) > 0) {
          var prompt = require('prompt-sync')();
          var confirmation = prompt('Changes detected in the connection settings, do you want to overwrite (y/n):');
          if (!['Y', 'YES'].includes(confirmation.toUpperCase()))
            Logger.success('Exiting...')
            process.exit(0);
        }
        data[commandType] = parsedData.sempoperation;
        data = mergeConfig(config, data)
      }
    } else {
      data["connection"] = parsedData.connection;
      if (fileExists(filePath)) {
        const config = readFile(filePath)
        if (compareConnectionConfiguration(data.connection, config.connection) > 0) {
          var prompt = require('prompt-sync')();
          var confirmation = prompt('Changes detected in the connection settings, do you want to overwrite (y/n):');
          if (!['Y', 'YES'].includes(confirmation.toUpperCase()))
            Logger.success('Exiting...')
            process.exit(0);
        }
        data[commandType] = parsedData.operation;
        data = mergeConfig(config, data)
      }
    }
    writeFile(filePath, data)
    Logger.logSuccess(`Configurations saved to ${filePath}`)
  } catch (error: any) {
    Logger.logDetailedError('error: file write failed - ', error.toString())
    if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    Logger.error('Exiting...')
    process.exit(1)
  }
}

function loadConfig(commandType: 'publish', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'receive', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'request', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'reply', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'queue', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'client-profile', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'acl-profile', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'client-username', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: CommandType, loadPath: boolean | string) {
  try {
    const sempOp = ['queue', 'client-profile', 'acl-profile', 'client-username'].includes(commandType);
    const filePath = processPath(loadPath)
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      sempOp ?
        validateSempConfig(commandType, filePath, config) :
        validateConfig(commandType, filePath, config)
      return sempOp ? 
        enrichSempConfiguration(config, commandType) :
        enrichConfiguration(config, commandType)      
    } else {
      Logger.logDetailedError(`error: configuration file not found - `, `${filePath}`)
      Logger.error('Exiting...')
      process.exit(1)
    }
  } catch (error: any) {
    Logger.logDetailedError('error: file write failed - ', error.toString())
    if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    Logger.error('Exiting...')
    process.exit(1)
  }
}

export { saveConfig, updateConfig, loadConfig, parseClientOptions }

export default saveConfig