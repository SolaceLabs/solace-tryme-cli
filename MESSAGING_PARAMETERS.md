# Solace Try-Me CLI - Commands

---

__The stm cli utility__

```
Usage: stm [options] [command]

A Solace Try-Me client for the command line

Options:
  -v, --version         output the version number
  -he, --help-examples  show cli command examples
  -h, --help            display help for command

Commands:
  send [options]        Execute a send command
  receive [options]     Execute a receive command
  request [options]     Execute a request command
  reply [options]       Execute a reply command
  config [options]      Manage command configurations
  manage [options]      Manage broker connection and resources
```

# Messaging Commands

__Issue messaging commands: publish, receive, request and reply__

## Publish Events

<details>
<summary>Basic Parameters: <i><b>stm send -h</b></i> </summary>

```
Usage: stm send [options]

Execute a send command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                                   the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                                   the message VPN name (default: "default")
  -u, --username <USERNAME>                     the username (default: "default")
  -p, --password <PASSWORD>                     the password (default: "default")

  /* TOPIC SUBSCRIPTION SETTINGS */
  -t, --topic <TOPIC...>                        the topic(s) to publish the message(s) on as space-separated values (e.g., test/1 "user/2" "profile/3") (default: ["solace/try/me"])

  /* MESSAGE BODY SETTINGS */
  -m, --message <MESSAGE>                       the message body
  -f, --file <FILENAME>                         filename containing the message content
  -default, --default-message                   use default message body
  -empty, --empty-message                       use an empty message body
  --stdin                                       read the message body from stdin (default: false)

  /* MULTI-MESSAGE SETTINGS */
  --count <COUNT>                               the number of events to publish (default: 1)
  --interval <MILLISECONDS>                     the time to wait between publish (default: 1000)

  /* MESSAGE OUTPUT SETTINGS */
  --output-mode <MODE>                          [advanced] message print mode: DEFAULT, PROPS OR FULL (default: "DEFAULT")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                    the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                              display more help with options not shown in basic help
  -he, --help-examples                          show cli publish examples
  -h, --help                                    display help for command
```
</details>

<details>
<summary>Advanced Parameters: <i><b>stm send -hm</b></i> </summary>

```
Usage: stm send [options]

Execute a send command

Options:

  /* PARTITION KEY SETTINGS */
  --partition-keys-count <NUMBER>             [advanced] the partition keys count for generating simulated keys (min: 2)
  --partition-keys <KEY...>                   [advanced] the partition key(s) as space-separated values if listing more than one (e.g., RED GREEN BLUE)

  /* ADVANCED MESSAGE SETTINGS */
  --payload-type <PAYLOAD_TYPE>               [advanced] payload type: TEXT or BYTES (default: "text")
  -ttl, --time-to-live <MILLISECONDS>         [advanced] the time before a message is discarded or moved to a DMQ
  -dmq, --dmq-eligible [BOOLEAN]              [advanced] the DMQ eligible flag (default: true)
  --app-message-id <MESSAGE_ID>               [advanced] the user-defined application message ID
  --app-message-type <MESSAGE_TYPE>           [advanced] the user-defined application message type
  --delivery-mode <MODE>                      [advanced] the requested message delivery mode: DIRECT or PERSISTENT (default: "PERSISTENT")
  --reply-to-topic <TOPIC>                    [advanced] string which is used as the topic name for a response message
  --user-properties <PROPS...>                [advanced] the user properties as space-separated pairs if listing more than one (e.g., "name1: value1" "name2: value2")

  /* PUBLISH SESSION SETTINGS */
  -cn, --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>                 [advanced] the application description (default: "Publish application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>               [advanced] the read timeout period for a connect operation (default: 10000)
  --connection-timeout <MILLISECONDS>         [advanced] the timeout period for a connect operation (default: 3000)
  --connection-retries <MILLISECONDS>         [advanced] the number of times to retry connecting during initial connection setup (default: 3)
  --reconnect-retries <NUMBER>                [advanced] the number of times to retry connecting after a connected session goes down (default: 3)
  --reconnect-retry-wait <MILLISECONDS>       [advanced] the amount of time between each attempt to connect to a host (default: 3000)
  --include-sender-id [BOOLEAN]               [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]        [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                         [advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")

  /* PUBLISH SETTINGS */
  --send-timestamps [BOOLEAN]                 [advanced] include a send timestamp on sent messages (default: false)
  --send-buffer-max-size <NUMBER>             [advanced] the maximum buffer size for the transport session. (default: 65536)
  --window-size <NUMBER>                      [advanced] the maximum number of messages that can be published without acknowledgment (default: 50)
  --acknowledge-mode <MODE>                   [advanced] the acknowledgement receive mode: PER_MESSAGE or WINDOWED (default: "WINDOWED")
  --acknowledge-immediately [BOOLEAN]         [advanced] the broker to acknowledge message immediately (default: false)

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                       the command name (default: "send")
  --save [COMMAND_NAME]                       update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                            display more help with options not shown in basic help
  -he, --help-examples                        show cli publish examples
  -h, --help                                  display help for command
```
</details>

## Receive Events
<details>
<summary>Basic Parameters: <i><b>stm receive -h</b></i> </summary>

```

Usage: stm receive [options]

Execute a receive command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                               the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                               the message VPN name (default: "default")
  -u, --username <USERNAME>                 the username (default: "default")
  -p, --password <PASSWORD>                 the password (default: "default")

  /* TOPIC SUBSCRIPTION */
  -t, --topic <TOPIC...>                    the topic subscriptions as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*") (default: ["solace/try/me"])

  /* QUEUE ENDPOINT */
  -q, --queue <QUEUE>                       the message queue endpoint
  --create-if-missing [BOOLEAN]             create message queue if missing

  /* MESSAGE OUTPUT SETTINGS */
  --output-mode <MODE>                      [advanced] message print mode: DEFAULT, PROPS OR FULL (default: "DEFAULT")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                          display more help with options not shown in basic help
  -he, --help-examples                      show cli receive examples
  -h, --help                                display help for command

```
</details>

<details>
<summary>Advanced Parameters: <i><b>stm receive -hm</b></i> </summary>

```
Usage: stm receive [options]

Execute a receive command

Options:

  /* RECEIVE SESSION SETTINGS */
  -cn, --client-name <CLIENT_NAME>           [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>                [advanced] the application description (default: "Receive application created via Solace Try-Me CLI")
  --connection-timeout <NUMBER>              [advanced] the timeout period for a connect operation (default: 3000)
  --connection-retries <NUMBER>              [advanced] the number of times to retry connecting during initial connection setup (default: 3)
  --reconnect-retries <NUMBER>               [advanced] the number of times to retry connecting after a connected session goes down (default: 3)
  --reconnect-retry-wait <MILLISECONDS>      [advanced] the amount of time between each attempt to connect to a host (default: 3000)
  --receive-timestamps [BOOLEAN]             [advanced] include a receive timestamp on received messages (default: false)
  --reapply-subscriptions [BOOLEAN]          [advanced] reapply subscriptions upon calling on a disconnected session (default: true)
  --acknowledge-mode <MODE>                  [advanced] the acknowledgement mode: AUTO or CLIENT (default: "AUTO")
  --log-level <LEVEL>                        [advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                      the command name (default: "receive")
  --save [COMMAND_NAME]                      update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                           display more help with options not shown in basic help
  -he, --help-examples                       show cli receive examples
  -h, --help                                 display help for command

```

</details>

## Send Request Events

<details>
<summary>Basic Parameters: <i><b>stm request -h</b></i> </summary>

```

Usage: stm request [options]

Execute a request command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                                   the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                                   the message VPN name (default: "default")
  -u, --username <USERNAME>                     the username (default: "default")
  -p, --password <PASSWORD>                     the password (default: "default")

  /* TOPIC SUBSCRIPTION SETTINGS */
  -t, --topic <TOPIC>                           the message topic (default: "solace/try/me/request")

  /* MESSAGE BODY SETTINGS */
  -m, --message <MESSAGE>                       the message body
  -f, --file <FILENAME>                         filename containing the message content
  -default, --default-message                   use default message body
  -empty, --empty-message                       use an empty message body
  --stdin                                       read the message body from stdin (default: false)

  /* MULTI-MESSAGE SETTINGS */
  --count <COUNT>                               the number of requests to send (default: 1)

  /* MESSAGE OUTPUT SETTINGS */
  --output-mode <MODE>                          [advanced] message print mode: DEFAULT, PROPS OR FULL (default: "DEFAULT")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                    the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                              display more help with options not shown in basic help
  -he, --help-examples                          show cli request examples
  -h, --help                                    display help for command

```
</details>


<details>
<summary>Advanced Parameters: <i><b>stm request -hm</b></i> </summary>


```
Usage: stm request [options]

Execute a request command

Options:

  /* ADVANCED MESSAGE SETTINGS */
  --payload-type <PAYLOAD_TYPE>               [advanced] payload type: TEXT or BYTES (default: "text")
  -ttl, --time-to-live <MILLISECONDS>         [advanced] the time before a message is discarded or moved to a DMQ
  -dmq, --dmq-eligible [BOOLEAN]              [advanced] the DMQ eligible flag (default: true)
  --timeout <MILLISECONDS>                    [advanced] the timeout value (default: 5000)
  --application-message-id <MESSAGE_ID>       [advanced] the application provided message ID
  --application-message-type <MESSAGE_TYPE>   [advanced] the application provided message type
  --correlation-id <CORRELATION_ID>           [advanced] the application provided message correlation id for acknowledgement management (default: "current timestamp")
  --delivery-mode <MODE>                      [advanced] the application-requested message delivery mode: DIRECT or PERSISTENT (default: "PERSISTENT")
  --reply-to-topic <TOPIC>                    [advanced] string which is used as the topic name for a response message
  --user-properties <PROPS...>                [advanced] the user properties as space-separated values if listing more than one (e.g., "name1: value1" "name2: value2")

  /* REQUEST SESSION SETTINGS */
  -cn, --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>                 [advanced] the application description (default: "Request application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>               [advanced] the read timeout period for a connect operation (default: 10000)
  --connection-timeout <MILLISECONDS>         [advanced] the timeout period for a connect operation (default: 3000)
  --connection-retries <MILLISECONDS>         [advanced] the number of times to retry connecting during initial connection setup (default: 3)
  --reconnect-retries <NUMBER>                [advanced] the number of times to retry connecting after a connected session goes down (default: 3)
  --reconnect-retry-wait <MILLISECONDS>       [advanced] the amount of time between each attempt to connect to a host (default: 3000)
  --include-sender-id [BOOLEAN]               [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]        [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                         [advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")

  /* REQUEST SETTINGS */
  --send-timestamps [BOOLEAN]                 [advanced] include a send timestamp on sent messages (default: false)
  --send-buffer-max-size <NUMBER>             [advanced] the maximum buffer size for the transport session. (default: 65536)
  --window-size <NUMBER>                      [advanced] the maximum number of messages that can be published without acknowledgment (default: 50)
  --acknowledge-mode <MODE>                   [advanced] the acknowledgement receive mode: PER_MESSAGE or WINDOWED (default: "PER_MESSAGE")

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                       the command name (default: "request")
  --save [COMMAND_NAME]                       update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                            display more help with options not shown in basic help
  -he, --help-examples                        show cli request examples
  -h, --help                                  display help for command

```

</details>

## Receive Reply Events

<details>
<summary>Basic Parameters: <i><b>stm reply -h</b></i> </summary>

```
Usage: stm reply [options]

Execute a reply command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                                   the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                                   the message VPN name (default: "default")
  -u, --username <USERNAME>                     the username (default: "default")
  -p, --password <PASSWORD>                     the password (default: "default")

  /* TOPIC SUBSCRIPTION SETTINGS */
  -t, --topic <TOPIC...>                        the topic subscriptions as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*") (default: ["solace/try/me/request"])

  /* MESSAGE BODY SETTINGS */
  -m, --message <MESSAGE>                       the message body
  -f, --file <FILENAME>                         filename containing the message content
  -default, --default-message                   use default message body
  -empty, --empty-message                       use an empty message body
  --stdin                                       read the message body from stdin (default: false)

  /* MESSAGE OUTPUT SETTINGS */
  --output-mode <MODE>                          [advanced] message print mode: DEFAULT, PROPS OR FULL (default: "DEFAULT")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                    the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                              display more help with options not shown in basic help
  -he, --help-examples                          show cli reply examples
  -h, --help                                    display help for command

```


</details>

<details>
<summary>Advanced Parameters: <i><b>stm reply -hm</b></i> </summary>

```
Usage: stm reply [options]

Execute a reply command

Options:

  /* REPLY SESSION SETTINGS */
  -cn, --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>                 [advanced] the application description (default: "Reply application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>               [advanced] the read timeout period for a connect operation (default: 10000)
  --connection-timeout <MILLISECONDS>         [advanced] the timeout period for a connect operation (default: 3000)
  --connection-retries <MILLISECONDS>         [advanced] the number of times to retry connecting during initial connection setup (default: 3)
  --reconnect-retries <NUMBER>                [advanced] the number of times to retry connecting after a connected session goes down (default: 3)
  --reconnect-retry-wait <MILLISECONDS>       [advanced] the amount of time between each attempt to connect to a host (default: 3000)
  --include-sender-id [BOOLEAN]               [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]        [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                         [advanced] solace log level, one of values: FATAL, ERROR, WARN, INFO, DEBUG, TRACE (default: "ERROR")

  /* REPLY SETTINGS */
  --send-timestamps [BOOLEAN]                 [advanced] include a send timestamp on sent messages (default: false)
  --send-buffer-max-size <NUMBER>             [advanced] the maximum buffer size for the transport session. (default: 65536)

  /* ADVANCED MESSAGE SETTINGS */
  --payload-type <PAYLOAD_TYPE>               [advanced] payload type: TEXT or BYTES (default: "text")
  -ttl, --time-to-live <MILLISECONDS>         [advanced] the time before a message is discarded or moved to a DMQ
  -dmq, --dmq-eligible [BOOLEAN]              [advanced] the DMQ eligible flag (default: true)
  --application-message-id <MESSAGE_ID>       [advanced] the application provided message ID
  --application-message-type <MESSAGE_TYPE>   [advanced] the application provided message type
  --delivery-mode <MODE>                      [advanced] the application-requested message delivery mode: DIRECT or PERSISTENT (default: "PERSISTENT")
  --reply-to-topic <TOPIC>                    [advanced] string which is used as the topic name for a response message
  --user-properties <PROPS...>                [advanced] the user properties space-separated pairs if listing more than one (e.g., "name1: value1" "name2: value2")

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                       the command name (default: "reply")
  --save [COMMAND_NAME]                       update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                            display more help with options not shown in basic help
  -he, --help-examples                        show cli reply examples
  -h, --help                                  display help for command


```


</details>

# Manage Commands

## Manage Broker Connection

<details>
<summary>Basic Parameters: <i><b>stm manage connection -h</b></i> </summary>

```
Usage: stm manage connection [options]

Manage message VPN connection

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                              the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                              the message VPN name (default: "default")
  -u, --username <USERNAME>                the username (default: "default")
  -p, --password <PASSWORD>                the password (default: "default")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>               the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                         display more help with options not shown in basic help
  -he, --help-examples                     show cli connection examples
  -h, --help                               display help for command
```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage connection -hm</b></i> </summary>

```
Usage: stm manage connection [options]

Manage message VPN connection

Options:

  /* SESSION SETTINGS */
  --description <DESCRIPTION>            [advanced] the application description (default: "SEMP manage application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>          [advanced] the read timeout period for a connect operation (default: 10000)
  --connection-timeout <MILLISECONDS>    [advanced] the timeout period for a connect operation (default: 3000)
  --connection-retries <MILLISECONDS>    [advanced] the number of times to retry connecting during initial connection setup (default: 3)
  --reconnect-retries <NUMBER>           [advanced] the number of times to retry connecting after a connected session goes down (default: 3)
  --reconnect-retry-wait <MILLISECONDS>  [advanced] the amount of time between each attempt to connect to a host (default: 3000)
  --include-sender-id [BOOLEAN]          [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]   [advanced] include sequence number on messages sent (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                       display more help with options not shown in basic help
  -he, --help-examples                   show cli connection examples
  -h, --help                             display help for command

```

</details>

## Manage Broker SEMP Connection

<details>
<summary>Basic Parameters: <i><b>stm manage semp-connection -h</b></i> </summary>

```
Usage: stm manage semp-connection [options]

Manage SEMP connection

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker url (default:
                                             "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                           the message VPN name (default: "default")
  --semp-username <USERNAME>                 the username (default: "admin")
  --semp-password <PASSWORD>                 the password (default: "admin")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                 the configuration file (default:
                                             "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                       show cli semp-connection examples
  -h, --help                                 display help for command
```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage semp-connection -hm</b></i> </summary>

```
Usage: stm manage semp-connection [options]

Manage SEMP connection

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker url (default:
                                             "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                           the message VPN name (default: "default")
  --semp-username <USERNAME>                 the username (default: "admin")
  --semp-password <PASSWORD>                 the password (default: "admin")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                 the configuration file (default:
                                             "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                       show cli semp-connection examples
  -h, --help                                 display help for command
```

</details>

## Manage Queue

<details>
<summary>Basic Parameters: <i><b>stm manage queue -h</b></i> </summary>

```
Usage: stm manage queue [options]

Manage a queue

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker semp url (default: "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                           the message VPN name (default: "default")
  --semp-username <USERNAME>                 the semp username (default: "admin")
  --semp-password <PASSWORD>                 the semp password (default: "admin")

  /* OPERATION SETTINGS */
  --list [QUEUE]                             list existing queues, fetch details if queue specified
  --create [QUEUE]                           create a queue
  --update [QUEUE]                           update a queue
  --delete [QUEUE]                           delete a queue

  /* QUEUE SETTINGS */
  --access-type <ACCESS_TYPE>                access type for delivering messages to consumers: EXCLUSIVE or NON-EXCLUSIVE
  --add-subscriptions <TOPIC...>             the topic subscriptions to be added as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")
  --remove-subscriptions <TOPIC...>          the topic subscriptions to be removed as space-separated values if listing more than one (e.g., test/1 "user/>" "profile/*")
  --list-subscriptions [BOOLEAN]             the topic subscriptions on the queue (default: false)

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                 the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                           display more help with options not shown in basic help
  -he, --help-examples                       show cli queue examples
  -h, --help                                 display help for command
```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage queue -hm</b></i> </summary>

```
Usage: stm manage queue [options]

Manage a queue

Options:

  /* QUEUE SETTINGS */
  --owner <OWNER>                                  [advanced] the name of Client Username that owns the Queue (default: "default")
  --dead-message-queue <DMQ>                       [advanced] name of the Dead Message queue (DMQ)
  --delivery-count-enabled [BOOLEAN]               [advanced] enable message delivery count on received messages (default: false)
  --delivery-delay <NUMBER>                        [advanced] the delay in seconds, to apply to messages arriving on the queue before they are eligible for delivery (default: 0)
  --egress-enabled [BOOLEAN]                       [advanced] enable transmission of messages from the queue (default: true)
  --ingress-enabled [BOOLEAN]                      [advanced] enable reception of messages to the queue (default: true)
  --max-msg-size <NUMBER>                          [advanced] the maximum message size allowed in the Queue, in bytes (B) (default: 10000000)
  --max-msg-spool-usage <NUMBER>                   [advanced] the maximum message spool usage allowed by the Queue, in megabytes (MB) (default: 5000)
  --max-redelivery-count <NUMBER>                  [advanced] maximum number of times the queue will attempt redelivery (default: 0)
  --partition-count <NUMBER>                       [advanced] the count of partitions of the queue (default: 0)
  --partition-rebalance-delay <NUMBER>             [advanced] the delay (in seconds) before a partition rebalance is started once needed (default: 5)
  --partition-rebalance-max-handoff-time <NUMBER>  [advanced] the maximum time (in seconds) to wait before handing off a partition while rebalancing (default: 3)
  --permission <PERMISSION>                        [advanced] permission level for all consumers of the queue: no-access, read-only, consume, modify-topic or delete (default: "consume")
  --redelivery-enabled [BOOLEAN]                   [advanced] enable message redelivery (default: true)
  --respect-ttl-enabled [BOOLEAN]                  [advanced] enable respecting of the TTL for messages in the queue (default: false)

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                            the command name (default: "queue")
  --save [COMMAND_NAME]                            update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                                 display more help with options not shown in basic help
  -he, --help-examples                             show cli queue examples
  -h, --help                                       display help for command
```

</details>

## Manage Client Profile

<details>
<summary>Basic Parameters: <i><b>stm manage client-profile -h</b></i> </summary>

```
Usage: stm manage client-profile [options]

Manage a client-profile

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker semp url (default: "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                           the message VPN name (default: "default")
  --semp-username <USERNAME>                 the semp username (default: "admin")
  --semp-password <PASSWORD>                 the semp password (default: "admin")

  /* OPERATION SETTINGS */
  --list [CLIENT_PROFILE]                    list existing client-profiles, fetch details if client-profile specified
  --create [CLIENT_PROFILE]                  create a client-profile
  --update [CLIENT_PROFILE]                  update a client-profile
  --delete [CLIENT_PROFILE]                  delete a client-profile

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                 the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -hm, --help-more                           display more help with options not shown in basic help
  -he, --help-examples                       show cli client-profile examples
  -h, --help                                 display help for command
```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage client-profile -hm</b></i> </summary>

```
Usage: stm manage client-profile [options]

Manage a client-profile

Options:

  /* CLIENT PROFILE SETTINGS */
  --allow-guaranteed-endpoint-create-durability <TYPE>               [advanced] the types of Queues and Topic Endpoints that clients can create: all, durable or non-durable (default: "all")
  --allow-guaranteed-endpoint-create-enabled <BOOLEAN>               [advanced] enable or disable the Client Username (default: true)
  --allow-guaranteed-msg-receive-enabled <BOOLEAN>                   [advanced] enable or disable allowing clients to receive guaranteed messages. (default: true)
  --allow-guaranteed-msg-send-enabled <BOOLEAN>                      [advanced] enable or disable allowing clients to send guaranteed messages (default: true)
  --compression-enabled <BOOLEAN>                                    [advanced] enable or disable allowing clients to use compression. (default: true)
  --elidingEnabled <BOOLEAN>                                         [advanced] enable or disable message eliding (default: true)
  --max-egress-flow-count <NUMBER>                                   [advanced] the maximum number of transmit flows that can be created (default: 1000)
  --max-ingress-flow-count <NUMBER>                                  [advanced] the maximum number of receive flows that can be created by one client  (default: 1000)
  --max-subscription-count <NUMBER>                                  [advanced] the maximum number of subscriptions per client  (default: 256)
  --reject-msg-to-sender-on-no-subscription-match-enabled <BOOLEAN>  [advanced] enable or disable the sending of a NACK when no matching subscription found (default: true)

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                                              the command name (default: "client-profile")
  --save [COMMAND_NAME]                                              update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                                                   display more help with options not shown in basic help
  -he, --help-examples                                               show cli client-profile examples
  -h, --help                                                         display help for command

```

</details>

## Manage ACL Profile

<details>
<summary>Basic Parameters: <i><b>stm manage acl-profile -h</b></i> </summary>

```

Usage: stm manage acl-profile [options]

Manage a acl-profile

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                                the broker semp url (default: "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                                the message VPN name (default: "default")
  --semp-username <USERNAME>                      the semp username (default: "admin")
  --semp-password <PASSWORD>                      the semp password (default: "admin")

  /* OPERATION SETTINGS */
  --list [ACL_PROFILE]                            list existing acl-profiles, fetch details if acl-profile specified
  --create [ACL_PROFILE]                          create an acl-profile
  --update [ACL_PROFILE]                          update an acl-profile
  --delete [ACL_PROFILE]                          delete an acl-profile

  /* ACL PROFILE SETTINGS */
  --client-connect-default-action <ACCESS_TYPE>   the default action to take when a client using the ACL Profile connects to massage VPN: allow or disallow (default: "allow")
  --publish-topic-default-action <ACCESS_TYPE>    the default action to take when a client using the ACL Profile publishes to a topic: allow or disallow (default: "allow")
  --subscribe-topic-default-action <ACCESS_TYPE>  the default action to take when a client using the ACL Profile subscribes to a topic: allow or disallow (default: "allow")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                      the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                            show cli acl-profile examples
  -h, --help                                      display help for command

```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage acl-profile -hm</b></i> </summary>

```
Usage: stm manage acl-profile [options]

Manage a acl-profile

Options:

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                    the command name (default: "acl-profile")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -he, --help-examples                     show cli acl-profile examples
  -h, --help                               display help for command
```

</details>

## Manage Client Username

<details>
<summary>Basic Parameters: <i><b>stm manage client-username -h</b></i> </summary>

```
Usage: stm manage client-username [options]

Manage a client username

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker semp url (default: "http://localhost:8080/SEMP/v2/config")
  --semp-vpn <VPN>                           the message VPN name (default: "default")
  --semp-username <USERNAME>                 the semp username (default: "admin")
  --semp-password <PASSWORD>                 the semp password (default: "admin")

  /* OPERATION SETTINGS */
  --list [CLIENT_USERNAME]                   list existing client-usernames, fetch details if client-username specified
  --create [CLIENT_USERNAME]                 create a client-username
  --update [CLIENT_USERNAME]                 update a client-username
  --delete [CLIENT_USERNAME]                 delete a client-username

  /* CLIENT USERNAME SETTINGS */
  --client-profile <CLIENT_PROFILE>          the name of the Client profile (default: "stm-client-profile")
  --acl-profile <ACL_PROFILE>                the name of the ACL profile (default: "stm-acl-profile")
  --enabled <BOOLEAN>                        enable or disable the Client Username (default: true)
  --client-password <VPN_NAME>               the password for the Client Username (default: "")

  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>                 the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                       show cli client-username examples
  -h, --help                                 display help for command

```

</details>

<details>
<summary>Advanced Parameters: <i><b>stm manage client-username -hm</b></i> </summary>

```
Usage: stm manage client-username [options]

Manage a client username

Options:

  /* CONFIGURATION SETTINGS */
  --name <COMMAND_NAME>                    the command name (default: "client-username")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -he, --help-examples                     show cli client-username examples
  -h, --help                               display help for command

```

</details>

# Manage CLI Configuration Commands

<details>
<summary>Initialize Configuration: <i><b>stm config init -h</b></i> </summary>

```
Usage: stm config init [options]

Initialize command samples

Options:
  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>              the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                    show cli init commands examples
  -h, --help                              display help for command
```

</details>

<details>
<summary>List Configuration: <i><b>stm config list -h</b></i> </summary>

```
Usage: stm config list [options]

List command samples

Options:
  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>              the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                   the command name

  /* HELP OPTIONS */
  -he, --help-examples                    show cli list commands examples
  -h, --help                              display help for command
```

</details>

<details>
<summary>Delete Configuration: <i><b>stm config delete -h</b></i> </summary>

```
Usage: stm config delete [options]

Delete command sample

Options:
  /* CONFIGURATION SETTINGS */
  -c, --config <CONFIG_FILE>              the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                   the command name

  /* HELP OPTIONS */
  -he, --help-examples                    show cli delete command examples
  -h, --help                              display help for command
```

</details>