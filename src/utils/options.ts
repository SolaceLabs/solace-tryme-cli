import { Command, Option, program } from 'commander'
import {
  parseBoolean, parseNumber, parseDeliveryMode, parseLogLevel, parseManageProtocol,
  parseMessageProtocol, parseOutputMode, parseSingleTopic, parsePublishTopic,
  parseReceiveTopic, parseUserProperties, parseSempQueueNonOwnerPermission, parseSempOperation, parseSempQueueAccessType, 
  parsePublishAcknowledgeMode, parseReceiverAcknowledgeMode, parseSempAllowDefaultAction, 
  parseSempEndpointCreateDurability, parseRequestTopic
} from './parse';
import { defaultMessageConnectionConfig, defaultConfigFile, getDefaultTopic, getDefaultClientName, 
        defaultMessagePublishConfig, defaultMessageConfig, defaultMessageHint, defaultManageConnectionConfig, 
        commandSend, commandReceive, commandRequest, commandReply, defaultRequestMessageHint, defaultMessageReceiveConfig, 
        defaultManageQueueConfig, commandQueue, defaultManageAclProfileConfig, defaultManageClientProfileConfig, 
        defaultManageClientUsernameConfig, commandAclProfile, commandClientProfile, commandClientUsername } from './defaults';
import chalk from 'chalk';

export const addConfigDeleteOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // delete options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli delete command examples')))
}

export const addConfigViewOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // view options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli view command examples')))
}

export const addConfigListOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // list options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli list commands examples')))
}

export const addConfigInitOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // init options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli init commands examples')))
}

export const addSendOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', chalk.whiteBright('the message topic(s)')) .argParser(parsePublishTopic) .default([ getDefaultTopic('publish')]) .hideHelp(advanced))
    .addOption(new Option('--message <MESSAGE>', chalk.whiteBright('the message body')) .default(defaultMessageHint) .hideHelp(advanced))
    .addOption(new Option('--stdin', chalk.whiteBright('read the message body from stdin')) .default(false) .hideHelp(advanced))
    .addOption(new Option('--count <COUNT>', chalk.whiteBright('the number of events to publish')) .argParser(parseNumber) .default(defaultMessagePublishConfig.count) .hideHelp(advanced))
    .addOption(new Option('--interval <MILLISECONDS>', chalk.whiteBright('the time to wait between publish')) .argParser(parseNumber) .default(defaultMessagePublishConfig.interval) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', chalk.whiteBright('the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', chalk.whiteBright('the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('pub'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeout) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED')) .argParser( parsePublishAcknowledgeMode) .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the application-provided message ID')) .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the application-provided message type')) .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application-provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the application-requested message delivery mode 'DIRECT' or 'PERSISTENT'`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: COMPACT, PRETTY, NONE')) .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandSend))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli publish examples')))
    .allowUnknownOption(false)
}

export const addReceiveOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced))
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced))
    .addOption(new Option('--username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced))
    .addOption(new Option('--password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', chalk.whiteBright('the message topic(s)')) .argParser(parseReceiveTopic) .default( [ getDefaultTopic('receive') ]) .hideHelp(advanced))

    // receive from queue
    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE SETTINGS')} */`))
    .addOption(new Option('--queue <QUEUE>', chalk.whiteBright('the message queue')) .hideHelp(advanced))
    .addOption(new Option('--create-if-missing [BOOLEAN]', chalk.whiteBright('[advanced] create message queue if missing')) .argParser(parseBoolean) .hideHelp(!advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('recv'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessageConnectionConfig.receiverDescription) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <NUMBER>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--receive-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a receive timestamp on received messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.receiveTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--reapply-subscriptions [BOOLEAN]', chalk.whiteBright('[advanced] reapply subscriptions upon calling on a disconnected session')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.reapplySubscriptions) .hideHelp(!advanced))  
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: COMPACT, PRETTY, NONE')) .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))

    // consumer options
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement mode - AUTO or CLIENT')) .argParser( parseReceiverAcknowledgeMode) .default(defaultMessageReceiveConfig.acknowledgeMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandReceive))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli receive examples')) )
    .allowUnknownOption(false)
}

export const addRequestOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC>', chalk.whiteBright('the message topic')) .argParser(parseSingleTopic) .default( getDefaultTopic('request') ) .hideHelp(advanced))
    .addOption(new Option('--message <MESSAGE>', chalk.whiteBright('the message body')) .default(defaultRequestMessageHint) .hideHelp(advanced))
    .addOption(new Option('--stdin', chalk.whiteBright('read the message body from stdin')) .default(false) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', chalk.whiteBright('the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', chalk.whiteBright('the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('req'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // request options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REQUEST SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed requestor options
    .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeout) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED')) .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the application-provided message ID')) .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the application-provided message type')) .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application-provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the application-requested message delivery mode 'DIRECT' or 'PERSISTENT'`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: COMPACT, PRETTY, NONE')) .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandRequest))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli request examples')))
    .allowUnknownOption(false)
}

export const addReplyOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--topic <TOPIC...>', chalk.whiteBright('the message topic(s)')) .argParser(parseRequestTopic) .default([ getDefaultTopic('publish')]) .hideHelp(advanced))
    .addOption(new Option('--message <MESSAGE>', chalk.whiteBright('the message body')) .default(defaultRequestMessageHint) .hideHelp(advanced))
    .addOption(new Option('--time-to-live <MILLISECONDS>', chalk.whiteBright('the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(advanced))
    .addOption(new Option('--dmq-eligible [BOOLEAN]', chalk.whiteBright('the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.dmqEligible) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('rep'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REPLY SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.sendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeout) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED')) .default(defaultMessagePublishConfig.acknowledgeMode) .implies({ guaranteedPublisher: true }) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the application-provided message ID')) .default(defaultMessageConfig.applicationMessageId) .hideHelp(!advanced))
    .addOption(new Option('--message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the application-provided message type')) .default(defaultMessageConfig.applicationMessageType) .hideHelp(!advanced))
    .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application-provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the application-requested message delivery mode 'DIRECT' or 'PERSISTENT'`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: COMPACT, PRETTY, NONE')) .argParser(parseOutputMode) .default(defaultMessageConnectionConfig.outputMode) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandReply))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli reply examples')))
    .allowUnknownOption(false)
}

export const addManageQueueOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [QUEUE]', chalk.whiteBright('list existing queues, fetch details if queue specified')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.list) .implies({operation: 'LIST'}).hideHelp(advanced))
    .addOption(new Option('--create [QUEUE]', chalk.whiteBright('create a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.create) .implies({operation: 'CREATE'}) .hideHelp(advanced))
    .addOption(new Option('--update [QUEUE]', chalk.whiteBright('update a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.update) .implies({operation: 'UPDATE'}) .hideHelp(advanced))
    .addOption(new Option('--delete [QUEUE]', chalk.whiteBright('delete a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.delete) .implies({operation: 'DELETE'}) .hideHelp(advanced))

    // semp QUEUE

    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE SETTINGS')} */`))
    .addOption(new Option('--owner <OWNER>', chalk.whiteBright('[advanced] the name of Client Username that owns the Queue')) .default( defaultManageQueueConfig.owner ) .hideHelp(!advanced))
    .addOption(new Option('--access-type <ACCESS_TYPE>', chalk.whiteBright('access type for delivering messages to consumers: EXCLUSIVE or NON-EXCLUSIVE')) .default( defaultManageQueueConfig.accessType) .argParser(parseSempQueueAccessType) .hideHelp(advanced))
    .addOption(new Option('--add-subscriptions <TOPIC...>', chalk.whiteBright('the topic subscriptions to be added')) .argParser(parseReceiveTopic) .default( defaultManageQueueConfig.addSubscriptions ) .hideHelp(advanced))
    .addOption(new Option('--remove-subscriptions <TOPIC...>', chalk.whiteBright('[advanced] the topic subscriptions to be removed')) .default( defaultManageQueueConfig.removeSubscriptions ) .hideHelp(!advanced))
    .addOption(new Option('--list-subscriptions [BOOLEAN]', chalk.whiteBright('the topic subscriptions on the queue')) .default( defaultManageQueueConfig.listSubscriptions ) .hideHelp(advanced))
    .addOption(new Option('--dead-message-queue <DMQ>', chalk.whiteBright('[advanced] name of the Dead Message queue (DMQ)')) .default(defaultManageQueueConfig.deadMessageQueue) .hideHelp(!advanced))
    .addOption(new Option('--delivery-count-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable message delivery count on received messages')) .default(defaultManageQueueConfig.deliveryCountEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--delivery-delay <NUMBER>', chalk.whiteBright('[advanced] the delay in seconds, to apply to messages arriving on the queue before they are eligible for delivery')) .argParser(parseNumber) .default(defaultManageQueueConfig.deliveryDelay) .hideHelp(!advanced))
    .addOption(new Option('--egress-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable transmission of messages from the queue')) .default(defaultManageQueueConfig.egressEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--ingress-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable reception of messages to the queue')) .argParser(parseBoolean) .default(defaultManageQueueConfig.ingressEnabled) .hideHelp(!advanced))
    .addOption(new Option('--max-msg-size <NUMBER>', chalk.whiteBright('[advanced] the maximum message size allowed in the Queue, in bytes (B)')) .argParser(parseNumber) .default(defaultManageQueueConfig.maxMsgSize) .hideHelp(!advanced))
    .addOption(new Option('--max-msg-spool-usage <NUMBER>', chalk.whiteBright('[advanced] the maximum message spool usage allowed by the Queue, in megabytes (MB)')) .argParser(parseNumber) .default(defaultManageQueueConfig.maxMsgSpoolUsage) .hideHelp(!advanced))
    .addOption(new Option('--max-redelivery-count <NUMBER>', chalk.whiteBright('[advanced] maximum number of times the queue will attempt redelivery')) .argParser(parseNumber) .default(defaultManageQueueConfig.maxRedeliveryCount) .hideHelp(!advanced))
    .addOption(new Option('--partition-count <NUMBER>', chalk.whiteBright('[advanced] the count of partitions of the queue')) .argParser(parseNumber) .default(defaultManageQueueConfig.partitionCount) .hideHelp(!advanced))
    .addOption(new Option('--partition-rebalance-delay <NUMBER>', chalk.whiteBright('[advanced] the delay (in seconds) before a partition rebalance is started once needed')) .argParser(parseNumber) .default(defaultManageQueueConfig.partitionRebalanceDelay) .hideHelp(!advanced))
    .addOption(new Option('--partition-rebalance-max-handoff-time <NUMBER>', chalk.whiteBright('[advanced] the maximum time (in seconds) to wait before handing off a partition while rebalancing')) .argParser(parseNumber) .default(defaultManageQueueConfig.partitionRebalanceMaxHandoffTime) .hideHelp(!advanced))
    .addOption(new Option('--permission <PERMISSION>', chalk.whiteBright('[advanced] permission level for all consumers of the queue (no-access, read-only, consume, modify-topic or delete)')) .argParser(parseSempQueueNonOwnerPermission) .default(defaultManageQueueConfig.permission) .hideHelp(!advanced))      
    .addOption(new Option('--redelivery-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable message redelivery')) .default(defaultManageQueueConfig.redeliveryEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--respect-ttl-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable respecting of the TTL for messages in the queue')) .argParser(parseBoolean) .default(defaultManageQueueConfig.respectTtlEnabled) .hideHelp(!advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandQueue))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli queue examples')))
    .allowUnknownOption(false)
}

export const addManageAclProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [ACL_PROFILE]', chalk.whiteBright('list existing acl-profiles, fetch details if acl-profile specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [ACL_PROFILE]', chalk.whiteBright('create an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [ACL_PROFILE]', chalk.whiteBright('update an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [ACL_PROFILE]', chalk.whiteBright('delete an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp ACL PROFILE
    .addOption(new Option(`\n/* ${chalk.whiteBright('ACL PROFILE SETTINGS')} */`))
    .addOption(new Option('--client-connect-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile connects to massage VPN (allow or disallow)')) .default( defaultManageAclProfileConfig.clientConnectDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--publish-topic-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile publishes to a topic (allow or disallow)')) .default( defaultManageAclProfileConfig.publishTopicDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--subscribe-topic-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile subscribes to a topic (allow or disallow)')) .default( defaultManageAclProfileConfig.subscribeTopicDefaultAction ) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandAclProfile))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli acl-profile examples')))
    .allowUnknownOption(false)
}

export const addManageClientProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [CLIENT_PROFILE]', chalk.whiteBright('list existing client-profiles, fetch details if client-profile specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [CLIENT_PROFILE]', chalk.whiteBright('create a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [CLIENT_PROFILE]', chalk.whiteBright('update a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [CLIENT_PROFILE]', chalk.whiteBright('delete a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp CLIENT PROFILE

    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT PROFILE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-endpoint-create-durability <TYPE>', chalk.whiteBright('[advanced] the types of Queues and Topic Endpoints that clients can create (all, durable or non-durable')) .default( defaultManageClientProfileConfig.allowGuaranteedEndpointCreateDurability) .argParser(parseSempEndpointCreateDurability) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-endpoint-create-enabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable the Client Username')) .default( defaultManageClientProfileConfig.allowGuaranteedEndpointCreateEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-msg-receive-enabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable allowing clients to receive guaranteed messages.')) .default( defaultManageClientProfileConfig.allowGuaranteedMsgReceiveEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-msg-send-enabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable allowing clients to send guaranteed messages')) .default( defaultManageClientProfileConfig.allowGuaranteedMsgSendEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--compression-enabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable allowing clients to use compression.')) .default( defaultManageClientProfileConfig.compressionEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--elidingEnabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable message eliding')) .default( defaultManageClientProfileConfig.elidingEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--max-egress-flow-count <NUMBER>', chalk.whiteBright('[advanced] the maximum number of transmit flows that can be created')) .default( defaultManageClientProfileConfig.maxEgressFlowCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--max-ingress-flow-count <NUMBER>', chalk.whiteBright('[advanced] the maximum number of receive flows that can be created by one client ')) .default( defaultManageClientProfileConfig.maxIngressFlowCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--max-subscription-count <NUMBER>', chalk.whiteBright('[advanced] the maximum number of subscriptions per client ')) .default( defaultManageClientProfileConfig.maxSubscriptionCount) .argParser(parseNumber) .hideHelp(!advanced))
    .addOption(new Option('--reject-msg-to-sender-on-no-subscription-match-enabled <BOOLEAN>', chalk.whiteBright('[advanced] enable or disable the sending of a NACK when no matching subscription found')) .default( defaultManageClientProfileConfig.rejectMsgToSenderOnNoSubscriptionMatchEnabled) .argParser(parseBoolean) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandClientProfile))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli client-profile examples')))
    .allowUnknownOption(false)
}

export const addManageClientUsernameOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.password) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [CLIENT_USERNAME]', chalk.whiteBright('list existing client-usernames, fetch details if client-username specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [CLIENT_USERNAME]', chalk.whiteBright('create a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [CLIENT_USERNAME]', chalk.whiteBright('update a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [CLIENT_USERNAME]', chalk.whiteBright('delete a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp CLIENT USERNAME
    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT USERNAME SETTINGS')} */`))
    .addOption(new Option('--client-profile <CLIENT_PROFILE>', chalk.whiteBright('the name of the Client profile')) .default( defaultManageClientUsernameConfig.clientProfile ) .hideHelp(advanced))
    .addOption(new Option('--acl-profile <ACL_PROFILE>', chalk.whiteBright('the name of the ACL profile')) .default( defaultManageClientUsernameConfig.aclProfile ) .hideHelp(advanced))
    .addOption(new Option('--enabled <BOOLEAN>', chalk.whiteBright('enable or disable the Client Username')) .default( defaultManageClientUsernameConfig.enabled) .argParser(parseBoolean) .hideHelp(advanced))
    .addOption(new Option('--client-password <VPN_NAME>', chalk.whiteBright('the password for the Client Username')) .default( defaultManageClientUsernameConfig.clientPassword ) .hideHelp(advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced) .default(commandClientUsername))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli client-username examples')))
    .allowUnknownOption(false)
}

export const addManageConnectionOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('--username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('--password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))
    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalsLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .default(defaultConfigFile) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli connection examples')))
}

export const addManageSempConnectionOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.url)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.vpn)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.username)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.password))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli semp-connection examples')))
}

export const addVisualizeOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .default(defaultConfigFile))
}

export const addVisualizeLaunchOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // config options
    .addOption(new Option('--config <CONFIG_FILE>',chalk.whiteBright('the configuration file')) .default(defaultConfigFile))
}

