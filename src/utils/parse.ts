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

export const parsePartitionKeysCount = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    Logger.logError(`${value} is not a number.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  if (parsedValue < 2) {
    Logger.logError(`${value} invalid partition key count (min: 2).`)
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
  return value;
}

export const parseManageProtocol = (value: string) => {
  var protocol = value.substring(0, value.indexOf( ":" )); 
  if (!['http', 'https'].includes(protocol.toLowerCase())) {
    Logger.logError('only http and https are supported.')
    Logger.logError('exiting...')
    process.exit(1)
  }
  return value;
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
  if (!['DEFAULT', 'PROPS', 'FULL'].includes(value.toUpperCase())) {
    Logger.logError(`only 'DEFAULT', 'PROPS', 'FULL' are supported, and if not specified a DEFAULT mode is used.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parsePayloadType = (value: string) => {
  if (!['TEXT', 'BYTES'].includes(value.toUpperCase())) {
    Logger.logError(`only 'TEXT', 'BYTES' are supported, and if not specified a TEXT mode is used.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  return value.toLowerCase();
}

export const parseHttpContentType = (value: string) => {
  if (!value) {
    Logger.logError("required option '--http-content-type <CONTENT_TYPE>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  return value.toLocaleLowerCase();
}

export const parseHttpContentEncoding = (value: string) => {
  if (!value) {
    Logger.logError("required option '--http-content-encoding <CONTENT_ENCODING>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  return value.toLocaleLowerCase();
}

export const parseDeliveryMode = (value: any) => {
  if (!['DIRECT', 'PERSISTENT'].includes(value.toUpperCase())) {
    Logger.logError(`only 'DIRECT' or 'PERSISTENT' are supported.`)
    Logger.logError('exiting...')
    process.exit(1)
  }
  
  return value.toUpperCase();
}

export const parsePartitionKeys = (value: string) => {
  if (!value) {
    Logger.logError("required option '--partition-keys <FIELD1 | FIELD2 | .. | FIELD-n>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid key specified, one or more key is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  return value;
}

export const parsePartitionKeysList = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--partition-keys-list <KEY...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid key specified, one or more key is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }


  if (previous) {
    previous.push(value.toString());
    return previous;
  } else {
    return [ value ];    
  }
}  

export const parseUserProperties = (value: string, previous?: Record<string, string | string[]>) => {
  const [key, val] = value.split(':')
  if (key && val) {
    var _key = key.trim();
    var _val = val.trim();
    if (!previous) {
      return { [_key]: _val }
    } else {
      if (previous[_key]) {
        previous[_key] = (previous[_key] as string).concat(` ${_val}`)
        return previous
      } else {
        return { ...previous, [_key]: _val }
      }
    }
  } else {
    Logger.logError(`invalid user property - '${value}'`)
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

  previous ? previous.push(value.toString()) : previous = [ value ];
  
  return previous;
}
  
export const parsePublishQueue = (value: string, previous: string[] | undefined) => {
  if (!value) {
    Logger.logError("required option '--queue <QUEUE...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid queue specified, one or more queue name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof value === 'string') {
    if (/[<>\?&;\*]/.test(value)) {
      Logger.error(`invalid queue name '${value}' contain invalid characters *, >, <, ?, &, ;`)
      Logger.error('exiting...')
      process.exit(1)
    }
  }

  previous ? previous.push(value.toString()) : previous = [ value ];
  
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

  previous ? previous.push(value.toString()) : previous = [ value ];
  
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

  previous ? previous.push(value.toString()) : previous = [ value ];
  
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

  previous ? previous.push(value.toString()) : previous = [ value ];
  
  return previous;
}

export const parseVisualizeSettings = (value: string) => {
  if (!['on', 'off'].includes(value.toLowerCase())) {
    Logger.error(`only 'on', 'off' are supported.`)
    Logger.error('exiting...')
    process.exit(1)
  }
  
  return value.toLowerCase();
}

export const parseSempOperation = (value: string) => {
  return (!value) ? true : value;
}

export const parseSempQueueTopics = (value: string, previous: string[] | undefined) => {
  if (!value) return;

  if (typeof value !== 'string' && typeof value !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  previous ? previous.push(value.toString()) : previous = [ value ];
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

export const parseFeedType = (value: string) => {
  if (!['STM', 'API', 'CUSTOM'].includes(value.toUpperCase())) {
    Logger.logError(`only 'STM', 'API', 'CUSTOM' are supported, and if not specified a STM mode is used.`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  return `${value.toLowerCase()}feed`;
}

export const parseFeedView = (value: string) => {
  if (!['PUBLISHER', 'PROVIDER'].includes(value.toUpperCase())) {
    Logger.logError(`only 'PUBLISHER', 'PROVIDER' are supported, and if not specified a PUBLISHER mode is used.`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  return `${value.toLowerCase()}`;
}