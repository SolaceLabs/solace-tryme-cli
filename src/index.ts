import 'core-js'
import { Command, Option } from 'commander'
import {
  parseNumber,
  parseUserProperties,
  parseDeliveryMode,
  parseProtocol,
  parsePubTopic,
  parseSubTopic,
  parseLogLevel,
  parseReplyTopic,
} from './utils/parse'
import {
  defaultUrl,
  defaultBroker,
  defaultUserName,
  defaultPassword,
  defaultMessage,
  defaultRequestMessage,
  defaultPublisherDescription,
  defaultReceiverDescription,
  defaultReplierDescription,
  defaultPublishTopic,
  defaultSubscribeTopic,
  defaultRequestTopic,
  defaultCount,
  defaultInterval,
  defaultLogLevel,
} from './utils/defaults';
import { publisher } from './lib/publisher'
import { receiver} from './lib/receiver'
import { requestor } from './lib/requestor'
import { replier } from './lib/replier'
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
      .addOption(new Option('-hm, --help-more', 'display more help for command, all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 'show cli examples help'))
// publisher 
{
    this.program
      .command('publish')
      .description('publish message(s) to a topic.')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker url')
        .argParser(parseProtocol)
        .default(defaultUrl)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN (broker) name')
        .default(defaultBroker)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaultUserName)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaultPassword)
        .hideHelp(this.advanced))

      // message options
      .addOption(new Option('-t, --topic <TOPIC>', 
        'the message topic')
        .argParser(parsePubTopic)
        .default(defaultPublishTopic)
        .hideHelp(this.advanced))
      .addOption(new Option('-m, --message <BODY>', 
        'the message body')
        .default(defaultMessage)
        .hideHelp(this.advanced))
      .addOption(new Option('-s, --stdin', 
        'read the message body from stdin')
        .hideHelp(this.advanced))
      .addOption(new Option('-c, --count <COUNT>', 
        'the number of events to publish')
        .argParser(parseNumber)
        .default(defaultCount)
        .hideHelp(this.advanced))
      .addOption(new Option('-i, --interval <MILLISECONDS>', 
        'the time to wait between publish')
        .argParser(parseNumber)
        .default(defaultInterval)
        .hideHelp(this.advanced))
      .addOption(new Option('-ttl, --time-to-live <NUMBER>', 
        'the time to live is the number of milliseconds the message may be stored before it is discarded or moved to a DMQ')
        .argParser(parseNumber)
        .hideHelp(this.advanced))
      .addOption(new Option('-dmq, --dmq-eligible', 
        'the DMQ eligible flag')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save the settings to a local configuration file in json format, if filepath not specified, a default path of ./stm-pub-config.json is used')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'view the stored settings from the local configuration file, if filepath not specified, a default path of ./stm-pub-config.json is used')
        .hideHelp(this.advanced))
      .addOption(new Option('--config [PATH]',
        'load stored settings from the local configuration file and launch a publisher, if filepath not specified, a default path of ./stm-pub-config.json is used')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
          '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaultPublisherDescription)
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
        .default(defaultLogLevel)
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
      .action(publisher)
}

// receiver
{
    this.program
      .command('receive')
      .description('receive messages from a queue or on topic(s).')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaultUrl)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN name')
        .default(defaultBroker)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaultUserName)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaultPassword)
        .hideHelp(this.advanced))
      .addOption(new Option('-t, --topic <TOPIC...>', 
        'the message topic(s)')
        .argParser(parseSubTopic)
        .default([ defaultSubscribeTopic ])
        .hideHelp(this.advanced))

      // receive from queue
      .addOption(new Option('-q, --queue <QUEUE>', 
        'the message queue')
        .hideHelp(this.advanced))
      .addOption(new Option('--create-if-missing', 
        '[advanced] create message queue if missing')
        .hideHelp(!this.advanced))
      .addOption(new Option('--add-subscriptions', 
        '[advanced] add subscription(s) to the queue')
        .hideHelp(!this.advanced))

      // output options
      .addOption(new Option('--pretty',
        'pretty print message')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save the parameters to the local configuration file in json format, default path is ./stm-pub-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'list the parameters from the local configuration file in json format, default path is ./stm-pub-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option(
        '--config [PATH]',
        'load the parameters from the local configuration file in json format, default path is ./stm-pub-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaultReceiverDescription)
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
        .default('ERROR')
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
      .allowUnknownOption(false)
      .action(receiver)
}

// requestor
{
    this.program
      .command('request')
      .description('publish request and receive reply.')

      // connect options
      .addOption(new Option('-U, --url <URL>', 
        'the broker service url')
        .argParser(parseProtocol)
        .default(defaultUrl)
        .hideHelp(this.advanced))
      .addOption(new Option('-v, --vpn <VPN>', 
        'the message VPN name')
        .default(defaultBroker)
        .hideHelp(this.advanced))
      .addOption(new Option('-u, --username <USER>', 
        'the username')
        .default(defaultUserName)
        .hideHelp(this.advanced))
      .addOption(new Option('-p, --password <PASS>', 
        'the password')
        .default(defaultPassword)
        .hideHelp(this.advanced))
      .addOption(new Option('-t, --topic <TOPIC>', 
        'the request message topic')
        .argParser(parsePubTopic)
        .default(defaultRequestTopic)
        .hideHelp(this.advanced))
      .addOption(new Option('-m, --message <BODY>', 
        'the request message body')
        .default(defaultRequestMessage)
        .hideHelp(this.advanced))

      // output options
      .addOption(new Option('--pretty',
        'pretty print message')
        .hideHelp(this.advanced))

      // configuration options
      .addOption(new Option('--save [PATH]',
        'save the parameters to the local configuration file in json format, default path is ./stm-reqreply-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option('--view [PATH]',
        'list the parameters from the local configuration file in json format, default path is ./stm-reqreply-config.json')
        .hideHelp(this.advanced))
      .addOption(new Option(
        '--config [PATH]',
        'load the parameters from the local configuration file in json format, default path is ./stm-reqreply-config.json')
        .hideHelp(this.advanced))

      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName(), 'an auto-generated client name')
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default(defaultReplierDescription)
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
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default('ERROR')
        .hideHelp(!this.advanced))
      .addOption(new Option('-hm, --help-more', 
        'show more help, display all other options not shown in basic help'))
      .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
      .allowUnknownOption(false)
      .action(requestor)
}

// replier
{
  this.program
    .command('reply')
    .description('reply to request messages.')

    // connect options
    .addOption(new Option('-U, --url <URL>', 
      'the broker service url')
      .argParser(parseProtocol)
      .default(defaultUrl)
      .hideHelp(this.advanced))
    .addOption(new Option('-v, --vpn <VPN>', 
      'the message VPN name')
      .default(defaultBroker)
      .hideHelp(this.advanced))
    .addOption(new Option('-u, --username <USER>', 
      'the username')
      .default(defaultUserName)
      .hideHelp(this.advanced))
    .addOption(new Option('-p, --password <PASS>', 
      'the password')
      .default(defaultPassword)
      .hideHelp(this.advanced))
    .addOption(new Option('-t, --topic <TOPIC>', 
      'the message topic(s)')
      .argParser(parseReplyTopic)
      .default( defaultRequestTopic )
      .hideHelp(this.advanced))

    // output options
    .addOption(new Option('--pretty',
      'pretty print message')
      .hideHelp(this.advanced))

    // configuration options
    .addOption(new Option('--save [PATH]',
      'save the parameters to the local configuration file in json format, default path is ./stm-pub-config.json')
      .hideHelp(this.advanced))
    .addOption(new Option('--view [PATH]',
      'list the parameters from the local configuration file in json format, default path is ./stm-pub-config.json')
      .hideHelp(this.advanced))
    .addOption(new Option(
      '--config [PATH]',
      'load the parameters from the local configuration file in json format, default path is ./stm-pub-config.json')
      .hideHelp(this.advanced))

    // advanced connect options
    .addOption(new Option('--client-name <NAME>', 
      '[advanced] the client name')
      .default(getClientName(), 'an auto-generated client name')
      .hideHelp(!this.advanced))
    .addOption(new Option('--description <DESCRIPTION>', 
      '[advanced] the application description')
      .default(defaultReceiverDescription)
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
      .default('ERROR')
      .hideHelp(!this.advanced))
    .addOption(new Option('-hm, --help-more', 
      'show more help, display all other options not shown in basic help'))
    .addOption(new Option('-he, --help-examples', 
        'show cli examples help'))
    .allowUnknownOption(false)
    .action(replier)
}

  }
}

export default Commander
