import { Command, Option, program } from 'commander'
import {
  parseBoolean, parseNumber, parseDeliveryMode, parseLogLevel, parseManageProtocol,
  parseMessageProtocol, parseOutputMode, parsePayloadType, parseSingleTopic, parsePublishTopic,
  parseReceiveTopic, parseUserProperties, parseSempQueueNonOwnerPermission, parseSempOperation, parseSempQueueAccessType, 
  parsePublishAcknowledgeMode, parseReceiverAcknowledgeMode, parseSempAllowDefaultAction, 
  parseSempEndpointCreateDurability, parseRequestTopic, parsePartitionKeys,
  parsePartitionKeysCount,
  parseFeedType,
  parseFeedView,
  parseRate,
  parseFrequency
} from './parse';
import { defaultMessageConnectionConfig, defaultConfigFile, getDefaultTopic, getDefaultClientName, 
        defaultMessagePublishConfig, defaultMessageConfig, defaultMessageHint, defaultManageConnectionConfig, 
        commandSend, commandReceive, commandRequest, commandReply, defaultRequestMessageHint, defaultMessageReceiveConfig, 
        defaultManageQueueConfig, commandQueue, defaultManageAclProfileConfig, defaultManageClientProfileConfig, 
        defaultManageClientUsernameConfig, commandAclProfile, commandClientProfile, commandClientUsername, defaultMessageRequestConfig, defaultMessageReplyConfig, 
        defaultFeedConfig} from './defaults';
import chalk from 'chalk';

export const addRootHelpOptions = (cmd: Command) => {
  cmd
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli command examples')). preset({ helpExamples: true }))
}

export const addConfigHelpOptions = (cmd: Command) => {
  cmd
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli config command examples')))
}
export const addManageHelpOptions = (cmd: Command) => {
  cmd
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli manage command examples')))
}

export const addConfigDeleteOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // delete options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli delete command examples')))
}

export const addConfigViewOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // view options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli view command examples')))
}

export const addConfigListOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // list options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show cli list commands examples')))
}

export const addConfigInitOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // init options
    .addOption(new Option(`/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile))

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
    .addOption(new Option('-u, --username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('-p, --password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('TOPIC SUBSCRIPTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-t, --topic <TOPIC...>', chalk.whiteBright('the topic(s) to publish the message(s) on as space-separated values (e.g., test/1 "user/2" "profile/3")')) .default([ getDefaultTopic('send') ]) .argParser(parsePublishTopic) .hideHelp(advanced))

    // message body options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE BODY SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-m, --message <MESSAGE>', chalk.whiteBright('the message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('stdin') .conflicts('file') .hideHelp(advanced))
    .addOption(new Option('-f, --file <FILENAME>', chalk.whiteBright('filename containing the message content')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('stdin') .hideHelp(advanced))
    .addOption(new Option('-default, --default-message', chalk.whiteBright('use default message body')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('a default message') .hideHelp(advanced))
    .addOption(new Option('-empty, --empty-message', chalk.whiteBright('use an empty message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('') .hideHelp(advanced))
    .addOption(new Option('--stdin', chalk.whiteBright('read the message body from stdin')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('file') .default(false) .hideHelp(advanced))

    .addOption(new Option(`\n/* ${chalk.whiteBright('MULTI-MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--count <COUNT>', chalk.whiteBright('the number of events to publish')) .argParser(parseNumber) .default(defaultMessagePublishConfig.count) .hideHelp(advanced))
    .addOption(new Option('--interval <MILLISECONDS>', chalk.whiteBright('the time to wait between publish')) .argParser(parseNumber) .default(defaultMessagePublishConfig.interval) .hideHelp(advanced))

    // message print options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE OUTPUT SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: DEFAULT, PROPS OR FULL')) .argParser(parseOutputMode) .default(defaultMessageConfig.outputMode) .hideHelp(advanced))

    // partition key settings
    .addOption(new Option(`\n/* ${chalk.whiteBright('PARTITION KEY SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--partition-keys-count <NUMBER>', chalk.whiteBright('[advanced] the partition keys count for generating simulated keys (min: 2)')) .argParser(parsePartitionKeysCount) .conflicts('partitionKeys') .hideHelp(!advanced))
    .addOption(new Option('--partition-keys <KEY...>', chalk.whiteBright('[advanced] the partition key(s) as space-separated values if listing more than one (e.g., RED GREEN BLUE)')) .argParser(parsePartitionKeys) .conflicts('partitionKeysCount') .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('ADVANCED MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--payload-type <PAYLOAD_TYPE>', chalk.whiteBright('[advanced] payload type: TEXT or BYTES')) .argParser(parsePayloadType) .default(defaultMessageConfig.payloadType) .hideHelp(!advanced))
    .addOption(new Option('-ttl, --time-to-live <MILLISECONDS>', chalk.whiteBright('[advanced] the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(!advanced))
    .addOption(new Option('-dmq, --dmq-eligible [BOOLEAN]', chalk.whiteBright('[advanced] the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConfig.dmqEligible) .hideHelp(!advanced))
    .addOption(new Option('--app-message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the user-defined application message ID')) .default(defaultMessageConfig.appMessageId) .hideHelp(!advanced))
    .addOption(new Option('--app-message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the user-defined application message type')) .default(defaultMessageConfig.appMessageType) .hideHelp(!advanced))
    // .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the requested message delivery mode: DIRECT or PERSISTENT`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties as space-separated pairs if listing more than one (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('-cn, --client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('pub'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--wait-before-exit <NUMBER>', chalk.whiteBright('[advanced] wait for the specified number of seconds before exiting')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--exit-after <NUMBER>', chalk.whiteBright('[advanced] exit the session after specified number of seconds')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))
    .addOption(new Option('--trace-visualization [BOOLEAN]', chalk.whiteBright('[advanced] trace visualization events')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .hideHelp(true))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--publish-confirmation [BOOLEAN]', chalk.whiteBright('[advanced] generate publish confirmation')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .default(false) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session.')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessagePublishConfig.windowSize) .hideHelp(!advanced))
    // .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessagePublishConfig.acknowledgeTimeout) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode: PER_MESSAGE or WINDOWED')) .argParser( parsePublishAcknowledgeMode) .default(defaultMessagePublishConfig.acknowledgeMode) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-immediately [BOOLEAN]', chalk.whiteBright('[advanced] the broker to acknowledge message immediately')) .conflicts('windowSize') .conflicts('acknowledgeMode')  .argParser( parseBoolean) .default(defaultMessagePublishConfig.acknowledgeImmediately) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandSend))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli publish examples')))
    .allowUnknownOption(false)
}

export const addReceiveOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced))
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced))
    .addOption(new Option('-u, --username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced))
    .addOption(new Option('-p, --password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // receive from queue
    .addOption(new Option(`\n/* ${chalk.whiteBright('TOPIC SUBSCRIPTION')} */`) .hideHelp(advanced))
    .addOption(new Option('-t, --topic <TOPIC...>', chalk.whiteBright('the topic subscriptions as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")')) .default([ getDefaultTopic('receive') ]) .argParser(parseReceiveTopic) .hideHelp(advanced))

    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE ENDPOINT')} */`) .hideHelp(advanced))
    .addOption(new Option('-q, --queue <QUEUE>', chalk.whiteBright('the message queue endpoint')) .hideHelp(advanced))
    .addOption(new Option('--create-if-missing [BOOLEAN]', chalk.whiteBright('create message queue if missing')) .argParser(parseBoolean) .hideHelp(advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE OUTPUT SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: DEFAULT, PROPS OR FULL')) .argParser(parseOutputMode) .default(defaultMessageConfig.outputMode) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('RECEIVE SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('-cn, --client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('recv'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessageReceiveConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <NUMBER>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalLimit) .hideHelp(!advanced))
    .addOption(new Option('--receive-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a receive timestamp on received messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateReceiveTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--reapply-subscriptions [BOOLEAN]', chalk.whiteBright('[advanced] reapply subscriptions upon calling on a disconnected session')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.reapplySubscriptions) .hideHelp(!advanced))  
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement mode: AUTO or CLIENT')) .argParser( parseReceiverAcknowledgeMode) .default(defaultMessageReceiveConfig.acknowledgeMode) .hideHelp(!advanced))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))
    .addOption(new Option('--trace-visualization [BOOLEAN]', chalk.whiteBright('[advanced] trace visualization events')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .hideHelp(true))

    // consumer options
    .addOption(new Option('--exit-after <NUMBER>', chalk.whiteBright('[advanced] exit the session after specified number of seconds')) .argParser(parseNumber) .hideHelp(true))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandReceive))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli receive examples')) )
    .allowUnknownOption(false)
}

export const addRequestOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('-u, --username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('-p, --password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('TOPIC SUBSCRIPTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-t, --topic <TOPIC>', chalk.whiteBright('the message topic')) .default( getDefaultTopic('request') ) .argParser(parseSingleTopic) .hideHelp(advanced))
    
    // message body options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE BODY SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-m, --message <MESSAGE>', chalk.whiteBright('the message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('stdin') .conflicts('file') .hideHelp(advanced))
    .addOption(new Option('-f, --file <FILENAME>', chalk.whiteBright('filename containing the message content')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('stdin') .hideHelp(advanced))
    .addOption(new Option('-default, --default-message', chalk.whiteBright('use default message body')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('a default payload') .hideHelp(advanced))
    .addOption(new Option('-empty, --empty-message', chalk.whiteBright('use an empty message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('') .hideHelp(advanced))
    .addOption(new Option('--stdin', chalk.whiteBright('read the message body from stdin')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('file') .default(false) .hideHelp(advanced))

    .addOption(new Option(`\n/* ${chalk.whiteBright('MULTI-MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--count <COUNT>', chalk.whiteBright('the number of requests to send')) .argParser(parseNumber) .default(defaultMessageRequestConfig.count) .hideHelp(advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE OUTPUT SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: DEFAULT, PROPS OR FULL')) .argParser(parseOutputMode) .default(defaultMessageConfig.outputMode) .hideHelp(advanced))

    .addOption(new Option(`\n/* ${chalk.whiteBright('ADVANCED MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--payload-type <PAYLOAD_TYPE>', chalk.whiteBright('[advanced] payload type: TEXT or BYTES')) .argParser(parsePayloadType) .default(defaultMessageConfig.payloadType) .hideHelp(!advanced))
    // .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('-ttl, --time-to-live <MILLISECONDS>', chalk.whiteBright('[advanced] the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(!advanced))
    .addOption(new Option('-dmq, --dmq-eligible [BOOLEAN]', chalk.whiteBright('[advanced] the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConfig.dmqEligible) .hideHelp(!advanced))
    .addOption(new Option('--timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout value')) .argParser(parseNumber) .default(defaultMessageConfig.timeout) .hideHelp(!advanced))
    .addOption(new Option('--application-message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the application provided message ID')) .default(defaultMessageConfig.appMessageId) .hideHelp(!advanced))
    .addOption(new Option('--application-message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the application provided message type')) .default(defaultMessageConfig.appMessageType) .hideHelp(!advanced))
    // .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--correlation-id <CORRELATION_ID>', chalk.whiteBright('[advanced] the application provided message correlation id for acknowledgement management')) .default( 'current timestamp') .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the application-requested message delivery mode: DIRECT or PERSISTENT`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties as space-separated values if listing more than one (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REQUEST SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('-cn, --client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('req'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessageRequestConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--wait-before-exit <NUMBER>', chalk.whiteBright('[advanced] wait for the specified number of seconds before exiting')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--exit-after <NUMBER>', chalk.whiteBright('[advanced] exit the session after specified number of seconds')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))
    .addOption(new Option('--trace-visualization [BOOLEAN]', chalk.whiteBright('[advanced] trace visualization events')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .hideHelp(true))

    // request options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REQUEST SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session.')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed requestor options
    .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessageRequestConfig.windowSize) .hideHelp(!advanced))
    // .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessageRequestConfig.acknowledgeTimeout) .hideHelp(!advanced))
    .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode: PER_MESSAGE or WINDOWED')) .default(defaultMessageRequestConfig.acknowledgeMode) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandRequest))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli request examples')))
    .allowUnknownOption(false)
}

export const addReplyOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // connect options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--url <URL>', chalk.whiteBright('the broker url')) .argParser(parseMessageProtocol) .default(defaultMessageConnectionConfig.url) .hideHelp(advanced)) 
    .addOption(new Option('--vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultMessageConnectionConfig.vpn) .hideHelp(advanced)) 
    .addOption(new Option('-u, --username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('-p, --password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('TOPIC SUBSCRIPTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-t, --topic <TOPIC...>', chalk.whiteBright('the topic subscriptions as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")')) .default([ getDefaultTopic('request') ]) .argParser(parseRequestTopic) .hideHelp(advanced))
    
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE BODY SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-m, --message <MESSAGE>', chalk.whiteBright('the message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('stdin') .conflicts('file') .hideHelp(advanced))
    .addOption(new Option('-f, --file <FILENAME>', chalk.whiteBright('filename containing the message content')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('stdin') .hideHelp(advanced))
    .addOption(new Option('-default, --default-message', chalk.whiteBright('use default message body')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('a default payload') .hideHelp(advanced))
    .addOption(new Option('-empty, --empty-message', chalk.whiteBright('use an empty message body')) .implies({payloadType: 'text'}) .conflicts('defaultMessage') .conflicts('message') .conflicts('stdin') .conflicts('file') .default('') .hideHelp(advanced))
    .addOption(new Option('--stdin', chalk.whiteBright('read the message body from stdin')) .implies({payloadType: 'text'}) .conflicts('emptyMessage') .conflicts('message') .conflicts('defaultMessage') .conflicts('file') .default(false) .hideHelp(advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE OUTPUT SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: DEFAULT, PROPS OR FULL')) .argParser(parseOutputMode) .default(defaultMessageConfig.outputMode) .hideHelp(advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REPLY SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('-cn, --client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('rep'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessageReplyConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--exit-after <NUMBER>', chalk.whiteBright('[advanced] exit the session after specified number of seconds')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))
    .addOption(new Option('--trace-visualization [BOOLEAN]', chalk.whiteBright('[advanced] trace visualization events')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .hideHelp(true))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('REPLY SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session.')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // guaranteed publisher options
    // .addOption(new Option('--window-size <NUMBER>', chalk.whiteBright('[advanced] the maximum number of messages that can be published without acknowledgment')) .argParser(parseNumber) .default(defaultMessageReplyConfig.windowSize) .hideHelp(!advanced))
    // .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the time to wait for an acknowledgement, before retransmitting unacknowledged messages')) .argParser(parseNumber) .default(defaultMessageReplyConfig.acknowledgeTimeout) .hideHelp(!advanced))
    // .addOption(new Option('--acknowledge-mode <MODE>', chalk.whiteBright('[advanced] the acknowledgement receive mode: PER_MESSAGE or WINDOWED')) .default(defaultMessageReplyConfig.acknowledgeMode) .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('ADVANCED MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--payload-type <PAYLOAD_TYPE>', chalk.whiteBright('[advanced] payload type: TEXT or BYTES')) .argParser(parsePayloadType) .default(defaultMessageConfig.payloadType) .hideHelp(!advanced))
    .addOption(new Option('-ttl, --time-to-live <MILLISECONDS>', chalk.whiteBright('[advanced] the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(!advanced))
    .addOption(new Option('-dmq, --dmq-eligible [BOOLEAN]', chalk.whiteBright('[advanced] the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConfig.dmqEligible) .hideHelp(!advanced))
    .addOption(new Option('--application-message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the application provided message ID')) .default(defaultMessageConfig.appMessageId) .hideHelp(!advanced))
    .addOption(new Option('--application-message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the application provided message type')) .default(defaultMessageConfig.appMessageType) .hideHelp(!advanced))
    // .addOption(new Option('--correlation-key <CORRELATION_KEY>', chalk.whiteBright('[advanced] the application provided message correlation key for acknowledgement management')) .default(defaultMessageConfig.correlationKey) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the application-requested message delivery mode: DIRECT or PERSISTENT`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties space-separated pairs if listing more than one (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandReply))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli reply examples')))
    .allowUnknownOption(false)
}

export const addManageQueueOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker semp url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.sempUrl) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.sempVpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the semp username')) .default(defaultManageConnectionConfig.sempUsername) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the semp password')) .default(defaultManageConnectionConfig.sempPassword) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [QUEUE]', chalk.whiteBright('list existing queues, fetch details if queue specified')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.list) .implies({operation: 'LIST'}).hideHelp(advanced))
    .addOption(new Option('--create [QUEUE]', chalk.whiteBright('create a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.create) .implies({operation: 'CREATE', owner: 'default'}) .hideHelp(advanced))
    .addOption(new Option('--update [QUEUE]', chalk.whiteBright('update a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.update) .implies({operation: 'UPDATE'}) .hideHelp(advanced))
    .addOption(new Option('--delete [QUEUE]', chalk.whiteBright('delete a queue')) .argParser(parseSempOperation) .default(defaultManageQueueConfig.delete) .implies({operation: 'DELETE'}) .hideHelp(advanced))

    // semp QUEUE

    .addOption(new Option(`\n/* ${chalk.whiteBright('QUEUE SETTINGS')} */`))
    .addOption(new Option('--owner <OWNER>', chalk.whiteBright('[advanced] the name of Client Username that owns the Queue')) .default( defaultManageQueueConfig.owner ) .hideHelp(!advanced))
    .addOption(new Option('--access-type <ACCESS_TYPE>', chalk.whiteBright('access type for delivering messages to consumers: EXCLUSIVE or NON-EXCLUSIVE')) .argParser(parseSempQueueAccessType) .hideHelp(advanced))
    .addOption(new Option('--add-subscriptions <TOPIC...>', chalk.whiteBright('the topic subscriptions to be added as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")')) .argParser(parseReceiveTopic) .hideHelp(advanced))
    .addOption(new Option('--remove-subscriptions <TOPIC...>', chalk.whiteBright('the topic subscriptions to be removed as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")')) .hideHelp(advanced))
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
    .addOption(new Option('--permission <PERMISSION>', chalk.whiteBright('[advanced] permission level for all consumers of the queue: no-access, read-only, consume, modify-topic or delete')) .argParser(parseSempQueueNonOwnerPermission) .default(defaultManageQueueConfig.permission) .hideHelp(!advanced))      
    .addOption(new Option('--redelivery-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable message redelivery')) .default(defaultManageQueueConfig.redeliveryEnabled) .argParser(parseBoolean) .hideHelp(!advanced))
    .addOption(new Option('--respect-ttl-enabled [BOOLEAN]', chalk.whiteBright('[advanced] enable respecting of the TTL for messages in the queue')) .argParser(parseBoolean) .default(defaultManageQueueConfig.respectTtlEnabled) .hideHelp(!advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandQueue))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli queue examples')))
    .allowUnknownOption(false)
}

export const addManageAclProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker semp url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.sempUrl) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.sempVpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the semp username')) .default(defaultManageConnectionConfig.sempUsername) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the semp password')) .default(defaultManageConnectionConfig.sempPassword) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [ACL_PROFILE]', chalk.whiteBright('list existing acl-profiles, fetch details if acl-profile specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [ACL_PROFILE]', chalk.whiteBright('create an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [ACL_PROFILE]', chalk.whiteBright('update an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [ACL_PROFILE]', chalk.whiteBright('delete an acl-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp ACL PROFILE
    .addOption(new Option(`\n/* ${chalk.whiteBright('ACL PROFILE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--client-connect-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile connects to massage VPN: allow or disallow')) .default( defaultManageAclProfileConfig.clientConnectDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--publish-topic-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile publishes to a topic: allow or disallow')) .default( defaultManageAclProfileConfig.publishTopicDefaultAction) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
    .addOption(new Option('--subscribe-topic-default-action <ACCESS_TYPE>', chalk.whiteBright('the default action to take when a client using the ACL Profile subscribes to a topic: allow or disallow')) .default( defaultManageAclProfileConfig.subscribeTopicDefaultAction ) .argParser(parseSempAllowDefaultAction) .hideHelp(advanced))
  
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandAclProfile))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli acl-profile examples')))
    .allowUnknownOption(false)
}

export const addManageClientProfileOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker semp url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.sempUrl) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.sempVpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the semp username')) .default(defaultManageConnectionConfig.sempUsername) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the semp password')) .default(defaultManageConnectionConfig.sempPassword) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [CLIENT_PROFILE]', chalk.whiteBright('list existing client-profiles, fetch details if client-profile specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [CLIENT_PROFILE]', chalk.whiteBright('create a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [CLIENT_PROFILE]', chalk.whiteBright('update a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [CLIENT_PROFILE]', chalk.whiteBright('delete a client-profile')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp CLIENT PROFILE

    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT PROFILE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--allow-guaranteed-endpoint-create-durability <TYPE>', chalk.whiteBright('[advanced] the types of Queues and Topic Endpoints that clients can create: all, durable or non-durable')) .default( defaultManageClientProfileConfig.allowGuaranteedEndpointCreateDurability) .argParser(parseSempEndpointCreateDurability) .hideHelp(!advanced))
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
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandClientProfile))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))
      
    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli client-profile examples')))
    .allowUnknownOption(false)
}

export const addManageClientUsernameOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker semp url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.sempUrl) .hideHelp(advanced)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.sempVpn) .hideHelp(advanced)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the semp username')) .default(defaultManageConnectionConfig.sempUsername) .hideHelp(advanced)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the semp password')) .default(defaultManageConnectionConfig.sempPassword) .hideHelp(advanced))

    // operation scope
    .addOption(new Option(`\n/* ${chalk.whiteBright('OPERATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--list [CLIENT_USERNAME]', chalk.whiteBright('list existing client-usernames, fetch details if client-username specified')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.list) .hideHelp(advanced))
    .addOption(new Option('--create [CLIENT_USERNAME]', chalk.whiteBright('create a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.create) .hideHelp(advanced))
    .addOption(new Option('--update [CLIENT_USERNAME]', chalk.whiteBright('update a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.update) .hideHelp(advanced))
    .addOption(new Option('--delete [CLIENT_USERNAME]', chalk.whiteBright('delete a client-username')) .argParser(parseSempOperation) .default(defaultManageAclProfileConfig.delete) .hideHelp(advanced))

    // semp CLIENT USERNAME
    .addOption(new Option(`\n/* ${chalk.whiteBright('CLIENT USERNAME SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--client-profile <CLIENT_PROFILE>', chalk.whiteBright('the name of the Client profile')) .default( defaultManageClientUsernameConfig.clientProfile ) .hideHelp(advanced))
    .addOption(new Option('--acl-profile <ACL_PROFILE>', chalk.whiteBright('the name of the ACL profile')) .default( defaultManageClientUsernameConfig.aclProfile ) .hideHelp(advanced))
    .addOption(new Option('--enabled <BOOLEAN>', chalk.whiteBright('enable or disable the Client Username')) .default( defaultManageClientUsernameConfig.enabled) .argParser(parseBoolean) .hideHelp(advanced))
    .addOption(new Option('--client-password <VPN_NAME>', chalk.whiteBright('the password for the Client Username')) .default( defaultManageClientUsernameConfig.clientPassword ) .hideHelp(advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .hideHelp(advanced) .default(defaultConfigFile))
    .addOption(new Option('--name <COMMAND_NAME>', chalk.whiteBright('the command name')) .hideHelp(!advanced) .default(commandClientUsername))
    .addOption(new Option('--save [COMMAND_NAME]', chalk.whiteBright('update existing or create a new command settings')) .hideHelp(!advanced) .default(false))
      
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
    .addOption(new Option('-u, --username <USERNAME>', chalk.whiteBright('the username')) .default(defaultMessageConnectionConfig.username) .hideHelp(advanced)) 
    .addOption(new Option('-p, --password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultMessageConnectionConfig.password) .hideHelp(advanced))
    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultManageConnectionConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time to wait between sending out keep-alive messages to the VPN')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveInterval) .hideHelp(!advanced))
    // .addOption(new Option('--keepalive-interval-limit <NUMBER>', chalk.whiteBright('[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.keepAliveIntervalLimit) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile) .hideHelp(advanced))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli connection examples')))
}

export const addManageSempConnectionOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // messaging SEMP CONNECTION options
    .addOption(new Option(`\n/* ${chalk.whiteBright('SEMP CONNECTION SETTINGS')} */`))
    .addOption(new Option('--semp-url <URL>', chalk.whiteBright('the broker url')) .argParser(parseManageProtocol) .default(defaultManageConnectionConfig.sempUrl)) 
    .addOption(new Option('--semp-vpn <VPN>', chalk.whiteBright('the message VPN name')) .default(defaultManageConnectionConfig.sempVpn)) 
    .addOption(new Option('--semp-username <USERNAME>', chalk.whiteBright('the username')) .default(defaultManageConnectionConfig.sempUsername)) 
    .addOption(new Option('--semp-password <PASSWORD>', chalk.whiteBright('the password')) .default(defaultManageConnectionConfig.sempPassword))

    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples', chalk.whiteBright('show cli semp-connection examples')))
}

export const addVisualizeOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // config options
    .addOption(new Option(`\n/* ${chalk.whiteBright('CONFIGURATION SETTINGS')} */`))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile))
}

export const addVisualizeLaunchOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // config options
    .addOption(new Option('-port, --visualization-port [PORT]', chalk.whiteBright('the port for the visualizer')) .argParser(parseNumber) .default(0))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile))
}

export const addFeedValidateOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // feed options
    .addOption(new Option('-file, --file-name <ASYNCAPI_FILE>', chalk.whiteBright('the asyncapi document')))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed preview command examples')))
}

export const addFeedPreviewOptions = (cmd: Command, advanced: boolean) => {
  cmd
    // feed options
    .addOption(new Option('-file, --file-name <ASYNCAPI_FILE>', chalk.whiteBright('the asyncapi document')))
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the feed name')))
    .addOption(new Option('-type, --feed-type <FEED_TYPE>', chalk.whiteBright('the feed type')) 
      .argParser(parseFeedType) .default(defaultFeedConfig.feedType) )
    .addOption(new Option('-view, --feed-view <FEED_VIEW>', chalk.whiteBright('the feed view: publisher, provider;\n    generates feed for subscribe operations and vice versa')) 
                  .argParser(parseFeedView) 
                  .default(defaultFeedConfig.feedView === 'default' ? 'publisher' : 'provider') 
                  .conflicts('feedName'))
    .addOption(new Option('-community, --community-feed [BOOLEAN]', chalk.whiteBright('a community feed')) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed preview command examples')))
}

export const addFeedGenerateOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-file, --file-name <ASYNCAPI_FILE>', chalk.whiteBright('the asyncapi document')) )
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the feed name')) )
    .addOption(new Option('-type, --feed-type <FEED_TYPE>', chalk.whiteBright('the feed type')) 
      .argParser(parseFeedType) .default(defaultFeedConfig.feedType) )
    .addOption(new Option('-view, --feed-view <FEED_VIEW>', chalk.whiteBright('the feed view: publisher, provider;\n    generates feed for subscribe operations and vice versa')) 
                  .argParser(parseFeedView) 
                  .default(defaultFeedConfig.feedView === 'default' ? 'publisher' : 'provider') 
                  .conflicts('feedName'))
    // hidden option to use defaults 
    .addOption(new Option('-defaults, --use-defaults', chalk.whiteBright('use defaults for feed name and feed type')) .hideHelp(true) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed generate command examples')))
}

export const addFeedConfigureOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the feed name')) )
    .addOption(new Option('-port, --manage-port [PORT]', chalk.whiteBright('the port for the manager')) .argParser(parseNumber) .default(0))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed configure command examples')))
}

export const addFeedRunOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-ui, --ui-portal [BOOLEAN]', chalk.whiteBright('launch feeds portal')) .default(false)  .hideHelp(advanced))
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the feed name')) .hideHelp(advanced))
    .addOption(new Option('-events, --event-names <EVENT_NAME...>', chalk.whiteBright('the event name(s) as space-separated values if listing more than one (e.g., "Loan_Applied" "Loan_Approved" )'))  .hideHelp(advanced))
    .addOption(new Option('-community, --community-feed [BOOLEAN]', chalk.whiteBright('a community feed')) .default(false)  .hideHelp(advanced))
    .addOption(new Option('-c, --config <CONFIG_FILE>', chalk.whiteBright('the configuration file')) .default(defaultConfigFile) .hideHelp(advanced))

    // message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--count <COUNT>', chalk.whiteBright('the number of events to publish\n[a value of 0 would stream events continuously]')) 
      .argParser(parseNumber) .default(defaultMessagePublishConfig.count) .hideHelp(advanced))
    // .addOption(new Option('--rate <RATE>', chalk.whiteBright('the publish rate')) 
    //   .conflicts('interval') .argParser(parseRate) .default(defaultMessagePublishConfig.rate) .hideHelp(advanced))
    // .addOption(new Option('--frequency <OPTION>', chalk.whiteBright('the publish frequency: msg/s, msg/m or msg/h')) 
    //   .conflicts('interval') .argParser(parseFrequency) .default(defaultMessagePublishConfig.frequency) .hideHelp(advanced))
    .addOption(new Option('--interval <MILLISECONDS>', chalk.whiteBright('the time to wait between publish')) 
      // .conflicts('rate') .conflicts('frequency') 
      .argParser(parseNumber) .default(defaultMessagePublishConfig.interval) .hideHelp(advanced))
    .addOption(new Option('--initial-delay <MILLISECONDS>', chalk.whiteBright('the time to wait before starting the event publish')) 
      .argParser(parseNumber) .default(defaultMessagePublishConfig.initialDelay) .hideHelp(advanced))
    
    // message print options
    .addOption(new Option(`\n/* ${chalk.whiteBright('MESSAGE OUTPUT SETTINGS')} */`) .hideHelp(advanced))
    .addOption(new Option('--output-mode <MODE>', chalk.whiteBright('[advanced] message print mode: DEFAULT, PROPS OR FULL')) .argParser(parseOutputMode) .default(defaultMessageConfig.outputMode) .hideHelp(advanced))
    
    // partition key settings
    .addOption(new Option(`\n/* ${chalk.whiteBright('PARTITION KEY SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--partition-keys-count <NUMBER>', chalk.whiteBright('[advanced] the partition keys count for generating simulated keys (min: 2)')) .argParser(parsePartitionKeysCount) .conflicts('partitionKeys') .hideHelp(!advanced))
    .addOption(new Option('--partition-keys <KEY...>', chalk.whiteBright('[advanced] the partition key(s) as space-separated values if listing more than one (e.g., RED GREEN BLUE)')) .argParser(parsePartitionKeys) .conflicts('partitionKeysCount') .hideHelp(!advanced))

    // advanced message options
    .addOption(new Option(`\n/* ${chalk.whiteBright('ADVANCED MESSAGE SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--payload-type <PAYLOAD_TYPE>', chalk.whiteBright('[advanced] payload type: TEXT or BYTES')) .argParser(parsePayloadType) .default(defaultMessageConfig.payloadType) .hideHelp(!advanced))
    .addOption(new Option('-ttl, --time-to-live <MILLISECONDS>', chalk.whiteBright('[advanced] the time before a message is discarded or moved to a DMQ')) .argParser(parseNumber) .default(defaultMessageConfig.timeToLive) .hideHelp(!advanced))
    .addOption(new Option('-dmq, --dmq-eligible [BOOLEAN]', chalk.whiteBright('[advanced] the DMQ eligible flag')) .argParser(parseBoolean) .default(defaultMessageConfig.dmqEligible) .hideHelp(!advanced))
    .addOption(new Option('--app-message-id <MESSAGE_ID>', chalk.whiteBright('[advanced] the user-defined application message ID')) .default(defaultMessageConfig.appMessageId) .hideHelp(!advanced))
    .addOption(new Option('--app-message-type <MESSAGE_TYPE>', chalk.whiteBright('[advanced] the user-defined application message type')) .default(defaultMessageConfig.appMessageType) .hideHelp(!advanced))
    .addOption(new Option('--delivery-mode <MODE>', chalk.whiteBright(`[advanced] the requested message delivery mode: DIRECT or PERSISTENT`)) .default(defaultMessageConfig.deliveryMode) .argParser(parseDeliveryMode) .hideHelp(!advanced))
    .addOption(new Option('--reply-to-topic <TOPIC>', chalk.whiteBright('[advanced] string which is used as the topic name for a response message')) .argParser(parseSingleTopic) .default(defaultMessageConfig.replyTo) .hideHelp(!advanced))
    .addOption(new Option('--user-properties <PROPS...>', chalk.whiteBright('[advanced] the user properties as space-separated pairs if listing more than one (e.g., "name1: value1" "name2: value2")')) .argParser(parseUserProperties) .hideHelp(!advanced))

    // session options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SESSION SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('-cn, --client-name <CLIENT_NAME>', chalk.whiteBright('[advanced] the client name')) .default(getDefaultClientName('pub'), 'an auto-generated client name') .hideHelp(!advanced))
    .addOption(new Option('--description <DESCRIPTION>', chalk.whiteBright('[advanced] the application description')) .default(defaultMessagePublishConfig.description) .hideHelp(!advanced))
    .addOption(new Option('--read-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the read timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.readTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-timeout <MILLISECONDS>', chalk.whiteBright('[advanced] the timeout period for a connect operation')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionTimeout) .hideHelp(!advanced))
    .addOption(new Option('--connection-retries <MILLISECONDS>', chalk.whiteBright('[advanced] the number of times to retry connecting during initial connection setup')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retries <NUMBER>', chalk.whiteBright('[advanced] the number of times to retry connecting after a connected session goes down')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.connectionRetries) .hideHelp(!advanced))
    .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', chalk.whiteBright('[advanced] the amount of time between each attempt to connect to a host')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.reconnectRetryWait) .hideHelp(!advanced))
    .addOption(new Option('--include-sender-id [BOOLEAN]', chalk.whiteBright('[advanced] include a sender ID on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.includeSenderId) .hideHelp(!advanced))
    .addOption(new Option('--generate-sequence-number [BOOLEAN]', chalk.whiteBright('[advanced] include sequence number on messages sent')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSequenceNumber) .hideHelp(!advanced))
    .addOption(new Option('--wait-before-exit <NUMBER>', chalk.whiteBright('[advanced] wait for the specified number of seconds before exiting')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--exit-after <NUMBER>', chalk.whiteBright('[advanced] exit the session after specified number of seconds')) .argParser(parseNumber) .hideHelp(true))
    .addOption(new Option('--log-level <LEVEL>', chalk.whiteBright('[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')) .argParser(parseLogLevel) .default(defaultMessageConnectionConfig.logLevel) .hideHelp(!advanced))
    .addOption(new Option('--trace-visualization [BOOLEAN]', chalk.whiteBright('[advanced] trace visualization events')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .hideHelp(true))

    // publish options
    .addOption(new Option(`\n/* ${chalk.whiteBright('PUBLISH SETTINGS')} */`) .hideHelp(!advanced))
    .addOption(new Option('--publish-confirmation [BOOLEAN]', chalk.whiteBright('[advanced] generate publish confirmation')) .argParser(parseBoolean) .default(defaultMessageConfig.traceVisualization) .default(false) .hideHelp(!advanced))
    .addOption(new Option('--send-timestamps [BOOLEAN]', chalk.whiteBright('[advanced] include a send timestamp on sent messages')) .argParser(parseBoolean) .default(defaultMessageConnectionConfig.generateSendTimestamps) .hideHelp(!advanced))
    .addOption(new Option('--send-buffer-max-size <NUMBER>', chalk.whiteBright('[advanced] the maximum buffer size for the transport session.')) .argParser(parseNumber) .default(defaultMessageConnectionConfig.sendBufferMaxSize) .hideHelp(!advanced))

    // hidden option to use defaults 
    .addOption(new Option('-defaults, --use-defaults', chalk.whiteBright('use defaults feed run settings')) .hideHelp(true) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-hm, --help-more', chalk.whiteBright('display more help for command with options not shown in basic help')))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed run command examples')))
}


export const addFeedContributeOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the feed name')) )

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed contribute command examples')))
}

export const addFeedListOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-local, --local-only [BOOLEAN]', chalk.whiteBright('list local event feeds')) .argParser(parseBoolean) .default(true))
    .addOption(new Option('-community, --community-only [BOOLEAN]', chalk.whiteBright('list community event feeds')) .argParser(parseBoolean) .default(true))
    .addOption(new Option('-v, --verbose [BOOLEAN]', chalk.whiteBright('list feed details')) .argParser(parseBoolean) .default(false))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed list command examples')))
}

export const addFeedImportOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-archive, --archive-file <ARCHIVE_NAME>', chalk.whiteBright('the feed archive name')) .default('feed-export.zip'))

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed copy command examples')))
}

export const addFeedExportOptions = (cmd: Command, advanced: boolean) => {
  cmd
    .addOption(new Option('-feed, --feed-name <FEED_NAME>', chalk.whiteBright('the community feed name')) )
    .addOption(new Option('-community, --community-only [BOOLEAN]', chalk.whiteBright('list community event feeds')) .argParser(parseBoolean) .default(false))
    .addOption(new Option('-archive, --archive-file <ARCHIVE_NAME>', chalk.whiteBright('the feed archive name')) )

    // help options
    .addOption(new Option(`\n/* ${chalk.whiteBright('HELP OPTIONS')} */`))
    .addOption(new Option('-he, --help-examples',  chalk.whiteBright('show feed copy command examples')))
}
