import { Signale } from 'signale'
import chalk from 'chalk'
import { inspect } from 'util'

const option = {
  config: {
    displayLabel: false,
    displayDate: true,
    displayTimestamp: true,
  },
}

const signale = new Signale(option)

const msgLog = (msg: Record<string, unknown>[]) => {
  let chalkString = ''
  msg.forEach((item) => {
    if (typeof item.value === 'object') {
      chalkString += `${chalk.green(item.label)}: ${inspect(item.value, false, null, true)}\n`
    } else {
      chalkString += `${chalk.green(item.label)}: ${item.value}\n`
    }
  })
  signale.log(`${chalkString}`)
}

const basicLog = {
  printConfig: (type: CommandType, config: ClientOptions) => {
    if (!config) return signale.error('Missing configuration');
    if (type === 'pub' && config) return signale.success('Publisher Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type === 'sub' && config) return signale.success('Subscriber Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type !== 'sub' && type !== 'pub' && config) return signale.success('Unknown Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
  },
  connecting: (url: string, vpn: string, username?: string, clientName?: string) => {
    signale.await(`Connecting to broker [${url}, broker: ${vpn}, username: ${username}${clientName ? `, client-name: ${clientName}` : ''}]`)
  },
  connected: () => signale.success('Connected'),
  disconnecting: () => signale.await('Disconnecting...'),
  disconnected: () => signale.success('Disconnected'),

  waitingForEvents: () => signale.await(`Waiting for events...`),
  subscribing: (t: string) => signale.await(`Subscribing to topic ${t}...`),
  subscribed: (t: string) => signale.success(`Subscribed to topic ${t}`),
  unsubscribed: (t: string)  => signale.error(`Unsubscribed topic ${t}`),
  publishing: () => signale.await('Message publishing...'),
  published: () => signale.success('Message published'),
  messageProperties: (content: any) => signale.success(`Message Properties\r\n${content}`),
  messageReceived: (destination: any) => signale.success(`Message Received - ${destination}`),
  messagePayload: (content: any) => signale.success(`Message Payload:\r\n${content}`),
  messagePrettyDump: (props: any, payload: any) => signale.success(`Message Received\r\n${payload}`),
  messagePubDump: (props: any, payload: any) => signale.await(`Publishing message\r\n${props}\r\nMessage Payload:\r\n${payload}`),
  messageRecvDump: (props: any, payload: any) => signale.success(`Message Received\r\n${props}\r\nMessage Payload:\r\n${payload}`),
  ctrlDToPublish: () => signale.success('Connected, press Ctrl+D to publish, and Ctrl+C to exit'),
  error: (err: Error) => signale.error(err),
  close: () => signale.error('Connection closed'),
  reconnecting: () => signale.await('Reconnecting...'),
  reconnectTimesLimit: () => signale.error('Exceed the maximum reconnect times limit, stop retry'),
}

export { Signale, signale, msgLog, basicLog }

export default signale
