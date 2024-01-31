# Command Configuration Files

---

The __stm__ CLI commands can be executed by providing all required parameters as command-line arguments. However, if one want to reuse the settings and not have to type them on each execution, the command settings can be persisted to a configuration file. At runtime, the configuration file and the command name can be specified as arguments.

Checkout the default configuration file - [stm-cli-config.json](stm-cli-config.json) populated with commands and connection settings corresponding to Solace PubSub+ software broker running on a local host.

## Configuration File

A configuration file contains __message__ and __manage__ sections at a high-level. The __message__ section captures the connection and command settings of basic messaging commands (publish, receive, request and reply), whereas the __manage__ section captures the SEMP connection and command settings of managing key broker resources (queue, client-profile, acl-profile and client-username).

```
{
  "message": {
    "connection": {
      "command": "connection",
      "url": "ws://localhost:8008",
      "vpn": "default",
      "username": "default",
      "password": "default",
      ...other connection parameters
    },
    "send": {
      "command": "send",
      "count": 1,
      "interval": 3000,
      "topic": [
        "solace/try/me"
      ],
      "message": "{\"osType\":\"OS_TYPE\",\"freeMem\":\"FREE_MEM\",\"totalMem\":\"TOTAL_MEM\",\"dateTime\":\"DATE_TIME\"}",
      ...other publish parameters
    },
    "receive": {
      "command": "receive",
      "topic": [
        "solace/try/me"
      ],
      ...other receive parameters
    },
    "request": {
      "command": "request",
      "topic": [
        "solace/try/me/request"
      ],
      "message": "{\"osType\":\"boolean\",\"freeMem\":\"boolean\",\"totalMem\":\"boolean\",\"dateTime\":\"boolean\"}",
      ...other request parameters
    },
    "reply": {
      "command": "reply",
      "topic": [
        "solace/try/me/request"
      ],
      ...other reply parameters
    }
  },
  "manage": {
    "sempconnection": {
      "command": "sempconnection",
      "sempUrl": "http://localhost:8080/SEMP/v2/config",
      "sempVpn": "default",
      "sempUsername": "admin",
      "sempPassword": "admin"
    },
    "queue": {
      "command": "queue",
      "accessType": "exclusive",
      "owner": "",
      "partitionCount": 0,
      "permission": "consume",
      "queue": "stm-queue",
      "addSubscriptions": [
        "solace/try/me"
      ],
      "operation": "CREATE",
      ...other queue management parameters
    },
    "client-profile": {
      "command": "client-profile",
      "clientProfile": "stm-client-profile",
      "operation": "CREATE"
      ...other client-profile management parameters
    },
    "acl-profile": {
      "command": "acl-profile",
      "aclProfile": "stm-acl-profile",
      "operation": "CREATE"
      ...other acl-profile management parameters
    },
    "client-username": {
      "command": "client-username",
      "clientUsername": "stm-client",
      "operation": "CREATE"
      ...other client-username management parameters
    }
  }
}
```

In here, each key name under the _message_ and _manage_ object represents the name of a command. The value of each key, captures the command settings - in the case of management commands, it also includes the intended operation (like LIST, CREATE, UPDATE and DELETE). 

**NOTE:** It is desirable to __not to__ edit the file manually - you should be able to amend the command settings and impart changes while executing the commands.

## Key points

### Configuration File(s)
- A configuration file is intended to record all commands intended to be executed against a specific broker (both for messaging and semp interactions)
- You can create a new configuration file by simply running the `stm command init` command and specify the name of the configuration file via the parameter `--config <CONFIG_FILE>`
- You can have multiple configuration files, with each corresponding to different brokers (local vs cloud and so on)
- You can specify the configuration file via `--config <CONFIG_FILE>` at runtime to hint at where the command settings need to be picked up from.

### Named Commands
- A configuration file can contain a number of commands accessible by their names
- A configuration file created by the `stm config init` command
  - Contains connection and messaging command settings pointing to the local broker (connection, publish, receive, request, reply)
  - Contains semp connection and management command settings pointing to the local broker (sempconnection, queue, client-profile, acl-profile and client-username)
- When executing a CLI command, if a command name is not specified - the basic command setting with the name same as the command will be picked and applied.
  - Example: `stm send` - will simply pick up the command by name `publish` in the default configuration file `stm-cli-configuration.json`
- You can specify the command name `--name <COMMAND_NAME>` at runtime to hint at the command settings that need to be used
  - Example: `stm send --name publish`
  - Optionally, you can also specify override parameters in the command-line `stm send --name publish --time-to-live 60000` which will be applied only for that execution instance
- You can update the command settings at runtime when executing corresponding `cli` command, and issuing a `--save` parameter.
  - Example: `stm send --time-to-live 600000 --save` will update the named command `publish` in the default configuration file.
  - Example: `stm send --config cloud-broker.json --name publish2 --time-to-live 600000 --save` will update the named command `publish2` on the `cloud-broker.json` configuration file.
- You can duplicate a command setting from an existing command setting
  - Example: `stm send --name publish --time-to-live 60000 --save publishWithTTL60Secs` will create a new command with the name `publishWithTTL60Secs` with settings defined on the command name `publish` and with `time-to-live` parameter updated with value specified in the command-line
- You can delete a command settings by name (except for the basic command and connection settings created by the `stm config init` command - i.e, connection, publish, receive, request, reply, sempconnection, queue, client-profile, acl-profile and client-username)
  - Example: `stm config delete --name publishWithTTL60Secs`


## Recommendation

1. Create a configuration file for each broker that you intend to operate against
2. Create a named command if you see a repeated use of a specific or set of parameters at runtime
3. The configuration file contain password for broker connection and other settings, hence keep the configuration file secure
