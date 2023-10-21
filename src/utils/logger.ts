import { Signale } from 'signale'
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

  printConfig: (type: CommandType, config: ClientOptions) => {
    if (!config) return Signal.error('Missing configuration');
    if (type === 'publisher' && config) return Signal.success('Publisher Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type === 'receiver' && config) return Signal.success('Receiver Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type === 'requestor' && config) return Signal.success('Replier Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type !== 'publisher' && type !== 'receiver' && type !== 'requestor' && config) return Signal.success('Unknown Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
  },

  printMessage: (properties:any, userProperties:any, payload:any, pretty:boolean) => {
    if (pretty) {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Signal.info(`Message Properties\r\n${properties}`)
        Signal.info(`Message User Properties`)
        let keys = userProperties.getKeys();
        keys.forEach((key: any) => {
          Signal.info(`\t${key}: ${userProperties.getField(key).getValue()}`);
        });
      } else {
        Signal.info(`Message Properties\r\n${properties}`)
      }
      var prettyPayload = prettyJSON(payload);
      if (prettyPayload)
        Signal.info(`Message Payload:\r\n${prettyPayload}`);
      else
        Signal.info(`Message Payload:\r\n${prettyXML(payload.trimStart(), 2)}`);
    } else {
      if  (userProperties) {
        properties = properties.replace(/User Property Map:.*entries\n/, '')
        Signal.info(`Message Properties\r\n${properties}`)
        Signal.info(`Message User Properties`)
        let keys = userProperties.getKeys();
        keys.forEach((key: any) => {
          Signal.info(`\t${key}: ${userProperties.getField(key).getValue()}`);
        });
      } else {
        Signal.info(`Message Properties\r\n${properties}`);
      }
      Signal.info(`Message Payload:\r\n${payload.trim()}`);
    }
  }
  
}

export { Signal,  Logger }