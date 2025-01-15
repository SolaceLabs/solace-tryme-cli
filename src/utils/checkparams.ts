import { loadLocalFeedFile } from "./config"
import { defaultFeedAnalysisFile, defaultFeedConfig, getDefaultTopic } from "./defaults"
import { Logger } from "./logger"

export const checkPubTopicExists = (topic: string) => {
  if (!topic) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (typeof topic !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const checkSubTopicExists = (options: MessageClientOptions) => {
  if (!options.topic && !options.queue) {
    Logger.logError("required option '--topic <TOPIC...>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!options.queue && typeof options.topic !== 'object') {
    Logger.logError("invalid topic specified, one or more topic name is expected")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!options.queue && options.createIfMissing) {
    Logger.logError("create queue missing option is applicable only when you connect to a queue")
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const checkForCliTopics = (key: string, options: MessageClientOptions | ManageClientOptions, optionsSource: any) => {
  if (typeof options[key] === 'object' && options[key].length > 1 && optionsSource[key] && optionsSource[key] === 'cli')
    options[key].splice(0, 1);
}

export const checkConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
  username: string | undefined, password: string | undefined) => {
    if (!url) {
      Logger.logError("required option '--url <URL>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!vpn) {
      Logger.logError("required option '--vpn <VPN>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!username) {
      Logger.logError("required option '--username <USER>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!password) {
      Logger.logError("required option '--password <PASSWORD>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
  }
}

export const checkReceiverIntegrity = (topic: any, queue: string, createIfMissing: any) => {
  if ((!topic || topic === getDefaultTopic('receive')) && (queue || createIfMissing !== undefined)) {
    Logger.logError("topics for subscription can be specified only for direct receivers, not queues")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!queue && createIfMissing !== undefined) {
    Logger.logError("missing 'queue' option")
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const checkSempConnectionParamsExists = (url: string | undefined, vpn :string | undefined, 
                                      username: string | undefined, password: string | undefined) => {
  if (!url) {
    Logger.logError("required option '--semp-url <URL>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!vpn) {
    Logger.logError("required option '--semp-vpn <VPN>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!username) {
    Logger.logError("required option '--semp-username <USERNAME>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!password) {
    Logger.logError("required option '--semp-password <PASSWORD>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const checkSempQueueSubscriptionTopicExists = (options: ManageClientOptions, optionsSource: any) => {
  if (!options.addSubscriptions.length && !options.removeSubscriptions.length) return;
  
  if (options.addSubscriptions && typeof options.addSubscriptions !== 'object') {
    Logger.error("invalid add subscription topic specified, one or more topic name is expected")
    Logger.error('exiting...')
    process.exit(1)
  }
  
  if (options.removeSubscriptions.length && typeof options.removeSubscriptions !== 'object') {
    Logger.error("invalid remove subscription topic specified, one or more topic name is expected")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (options.removeSub && options.operation?.toUpperCase() === 'CREATE') {
    Logger.logWarn("remove subscription option is not applicable while creating a queue, ignoring...")
    options.removeSub = false;
    options.removeSubscriptions = []
  }

  if (options.operation === 'DELETE' && (optionsSource.addSubscriptions === 'cli' && options.addSubscriptions.length)) {
    Logger.logWarn("add subscription option is not applicable while deleting a queue, ignoring...")
    options.addSub = false;
    options.addSubscriptions = []
  }

  if (options.operation === 'DELETE' && (optionsSource.removeSubscriptions === 'cli' && options.removeSubscriptions.length)) {
    Logger.logWarn("remove subscription option is not applicable while deleting a queue, ignoring...")
    options.removeSub = false;
    options.removeSubscriptions = []
  }

  if (options.operation === 'CREATE' && options.removeSubscriptions.length) {
    Logger.logWarn("remove subscription option is not applicable while creating a queue, ignoring...")
    options.removeSub = false;
    options.removeSubscriptions = []
  }

  if (options.operation === 'CREATE') {
    if (optionsSource.addSubscriptions === 'cli') {
      options.addSub = true;
    } else if (options.addSubscriptions.length) {
      optionsSource.addSub = 'cli';
      options.addSub = true;
    } else {
      optionsSource.addSub = 'cli';
      options.addSub = false;
    }
  }

  if (options.operation === 'UPDATE') {
    if (optionsSource.addSubscriptions !== 'cli') {
      optionsSource.addSub = 'cli';
      options.addSub = false;
      options.addSubscriptions = []
    } else {
      optionsSource.addSub = 'cli';
      options.addSub = true;
    }

    if (optionsSource.removeSubscriptions !== 'cli') {
      optionsSource.removeSub = 'cli';
      options.removeSub = false;
      options.removeSubscriptions = []
    } else {
      optionsSource.removeSub = 'cli';
      options.removeSub = true;
    }
  }

  options.listSub = options?.listSubscriptions ? true : false
  optionsSource.listSub = 'cli';
}

export const checkSempQueuePartitionSettings = (options: ManageClientOptions) => {
  if (options.partitionCount === undefined && options.partitionRebalanceDelay === undefined && 
      options.partitionRebalanceMaxHandoffTime === undefined) return;

  if (options.operation === 'CREATE' && options.partitionCount && options.accessType && options.accessType.toUpperCase() === 'EXCLUSIVE') {
    Logger.error("partitioned queue settings are applicable only on queues with non-exclusive access type")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempQueueParamsExists = (options: ManageClientOptions, optionsSource: any) => {
  var count = 0;
  if (options.list) {
    count++; 
    options.operation = (typeof options.list === 'string') ? 'LIST_ITEM' : 'LIST';
    optionsSource.operation = 'cli'
    options.queue = (typeof options.list === 'string') ? options.list : options.queue;
    optionsSource.queue = (typeof options.list === 'string') ? 'cli' : optionsSource.queue;
  }
  if (options.create) {
    count++; 
    options.operation = 'CREATE'
    optionsSource.operation = 'cli'
    options.queue = (typeof options.create === 'string') ? options.create : options.queue;
    optionsSource.queue = (typeof options.create === 'string') ? 'cli' : optionsSource.queue;
  }
  if (options.update) {
    count++; 
    options.operation = 'UPDATE'
    optionsSource.operation = 'cli'
    options.queue = (typeof options.update === 'string') ? options.update : options.queue;
    optionsSource.queue = (typeof options.update === 'string') ? 'cli' : optionsSource.queue;
  }
  if (options.delete) {
    count++; 
    options.operation = 'DELETE'
    optionsSource.operation = 'cli'
    options.queue = (typeof options.delete === 'string') ? options.delete : options.queue;
    optionsSource.queue = (typeof options.delete === 'string') ? 'cli' : optionsSource.queue;
  }

  if (count > 1) {
    Logger.error('only a single operation can be specified')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.operation) {
    Logger.error('missing parameter, a list, create, update or delete operation expected')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.queue) {
    Logger.error('missing queue name')
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempClientProfileParamsExists = (options: ManageClientOptions, optionsSource: any) => {
  var count = 0;
  if (options.list) {
    count++; 
    options.operation = (typeof options.list === 'string') ? 'LIST_ITEM' : 'LIST';
    optionsSource.operation = 'cli'
    options.clientProfile = (typeof options.list === 'string') ? options.list : options.clientProfile;
    optionsSource.clientProfile = (typeof options.list === 'string') ? 'cli' : optionsSource.clientProfile;
  }
  if (options.create) {
    count++; 
    options.operation = 'CREATE'
    optionsSource.operation = 'cli'
    options.clientProfile = (typeof options.create === 'string') ? options.create : options.clientProfile;
    optionsSource.clientProfile = (typeof options.create === 'string') ? 'cli' : optionsSource.clientProfile;
  }
  if (options.update) {
    count++; 
    options.operation = 'UPDATE'
    optionsSource.operation = 'cli'
    options.clientProfile = (typeof options.update === 'string') ? options.update : options.clientProfile;
    optionsSource.clientProfile = (typeof options.update === 'string') ? 'cli' : optionsSource.clientProfile;
  }
  if (options.delete) {
    count++; 
    options.operation = 'DELETE'
    optionsSource.operation = 'cli'
    options.clientProfile = (typeof options.delete === 'string') ? options.delete : options.clientProfile;
    optionsSource.clientProfile = (typeof options.delete === 'string') ? 'cli' : optionsSource.clientProfile;
  }

  if (count > 1) {
    Logger.error('only a single operation can be specified')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.operation) {
    Logger.error('missing parameter, a list, create, update or delete operation expected')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.clientProfile) {
    Logger.error("missing client-profile name")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempAclProfileParamsExists = (options: ManageClientOptions, optionsSource: any) => {
  var count = 0;
  if (options.list) {
    count++; 
    options.operation = (typeof options.list === 'string') ? 'LIST_ITEM' : 'LIST';
    optionsSource.operation = 'cli'
    options.aclProfile = (typeof options.list === 'string') ? options.list : options.aclProfile;
    optionsSource.aclProfile = (typeof options.list === 'string') ? 'cli' : optionsSource.aclProfile;
  }
  if (options.create) {
    count++; 
    options.operation = 'CREATE'
    optionsSource.operation = 'cli'
    options.aclProfile = (typeof options.create === 'string') ? options.create : options.aclProfile;
    optionsSource.aclProfile = (typeof options.create === 'string') ? 'cli' : optionsSource.aclProfile;
  }
  if (options.update) {
    count++; 
    options.operation = 'UPDATE'
    optionsSource.operation = 'cli'
    options.aclProfile = (typeof options.update === 'string') ? options.update : options.aclProfile;
    optionsSource.aclProfile = (typeof options.update === 'string') ? 'cli' : optionsSource.aclProfile;
  }
  if (options.delete) {
    count++; 
    options.operation = 'DELETE'
    optionsSource.operation = 'cli'
    options.aclProfile = (typeof options.delete === 'string') ? options.delete : options.aclProfile;
    optionsSource.aclProfile = (typeof options.delete === 'string') ? 'cli' : optionsSource.aclProfile;
  }

  if (count > 1) {
    Logger.error('only a single operation can be specified')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.operation) {
    Logger.error('missing parameter, a list, create, update or delete operation expected')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.aclProfile) {
    Logger.error("missing acl-profile name")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempClientUsernameParamsExists = (options: ManageClientOptions, optionsSource: any) => {
  var count = 0;
  if (options.list) {
    count++; 
    options.operation = (typeof options.list === 'string') ? 'LIST_ITEM' : 'LIST';
    optionsSource.operation = 'cli'
    options.clientUsername = (typeof options.list === 'string') ? options.list : options.clientUsername;
    optionsSource.clientUsername = (typeof options.list === 'string') ? 'cli' : optionsSource.clientUsername;
  }
  if (options.create) {
    count++; 
    options.operation = 'CREATE'
    optionsSource.operation = 'cli'
    options.clientUsername = (typeof options.create === 'string') ? options.create : options.clientUsername;
    optionsSource.clientUsername = (typeof options.create === 'string') ? 'cli' : optionsSource.clientUsername;
  }
  if (options.update) {
    count++; 
    options.operation = 'UPDATE'
    optionsSource.operation = 'cli'
    options.clientUsername = (typeof options.update === 'string') ? options.update : options.clientUsername;
    optionsSource.clientUsername = (typeof options.update === 'string') ? 'cli' : optionsSource.clientUsername;
  }
  if (options.delete) {
    count++; 
    options.operation = 'DELETE'
    optionsSource.operation = 'cli'
    options.clientUsername = (typeof options.delete === 'string') ? options.delete : options.clientUsername;
    optionsSource.clientUsername = (typeof options.delete === 'string') ? 'cli' : optionsSource.clientUsername;
  }

  if (count > 1) {
    Logger.error('only a single operation can be specified')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.operation) {
    Logger.error('missing parameter, a list, create, update or delete operation expected')
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.clientUsername) {
    Logger.error("missing client-username")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkForFeedSettings = (eventNames:string[], feedName:string) => {
  if (!feedName) {
    Logger.logError("required option '--feed-name <FEED_NAME>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (!eventNames) {
    Logger.logError("required option '--event-name <EVENT_NAME>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  var data = loadLocalFeedFile(feedName, defaultFeedAnalysisFile);
  if (!data.messages || !Object.keys(data.messages).length) {
    Logger.logError(`No event publish events found in the feed '${feedName}'`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  eventNames.forEach(eventName => {
    if (!data.messages[eventName]) {
      Logger.logError(`No event by name '${eventName}' found in the feed '${feedName}'`)
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!data.messages[eventName].send || !data.messages[eventName].send.length) {
      Logger.logError(`No publishable topics found for the event '${eventName}' in the feed '${feedName}'`)
      Logger.logError('exiting...')
      process.exit(1)
    }
  });
}

export const checkFeedGenerateOptions = (options: ManageFeedClientOptions, optionsSource: any) => {
  if (options.useDefaults && !options.fileName) {
    Logger.logError(`File name is required when using --use-defaults option`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (options.useDefaults) {
    options.feedType = options.feedType || defaultFeedConfig.feedType;
    optionsSource.feedType = 'cli';
    
    if (options.fileName && !options.feedName) {
      options.feedName = getPotentialFeedName(options.fileName);
      optionsSource.feedName = 'cli';
    }
  }
}

export const checkFeedRunOptions = (options: ManageFeedPublishOptions, optionsSource: any) => {
  if (options.useDefaults && !options.feedName) {
    Logger.logError(`Feed name is required when using --use-defaults option`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  if ((optionsSource.rate === 'cli' && optionsSource.frequency !== 'cli') ||
      (optionsSource.frequency === 'cli' && optionsSource.rate !== 'cli')) {
    Logger.logError(`Invalid rate or frequency option, both rate and frequency must be specified`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (optionsSource.rate === 'cli' && options.rate && (options.rate < 0.5 || options.rate > 10.0)) {
    Logger.logError(`Invalid rate value, rate must be between 0.5 and 10.0`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (optionsSource.frequency === 'cli' && options.frequency && 
      ['msg/s', 'msg/m', 'msg/h'].indexOf(options.frequency.toLowerCase()) === -1) {
    Logger.logError(`Invalid frequency value, frequency must be one of 'msg/s', 'msg/m' or 'msg/h'`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const getPotentialFeedName = (fileName: string) => {
  var feedName = fileName.split('/').pop();
  feedName = feedName?.split('.').shift() ?? '';// Add nullish coalescing operator to provide a default value
  return feedName;
}

export const getPotentialTopicFromFeedName = (name: string) => {
  var feedName = name.replaceAll(' ', '').replaceAll('-', '/').toLowerCase();
  return feedName;
}

