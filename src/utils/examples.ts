import chalk from "chalk"
import { getDefaultTopic } from "./defaults"

export const displayRootHelpExamples = () => {
  console.log(`
${chalk.underline.bold.italic.cyanBright(`Sample ${chalk.greenBright('stm')} commands:`)} 

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Publish message(s) */')}

// Execute a default publish command
${chalk.greenBright('stm send')}

// Execute a publish command on the specified broker and topic
${chalk.greenBright('stm send --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('send') + ' --count 5 --interval 1000')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Receive message(s) */')}

// Execute a default receive command
${chalk.greenBright('stm receive')}

// Execute a receive command on the specified broker and topic
${chalk.greenBright('stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('receive'))}

// Execute a receive command on the local broker from a queue
${chalk.greenBright('stm receive --queue my-queue')}

// Execute a receive command on the local broker from a queue (create if missing) with a topic subscription
${chalk.greenBright('stm receive --queue my-queue --create-if-missing --topic "solace/>"')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Send Request message */')}

// Execute a default send request command
${chalk.greenBright('stm request')}

// Execute a send request command on the specified broker on the specified topic
${chalk.greenBright('stm request --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('request'))}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Send Reply message */')}

// Execute a default send reply command
${chalk.greenBright('stm reply')}

// Execute a send reply command on the specified broker for requests received on the specified topic
${chalk.greenBright('stm request --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('request'))}

  `)
}

export const displayConfigHelpExamples = () => {
  console.log(`
${chalk.underline.bold.italic.cyanBright(`Sample ${chalk.greenBright('stm config')} commands:`)} 

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage Configurations */')}

// Initialize/reset default configuration (stm-cli-config.json)

${chalk.greenBright('stm config init')}

// Initialize/reset a named configuration

${chalk.greenBright('stm config init --config cloud-broker')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* List commands from a configuration */')}

// List commands from default configuration (stm-cli-config.json) 

${chalk.greenBright('stm config list')}

// List details of a named command from default configuration (stm-cli-config.json) 

${chalk.greenBright('stm config list --name send')}

// List commands from a named configuration

${chalk.greenBright('stm config list --config cloud-broker')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Delete commands from a configuration */')}

// Delete a command from default configuration (stm-cli-config.json) 

${chalk.greenBright('stm config delete --name sendMany')}

// Delete a command from a named configuration

${chalk.greenBright('stm config delete --name send --config cloud-broker')}

  `)
}

export const displayManageHelpExamples = () => {
  console.log(`
${chalk.underline.bold.italic.cyanBright(`Sample ${chalk.greenBright('stm manage')} commands:`)} 

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage connection settings */')}

// Update connection settings on the default configuration

${chalk.greenBright('stm manage connection --url ws://localhost:8008 --vpn default --username default --password default')}

// Update connection settings on a named configuration

${chalk.greenBright('stm manage connection --config cloud-broker --url ws://localhost:8008 --vpn default --username default --password default')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage queues */')}

// Execute a specific named queue command from the default configuration (stm-cli-config.json)

${chalk.greenBright('stm manage queue --name queue')}

// Create a queue on the broker

${chalk.greenBright('stm manage queue --create my-queue')}

// Get the details of named queue on the broker

${chalk.greenBright('stm manage queue --list my-queue')}

// Update the queue setting with the specified parameters

${chalk.greenBright('stm manage queue --update my-queue --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>"')}

// Update the queue command setting with the specified parameters on the default configuration

${chalk.greenBright('stm manage queue --update --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>" --name queue --save')}

// Duplicate queue command setting with the specified parameters on the named configuration

${chalk.greenBright('stm manage queue --update --add-subscriptions "stm/logistics/shipped" --name queue --config cloud-broker --save queueTwo')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage client-profiles */')}

// List the client-profiles on the broker

${chalk.greenBright('stm manage client-profile --list')}

// Create a client-profile on the broker

${chalk.greenBright('stm manage client-profile --create my-client-profile')}

// Get the details of named client-profiles on the broker

${chalk.greenBright('stm manage client-profile --list my-client-profile')}

// Update a client-profile on the broker

${chalk.greenBright('stm manage client-profile --update my-client-profile --allow-guaranteed-endpoint-create-durability all')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage acl-profiles */')}

// List the acl-profiles on the broker

${chalk.greenBright('stm manage acl-profile --list')}

// Create a acl-profile on the broker

${chalk.greenBright('stm manage acl-profile --create my-acl-profile')}

// Get the details of named acl-profile on the broker

${chalk.greenBright('stm manage acl-profile --list my-acl-profile')}

--<>--<>--<>--<>--<>--<>--<>--<>--

${chalk.bold.greenBright('/* Manage client-usernames */')}

// List the client-username on the broker

${chalk.greenBright('stm manage client-username --list')}

// Create a client-username on the broker

${chalk.greenBright('stm manage client-username --create my-client-username')}

// Get the details of named client-username on the broker

${chalk.greenBright('stm manage client-username --list my-client-username')}

  `)
}

export const displayFeedConfigHelpExamples = () => {
  console.log(`
  ${chalk.underline.bold.italic.cyanBright(`Sample ${chalk.greenBright('stm feed')} commands:`)}
  `);
}

export const displayHelpExamplesForConfigInit = () => {
  console.log(`
Examples:
// create a default configuration  'stm-cli-config.json' 
// and initialize commands with default settings

${chalk.greenBright('stm config init')}

// create and initialize a named configuration
// and initialize commands with default settings

${chalk.greenBright('stm config init --config cloud-broker')}
  `)
}

export const displayHelpExamplesForConfigList = () => {
  console.log(`
Examples:
// list commands from the default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm config list')}

// get details of a named command from the named configuration

${chalk.greenBright('stm config list --name send')}

// list commands from the named configuration

${chalk.greenBright('stm config list --config cloud-broker')}

// get details of a named command from the named configuration

${chalk.greenBright('stm config list --config cloud-broker --name receive')}

  `)
}

export const displayHelpExamplesForConfigDelete = () => {
  console.log(`
Examples:
// delete a specific command from the default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm config delete --name publish2')}

// delete a specific command from the named configuration 

${chalk.greenBright('stm config delete --config cloud-broker --name publish2')}

${chalk.yellowBright('NOTE: The default commands created by the initialize operation such as publish, receive, request, reply,\n' +
'queue, client-profile, acl-profile, client-username, connection and semconnection cannot be deleted!!')}
  `)
}

export const displayHelpExamplesForPublish = () => {
}

export const displayHelpExamplesForPublish1 = () => {
  console.log(`
Examples:
// execute the default publish command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm send')}

${chalk.magentaBright(`HINT: You can view the default publish command settings 'stm config list --name send'!`)}

// execute the default publish command with settings defined on the default 
// configuration 'stm-cli-config.json', but publish on topic specified in the 
// command-line (overriding the command settings)

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send'))}

// publish with payload via the command-line parameter

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send') + ' -m "Hello World!"')}

// publish with a default payload 

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send') + ' --default-message')}

// publish with payload from a file

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send') + ' -f OrderCreated.json')}

// publish with payload from stdin (console)

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send') + ' --stdin')}

// publish events to multiple events in a specified interval(ms)

${chalk.greenBright('stm send --topic ' + getDefaultTopic('send') + ' --count 100 --interval 5000')}

// publish events to multiple topics

${chalk.greenBright('stm send --topic "stm/logistics/shipped" "stm/inventory/check"')}


${chalk.yellowBright('You can override any of the publish parameters \n' +
'and they are applied only for this instance of execution!')}

// If you want to run a publish entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm send --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('send') + ' --count 5 --interval 1000')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm send --count 100 --interval 1000 --name publish2 --config cloud-broker --save')}

// save an existing command setting to a new name in a configuration file

${chalk.greenBright('stm send --config cloud-broker --save publish2')}

// execute a specific publish command from the named configuration 

${chalk.greenBright('stm send --config cloud-broker --name publish2')}

// Duplicate the command setting

${chalk.greenBright('stm send  --name publish2 --config cloud-broker --save publish3')}
  `)
}

export const displayHelpExamplesForReceive = () => {
  console.log(`
Examples:
// execute the default receive command with settings defined on the 
// default configuration 'stm-cli-config.json' which subscribes to 
// a default topic ${getDefaultTopic('receive')}

${chalk.greenBright('stm receive')}

// receive events from a topic

${chalk.greenBright('stm receive -t "stm/logistics/shipped"')}

// receive events from multiple topics 

${chalk.greenBright('stm receive -t "stm/logistics/shipped" "stm/inventory/check"')}

${chalk.magentaBright(`HINT: You can view the default receive command settings 'stm config list --name receive'!`)}

// receive events from a queue, if queue is not found create a queue with the name
// optionally you can also specify a subscription to be added to the queue

${chalk.greenBright('stm receive --queue new-queue --create-if-missing --topic "solace/>"')}

// receive events from a queue

${chalk.greenBright('stm receive --queue my-queue')}

// receive events from a queue and add a subscription 

${chalk.greenBright('stm receive --queue my-queue -t "stm/logistics/shipped"')}

${chalk.yellowBright('NOTE: You can override any of the receive parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a receive entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('receive'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// execute a specific receive command from the named configuration 

${chalk.greenBright('stm receive --config cloud-broker --name receive')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm receive --topic "stm/logistics/shipped" "stm/inventory/>" --name receive --config cloud-broker --save')}

// Duplicate the command setting

${chalk.greenBright('stm receive  --name receive --config cloud-broker --save receive2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm receive --topic "stm/logistics/*" --name receive2 --config cloud-broker --save receive4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}
  `)
}

export const displayHelpExamplesForRequest = () => {
  console.log(`
Examples:
// execute the default request command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm request')}

${chalk.magentaBright(`HINT: You can view the default request command settings 'stm config list --name request'!`)}

// execute the default request command with settings defined on the default 
// configuration 'stm-cli-config.json', but on the topic specified in the 
// command-line (overriding the command settings)

${chalk.greenBright('stm request --topic ' + getDefaultTopic('request'))}

// request with payload via the command-line parameter

${chalk.greenBright('stm request --topic ' + getDefaultTopic('request') + ' -m "Hello World!"')}

// request with a default payload 

${chalk.greenBright('stm request --topic ' + getDefaultTopic('request') + ' --default-message')}

// request with payload from a file

${chalk.greenBright('stm request --topic ' + getDefaultTopic('request') + ' -f OrderCreated.json')}

// request with payload from stdin (console)

${chalk.greenBright('stm request --topic ' + getDefaultTopic('request') + ' --stdin')}

${chalk.yellowBright('NOTE: You can override any of the request parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a request entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm request --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('request'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm request --topic "stm/logistics/shipped" --name request --config cloud-broker --save')}

// execute a specific request command from the named configuration 

${chalk.greenBright('stm request --config cloud-broker --name request')}

// Duplicate the command setting

${chalk.greenBright('stm request  --name request --config cloud-broker --save request2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm request --topic "stm/logistics/sipped" --name request2 --config cloud-broker --save request4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}
    `)
}

export const displayHelpExamplesForReply = () => {
  console.log(`
Examples:
// execute the default reply command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm reply')}

${chalk.magentaBright(`HINT: You can view the default reply command settings 'stm config list --name reply'!`)}

// execute the default reply command with settings defined on the default 
// configuration 'stm-cli-config.json', but reply on topic specified in the 
// command-line (overriding the command settings)

${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply'))}

// reply with payload via the command-line parameter

${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply') + ' -m "Hello World!"')}

// reply with a default payload 

${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply') + ' --default-message')}

// reply with payload from a file

${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply') + ' -f OrderCreated.json')}

// reply with payload from stdin (console)

${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply') + ' --stdin')}

${chalk.yellowBright('NOTE: You can override any of the reply parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a reply entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm reply --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('reply'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// execute a specific reply command from the named configuration 

${chalk.greenBright('stm reply --config cloud-broker --name reply')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm reply --topic "stm/logistics/shipped" --name reply --config cloud-broker --save')}

// Duplicate the command setting

${chalk.greenBright('stm reply  --name reply --config cloud-broker --save reply2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm reply --topic "stm/logistics/sipped" --name reply2 --config cloud-broker --save reply4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}
  `)
}

export const displayHelpExamplesForQueue = () => {
  console.log(`
Examples:
// execute the default queue command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm manage queue')}

${chalk.magentaBright(`HINT: You can view the default queue command settings 'stm config list --name queue'!`)}

${chalk.yellowBright('NOTE: The actual operation is determined by the ')}${chalk.greenBright('operation')} parameter - create, update or delete!

// execute the default queue command with settings defined on the default 
// configuration 'stm-cli-config.json', but with command-line overrides

${chalk.greenBright('stm manage queue --update --add-subscriptions ')}${getDefaultTopic('receive')} "stm/logistics/>"

${chalk.yellowBright('NOTE: You can override any of the queue parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a queue entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm manage queue --create new-queue --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions')}

// update queue (settings & subscriptions)

${chalk.greenBright('stm manage queue --update new-queue --access-type non-exclusive --partition-count 10 --remove-subscriptions stm/cli/topic --add-subscriptions "stm/logistics/>" --list-subscriptions')}

// delete queue

${chalk.greenBright('stm manage queue --delete new-queue')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// execute a specific queue command from the named configuration 

${chalk.greenBright('stm manage queue --config cloud-broker --name queue')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm manage queue --update --add-subscriptions "stm/logistics/shipped" --remove-subscriptions "stm/logistics/>" --name queue --config cloud-broker --save')}

// Duplicate the command setting

${chalk.greenBright('stm manage queue --name queue --config cloud-broker --save queue2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm manage queue --add-subscriptions "stm/logistics/sipped" --name queue2 --config cloud-broker --save queue4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}  
    `)
}

export const displayHelpExamplesForAclProfile = () => {
  console.log(`
Examples:
// execute the default acl-profile command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm manage acl-profile')}

${chalk.magentaBright(`HINT: You can view the default acl-profile command settings 'stm config list --name acl-profile'!`)}

${chalk.yellowBright('NOTE: The actual operation is determined by the ')}${chalk.greenBright('operation')} parameter - create, update or delete!

// execute the default acl-profile command with settings defined on the default 
// configuration 'stm-cli-config.json', but with command-line overrides)

${chalk.greenBright('stm manage acl-profile --update --client-connect-default-action allow')}

${chalk.yellowBright('NOTE: You can override any of the acl-profile parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a acl-profile entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm manage acl-profile --create my-acl-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --client-connect-default-action allow')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm manage acl-profile --client-connect-default-action allow --name acl-profile --config cloud-broker --save')}

// execute a specific acl-profile command from the named configuration 

${chalk.greenBright('stm manage acl-profile --config cloud-broker --name acl-profile')}

// Duplicate the command setting

${chalk.greenBright('stm manage acl-profile --name acl-profile --config cloud-broker --save acl-profile2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm manage acl-profile --client-connect-default-action allow --name acl-profile2 --config cloud-broker --save acl-profile4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}  
    `)
}

export const displayHelpExamplesForClientProfile = () => {
  console.log(`
Examples:
// execute the default client-profile command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm manage client-profile')}

${chalk.magentaBright(`HINT: You can view the default client-profile command settings 'stm config list --name client-profile'!`)}

${chalk.yellowBright('NOTE: The actual operation is determined by the ')}${chalk.greenBright('operation')} parameter - create, update or delete!

// execute the default client-profile command with settings defined on the default 
// configuration 'stm-cli-config.json', with the command-line overrides

${chalk.greenBright('stm manage client-profile --update --allow-guaranteed-endpoint-create-durability all')}

${chalk.yellowBright('NOTE: You can override any of the client-profile parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a client-profile entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm manage client-profile --create my-client-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --allow-guaranteed-endpoint-create-durability all')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile --config cloud-broker --save')}

// execute a specific client-profile command from the named configuration 

${chalk.greenBright('stm manage client-profile --config cloud-broker --name client-profile')}

// Duplicate the command setting

${chalk.greenBright('stm manage client-profile  --name client-profile --config cloud-broker --save client-profile2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile2 --config cloud-broker --save client-profile4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}  
    `)
}

export const displayHelpExamplesForClientUsername = () => {
  console.log(`
Examples:
// execute the default client-username command with settings defined on the 
// default configuration 'stm-cli-config.json' 

${chalk.greenBright('stm manage client-username')}

${chalk.magentaBright(`HINT: You can view the default client-username command settings 'stm config list --name client-username'!`)}

${chalk.yellowBright('NOTE: The actual operation is determined by the ')}${chalk.greenBright('operation')} parameter - create, update or delete!

// execute the default client-username command with settings defined on the default 
// configuration 'stm-cli-config.json', with the command-line overrides

${chalk.greenBright('stm manage client-username --update --enabled true')}

${chalk.yellowBright('NOTE: You can override any of the client-username parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a client-username entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

${chalk.greenBright('stm manage client-username --create my-client-username --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --enabled true')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)

${chalk.greenBright('stm manage client-username --enabled true --name client-username --config cloud-broker --save')}

// execute a specific client-username command from the named configuration 

${chalk.greenBright('stm manage client-username --config cloud-broker --name client-username')}

// Duplicate the command setting

${chalk.greenBright('stm manage client-username  --name client-username --config cloud-broker --save client-username2')}

// Duplicate the command setting with the specified command-line parameters

${chalk.greenBright('stm manage client-username --enabled true --name client-username2 --config cloud-broker --save client-username4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}  
    `)
}

export const displayHelpExamplesForConnection = () => {
  console.log(`
Examples:
// manage (update) connection settings on the default configuration 

${chalk.greenBright('stm manage connection --url ws://localhost:8008 --vpn default')}

// manage (update) connection settings on the named configuration 

${chalk.greenBright('stm manage connection --config cloud-broker --url ws://localhost:8008 --vpn default --username default --password default ')}

${chalk.magentaBright(`HINT: You can view the default connection command settings 'stm config list --name connection'!`)}
  `)
}
export const displayHelpExamplesForSempConnection = () => {
  console.log(`
Examples:
// manage (update) semp-connection settings on the default configuration

${chalk.greenBright('stm manage semp-connection --semp-url http://localhost:8080 --semp-vpn default')}

// manage (update) semp-connection settings on the named configuration 

${chalk.greenBright('stm manage semp-connection --config cloud-broker --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin ')}

${chalk.magentaBright(`HINT: You can view the default semp-connection command settings 'stm config list --name sempconnection'!`)}
  `)
}

