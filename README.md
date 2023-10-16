# Solace Try-Me CLI

---

Solace Try-Me CLI is a CLI Client on the command line to publish and receive messages from Solace PubSub+ Broker. Designed to help develop, test and debug Solace PubSub+ services and applications faster without the need to use a graphical interface.

## Documentation

Below is a quick start guide.

## Develop

Recommended version for Node environment:

- v18.\*.\*

``` shell
# Clone
git clone git@github.com:SolaceLabs/solace-tryme-cli.git

# Install dependencies
cd solace-tryme-cli
yarn install

# Compiles and hot-reloads for development
yarn run dev

# Compiles and minifies for production
yarn run build
```

After a successful build, the corresponding file for the successful build will appear in the `dist` directory and will need to be used in a Node.js environment.

If you need to package a binary executable, please refer to the following command.

```shell
# Install pkg lib
npm install pkg -g

# Build binary
pkg package.json
```

After a successful build, you will see the binary executable for each system in the `release` directory.

##### Run from build

Install the required node modules and build the project.

```
npm install --save
npm run build
```

If you are planning to run from the build, ensure that the ``ts-node`` is installed via ``npm install ts-node``

No you can run from the build using ts-node.

```
$ ts-node bin/index.js help

Usage: stm [options] [command]

A Solace Try-Me client for the command line

Options:
  -v, --version   output the version number
  -h, --help      display help for command

Commands:
  pub [options]   Publish a message to a topic.
  recv [options]  Subscribe to a topic.
  help [command]  display help for command
```
## Technology Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [pkg](https://github.com/vercel/pkg)
- [PubSub+ JavaScript API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/nodejs/index.html)


### Quickstart

####Receive

```shell
## direct receiver with topic(s) subscription
// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and subscribe to topic 'stm/topic'
stm recv

// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and subscribe to topic 'stm/topic/inventory'
stm recv -t stm/topic/inventory

// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and subscribe to topics 'stm/topic/inventory' and 'stm/topic/logistics'
stm recv -U ws://localhost:8008 -v default -u default -p default -t stm/topic/inventory stm/topic/logistics

// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and subscribe to topics 'stm/topic/inventory/*' and 'stm/topic/logistics/>'
stm recv -U ws://localhost:8008 -v default -u default -p default -t "stm/topic/inventory/*" "stm/topic/logistics/>"

## guaranteed receiver from a queue
stm recv -q my_queue
stm recv -U ws://localhost:8008 -v default -u default -p default -q my_queue --create-if-missing -t stm/topic/inventory stm/topic/logistics

```

####Publish


```shell
// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and publish to default topic 'stm/topic'
stm pub

// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and publish to topic 'stm/topic/inventory'
stm pub -t stm/topic/inventory

// connect to endpoint 'ws://localhost:8008' with username 'default', password 'default' and publish 5 messages with 1 second interval to default topic 'stm/topic'
stm pub -U ws://localhost:8008 -v default -u default -p default -t stm/topic -c 5 -i 1000

```

### Help

```shell
stm --help
```

| Options       | Description               |
| ------------- | ------------------------- |
| -h, --help    | Display help for command  |

| Command | Description                                    |
| ------- | ---------------------------------------------- |
| pub     | Publish a message to a topic                   |
| recv     | Receive messages from a queue or directly by subscribing to one or multiple topics           |

### Receive

```shell
stm recv --help
```

| Options                                          | Description                                                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| -U, --url <URL>                            | the broker service url (default: "ws://localhost:8008")                                                                                                          |
| -v, --vpn <VPN>                                | the message VPN name (default: "default")                                                                                                                                 |
| -u, --username <USER>                             | the username (default: "default")                                                                                                                                   |
| -p, --password <PASS>                                | the password (default: "default")                                                                                                            |
| -t, --topic <TOPIC>                              | the message topic                                                                                                                               |
| -q, --queue <QUEUE>                              | the message queue                                                                                                                               |
| --create-if-missing                              | create message queue if missing                                                                                                                               |
| --pretty                            | pretty print message                                                                                                     |
| --save [PATH]                            | save the settings to a local configuration file in json format, if filepath not specified, a default path of ./stm-recv-config.json is used                                                            |
| --view [PATH]                           | view the stored settings from the local configuration file, if filepath not specified, a default path of ./stm-recv-config.json is used                                                                                    |
| --config [PATH]                                    | load stored settings from the local configuration file and launch a subscriber, if filepath not specified, a default path of ./stm-recv-config.json is used                                                                                                          |
| -ah, --advanced-help                                    | display advanced help with all parameters                                                                                                          |
| -h, --help                                    | display help for command                                                                                                          |
```shell
stm recv --advanced-help
```

In addition to the standard parameters, the following advanced parameters can be specified.

| Options                                          | Description                                                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| --client-name <NAME>                              | the client name (default: an application generated name like "stm_45a63b74")  |
| --description <DESCRIPTION>                       | the application description (default: "")  |
| --connection-timeout <NUMBER>                     | the timeout period (in milliseconds) for a connect operation  |
| --connection-retries <NUMBER>                     | the number of times to retry connecting during initial connection setup  |
| --reconnect-retries <NUMBER>                      | the number of times to retry connecting after a connected session goes down  |
| --reconnect-retry-wait <MILLISECONDS>             | the amount of time (in milliseconds) between each attempt to connect to a host  |
| --keepalive <MILLISECONDS>                        | the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN  |
| --keepalive-interval-limit <NUMBER>               | the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down  |
| --receive-timestamps                              | a receive timestamp is recorded for each message and passed to the session's message callback receive handler  |
| --reapply-subscriptions                           | to have the API remember subscriptions and reapply them upon calling on a disconnected session  |
| --send-max-buffer-size <NUMBER>                   | the maximum buffer size for the transport session, must be bigger than the largest message an application intends to send on the session  |
| --log-level <LEVEL>                               | solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")  |                                                            

### Publish

```shell
stm pub --help
```

| Options                                          | Description                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
|    -U, --url <URL>                |  the broker service url (default: "ws://localhost:8008")	|
|    -v, --vpn <VPN>                |  the message VPN name (default: "default")	|
|    -u, --username <USER>          |  the username (default: "default")	|
|    -p, --password <PASS>          |  the password (default: "default")	|
|    -cn, --client-name <NAME>      |  the client name (default: an auto-generated client name)	|
|    -t, --topic <TOPIC>            |  the message topic (default: "stm/topic")	|
|    -m, --message <BODY>           |  the message body (default: "Hello From Solace Try-Me CLI")	|
|    -s, --stdin                    | read the message body from stdin	|
|    -c, --count <COUNT>            |  the number of events to publish (default: 1)	|
|    -i, --interval <MILLISECONDS>  |  the time to wait between publish (default: 0)	|
|    -ttl, --time-to-live <NUMBER>  |  the time to live is the number of milliseconds the message may be stored before it is discarded or moved to a DMQ	|
|    -dmq, --dmq-eligible           |  the DMQ eligible flag	|
|    --save [PATH]                  |  save the parameters to the local configuration file in json format, default path is ./stm-pub-config.json	|
|    --view [PATH]                  |  list the parameters from the local configuration file in json format, default path is ./stm-pub-config.json	|
|    --config [PATH]                |  load the parameters from the local configuration file in json format, default path is ./stm-pub-config.json	|
|    -ah, --advanced-help           |  display advanced help with all parameters	|
|    -h, --help                     |  display help for command	|

```shell
stm pub --advanced-help
```

In addition to the standard parameters, the following advanced parameters can be specified.

| Options                                          | Description                                                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
|    --description <DESCRIPTION>            | [advanced] the application description (default: "")	|
|    --connection-timeout <NUMBER>          | [advanced] the timeout period (in milliseconds) for a connect operation	|
|    --connection-retries <NUMBER>          | [advanced] the number of times to retry connecting during initial connection setup	|
|    --reconnect-retries <NUMBER>           | [advanced] the number of times to retry connecting after a connected session goes down	|
|    --reconnect-retry-wait <MILLISECONDS>  | [advanced] the amount of time (in milliseconds) between each attempt to connect to a host	|
|    --keepalive <MILLISECONDS>             | [advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN	|
|    --keepalive-interval-limit <NUMBER>    | [advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before	the session is declared down	|
|    --include-sender-id                    | [advanced] a sender ID be automatically included in the Solace-defined fields for each message sent	|
|    --generate-sequence-number             | [advanced] a sequence number is automatically included in the Solace-defined fields for each message sent	|
|    --log-level <LEVEL>                    | [advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")	|
|    --send-timestamps                      | [advanced] a send timestamp to be automatically included in the Solace-defined fields foreach message sent	|
|    --include-sender-id                    | [advanced] a sender ID to be automatically included in the Solace-defined fields foreach message sent	|
|    --send-buffer-max-size <NUMBER>        | [advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an	application intends to send on the session	|
|    --max-web-payload-size <NUMBER>        | [advanced] the maximum payload size (in bytes) when sending data using the Web transport protocol	|
|    --guaranteed-publisher                 | [advanced] a Guaranteed Messaging Publisher is automatically created when a session is connected	|
|    --window-size <NUMBER>                 | [advanced] the maximum number of messages that can be published without acknowledgment	|
|    --acknowledge-timeout <MILLISECONDS>   | [advanced] the time to wait for an acknowledgement, in milliseconds, before retransmitting unacknowledged messages	|
|    --acknowledge-mode <MODE>              | [advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED	|
|    --message-id <ID>                      | [advanced] the application-provided message ID	|
|    --message-type <TYPE>                  | [advanced] the application-provided message type	|
|    --correlation-id <CID>                 | [advanced] the application-provided message correlation ID	|
|    --correlation-key <CKEY>               | [advanced] the application-provided message correlation key for acknowledgement management	|
|    --delivery-mode <MODE>                 | [advanced] the application-requested message delivery mode DIRECT, PERSISTENT or NON_PERSISTENT	|
|    --reply-to-topic <TOPIC>               | [advanced] string which is used as the topic name for a response message	|
|    --user-properties <PROPS...>           | [advanced] the user properties (e.g., "name1:value1" "name2:value2")	|
|    --dump-message                         | [advanced] print published message	|

## License

[TODO]