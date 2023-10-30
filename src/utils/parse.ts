import { Logger } from './logger'
import defaults from './defaults'

const parseSempOperation = (value: string) => {
  if (!['CREATE', 'UPDATE', 'DELETE'].includes(value.toUpperCase())) {
    Logger.error(`error: only 'CREATE', 'UPDATE' and 'DELETE' operations are supported.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  
  return value;
}

const parseSempQueueAccessType = (value: string) => {
  if (!['EXCLUSIVE', 'NON-EXCLUSIVE'].includes(value.toUpperCase())) {
    Logger.error(`error: only 'EXCLUSIVE' and 'NON-EXCLUSIVE' are supported.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  
  return value;
}

const parseSempNonOwnerPermission = (value: string) => {
  if (!['no-access', 'read-only', 'consume', 'modify-topic', 'delete'].includes(value.toLowerCase())) {
    Logger.error(`error: only 'no-access', 'read-only', 'consume', 'modify-topic' and 'delete' are supported.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  
  return value;
}

const parseBoolean = (value: string) => {
  if (!['true', 'false'].includes(value.toLowerCase())) {
    Logger.error(`error: only true or false are supported.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase() == 'true';
}

const parseNumber = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    Logger.error(`error: ${value} is not a number.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  return parsedValue
}

const parseProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['ws', 'wss', 'http', 'https', 'tcp', 'tcps'].includes(protocol.toLowerCase())) {
    Logger.error('error: only ws, wss, http, https, tcp, and tcps are supported.')
    Logger.error('Exiting...')
    process.exit(1)
  }
  return value
}

const parseSempProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['http', 'https'].includes(protocol.toLowerCase())) {
    Logger.error('error: only http and https are supported.')
    Logger.error('Exiting...')
    process.exit(1)
  }
  return value
}
const parseLogLevel = (value: string) => {
  if (!['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(value.toUpperCase())) {
    Logger.error(`error: only 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', and 'TRACE' are supported.`)
    Logger.error('Exiting...')
    process.exit(1)
  }
  
  return value;
}

const parseDeliveryMode = (value: string) => {
  if (!['DIRECT', 'PERSISTENT', 'NON_PERSISTENT'].includes(value.toUpperCase())) {
    Logger.error(`error: only 'DIRECT', 'PERSISTENT', and 'NON_PERSISTENT' are supported.`)
    Logger.error('Exiting...')
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
    Logger.error('error: not a valid user property.')
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const parseReplyTopic = (value: string) => {
  if (value.endsWith('/')) {
    Logger.error('error: invalid topic - topic name cannot end with character /')
    Logger.error('Exiting...')
    process.exit(1)
  }
  return value
}


const parsePubTopic = (value: string) => {
  if (value.includes('*') || value.includes('>')) {
    Logger.error('error: cannot publish the message to a Topic that contains wildcards characters *, >')
    Logger.error('Exiting...')
    process.exit(1)
  }
  if (value.endsWith('/')) {
    Logger.error('error: invalid topic - topic name cannot end with character /')
    Logger.error('Exiting...')
    process.exit(1)
  }
  return value
}

const parseSubTopic = (value: string, previous: string[] | undefined) => {
  // if (!value) {
  //   Logger.error("error: required option '--topic <TOPIC...>' not specified")
  //   Logger.error('Exiting...')
  //   process.exit(1)
  // }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.error("error: invalid topic specified, one or more topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }

  previous = previous?.length === 1 && previous[0] === defaults.publishTopic ? [] : previous;
  previous ? previous.push(value.toString()) : [ value ];
  return previous;
}

const parseSempQueueTopics = (value: string, previous: string[] | undefined) => {
  if (!value) return;

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.error("error: invalid topic specified, one or more topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }

  previous = previous?.length === 1 && previous[0] === defaults.publishTopic ? [] : previous;
  previous ? previous.push(value.toString()) : [ value ];
  return previous;
}

const checkPubTopicExists = (topic: string) => {
  if (!topic) {
    Logger.error("error: required option '--topic <TOPIC>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (typeof topic !== 'string') {
    Logger.error("error: invalid topic specified, a single topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkSubTopicExists = (options: ClientOptions) => {
  if (!options.topic && !options.queue) {
    Logger.error("error: required option '--topic <TOPIC...>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!options.queue && typeof options.topic !== 'object') {
    Logger.error("error: invalid topic specified, one or more topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!options.queue && options.createIfMissing) {
    Logger.error("error: create queue missing option is applicable only when you connect to a queue")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkSempQueueSubscriptionTopicExists = (options: ClientOptions) => {
  if (!options.addSubscriptions.length && !options.removeSubscriptions.length) return;

  if (options.addSubscriptions && typeof options.addSubscriptions !== 'object') {
    Logger.error("error: invalid add subscription topic specified, one or more topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }
  if (options.addSubscriptions.length > 1 && options.addSubscriptions.includes( defaults.subscribeTopic ))
    options.addSubscriptions.splice(options.addSubscriptions.indexOf(defaults.subscribeTopic), 1)
  options.addSub = options.addSubscriptions.length ? true : false;

  if (options.removeSubscriptions.length && typeof options.removeSubscriptions !== 'object') {
    Logger.error("error: invalid remove subscription topic specified, one or more topic name is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }
  if (options.removeSubscriptions.includes( defaults.subscribeTopic ))
    options.removeSubscriptions.splice(options.removeSubscriptions.indexOf(defaults.subscribeTopic), 1)
  options.removeSub = options.removeSubscriptions.length ? true : false;

  if (options.removeSub && options.operation.toUpperCase() === 'CREATE') {
    Logger.error("error: remove subscription option is not applicable while creating a queue")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkSempQueuePartitionSettings = (options: ClientOptions) => {
  if (options.partitionCount === undefined && options.partitionRebalanceDelay === undefined && 
      options.partitionRebalanceMaxHandoffTime === undefined) return;

  if (options.partitionCount && options.accessType && options.accessType.toUpperCase() === 'EXCLUSIVE') {
    Logger.error("error: partitioned queue settings are applicable only on queues with non-exclusive access type")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
  username: string | undefined, password: string | undefined) => {
    if (!url) {
      Logger.error("error: required option '-U, --url <URL>' not specified")
      Logger.error('Exiting...')
      process.exit(1)
    }

    if (!vpn) {
      Logger.error("error: required option '-v, --vpn <VPN>' not specified")
      Logger.error('Exiting...')
      process.exit(1)
    }

    if (!username) {
      Logger.error("error: required option '-u, --username <USER>' not specified")
      Logger.error('Exiting...')
      process.exit(1)
    }

    if (!password) {
      Logger.error("error: required option '-p, --password <PASS>' not specified")
      Logger.error('Exiting...')
      process.exit(1)
  }
}

const checkSempConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
                                      username: string | undefined, password: string | undefined) => {
  if (!url) {
    Logger.error("error: required option '-SU, --semp-url <URL>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!vpn) {
    Logger.error("error: required option '-sv, --semp-vpn <VPN>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!username) {
    Logger.error("error: required option '-su, --semp-username <USER>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!password) {
    Logger.error("error: required option '-sp, --semp-password <PASS>' not specified")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkSempQueueParamsExists = (options: ClientOptions) => {
  if (!options.operation) {
    Logger.error("error: missing parameter, --operation CREATE, UPDATE or DELETE is expected")
    Logger.error('Exiting...')
    process.exit(1)
  }

  if (!options.queueName) {
    Logger.error("error: missing queue name")
    Logger.error('Exiting...')
    process.exit(1)
  }
}

const checkPersistenceParams = (options: ClientOptions) => {
  const { save, view, update, exec } = options
  var count = 0;
  count += save ? 1 : 0;
  count += view ? 1 : 0;
  count += update ? 1 : 0;
  count += exec ? 1 : 0;
  return count;
}

export {
  parseBoolean,
  parseNumber,
  parseProtocol,
  parseSempProtocol,
  parseLogLevel,
  parseUserProperties,
  parsePubTopic,
  parseSubTopic,
  parseReplyTopic,
  parseDeliveryMode,
  // semp
  parseSempOperation,
  parseSempQueueAccessType,
  parseSempNonOwnerPermission,
  parseSempQueueTopics,

  // connection validation
  checkConnectionParamsExists,
  checkSempConnectionParamsExists,

  // persistence command validation
  checkPersistenceParams,

  // semp operation validation
  checkSempQueueParamsExists,
  checkSempQueueSubscriptionTopicExists,
  checkSempQueuePartitionSettings,
  
  // publisher validation
  checkPubTopicExists,
  checkSubTopicExists,
}
