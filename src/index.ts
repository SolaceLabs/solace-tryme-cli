import 'core-js'
import { program, Command, Option } from 'commander'
import {
  parseNumber,
  parseUserProperties,
  parseDeliveryMode,
  parseProtocol,
  parseSempProtocol,
  parsePubTopic,
  parseSubTopic,
  parseLogLevel,
  parseReplyTopic,
  parseSempNonOwnerPermission,
  parseSempQueueAccessType,
  parseBoolean,
  parseSempOperation,
  parseSempQueueTopics,
} from './utils/parse'
import defaults, { getDefaultTopic } from './utils/defaults';
import { publisher } from './lib/publish'
import { receiver} from './lib/receive'
import { requestor } from './lib/request'
import { replier } from './lib/reply'
import { queue } from './lib/queue';
import { version } from '../package.json'

const getClientName = () => `stm_${Math.random().toString(16).substring(2, 10)}`

export class Commander {
  program: Command
  help: boolean
  advanced: boolean

  constructor(help: boolean, advanced: boolean) {
    this.program = new Command()
    this.help = help;
    this.advanced = advanced;
  }

  init(): void {
    this.program
      .name('stm')
      .description('A Solace Try-Me client for the command line')
      .enablePositionalOptions()
      .allowUnknownOption(false)
      .version(`${version}`, '--version')
      .addOption(new Option('-hm, --help-more', 
        'display more help for command, all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
// publisher 
{
    const publishCmd:Command = this.program
      .command('publish')
      .description('publish message(s) to a topic.')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaults.url)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN (broker) name')
        .default(defaults.vpn)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaults.username)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaults.password)
        .hideHelp(this.advanced))

      // message options
      .addOption(new Option('--topic <TOPIC>', 
        'the message topic')
        .argParser(parsePubTopic)
        .default(getDefaultTopic('publish'))
        .hideHelp(this.advanced))
      .addOption(new Option('-m, --message <BODY>', 
        'the message body')
        .default(defaults.message)
        .hideHelp(this.advanced))
      .addOption(new Option('--stdin', 
        'read the message body from stdin')
        .hideHelp(this.advanced))
      .addOption(new Option('--count <COUNT>', 
        'the number of events to publish')
        .argParser(parseNumber)
        .default(defaults.count)
        .hideHelp(this.advanced))
      .addOption(new Option('--interval <MILLISECONDS>', 
        'the time to wait between publish')
        .argParser(parseNumber)
        .default(defaults.interval)
        .hideHelp(this.advanced))
      .addOption(new Option('--time-to-live <NUMBER>', 
        'the time to live is the number of milliseconds the message may be stored before it is discarded or moved to a DMQ')
        .argParser(parseNumber)
        .hideHelp(this.advanced))
      .addOption(new Option('--dmq-eligible', 
        'the DMQ eligible flag')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save command settings to the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view stored command settings from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--update [PATH]',
        'update stored command settings on the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--exec [PATH]',
        'load and execute stored command from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
          '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaults.publisherDescription)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-timeout <NUMBER>', 
        '[advanced] the timeout period (in milliseconds) for a connect operation') 
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting during initial connection setup')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting after a connected session goes down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) between each attempt to connect to a host')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive-interval-limit <NUMBER>', 
        '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--include-sender-id', 
        '[advanced] a sender ID be automatically included in the Solace-defined fields for each message sent')
        .hideHelp(!this.advanced))
      .addOption(new Option('--generate-sequence-number', 
        '[advanced] a sequence number is automatically included in the Solace-defined fields for each message sent')
        .hideHelp(!this.advanced))
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default(defaults.logLevel)
        .hideHelp(!this.advanced))

      // publish options
      .addOption(new Option('--send-timestamps', 
        '[advanced] a send timestamp to be automatically included in the Solace-defined fields foreach message sent')
        .hideHelp(!this.advanced))
      .addOption(new Option('--include-sender-id', 
        '[advanced] a sender ID to be automatically included in the Solace-defined fields foreach message sent')
        .hideHelp(!this.advanced))
      .addOption(new Option('--send-buffer-max-size <NUMBER>', 
        '[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--max-web-payload-size <NUMBER>', 
        '[advanced] the maximum payload size (in bytes) when sending data using the Web transport protocol')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--guaranteed-publisher', 
        '[advanced] a Guaranteed Messaging Publisher is automatically created when a session is connected')
        .hideHelp(!this.advanced))
      .addOption(new Option('--window-size <NUMBER>', 
        '[advanced] the maximum number of messages that can be published without acknowledgment')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--acknowledge-timeout <MILLISECONDS>', 
        '[advanced] the time to wait for an acknowledgement, in milliseconds, before retransmitting unacknowledged messages')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--acknowledge-mode <MODE>', 
        '[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED')
        .hideHelp(!this.advanced))

      // advanced message options
      .addOption(new Option('--message-id <ID>', 
        '[advanced] the application-provided message ID')
        .hideHelp(!this.advanced))
      .addOption(new Option('--message-type <TYPE>', 
        '[advanced] the application-provided message type')
        .hideHelp(!this.advanced))
      .addOption(new Option('--correlation-key <CKEY>', 
        '[advanced] the application-provided message correlation key for acknowledgement management')
        .hideHelp(!this.advanced))
      .addOption(new Option('--delivery-mode <MODE>', 
        '[advanced] the application-requested message delivery mode DIRECT, PERSISTENT or NON_PERSISTENT')
        .argParser(parseDeliveryMode)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reply-to-topic <TOPIC>', 
        '[advanced] string which is used as the topic name for a response message')
        .argParser(parsePubTopic)
        .hideHelp(!this.advanced))
      .addOption(new Option('--user-properties <PROPS...>', 
        '[advanced] the user properties (e.g., "name1: value1" "name2: value2")')
        .argParser(parseUserProperties)
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
      .allowUnknownOption(false)

    publishCmd.action((options: ClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(defaults);
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = publishCmd.getOptionValueSource(defaultKeys[i]);
      }
  
      publisher(options, cliOptions);
    })  
}

// receiver
{
    const receiveCmd:Command = this.program
      .command('receive')
      .description('receive messages from a queue or on topic(s).')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaults.url)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN name')
        .default(defaults.vpn)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaults.username)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaults.password)
        .hideHelp(this.advanced))
      .addOption(new Option('--topic <TOPIC...>', 
        'the message topic(s)')
        .argParser(parseSubTopic)
        .default([ getDefaultTopic('receive') ])
        .hideHelp(this.advanced))

      // receive from queue
      .addOption(new Option('-q, --queue <QUEUE>', 
        'the message queue')
        .hideHelp(this.advanced))
      .addOption(new Option('--create-if-missing', 
        '[advanced] create message queue if missing')
        .hideHelp(!this.advanced))
      .addOption(new Option('--create-subscriptions', 
        '[advanced] create subscription(s) on the queue')
        .hideHelp(!this.advanced))

      // output options
      .addOption(new Option('--pretty',
        'pretty print message')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save command settings to the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view stored command settings from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--update [PATH]',
        'update stored command settings on the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--exec [PATH]',
        'load and execute stored command from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaults.receiverDescription)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-timeout <NUMBER>', 
        '[advanced] the timeout period (in milliseconds) for a connect operation') 
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting during initial connection setup')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting after a connected session goes down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) between each attempt to connect to a host')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive-interval-limit <NUMBER>', 
        '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--receive-timestamps',
        '[advanced] a receive timestamp is recorded for each message and passed to the session\'s message callback receive handler')
        .hideHelp(!this.advanced))
      .addOption(new Option('--reapply-subscriptions', 
        '[advanced] to have the API remember subscriptions and reapply them upon calling on a disconnected session')
        .hideHelp(!this.advanced))
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default(defaults.logLevel)
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
      .allowUnknownOption(false)

    receiveCmd.action((options: ClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(defaults);
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = receiveCmd.getOptionValueSource(defaultKeys[i]);
      }

      receiver(options, cliOptions);
    })
}

// requestor
{
    const requestCmd:Command = this.program
      .command('request')
      .description('publish request and receive reply.')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaults.url)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN name')
        .default(defaults.vpn)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaults.username)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaults.password)
        .hideHelp(this.advanced))
      .addOption(new Option('--topic <TOPIC>', 
        'the request message topic')
        .argParser(parsePubTopic)
        .default(getDefaultTopic('request'))
        .hideHelp(this.advanced))
      .addOption(new Option('-m, --message <BODY>', 
        'the request message body')
        .default(defaults.requestMessage)
        .hideHelp(this.advanced))

      // output options
      .addOption(new Option('--pretty',
        'pretty print message')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save command settings to the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view stored command settings from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--update [PATH]',
        'update stored command settings on the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--exec [PATH]',
        'load and execute stored command from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaults.requestorDescription)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-timeout <NUMBER>', 
        '[advanced] the timeout period (in milliseconds) for a connect operation') 
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting during initial connection setup')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting after a connected session goes down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) between each attempt to connect to a host')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive-interval-limit <NUMBER>', 
        '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--user-properties <PROPS...>', 
        '[advanced] the user properties (e.g., "name1: value1" "name2: value2")')
        .argParser(parseUserProperties)
        .hideHelp(!this.advanced))
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default(defaults.logLevel)
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
      .allowUnknownOption(false)
 
    requestCmd.action((options: ClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(defaults);
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = requestCmd.getOptionValueSource(defaultKeys[i]);
      }

      requestor(options, cliOptions);
    })
}

// replier
{
    const replyCmd:Command = this.program
      .command('reply')
      .description('reply to request messages.')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaults.url)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN name')
        .default(defaults.vpn)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaults.username)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaults.password)
        .hideHelp(this.advanced))
      .addOption(new Option('--topic <TOPIC>', 
        'the message topic(s)')
        .argParser(parseReplyTopic)
        .default( getDefaultTopic('reply') )
        .hideHelp(this.advanced))

      // output options
      .addOption(new Option('--pretty',
        'pretty print message')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save command settings to the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view stored command settings from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--update [PATH]',
        'update stored command settings on the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--exec [PATH]',
        'load and execute stored command from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaults.replierDescription)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-timeout <NUMBER>', 
        '[advanced] the timeout period (in milliseconds) for a connect operation') 
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--connection-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting during initial connection setup')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retries <NUMBER>', 
        '[advanced] the number of times to retry connecting after a connected session goes down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--reconnect-retry-wait <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) between each attempt to connect to a host')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive <MILLISECONDS>', 
        '[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--keepalive-interval-limit <NUMBER>', 
        '[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--receive-timestamps',
        '[advanced] a receive timestamp is recorded for each message and passed to the session\'s message callback receive handler')
        .hideHelp(!this.advanced))
      .addOption(new Option('--reapply-subscriptions', 
        '[advanced] to have the API remember subscriptions and reapply them upon calling on a disconnected session')
        .hideHelp(!this.advanced))
      .addOption(new Option('--send-max-buffer-size <NUMBER>', 
        '[advanced] the maximum buffer size for the transport session, must be bigger than the largest message an application intends to send on the session')
        .argParser(parseNumber)
        .hideHelp(!this.advanced))
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default(defaults.logLevel)
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
          'show cli examples help'))
      .allowUnknownOption(false)

    replyCmd.action((options: ClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(defaults);
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = replyCmd.getOptionValueSource(defaultKeys[i]);
      }

      replier(options, cliOptions);
    })
}

// SEMP - Queue
{
    const queueCmd:Command = this.program
      .command('queue')
      .description('manage queues using SEMPv2.')

      // connect options
      .addOption(new Option('-SU, --semp-url <URL>', 
        'the semp url')
        .argParser(parseSempProtocol)
        .default(defaults.sempUrl)
        .hideHelp(this.advanced))
      .addOption(new Option('-sv, --semp-vpn <VPN>', 
        'the message VPN name')
        .default(defaults.sempVpn)
        .hideHelp(this.advanced))
      .addOption(new Option('-su, --semp-username <USER>', 
        'the semp username')
        .default(defaults.sempUsername)
        .hideHelp(this.advanced))
      .addOption(new Option('-sp, --semp-password <PASS>', 
        'the semp password')
        .default(defaults.sempPassword)
        .hideHelp(this.advanced))

      // semp scope
      .addOption(new Option('--operation <OPERATION>', 
        'semp operation: CREATE, UPDATE, DELETE')
        .argParser(parseSempOperation)
        .hideHelp(this.advanced))

      // semp QUEUE
      .addOption(new Option('--queue-name <QUEUE>', 
        'the name of the Queue')
        .hideHelp(this.advanced))
      .addOption(new Option('--access-type <ACCESSTYPE>', 
        'access type for delivering messages to consumer flows bound to the queue: EXCLUSIVE or NON-EXCLUSIVE')
        .argParser(parseSempQueueAccessType)
        .hideHelp(this.advanced))      
      .addOption(new Option('--add-subscriptions <TOPIC...>', 
        '[advanced] add topic subscriptions')
        .default([ ])
        .argParser(parseSempQueueTopics)
        .hideHelp(!this.advanced))
      .addOption(new Option('--remove-subscriptions <TOPIC...>', 
        '[advanced] remove topic subscriptions')
        .default([ ])
        .argParser(parseSempQueueTopics)
        .hideHelp(!this.advanced))
      .addOption(new Option('--dead-message-queue <DMQ>', 
        '[advanced] name of the Dead Message queue (DMQ) used by the queue')
        .default(defaults.deadMessageQueue)
        .hideHelp(!this.advanced))
      .addOption(new Option('--delivery-count-enabled <FLAG>', 
        '[advanced] message delivery count of messages received from the queue: true or false')
        .default(defaults.deliveryCountEnabled)
        .argParser(parseBoolean)
        .hideHelp(!this.advanced))
      .addOption(new Option('--egress-enabled <FLAG>', 
        '[advanced] transmission of messages from the queue: true or false')
        .default(defaults.egressEnabled)
        .argParser(parseBoolean)
        .hideHelp(!this.advanced))
      .addOption(new Option('--ingress-enabled <FLAG>', 
        '[advanced] reception of messages to the queue: true or false')
        .argParser(parseBoolean)
        .default(defaults.ingressEnabled)
        .hideHelp(!this.advanced))
      .addOption(new Option('--respect-ttl-enabled <FLAG>', 
        '[advanced] Enable or disable the respecting of the TTL for messages in the queue.')
        .argParser(parseBoolean)
        .default(defaults.respectTtlEnabled)
        .hideHelp(!this.advanced))
      .addOption(new Option('--redelivery-enabled <FLAG>', 
        '[advanced] enable or disable message redelivery')
        .default(defaults.redeliveryEnabled)
        .argParser(parseBoolean)
        .hideHelp(!this.advanced))
      .addOption(new Option('--max-redelivery-count <NUMBER>', 
        '[advanced] maximum number of times the queue will attempt redelivery')
        .argParser(parseNumber)
        .default(defaults.maxRedeliveryCount)
        .hideHelp(!this.advanced))
      .addOption(new Option('--partition-count <NUMBER>', 
        'the count of partitions of the queue')
        .argParser(parseNumber)
        .default(defaults.partitionCount)
        .hideHelp(this.advanced))
      .addOption(new Option('--partition-rebalance-delay <NUMBER>', 
        '[advanced] the delay (in seconds) before a partition rebalance is started once needed')
        .argParser(parseNumber)
        .default(defaults.partitionRebalanceDelay)
        .hideHelp(!this.advanced))
      .addOption(new Option('--partition-rebalance-max-handoff-time <NUMBER>', 
        '[advanced] the maximum time (in seconds) to wait before handing off a partition while rebalancing')
        .argParser(parseNumber)
        .default(defaults.partitionRebalanceMaxHandoffTime)
        .hideHelp(!this.advanced))
      .addOption(new Option('--non-owner-permission <PERMISSION>', 
        '[advanced] permission level for all consumers of the queue: no-access, read-only, consume, modify-topic or delete')
        .argParser(parseSempNonOwnerPermission)
        .default(defaults.nonOwnerPermission)
        .hideHelp(!this.advanced))      
        
      // configuration options
      .addOption(new Option('--save [PATH]',
        'save command settings to the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view stored command settings from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--update [PATH]',
        'update stored command settings on the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--exec [PATH]',
        'load and execute stored command from the local configuration file in json format, default path is ./stm-cli-config.json')
        .hideHelp(this.advanced))

      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show queue cli examples help'))
      .allowUnknownOption(false)
    
    queueCmd.action((options: ClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(defaults);
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = queueCmd.getOptionValueSource(defaultKeys[i]);
      }

      queue(options, cliOptions);
    })
}

  }
}