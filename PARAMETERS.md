# Solace Try-Me CLI - Commands

---

__The stm cli utility__

```
Usage: stm [options] [command]

A Solace Try-Me client for the command line

Options:
  -v, --version      output the version number
  -h, --help         display help for command

Commands:
  publish [options]  Execute a publish command
  receive [options]  Execute a receive command
  request [options]  Execute a request command
  reply [options]    Execute a reply command
  config             Manage command configurations
  manage             Manage broker connection and resources
  help [command]     display help for command
```

# Messaging Commands

__Issue messaging commands: publish, receive, request and reply__

## Publish Events

```
Usage: stm publish [options]

Execute a publish command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                              the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                              the message VPN name (default: "default")
  --username <USERNAME>                    the username (default: "default")
  --password <PASSWORD>                    the password (default: "default")

  /* SESSION SETTINGS */
  --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>            [advanced] the application description (default: "Publish
                                         application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>          [advanced] the read timeout period for a connect operation
  --connection-timeout <MILLISECONDS>    [advanced] the timeout period for a connect operation
  --connection-retries <MILLISECONDS>    [advanced] the number of times to retry connecting during initial
                                         connection setup
  --reconnect-retries <NUMBER>           [advanced] the number of times to retry connecting after a connected
                                         session goes down
  --reconnect-retry-wait <MILLISECONDS>  [advanced] the amount of time between each attempt to connect to a
                                         host (default: 3000)
  --keepalive <MILLISECONDS>             [advanced] the amount of time to wait between sending out keep-alive
                                         messages to the VPN (default: 3000)
  --keepalive-interval-limit <NUMBER>    [advanced] the maximum number of consecutive Keep-Alive messages
                                         that can be sent without receiving a response before the session is
                                         declared down
  --include-sender-id [BOOLEAN]          [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]   [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                    [advanced] solace log level, one of values: FATAL, ERROR, WARN,
                                         INFO, DEBUG, TRACE (default: "ERROR")
  
  /* PUBLISH SETTINGS */
  --send-timestamps [BOOLEAN]            [advanced] include a send timestamp on sent messages
  --send-buffer-max-size <NUMBER>        [advanced] the maximum buffer size for the transport session. This
                                         size must be bigger than the largest message an application intends
                                         to send on the session (default: 65536)
  --window-size <NUMBER>                 [advanced] the maximum number of messages that can be published
                                         without acknowledgment (default: 50)
  --acknowledge-timeout <MILLISECONDS>   [advanced] the time to wait for an acknowledgement, before
                                         retransmitting unacknowledged messages (default: 2000)
  --acknowledge-mode <MODE>              [advanced] the acknowledgement receive mode - PER_MESSAGE or
                                         WINDOWED (default: "PER_MESSAGE")
                                         
  /* MESSAGE SETTINGS */
  --topic <TOPIC...>                       the message topic(s) (default: ["solace/try/me"])
  --message <MESSAGE>                      the message body (default:
                                           "{\"osType\":\"OS_TYPE\",\"freeMem\":\"FREE_MEM\",\"totalMem\":\"TOTAL_MEM\",\"timeZone\":\"TIME_ZONE\"}")
  --stdin                                  read the message body from stdin (default: false)
  --count <COUNT>                          the number of events to publish (default: 1)
  --interval <MILLISECONDS>                the time to wait between publish (default: 3000)
  --time-to-live <MILLISECONDS>            the time before a message is discarded or moved to a DMQ
  --dmq-eligible [BOOLEAN]                 the DMQ eligible flag
  --message-id <MESSAGE_ID>              [advanced] the application-provided message ID
  --message-type <MESSAGE_TYPE>          [advanced] the application-provided message type
  --correlation-key <CORRELATION_KEY>    [advanced] the application-provided message correlation key for
                                         acknowledgement management
  --delivery-mode <MODE>                 [advanced] the application-requested message delivery mode
                                         0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT' (default: 0)
  --reply-to-topic <TOPIC>               [advanced] string which is used as the topic name for a response
                                         message
  --user-properties <PROPS...>           [advanced] the user properties (e.g., "name1: value1" "name2:
                                         value2")
  --output-mode <MODE>                   [advanced] message print mode: COMPACT, PRETTY, NONE
                                         
  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                   the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                    the command name (default: "publish")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                         display more help for command with options not shown in basic help
  -he, --help-examples                     show cli publish examples
  -h, --help                               display help for command
```

## Receive Events
```
Usage: stm receive [options]

Execute a receive command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                              the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                              the message VPN name (default: "default")
  --username <USERNAME>                    the username (default: "default")
  --password <PASSWORD>                    the password (default: "default")
  --topic <TOPIC...>                       the message topic(s) (default: ["solace/try/me"])

  /* QUEUE SETTINGS */
  --queue <QUEUE>                          the message queue
  --create-if-missing [BOOLEAN]          [advanced] create message queue if missing

  /* SESSION SETTINGS */
  --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>            [advanced] the application description
  --connection-timeout <NUMBER>          [advanced] the timeout period for a connect operation
  --connection-retries <NUMBER>          [advanced] the number of times to retry connecting during initial
                                         connection setup
  --reconnect-retries <NUMBER>           [advanced] the number of times to retry connecting after a connected
                                         session goes down
  --reconnect-retry-wait <MILLISECONDS>  [advanced] the amount of time between each attempt to connect to a
                                         host (default: 3000)
  --keepalive <MILLISECONDS>             [advanced] the amount of time to wait between sending out keep-alive
                                         messages to the VPN (default: 3000)
  --keepalive-interval-limit <NUMBER>    [advanced] the maximum number of consecutive Keep-Alive messages
                                         that can be sent without receiving a response before the session is
                                         declared down
  --receive-timestamps [BOOLEAN]         [advanced] include a receive timestamp on received messages
  --reapply-subscriptions [BOOLEAN]      [advanced] reapply subscriptions upon calling on a disconnected
                                         session (default: true)
  --output-mode <MODE>                   [advanced] message print mode: COMPACT, PRETTY, NONE
  --acknowledge-mode <MODE>              [advanced] the acknowledgement mode - AUTO or CLIENT (default:
                                         "AUTO")
  --log-level <LEVEL>                    [advanced] solace log level, one of values: FATAL, ERROR, WARN,
                                         INFO, DEBUG, TRACE (default: "ERROR")

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                   the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                    the command name (default: "receive")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                         display more help for command with options not shown in basic help
  -he, --help-examples                     show cli receive examples
  -h, --help                               display help for command
```
## Send Request Events
```Usage: stm request [options]

Execute a request command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                              the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                              the message VPN name (default: "default")
  --username <USERNAME>                    the username (default: "default")
  --password <PASSWORD>                    the password (default: "default")

  /* SESSION SETTINGS */
  --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>            [advanced] the application description (default: "Publish
                                         application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>          [advanced] the read timeout period for a connect operation
  --connection-timeout <MILLISECONDS>    [advanced] the timeout period for a connect operation
  --connection-retries <MILLISECONDS>    [advanced] the number of times to retry connecting during initial
                                         connection setup
  --reconnect-retries <NUMBER>           [advanced] the number of times to retry connecting after a connected
                                         session goes down
  --reconnect-retry-wait <MILLISECONDS>  [advanced] the amount of time between each attempt to connect to a
                                         host (default: 3000)
  --keepalive <MILLISECONDS>             [advanced] the amount of time to wait between sending out keep-alive
                                         messages to the VPN (default: 3000)
  --keepalive-interval-limit <NUMBER>    [advanced] the maximum number of consecutive Keep-Alive messages
                                         that can be sent without receiving a response before the session is
                                         declared down
  --include-sender-id [BOOLEAN]          [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]   [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                    [advanced] solace log level, one of values: FATAL, ERROR, WARN,
                                         INFO, DEBUG, TRACE (default: "ERROR")

  /* REQUEST SETTINGS */
  --send-timestamps [BOOLEAN]            [advanced] include a send timestamp on sent messages
  --send-buffer-max-size <NUMBER>        [advanced] the maximum buffer size for the transport session. This
                                         size must be bigger than the largest message an application intends
                                         to send on the session (default: 65536)
  --window-size <NUMBER>                 [advanced] the maximum number of messages that can be published
                                         without acknowledgment (default: 50)
  --acknowledge-timeout <MILLISECONDS>   [advanced] the time to wait for an acknowledgement, before
                                         retransmitting unacknowledged messages (default: 2000)
  --acknowledge-mode <MODE>              [advanced] the acknowledgement receive mode - PER_MESSAGE or
                                         WINDOWED (default: "PER_MESSAGE")
  
  /* MESSAGE SETTINGS */
  --topic <TOPIC>                          the message topic (default: "solace/try/me/request")
  --message <MESSAGE>                      the message body (default:
                                           "{\"osType\":\"boolean\",\"freeMem\":\"boolean\",\"totalMem\":\"boolean\",\"timeZone\":\"boolean\"}")
  --stdin                                  read the message body from stdin (default: false)
  --time-to-live <MILLISECONDS>            the time before a message is discarded or moved to a DMQ
  --dmq-eligible [BOOLEAN]                 the DMQ eligible flag
  --message-id <MESSAGE_ID>              [advanced] the application-provided message ID
  --message-type <MESSAGE_TYPE>          [advanced] the application-provided message type
  --correlation-key <CORRELATION_KEY>    [advanced] the application-provided message correlation key for
                                         acknowledgement management
  --delivery-mode <MODE>                 [advanced] the application-requested message delivery mode
                                         0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT' (default: 0)
  --reply-to <TOPIC>                     [advanced] string which is used as the topic name for a response
                                         message
  --user-properties <PROPS...>           [advanced] the user properties (e.g., "name1: value1" "name2:
                                         value2")
  --output-mode <MODE>                   [advanced] message print mode: COMPACT, PRETTY, NONE

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                   the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                    the command name (default: "request")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)

  /* HELP OPTIONS */
  -hm, --help-more                         display more help for command with options not shown in basic help
  -he, --help-examples                     show cli request examples
  -h, --help                               display help for command
```
## Receive Reply Events

```
Usage: stm reply [options]

Execute a reply command

Options:

  /* CONNECTION SETTINGS */
  --url <URL>                              the broker url (default: "ws://localhost:8008")
  --vpn <VPN>                              the message VPN name (default: "default")
  --username <USERNAME>                    the username (default: "default")
  --password <PASSWORD>                    the password (default: "default")

  /* SESSION SETTINGS */
  --client-name <CLIENT_NAME>            [advanced] the client name (default: an auto-generated client name)
  --description <DESCRIPTION>            [advanced] the application description (default: "Publish
                                         application created via Solace Try-Me CLI")
  --read-timeout <MILLISECONDS>          [advanced] the read timeout period for a connect operation
  --connection-timeout <MILLISECONDS>    [advanced] the timeout period for a connect operation
  --connection-retries <MILLISECONDS>    [advanced] the number of times to retry connecting during initial
                                         connection setup
  --reconnect-retries <NUMBER>           [advanced] the number of times to retry connecting after a connected
                                         session goes down
  --reconnect-retry-wait <MILLISECONDS>  [advanced] the amount of time between each attempt to connect to a
                                         host (default: 3000)
  --keepalive <MILLISECONDS>             [advanced] the amount of time to wait between sending out keep-alive
                                         messages to the VPN (default: 3000)
  --keepalive-interval-limit <NUMBER>    [advanced] the maximum number of consecutive Keep-Alive messages
                                         that can be sent without receiving a response before the session is
                                         declared down
  --include-sender-id [BOOLEAN]          [advanced] include a sender ID on sent messages (default: false)
  --generate-sequence-number [BOOLEAN]   [advanced] include sequence number on messages sent (default: false)
  --log-level <LEVEL>                    [advanced] solace log level, one of values: FATAL, ERROR, WARN,
                                         INFO, DEBUG, TRACE (default: "ERROR")

  /* REPLY SETTINGS */
  --send-timestamps [BOOLEAN]            [advanced] include a send timestamp on sent messages
  --send-buffer-max-size <NUMBER>        [advanced] the maximum buffer size for the transport session. This
                                         size must be bigger than the largest message an application intends
                                         to send on the session (default: 65536)
  --window-size <NUMBER>                 [advanced] the maximum number of messages that can be published
                                         without acknowledgment (default: 50)
  --acknowledge-timeout <MILLISECONDS>   [advanced] the time to wait for an acknowledgement, before
                                         retransmitting unacknowledged messages (default: 2000)
  --acknowledge-mode <MODE>              [advanced] the acknowledgement receive mode - PER_MESSAGE or
                                         WINDOWED (default: "PER_MESSAGE")

  /* MESSAGE SETTINGS */
  --topic <TOPIC...>                       the message topic(s) (default: ["solace/try/me"])
  --message <MESSAGE>                      the message body (default:
                                           "{\"osType\":\"boolean\",\"freeMem\":\"boolean\",\"totalMem\":\"boolean\",\"timeZone\":\"boolean\"}")
  --time-to-live <MILLISECONDS>            the time before a message is discarded or moved to a DMQ
  --dmq-eligible [BOOLEAN]                 the DMQ eligible flag

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                   the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                    the command name (default: "reply")
  --save [COMMAND_NAME]                    update existing or create a new command settings (default: false)
  --message-id <MESSAGE_ID>              [advanced] the application-provided message ID
  --message-type <MESSAGE_TYPE>          [advanced] the application-provided message type
  --correlation-key <CORRELATION_KEY>    [advanced] the application-provided message correlation key for
                                         acknowledgement management
  --delivery-mode <MODE>                 [advanced] the application-requested message delivery mode
                                         0-'DIRECT', 1-'PERSISTENT', and 2-'NON_PERSISTENT' (default: 0)
  --reply-to <TOPIC>                     [advanced] string which is used as the topic name for a response
                                         message
  --user-properties <PROPS...>           [advanced] the user properties (e.g., "name1: value1" "name2:
                                         value2")
  --output-mode <MODE>                   [advanced] message print mode: COMPACT, PRETTY, NONE

  /* HELP OPTIONS */
  -hm, --help-more                         display more help for command with options not shown in basic help
  -he, --help-examples                     show cli reply examples
  -h, --help                               display help for command

# Manage Commands

__Issue management commands (list, create, update and delete) to manage broker resources: queue, client-profile, acl-profile and client-userame.__

Usage: stm manage [options] [command]

Manage broker connection and resources

Options:
  -h, --help                 display help for command

Commands:
  queue [options]            Manage a queue
  client-profile [options]   Manage a client-profile
  acl-profile [options]      Manage a acl-profile
  client-username [options]  Manage a client username
  connection [options]       Manage message VPN connection
  semp-connection [options]  Manage SEMP connection
  help [command]             display help for command
```
## Manage Queue

```
Usage: stm manage queue [options]

Manage a queue

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker url
  --semp-vpn <VPN>                           the message VPN name
  --semp-username <USERNAME>                 the username
  --semp-password <PASSWORD>                 the password

  /* OPERATION SETTINGS */
  --list [QUEUE]                             list existing queues, fetch details if queue specified
  --create [QUEUE]                           create a queue
  --update [QUEUE]                           update a queue
  --delete [QUEUE]                           delete a queue

  /* QUEUE SETTINGS */
  --access-type <ACCESS_TYPE>                access type for delivering messages to consumers: EXCLUSIVE or
                                             NON-EXCLUSIVE (default: "exclusive")
  --add-subscriptions <TOPIC...>             the topic subscriptions to be added (default: ["solace/try/me"])
  --list-subscriptions [BOOLEAN]             the topic subscriptions on the queue (default: false)
  --owner <OWNER>                                  [advanced] the name of Client Username that owns the Queue
                                                   (default: "")
  --remove-subscriptions <TOPIC...>                [advanced] the topic subscriptions to be removed (default:
                                                   [])
  --dead-message-queue <DMQ>                       [advanced] name of the Dead Message queue (DMQ)
  --delivery-count-enabled [BOOLEAN]               [advanced] enable message delivery count on received
                                                   messages (default: false)
  --delivery-delay <NUMBER>                        [advanced] the delay in seconds, to apply to messages
                                                   arriving on the queue before they are eligible for
                                                   delivery (default: 0)
  --egress-enabled [BOOLEAN]                       [advanced] enable transmission of messages from the queue
                                                   (default: true)
  --ingress-enabled [BOOLEAN]                      [advanced] enable reception of messages to the queue
                                                   (default: true)
  --max-msg-size <NUMBER>                          [advanced] the maximum message size allowed in the Queue,
                                                   in bytes (B) (default: 10000000)
  --max-msg-spool-usage <NUMBER>                   [advanced] the maximum message spool usage allowed by the
                                                   Queue, in megabytes (MB) (default: 5000)
  --max-redelivery-count <NUMBER>                  [advanced] maximum number of times the queue will attempt
                                                   redelivery (default: 0)
  --partition-count <NUMBER>                       [advanced] the count of partitions of the queue (default:
                                                   0)
  --partition-rebalance-delay <NUMBER>             [advanced] the delay (in seconds) before a partition
                                                   rebalance is started once needed (default: 5)
  --partition-rebalance-max-handoff-time <NUMBER>  [advanced] the maximum time (in seconds) to wait before
                                                   handing off a partition while rebalancing (default: 3)
  --permission <PERMISSION>                        [advanced] permission level for all consumers of the queue
                                                   (no-access, read-only, consume, modify-topic or delete)
                                                   (default: "consume")
  --redelivery-enabled [BOOLEAN]                   [advanced] enable message redelivery (default: true)
  --respect-ttl-enabled [BOOLEAN]                  [advanced] enable respecting of the TTL for messages in
                                                   the queue (default: false)

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                     the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                      the command name (default: "queue")
  --save [COMMAND_NAME]                      update existing or create a new command settings (default:
                                             false)

  /* HELP OPTIONS */
  -hm, --help-more                           display more help for command with options not shown in basic
                                             help
  -he, --help-examples                       show cli queue examples
  -h, --help                                 display help for command
```
## Manage Client Profile

```
Usage: stm manage client-profile [options]

Manage a client-profile

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker url
  --semp-vpn <VPN>                           the message VPN name
  --semp-username <USERNAME>                 the username
  --semp-password <PASSWORD>                 the password

  /* OPERATION SETTINGS */
  --list [CLIENT_PROFILE]                    list existing client-profiles, fetch details if client-profile
                                             specified
  --create [CLIENT_PROFILE]                  create a client-profile
  --update [CLIENT_PROFILE]                  update a client-profile
  --delete [CLIENT_PROFILE]                  delete a client-profile

  /* CLIENT PROFILE SETTINGS */
  --allow-guaranteed-endpoint-create-durability <TYPE>               [advanced] the types of Queues and Topic
                                                                     Endpoints that clients can create (all,
                                                                     durable or non-durable (default: "all")
  --allow-guaranteed-endpoint-create-enabled <BOOLEAN>               [advanced] enable or disable the Client
                                                                     Username (default: true)
  --allow-guaranteed-msg-receive-enabled <BOOLEAN>                   [advanced] enable or disable allowing
                                                                     clients to receive guaranteed messages.
                                                                     (default: true)
  --allow-guaranteed-msg-send-enabled <BOOLEAN>                      [advanced] enable or disable allowing
                                                                     clients to send guaranteed messages
                                                                     (default: true)
  --compression-enabled <BOOLEAN>                                    [advanced] enable or disable allowing
                                                                     clients to use compression. (default:
                                                                     true)
  --elidingEnabled <BOOLEAN>                                         [advanced] enable or disable message
                                                                     eliding (default: true)
  --max-egress-flow-count <NUMBER>                                   [advanced] the maximum number of
                                                                     transmit flows that can be created
                                                                     (default: 1000)
  --max-ingress-flow-count <NUMBER>                                  [advanced] the maximum number of receive
                                                                     flows that can be created by one client
                                                                     (default: 1000)
  --max-subscription-count <NUMBER>                                  [advanced] the maximum number of
                                                                     subscriptions per client  (default: 256)
  --reject-msg-to-sender-on-no-subscription-match-enabled <BOOLEAN>  [advanced] enable or disable the sending
                                                                     of a NACK when no matching subscription
                                                                     found (default: true)

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                     the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                      the command name (default: "client-profile")
  --save [COMMAND_NAME]                      update existing or create a new command settings (default:
                                             false)

  /* HELP OPTIONS */
  -hm, --help-more                           display more help for command with options not shown in basic
                                             help
  -he, --help-examples                       show cli client-profile examples
  -h, --help                                 display help for command
```

## Manage ACL Profile
```
Usage: stm manage acl-profile [options]

Manage a acl-profile

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                                the broker url
  --semp-vpn <VPN>                                the message VPN name
  --semp-username <USERNAME>                      the username
  --semp-password <PASSWORD>                      the password

  /* OPERATION SETTINGS */
  --list [ACL_PROFILE]                            list existing acl-profiles, fetch details if acl-profile
                                                  specified
  --create [ACL_PROFILE]                          create an acl-profile
  --update [ACL_PROFILE]                          update an acl-profile
  --delete [ACL_PROFILE]                          delete an acl-profile

  /* ACL PROFILE SETTINGS */
  --client-connect-default-action <ACCESS_TYPE>   the default action to take when a client using the ACL
                                                  Profile connects to massage VPN (allow or disallow)
                                                  (default: "allow")
  --publish-topic-default-action <ACCESS_TYPE>    the default action to take when a client using the ACL
                                                  Profile publishes to a topic (allow or disallow) (default:
                                                  "allow")
  --subscribe-topic-default-action <ACCESS_TYPE>  the default action to take when a client using the ACL
                                                  Profile subscribes to a topic (allow or disallow) (default:
                                                  "allow")

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                          the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                           the command name (default: "acl-profile")
  --save [COMMAND_NAME]                           update existing or create a new command settings (default:
                                                  false)

  /* HELP OPTIONS */
  -he, --help-examples                            show cli acl-profile examples
  -h, --help                                      display help for command
```
## Manage Client Username

```
Usage: stm manage client-username [options]

Manage a client username

Options:

  /* SEMP CONNECTION SETTINGS */
  --semp-url <URL>                           the broker url
  --semp-vpn <VPN>                           the message VPN name
  --semp-username <USERNAME>                 the username
  --semp-password <PASSWORD>                 the password

  /* OPERATION SETTINGS */
  --list [CLIENT_USERNAME]                   list existing client-usernames, fetch details if client-username
                                             specified
  --create [CLIENT_USERNAME]                 create a client-username
  --update [CLIENT_USERNAME]                 update a client-username
  --delete [CLIENT_USERNAME]                 delete a client-username

  /* CLIENT USERNAME SETTINGS */
  --client-profile <CLIENT_PROFILE>          the name of the Client profile (default: "stm-client-profile")
  --acl-profile <ACL_PROFILE>                the name of the ACL profile (default: "stm-acl-profile")
  --enabled <BOOLEAN>                        enable or disable the Client Username (default: true)
  --client-password <VPN_NAME>               the password for the Client Username (default: "")

  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                     the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                      the command name (default: "client-username")
  --save [COMMAND_NAME]                      update existing or create a new command settings (default:
                                             false)

  /* HELP OPTIONS */
  -he, --help-examples                       show cli client-username examples
  -h, --help                                 display help for command
```
# Configuration Commands

__Commands to manage persistence of commands for reuse.__

```
Usage: stm config [options] [command]

Manage command configurations

Options:
  -h, --help        display help for command

Commands:
  init [options]    Initialize command samples
  list [options]    List command samples
  delete [options]  Delete command sample
  help [command]    display help for command

## Initialize commands with default settings

Usage: stm config init [options]

Initialize command samples

Options:
  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                  the configuration file (default: "stm-cli-config.json")

  /* HELP OPTIONS */
  -he, --help-examples                    show cli init commands examples
  -h, --help                              display help for command
```
## List commands from the configuration

```
Usage: stm config list [options]

List command samples

Options:
  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                  the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                   the command name

  /* HELP OPTIONS */
  -he, --help-examples                    show cli list commands examples
  -h, --help                              display help for command

```
## Delete commands in the configuration

```
Usage: stm config delete [options]

Delete command sample

Options:
  /* CONFIGURATION SETTINGS */
  --config <CONFIG_FILE>                  the configuration file (default: "stm-cli-config.json")
  --name <COMMAND_NAME>                   the command name

  /* HELP OPTIONS */
  -he, --help-examples                    show cli delete command examples
  -h, --help                              display help for command
```