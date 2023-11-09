# Solace Try-Me CLI

---

Solace Try-Me CLI is a CLI Client on the command line to publish and receive messages from Solace PubSub+ Broker. Designed to help develop, test and debug Solace PubSub+ services and applications faster without the need to use a graphical interface.

## Documentation

### Quick Start

Go to [Git Releases](https://github.com/SolaceLabs/solace-tryme-cli/releases), locate the latest release and review the executables under **Assets**. Pick the binary based on your OS and download. Rename the downloaded binary as **stm** and move the file to a folder that is in the *PATH* or update the path to contain the folder where the binary file is present.
<style>
td, th {
   border: none!important;
   height: auto;
}
</style>

### Command Structure

The following view captures the command hierarchy of the *stm* cli tool.

```
stm/
├── --version                                 /* output the version number */
├── -h, --help                                /* display help for command */
├── publish [options]                         /* Execute a publish command */
│   └── [Connection, Session, Publish, Message and Configuration parameters]
├── receive [options]                         /* Execute a receive command */
│   └── [Connection, Queue, Session and Configuration parameters]
├── request [options]                         /* Execute a request command */
│   └── [Connection, Session, Request, Message and Configuration parameters]
├── reply [options]                           /* Execute a reply command */
│   └── [Connection, Session, Reply, Message and Configuration parameters]
├── config                                    /* Manage command configurations */
│   ├── init [options]                        /* Initialize command samples */
│   │   └── [Configuration parameters]
│   ├── list [options]                        /* List command samples */
│   │   └── [Configuration parameters]
│   ├── view [options]                        /* View command sample */
│   │   └── [Configuration parameters]
│   ├── delete [options]                      /* Delete command sample */
│   │   └── [Configuration parameters]
│   └── help [command]                        /* display help for command */  
├── manage                                    /* Manage broker connection and resources */
│   ├── queue [options]                       /* Manage a queue */
│   │   └── [SEMP Connection, Operation, Queue and Configuration parameters]
│   ├── client-profile [options]              /* Manage a client-profile */
│   │   └── [SEMP Connection, Operation, Client Profile and Configuration parameters]
│   ├── acl-profile [options]                 /* Manage a acl-profile */
│   │   └── [SEMP Connection, Operation, ACL Profile and Configuration parameters]
│   ├── client-username [options]             /* Manage a client username */
│   │   └── [SEMP Connection, Operation, Client Username and Configuration parameters]
│   ├── vpn-connection [options]              /* Manage VPN connection */
│   │   └── [Connection, Session and Configuration parameters]
│   ├── semp-connection [options]             /* Manage SEMP connection */
│   │   └── [SEMP Connection, Session and Configuration parameters]
│   └── help [command]                        /* display help for command */
└── help [command]                            /* display help for command */
```

For details on CLI parameters, refer to the [parameters](PARAMETERS.md) documentation.


###Examples

Refer to the [examples](EXAMPLES.md) page for sample commands. 

You can also use the _-he_ or _--help-examples_ option on the command to see corresponding examples.

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
  --version          output the version number
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
## Technology Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [pkg](https://github.com/vercel/pkg)
- [PubSub+ JavaScript API](https://docs.solace.com/API-Developer-Online-Ref-Documentation/nodejs/index.html)

