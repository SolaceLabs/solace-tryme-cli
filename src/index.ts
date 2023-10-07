import 'core-js'
import { Command, Option } from 'commander'
import { getClientName } from './utils/generator'
import {
  parseNumber,
  parseUserProperties,
  parseVariadicOfBooleanType,
  parseOutputMode,
  parseDeliveryMode,
  parseProtocol,
  parsePubTopic,
  parseSubTopic,
  parseLogLevel,
  parseDumpLevel,
} from './utils/parse'
import { pub } from './lib/pub'
import { sub } from './lib/sub'
import { version } from '../package.json'

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

    this.program
      .command('pub')
      .description('Publish a message to a topic.')

      // connect options
      .option('-U, --url <URL>', 'the broker service url', parseProtocol, 'ws://localhost:8008')
      .option('-v, --vpn <VPN>', 'the message VPN name', 'default')
      .option('-u, --username <USER>', 'the username', 'default')
      .option('-p, --password <PASS>', 'the password', 'default')
      .addOption(new Option('-cn, --client-name <NAME>', 
          'the client name')
        .default(getClientName(), 'an auto-generated client name'))

      // message options
      .option('-t, --topic <TOPIC>', 'the message topic', parsePubTopic, "stm/topic")
      .option('-m, --message <BODY>', 'the message body', 'Hello From Solace Try-Me CLI')
      .option('-s, --stdin', 'read the message body from stdin')
      .option('-c, --count <COUNT>', 'the number of events to publish', parseNumber, 1)
      .option('-i, --interval <MILLISECONDS>', 'the time to wait between publish', parseNumber, 0)
      .option('-ttl, --time-to-live <NUMBER>', 
        'the time to live is the number of milliseconds the message may be stored before it is discarded or moved to a DMQ', 
        parseNumber)
      .option('-dmq, --dmq-eligible', 'the DMQ eligible flag')
      // configuration options
      .option(
        '--save [PATH]',
        'save the settings to a local configuration file in json format, if filepath not specified, a default path of ./stm-pub-config.json is used',
      )
      .option(
        '--view [PATH]',
        'view the stored settings from the local configuration file, if filepath not specified, a default path of ./stm-pub-config.json is used',
      )
      .option(
        '--config [PATH]',
        'load stored settings from the local configuration file and lanuch a publisher, if filepath not specified, a default path of ./stm-pub-config.json is used',
      )
      // advanced connect options
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default("")
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
      .addOption(new Option('--reapply-subscriptions', 
        '[advanced] have the API remember subscriptions and reapply them upon calling connecting to a disconnected session')
        .hideHelp(!this.advanced))
      .addOption(new Option('--log-level <LEVEL>', 
        '[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE')
        .argParser(parseLogLevel)
        .default('ERROR')
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
      .addOption(new Option('--correlation-id <CID>', 
        '[advanced] the application-provided message correlation ID')
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
        '[advanced] the user properties (e.g., "name1:value1" "name2:value2")')
        .argParser(parseUserProperties)
        .hideHelp(!this.advanced))
      .addOption(new Option('--dump-message', 
        '[advanced] print published message')
        .hideHelp(!this.advanced))
      .option('-ah, --advanced-help', 'display advanced help with all parameters')
        .addHelpText('after', `
  Example:
    // publish a message with default settings (broker, vpn, username and password and topic).      
    stm pub

    // publish on topic 'stm/topic' with default settings (broker, vpn, username and password).    
    stm pub -t stm/topic

    // publish 5 messages with 1 sec interval between publish on topic 'stm/topic' 
    // to broker 'default' on endpoint 'ws://localhost:8008' with username 'default' and password 'default'.
    stm pub -U ws://localhost:8008 -v default -u default -p default -t stm/topic -c 5 -i 1000
    `
        )
      .allowUnknownOption(false)
      .action(pub)

    this.program
      .command('sub')
      .description('Subscribe to a topic.')
      // connect options
      .option('-U, --url <URL>', 'the broker service url', parseProtocol, 'ws://localhost:8008')
      .option('-v, --vpn <VPN>', 'the message VPN name', 'default')
      .option('-u, --username <USER>', 'the username', 'default')
      .option('-p, --password <PASS>', 'the password', 'default')
      // message options
      .option('-t, --topic <TOPIC...>', 'the message topic', ["stm/topic"])
      // output options
      .option(
        '--output-mode <default/pretty>',
        'choose between the default and pretty print mode',
        parseOutputMode,
        'default',
      )
      .addOption(new Option('--dump-level <DETAIL>', 
        'message dump details, one of values: PROPS, PAYLOAD, ALL')
        .argParser(parseDumpLevel)
        .default('PAYLOAD'))
      // configuration options
      .option(
        '--save [PATH]',
        'save the parameters to the local configuration file in json format, default path is ./stm-pub-config.json',
      )
      .option(
        '--view [PATH]',
        'list the parameters from the local configuration file in json format, default path is ./stm-pub-config.json',
      )
      .option(
        '--config [PATH]',
        'load the parameters from the local configuration file in json format, default path is ./stm-pub-config.json',
      )
      // advanced connect options
      .addOption(new Option('--client-name <NAME>', 
        '[advanced] the client name')
        .default(getClientName())
        .hideHelp(!this.advanced))
      .addOption(new Option('--description <DESCRIPTION>', 
        '[advanced] the application description')
        .default("")
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
        .option('-ah, --advanced-help', 'display advanced help with all parameters')
        .addHelpText('after', `
  Example:
    // subscribe with default settings (broker, vpn, username and password and topic).      
    stm sub

    // subscribe to topic 'stm/topic' with default settings (broker, vpn, username and password).    
    stm sub -t stm/topic

    // subscribe to multiple topics 'stm/topic/inventory' and 'stm/topic/logistics' 
    // to broker 'default' on endpoint 'ws://localhost:8008' with username 'default' and password 'default'.
    stm sub -U ws://localhost:8008 -v default -u default -p default -t stm/topic/inventory stm/topic/logistics

    // subscribe to wildcard topic 'stm/topic/inventory/*' and 'stm/topic/logistics/>' 
    // on broker 'default' on endpoint 'ws://localhost:8008' with username 'default' and password 'default'.
    stm sub -U ws://localhost:8008 -v default -u default -p default -t "stm/topic/inventory/*" "stm/topic/logistics/>"
    `
        )  
      .allowUnknownOption(false)
      .action(sub)
  }
}

export default Commander
