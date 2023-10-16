import * as fs from 'fs'
import path from 'path'
import { signale, stmLog } from './logger'

const defaultPath = `${process.cwd()}/stm-cli-config.json`

const fileExists = (filePath: string) => fs.existsSync(filePath)

const writeFile = (filePath: string, data: Config) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    signale.error(error)
    process.exit(1)
  }
}

const readFile = (path: string) => {
  try {
    const config = fs.readFileSync(path, 'utf-8')
    return JSON.parse(config) as Config
  } catch (error) {
    signale.error(error)
    process.exit(1)
  }
}

const mergeConfig = (oldConfig: Config, newConfig: Config) => Object.assign({}, oldConfig, newConfig)

const processPath = (savePath: boolean | string) => {
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

const removeUselessOptions = (
  opts:ClientOptions    
) => {
  const { save, view, config, ...rest } = opts
  rest.clientName && rest.clientName.startsWith('stm_') && delete rest.clientName;
  return rest
}

const validateConfig = (commandType: CommandType, filePath: string, config: Config) => {
  const data = config[commandType]
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    signale.error(`No configuration for ${commandType} found in ${filePath}`)
    process.exit(1)
  }
}

const saveConfig = (
  commandType: CommandType,
  opts: ClientOptions
) => {
  try {
    const filePath = processPath(opts.save!)
    if (!filePath.endsWith('.json')) filePath.concat('.json');
    let data: Config = {}
    data[commandType] = removeUselessOptions(opts)
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      data = mergeConfig(config, data)
    }
    writeFile(filePath, data)
    signale.success(`Configurations saved to ${filePath}`)
  } catch (error) {
    signale.error(error)
    process.exit(1)
  }
}

function loadConfig(commandType: 'pub', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: 'recv', loadPath: boolean | string): ClientOptions
function loadConfig(commandType: CommandType, loadPath: boolean | string) {
  try {
    const filePath = processPath(loadPath)
    if (fileExists(filePath)) {
      const config = readFile(filePath)
      validateConfig(commandType, filePath, config)
      return config[commandType]
    } else {
      signale.error(`Configuration file ${filePath} not found`)
      process.exit(1)
    }
  } catch (error) {
    signale.error(error)
    process.exit(1)
  }
}

export { saveConfig, loadConfig }

export default saveConfig
