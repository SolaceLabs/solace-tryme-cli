import { getDefaultTopic } from "./defaults"
import { Logger } from "./logger"


export const checkSaveParameters = (options: MessageClientOptions) => {
  if (options.save && options.saveTo) {
    Logger.logError("cannot mix update (--save) and duplicate (--save-to) options in a single operation")
    Logger.logError('exiting...')
    process.exit(1)
  }
}

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
      Logger.logError("required option '-U, --url <URL>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!vpn) {
      Logger.logError("required option '-v, --vpn <VPN>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!username) {
      Logger.logError("required option '-u, --username <USER>' not specified")
      Logger.logError('exiting...')
      process.exit(1)
    }

    if (!password) {
      Logger.logError("required option '-p, --password <PASS>' not specified")
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

export const checkSempQueueSubscriptionTopicExists = (options: ManageClientOptions) => {
  if (!options.addSubscriptions.length && !options.removeSubscriptions.length) return;

  if (options.addSubscriptions && typeof options.addSubscriptions !== 'object') {
    Logger.error("invalid add subscription topic specified, one or more topic name is expected")
    Logger.error('exiting...')
    process.exit(1)
  }
  // if (options.addSubscriptions.length > 1 && options.addSubscriptions.includes( getDefaultTopic( 'receive' ) ))
  //   options.addSubscriptions.splice(options.addSubscriptions.indexOf(getDefaultTopic( 'receive' )), 1)
  options.addSub = options.addSubscriptions.length ? true : false;

  if (options.removeSubscriptions.length && typeof options.removeSubscriptions !== 'object') {
    Logger.error("invalid remove subscription topic specified, one or more topic name is expected")
    Logger.error('exiting...')
    process.exit(1)
  }
  // if (options.removeSubscriptions.includes( getDefaultTopic( 'receive' ) ))
  //   options.removeSubscriptions.splice(options.removeSubscriptions.indexOf(getDefaultTopic( 'receive' )), 1)
  options.removeSub = options.removeSubscriptions.length ? true : false;

  if (options.removeSub && options.operation?.toUpperCase() === 'CREATE') {
    Logger.error("remove subscription option is not applicable while creating a queue")
    Logger.error('exiting...')
    process.exit(1)
  }

  options.listSub = options?.listSubscriptions ? true : false
}

export const checkSempQueuePartitionSettings = (options: ManageClientOptions) => {
  if (options.partitionCount === undefined && options.partitionRebalanceDelay === undefined && 
      options.partitionRebalanceMaxHandoffTime === undefined) return;

  if (options.partitionCount && options.accessType && options.accessType.toUpperCase() === 'EXCLUSIVE') {
    Logger.error("partitioned queue settings are applicable only on queues with non-exclusive access type")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempQueueParamsExists = (options: ManageClientOptions) => {
  if (!options.operation) {
    Logger.error("missing parameter, --operation LIST, CREATE, UPDATE or DELETE is expected")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.queue) {
    Logger.error("missing queue name")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempClientProfileParamsExists = (options: ManageClientOptions) => {
  if (!options.operation) {
    Logger.error("missing parameter, --operation LIST, CREATE, UPDATE or DELETE is expected")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.clientProfile) {
    Logger.error("missing client-profile name")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempAclProfileParamsExists = (options: ManageClientOptions) => {
  if (!options.operation) {
    Logger.error("missing parameter, --operation LIST, CREATE, UPDATE or DELETE is expected")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.aclProfile) {
    Logger.error("missing acl-profile name")
    Logger.error('exiting...')
    process.exit(1)
  }
}

export const checkSempClientUsernameParamsExists = (options: ManageClientOptions) => {
  if (!options.operation) {
    Logger.error("missing parameter, --operation LIST, CREATE, UPDATE or DELETE is expected")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.clientUsername) {
    Logger.error("missing client-username")
    Logger.error('exiting...')
    process.exit(1)
  }

  if (options.operation === 'CREATE') {
    if (!options.clientProfile) {
      Logger.error("missing client-profile name")
      Logger.error('exiting...')
      process.exit(1)
    }

    if (!options.aclProfile) {
      Logger.error("missing aclp-profile name")
      Logger.error('exiting...')
      process.exit(1)
    }

    if (!options.hasOwnProperty('clientPassword')) {
      Logger.error("missing password")
      Logger.error('exiting...')
      process.exit(1)
    }

    if (!options.hasOwnProperty('enabled')) {
      Logger.error("missing enabled flag")
      Logger.error('exiting...')
      process.exit(1)
    }
  }
}

