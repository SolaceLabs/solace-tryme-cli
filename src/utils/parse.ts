import * as fs from 'fs'
import { Signal } from './logger'
import { defaultRequestTopic, defaultPublishTopic } from './defaults'

const parseNumber = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    Signal.error(`${value} is not a number.`)
    process.exit(1)
  }
  return parsedValue
}

const parseProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['ws', 'wss', 'http', 'https', 'tcp', 'tcps'].includes(protocol)) {
    Signal.error('Only ws, wss, http, https, tcp, and tcps are supported.')
    process.exit(1)
  }
  return value
}

const parseLogLevel = (value: string) => {
  if (!['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(value)) {
    Signal.error('Only FATAL, ERROR, WARN, INFO, DEBUG, and TRACE are supported.')
    process.exit(1)
  }
  
  return value;
}

const parseDeliveryMode = (value: string) => {
  if (!['DIRECT', 'PERSISTENT', 'NON_PERSISTENT'].includes(value)) {
    Signal.error('Only DIRECT, PERSISTENT, and NON_PERSISTENT are supported.')
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
    Signal.error('Not a valid user property.')
    process.exit(1)
  }
}

const parseReplyTopic = (value: string) => {
  if (value.endsWith('/')) {
    Signal.error('Invalid topic - topic name cannot end with character /')
    process.exit(1)
  }
  return value
}


const parsePubTopic = (value: string) => {
  if (value.includes('*') || value.includes('>')) {
    Signal.error('You cannot publish the message to a Topic that contains wildcards characters *, >')
    process.exit(1)
  }
  if (value.endsWith('/')) {
    Signal.error('Invalid topic - topic name cannot end with character /')
    process.exit(1)
  }
  return value
}

// const parseUserProperties = (value: string, previous?: Record<string, string | string[]>) => {

const parseSubTopic = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Signal.error("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Signal.error("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }

  previous = previous?.length === 1 && previous[0] === defaultPublishTopic ? [] : previous;
  previous ? previous.push(value.toString()) : [ value ];
  return previous;
}

const checkPubTopicExists = (topic: string) => {
  if (!topic) {
    Signal.error("error: required option '-t, --topic <TOPIC>' not specified")
    process.exit(1)
  }

  if (typeof topic !== 'string') {
    Signal.error("error: invalid topic specified, a single topic name is expected")
    process.exit(1)
  }
}

const checkSubTopicExists = (options: ClientOptions) => {
  if (!options.topic && !options.queue) {
    Signal.error("error: required option '-t, --topic <TOPIC...>' not specified")
    process.exit(1)
  }

  if (!options.queue && typeof options.topic !== 'object') {
    Signal.error("error: invalid topic specified, one or more topic name is expected")
    process.exit(1)
  }

  if (!options.queue && options.createIfMissing) {
    Signal.error("error: Create queue missing option is applicable only when you connect to a queue")
    process.exit(1)
  }

  options.addSubscription = options.queue && options.topic ? true : false;
}

const checkConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
                                      username: string | undefined, password: string | undefined) => {
  if (!url) {
    Signal.error("error: required option '-U, --url <URL>' not specified")
    process.exit(1)
  }

  if (!vpn) {
    Signal.error("error: required option '-v, --vpn <VPN>' not specified")
    process.exit(1)
  }

  if (!username) {
    Signal.error("error: required option '-u, --username <USER>' not specified")
    process.exit(1)
  }

  if (!password) {
    Signal.error("error: required option '-p, --password <PASS>' not specified")
    process.exit(1)
  }
}

export {
  parseNumber,
  parseProtocol,
  parseLogLevel,
  parseUserProperties,
  parsePubTopic,
  parseSubTopic,
  parseReplyTopic,
  parseDeliveryMode,
  // connection validation
  checkConnectionParamsExists,
  // publisher validation
  checkPubTopicExists,
  checkSubTopicExists,
}
