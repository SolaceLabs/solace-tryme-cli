import { Logger } from './logger'

export const helpOptions = [ '-h', '--help', '-hm', '--help-more', '-he', '--help-examples']

export const checkMissingValue = (value: string, error: string | undefined) => {
  if (value && (helpOptions.includes(value) || value.startsWith('--'))) {
    Logger.logError(error ? error : `missing or invalid option value`)
    Logger.logError('exiting...')
    process.exit(1)

  }
}

export const parseBoolean = (value: string) => {
  if (!['true', 'false'].includes(value.toLowerCase())) {
    Logger.logError(`only true or false are supported.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase() == 'true';
}

export const parseNumber = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    Logger.logError(`${value} is not a number.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  return parsedValue
}

export const parseMessageProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['ws', 'wss', 'http', 'https', 'tcp', 'tcps'].includes(protocol.toLowerCase())) {
    Logger.logError('only ws, wss, http, https, tcp, and tcps are supported.')
    Logger.logError('exiting...')
    process.exit(1)
  }
  return value.toLowerCase()
}

export const parseManageProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['http', 'https'].includes(protocol.toLowerCase())) {
    Logger.logError('only http and https are supported.')
    Logger.logError('exiting...')
    process.exit(1)
  }
  return value.toLowerCase()
}

export const parseLogLevel = (value: string) => {
  if (!['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(value.toUpperCase())) {
    Logger.logError(`only 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', and 'TRACE' are supported.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseOutputMode = (value: string) => {
  if (!['COMPACT', 'PRETTY', 'NONE'].includes(value.toUpperCase())) {
    Logger.logError(`only 'COMPACT', 'PRETTY', 'NONE' are supported.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseDeliveryMode = (value: any) => {
  if (![0, 1, 2].includes(value)) {
    Logger.logError(`only 0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT' are supported.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value;
}

export const parseUserProperties = (value: string, previous?: Record<string, string | string[]>) => {
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
    Logger.logError('not a valid user property.')
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const parseSingleTopic = (value: string) => {
  if (value.includes('*') || value.includes('>')) {
    Logger.error('cannot publish the message to a Topic that contains wildcards characters *, >')
    Logger.error('exiting...')
    process.exit(1)
  }
  if (value.endsWith('/')) {
    Logger.error('invalid topic - topic name cannot end with character /')
    Logger.error('exiting...')
    process.exit(1)
  }
  return value;
}

export const parsePublishTopic = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value === 'string') {
    if (value.includes('*') || value.includes('>')) {
      Logger.error(`cannot publish to topic '${value}' containing wildcards characters *, >`)
      Logger.error('exiting...')
      process.exit(1)
    }
    if (value.endsWith('/')) {
      Logger.error(`cannot publish to topic '${value}' ending with character /'`)
      Logger.error('exiting...')
      process.exit(1)
    }
  
  }

  previous ? previous.push(value.toString()) : [ value ];
  
  return previous;
}
  
export const parseReceiveTopic = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  previous ? previous.push(value.toString()) : [ value ];
  
  return previous;
}

export const parseRequestTopic = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  previous ? previous.push(value.toString()) : [ value ];
  
  return previous;
}

export const parseReplyTopic = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  previous ? previous.push(value.toString()) : [ value ];
  
  return previous;
}

export const parseSempOperation = (value: string) => {
  if (!['CREATE', 'UPDATE', 'DELETE'].includes(value.toUpperCase())) {
    Logger.error(`only 'CREATE', 'UPDATE' and 'DELETE' operations are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseSempQueueTopics = (value: string, previous: string[] | undefined) => {
  if (!value) return;

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  previous ? previous.push(value.toString()) : [ value ];
  return previous;
}

export const parseSempQueueAccessType = (value: string) => {
  if (!['EXCLUSIVE', 'NON-EXCLUSIVE'].includes(value.toUpperCase())) {
    Logger.error(`only 'EXCLUSIVE' and 'NON-EXCLUSIVE' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseSempQueueNonOwnerPermission = (value: string) => {
  if (!['no-access', 'read-only', 'consume', 'modify-topic', 'delete'].includes(value.toLowerCase())) {
    Logger.error(`only 'no-access', 'read-only', 'consume', 'modify-topic' and 'delete' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase();
}

export const parsePublishAcknowledgeMode = (value: string) => {
  if (!['PER_MESSAGE', 'WINDOWED'].includes(value.toUpperCase())) {
    Logger.error(`only 'PER_MESSAGE' and 'WINDOWED' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseReceiverAcknowledgeMode = (value: string) => {
  if (!['AUTO', 'CLIENT'].includes(value.toUpperCase())) {
    Logger.error(`only 'AUTO' and 'CLIENT' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parseSempAllowDefaultAction = (value: string) => {
  if (!['ALLOW', 'DISALLOW'].includes(value.toUpperCase())) {
    Logger.error(`only 'allow' and 'disallow' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase();
}

export const parseSempEndpointCreateDurability = (value: string) => {
  if (!['all', 'durable', 'non-durable'].includes(value.toLowerCase())) {
    Logger.error(`only 'all', 'durable', and 'non-durable' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase();
}



