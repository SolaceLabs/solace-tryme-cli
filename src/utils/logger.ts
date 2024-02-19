import chalk from 'chalk';
import { Signale } from 'signale'
import { prettyXML, prettyJSON } from '../utils/prettify'

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
      logLevel: 'waiting',
    },
  }
};

const Signal = new Signale(options)

const Logger = {
  ctrlDToPublish: () => Signal.success('Connected, press Ctrl+D to publish, and Ctrl+C to exit\nEnter the payload now...'),

  success: (message: string) => Signal.success(`${chalk.greenBright('success: ').concat(chalk.greenBright(message))}`),
  logSuccess: (message: string) => Signal.success(`${chalk.greenBright('success: ').concat(chalk.whiteBright(message))}`),
  logDetailedSuccess: (message: string, detail: string) => Signal.success(chalk.greenBright('success: ').concat(chalk.whiteBright(message)).concat(' - ').concat(chalk.greenBright(detail))),

  aid: (aid: string) => Signal.aid(chalk.magentaBright(aid)),

  hint: (hint: string) => Signal.fav(chalk.magentaBright('hint: ').concat(chalk.magentaBright(hint))),
  logHint: (hint: string) => Signal.fav(chalk.magentaBright('hint: ').concat(chalk.whiteBright(hint))),

  error: (error: string) => Signal.error(chalk.redBright(`${'error: ' + error}`)),
  logError: (error: string) => Signal.error(`${chalk.redBright('error: ').concat(chalk.whiteBright(error))}`),
  logDetailedError: (message: string, detail: string) => Signal.error(chalk.redBright('error: ').concat(chalk.whiteBright(message)).concat(' - ').concat(chalk.redBright(detail))),

  keyPair: (key: string, value: string) => Signal.info('info: ' + chalk.whiteBright(`${key}: `).concat(chalk.whiteBright(`${value}`))),
  logKeyPair: (key: string, value: string) => Signal.info('info: ' + chalk.whiteBright(`${key}: `).concat(chalk.whiteBright(`${value}`))),

  info: (message: string) => Signal.info(chalk.whiteBright('info: ').concat(chalk.whiteBright(message))),
  logInfo: (message: string) => Signal.info(chalk.whiteBright('info: ').concat(chalk.whiteBright(message))),

  warn: (message: string) => Signal.warn(chalk.yellowBright('warn: ').concat(chalk.whiteBright(message))),
  logWarn: (message: string) => Signal.warn(`${chalk.yellowBright('warn: ').concat(chalk.whiteBright(message))}`),
  logDetailedWarn: (message: string, detail: string) => Signal.warn(chalk.yellowBright('warn: ').concat(chalk.whiteBright(message)).concat(' - ').concat(chalk.yellowBright(detail))),

  logSettings: (message: string, detail: string) => Signal.success(chalk.whiteBright('Command settings for ')
                                                        .concat(chalk.greenBright(`'${message}'\n`)
                                                        .concat(chalk.whiteBright(detail)))),


  await: (message: string) => Signal.await(chalk.cyanBright(message)),

  printMessage: (properties:any, userProperties:any, payload:any, outputMode:string) => {
    if (properties) {
      var arr = properties.split('\n');
      var newProps = '';
      arr.forEach((element:any) => {
        if (element.startsWith('TimeToLive'))
          newProps += newProps ? '\n' + element.replace(/\((Sat|Sun|Mon|Tue|Thu|Fri).*Time\)\)/,'(ms)') : 
                      element.replace(/\((Sat|Sun|Mon|Tue|Thu|Fri).*Time\)\)/,'(ms)')
        else if (!element.startsWith('Class Of Service') && 
            !element.startsWith('Correlation Tag Pointer') &&
            !element.startsWith('Binary Attachment'))
          newProps += newProps ? '\n' + element : element;
      })
      properties = newProps;
    }
    
    if (outputMode?.toUpperCase() === 'COMPACT' || !outputMode) {
      payload && Logger.logInfo(`Message Payload:\r\n${payload.trim()}`);
    } else if (outputMode?.toUpperCase() === 'PRETTY') {
      Logger.logInfo(`Message Properties\r\n${properties}`)
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.logInfo(`Message User Properties${userProps}`)
      }

      var prettyPayload = prettyJSON(payload);
      if (prettyPayload)
        payload && Logger.logInfo(`Message Payload:\r\n${prettyPayload}`);
      else
        payload && Logger.logInfo(`Message Payload:\r\n${prettyXML(payload.trimStart(), 2)}`);
    } else {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Logger.logInfo(`Message Properties\r\n${properties}`)
        Logger.logInfo(`Message User Properties`)
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.logInfo(`Message User Properties${userProps}`)
      } else {
        Logger.logInfo(`Message Properties\r\n${properties}`);
      }
      payload && Logger.logInfo(`Message Payload:\r\n${payload.trim()}`);
    }
  },
  
  prettyPrintMessage: (properties:any, userProperties:any, payload:any, contentType:string, outputMode:string) => {
    if (properties) {
      var arr = properties.split('\n');
      var newProps = '';
      arr.forEach((element:any) => {
        if (element.startsWith('TimeToLive'))
          newProps += newProps ? '\n' + element.replace(/\((Sat|Sun|Mon|Tue|Thu|Fri).*Time\)\)/,'(ms)') : 
                      element.replace(/\((Sat|Sun|Mon|Tue|Thu|Fri).*Time\)\)/,'(ms)')
        else if (!element.startsWith('Class Of Service') && 
            !element.startsWith('Correlation Tag Pointer') &&
            !element.startsWith('Binary Attachment'))
          newProps += newProps ? '\n' + element : element;
      })
      properties = newProps;
    }
    
    if (outputMode?.toUpperCase() === 'PRETTY') {
      Logger.logInfo(`Message Properties\r\n${properties}`)
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.logInfo(`Message User Properties${userProps}`)
      }

      Logger.logInfo(`Message Payload (bytes): ${payload ? payload.length : 0}`);
      if (contentType === 'application/json') {
        var prettyPayload = prettyJSON(payload.trim());
        payload && Logger.logInfo(`Message Payload:\r\n${prettyPayload}`);
      } else if (contentType === 'application/xml') {
        var prettyPayload = prettyXML(payload.trim(), 2);
        payload && Logger.logInfo(`Message Payload:\r\n${prettyPayload}`);
      } else {
        payload && Logger.logInfo(`Message Payload:\r\n${payload}`);
      }
    } else if (outputMode?.toUpperCase() === 'COMPACT') {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Logger.logInfo(`Message Properties\r\n${properties}`)
        Logger.logInfo(`Message User Properties`)
        let keys = userProperties.getKeys();
        let userProps = '';
        keys.forEach((key: any) => {
          userProps += `\r\n${key}:\t\t\t\t\t${userProperties.getField(key).getValue()}`;
        });
        Logger.logInfo(`Message User Properties${userProps}`)
      } else {
        Logger.logInfo(`Message Properties\r\n${properties}`);
      }
      Logger.logInfo(`Message Payload (bytes): ${payload ? payload.length : 0}`);
    } else {
      Logger.logInfo(`Message Payload (bytes): ${payload ? payload.length : 0}`);
    }
  },
  
  dumpMessage: (message: any, contentType: string, outputMode: string) => {
    var payload = undefined;
    if (message.getType() === 0) { // binary
      payload = message.getBinaryAttachment();
    } else {
      payload = message.getSdtContainer().getValue();
    }

    Logger.prettyPrintMessage(message.dump(0), message.getUserPropertyMap(), payload, contentType, outputMode)
  },


}

export { Logger }