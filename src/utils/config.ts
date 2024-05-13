import * as fs from 'fs'
import path from 'path'
import { Logger } from './logger'
import chalk from 'chalk'
import { baseCommands, commandConnection, commandSempConnection, defaultConfigFile, defaultLastVersionCheck, defaultManageConnectionConfig, defaultMessageConnectionConfig, defaultMetaKeys, getCommandGroup, getDefaultConfig } from './defaults'
import { buildMessageConfig } from './init'
import { parseNumber } from './parse'

const defaultPath = `${require('os').homedir()}/`

export const fileExists = (filePath: string) => fs.existsSync(filePath)

export const decoratePath = (filePath: boolean | string) => {
  let result = ''
  if (filePath === true)
    result = defaultPath
  else if (typeof filePath === 'string')
    result = filePath.concat(filePath.endsWith('.json') ? '' : '.json');
  return result;
}

export const processPath = (savePath: boolean | string) => {
  let filePath = ''
  if (savePath === true) {
    filePath = defaultPath
  } else if (typeof savePath === 'string') {
    filePath = path.normalize(savePath)
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(filePath)
    }
    filePath = filePath.concat(savePath.endsWith('.json') ? '' : '.json');
  }
  return filePath
}

export const writeFile = (filePath: string, data: MessageClientOptions) => {
  try {
    Object.keys(data).forEach(key => {
      Object.keys(data[key]).forEach(subKey => {
        Object.keys(data[key][subKey]).forEach(subSubKey => {
          if (defaultMetaKeys.includes(subSubKey)) 
            delete data[key][subKey][subSubKey]
        })
        if (defaultMetaKeys.includes(subKey)) 
          delete data[key][subKey]
      })
    })
    
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error: any) {
    Logger.logDetailedError('file write failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const readFile = (path: string) => {
  try {
    const config = fs.readFileSync(path, 'utf-8')
    return JSON.parse(config)
  } catch (error: any) {
    Logger.logDetailedError('read file failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const compareConfiguration = (updated: any, current: any, commands: any) => {
  let count:number = 0;
  // check messaging settings
  let connectionChanged = false;
  let keys = Object.keys(updated.message);
  keys.forEach((key) => {
    if (!commands.length || commands.includes(key)) {
      Logger.logInfo(`checking settings for operation - ${chalk.greenBright(key)}`)
      let subKeys = Object.keys(updated.message[key]);
      subKeys.forEach((subKey) => {
        if (!defaultMetaKeys.includes(subKey)) {
          if (current.message[key].hasOwnProperty(subKey) && updated.message[key].hasOwnProperty(subKey) && 
              JSON.stringify(updated.message[key][subKey]) !== JSON.stringify(current.message[key][subKey])) {
            Logger.logInfo(`[${++count}] ${chalk.redBright(subKey)} of ${chalk.greenBright(key)} changed: ${current.message[key][subKey]} => ${updated.message[key][subKey]}`)
            if (!connectionChanged && key === commandConnection) connectionChanged = true;
          }
        }
      });
    }
  })

  if (connectionChanged)
    Logger.logWarn(`VPN Connection settings changed, this would impact all the messaging commands on the configuration`)

  // check management settings
  connectionChanged = false;
  keys = Object.keys(updated.manage);
  keys.forEach((key) => {
    if (!commands.length || commands.includes(key)) {
      Logger.logInfo(`checking settings for operation - ${chalk.greenBright(key)}`)
      let subKeys = Object.keys(updated.manage[key]);
      subKeys.forEach((subKey) => {
        if (!defaultMetaKeys.includes(subKey)) {
          if (current.manage[key].hasOwnProperty(subKey) && updated.manage[key].hasOwnProperty(subKey) && 
              JSON.stringify(updated.manage[key][subKey]) !== JSON.stringify(current.manage[key][subKey])) {
            Logger.logInfo(`[${++count}] ${chalk.redBright(subKey)} of ${chalk.greenBright(key)} changed: ${current.manage[key][subKey]} => ${updated.manage[key][subKey]}`)
            if (!connectionChanged && key === commandSempConnection) connectionChanged = true;
          }
        }
      });
    }
  })

  if (connectionChanged)
    Logger.logWarn(`VPN SEMP Connection settings changed, this would impact all the management commands on the configuration`)

  return count;
}

export const writeConfig = (data: any, newOrUpdate: string, name: string) => {
  try {
    const configFile = data.config;
    delete data.config;

    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${configFile}`)  
    if (!filePath.endsWith('.json')) filePath.concat('.json')
    writeFile(filePath, data)
    if (!fileExists(filePath)) Logger.logSuccess(`saved configuration to '${decoratePath(configFile)}' successfully`)
    else Logger.logSuccess(`${newOrUpdate === 'update' ? 'updated command settings' : 'created new command setting'} '${name}' on configuration file '${decoratePath(configFile)}' successfully`)
  } catch (error: any) {
    Logger.logDetailedError('file write failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const getLastVersionCheck = () : number|undefined => {
  try {
    const homedir = require('os').homedir();
    const filePath = `${homedir}/.stm/${defaultLastVersionCheck}`;
    if (!fileExists(filePath)) {
      fs.writeFileSync(filePath, `${Date.now() - 25 * 60 * 60 * 1000}`);
    }
    return parseNumber(fs.readFileSync(filePath).toString());
  } catch (error: any) {
    return undefined;
  }
}

export const updateLastVersionCheck = (ts:number|undefined = undefined) => {
  try {
    const homedir = require('os').homedir();
    const filePath = `${homedir}/.stm/${defaultLastVersionCheck}`;
    if (!fileExists(filePath) || ts) fs.writeFileSync(filePath, `${ts}`);
  } catch (error: any) {
  }
}

export const updateVisualizeConfig = (configFile: string, visualize:string) => {
  try {
    console.log('In updateVisualizeConfig')
    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${configFile}`)
    if (!filePath.endsWith('.json')) filePath.concat('.json')
    if (fileExists(filePath)) {
      const config:any = readFile(filePath)
      config.message.connection.visualization = visualize;
      writeFile(filePath, config)
    } else {
      Logger.error(`sorry, could not find the configuration file ${configFile}`);
      Logger.error('exiting...')
      process.exit(0);
    }
  } catch (error: any) {
    Logger.logDetailedError('visualize settings update failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const saveConfig = (data: any) => {
  try {
    const configFile = data.config;
    delete data.config;

    var updated = false;
    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${configFile}`)
      if (!filePath.endsWith('.json')) filePath.concat('.json')
    if (fileExists(filePath)) {
      const config:any = readFile(filePath)
      if (data.message.connection && compareConfiguration(data, config, []) > 0) {
        var prompt = require('prompt-sync')();
        var confirmation = prompt(`${chalk.whiteBright('Changes detected in the settings, do you want to overwrite (') + 
                                    chalk.greenBright('y') + chalk.whiteBright('/') + 
                                    chalk.redBright('n') + chalk.whiteBright('): ')}`);
        if (!['Y', 'YES'].includes(confirmation.toUpperCase())) {
          Logger.logWarn('abort updates to configuration...')
          Logger.logSuccess('exiting...')
          process.exit(0);
        }

        updated = true;
      }
    }
    writeFile(filePath, data)
    if (!fileExists(filePath)) Logger.logSuccess(`saved configuration to '${decoratePath(configFile)}' successfully`)
    else Logger.logSuccess(`${updated ? 'updated configuration' : 'initialized configuration with default command settings'} on '${decoratePath(configFile)}' successfully`)
  } catch (error: any) {
    Logger.logDetailedError('file write failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const loadConfig = (configFile: string) => {
  try {
    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${configFile}`)  
    if (fileExists(filePath)) {
      Logger.info(`loading configuration '${configFile}'`)
      const config = readFile(filePath)
      // TODO: validateConfig(config)
      return config;   
    } else {
      Logger.logDetailedError(`configuration not found`, `${decoratePath(configFile)}`)
      Logger.logError('exiting...')
      process.exit(1)
    }
  } catch (error: any) {
    Logger.logDetailedError('file read failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }  
}

export const createDefaultConfig = () => {

  // set the config to default config filename
  var options:any = {}
  options.config = defaultConfigFile

  var optionsSource:any = {};
  const defaultMessageKeys = Object.keys(defaultMessageConnectionConfig);
  for (var i=0; i<defaultMessageKeys.length; i++) {
    optionsSource[defaultMessageKeys[i]] = 'default'
  }

  const defaultManageKeys = Object.keys(defaultManageConnectionConfig);
  for (var i=0; i<defaultManageKeys.length; i++) {
    optionsSource[defaultManageKeys[i]] = 'default'
  }

  // save default configuration
  saveConfig(buildMessageConfig(null, options, optionsSource, []))
}

export const loadCommandFromConfig = (cmd: string, options: MessageClientOptions | ManageClientOptions) => {
  try {
    var group = getCommandGroup(cmd)
    if (!options.config) {
      Logger.aid(`Hoho! No default configuration found, creating one for you...`)
      createDefaultConfig()

      // load configuration
      Logger.info(`loading configuration '${defaultConfigFile}'`)
      return readFile(defaultConfigFile)
    }

    var commandName = options.name ? options.name : cmd
    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${options.config as string}`)  
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      Logger.info(`loading '${commandName}' command from configuration '${options.config}'`)
      if (!config[group][commandName]) {
        Logger.logError(`could not find '${commandName}' command`)
        // commandName = cmd
        Logger.logError('exiting...')
        process.exit(1)
      }
      if (config[group][commandName].command !== cmd) {
        Logger.logDetailedError(`expected '${commandName}' command, but found '${config[group][commandName].command}'`, `specify a valid command name`)
        Logger.logError('exiting...')
        process.exit(1)
      }
      // TODO: validateConfig(config)

      const configOptions:any = {}
      const connectionKeys = Object.keys(group === 'manage' ? defaultManageConnectionConfig : defaultMessageConnectionConfig);
      for (var i=0; i<connectionKeys.length; i++) {
        configOptions[connectionKeys[i]] = config[group][group === 'manage' ? 'sempconnection' : 'connection'][connectionKeys[i]];
      }
      const defaultConfig = getDefaultConfig(cmd);
      const clientKeys = Object.keys(defaultConfig);
      for (var i=0; i<clientKeys.length; i++) {
        configOptions[clientKeys[i]] = config[group][commandName][clientKeys[i]];
      }

      return configOptions
    } else {
      if (options.config === defaultConfigFile) {
        Logger.aid(`Hoho! No default configuration found, creating one for you...`)
        createDefaultConfig()
  
        // load configuration
        Logger.info(`loading configuration '${defaultConfigFile}'`)
        const homedir = require('os').homedir();
        const filePath = processPath(`${homedir}/.stm/${defaultConfigFile}`)
        if (!filePath.endsWith('.json')) filePath.concat('.json')
      
        const config = readFile(filePath)
        const configOptions:any = {}
        const connectionKeys = Object.keys(group === 'manage' ? defaultManageConnectionConfig : defaultMessageConnectionConfig);
        for (var i=0; i<connectionKeys.length; i++) {
          configOptions[connectionKeys[i]] = config[group][group === 'manage' ? 'sempconnection' : 'connection'][connectionKeys[i]];
        }
        const defaultConfig = getDefaultConfig(cmd);
        const clientKeys = Object.keys(defaultConfig);
        for (var i=0; i<clientKeys.length; i++) {
          configOptions[clientKeys[i]] = config[group][commandName][clientKeys[i]];
        }
        return configOptions
      }
  
      Logger.logDetailedError(`configuration not found`, `${decoratePath(filePath)}`)
      Logger.logError('exiting...')
      process.exit(1)
    }
  } catch (error: any) {
    Logger.logDetailedError('file read failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }  
}

export const saveOrUpdateCommandSettings = (options: MessageClientOptions | ManageClientOptions, optionsSource: any) => {
  function cleanseMetaFields(opts: MessageClientOptions | ManageClientOptions) {
    if (opts.message.connection) {
      delete opts.message.connection.config;
      delete opts.message.connection.name;
    }
    if (opts.manage.sempconnection) {
      delete opts.manage.sempconnection.config;
      delete opts.manage.sempconnection.name;
    }
  }

  try {
    var newConfigCreated = false;
    var group = getCommandGroup(options.command)
    if (!group) {
      Logger.logDetailedError(`unknown '${options.command}' command`, `specify a valid command name`)
      Logger.logError('exiting...')
      process.exit(1)
    }

    var commandName = options.name ? options.name : options.command
    if (!commandName) {
      Logger.logDetailedError(`unknown '${commandName}' command name`, `missing or invalid valid command name`)
      Logger.logError('exiting...')
      process.exit(1)
    }

    
    if (!options.config) options.config = defaultConfigFile
    const homedir = require('os').homedir();
    const filePath = processPath(`${homedir}/.stm/${options.config as string}`)  
    if (!fileExists(filePath)) {
      newConfigCreated = true;
      Logger.aid(`Hoho! No default configuration found, creating one for you...`)
      createDefaultConfig()
    }

    // load current configuration
    var current:any = loadConfig(options.config)

    // build configuration from the command line parameters
    var updated = buildMessageConfig(current, options, optionsSource, [ group === 'manage' ? 'sempconnection' : 'connection', options.command]);
    
    // absorb unchanged params from the current -> updated
    Object.keys(optionsSource).forEach(key => {
      if (optionsSource[key] !== 'cli' && optionsSource[key] !== 'implied')
        updated[group][commandName][key] = current[group][commandName] ? current[group][commandName][key] : current[group][options.command][key]
    })
    
    // clear meta fields
    cleanseMetaFields(updated)

    if (options.save && typeof options.save === 'string'  && typeof options.name === 'string' && options.save === options.name) {
      Logger.error(`the source and save to target command name cannot be same - '${options.save}'`)
      Logger.error('exiting...');
      process.exit(1)
    }

    if (options.save && typeof options.save === 'string') {
      if (baseCommands.includes(options.save)) {
        Logger.error(`cannot create a duplicate base command configuration '${options.save}' from the configuration '${options.config}'`)
        Logger.error('exiting...');
        process.exit(1)
      }
    }
    
    var newOrUpdate = (options.save && typeof options.save === 'string' && current[group][options.save] === undefined) ? 'new' : 'update'
    if (newOrUpdate === 'new') {
      if (group === 'message') {
        current.message.connection = updated.message.connection;
        current.message[options.save] = updated.message[commandName]
      } else if (group === 'manage') {
        current.manage.sempconnection = updated.manage.sempconnection;
        current.manage[options.save] = updated.manage[commandName]
      }
    } else {
      // if update to existing command settings, do a compare
      if (!newConfigCreated && current[group][commandName]) {
        if (current[group][commandName].command !== updated[group][commandName].command) {
          Logger.logDetailedError(`a command with the name '${commandName}' exists, expected '${updated[group][commandName].command}' command type, but found '${current[group][commandName].command}'`, `cannot update command settings`)
          Logger.logError('exiting...')
          process.exit(1)
        }

        if (typeof options.save === 'string' && current[group][options.save].command !== updated[group][commandName].command) {
          Logger.logDetailedError(`a command with the name '${options.save}' exists, expected '${updated[group][commandName].command}' command type, but found '${current[group][options.save].command}'`, `cannot update command settings!`)
          Logger.logError('exiting...')
          process.exit(1)
        }

        cleanseMetaFields(updated)
        // TODO: validateConfig(config)

        // fixup updated for target name
        if (options.save && typeof options.save === 'string' && commandName !== options.save) {
          updated[group][options.save] = updated[group][commandName]
          commandName = options.save
        }
      
        // compare and save
        var count = compareConfiguration(updated, current, [ group === 'manage' ? 'sempconnection' : 'connection', commandName ]);
        if (count > 0) {
          var prompt = require('prompt-sync')();
          var confirmation = prompt(`${chalk.whiteBright('Changes detected in the settings, do you want to overwrite (') + 
                                      chalk.greenBright('y') + chalk.whiteBright('/') + 
                                      chalk.redBright('n') + chalk.whiteBright('): ')}`);
          if (!['Y', 'YES'].includes(confirmation.toUpperCase())) {
            Logger.logWarn('abort updates to configuration...')
            Logger.logSuccess('exiting...')
            process.exit(0);
          }

        }
      }

      if (group === 'message') {
        current.message.connection = updated.message.connection;
        current.message[commandName] = updated.message[commandName]
      } else if (group === 'manage') {
        current.manage.sempconnection = updated.manage.sempconnection;
        current.manage[commandName] = updated.manage[commandName]
      }
    }
    current.config = options.config
    writeConfig(current, newOrUpdate, (typeof options.save === 'string' ? options.save : commandName))
  } catch (error: any) {
    Logger.logDetailedError('file read failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }  
}