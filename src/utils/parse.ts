import * as fs from 'fs'
import signale from './logger'

const defaultMessage:string = 'Hello From Solace Try-Me CLI';

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
    signale.error('Not a valid user property.')
    process.exit(1)
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

const parseSubTopic = (value: object | string) => {
  if (!value) {
    signale.error("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    signale.error("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }

  return (typeof value === 'string') ? [ value ] : value;
}

const checkPubTopicExists = (topic: string | "stm/topic") => {
  if (!topic) {
    signale.error("error: required option '-t, --topic <TOPIC>' not specified")
    process.exit(1)
  }

  if (typeof topic !== 'string') {
    signale.error("error: invalid topic specified, a single topic name is expected")
    process.exit(1)
  }
}

const checkSubTopicExists = (options: ClientOptions) => {
  if (!options.topic && !options.queue) {
    signale.error("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (!options.queue && typeof options.topic !== 'object') {
    signale.error("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }

  if (!options.queue && options.createIfMissing) {
    signale.error("error: Create queue missing option is applicable only when you connect to a queue")
    process.exit(1)
  }

  options.addSubscription = options.queue && options.topic ? true : false;
}

const checkConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
                                      username: string | undefined, password: string | undefined) => {
  if (!url) {
    signale.error("error: required option '-U, --url <URL>' not specified")
    process.exit(1)
  }

  if (!vpn) {
    signale.error("error: required option '-v, --vpn <VPN>' not specified")
    process.exit(1)
  }

  if (!username) {
    signale.error("error: required option '-u, --username <USER>' not specified")
    process.exit(1)
  }

  if (!password) {
    signale.error("error: required option '-p, --password <PASS>' not specified")
    process.exit(1)
  }
}

export {
  defaultMessage,
  parseNumber,
  parseProtocol,
  parseLogLevel,
  parseUserProperties,
  parsePubTopic,
  parseSubTopic,
  parseDeliveryMode,
  // connection validation
  checkConnectionParamsExists,
  // publisher validation
  checkPubTopicExists,
  checkSubTopicExists,
}
