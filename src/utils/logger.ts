import chalk from 'chalk';
import { Signale } from 'signale'
import { parseClientOptions } from './config'
import { prettyXML, prettyJSON } from '../utils/prettify'

const option = {
  config: {
    displayLabel: false,
    displayDate: true,
    displayTimestamp: true,
  },
}

const Signal = new Signale(option)

const Logger = {
  ctrlDToPublish: () => Signal.success('Connected, press Ctrl+D to publish, and Ctrl+C to exit'),

  success: (message: string) => Signal.success(chalk.greenBright(message)),
  logSuccess: (message: string) => Signal.success(chalk.greenBright(message)),
  logDetailedSuccess: (message: string, detail: string) => Signal.error(chalk.whiteBright(message).concat(chalk.greenBright(detail))),

  error: (error: string) => Signal.error(chalk.redBright(error)),
  logError: (error: string) => Signal.error(chalk.redBright(error)),
  logDetailedError: (message: string, detail: string) => Signal.error(chalk.whiteBright(message).concat(' ').concat(chalk.redBright(detail))),

  warn: (message: string) => Signal.warn(chalk.yellowBright(message)),
  logWarn: (message: string) => Signal.warn(chalk.yellowBright(message)),
  logDetailedWarn: (message: string, detail: string) => Signal.warn(chalk.whiteBright(message).concat(' ').concat(chalk.yellowBright(detail))),

  info: (message: string) => Signal.info(chalk.whiteBright(message)),

  await: (message: string) => Signal.await(chalk.cyanBright(message)),

  printConfig: (type: CommandType, config: ClientOptions) => {
    var opts = parseClientOptions(config);
    opts.operation.clientName && opts.operation.clientName.startsWith('stm_') && delete opts.operation.clientName;
    var updatedConfig = {};
    if (!config) return Logger.error('Missing configuration...');
    if (type === 'publish' && config) {
      updatedConfig = { connection: opts.connection, publish: opts.operation }
      return Logger.success('Publish Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'receive' && config) {
      updatedConfig = { connection: opts.connection, receive: opts.operation }
      return Logger.success('Receive Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'request' && config) {
      updatedConfig = { connection: opts.connection, request: opts.operation }
      return Logger.success('Request Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'reply' && config) {
      updatedConfig = { connection: opts.connection, reply: opts.operation }
      return Logger.success('Reply Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'queue' && config) {
      updatedConfig = { connection: opts.sempconnection, queue: opts.sempoperation }
      return Logger.success('Queue Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'acl-profile' && config) {
      updatedConfig = { connection: opts.sempconnection, "acl-profile": opts.sempoperation }
      return Logger.success('ACL Profile Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'client-profile' && config) {
      updatedConfig = { connection: opts.sempconnection, "client-profile": opts.sempoperation }
      return Logger.success('Client Profile Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    if (type === 'client-username' && config) {
      updatedConfig = { connection: opts.sempconnection, "client-username": opts.sempoperation }
      return Logger.success('Client Username Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
    }
    updatedConfig = { connection: opts.connection, operation: opts.operation, sempconnection: opts.sempconnection, sempoperation: opts.sempoperation }
    return Logger.error('Unknown Configuration:\r\n'.concat(JSON.stringify(updatedConfig, null, 2)))
  },

  printMessage: (properties:any, userProperties:any, payload:any, pretty:boolean) => {
    if (pretty) {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Logger.info(`Message Properties\r\n${properties}`)
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.info(`Message User Properties${userProps}`)
      } else {
        Logger.info(`Message Properties\r\n${properties}`)
      }
      var prettyPayload = prettyJSON(payload);
      if (prettyPayload)
        Logger.info(`Message Payload:\r\n${prettyPayload}`);
      else
        Logger.info(`Message Payload:\r\n${prettyXML(payload.trimStart(), 2)}`);
    } else {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Logger.info(`Message Properties\r\n${properties}`)
        Logger.info(`Message User Properties`)
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.info(`Message User Properties${userProps}`)
      } else {
        Logger.info(`Message Properties\r\n${properties}`);
      }
      Logger.info(`Message Payload:\r\n${payload.trim()}`);
    }
  }
  
}

export { Logger }