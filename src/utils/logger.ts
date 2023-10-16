import { Signale } from 'signale'
import { inspect } from 'util'
import chalk from 'chalk'

const option = {
  config: {
    displayLabel: false,
    displayDate: true,
    displayTimestamp: true,
  },
}

const signale = new Signale(option)

const stmLog = {
  printConfig: (type: CommandType, config: ClientOptions) => {
    if (!config) return signale.error('Missing configuration');
    if (type === 'pub' && config) return signale.success('Publisher Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type === 'recv' && config) return signale.success('Subscriber Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
    if (type !== 'recv' && type !== 'pub' && config) return signale.success('Unknown Configuration:\r\n'.concat(JSON.stringify(config, null, 2)))
  },
  connecting: (url: string, vpn: string, username?: string, clientName?: string) => {
    signale.await(`Connecting to broker [${url}, broker: ${vpn}, username: ${username}${clientName ? `, client-name: ${clientName}` : ''}]`)
  },
  connected: () => signale.success('Connected'),
  disconnecting: () => signale.await('Disconnecting...'),
  disconnected: () => signale.success('Disconnected'),

  startingConsumer: (q: string) => signale.success(`Starting subscriber for queue ${q}`),

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
  fail: (err: string) => signale.error(err),
  error: (err: Error) => signale.error(err),
  close: () => signale.error('Connection closed'),
  reconnecting: () => signale.await('Reconnecting...'),
  reconnectTimesLimit: () => signale.error('Exceed the maximum reconnect times limit, stop retry'),
}

export { Signale, signale, stmLog }

export default signale
