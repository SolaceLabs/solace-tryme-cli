## Messaging

### Publish Events

```
// execute the default publish command with settings defined on the
// default configuration 'stm-cli-config.json'
stm publish

HINT: You can view the default publish command settings 'stm config view --name publish'!

// execute a specific publish command from the named configuration
stm publish --config cloud-broker.json --name publish2

// execute the default publish command with settings defined on the default
// configuration 'stm-cli-config.json', but publish on topic specified in the
// command-line (overriding the command settings)
stm publish --topic stm/cli/topic

NOTE: You can override any of the publish parameters
that are applied only for this instance of execution!

// If you want to run a publish purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm publish --url ws://localhost:8008 --vpn default --username default --password default --topic stm/cli/topic --count 5 --interval 1000

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm publish  --count 2 --interval 1000 --name publish2 --config cloud-broker.json --save

// Duplicate the command setting
stm publish  --name publish2 --config cloud-broker.json --save-to publish3

// Duplicate the command setting with the specified command-line parameters
stm publish  --count 5 --interval 1000 --name publish2 --config cloud-broker.json --save-to publish4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Receive Events

```
// execute the default receive command with settings defined on the
// default configuration 'stm-cli-config.json'
stm receive

HINT: You can view the default receive command settings 'stm config view --name receive'!

// execute a specific receive command from the named configuration
stm receive --config cloud-broker.json --name receive

// execute the default receive command with settings defined on the default
// configuration 'stm-cli-config.json', but receive on topic specified in the
// command-line (overriding the command settings)
stm receive --topic stm/cli/topic

// execute the default receive command with settings defined on the default
// configuration 'stm-cli-config.json', but receive from a queue
stm receive --queue stm-queue --topic stm/cli/topic

NOTE: You can override any of the receive parameters
that are applied only for this instance of execution!

// If you want to run a receive purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic stm/cli/topic

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm receive --topic "stm/logistics/shipped" "stm/inventory/>" --name receive --config cloud-broker.json --save

// Duplicate the command setting
stm receive  --name receive --config cloud-broker.json --save-to receive2

// Duplicate the command setting with the specified command-line parameters
stm receive --topic "stm/logistics/*" --name receive2 --config cloud-broker.json --save-to receive4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Send Request Events

```
// execute the default request command with settings defined on the
// default configuration 'stm-cli-config.json'
stm request

HINT: You can view the default request command settings 'stm config view --name request'!

// execute a specific request command from the named configuration
stm request --config cloud-broker.json --name request

// execute the default request command with settings defined on the default
// configuration 'stm-cli-config.json', but request on topic specified in the
// command-line (overriding the command settings)
stm request --topic stm/cli/request

NOTE: You can override any of the request parameters
that are applied only for this instance of execution!

// If you want to run a request purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm request --url ws://localhost:8008 --vpn default --username default --password default --topic stm/cli/request

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm request --topic "stm/logistics/shipped" --name request --config cloud-broker.json --save

// Duplicate the command setting
stm request  --name request --config cloud-broker.json --save-to request2

// Duplicate the command setting with the specified command-line parameters
stm request --topic "stm/logistics/sipped" --name request2 --config cloud-broker.json --save-to request4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Send Reply Events

```
// execute the default reply command with settings defined on the
// default configuration 'stm-cli-config.json'
stm reply

HINT: You can view the default reply command settings 'stm config view --name reply'!

// execute a specific reply command from the named configuration
stm reply --config cloud-broker.json --name reply

// execute the default reply command with settings defined on the default
// configuration 'stm-cli-config.json', but reply on topic specified in the
// command-line (overriding the command settings)
stm reply --topic stm/cli/request

NOTE: You can override any of the reply parameters
that are applied only for this instance of execution!

// If you want to run a reply purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm reply --url ws://localhost:8008 --vpn default --username default --password default --topic stm/cli/request

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm reply --topic "stm/logistics/shipped" --name reply --config cloud-broker.json --save

// Duplicate the command setting
stm reply  --name reply --config cloud-broker.json --save-to reply2

// Duplicate the command setting with the specified command-line parameters
stm reply --topic "stm/logistics/sipped" --name reply2 --config cloud-broker.json --save-to reply4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Manage Queue

```
// execute the default queue command with settings defined on the
// default configuration 'stm-cli-config.json'
stm manage queue

HINT: You can view the default queue command settings 'stm config view --name queue'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific queue command from the named configuration
stm manage queue --config cloud-broker.json --name queue

// execute the default queue command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides
stm manage queue --operation --add-subscriptions stm/cli/topic "stm/logistics/>"

NOTE: You can override any of the queue parameters
that are applied only for this instance of execution!

// If you want to run a queue purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm manage queue --queue my-queue --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm manage queue --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>" --name queue --config cloud-broker.json --save

// Duplicate the command setting
stm manage queue  --name queue --config cloud-broker.json --save-to queue2

// Duplicate the command setting with the specified command-line parameters
stm manage queue --add-subscriptions "stm/logistics/sipped" --name queue2 --config cloud-broker.json --save-to queue4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Manage Client Profile

```
// execute the default client-profile command with settings defined on the
// default configuration 'stm-cli-config.json'
stm manage client-profile

HINT: You can view the default client-profile command settings 'stm config view --name client-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific client-profile command from the named configuration
stm manage client-profile --config cloud-broker.json --name client-profile

// execute the default client-profile command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides
stm manage client-profile --operation update --allow-guaranteed-endpoint-create-durability all

NOTE: You can override any of the client-profile parameters
that are applied only for this instance of execution!

// If you want to run a client-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm manage client-profile --client-profile my-client-profile --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --allow-guaranteed-endpoint-create-durability all

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile --config cloud-broker.json --save

// Duplicate the command setting
stm manage client-profile  --name client-profile --config cloud-broker.json --save-to client-profile2

// Duplicate the command setting with the specified command-line parameters
stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile2 --config cloud-broker.json --save-to client-profile4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Manage ACL Profile

```
// execute the default acl-profile command with settings defined on the
// default configuration 'stm-cli-config.json'
stm manage acl-profile

HINT: You can view the default acl-profile command settings 'stm config view --name acl-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific acl-profile command from the named configuration
stm manage acl-profile --config cloud-broker.json --name acl-profile

// execute the default acl-profile command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides)
stm manage acl-profile --operation update --client-connect-default-action allow

NOTE: You can override any of the acl-profile parameters
that are applied only for this instance of execution!

// If you want to run a acl-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm manage acl-profile --acl-profile my-acl-profile --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --client-connect-default-action allow

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm manage acl-profile --client-connect-default-action allow --name acl-profile --config cloud-broker.json --save

// Duplicate the command setting
stm manage acl-profile  --name acl-profile --config cloud-broker.json --save-to acl-profile2

// Duplicate the command setting with the specified command-line parameters
stm manage acl-profile --client-connect-default-action allow --name acl-profile2 --config cloud-broker.json --save-to acl-profile4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Manage Client Username

```
// execute the default client-username command with settings defined on the
// default configuration 'stm-cli-config.json'
stm manage client-username

HINT: You can view the default client-username command settings 'stm config view --name client-username'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific client-username command from the named configuration
stm manage client-username --config cloud-broker.json --name client-username

// execute the default client-username command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides
stm manage client-username --operation update --enabled true

NOTE: You can override any of the client-username parameters
that are applied only for this instance of execution!

// If you want to run a client-username purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
stm manage client-username --client-username my-client-username --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --enabled true

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
stm manage client-username --enabled true --name client-username --config cloud-broker.json --save

// Duplicate the command setting
stm manage client-username  --name client-username --config cloud-broker.json --save-to client-username2

// Duplicate the command setting with the specified command-line parameters
stm manage client-username --enabled true --name client-username2 --config cloud-broker.json --save-to client-username4

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!
```

### Manage VPN Connection

```
Examples:
// manage (update) vpn-connection settings on the default configuration
stm manage vpn-connection --url ws://localhost:8008 --vpn default

// manage (update) vpn-connection settings on the named configuration
stm manage vpn-connection --config cloud-broker.json --url ws://localhost:8008 --vpn default --username default --password default


HINT: You can view the default vpn-connection command settings 'stm config view --name connection'!
```

### Manage VPN SEMP Connection

```
Examples:
// manage (update) semp-connection settings on the default configuration
stm manage semp-connection --semp-url http://localhost:8080 --semp-vpn default

// manage (update) semp-connection settings on the named configuration
stm manage semp-connection --config cloud-broker.json --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin

HINT: You can view the default semp-connection command settings 'stm config view --name sempconnection'!
```

### Config Init (Initialize sample commands)

```
Examples:
# create a default configuration  'stm-cli-config.json'
# and initialize commands with default settings

stm config init

# create and initialize a named configuration
# and initialize commands with default settings

stm config init --config cloud-broker.json
```

### Config List (List commands present in the configuration)

```
Examples:
# list commands from the default configuration 'stm-cli-config.json'

stm config list

# list commands from the named configuration

stm config list --config cloud-broker.json
```

### Config View (View command details from the configuration)

```
Examples:
# view command settings from the default configuration 'stm-cli-config.json'

stm config view

# view a specific command settings from the named configuration

stm config view --config cloud-broker.json --name publish
```

### Config Delete (Delete a command from the configuration)

```
Examples:
# delete a specific command from the default configuration 'stm-cli-config.json'

stm config delete --name publish2

# delete a specific command from the named configuration

stm config delete --config cloud-broker.json --name publish2

NOTE: The default commands created by the initialize operation such as publish, receive, request, reply,
queue, client-profile, acl-profile, client-username, connection and semconnection cannot be deleted!
```
