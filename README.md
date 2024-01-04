# Solace Try-Me CLI

---

Solace Try-Me CLI is a CLI Client on the command line to publish and receive messages from Solace PubSub+ Broker. Designed to help develop, test and debug Solace PubSub+ services and applications faster without the need to use a graphical interface.

## Documentation

### Quick Start

Go to [Git Releases](https://github.com/SolaceLabs/solace-tryme-cli/releases), locate the latest release and review the executables under **Assets**. Pick the binary based on your OS and download. Rename the downloaded binary as **stm** and move the file to a folder that is in the *PATH* or update the path to contain the folder where the binary file is present.


### Command Structure

The following view captures the command hierarchy of the *stm* cli tool.

```
stm
├── -v, --version                                   /*  output the version number */
├── -h, --help                                      /* display help for command */
├── send [options]                                  /* Execute a publish command */
├── receive [options]                               /* Execute a receive command */
├── request [options]                               /* Execute a request command */
├── reply [options]                                 /* Execute a reply command */
├── config                                          /* Manage command configurations */
│   ├── init [options]                              /* Initialize command samples */
│   ├── list [options]                              /* List command samples */
│   ├── delete [options]                            /* Delete command sample */
│   └── help [command]                              /* display help for command   */
├── manage                                          /* Manage broker connection and resources */
│   ├── connection [options]                        /* Manage message VPN connection */
│   ├── semp-connection [options]                   /* Manage SEMP connection */
│   ├── queue [options]                             /* Manage a queue */
│   ├── client-profile [options]                    /* Manage a client-profile */
│   ├── acl-profile [options]                       /* Manage a acl-profile */
│   ├── client-username [options]                   /* Manage a client username */
│   └── help [command]                              /* display help for command */
└── help [command]                                  /* display help for command */

```

### Command Parameters

For details on CLI parameters, refer to the [parameters](PARAMETERS.md) document.

You can also use:
- _-h_ or _--help_ option on the command to see basic parameters.
- _-hm_ or _--help-more_ option on the command to see other (advanced) parameters.


### Command Examples

Refer to the [examples](EXAMPLES.md) page for sample commands. 

You can also use the _-he_ or _--help-examples_ option on the command to see corresponding examples.

### Command Persistence

The __stm__ utility supports persisting command settings to a file, that can be referenced by name. In fact, the default configuration file present is populated with messaging and manage comments with default settings.

To know more about configuration file and how to create and manage commands, refer to [configuration](CONFIGURATION.md) document.

## Run

### Working with Software Broker

If you have Solace Software Broker running on your local machine, you can simply run the following commands to see publish-subscribe in action. It is because, the CLI automatically creates a configuration pointing to local broker with default settings.

``` code
stm receive
🎅  santa     Hoho! No default configuration found, creating one for you...
✔  success   success: initialized configuration with default command settings on 'stm-cli-config.json' successfully
ℹ  info      info: loading configuration 'stm-cli-config.json'
…  awaiting  connecting to broker [ws://localhost:8008, vpn: default, username: default, password: default]
✔  success   success: === successfully connected and ready to receive events. ===
ℹ  info      info: subscribing to solace/try/me
ℹ  info      info: press Ctrl-C to exit
✔  success   success: successfully subscribed to topic: solace/try/me
```

As you can see from the messages, the Try-Me CLI created a default configuration with settings pointing to the local broker for both messaging and semp interactions, along with topics for messaging operation. Review the configuration that gets created in the home directory `$HOME/.stm/stm-cli-configuration.json` for various settings for broker connection, semp connection, messaging (send, receive, request and reply) and management (queue, client-profile, acl-profile, and client-username).

On a different window/terminal, you can launch a publisher and see the events received on the receiver.

``` code
ℹ  info      info: loading 'send' command from configuration 'stm-cli-config.json'
…  awaiting  connecting to broker [ws://localhost:8008, vpn: default, username: default, password: default]
✔  success   success: === successfully connected and ready to publish events. ===
…  awaiting  publishing...
✔  success   success: message published to topic solace/try/me
ℹ  info      info: Message Payload:
{"osType":"Darwin","freeMem":70725632,"totalMem":17179869184,"timeZone":"Asia/Calcutta"}
✔  success   success: disconnecting from Solace PubSub+ Event Broker...
✔  success   success: disconnected
```

### Working with Cloud Broker

Since the connection parameters are distinct for Cloud Broker, you will have to create a new Try-Me CLI configuration with appropriate connection parameters.

First, create a new configuration with name 'stm-cloud-broker'.

```
stm config init --config stm-cloud-broker.json
✔  success   success: initialized configuration with default command settings on 'stm-cloud-broker.json' successfully
```

Now, let us update the broker connection parameters. Collect the connection parameters for the cloud broker in the Event Portal - choose the parameters from the 'Solace Web Messaging' category. We need username, password, vpn-name and messaging host URL.

```
stm manage connection \
  --url wss://mr-connection-xxxxx.messaging.solace.cloud:443 \
  --vpn your-broker \
  --username solace-cloud-client \
  --password xxxxxxx \
  --config stm-cloud-broker
ℹ  info      info: loading 'connection' command from configuration 'stm-cloud-broker'
ℹ  info      info: loading configuration 'stm-cloud-broker'
ℹ  info      info: checking settings for operation - connection
ℹ  info      info: [1] url of connection changed: ws://localhost:8008 => wss://mr-connection-xxxxx.messaging.solace.cloud:443
ℹ  info      info: [2] vpn of connection changed: default => your-broker
ℹ  info      info: [3] username of connection changed: default => solace-cloud-client
ℹ  info      info: [4] password of connection changed: default => xxxxxxx
⚠  warning   warn: VPN Connection settings changed, this would impact all the messaging commands on the configuration
Changes detected in the settings, do you want to overwrite (y/n): y
✔  success   success: updated command settings 'connection' on configuration file 'stm-cloud-broker.json' successfully
```

Lastly, let us update the SEMP connection to the cloud broker. Collect the connection parameters for the cloud broker in the Event Portal - choose the parameters from the 'Solace Web Messaging' category. We need username, password, vpn-name and messaging host URL.

```
stm manage semp-connection \
  --semp-url https://mr-connection-xxxxx.messaging.solace.cloud:943/SEMP/v2/config \
  --semp-vpn your-broker \
  --semp-username your-broker-admin \
  --semp-password xxxxx 
  --config stm-cloud-broker

ℹ  info      info: loading 'sempconnection' command from configuration 'stm-cloud-broker'
ℹ  info      info: loading configuration 'stm-cloud-broker'
ℹ  info      info: checking settings for operation - sempconnection
ℹ  info      info: [1] sempUrl of sempconnection changed: http://localhost:8080 => https://mr-connection-xxxxx.messaging.solace.cloud:943/semp/v2/config
ℹ  info      info: [2] sempVpn of sempconnection changed: default => your-broker
ℹ  info      info: [3] sempUsername of sempconnection changed: admin => your-broker-admin
ℹ  info      info: [4] sempPassword of sempconnection changed: admin => xxxxx
⚠  warning   warn: VPN SEMP Connection settings changed, this would impact all the management commands on the configuration
Changes detected in the settings, do you want to overwrite (y/n): y
✔  success   success: updated command settings 'sempconnection' on configuration file 'stm-cloud-broker.json' successfully
```

Now the Solace Try-Me CLI can work with a cloud broker - but be sure to specify the configuration name with a `--config` parameter in the command-line.

A receive command to cloud broker via the CLI:

``` code
stm receive --config stm-cloud-broker
ℹ  info      info: loading 'receive' command from configuration 'stm-cloud-broker'
…  awaiting  connecting to broker [wss://mr-connection-xxxx.messaging.solace.cloud:443, vpn: your-broker, username: solace-cloud-client, password: xxxx]
✔  success   success: === successfully connected and ready to receive events. ===
ℹ  info      info: subscribing to solace/try/me
ℹ  info      info: press Ctrl-C to exit
✔  success   success: successfully subscribed to topic: solace/try/me
```

A send command to cloud broker via the CLI:
```
stm send --config stm-cloud-broker
ℹ  info      info: loading 'send' command from configuration 'stm-cloud-broker'
…  awaiting  connecting to broker [wss://mr-connection-xxxx.messaging.solace.cloud:443, vpn: your-broker, username: solace-cloud-client, password: xxxx]
✔  success   success: === successfully connected and ready to publish events. ===
…  awaiting  publishing...
✔  success   success: message published to topic solace/try/me
ℹ  info      info: Message Payload:
{"osType":"Darwin","freeMem":58310656,"totalMem":17179869184,"timeZone":"Asia/Calcutta"}
✔  success   success: disconnecting from Solace PubSub+ Event Broker...
✔  success   success: disconnected
```

🎉 You are set, explore more!

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

# Creates packages for target platforms
yarn run package
```

After a successful build, you will see the binary executable for each system in the `release` directory.

##### Run from build
After running `yarn install` above you can now run from the build using `yarn run index [command]`

```
$ yarn run index

Usage: stm [options] [command]

A Solace Try-Me client for the command line

Options:
  -v, --version      output the version number
  -h, --help         display help for command

Commands:
  send [options]     Execute a send command
  receive [options]  Execute a receive command
  request [options]  Execute a request command
  reply [options]    Execute a reply command
  config             Manage command configurations
  manage             Manage broker connection and resources
  help [command]     display help for command
```

## Technology Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [pkg](https://github.com/vercel/pkg)
- [PubSub+ JavaScript API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/nodejs/index.html)
- [PubSub+ SEMPv2 API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/swagger-ui/software-broker/config/index.html)

