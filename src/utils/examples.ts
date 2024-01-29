import chalk from "chalk"
import { getDefaultTopic } from "./defaults"

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

${chalk.greenBright('stm config list --name publish')}

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
  console.log(`
Examples:
// execute the default publish command with settings defined on the 
// default configuration 'stm-cli-config.json' 
${chalk.greenBright('stm send')}

${chalk.magentaBright(`HINT: You can view the default publish command settings 'stm config list --name publish'!`)}

// save an existing command setting to a new name in a configuration file
${chalk.greenBright('stm send --config cloud-broker --save publish2')}

// execute a specific publish command from the named configuration 
${chalk.greenBright('stm send --config cloud-broker --name publish2')}

// execute the default publish command with settings defined on the default 
// configuration 'stm-cli-config.json', but publish on topic specified in the 
// command-line (overriding the command settings)
${chalk.greenBright('stm send --topic ' + getDefaultTopic('send'))}

${chalk.yellowBright('NOTE: You can override any of the publish parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a publish purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm send --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('send') + ' --count 5 --interval 1000')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)
${chalk.greenBright('stm send  --count 2 --interval 1000 --name publish2 --config cloud-broker --save')}

// Duplicate the command setting
${chalk.greenBright('stm send  --name publish2 --config cloud-broker --save publish3')}

// Duplicate the command setting with the specified command-line parameters
${chalk.greenBright('stm send  --count 5 --interval 1000 --name publish2 --config cloud-broker --save publish4')}

${chalk.magentaBright(`HINT: You can verify the outcome by executing a config list command 'stm config list --config cloud-broker.json'!`)}
  `)
}

export const displayHelpExamplesForReceive = () => {
  console.log(`
Examples:
// execute the default receive command with settings defined on the 
// default configuration 'stm-cli-config.json' 
${chalk.greenBright('stm receive')}

${chalk.magentaBright(`HINT: You can view the default receive command settings 'stm config list --name receive'!`)}

// execute the default receive command with settings defined on the 
// default configuration 'stm-cli-config.json', but receive from a queue,
// with optionally creating the queue if found missing, and add subscriptions to the queue
${chalk.greenBright('stm receive --queue my-queue --create-if-missing --topic "solace/>"')}


// execute a specific receive command from the named configuration 
${chalk.greenBright('stm receive --config cloud-broker --name receive')}

// execute the default receive command with settings defined on the default 
// configuration 'stm-cli-config.json', but receive on topic specified in the 
// command-line (overriding the command settings)
${chalk.greenBright('stm receive --topic ' + getDefaultTopic('receive'))}

// execute the default receive command with settings defined on the default 
// configuration 'stm-cli-config.json', but receive from a queue
${chalk.greenBright('stm receive --queue stm-queue --topic ' + getDefaultTopic('receive'))}

${chalk.yellowBright('NOTE: You can override any of the receive parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a receive purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm receive --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('receive'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

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

// execute a specific request command from the named configuration 
${chalk.greenBright('stm request --config cloud-broker --name request')}

// execute the default request command with settings defined on the default 
// configuration 'stm-cli-config.json', but request on topic specified in the 
// command-line (overriding the command settings)
${chalk.greenBright('stm request --topic ' + getDefaultTopic('request'))}

${chalk.yellowBright('NOTE: You can override any of the request parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a request purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm request --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('request'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)
${chalk.greenBright('stm request --topic "stm/logistics/shipped" --name request --config cloud-broker --save')}

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

// execute a specific reply command from the named configuration 
${chalk.greenBright('stm reply --config cloud-broker --name reply')}

// execute the default reply command with settings defined on the default 
// configuration 'stm-cli-config.json', but reply on topic specified in the 
// command-line (overriding the command settings)
${chalk.greenBright('stm reply --topic ' + getDefaultTopic('reply'))}

${chalk.yellowBright('NOTE: You can override any of the reply parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a reply purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm reply --url ws://localhost:8008 --vpn default --username default --password default --topic ' + getDefaultTopic('reply'))}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

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

// execute a specific queue command from the named configuration 
${chalk.greenBright('stm manage queue --config cloud-broker --name queue')}

// execute the default queue command with settings defined on the default 
// configuration 'stm-cli-config.json', but with command-line overrides
${chalk.greenBright('stm manage queue --update --add-subscriptions ')}${getDefaultTopic('receive')} "stm/logistics/>"

${chalk.yellowBright('NOTE: You can override any of the queue parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a queue purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm manage queue --create my-queue --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

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

// execute a specific acl-profile command from the named configuration 
${chalk.greenBright('stm manage acl-profile --config cloud-broker --name acl-profile')}

// execute the default acl-profile command with settings defined on the default 
// configuration 'stm-cli-config.json', but with command-line overrides)
${chalk.greenBright('stm manage acl-profile --update --client-connect-default-action allow')}

${chalk.yellowBright('NOTE: You can override any of the acl-profile parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a acl-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm manage acl-profile --create my-acl-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --client-connect-default-action allow')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)
${chalk.greenBright('stm manage acl-profile --client-connect-default-action allow --name acl-profile --config cloud-broker --save')}

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

// execute a specific client-profile command from the named configuration 
${chalk.greenBright('stm manage client-profile --config cloud-broker --name client-profile')}

// execute the default client-profile command with settings defined on the default 
// configuration 'stm-cli-config.json', with the command-line overrides
${chalk.greenBright('stm manage client-profile --update --allow-guaranteed-endpoint-create-durability all')}

${chalk.yellowBright('NOTE: You can override any of the client-profile parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a client-profile purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm manage client-profile --create my-client-profile --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --allow-guaranteed-endpoint-create-durability all')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)
${chalk.greenBright('stm manage client-profile --allow-guaranteed-endpoint-create-durability all --name client-profile --config cloud-broker --save')}

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

// execute a specific client-username command from the named configuration 
${chalk.greenBright('stm manage client-username --config cloud-broker --name client-username')}

// execute the default client-username command with settings defined on the default 
// configuration 'stm-cli-config.json', with the command-line overrides
${chalk.greenBright('stm manage client-username --update --enabled true')}

${chalk.yellowBright('NOTE: You can override any of the client-username parameters \n' +
'that are applied only for this instance of execution!')}

// If you want to run a client-username purely command based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line
${chalk.greenBright('stm manage client-username --create my-client-username --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --enabled true')}

${chalk.yellowBright('NOTE: The following examples demonstrate how to update an existing command settings\n' +
'in a configuration, as well as how to duplicate (copy) a command \n' +
'setting to a new name!')}

// Update the command setting with the specified command-line parameters (if specified)
${chalk.greenBright('stm manage client-username --enabled true --name client-username --config cloud-broker --save')}

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

