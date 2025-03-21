import * as fs from 'fs'
import chalk from 'chalk';
import { Signale } from 'signale'
import { prettyXML, prettyJSON, padString } from '../utils/prettify'

const options = {
  types: {
    remind: {
      badge: '**',
      color: 'blueBright',
      label: 'reminder',
      logLevel: 'info'
    },
    aid: {
      badge: '🎅',
      color: 'cyanBright',
      label: 'santa',
      logLevel: 'info'
    },
    info: {
      badge: 'ℹ',
      color: 'whiteBright',
      label: 'info',
      logLevel: 'info',
    },
    await: {
      badge: '…',
      color: 'cyanBright',
      label: 'waiting',
      logLevel: 'info',
    },
    alert: {
      badge: '📢',
      color: 'whiteBright',
      label: 'alert',
      logLevel: 'info',
    },
    message: {
      badge: '✉️',
      color: 'orange',
      label: 'message',
      logLevel: 'info'
    }
  }
};

const Signal = new Signale(options)

const displayMessageProperties = [
  'Destination'
];

const Logger = {
  ctrlDToPublish: () => Signal.success('Connected, press Ctrl+D to publish, and Ctrl+C to exit\nEnter the payload now...'),

  success: (message: string) => Signal.success(`${chalk.greenBright('success: ').concat(chalk.greenBright(message))}`),
  logSuccess: (message: string) => Signal.success(`${chalk.greenBright('success: ').concat(chalk.whiteBright(message))}`),
  logDetailedSuccess: (message: string, detail: string, hyphenate: boolean = true) => Signal.success(chalk.greenBright('success: ').concat(chalk.whiteBright(message)).concat(hyphenate ? ' - ' : '').concat(chalk.greenBright(detail))),

  aid: (aid: string) => Signal.aid(chalk.magentaBright(aid)),

  hint: (hint: string) => Signal.fav(chalk.magentaBright('hint: ').concat(chalk.magentaBright(hint))),
  logHint: (hint: string) => Signal.fav(chalk.magentaBright('hint: ').concat(chalk.whiteBright(hint))),

  error: (error: string) => Signal.error(chalk.redBright(`${'error: ' + error}`)),
  logError: (error: string) => Signal.error(`${chalk.redBright('error: ').concat(chalk.whiteBright(error))}`),
  logDetailedError: (message: string, detail: string) => Signal.error(chalk.redBright('error: ').concat(chalk.whiteBright(message)).concat(' - ').concat(chalk.redBright(detail))),

  keyPair: (key: string, value: string) => Signal.info('info: ' + chalk.whiteBright(`${key}: `).concat(chalk.whiteBright(`${value}`))),
  logKeyPair: (key: string, value: string) => Signal.info('info: ' + chalk.whiteBright(`${key}: `).concat(chalk.whiteBright(`${value}`))),

  // info: (message: string) => Signal.info(chalk.whiteBright('info: ').concat(chalk.whiteBright(message))),
  info: (message: string) => Signal.info(chalk.yellowBright('info: ').concat(chalk.whiteBright(message))),
  logInfo: (message: string) => Signal.info(chalk.whiteBright('info: ').concat(chalk.whiteBright(message))),

  message: (message: string) => Signal.info(chalk.keyword('orange')('message: ').concat(chalk.whiteBright(message))),
  logMessage: (message: string) => Signal.info(chalk.keyword('orange')('message: ').concat(chalk.whiteBright(message))),

  warn: (message: string) => Signal.warn(chalk.yellowBright('warn: ').concat(chalk.whiteBright(message))),
  logWarn: (message: string) => Signal.warn(`${chalk.yellowBright('warn: ').concat(chalk.whiteBright(message))}`),
  logDetailedWarn: (message: string, detail: string) => Signal.warn(chalk.yellowBright('warn: ').concat(chalk.whiteBright(message)).concat(' - ').concat(chalk.yellowBright(detail))),

  logSettings: (message: string, detail: string) => Signal.success(chalk.whiteBright('Command settings for ')
                                                        .concat(chalk.greenBright(`'${message}'\n`)
                                                        .concat(chalk.whiteBright(detail)))),


  await: (message: string) => Signal.await(chalk.cyanBright(message)),
  alert: (message: string) => Signal.alert(chalk.bgMagenta(message)),
  dumpMap: (map: any) => {
    var keys = map.getKeys();
    var str = '';
    keys.forEach((key: any, idx: number) => {
      str += `${key.padEnd(24, ' ')} ${map.getField(key).getValue()}`;
      if (idx < keys.length-1) str += `\r\n`;
    });
    return str;
  },

  printStream: (stream: any, out: any) => {
    stream.getFields().forEach((field: any) => {
      if (field.getType() === 15)
        out += `${field.getName()}=${Logger.printStream(field.getValue(), '')}\r\n`;
      else
        out += `${field.getName()}=${field.getValue()}\r\n`;
    });
  },

  isBinaryFile: (filePath: string): boolean => {
    const fileBuffer = fs.readFileSync(filePath);
    return Logger.isBinaryPayload(fileBuffer);
  },

  isBinaryPayload(payload: any): boolean {
    for (let i = 0; i < 24; i++) {
      if (payload[i] === 0) {
        return true;
      }
    }
    return false;
  },
  
  prettyPrintMessage: (message: any, payload:any, messageType: number, outputMode:string, pretty: boolean) => {
    var properties = message.dump(0);
    if (messageType === 1) { // MAP MESSAGE
      var map = message.getSdtContainer();
      var keys = map.getKeys();
      properties = '';
      keys.forEach((key: any, idx: number) => {
        var field = map.getField(key);
        if (field.getType() === 15)
          properties += `${key.padEnd(24, ' ')} ${Logger.printStream(field.getValue(), '')}`;
        else
        properties += `${key.padEnd(24, ' ')} ${map.getField(key).getValue()}`;
        if (idx < keys.length-1) properties += `\r\n`;
      });
    }

    var userProperties = message.getUserPropertyMap();

    if (outputMode?.toUpperCase() === 'FULL') {
      properties = properties.replace(/User Property Map:.*entries\n/, '')
      let userProps = '';
      if  (userProperties) {
        let keys = userProperties.getKeys();
        keys.forEach((key: any, idx: number) => {
          userProps += padString(4, `${key}:`, 40) + userProperties.getField(key).getValue();          
          if (idx < keys.length-1) userProps += `\r\n`;
        });
      }
      if (userProps) 
        Logger.logMessage(`Properties\r\n${properties}\r\n${chalk.italic('User Properties:')}\r\n${userProps}`);
      else 
        Logger.logMessage(`Properties\r\n${properties}`)

      if (payload) {
        if (messageType === 0) {
          var bPayload = payload.toString('utf8').trim();
          var binaryData = Logger.isBinaryPayload(payload);
          if (binaryData) {
            var hexdump = require('hexdump-nodejs');
            Logger.logMessage(`Payload\r\n${hexdump(payload)}`);
          } else if (bPayload.startsWith('<?xml')) {
            var prettyPayload = prettyXML(bPayload, 2);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          } else {
            var prettyPayload = prettyJSON(bPayload);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          }
        } else if (messageType === 3) {
          if (payload.startsWith('<?xml')) {
            var prettyPayload = prettyXML(payload.trim(), 2);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          } else {
            var prettyPayload = prettyJSON(payload.trim());
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          }
        } else if (messageType === 1) {
          Logger.logMessage(`Payload\r\n${Logger.dumpMap(payload)}`);
        } else {
          Logger.logMessage(`Payload [Unsupported type: ${messageType}] \r\n${payload}`);
        }
      } else {
        Logger.logMessage(`Payload\r\n${chalk.italic('Empty')}`);
      }
    } else if (outputMode?.toUpperCase() === 'PROPS') {
      properties = properties.replace(/User Property Map:.*entries\n/, '')
      let userProps = '';
      let keys = userProperties.getKeys();
      keys.forEach((key: any, idx: number) => {
        userProps += padString(4, `${key}:`, 40) + userProperties.getField(key).getValue();          
        if (idx < keys.length-1) userProps += `\r\n`;
      });
      if (userProps) 
        Logger.logMessage(`Properties\r\n${properties}\r\n${chalk.italic('User Properties:')}\r\n${userProps}`);
      else 
        Logger.logMessage(`Properties\r\n${properties}`)
      Logger.logMessage(`Payload (bytes): ${payload ? payload.length : 0}`);
    } else {
      Logger.logMessage(`Destination: ${message.getDestination()}`);
      if (payload) {
        if (messageType === 0) {
          var bPayload = payload.toString('utf8').trim();
          var binaryData = Logger.isBinaryPayload(payload);
          if (binaryData) {
            var hexdump = require('hexdump-nodejs');
            Logger.logMessage(`Payload\r\n${hexdump(payload)}`);
          } else if (bPayload.startsWith('<?xml')) {
            var prettyPayload = prettyXML(bPayload, 2);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          } else {
            var prettyPayload = prettyJSON(bPayload);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          }
        } else if (messageType === 3) {
          if (payload.startsWith('<?xml')) {
            var prettyPayload = prettyXML(payload.trim(), 2);
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          } else {
            var prettyPayload = prettyJSON(payload.trim());
            Logger.logMessage(`Payload\r\n${prettyPayload}`);
          }
        } else if (messageType === 1) {
          Logger.logMessage(`Payload\r\n${Logger.dumpMap(payload)}`);
        } else {
          Logger.logMessage(`Payload [Unsupported type: ${messageType}] \r\n${payload}`);
        }
      } else {
        Logger.logMessage(`Payload\r\n${chalk.italic('Empty')}`);
      }

    }
  },

  dumpMessage: (message: any, outputMode: string, pretty: boolean) => {
    var payload = undefined;
    var messageType = message.getType();
    if (messageType === 0) { // binary
      payload = message.getBinaryAttachment();
      if (!payload)
        payload = message.getXmlContent();
    } else if (messageType === 1) { // map
      payload = message.getSdtContainer().getValue();
    } else if (messageType === 2) { // stream
      // console.log('Got a stream message');
    } else {  // text
      payload = message.getSdtContainer().getValue();
    }

    Logger.prettyPrintMessage(message, payload, messageType, outputMode, pretty)
  },


}

export { Logger }
