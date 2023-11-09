import { Command, Option } from 'commander'
import {
  parseBoolean, parseNumber, parseDeliveryMode, parseLogLevel, parseManageProtocol,
  parseMessageProtocol, parseOutputMode, parseSingleTopic, parsePublishTopic,
  parseReceiveTopic, parseUserProperties, parseSempQueueNonOwnerPermission, parseSempOperation, parseSempQueueAccessType, parseSempQueueTopics, parsePublishAcknowledgeMode, parseReceiverAcknowledgeMode, parseSempAllowDefaultAction, parseSempEndpointCreateDurability,
} from './parse';
import { defaultMessageConnectionConfig, defaultConfigFile, getDefaultTopic, getDefaultClientName, defaultMessagePublishConfig, defaultMessageConfig, defaultMessage, defaultMessageHint, defaultManageConnectionConfig, commandPublish, commandReceive, commandRequest, commandReply, defaultRequestMessageHint, defaultMessageReceiveConfig, defaultManageQueueConfig, commandQueue, defaultManageAclProfileConfig, defaultManageClientProfileConfig, defaultManageClientUsernameConfig, commandAclProfile, commandClientProfile, commandClientUsername } from './defaults';
import chalk from 'chalk';

export const addConfigDeleteOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // view options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', 'the command name') .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  'show cli delete command examples'))
}

export const addConfigViewOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // view options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', 'the command name') .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  'show cli view command examples'))
}

export const addConfigListOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // view options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  'show cli list commands examples'))
}

export const addConfigInitOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // init options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  'show cli init commands examples'))
}

export const addPublishOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', 'the broker url') .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', 'the message VPN name') .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', 'the username') .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', 'the password') .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', 'the message topic(s)') .argParser(parsePublishTopic) .default([ getDefaultTopic('publish')]) .hideHelp(advanced))
    // .addOption(new Option('--topic <TOPIC>', 'the message topic') .argParser(parseSingleTopic) .default( getDefaultTopic('publish') ) .hideHelp(advanced))
    .addOption(new Option('--message <BODY>', 'the message body') .default(defaultMessageHint) .hideHelp(advanced))
    .addOption(new Option('--stdin', 'read the message body from stdin') .default(false) .hideHelp(advanced))
    .addOption(new Option('--count <COUNT>', 'the number of events to publish') .argParser(parseNumber) .default(defaultMessagePublishConfig.count) .hideHelp(advanced))
    .addOption(new Option('--interval <MILLISECONDS>', 'the time to wait between publish') .argParser(parseNumber) .default(defaultMessagePublishConfig.interval) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', 'the time before a message is discarded or moved to a DMQ') .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', 'the DMQ eligible flag') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <NAME>', '[advanced] the client name') .default(getDefaultClientName(), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', '[advanced] the application description') .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', '[advanced] the read timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConfig.readTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', '[advanced] the timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', '[advanced] the number of times to retry connecting during initial connection setup') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', '[advanced] the number of times to retry connecting after a connected session goes down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', '[advanced] the amount of time between each attempt to connect to a host') .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWaitInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', '[advanced] the amount of time to wait between sending out keep-alive messages to the VPN') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', '[advanced] include a sender ID on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', '[advanced] include sequence number on messages sent') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', '[advanced] include a send timestamp on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', '[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session') .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    .addOption(new Option('--window-size <NUMBER>', '[advanced] the maximum number of messages that can be published without acknowledgment') .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', '[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages') .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeoutInMsecs) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', '[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED') .argParser( parsePublishAcknowledgeMode) .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', '[advanced] the application-provided message ID') .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', '[advanced] the application-provided message type') .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', '[advanced] the application-provided message correlation key for acknowledgement management') .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', `[advanced] the application-requested message delivery mode 0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT'`) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to <TOPIC>', '[advanced] string which is used as the topic name for a response message') .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', '[advanced] the user properties (e.g., "name1: value1" "name2: value2")') .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', '[advanced] message print mode: COMPACT, PRETTY, NONE') .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE') .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', 'the command name') .hideHelp(advanced) .default(commandPublish))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli publish examples'))
    .allowUnknownOption(false)
}

export const addReceiveOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', 'the broker url') .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced))
    .addOption(new Option('--vpn <VPN>', 'the message VPN name') .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced))
    .addOption(new Option('--username <USERNAME>', 'the username') .default(defaultMessageConnectionConfig.username) .hideHelp(advanced))
    .addOption(new Option('--password <PASSWORD>', 'the password') .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', 'the message topic(s)') .argParser(parseReceiveTopic) .default( [ getDefaultTopic('receive') ]) .hideHelp(advanced))

    // receive from queue
    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE SETTINGS')} */`))
    .addOption(new Option('--queue <QUEUE>', 'the message queue') .hideHelp(advanced))
    .addOption(new Option('--create-if-missing [BOOLEAN]', '[advanced] create message queue if missing') .argParser(parseBoolean) .hideHelp(!advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <NAME>', '[advanced] the client name') .default(getDefaultClientName(), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', '[advanced] the application description') .default(defaultMessageConnectionConfig.receiverDescription) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <NUMBER>', '[advanced] the timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <NUMBER>', '[advanced] the number of times to retry connecting during initial connection setup') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', '[advanced] the number of times to retry connecting after a connected session goes down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', '[advanced] the amount of time between each attempt to connect to a host') .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWaitInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', '[advanced] the amount of time to wait between sending out keep-alive messages to the VPN') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--receive-timestamps [BOOLEAN]', '[advanced] include a receive timestamp on received messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.receiveTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--reapply-subscriptions [BOOLEAN]', '[advanced] reapply subscriptions upon calling on a disconnected session') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.reapplySubscriptions) .hideHelp(!advanced))  
    .addOption(new Option('--output-mode <MODE>', '[advanced] message print mode: COMPACT, PRETTY, NONE') .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE') .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // consumer options
    .addOption(new Option('--acknowledge-mode <MODE>', '[advanced] the acknowledgement mode - AUTO or CLIENT') .argParser( parseReceiverAcknowledgeMode) .default(defaultMessageReceiveConfig.acknowledgeMode) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', 'the command name') .hideHelp(advanced) .default(commandReceive))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli receive examples')) 
    .allowUnknownOption(false)
}

export const addRequestOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', 'the broker url') .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', 'the message VPN name') .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', 'the username') .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', 'the password') .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC>', 'the message topic') .argParser(parseSingleTopic) .default( getDefaultTopic('request') ) .hideHelp(advanced))
    .addOption(new Option('--message <BODY>', 'the message body') .default(defaultRequestMessageHint) .hideHelp(advanced))
    .addOption(new Option('--stdin', 'read the message body from stdin') .default(false) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', 'the time before a message is discarded or moved to a DMQ') .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', 'the DMQ eligible flag') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <NAME>', '[advanced] the client name') .default(getDefaultClientName(), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', '[advanced] the application description') .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', '[advanced] the read timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConfig.readTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', '[advanced] the timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', '[advanced] the number of times to retry connecting during initial connection setup') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', '[advanced] the number of times to retry connecting after a connected session goes down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', '[advanced] the amount of time between each attempt to connect to a host') .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWaitInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', '[advanced] the amount of time to wait between sending out keep-alive messages to the VPN') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', '[advanced] include a sender ID on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', '[advanced] include sequence number on messages sent') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // request options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REQUEST SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', '[advanced] include a send timestamp on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', '[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session') .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed requestor options
    .addOption(new Option('--window-size <NUMBER>', '[advanced] the maximum number of messages that can be published without acknowledgment') .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', '[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages') .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeoutInMsecs) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', '[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED') .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', '[advanced] the application-provided message ID') .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', '[advanced] the application-provided message type') .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', '[advanced] the application-provided message correlation key for acknowledgement management') .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', `[advanced] the application-requested message delivery mode 0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT'`) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to <TOPIC>', '[advanced] string which is used as the topic name for a response message') .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', '[advanced] the user properties (e.g., "name1: value1" "name2: value2")') .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', '[advanced] message print mode: COMPACT, PRETTY, NONE') .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE') .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandRequest))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli request examples'))
    .allowUnknownOption(false)
}

export const addReplyOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', 'the broker url') .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', 'the message VPN name') .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', 'the username') .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', 'the password') .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', 'the message topic(s)') .argParser(parsePublishTopic) .default([ getDefaultTopic('publish')]) .hideHelp(advanced))
    .addOption(new Option('--message <BODY>', 'the message body') .default(defaultRequestMessageHint) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', 'the time before a message is discarded or moved to a DMQ') .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', 'the DMQ eligible flag') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <NAME>', '[advanced] the client name') .default(getDefaultClientName(), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', '[advanced] the application description') .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', '[advanced] the read timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConfig.readTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', '[advanced] the timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', '[advanced] the number of times to retry connecting during initial connection setup') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', '[advanced] the number of times to retry connecting after a connected session goes down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', '[advanced] the amount of time between each attempt to connect to a host') .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWaitInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', '[advanced] the amount of time to wait between sending out keep-alive messages to the VPN') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', '[advanced] include a sender ID on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', '[advanced] include sequence number on messages sent') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REPLY SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', '[advanced] include a send timestamp on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', '[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session') .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    .addOption(new Option('--window-size <NUMBER>', '[advanced] the maximum number of messages that can be published without acknowledgment') .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', '[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages') .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeoutInMsecs) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', '[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED') .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', '[advanced] the application-provided message ID') .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', '[advanced] the application-provided message type') .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', '[advanced] the application-provided message correlation key for acknowledgement management') .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', `[advanced] the application-requested message delivery mode 0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT'`) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to <TOPIC>', '[advanced] string which is used as the topic name for a response message') .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', '[advanced] the user properties (e.g., "name1: value1" "name2: value2")') .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', '[advanced] message print mode: COMPACT, PRETTY, NONE') .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE') .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandReply))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli reply examples'))
    .allowUnknownOption(false)
}

export const addManageQueueOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', 'the broker url') .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', 'the message VPN name') .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', 'the username') .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', 'the password') .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-op, --operation <OPERATION>', 'create, update or delete a queue') .argParser(parseSempOperation) .default(defaultManageQueueConfig.operation) .hideHelp(advanced))

    // semp QUEUE

    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE SETTINGS')} */`))
    .addOption(new Option('--queue <QUEUE>', 'the name of the Queue') .default( defaultManageQueueConfig.queue ) .hideHelp(advanced))
    .addOption(new Option('--owner <OWNER>', '[advanced] the name of Client Username that owns the Queue') .default( defaultManageQueueConfig.owner ) .hideHelp(!advanced))
    .addOption(new Option('--access-type <ACCESS_TYPE>', 'access type for delivering messages to consumers: EXCLUSIVE or NON-EXCLUSIVE') .default( defaultManageQueueConfig.accessType) .argParser(parseSempQueueAccessType) .hideHelp(advanced))
    .addOption(new Option('--add-subscriptions <TOPIC...>', 'the topic subscriptions to be added') .argParser(parseReceiveTopic) .default( defaultManageQueueConfig.addSubscriptions ) .hideHelp(advanced))
    .addOption(new Option('--remove-subscriptions <TOPIC...>', '[advanced] the topic subscriptions to be removed') .default( defaultManageQueueConfig.removeSubscriptions ) .hideHelp(!advanced))
    .addOption(new Option('--list-subscriptions [BOOLEAN]', 'the topic subscriptions on the queue') .default( defaultManageQueueConfig.listSubscriptions ) .hideHelp(advanced))
    .addOption(new Option('--dead-message-queue <DMQ>', '[advanced] name of the Dead Message queue (DMQ)') .default(defaultManageQueueConfig.deadMessageQueue) .hideHelp(!advanced))
    .addOption(new Option('--delivery-count-enabled [BOOLEAN]', '[advanced] enable message delivery count on received messages') .default(defaultManageQueueConfig.deliveryCountEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--delivery-delay <NUMBER>', '[advanced] the delay in seconds, to apply to messages arriving on the queue before they are eligible for delivery') .argParser(parseNumber) .default(defaultManageQueueConfig.deliveryDelay) .hideHelp(!advanced))
    .addOption(new Option('--egress-enabled [BOOLEAN]', '[advanced] enable transmission of messages from the queue') .default(defaultManageQueueConfig.egressEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--ingress-enabled [BOOLEAN]', '[advanced] enable reception of messages to the queue') .argParser(parseBoolean) .default(defaultManageQueueConfig.ingressEnabled) .hideHelp(!advanced))
    .addOption(new Option('--max-msg-size <NUMBER>', '[advanced] the maximum message size allowed in the Queue, in bytes (B)') .argParser(parseNumber) .default(defaultManageQueueConfig.maxMsgSize) .hideHelp(!advanced))
    .addOption(new Option('--max-spool-usage <NUMBER>', '[advanced] the maximum message spool usage allowed by the Queue, in megabytes (MB)') .argParser(parseNumber) .default(defaultManageQueueConfig.maxMsgSpoolUsage) .hideHelp(!advanced))
    .addOption(new Option('--max-redelivery-count <NUMBER>', '[advanced] maximum number of times the queue will attempt redelivery') .argParser(parseNumber) .default(defaultManageQueueConfig.maxRedeliveryCount) .hideHelp(!advanced))
    .addOption(new Option('--partition-count <NUMBER>', '[advanced] the count of partitions of the queue') .argParser(parseNumber) .default(defaultManageQueueConfig.partitionCount) .hideHelp(!advanced))
    .addOption(new Option('--partition-rebalance-delay <NUMBER>', '[advanced] the delay (in seconds) before a partition rebalance is started once needed') .argParser(parseNumber) .default(defaultManageQueueConfig.partitionRebalanceDelay) .hideHelp(!advanced))
    .addOption(new Option('--partition-rebalance-max-handoff-time <NUMBER>', '[advanced] the maximum time (in seconds) to wait before handing off a partition while rebalancing') .argParser(parseNumber) .default(defaultManageQueueConfig.partitionRebalanceMaxHandoffTime) .hideHelp(!advanced))
    .addOption(new Option('--permission <PERMISSION>', '[advanced] permission level for all consumers of the queue (no-access, read-only, consume, modify-topic or delete)') .argParser(parseSempQueueNonOwnerPermission) .default(defaultManageQueueConfig.permission) .hideHelp(!advanced))      
    .addOption(new Option('--redelivery-enabled [BOOLEAN]', '[advanced] enable message redelivery') .default(defaultManageQueueConfig.redeliveryEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--respect-ttl-enabled [BOOLEAN]', '[advanced] enable respecting of the TTL for messages in the queue') .argParser(parseBoolean) .default(defaultManageQueueConfig.respectTtlEnabled) .hideHelp(!advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandQueue))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli queue examples'))
    .allowUnknownOption(false)
}

export const addManageAclProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', 'the broker url') .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', 'the message VPN name') .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', 'the username') .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', 'the password') .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-op, --operation <OPERATION>', 'create, update or delete a acl profile') .argParser(parseSempOperation) .default(defaultManageQueueConfig.operation) .hideHelp(advanced))

    // semp ACL PROFILE
    .addOption(new Option(`\n/* ${chalk.whiteBright('ACL PROFILE SETTINGS')} */`))
    .addOption(new Option('--acl-profile <ACL_PROFILE>', 'the name of the ACL profile') .default( defaultManageAclProfileConfig.aclProfile ) .hideHelp(advanced))
    .addOption(new Option('--client-connect-default-action <ACCESS_TYPE>', 'the default action to take when a client using the ACL Profile connects to massage VPN (allow or disallow)') .default( defaultManageAclProfileConfig.clientConnectDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--publish-topic-default-action <ACCESS_TYPE>', 'the default action to take when a client using the ACL Profile publishes to a topic (allow or disallow)') .default( defaultManageAclProfileConfig.publishTopicDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--subscribe-topic-default-action <ACCESS_TYPE>', 'the default action to take when a client using the ACL Profile subscribes to a topic (allow or disallow)') .default( defaultManageAclProfileConfig.subscribeTopicDefaultAction ) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandAclProfile))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', 'show cli acl-profile examples'))
    .allowUnknownOption(false)
}

export const addManageClientProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', 'the broker url') .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', 'the message VPN name') .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', 'the username') .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', 'the password') .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-op, --operation <OPERATION>', 'create, update or delete a client profile') .argParser(parseSempOperation) .default(defaultManageQueueConfig.operation) .hideHelp(advanced))

    // semp CLIENT PROFILE

    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT PROFILE SETTINGS')} */`))
    .addOption(new Option('--client-profile <CLIENT_PROFILE>', 'the name of the Client profile') .default( defaultManageClientProfileConfig.clientProfile ) .hideHelp(advanced))
    .addOption(new Option('--allow-guaranteed-endpoint-create-durability <TYPE>', '[advanced] the types of Queues and Topic Endpoints that clients can create (all, durable or non-durable') .default( defaultManageClientProfileConfig.allowGuaranteedEndpointCreateDurability) .argParser(parseSempEndpointCreateDurability) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-endpoint-create-enabled <BOOLEAN>', '[advanced] enable or disable the Client Username') .default( defaultManageClientProfileConfig.allowGuaranteedEndpointCreateEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-msg-receive-enabled <BOOLEAN>', '[advanced] enable or disable allowing clients to receive guaranteed messages.') .default( defaultManageClientProfileConfig.allowGuaranteedMsgReceiveEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-msg-send-enabled <BOOLEAN>', '[advanced] enable or disable allowing clients to send guaranteed messages') .default( defaultManageClientProfileConfig.allowGuaranteedMsgSendEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--compression-enabled <BOOLEAN>', '[advanced] enable or disable allowing clients to use compression.') .default( defaultManageClientProfileConfig.compressionEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--elidingEnabled <BOOLEAN>', '[advanced] enable or disable message eliding') .default( defaultManageClientProfileConfig.elidingEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--max-egress-flow-count <NUMBER>', '[advanced] the maximum number of transmit flows that can be created') .default( defaultManageClientProfileConfig.maxEgressFlowCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--max-ingress-flow-count <NUMBER>', '[advanced] the maximum number of receive flows that can be created by one client ') .default( defaultManageClientProfileConfig.maxIngressFlowCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--max-subscription-count <NUMBER>', '[advanced] the maximum number of subscriptions per client ') .default( defaultManageClientProfileConfig.maxSubscriptionCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--reject-msg-to-sender-on-no-subscription-match-enabled <BOOLEAN>', '[advanced] enable or disable the sending of a NACK when no matching subscription found') .default( defaultManageClientProfileConfig.rejectMsgToSenderOnNoSubscriptionMatchEnabled) .argParser(parseBoolean) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandClientProfile))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli client-profile examples'))
    .allowUnknownOption(false)
}

export const addManageClientUsernameOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', 'the broker url') .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', 'the message VPN name') .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', 'the username') .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', 'the password') .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-op, --operation <OPERATION>', 'create, update or delete a client username') .argParser(parseSempOperation) .default(defaultManageQueueConfig.operation) .hideHelp(advanced))

    // semp CLIENT USERNAME
    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT USERNAME SETTINGS')} */`))
    .addOption(new Option('--client-username <CLIENT_USERNAME>', 'the name of the Client Username') .default( defaultManageClientUsernameConfig.clientUsername ) .hideHelp(advanced))
    .addOption(new Option('--client-profile <CLIENT_PROFILE>', 'the name of the Client profile') .default( defaultManageClientUsernameConfig.clientProfile ) .hideHelp(advanced))
    .addOption(new Option('--acl-profile <ACL_PROFILE>', 'the name of the ACL profile') .default( defaultManageClientUsernameConfig.aclProfile ) .hideHelp(advanced))
    .addOption(new Option('--enabled <BOOLEAN>', 'enable or disable the Client Username') .default( defaultManageClientUsernameConfig.enabled) .argParser(parseBoolean) .hideHelp(advanced))
    .addOption(new Option('--client-password <VPN_NAME>', 'the password for the Client Username') .default( defaultManageClientUsernameConfig.clientPassword ) .hideHelp(advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name [COMMAND_NAME]', 'the command name') .hideHelp(advanced) .default(commandClientUsername))
    .addOption(new Option('--save', 'save/update the command settings') .hideHelp(advanced) .default(false))
    .addOption(new Option('--save-to <COMMAND_NAME>', 'duplicate the command settings') .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', 'show cli client-username examples'))
    .allowUnknownOption(false)
}

export const addManageVpnConnectionOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', 'the broker url') .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', 'the message VPN name') .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', 'the username') .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', 'the password') .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))
    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', '[advanced] the application description') .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', '[advanced] the read timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConfig.readTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', '[advanced] the timeout period for a connect operation') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeoutInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', '[advanced] the number of times to retry connecting during initial connection setup') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', '[advanced] the number of times to retry connecting after a connected session goes down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', '[advanced] the amount of time between each attempt to connect to a host') .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWaitInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', '[advanced] the amount of time to wait between sending out keep-alive messages to the VPN') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalInMsecs) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down') .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', '[advanced] include a sender ID on sent messages') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', '[advanced] include sequence number on messages sent') .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .default(defaultConfigFile) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', 'display more help for command with options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 'show cli vpn-connection examples'))
}

export const addManageSempConnectionOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`))
    .addOption(new Option('--semp-url <URL>', 'the broker url') .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url)) 
    .addOption(new Option('--semp-vpn <VPN>', 'the message VPN name') .default(defaultManageConnectionConfig.vpn)) 
    .addOption(new Option('--semp-username <USERNAME>', 'the username') .default(defaultManageConnectionConfig.username)) 
    .addOption(new Option('--semp-password <PASSWORD>', 'the password') .default(defaultManageConnectionConfig.password))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>','the configuration file') .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', 'show cli semp-connection examples'))
}