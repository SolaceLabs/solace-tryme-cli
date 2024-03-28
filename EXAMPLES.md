# Messaging Commands

<details>
<summary>Publish Events: <i><b>stm send -he</b></i> </summary>

```
ℹ  info: loading 'send' command from configuration 'stm-cli-config.json'

Examples:
// execute the default publish command with settings defined on the
// default configuration 'stm-cli-config.json'

stm send

HINT: You can view the default publish command settings 'stm config list --name send'!

// execute the default publish command with settings defined on the default
// configuration 'stm-cli-config.json', but publish on topic specified in the
// command-line (overriding the command settings)

stm send --topic solace/try/me

// publish with payload via the command-line parameter

stm send --topic solace/try/me -m "Hello World!"

// publish with a default payload

stm send --topic solace/try/me --default-message

// publish with payload from a file

stm send --topic solace/try/me -f OrderCreated.json

// publish with payload from stdin (console)

stm send --topic solace/try/me --stdin

// publish events to multiple events in a specified interval(ms)

stm send --topic solace/try/me --count 100 --interval 5000

// publish events to multiple topics

stm send --topic "stm/logistics/shipped" "stm/inventory/check"


You can override any of the publish parameters
and they are applied only for this instance of execution!

// If you want to run a publish entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm send --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me --count 5 --interval 1000

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)

stm send --count 100 --interval 1000 --name publish2 --config cloud-broker --save

// save an existing command setting to a new name in a configuration file

stm send --config cloud-broker --save publish2

// execute a specific publish command from the named configuration

stm send --config cloud-broker --name publish2

// Duplicate the command setting

stm send  --name publish2 --config cloud-broker --save publish3
```

</details>

<details>
<summary>Receive Events: <i><b>stm receive -he</b></i> </summary>

```
ℹ  info: loading 'receive' command from configuration 'stm-cli-config.json'

Examples:
// execute the default receive command with settings defined on the
// default configuration 'stm-cli-config.json' which subscribes to
// a default topic solace/try/me

stm receive

// receive events from a topic

stm receive -t "stm/logistics/shipped"

// receive events from multiple topics

stm receive -t "stm/logistics/shipped" "stm/inventory/check"

HINT: You can view the default receive command settings 'stm config list --name receive'!

// receive events from a queue, if queue is not found create a queue with the name
// optionally you can also specify a subscription to be added to the queue

stm receive --queue new-queue --create-if-missing --topic "solace/>"

// receive events from a queue

stm receive --queue my-queue

// receive events from a queue and add a subscription

stm receive --queue my-queue -t "stm/logistics/shipped"

NOTE: You can override any of the receive parameters
that are applied only for this instance of execution!

// If you want to run a receive entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// execute a specific receive command from the named configuration

stm receive --config cloud-broker --name receive

// Update the command setting with the specified command-line parameters (if specified)

stm receive --topic "stm/logistics/shipped" "stm/inventory/>" --name receive --config cloud-broker --save

// Duplicate the command setting

stm receive  --name receive --config cloud-broker --save receive2

// Duplicate the command setting with the specified command-line parameters

stm receive --topic "stm/logistics/*" --name receive2 --config cloud-broker --save receive4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

<details>
<summary>Send Request Events: <i><b>stm request -he</b></i> </summary>

```

ℹ  info: loading 'request' command from configuration 'stm-cli-config.json'

Examples:
// execute the default request command with settings defined on the
// default configuration 'stm-cli-config.json'

stm request

HINT: You can view the default request command settings 'stm config list --name request'!

// execute the default request command with settings defined on the default
// configuration 'stm-cli-config.json', but on the topic specified in the
// command-line (overriding the command settings)

stm request --topic solace/try/me/request

// request with payload via the command-line parameter

stm request --topic solace/try/me/request -m "Hello World!"

// request with a default payload

stm request --topic solace/try/me/request --default-message

// request with payload from a file

stm request --topic solace/try/me/request -f OrderCreated.json

// request with payload from stdin (console)

stm request --topic solace/try/me/request --stdin

NOTE: You can override any of the request parameters
that are applied only for this instance of execution!

// If you want to run a request entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm request --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me/request

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)

stm request --topic "stm/logistics/shipped" --name request --config cloud-broker --save

// execute a specific request command from the named configuration

stm request --config cloud-broker --name request

// Duplicate the command setting

stm request  --name request --config cloud-broker --save request2

// Duplicate the command setting with the specified command-line parameters

stm request --topic "stm/logistics/sipped" --name request2 --config cloud-broker --save request4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

<details>
<summary>Receive Reply Events: <i><b>stm reply -he</b></i> </summary>

```

ℹ  info: loading 'reply' command from configuration 'stm-cli-config.json'

Examples:
// execute the default reply command with settings defined on the
// default configuration 'stm-cli-config.json'

stm reply

HINT: You can view the default reply command settings 'stm config list --name reply'!

// execute the default reply command with settings defined on the default
// configuration 'stm-cli-config.json', but reply on topic specified in the
// command-line (overriding the command settings)

stm reply --topic solace/try/me/request

// reply with payload via the command-line parameter

stm reply --topic solace/try/me/request -m "Hello World!"

// reply with a default payload

stm reply --topic solace/try/me/request --default-message

// reply with payload from a file

stm reply --topic solace/try/me/request -f OrderCreated.json

// reply with payload from stdin (console)

stm reply --topic solace/try/me/request --stdin

NOTE: You can override any of the reply parameters
that are applied only for this instance of execution!

// If you want to run a reply entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm reply --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me/request

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// execute a specific reply command from the named configuration

stm reply --config cloud-broker --name reply

// Update the command setting with the specified command-line parameters (if specified)

stm reply --topic "stm/logistics/shipped" --name reply --config cloud-broker --save

// Duplicate the command setting

stm reply  --name reply --config cloud-broker --save reply2

// Duplicate the command setting with the specified command-line parameters

stm reply --topic "stm/logistics/sipped" --name reply2 --config cloud-broker --save reply4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>


# Manage Commands

<details>
<summary>Manage Queue: <i><b>stm manage queue -he</b></i> </summary>

```
ℹ  info: loading 'queue' command from configuration 'stm-cli-config.json'

Examples:
// execute the default queue command with settings defined on the
// default configuration 'stm-cli-config.json'

stm manage queue

HINT: You can view the default queue command settings 'stm config list --name queue'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute the default queue command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides

stm manage queue --update --add-subscriptions solace/try/me "stm/logistics/>"

NOTE: You can override any of the queue parameters
that are applied only for this instance of execution!

// If you want to run a queue entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm manage queue --create new-queue --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions

// update queue (settings & subscriptions)

stm manage queue --update new-queue --access-type non-exclusive --partition-count 10 --remove-subscriptions stm/cli/topic --add-subscriptions "stm/logistics/>" --list-subscriptions

// delete queue

stm manage queue --delete new-queue

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// execute a specific queue command from the named configuration

stm manage queue --config cloud-broker --name queue

// Update the command setting with the specified command-line parameters (if specified)

stm manage queue --update --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>" --name queue --config cloud-broker --save

// Duplicate the command setting

stm manage queue --name queue --config cloud-broker --save queue2

// Duplicate the command setting with the specified command-line parameters

stm manage queue --add-subscriptions "stm/logistics/sipped" --name queue2 --config cloud-broker --save queue4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

<details>
<summary>Manage Client Profile: <i><b>stm manage client-profile -he</b></i> </summary>

```
ℹ  info: loading 'client-profile' command from configuration 'stm-cli-config.json'

Examples:
// execute the default client-profile command with settings defined on the
// default configuration 'stm-cli-config.json'

stm manage client-profile

HINT: You can view the default client-profile command settings 'stm config list --name client-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute the default client-profile command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides

stm manage client-profile --update --allow-guaranteed-endpoint-create-durability all

NOTE: You can override any of the client-profile parameters
that are applied only for this instance of execution!

// If you want to run a client-profile entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm manage client-profile --create my-client-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --allow-guaranteed-endpoint-create-durability all

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)

stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile --config cloud-broker --save

// execute a specific client-profile command from the named configuration

stm manage client-profile --config cloud-broker --name client-profile

// Duplicate the command setting

stm manage client-profile  --name client-profile --config cloud-broker --save client-profile2

// Duplicate the command setting with the specified command-line parameters

stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile2 --config cloud-broker --save client-profile4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

<details>
<summary>Manage ACL Profile: <i><b>stm manage acl-profile -he</b></i> </summary>

```
ℹ  info: loading 'acl-profile' command from configuration 'stm-cli-config.json'

Examples:
// execute the default acl-profile command with settings defined on the
// default configuration 'stm-cli-config.json'

stm manage acl-profile

HINT: You can view the default acl-profile command settings 'stm config list --name acl-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute the default acl-profile command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides)

stm manage acl-profile --update --client-connect-default-action allow

NOTE: You can override any of the acl-profile parameters
that are applied only for this instance of execution!

// If you want to run a acl-profile entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm manage acl-profile --create my-acl-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --client-connect-default-action allow

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)

stm manage acl-profile --client-connect-default-action allow --name acl-profile --config cloud-broker --save

// execute a specific acl-profile command from the named configuration

stm manage acl-profile --config cloud-broker --name acl-profile

// Duplicate the command setting

stm manage acl-profile --name acl-profile --config cloud-broker --save acl-profile2

// Duplicate the command setting with the specified command-line parameters

stm manage acl-profile --client-connect-default-action allow --name acl-profile2 --config cloud-broker --save acl-profile4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

<details>
<summary>Manage Client Username: <i><b>stm manage client-username -he</b></i> </summary>

```
ℹ  info: loading 'client-username' command from configuration 'stm-cli-config.json'

Examples:
// execute the default client-username command with settings defined on the
// default configuration 'stm-cli-config.json'

stm manage client-username

HINT: You can view the default client-username command settings 'stm config list --name client-username'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute the default client-username command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides

stm manage client-username --update --enabled true

NOTE: You can override any of the client-username parameters
that are applied only for this instance of execution!

// If you want to run a client-username entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm manage client-username --create my-client-username --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --enabled true

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)

stm manage client-username --enabled true --name client-username --config cloud-broker --save

// execute a specific client-username command from the named configuration

stm manage client-username --config cloud-broker --name client-username

// Duplicate the command setting

stm manage client-username  --name client-username --config cloud-broker --save client-username2

// Duplicate the command setting with the specified command-line parameters

stm manage client-username --enabled true --name client-username2 --config cloud-broker --save client-username4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

</details>

# Configuration Commands


<details>
<summary>Initialize Configuration: <i><b>stm config init -he</b></i> </summary>

```
Examples:
// create a default configuration  'stm-cli-config.json'
// and initialize commands with default settings

stm config init

// create and initialize a named configuration
// and initialize commands with default settings

stm config init --config cloud-broker
```

</details>

<details>
<summary>List commands from configuration: <i><b>stm config list -he</b></i> </summary>

```
Examples:
// list commands from the default configuration 'stm-cli-config.json'

stm config list

// get details of a named command from the named configuration

stm config list --name send

// list commands from the named configuration

stm config list --config cloud-broker

// get details of a named command from the named configuration

stm config list --config cloud-broker --name receive

// save as a new command

stm send --config cloud-broker --save publish2

```

</details>

<details>
<summary>Delete commands from configuration: <i><b>stm config delete -he</b></i> </summary>

```
Examples:
// delete a specific command from the default configuration 'stm-cli-config.json'

stm config delete --name publish2

// delete a specific command from the named configuration

stm config delete --config cloud-broker --name publish2

NOTE: The default commands created by the initialize operation such as publish, receive, request, reply,
queue, client-profile, acl-profile, client-username, connection and semconnection cannot be deleted!!
```

</details>
