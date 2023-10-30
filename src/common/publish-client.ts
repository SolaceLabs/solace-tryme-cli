import solace from "solclientjs";
import { Logger } from '../utils/logger'
import { LogLevel, MessageDeliveryModeType } from "solclientjs";

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

export class SolaceClient {
  //Solace session object
  options:any = null;
  session:any = null;
  callback:any = null;
  active:boolean = false;
  receiver:any = {};
  replier:any = {};

  constructor(options:any) {
    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
  }

  /**
   * Asynchronous function that connects to the Solace Broker and returns a promise.
   */
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.warn("Already connected and ready to subscribe.");
        return;
      }
      // if there's no session, create one with the properties imported from the game-config file
      try {
        this.session = solace.SolclientFactory.createSession({
          url: this.options.url,
          vpnName: this.options.vpn,
          userName: this.options.username,
          password: this.options.password,
          clientName: this.options.clientName,
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
          Logger.success('=== Successfully connected and ready to publish events. ===');
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`error: connection failed to the message router ${sessionEvent.infoStr} -`, `check the connection parameters!`),
          reject();
        });

        //DISCONNECTED implies the client was disconnected
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Logger.success('Disconnected')
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });

        //ACKNOWLEDGED MESSAGE implies that the vpn has confirmed message receipt
        this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.success("Delivery of message with correlation key = " + sessionEvent.correlationKey + " confirmed.");
          else
            Logger.success("Delivery of message confirmed.");
        });

        //REJECTED_MESSAGE implies that the vpn has rejected the message
        this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.warn("Delivery of message with correlation key = " + sessionEvent.correlationKey + " rejected, info: " + sessionEvent.infoStr);
          else
            Logger.warn("Delivery of message rejected: " + sessionEvent.infoStr);
        });
      } catch (error: any) {
        Logger.logDetailedError('error: session creation failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
      }

      // connect the session
      try {
        Logger.await(`Connecting to broker [${this.options.url}, vpn: ${this.options.vpn}, username: ${this.options.username}${this.options.clientName ? `, client-name: ${this.options.clientName}` : ''}]`)
        this.session.connect();
      } catch (error:any) {
        Logger.logDetailedError('error: failed to connect to broker - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
      }
    });
  }

  // Publish a message on a topic
  publish(topicName: string, payload: string | Buffer) {
    if (!this.session) {
      Logger.warn("Cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      Logger.await('Publishing...');
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
      message.setBinaryAttachment(payload);
      message.setCorrelationKey(this.options.correlationKey ? this.options.correlationKey : topicName);
      this.options.deliveryMode && message.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
      this.options.timeToLive && message.setTimeToLive(this.options.timeToLive);
      this.options.dmqEligible && message.setDMQEligible(true);
      this.options.messageId && message.setApplicationMessageId(this.options.messageId);
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
      
      Logger.logSuccess('Message published')
      Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.pretty);
      this.session.send(message);
    } catch (error:any) {
      Logger.logDetailedError('error: message publish failed - ', error.toString())
      if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    }
  }

  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    Logger.success('Disconnecting from Solace PubSub+ Event Broker...');
    if (this.session !== null) {
      try {
        this.session.disconnect();
      } catch (error:any) {
        Logger.logDetailedError('error: session disconnect failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
      }
    } else {
      Logger.error('error: not connected to Solace PubSub+ Event Broker.');
    }
  };
  
  exit() {
    setTimeout(() => {
      this.disconnect();
    }, 1000); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.success('Exiting...')
      process.exit(0);
    }, 2000); // wait for 2 seconds to finish
  };
}