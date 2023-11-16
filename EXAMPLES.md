# Messaging Commands

__Issue messaging commands: publish, receive, request and reply__

## Publish Events


// execute the default publish command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm publish__

HINT: You can view the default publish command settings 'stm config list --name publish'!

// save an existing command setting to a new name in a configuration file
__stm publish --config cloud-broker.json --save publish2__

// execute a specific publish command from the named configuration
__stm publish --config cloud-broker.json --name publish2__

// execute the default publish command with settings defined on the default
// configuration 'stm-cli-config.json', but publish on topic specified in the
// command-line (overriding the command settings)
__stm publish --topic solace/try/me__

NOTE: You can override any of the publish parameters
that are applied only for this instance of execution!

// If you want to run a publish purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm publish --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me --count 5 --interval 1000__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm publish  --count 2 --interval 1000 --name publish2 --config cloud-broker.json --save__

// Duplicate the command setting
__stm publish  --name publish2 --config cloud-broker.json --save publish3__

// Duplicate the command setting with the specified command-line parameters
__stm publish  --count 5 --interval 1000 --name publish2 --config cloud-broker.json --save publish4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Receive Events


// execute the default receive command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm receive__

HINT: You can view the default receive command settings 'stm config list --name receive'!

// execute the default receive command with settings defined on the
// default configuration 'stm-cli-config.json', but receive from a queue,
// with optionally creating the queue if found missing, and add subscriptions to the queue
__stm receive --queue my-queue --create-if-missing --topic "solace/>"__


// execute a specific receive command from the named configuration
__stm receive --config cloud-broker.json --name receive__

// execute the default receive command with settings defined on the default
// configuration 'stm-cli-config.json', but receive on topic specified in the
// command-line (overriding the command settings)
__stm receive --topic solace/try/me__

// execute the default receive command with settings defined on the default
// configuration 'stm-cli-config.json', but receive from a queue
__stm receive --queue stm-queue --topic solace/try/me__

NOTE: You can override any of the receive parameters
that are applied only for this instance of execution!

// If you want to run a receive purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm receive --topic "stm/logistics/shipped" "stm/inventory/>" --name receive --config cloud-broker.json --save__

// Duplicate the command setting
__stm receive  --name receive --config cloud-broker.json --save receive2__

// Duplicate the command setting with the specified command-line parameters
__stm receive --topic "stm/logistics/*" --name receive2 --config cloud-broker.json --save receive4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Send Request Events


// execute the default request command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm request__

HINT: You can view the default request command settings 'stm config list --name request'!

// execute a specific request command from the named configuration
__stm request --config cloud-broker.json --name request__

// execute the default request command with settings defined on the default
// configuration 'stm-cli-config.json', but request on topic specified in the
// command-line (overriding the command settings)
__stm request --topic solace/try/me/request__

NOTE: You can override any of the request parameters
that are applied only for this instance of execution!

// If you want to run a request purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm request --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me/request__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm request --topic "stm/logistics/shipped" --name request --config cloud-broker.json --save__

// Duplicate the command setting
__stm request  --name request --config cloud-broker.json --save request2__

// Duplicate the command setting with the specified command-line parameters
__stm request --topic "stm/logistics/sipped" --name request2 --config cloud-broker.json --save request4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Receive Reply Events


// execute the default reply command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm reply__

HINT: You can view the default reply command settings 'stm config list --name reply'!

// execute a specific reply command from the named configuration
__stm reply --config cloud-broker.json --name reply__

// execute the default reply command with settings defined on the default
// configuration 'stm-cli-config.json', but reply on topic specified in the
// command-line (overriding the command settings)
__stm reply --topic solace/try/me/request__

NOTE: You can override any of the reply parameters
that are applied only for this instance of execution!

// If you want to run a reply purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm reply --url ws://localhost:8008 --vpn default --username default --password default --topic solace/try/me/request__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm reply --topic "stm/logistics/shipped" --name reply --config cloud-broker.json --save__

// Duplicate the command setting
__stm reply  --name reply --config cloud-broker.json --save reply2__

// Duplicate the command setting with the specified command-line parameters
__stm reply --topic "stm/logistics/sipped" --name reply2 --config cloud-broker.json --save reply4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

# Manage Commands

__Issue management commands (list, create, update and delete) to manage broker resources: queue, client-profile, acl-profile and client-userame.__

## Manage Queue


// execute the default queue command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm manage queue__

HINT: You can view the default queue command settings 'stm config list --name queue'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific queue command from the named configuration
__stm manage queue --config cloud-broker.json --name queue__

// execute the default queue command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides
__stm manage queue --update --add-subscriptions solace/try/me "stm/logistics/>"__

NOTE: You can override any of the queue parameters
that are applied only for this instance of execution!

// If you want to run a queue purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm manage queue --create my-queue --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm manage queue --update --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>" --name queue --config cloud-broker.json --save__

// Duplicate the command setting
__stm manage queue --name queue --config cloud-broker.json --save queue2__

// Duplicate the command setting with the specified command-line parameters
__stm manage queue --add-subscriptions "stm/logistics/sipped" --name queue2 --config cloud-broker.json --save queue4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Manage Client Profile


// execute the default client-profile command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm manage client-profile__

HINT: You can view the default client-profile command settings 'stm config list --name client-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific client-profile command from the named configuration
__stm manage client-profile --config cloud-broker.json --name client-profile__

// execute the default client-profile command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides
__stm manage client-profile --update --allow-guaranteed-endpoint-create-durability all__

NOTE: You can override any of the client-profile parameters
that are applied only for this instance of execution!

// If you want to run a client-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm manage client-profile --create my-client-profile --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --allow-guaranteed-endpoint-create-durability all__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile --config cloud-broker.json --save__

// Duplicate the command setting
__stm manage client-profile  --name client-profile --config cloud-broker.json --save client-profile2__

// Duplicate the command setting with the specified command-line parameters
__stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile2 --config cloud-broker.json --save client-profile4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Manage ACL Profile


// execute the default acl-profile command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm manage acl-profile__

HINT: You can view the default acl-profile command settings 'stm config list --name acl-profile'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific acl-profile command from the named configuration
__stm manage acl-profile --config cloud-broker.json --name acl-profile__

// execute the default acl-profile command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides)
__stm manage acl-profile --update --client-connect-default-action allow__

NOTE: You can override any of the acl-profile parameters
that are applied only for this instance of execution!

// If you want to run a acl-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm manage acl-profile --create my-acl-profile --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --client-connect-default-action allow__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm manage acl-profile --client-connect-default-action allow --name acl-profile --config cloud-broker.json --save__

// Duplicate the command setting
__stm manage acl-profile --name acl-profile --config cloud-broker.json --save acl-profile2__

// Duplicate the command setting with the specified command-line parameters
__stm manage acl-profile --client-connect-default-action allow --name acl-profile2 --config cloud-broker.json --save acl-profile4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

## Manage Client Username


// execute the default client-username command with settings defined on the
// default configuration 'stm-cli-config.json'
__stm manage client-username__

HINT: You can view the default client-username command settings 'stm config list --name client-username'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific client-username command from the named configuration
__stm manage client-username --config cloud-broker.json --name client-username__

// execute the default client-username command with settings defined on the default
// configuration 'stm-cli-config.json', with the command-line overrides
__stm manage client-username --update --enabled true__

NOTE: You can override any of the client-username parameters
that are applied only for this instance of execution!

// If you want to run a client-username purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
__stm manage client-username --create my-client-username --semp-url http://localhost:8080 --semp-vpn default --semp-username admin --semp-password admin --enabled true__

NOTE: The following examples demonstrate how to update an existing command settings
in a configuration, as well as how to duplicate (copy) a command
setting to a new name!

// Update the command setting with the specified command-line parameters (if specified)
__stm manage client-username --enabled true --name client-username --config cloud-broker.json --save__

// Duplicate the command setting
__stm manage client-username  --name client-username --config cloud-broker.json --save client-username2__

// Duplicate the command setting with the specified command-line parameters
__stm manage client-username --enabled true --name client-username2 --config cloud-broker.json --save client-username4__

HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!

# Configuration Commands

__Commands to manage persistence of commands for reuse.__

## Initialize commands with default settings


// create a default configuration  'stm-cli-config.json'
// and initialize commands with default settings

__stm config init__

// create and initialize a named configuration
// and initialize commands with default settings

__stm config init --config cloud-broker.json__

## List commands from the configuration


// list commands from the default configuration 'stm-cli-config.json'

__stm config list__

// get details of a named command from the named configuration

__stm config list --name publish__

// list commands from the named configuration

__stm config list --config cloud-broker.json__

// get details of a named command from the named configuration

__stm config list --config cloud-broker.json --name receive__

## Delete commands in the configuration


// delete a specific command from the default configuration 'stm-cli-config.json'

__stm config delete --name publish2__

// delete a specific command from the named configuration

__stm config delete --config cloud-broker.json --name publish2__

NOTE: The default commands created by the initialize operation such as publish, receive, request, reply,
queue, client-profile, acl-profile, client-username, connection and semconnection cannot be deleted!!