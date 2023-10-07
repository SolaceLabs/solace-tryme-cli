import * as fs from 'fs'
import signale from '../utils/signale'

const parseNumber = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    signale.error(`${value} is not a number.`)
    process.exit(1)
  }
  return parsedValue
}

const parseProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['ws', 'wss', 'http', 'https', 'tcp', 'tcps'].includes(protocol)) {
    signale.error('Only ws, wss, http, https, tcp, and tcps are supported.')
    process.exit(1)
  }
  return value
}

const parseLogLevel = (value: string) => {
  if (!['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(value)) {
    signale.error('Only FATAL, ERROR, WARN, INFO, DEBUG, and TRACE are supported.')
    process.exit(1)
  }
  
  return value;
}

const parseDumpLevel = (value: string) => {
  if (!['PROPS', 'PAYLOAD', 'ALL'].includes(value)) {
    signale.error('Only PROPS, PAYLOAD and ALL are supported.')
    process.exit(1)
  }
  
  return value;
}


const parseDeliveryMode = (value: string) => {
  if (!['DIRECT', 'PERSISTENT', 'NON_PERSISTENT'].includes(value)) {
    signale.error('Only DIRECT, PERSISTENT, and NON_PERSISTENT are supported.')
    process.exit(1)
  }
  
  return value;
}


const parseUserProperties = (value: string, previous?: Record<string, string | string[]>) => {
  const [key, val] = value.split(': ')
  if (key && val) {
    if (!previous) {
      return { [key]: val }
    } else {
      if (previous[key]) {
        previous[key] = (previous[key] as string).concat(` ${val}`)
        return previous
      } else {
        return { ...previous, [key]: val }
      }
    }
  } else {
    signale.error('Not a valid user properties.')
    process.exit(1)
  }
}

const parseVariadicOfBooleanType = (value: string, previous: boolean[] | undefined) => {
  if (!['true', 'false'].includes(value)) {
    signale.error(`${value} is not a boolean.`)
    process.exit(1)
  } else {
    const booleanValue = value === 'true'
    return previous ? [...previous, booleanValue] : [booleanValue]
  }
}

const parsePubTopic = (value: string) => {
  if (value.includes('*') || value.includes('>')) {
    signale.error('You cannot publish the message to a Topic that contains wildcards characters *, >')
    process.exit(1)
  }
  if (value.endsWith('/')) {
    signale.error('Invalid topic - topic name cannot end with character /')
    process.exit(1)
  }
  return value
}

const parseSubTopic = (value: object | "stm/topic") => {
  if (!value) {
    console.log("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (typeof value !== 'object') {
    console.log("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }
}

const parseFormat = (value: string) => {
  if (!['base64', 'json', 'hex'].includes(value)) {
    signale.error('Not a valid format type.')
    process.exit(1)
  }
  return value
}

const parseOutputMode = (value: string) => {
  if (!['pretty', 'default'].includes(value)) {
    signale.error('Not a valid output mode.')
    process.exit(1)
  }
  return value
}

const parseClientOptions = (
  options: ClientOptions,
  commandType?: CommandType,
) => {
  // let pubOptions = parsePublishOptions(options);
  // let subOptions = parseSubscribeOptions(options);

  const {
    url,
    vpn,
    username,
    password,
    clientName,
    description,

    connectionTimeout,
    connectionRetries,

    reconnectRetries,
    reconnectRetryWait,

    keepAlive,
    keepAliveIntervalLimit,

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

    // publish options
    topic,
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
  } = options

  const clientOptions = {
    op: commandType,
    url,
    vpn,
    username,
    password,
    clientName,
    description,

    connectionTimeout,
    connectionRetries,

    reconnectRetries,
    reconnectRetryWait,

    keepAlive,
    keepAliveIntervalLimit,

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

    // publish options
    topic,
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
  }

  return clientOptions
}

const checkPubTopicExists = (topic: string | "stm/topic") => {
  if (!topic) {
    console.log("error: required option '-t, --topic <TOPIC>' not specified")
    process.exit(1)
  }

  if (typeof topic !== 'string') {
    console.log("error: invalid topic specified, a single topic name is expected")
    process.exit(1)
  }
}

const checkSubTopicExists = (topic: string[] | ["stm/topic"]) => {
  if (!topic) {
    console.log("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (typeof topic !== 'object') {
    console.log("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }
}

const checkConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
                                      username: string | undefined, password: string | undefined) => {
  if (!url) {
    console.log("error: required option '-U, --url <URL>' not specified")
    process.exit(1)
  }

  if (!vpn) {
    console.log("error: required option '-v, --vpn <VPN>' not specified")
    process.exit(1)
  }

  if (!username) {
    console.log("error: required option '-u, --username <USER>' not specified")
    process.exit(1)
  }

  if (!password) {
    console.log("error: required option '-p, --password <PASS>' not specified")
    process.exit(1)
  }
}

export {
  parseNumber,
  parseProtocol,
  parseLogLevel,
  parseDumpLevel,
  parseUserProperties,
  parseVariadicOfBooleanType,
  parsePubTopic,
  parseSubTopic,
  parseDeliveryMode,
  parseFormat,
  parseOutputMode,
  parseClientOptions,
  // connection validation
  checkConnectionParamsExists,
  // publisher validation
  checkPubTopicExists,
  checkSubTopicExists,
}
