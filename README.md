[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

# Solace Try-Me CLI

---

Solace Try-Me CLI is a CLI Client on the command line to publish and receive messages from Solace PubSub+ Broker. Designed to help develop, test and debug Solace PubSub+ services and applications faster without the need to use a graphical interface.

## Documentation

### Quick Start

Go to [Git Releases](https://github.com/SolaceLabs/solace-tryme-cli/releases), locate the latest release and review the zip files (approprietly named with the target OS name) under **Assets**. Download the right bundle based on your OS and extract the binary/executable. Move the binary/executable file to a folder that is in the *PATH* or update the path to contain the folder where the file is present.

| **For Windows**                                                                                                                                                                                                                                                                                                                        | **For Linux**                                                                                                                                                                                                                                                                                                                                    | **For Mac**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| You will find an extracted binary `stm.exe` and is ready for use.<br><br>Make sure that either the binary file is copied over to a directory that is in the `%PATH%` or the `%PATH%` is updated with the directory where the binary is present.<br><br>Note that the configuration files created by stm will be stored in `%USERPROFILE%\.stm` folder. | You will find an extracted binary `stm` and is ready for use.<br><br>Make sure that either the binary file is copied over to a directory that is in the `$PATH` or the `$PATH` is updated with the directory where the binary is present.<br><br>Note that the configuration files created by `stm` will be stored in `$HOME/.stm` (or `~/.stm`) folder. | You will find an extracted binary `stm`.<br><br>MacOS would complain that the executable is from an unidentified developer, run the following command to fix this.<br> <br>`xattr -dr com.apple.quarantine stm`<br><br>Make sure that either the binary file is copied over to a directory that is in the `$PATH` or the `$PATH` is updated with the directory where the binary is present.<br><br>Please note that the configuration files created by `stm` will be stored in `$HOME/.stm` (or `~/.stm`) folder. |

#### Verify Installation
Run the version command `stm -v` to ensure that you have downloaded the latest release.
```
$ stm -v
█████╗ █████╗ ██╗    ████╗  ████╗████╗  ████████╗█████╗ ██╗   ██╗    ███╗  ███╗█████╗
█╔═══╝██╔══██╗██║   ██╔═██╗██╔══╝██══╝  ╚══██╔══╝██╔═██╗╚██╗ ██╔╝    ████╗ ███║██╔══╝
█████╗██║  ██║██║   ██████║██║   ███╗      ██║   █████╔╝ ╚████╔╝     ██╔███╔██║███╗
╚══██║██║  ██║██║   ██╔═██║██║   ██╔╝      ██║   ██╔═██╗  ╚██╔╝ ███  ██║╚██╝██║██╔╝
█████║╚█████╔╝█████╗██║ ██║╚████╗████╗     ██║   ██║ ██║   ██║       ██║ ╚╝ ██║█████╗
╚════╝ ╚════╝ ╚════╝╚═╝ ╚═╝ ╚═══╝╚═══╝     ╚═╝   ╚═╝ ╚═╝   ╚═╝       ╚═╝    ╚═╝╚════╝

0.0.32
```
NOTE: The version number should match the stm version you downloaded.

### Command Structure

The following view captures the command hierarchy of the *stm* cli tool.

```

stm
├── -v, --version                   /* output the version number        */
├── -h, --help                      /* display help for command         */
├── -he, --help-examples            /* display examples                 */
├── send                            /* execute a send command           */
├── receive                         /* execute a receive command        */
├── request                         /* execute a request command        */
├── reply                           /* execute a reply command          */
├── config                          /* manage command configurations    */
│   ├── -h, --help                  /* display help for command         */
│   ├── -he, --help-examples        /* display examples                 */
│   ├── init                        /* initialize command configuration */
│   ├── list                        /* list command configurations      */
│   └── delete                      /* delete command configuratio      */
└── manage                          /* manage connection and resources  */
    ├── -h, --help                  /* display help for command         */
    ├── -he, --help-examples        /* display examples                 */
    ├── connection                  /* manage VPN connection            */
    ├── semp-connection             /* manage VPN SEMP connection       */
    ├── queue                       /* manage queue                     */
    ├── client-profile              /* manage client-profile            */
    ├── acl-profile                 /* manage acl-profile               */
    └── client-username             /* manage client-username           */

```

### Command Parameters

For details on CLI parameters, refer to the [parameters](PARAMETERS.md) guide.

You can also use:
- _-h_ or _--help_ option on the command to see basic parameters.
- _-hm_ or _--help-more_ option on the command to see other (advanced) parameters.


### Command Examples

Refer to the [examples](EXAMPLES.md) guide for sample commands. 

You can use:
- _-he_ or _--help-examples_ option on the command to see corresponding examples.

### Command Persistence

The __stm__ utility supports persisting command settings to a file, that can be referenced by name. In fact, the default configuration file present is populated with messaging and manage comments with default settings.

To know more about configuration file and how to create and manage commands, refer to [configuration](CONFIGURATION.md) guide.

## Setup `stm` configuration


### Use with a Software Broker
A software broker installation exposes certain default settings out of the box for messaging and management.

**Messaging**: Broker URL for websocket connection (localhost and port 8008), message VPN (default), client username (default) and password (default). 

**Management**: Broker SEMP URL (localhost and 8080), message VPN (default), semp username (admin) and semp password (admin).

Taking advantage of this, the `stm` tool will automatically create a default configuration when an `stm` command is run without any config reference.  You can review the sample configuration for more details on the settings.

1. Initialize configuration 

```
stm config init
✔  success   success: initialized configuration with default command settings on 'stm-cli-configuration.json' successfully
```

| **Broker Connection**               | **Broker SEMP Connection**                                |
|-------------------------------------|-----------------------------------------------------------|
| **Broker URL:** ws://localhost:8008 | **Broker SEMP URL:** http://localhost:8080/SEMP/v2/config |
| **VPN Name:** default               | **VPN Name:** default                                     |
| **Username:** default               | **SEMP Username:** admin                                  |
| **Password:** default               | **SEMP Password:** admin                                  |

2. If you want to update the settings, you can use the stm manage command.

```
stm manage connection --url ws://localhost:8008 --vpn default --username default --password default
ℹ  info      info: loading 'connection' command from configuration 'stm-cli-config.json'
ℹ  info      info: loading configuration 'stm-cli-config.json'
ℹ  info      info: checking settings for operation - connection
✔  success   success: updated command settings 'connection' on configuration file 'stm-cli-config.json' successfully
```

To update SEMP connection for managing queue, acl-profile, client-profile and client-username:

```
stm manage semp-connection --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin
ℹ  info      info: loading 'sempconnection' command from configuration 'stm-cli-config.json'
ℹ  info      info: loading configuration 'stm-cli-config.json'
ℹ  info      info: checking settings for operation - sempconnection
✔  success   success: updated command settings 'sempconnection' on configuration file 'stm-cli-config.json' successfully
```

**NOTE:** If you want to create additional configuration for a different broker, you can create new configuration by executing the above command with an additional parameter of `--config <CONFIG_NAME>`, and you can refer to the named configuration by specifying them in any of the messaging and management commands.


### Use with a Cloud Broker

Unlike Software Broker, a Cloud Broker requires explicit initialization as the parameters vary from instance to instance. 

Before proceeding, collect information on the following settings from the “Connect” and “Manage” tabs for your Messaging Service in Solace Cloud. 

| **Broker Connection**<br>**(from Connect → “Solace Web Messaging”)** | **Broker SEMP Connection**<br>**(from Manage → “SEMP - REST API”)** |
|----------------------------------------------------------------------|---------------------------------------------------------------------|
| **URL**                                                              | **URL**                                                             |
| **VPN Name**                                                         | **VPN Name**                                                        |
| **Username**                                                         | **Username**                                                        |
| **Password**                                                         | **Password**                                                        |
-------------------

1. Initialize Configuration

```
stm config init
✔  success   success: initialized configuration with default command settings on 'stm-cli-configuration.json' successfully
```

2. Now, update broker messaging and SEMP connection

To update broker connection settings for messaging commands, you can issue the following command to update the configuration.

```
stm manage connection --url wss://mr-connection-xxxx.messaging.solace.cloud:443 --vpn my-broker --username solace-cloud-client --password xxxxx
ℹ  info      info: loading 'connection' command from configuration 'stm-cli-configuration.json'
ℹ  info      info: loading configuration 'cloud-broker'
ℹ  info      info: checking settings for operation - connection
ℹ  info      info: [1] url of connection changed: ws://localhost:8008 => wss://mr-connection-xxxx.messaging.solace.cloud:443
ℹ  info      info: [2] vpn of connection changed: default => my-broker
ℹ  info      info: [3] username of connection changed: default => solace-cloud-client
ℹ  info      info: [4] password of connection changed: default => xxxxx
⚠  warning   warn: VPN Connection settings changed, this would impact all the messaging commands on the configuration
Changes detected in the settings, do you want to overwrite (y/n): y
✔  success   success: updated command settings 'connection' on configuration file 'stm-cli-configuration.json' successfully
```

To update SEMP connection for managing queue, acl-profile, client-profile and client-username:

```
stm manage semp-connection --semp-url https://mr-connection-xxxx.messaging.solace.cloud:943/SEMP/v2/config --semp-vpn my-broker --semp-username xxx-admin --semp-password xxxxx
ℹ  info      info: loading 'sempconnection' command from configuration 'cloud-broker'
ℹ  info      info: loading configuration 'stm-cli-configuration'
ℹ  info      info: checking settings for operation - sempconnection
ℹ  info      info: [1] sempUrl of sempconnection changed: http://localhost:8080 => https://mr-connection-xxxx.messaging.solace.cloud:943/semp/v2/config
ℹ  info      info: [2] sempVpn of sempconnection changed: default => my-broker
ℹ  info      info: [3] sempUsername of sempconnection changed: admin => xxx-admin
ℹ  info      info: [4] sempPassword of sempconnection changed: admin => xxxxx
⚠  warning   warn: VPN SEMP Connection settings changed, this would impact all the management commands on the configuration
Changes detected in the settings, do you want to overwrite (y/n): y
✔  success   success: updated command settings 'sempconnection' on configuration file 'stm-cli-configuration.json' successfully
```

**NOTE:** If you want to create additional configuration for a different broker, you can create new configuration by executing the above command with an additional parameter of `--config <CONFIG_NAME>`, and you can refer to the named configuration by specifying them in any of the messaging and management commands.


## Run `stm` tool


### Working with Software Broker

Once you complete the `stm` setup process and a configuration is successfully created, you can run the messaging commands.

### Receive Messages
``` code
stm receive
ℹ  info: loading configuration 'stm-cli-config.json'
…  connecting to broker [ws://localhost:8008, vpn: default, username: default, password: ******]
✔  success: === stm_recv_b1485ead successfully connected and ready to receive events. ===
ℹ  info: subscribing to solace/try/me
ℹ  info: press Ctrl-C to exit
✔  success: successfully subscribed to topic: solace/try/me
```

On a second window/terminal, you can launch a publisher and see the events received on the receiver.

``` code
stm send
ℹ  info: loading 'send' command from configuration 'stm-cli-config.json'
…  connecting to broker [ws://localhost:8008, vpn: default, username: default, password: ******]
✔  success: === stm_pub_0d68a409 successfully connected and ready to publish events. ===
…  publishing...
✔  success: message published to topic - [Topic solace/try/me], type - BINARY
ℹ  info: Message Properties
Destination:                            [Topic solace/try/me]
ℹ  info: Message Payload (bytes): 101
✔  success: disconnecting from Solace PubSub+ Event Broker...
✔  success: disconnected
✔  success: exiting...
```

At this point, you should see the event received on the receiver.

```code
✔  success: message Received - [Topic solace/try/me], type - BINARY
ℹ  info: Message Properties
Destination:                            [Topic solace/try/me]
ℹ  info: Message Payload (bytes): 100
```

**NOTE:** `stm` supports a default output mode that prints the destination and the message payload length (not the payload itself). However, if you want more details around message & user properties and payload - explore the other options i.e., `PROPS` to print message properties + just payload length, and `FULL` to print message properties and a pretty-print of the payload.

### Working with Cloud Broker

Since the connection parameters are distinct for Cloud Broker, you will have to create a new Try-Me CLI configuration with appropriate connection parameters. You can make the `stm` operations directed to a specific broker by specifying the configuration that holds that broker's connection details by specifying `--config <CONFIG_FILE>` parameter.

At this point, the functionality of messaging commands are same irrespective of local or cloud broker. Try `stm send` and `stm receive` commands with a configuration containing cloud broker.

🎉 You are set, explore other commands like `request`, `reply` and the parameters that goes along with the messaging commands!

## Using `stm` to create and modify Broker resources

`stm` supports creation and management of key broker resources relevant to messaging operations, like:
- Client Profile
- ACL Profile
- Client Username and
- Queue

### Create a Queue

The default `stm` configuration has a default a `queue` create command - explore the `manage` -> `queue` setting in the sample configuration file.

You can simply run the command by
```
stm manage queue 
ℹ  info: loading 'queue' command from configuration 'stm-cli-config.json'
✔  success: queue 'stm-queue' created successfully
✔  success: subscription to topic 'solace/try/me' added successfully
✔  success: 1 subscription(s) found on queue stm-queue -
solace/try/me
✔  success: exiting...
```

Of course, if you want to specify queue parameters refer to the parameters of the `stm queue` command and set them appropriately.

Checkout examples of the command by passing `-he` or `--help-examples` parameter.

```
stm manage queue -he
ℹ  info: loading 'queue' command from configuration 'stm-cli-config.json'

Examples:
// execute the default queue command with settings defined on the
// default configuration 'stm-cli-config.json'
stm manage queue

HINT: You can view the default queue command settings 'stm config list --name queue'!

NOTE: The actual operation is determined by the operation parameter - create, update or delete!

// execute a specific queue command from the named configuration
stm manage queue --config cloud-broker --name queue

// execute the default queue command with settings defined on the default
// configuration 'stm-cli-config.json', but with command-line overrides
stm manage queue --update --add-subscriptions solace/try/me "stm/logistics/>"

NOTE: You can override any of the queue parameters
that are applied only for this instance of execution!

// If you want to run a queue entirely based on the command-line parameters
// without any reference to recorded command settings, you can do so by specifying
// requisite parameters in the command-line

stm manage queue --create my-queue --semp-url http://localhost:8080/SEMP/v2/config --semp-vpn default --semp-username admin --semp-password admin --add-subscriptions  stm/cli/topic --list-subscriptions

....
```

Refer to the [examples](EXAMPLES.md) guide for more details.

## Contributing

Contributions are encouraged! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.

### Develop

Recommended version for Node environment:

- v18.\*.\*

``` shell
# Clone
git clone --recurse-submodules git@github.com:SolaceLabs/solace-tryme-cli.git
cd solace-tryme-cli

# Install dependencies
yarn install

# Compiles and hot-reloads for development
yarn run dev

# Compiles and minifies for production
yarn run build

# Creates packages for target platforms
yarn run package

# OptionaL: To get the latest changes from the feeds site repo: 
git submodule update --remote

```

After a successful build, you will see the binary executable for each system in the `release` directory.

##### Run from build
After running `yarn install` above you can now run from the build using `yarn run index [command]`

```
$ yarn run index

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

## Technology Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [PubSub+ JavaScript API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/nodejs/index.html)
- [PubSub+ SEMPv2 API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/swagger-ui/software-broker/config/index.html)
- [Commande.js](https://github.com/tj/commander.js)

## Resources
This is not an officially supported Solace product.

For more information try these resources:
- Ask the [Solace Community](https://solace.community)
- The Solace Developer Portal website at: https://solace.dev

## Authors
See the list of [contributors](https://github.com/SolaceLabs/solace-tryme-cli/graphs/contributors) who participated in this project.

## License
See the [LICENSE](LICENSE.txt) file for details.
