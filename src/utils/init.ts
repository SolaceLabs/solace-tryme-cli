import { Logger } from './logger'
import { 
  defaultConfigFile,
  defaultMessageConnectionConfig,
  defaultMessagePublishConfig,
  defaultMessageReceiveConfig,
  defaultMessageRequestConfig,
  defaultMessageReplyConfig,
  defaultManageAclProfileConfig,
  defaultManageClientProfileConfig,
  defaultManageClientUsernameConfig,
  defaultManageConnectionConfig,
  defaultManageQueueConfig,
  getCommandGroup,
  baseCommands,
  messagingCommands,
  commandConnection,
  commandSempConnection,
  manageCommands
} from './defaults'
import { saveConfig, loadConfig, decoratePath, processPath, fileExists, writeConfig } from './config'
import chalk from 'chalk'
import { displayHelpExamplesForConfigInit, displayHelpExamplesForConfigList, displayHelpExamplesForConfigDelete } from './examples'
import { prettyJSON } from './prettify'

export const getOperationFromConfig = (options: any) => {
  if (options?.list) return 'List details of';
  if (options?.create) return 'Create';
  if (options?.update) return 'Update';
  if (options?.delete) return 'Delete';
  return 'Unknown'
}

export const initializeConfig = (options:StmConfigOptions, optionsSource: any) => {
  const { helpExamples } = options

  if (helpExamples) {
    displayHelpExamplesForConfigInit()
    process.exit(0);
  }

  const configFile = options.config ? options.config : defaultConfigFile;
  const homedir = require('os').homedir();
  const filePath = processPath(`${homedir}/.stm/${configFile}`)
  if (!filePath.endsWith('.json')) filePath.concat('.json')
  if (fileExists(filePath)) {
    var prompt = require('prompt-sync')();
    var confirmation = prompt(`${chalk.whiteBright(`Config file '${decoratePath(configFile)}' exists , do you want to reinitialize (`) + 
                                chalk.greenBright('y') + chalk.whiteBright('/') + 
                                chalk.redBright('n') + chalk.whiteBright('): ')}`);
    if (!['Y', 'YES'].includes(confirmation.toUpperCase())) {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }
  }
  
  const config = buildMessageConfig({}, options, optionsSource, []);
  saveConfig(config)
}

export const deleteConfig = (options:StmConfigOptions, optionsSource: any) => {
  const { helpExamples } = options

  if (helpExamples) {
    displayHelpExamplesForConfigDelete()
    process.exit(0);
  }

  if (optionsSource.name !== 'cli') {
    Logger.logError(`required option '--name <COMMAND_NAME>' not specified`)
    Logger.error('exiting...')
    process.exit(1)
  }

  if (!options.config) options.config = defaultConfigFile
  const homedir = require('os').homedir();
  const filePath = processPath(`${homedir}/.stm/${options.config as string}`)  
  if (!fileExists(filePath)) {
    Logger.error(`no configuration ${options.config} found`)
    Logger.error('exiting...');
    process.exit(1)
  }

  // load current configuration
  var current:any = loadConfig(options.config)
  current.config = options.config

  if (options.name) {
    if (baseCommands.includes(options.name)) {
      Logger.error(`cannot delete base command configuration '${options.name}' from the configuration '${options.config}'`)
      Logger.error('exiting...');
      process.exit(1)
    }

    if (!current.message[options.name] && !current.manage[options.name]) {
      Logger.error(`no command '${options.name}' found on the configuration '${options.config}'`)
      Logger.error('exiting...');
      process.exit(1)
    }

    var prompt = require('prompt-sync')();
    var confirmation = prompt(`${chalk.whiteBright(`Are you sure you want to delete the command '${options.name}' on configuration '${options.config}' (`) + 
                                chalk.greenBright('y') + chalk.whiteBright('/') + 
                                chalk.redBright('n') + chalk.whiteBright('): ')}`);
    if (!['Y', 'YES'].includes(confirmation.toUpperCase())) {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }

    delete current.message[options.name]
    delete current.manage[options.name]
    writeConfig(current, 'update', options.name as string)
    Logger.success(`the command '${options.name}' deleted from the configuration '${options.config}'`)
  }

}

export const listConfig = (options:StmConfigOptions, optionsSource: any) => {
  const { helpExamples } = options
  var AsciiTable = require('ascii-table')

  if (helpExamples) {
    displayHelpExamplesForConfigList()
    process.exit(0);
  }

  const config = buildConfig(options, optionsSource, 'all');
  if (options.name) {
    Logger.logDetailedSuccess(`Command settings of operation: ${options.name}`, prettyJSON(JSON.stringify(config)))
    process.exit(0)
  }


  var count = 0;
  var table = new AsciiTable('Connection Settings')
  table.setHeading('Command', 'Name', 'Broker URL', 'Message VPN', 'Username', 'Password' )
  count++
  table.addRow(config.connection.command.toUpperCase(), config.connection.command, 
                config.connection.url, config.connection.vpn, config.connection.username, 
                "******")
  table.addRow(config.sempconnection.command.toUpperCase(), config.sempconnection.command, 
                config.sempconnection.sempUrl, config.sempconnection.sempVpn, config.sempconnection.sempUsername, 
                "******")
  table.setJustify(false);
  console.log(table.toString());

  var table = new AsciiTable('Messaging Commands')
  table.setHeading('Command', 'Name', 'Topic(s)', 'Broker URL', 'Message VPN', 'Credentials' )
  
  let commands:any = {};
  messagingCommands.forEach(c => commands[c] = []);
  Object.keys(config).forEach((key) => {
    if (messagingCommands.includes(config[key].command)) {
      config[key].name = key;
      commands[config[key].command].push(config[key])
    }
  });

  let lastOp = '';
  Object.keys(commands).forEach((key) => {
    commands[key].forEach((selected:any) => {
      count++
      if (typeof selected.topic !== 'object' || (typeof selected.topic === 'object' && selected.topic.length === 1)) {
        table.addRow((selected.command.toUpperCase() !== lastOp ? selected.command.toUpperCase() : ''), 
                      selected.name, JSON.stringify(selected.topic), config.connection.url,
                      config.connection.vpn, config.connection.username + '/' + "******")
      } else {
        table.addRow((selected.command.toUpperCase() !== lastOp ? selected.command.toUpperCase() : ''), 
                      selected.name, '[ ', config.connection.url,
                      config.connection.vpn, config.connection.username + '/' + "******")
        for (var i=0; i<selected.topic.length; i++) {
          table.addRow('', '', '  "' + selected.topic[i] + (i === selected.topic.length-1 ? '"' : '",'), '', '', '');
        }
        table.addRow('', '', ']', '', '', '');
      }
      lastOp = selected.command.toUpperCase();
    });
  });
  table.setJustify(false);
  console.log(table.toString());

  table = new AsciiTable('Management Commands')
  table.setHeading('Resource', 'Command', 'Name', 'Broker SEMP URL', 'Message VPN', 'Credentials' )
  
  commands = {};
  manageCommands.forEach(c => commands[c] = []);
  Object.keys(config).forEach((key) => {
    if (manageCommands.includes(config[key].command)) {
      config[key].name = key;
      commands[config[key].command].push(config[key])
    }
  });

  lastOp = '';
  Object.keys(commands).forEach((key) => {
    commands[key].forEach((selected:any) => {
      count++
      table.addRow((selected.command.toUpperCase() !== lastOp ? selected.command.toUpperCase() : ''), 
                    selected.operation.toUpperCase(), selected.name, 
                    config.sempconnection.sempUrl, config.sempconnection.sempVpn, 
                    config.sempconnection.sempUsername + '/' + "******")
      lastOp = selected.command.toUpperCase();
    });
  });
  table.setJustify(false);
  console.log(table.toString());

  Logger.success(`[${count}] commands found in configuration ${options.config}`);
}

export const buildConfig = (options:any, optionsSource: any, commandType: CommandType) => {
  const configFile = optionsSource.config === 'cli' && typeof options.config === 'string' ? options.config : defaultConfigFile;
  Logger.logDetailedSuccess(`loading ${configFile === defaultConfigFile ? 'from default' : 'from'} configuration file`, `${decoratePath(configFile)}`)
  const config = loadConfig(configFile);
  var commands:string[] = [];
  commands = commands.concat(Object.keys(config.manage))
  commands = commands.concat(Object.keys(config.message))

  const result:any = {};
  Object.keys(config.message).forEach((key:string) => {
    if (commands.includes(key)) {
      result[key] = config.message[key];
      Object.keys(config.message[key]).forEach((subKey:string) => {
        if (optionsSource[subKey] === 'cli')
          result[key][subKey] = options[subKey];
      })
    }
  })

  Object.keys(config.manage).forEach((key:string) => {
    if (commands.includes(key)) {
      result[key] = config.manage[key];
      Object.keys(config.manage[key]).forEach((subKey:string) => {
        if (optionsSource[subKey] === 'cli')
          result[key][subKey] = options[subKey];
      })
    }
  })

  if (commandType !== 'all' && (!optionsSource.name || optionsSource.name === 'default') && !result[commandType]) {
    Logger.logError(`no default ${chalk.greenBright(commandType)} configuration found in ${decoratePath(configFile)}`)
    Logger.logError('exiting...')
    process.exit(1)
  }

  if (optionsSource.name === 'cli' && typeof options.name === 'string') {
    if (!commands.includes(options.name)) {
      Logger.logError(`command name '${options.name}' not found in the ${configFile.endsWith('.json') ? configFile : configFile.concat('.json')}`)
      Logger.logError('exiting...')
      process.exit(1)
    }

    const command:any = {}
    if (messagingCommands.includes(result[options.name].command)) {
      command[options.name] = result[options.name]
      command.connection = result[commandConnection]
    } else if (manageCommands.includes(result[options.name].command)) {
      command[options.name] = result[options.name]
      command.connection = result[commandSempConnection]
    } else {
      command[options.name] = result[options.name]
    }
    return command
  }

  return result;
}

export const buildMessageConfig = (current: any, options:any, optionsSource: any, commands: any) => {
  const result:any = {
    config: optionsSource.config === 'cli' && typeof options.config === 'string' ? options.config : defaultConfigFile,
    message: {
      connection: (!commands.length || commands.includes('connection')) ? { command: 'connection'} : undefined,
      send: (!commands.length || commands.includes('send')) ? { command: 'send' } : undefined,
      receive: (!commands.length || commands.includes('receive')) ? { command: 'receive' } : undefined,
      request: (!commands.length || commands.includes('request')) ? { command: 'request' } : undefined,
      reply: (!commands.length || commands.includes('reply')) ? { command: 'reply' } : undefined,
    },
    manage: {
      sempconnection: (!commands.length || commands.includes('sempconnection')) ? { command: 'sempconnection' } : undefined,
      queue: (!commands.length || commands.includes('queue')) ? { command: 'queue' } : undefined,
      'client-profile': (!commands.length || commands.includes('client-profile')) ? { command: 'client-profile' } : undefined,
      'acl-profile': (!commands.length || commands.includes('acl-profile')) ? { command: 'acl-profile' } : undefined,
      'client-username': (!commands.length || commands.includes('client-username')) ? { command: 'client-username' } : undefined,
    }
  };

  // initialize messaging settings
  result.message.connection && Object.keys(defaultMessageConnectionConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.message.connection[key] = options[key];
    } else {
      current ? 
        result.message.connection[key] = current.message.connection[key] :
        result.message.connection[key] = defaultMessageConnectionConfig[key];
    }
  })
  
  if (result.message.connection) {
    delete result.message.connection.config;
  }

  result.message.send && Object.keys(defaultMessagePublishConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.message.send[key] = options[key];
    } else {
      current ? 
        result.message.send[key] = current.message.send[key] :
        result.message.send[key] = defaultMessagePublishConfig[key];
    }
  })

  result.message.receive && Object.keys(defaultMessageReceiveConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.message.receive[key] = options[key];
    } else {
      current ? 
        result.message.receive[key] = current.message.receive[key] :
        result.message.receive[key] = defaultMessageReceiveConfig[key];
    }
  })

  result.message.request && Object.keys(defaultMessageRequestConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.message.request[key] = options[key];
    } else {
      current ? 
        result.message.request[key] = current.message.request[key] :
        result.message.request[key] = defaultMessageRequestConfig[key];
    }
  })

  result.message.reply && Object.keys(defaultMessageReplyConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.message.reply[key] = options[key];
    } else {
      current ? 
        result.message.reply[key] = current.message.reply[key] :
        result.message.reply[key] = defaultMessageReplyConfig[key];
    }
  })

  // initialize manage settings
  result.manage.sempconnection && result.manage.sempconnection && Object.keys(defaultManageConnectionConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.manage.sempconnection[key] = options[key];
    } else {
      current ? 
        result.manage.sempconnection[key] = current.manage.sempconnection[key] :
        result.manage.sempconnection[key] = defaultManageConnectionConfig[key];
    }
  })
  
  if (result.manage.sempconnection) {
    delete result.manage.sempconnection.config;
  }

  result.manage.queue && Object.keys(defaultManageQueueConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.manage.queue[key] = options[key];
    } else {
      current ? 
        result.manage.queue[key] = current.manage.queue[key] :
        result.manage.queue[key] = defaultManageQueueConfig[key];
    }
  })

  result.manage['client-profile'] && Object.keys(defaultManageClientProfileConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.manage['client-profile'][key] = options[key];
    } else {
      current ? 
        result.manage['client-profile'][key] = current.manage['client-profile'][key] :
        result.manage['client-profile'][key] = defaultManageClientProfileConfig[key];
    }
  })

  result.manage['acl-profile'] && Object.keys(defaultManageAclProfileConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.manage['acl-profile'][key] = options[key];
    } else {
      current ? 
        result.manage['acl-profile'][key] = current.manage['acl-profile'][key] :
        result.manage['acl-profile'][key] = defaultManageAclProfileConfig[key];
    }
  })

  result.manage['client-username'] && Object.keys(defaultManageClientUsernameConfig).forEach((key:string) => {
    if (optionsSource[key] === 'cli') {
      result.manage['client-username'][key] = options[key];
    } else {
      current ? 
        result.manage['client-username'][key] = current.manage['client-username'][key] :
        result.manage['client-username'][key] = defaultManageClientUsernameConfig[key];
    }
  })

  // fix up name
  if (optionsSource.name === 'cli') {
    let group = getCommandGroup(options.command)
    if (!group) {
      Logger.logDetailedError('unknown command  - ', options.command)
      Logger.logError('exiting...')
      process.exit(1)
    }  
    result[group][options.name] = result[group][options.command]
  }

  return result;
}