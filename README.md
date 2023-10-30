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


###Examples

###Publish
```shell
Examples:
// publish a message to broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'
stm publish

// publish on topic stm/cli/topic to broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'
stm publish -t stm/cli/topic

// publish 5 messages with 3 sec interval between publish on topic 'stm/cli/topic'
// to broker 'default' at broker URL 'ws://localhost:8008' with username 'default' and password 'default'.
```

###Receive
```shell
Examples:
// subscribe and receive message on stm/cli/topic on broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'
stm receive

// subscribe and receive message on specified topics on broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'
stm receive -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm receive -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"

// receive message from the specified queue on the broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'
stm receive -q my_queue

// receive message from the specified queue, optionally create the queue if found missing + add topic subscription on the broker 'default'
// at broker URL 'ws://localhost:8008' with username 'default' and password 'default'
stm receive -U ws://localhost:8008 -v default -u default -p default -q my_queue --create-if-missing -t stm/inventory stm/logistics

```

###Request
```shell
Examples:
// send request on default topic stm/cli/request to broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default' and receive reply
stm request

// send request on default topic stm/cli/request to broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'.
stm request -t stm/cli/request

// send request on the specified topic to broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default'.
stm request -U ws://localhost:8008 -v default -u default -p default -t stm/inventory
```

###Reply
```shell
Examples:
// receive request on default topic stm/cli/request from broker 'default'
// at broker URL 'ws://localhost:8008' with username 'default' and password 'default'
// and send reply
stm reply

// receive request on default topic stm/cli/request from broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default' // and send reply
stm reply -t stm/cli/request

// receive request on specified topics from broker 'default' at broker URL 'ws://localhost:8008'
// with username 'default' and password 'default' and send reply
stm reply -U ws://localhost:8008 -v default -u default -p default -t stm/inventory stm/logistics
stm reply -U ws://localhost:8008 -v default -u default -p default -t "stm/inventory/*" "stm/logistics/>"
```

### Quickstart

```shell
stm --help
```

| Options       | Description               |
| ------------- | ------------------------- |
|  --version             |output the version number|
|  -hm, --help-more      |display more help for command, all other options not shown in basic help|
|  -he, --help-examples  |show cli examples help|
|  -h, --help            |display help for command|

| Command | Description                                    |
| ------- | ---------------------------------------------- |
|  publish [options]     |publish message(s) to a topic.|
|  receive [options]     |receive messages from a queue or subscribing to topic(s).|
|  request [options]     |publish request and receive reply.|
|  reply [options]       |reply to request messages.|
|  help [command]        |display help for command|

### Publish

Publish message(s) to a topic.

```shell
stm publish --help
```

| Options | Description | 
| ------- | ------------ | 
|  -U, --url <URL>                |the broker url (default: "ws://localhost:8008")|
|  -v, --vpn <VPN>                |the message VPN name (default: "default")|
|  -u, --username <USER>          |the username (default: "default")|
|  -p, --password <PASS>          |the password (default: "default")|
|  --topic <TOPIC>            |the message topic (default: "stm/cli/topic")|
|  -m, --message <BODY>           |the message body (default: "Hello from Solace Try-Me CLI Publisher")|
|  -s, --stdin                    |read the message body from stdin|
|  -c, --count <COUNT>            |the number of events to publish (default: 1)|
|  -i, --interval <MILLISECONDS>  |the time to wait between publish (default: 1000)|
|  -ttl, --time-to-live <NUMBER>  |the time to live is the number of milliseconds the message may be stored before it is discarded or moved to a DMQ|
|  -dmq, --dmq-eligible           |the DMQ eligible flag|
|  --save [PATH]                  |save the settings to a local configuration file in json format, if filepath not specified, a default path of ./stm-cli-config.json is used|
|  --view [PATH]                  |view the stored settings from the local configuration file, if filepath not specified, a default path of ./stm-cli-config.json is used|
|  --exec [PATH]                |load stored settings from the local configuration file and launch a publisher, if filepath not specified, a default path of ./stm-cli-config.json is used|

In addition to the standard parameters, the following advanced parameters can be specified.

```shell
stm publish --help-more
```

| Options | Description | 
| ------- | ------------ | 
|  --client-name <NAME>                   |[advanced] the client name (default: an auto-generated client name)|
|  --description <DESCRIPTION>            |[advanced] the application description (default: "Publisher created via Solace Try-Me CLI")|
|  --connection-timeout <NUMBER>          |[advanced] the timeout period (in milliseconds) for a connect operation|
|  --connection-retries <NUMBER>          |[advanced] the number of times to retry connecting during initial connection setup|
|  --reconnect-retries <NUMBER>           |[advanced] the number of times to retry connecting after a connected session goes down|
|  --reconnect-retry-wait <MILLISECONDS>  |[advanced] the amount of time (in milliseconds) between each attempt to connect to a host|
|  --keepalive <MILLISECONDS>             |[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN|
|  --keepalive-interval-limit <NUMBER>    |[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down|
|  --include-sender-id                    |[advanced] a sender ID be automatically included in the Solace-defined fields for each message sent|
|  --generate-sequence-number             |[advanced] a sequence number is automatically included in the Solace-defined fields for each message sent|
|  --log-level <LEVEL>                    |[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")|
|  --send-timestamps                      |[advanced] a send timestamp to be automatically included in the Solace-defined fields foreach message sent|
|  --include-sender-id                    |[advanced] a sender ID to be automatically included in the Solace-defined fields foreach message sent|
|  --send-buffer-max-size <NUMBER>        |[advanced] the maximum buffer size for the transport session. This size must be bigger than the largest message an application intends to send on the session|
|  --max-web-payload-size <NUMBER>        |[advanced] the maximum payload size (in bytes) when sending data using the Web transport protocol|
|  --guaranteed-publisher                 |[advanced] a Guaranteed Messaging Publisher is automatically created when a session is connected|
|  --window-size <NUMBER>                 |[advanced] the maximum number of messages that can be published without acknowledgment|
|  --acknowledge-timeout <MILLISECONDS>   |[advanced] the time to wait for an acknowledgement, in milliseconds, before retransmitting unacknowledged messages|
|  --acknowledge-mode <MODE>              |[advanced] the acknowledgement receive mode - PER_MESSAGE or WINDOWED|
|  --message-id <ID>                      |[advanced] the application-provided message ID|
|  --message-type <TYPE>                  |[advanced] the application-provided message type|
|  --correlation-key <CKEY>               |[advanced] the application-provided message correlation key for acknowledgement management|
|  --delivery-mode <MODE>                 |[advanced] the application-requested message delivery mode DIRECT, PERSISTENT or NON_PERSISTENT|
|  --reply-to-topic <TOPIC>               |[advanced] string which is used as the topic name for a response message|
|  --user-properties <PROPS...>           |[advanced] the user properties (e.g., "name1: value1" "name2: value2")|

### Receive

Receive messages from a queue or on topic(s).

```shell
stm receive --help
```

| Options | Description | 
| ------- | ------------ | 
|  -U, --url <URL>         |the broker url (default: "ws://localhost:8008")|
|  -v, --vpn <VPN>         |the message VPN name (default: "default")|
|  -u, --username <USER>   |the username (default: "default")|
|  -p, --password <PASS>   |the password (default: "default")|
|  --topic <TOPIC...>  |the message topic(s) (default: ["stm/cli/topic"])|
|  -q, --queue <QUEUE>     |the message queue|
|  --pretty                |pretty print message|
|  --save [PATH]           |save the parameters to the local configuration file in json format, default path is ./stm-cli-config.json|
|  --view [PATH]           |list the parameters from the local configuration file in json format, default path is ./stm-cli-config.json|
|  --exec [PATH]         |load the parameters from the local configuration file in json format, default path is ./stm-cli-config.json|


In addition to the standard parameters, the following advanced parameters can be specified.

```shell
stm receive --help-more
```

| Options | Description | 
| ------- | ------------ | 
|  --create-if-missing                    |[advanced] create message queue if missing|
|  --create-subscriptions                 |[advanced] create subscription(s) on the queue|
|  --client-name <NAME>                   |[advanced] the client name (default: an auto-generated client name)|
|  --description <DESCRIPTION>            |[advanced] the application description (default: "Receiver created via Solace Try-Me CLI")|
|  --connection-timeout <NUMBER>          |[advanced] the timeout period (in milliseconds) for a connect operation|
|  --connection-retries <NUMBER>          |[advanced] the number of times to retry connecting during initial connection setup|
|  --reconnect-retries <NUMBER>           |[advanced] the number of times to retry connecting after a connected session goes down|
|  --reconnect-retry-wait <MILLISECONDS>  |[advanced] the amount of time (in milliseconds) between each attempt to connect to a host|
|  --keepalive <MILLISECONDS>             |[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN|
|  --keepalive-interval-limit <NUMBER>    |[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down|
|  --receive-timestamps                   |[advanced] a receive timestamp is recorded for each message and passed to the session's message callback receive handler|
|  --reapply-subscriptions                |[advanced] to have the API remember subscriptions and reapply them upon calling on a disconnected session|
|  --send-max-buffer-size <NUMBER>        |[advanced] the maximum buffer size for the transport session, must be bigger than the largest message an application intends to send on the session|
|  --log-level <LEVEL>                    |[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")|

### Request

Publish request and receive reply.

```shell
stm request --help
```

| Options | Description | 
| ------- | ------------ | 
|  -U, --url <URL>              |the broker url (default: "ws://localhost:8008")|
|  -v, --vpn <VPN>              |the message VPN name (default: "default")|
|  -u, --username <USER>        |the username (default: "default")|
|  -p, --password <PASS>        |the password (default: "default")|
|  --topic <TOPIC>          |the request message topic (default: "stm/cli/request")|
|  -m, --message <BODY>         |the request message body (default: "Hello request from Solace Try-Me CLI Requestor")|
|  --pretty                     |pretty print message|
|  --save [PATH]                |save the parameters to the local configuration file in json format, default path is ./stm-reqreply-config.json|
|  --view [PATH]                |list the parameters from the local configuration file in json format, default path is ./stm-reqreply-config.json|
|  --exec [PATH]              |load the parameters from the local configuration file in json format, default path is ./stm-reqreply-config.json|
|  -hm, --help-more             |show more help, display all other options not shown in basic help|
In addition to the standard parameters, the following advanced parameters can be specified.

```shell
stm request --help-more
```

| Options | Description | 
| ------- | ------------ | 
|  --client-name <NAME>                   |[advanced] the client name (default: an auto-generated client name)
|  --description <DESCRIPTION>            |[advanced] the application description (default: "Replier created via Solace Try-Me CLI")
|  --connection-timeout <NUMBER>          |[advanced] the timeout period (in milliseconds) for a connect operation
|  --connection-retries <NUMBER>          |[advanced] the number of times to retry connecting during initial connection setup
|  --reconnect-retries <NUMBER>           |[advanced] the number of times to retry connecting after a connected session goes down
|  --reconnect-retry-wait <MILLISECONDS>  |[advanced] the amount of time (in milliseconds) between each attempt to connect to a host
|  --keepalive <MILLISECONDS>             |[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN
|  --keepalive-interval-limit <NUMBER>    |[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down
|  --log-level <LEVEL>                    |[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")

### Reply

Reply to request messages.

```shell
stm reply --help
```

| Options | Description | 
| ------- | ------------ | 
|  -U, --url <URL>        |the broker url (default: "ws://localhost:8008")|
|  -v, --vpn <VPN>        |the message VPN name (default: "default")|
|  -u, --username <USER>  |the username (default: "default")|
|  -p, --password <PASS>  |the password (default: "default")|
|  --topic <TOPIC>    |the message topic(s) (default: "stm/cli/request")|
|  --pretty               |pretty print message|
|  --save [PATH]          |save the parameters to the local configuration file in json format, default path is ./stm-cli-config.json|
|  --view [PATH]          |list the parameters from the local configuration file in json format, default path is ./stm-cli-config.json|
|  --exec [PATH]        |load the parameters from the local configuration file in json format, default path is ./stm-cli-config.json|

In addition to the standard parameters, the following advanced parameters can be specified.

```shell
stm reply --help-more
```

| Options | Description | 
| ------- | ------------ | 
|  --client-name <NAME>                   |[advanced] the client name (default: an auto-generated client name)|
|  --description <DESCRIPTION>            |[advanced] the application description (default: "Replier created via Solace Try-Me CLI")|
|  --connection-timeout <NUMBER>          |[advanced] the timeout period (in milliseconds) for a connect operation|
|  --connection-retries <NUMBER>          |[advanced] the number of times to retry connecting during initial connection setup|
|  --reconnect-retries <NUMBER>           |[advanced] the number of times to retry connecting after a connected session goes down|
|  --reconnect-retry-wait <MILLISECONDS>  |[advanced] the amount of time (in milliseconds) between each attempt to connect to a host|
|  --keepalive <MILLISECONDS>             |[advanced] the amount of time (in milliseconds) to wait between sending out keep-alive messages to the VPN|
|  --keepalive-interval-limit <NUMBER>    |[advanced] the maximum number of consecutive Keep-Alive messages that can be sent without receiving a response before the session is declared down|
|  --log-level <LEVEL>                    |[advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")|