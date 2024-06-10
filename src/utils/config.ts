import * as fs from 'fs'
import http from 'http'
import path from 'path'
import { Logger } from './logger'
import chalk from 'chalk'
import { baseCommands, commandConnection, commandSempConnection, defaultConfigFile, defaultLastVersionCheck, defaultManageConnectionConfig, defaultFakerRulesFile, defaultFeedAnalysisFile, defaultFeedInfoFile, defaultFeedRulesFile, defaultFeedSchemasFile, defaultGitRepo, defaultMessageConnectionConfig, defaultMetaKeys, getCommandGroup, getDefaultConfig, defaultStmHome, defaultStmFeedsHome } from './defaults'
import { buildMessageConfig } from './init'
import { parseNumber } from './parse'
import { fakerRulesJson } from './fakerrules';
import { da } from '@faker-js/faker'
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

export const processPlainPath = (savePath: boolean | string) => {
  let filePath = ''
  if (savePath === true) {
    filePath = defaultPath
  } else if (typeof savePath === 'string') {
    filePath = path.normalize(savePath)
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(filePath)
    }
  }
  return filePath
}

export const writeJsonFile = (filePath: string, data: object, jsonify: boolean = true) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    if (jsonify)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    else
      fs.writeFileSync(filePath, data.toString());
  } catch (error: any) {
    Logger.logDetailedError('file write failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
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

    const filePath = processPath(`${defaultStmHome}/${configFile}`)
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
    const filePath = `${defaultStmHome}/${defaultLastVersionCheck}`;
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
    const filePath = `${defaultStmHome}/${defaultLastVersionCheck}`;
    if (!fileExists(filePath) || ts) fs.writeFileSync(filePath, `${ts}`);
  } catch (error: any) {
  }
}

export const updateVisualizeConfig = (configFile: string, visualize:string) => {
  try {
    console.log('In updateVisualizeConfig')
    const filePath = processPath(`${defaultStmHome}/${configFile}`)
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
    const filePath = processPath(`${defaultStmHome}/${configFile}`)
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
    const filePath = processPath(`${defaultStmHome}/${configFile}`)
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

export const loadCommandFromConfig = (cmd: string, options: MessageClientOptions | ManageClientOptions | ManageFeedPublishOptions) => {
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
    const filePath = processPath(`${defaultStmHome}/${options.config as string}`)
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
        const filePath = processPath(`${defaultStmHome}/${defaultConfigFile}`)
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
    const filePath = processPath(`${defaultStmHome}/${options.config as string}`)
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

export const readAsyncAPIFile = (configFile: string, jsonify: boolean = true) => {
  try {
    const filePath = processPath(`${configFile}`)
    if (fileExists(filePath)) {
      Logger.info(`loading file '${configFile}'`)
      return readFile(filePath);
    } else {
      Logger.logDetailedError(`file not found`, `${decoratePath(configFile)}`)
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

export const createFeed = (fileName: string, feedName: string, apiJson: object, rulesJson: object, schemaJson: object) => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  try {
    if (fileExists(feedPath)) {
      Logger.warn(`Feed '${feedName}' already exists, `)
      var prompt = require('prompt-sync')();
      var confirmation = prompt(`${chalk.whiteBright('Feed already exists, do you want to overwrite (') + 
                                  chalk.greenBright('y') + chalk.whiteBright('/') + 
                                  chalk.redBright('n') + chalk.whiteBright('): ')}`);
      if (!['Y', 'YES'].includes(confirmation.toUpperCase())) {
        Logger.logWarn('abort create feed...')
        Logger.logError('exiting...')
        process.exit(0);
      } else {
        fs.rmSync(feedPath, { recursive: true, force: true });
      }
    }

    fs.mkdirSync(feedPath, { recursive: true })
    fs.copyFileSync(fileName, `${feedPath}/${path.parse(fileName).base}`);
    writeJsonFile(`${feedPath}/${defaultFeedAnalysisFile}`, apiJson)
    writeJsonFile(`${feedPath}/${defaultFeedRulesFile}`, rulesJson)
    writeJsonFile(`${feedPath}/${defaultFeedSchemasFile}`, schemaJson)
    writeJsonFile(`${feedPath}/${defaultFakerRulesFile}`, fakerRulesJson)
  } catch (error: any) {
    Logger.logDetailedError('create feed failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const validateFeed = (feedName: string) => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  try {
    if (!fileExists(feedPath))
      return `error: feed ${feedName} not found!`;

    if (!fileExists(`${feedPath}/${defaultFeedAnalysisFile}`))
      return `error: invalid or missing feed analysis, try regenerating feed!`;

    if (!fileExists(`${feedPath}/${defaultFeedRulesFile}`))
      return `error: invalid or missing feed ruleset, try regenerating feed!`;

    return false;
  } catch (error: any) {
    Logger.logDetailedError('load feed analysis failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const loadFeedInfo = (feed: any) => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feed.name}`);
  try {
    writeJsonFile(`${feedPath}/${defaultFeedInfoFile}`, feed, true);

    var info = readFile(`${feedPath}/${defaultFeedInfoFile}`);
    return info;
  } catch (error: any) {
    Logger.logDetailedError('load feed info failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const loadLocalFeedFile = (feedName: string, fileName: string) => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  try {
    if (!fileExists(feedPath)) {
      Logger.logError(`feed ${feedName} not found!`)
      Logger.logError('exiting...')
      process.exit(1);
    }

    var analysis = readFile(`${feedPath}/${fileName}`);
    return analysis;
  } catch (error: any) {
    Logger.logDetailedError(`failed to fetch ${fileName}, check whether the feed exists!`, error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}

export const getAllFeeds = () => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}`);
  const directories:any = fs.readdirSync(feedPath);
  const feeds: any[] = [];
  directories.forEach((feedName: string) => {
    feeds.push({
      name: feedName,
      invalid: validateFeed(feedName),
      config: loadLocalFeedFile(feedName, defaultFeedAnalysisFile)
    })
  })

  return feeds;
}

export const getFeed = (feedName: string) => {
  const feedPath = processPlainPath(`${defaultStmFeedsHome}/${feedName}`);
  const configPath = processPlainPath(`${defaultStmHome}`);
  const files:any = fs.readdirSync(`${configPath}`);
  const brokers: any[] = [];
  files.forEach((fileName: string) => {
    var filePath = `${configPath}/${fileName}`
    var stat = fs.lstatSync(filePath);
    if (!stat.isDirectory() && fileName.endsWith('.json')) {
      var broker = readFile(`${configPath}/${fileName}`);
      if (broker?.message?.connection)
        brokers.push({broker: fileName, config: broker?.message?.connection});
    }
  })

  const analysis:any = readFile(`${feedPath}/${defaultFeedAnalysisFile}`);

  const feed: any = {
    name: feedName,
    fileName: analysis.fileName,
    config: loadLocalFeedFile(feedName, defaultFeedAnalysisFile),
    rules: loadLocalFeedFile(feedName, defaultFeedRulesFile),
    schemas: loadLocalFeedFile(feedName, defaultFeedSchemasFile),
    brokers: brokers
  };

  return feed;
}

export const updateRules = async (feedName: string, rulesJson: any) => {
  const feedPath = `${defaultStmFeedsHome}/${feedName}`;
  const rulesFile = processPath(`${defaultStmFeedsHome}/${feedName}/${defaultFeedRulesFile}`);
  try {
    if (!fileExists(feedPath)) {
      Logger.logWarn(`feed ${feedName} not found!`)
      return false;
    }

    writeFile(`${rulesFile}`, rulesJson)

    var info = loadLocalFeedFile(feedName, defaultFeedInfoFile);
    info.lastUpdated = new Date().toISOString();
    writeJsonFile(`${feedPath}/${defaultFeedInfoFile}`, info, true);
    return true;
  } catch (error: any) {
    Logger.logDetailedError('update feed rules failed', error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    return false;
  }
}

export const urlExists = async (url:any) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof url}`)
	}

	const valid_url = validURL(url)
	if (!valid_url) return false

	const { host, pathname } = valid_url
	const opt = { method: 'HEAD', host, path: pathname }

	return new Promise((resolve) => {
		const req = http.request(opt, (r) =>
			resolve(/4\d\d/.test(`${r.statusCode}`) === false),
		)

		req.on('error', (error:any) => {
      if (error.code === 'ENOTFOUND') {
        Logger.error('Are you connected to internet, please check and try again!')
        Logger.error('exiting...');
        process.exit(1);
      }

      resolve(false)
    })

		req.end()
	})
}

export const validURL = (url:any) => {
	try {
		return new URL(url.trim()) // eslint-disable-line no-new
	} catch (_e) {
		return null
	}
}

export const loadGitFeedFile = async (feedName: string, fileName: string) => {
  try {
    var feedUrl = `${defaultGitRepo}/${feedName}`;
    var validFeedUrl = await urlExists(encodeURI(`${feedUrl}/${fileName}`));
    if (!validFeedUrl) {
      Logger.logDetailedError('invalid or non-existing feed URL', feedUrl)
      Logger.logError('exiting...')
      process.exit(1)
    }

    return await fetch(`${feedUrl}/${fileName}`)
      .then(async (response) => {
        const data = await response.json();
        return data;
      })
      .catch((error:any) => {
        Logger.logError('invalid feed, check whether the feed exists!');
        Logger.logError('exiting...')
        process.exit(1)
      })
  } catch (error:any) {
    Logger.logDetailedError(`failed to fetch ${fileName}, check whether the feed exists!`, error.toString())
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.logError('exiting...')
    process.exit(1)
  }
}