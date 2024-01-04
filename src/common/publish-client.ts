import solace from "solclientjs";
import { Logger } from '../utils/logger'
import { LogLevel, MessageDeliveryModeType } from "solclientjs";
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_PUBLISHED } from "../utils/controlevents";
import { getDefaultClientName } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
import { randomUUID } from "crypto";
const { uuid } = require('uuidv4');

const logLevelMap:Map<string, LogLevel> = new Map<string, LogLevel>([
  ['FATAL', LogLevel.FATAL],
  ['ERROR', LogLevel.ERROR],
  ['WARN', LogLevel.WARN],
  ['INFO', LogLevel.INFO],
  ['DEBUG', LogLevel.DEBUG],
  ['TRACE', LogLevel.TRACE]
]);

const deliveryModeMap:Map<string, MessageDeliveryModeType> = new Map<string, MessageDeliveryModeType>([
  ['DIRECT', MessageDeliveryModeType.DIRECT],
  ['PERSISTENT', MessageDeliveryModeType.PERSISTENT],
  ['NON_PERSISTENT', MessageDeliveryModeType.NON_PERSISTENT],
]);

export class SolaceClient extends VisualizeClient {
  //Solace session object
  options:any = null;
  session:any = null;
  callback:any = null;
  active:boolean = false;
  receiver:any = {};
  replier:any = {};
  clientName:string = ""
  exited:boolean = false;

  constructor(options:any) {
    super();

    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
    this.clientName = this.options.clientName ? this.options.clientName : getDefaultClientName('pub')
  }

  setExited(exited: boolean) {
    this.exited = exited;
  }

  /**
   * Asynchronous function that connects to the Solace Broker and returns a promise.
   */
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.logWarn("already connected and ready to subscribe.");
        return;
      }
      // if there's no session, create one with the properties imported from the game-config file
      try {
        this.session = solace.SolclientFactory.createSession({
          url: this.options.url,
          vpnName: this.options.vpn,
          userName: this.options.username,
          password: this.options.password,
          clientName: this.clientName,
          applicationDescription: this.options.description,
          connectTimeoutInMsecs: this.options.connectionTimeout,
          connectRetries: this.options.connectionRetries,
          reconnectRetries: this.options.reconnectRetries,
          reconnectRetryWaitInMsecs: this.options.reconnectRetryWait,
          readTimeoutInMsecs: this.options.readTimeout,
          generateSendTimestamps: this.options.sendTimestamps,
          generateReceiveTimestamps: this.options.receiveTimestamps,
          includeSenderId: this.options.includeSenderId,
          generateSequenceNumber: this.options.generateSequenceNumber,
          keepAliveIntervalInMsecs: this.options.keepAlive,
          keepAliveIntervalsLimit: this.options.keepAliveIntervalLimit,
          reapplySubscriptions: this.options.reapplySubscriptions,
          sendBufferMaxSize: this.options.sendBufferMaxSize,

          publisherProperties: {
            enabled: this.options.guaranteedPublisher ? true : false,
            windowSize: this.options.guaranteedPublisher ? this.options.windowSize : undefined,
            acknowledgeTimeoutInMsecs: this.options.guaranteedPublisher? this.options.acknowledgeTimeout : undefined,
            acknowledgeMode: this.options.guaranteedPublisher && this.options.acknowledgeMode ? this.options.acknowledgeMode : undefined,
          }
        });

        // define session event listeners

        //The UP_NOTICE dictates whether the session has been established
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('=== successfully connected and ready to publish events. ===');
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_CONNECTED, { 
            type: 'sender', clientName: this.clientName, uuid: uuid()
          })    
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`connection failed to the message router ${sessionEvent.infoStr} -`, `check the connection parameters!`),
          reject();
        });
        
        //The RECONNECTING_NOTICE implies a reconnect action
        this.session.on(solace.SessionEventCode.RECONNECTING_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedWarn(`connection failed, attempting to reconnect to the message router ${sessionEvent.infoStr} -`, `reconnect attempt in progress!`)
        });

        //DISCONNECTED implies the client was disconnected
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('disconnected')
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });

        //ACKNOWLEDGED MESSAGE implies that the vpn has confirmed message receipt
        this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.logSuccess("delivery of message with correlation key = " + sessionEvent.correlationKey + " confirmed.");
          else
            Logger.logSuccess("delivery of message confirmed.");
        });

        //REJECTED_MESSAGE implies that the vpn has rejected the message
        this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.logWarn("delivery of message with correlation key = " + sessionEvent.correlationKey + " rejected, info: " + sessionEvent.infoStr);
          else
            Logger.logWarn("delivery of message rejected: " + sessionEvent.infoStr);
        });
      } catch (error: any) {
        Logger.logDetailedError('session creation failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }

      // connect the session
      try {
        Logger.await(`connecting to broker [${this.options.url}, vpn: ${this.options.vpn}, username: ${this.options.username}, password: ${this.options.password}]`)
        if (this.options.clientName) Logger.info(`client name: ${this.clientName}`)
        this.session.connect();
      } catch (error:any) {
        Logger.logDetailedError('failed to connect to broker - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    });
  }

  // Publish a message on a topic
  publish(topicName: string, payload: string | Buffer) {
    if (this.exited) return;
    
    if (!this.session) {
      Logger.logWarn("cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      if (!topicName.startsWith('@STM')) Logger.await('publishing...');
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
      message.setBinaryAttachment(JSON.stringify(payload));
      message.setCorrelationKey(this.options.correlationKey ? this.options.correlationKey : topicName);
      this.options.deliveryMode && message.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
      this.options.timeToLive && message.setTimeToLive(this.options.timeToLive);
      this.options.dmqEligible && message.setDMQEligible(true);
      this.options.messageId && message.setApplicationMessageId(this.options.messageId);
      if (this.options.visualization === 'on' && !this.options.messageId) message.setApplicationMessageId(randomUUID());
      this.options.messageType && message.setApplicationMessageType(this.options.messageType);
      this.options.replyToTopic && message.setReplyTo(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic))
      if (this.options.userProperties) {
        let propertyMap = new solace.SDTMapContainer();
        let props:Record<string, string | string[]> = this.options.userProperties;
        Object.entries(props).forEach((entry) => {
          propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
        });
        message.setUserPropertyMap(propertyMap);    
      } 
      
      Logger.logSuccess(`message published to topic ${topicName}`)
      Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.outputMode);
      this.session.send(message);
      this.publishVisualizationEvent(this.session, this.options, STM_EVENT_PUBLISHED, { 
        type: 'sender', deliveryMode: message.getDeliveryMode(), topicName, clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
      })    
    } catch (error:any) {
      Logger.logDetailedError('message publish failed - ', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }

  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    Logger.logSuccess('disconnecting from Solace PubSub+ Event Broker...');
    if (this.session !== null) {
      try {
        this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_DISCONNECTED, {
          type: 'sender', clientName: this.clientName, uuid: uuid() 
        })    
        this.session.disconnect();
      } catch (error:any) {
        Logger.logDetailedError('session disconnect failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    } else {
      Logger.logError('not connected to Solace PubSub+ Event Broker.');
    }
  };
  
  exit() {
    setTimeout(() => {
      this.disconnect();
    }, 1000); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 2000); // wait for 2 seconds to finish
  };
}
