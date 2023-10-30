import solace from "solclientjs";
import { LogLevel, MessageDeliveryModeType } from "solclientjs";
import { Logger } from '../utils/logger'
import defaults from "../utils/defaults";

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
export class RequestClient {
  //Solace session object
  options:any = null;
  callback:any = null;
  requestor:any = {};
  session:any = null;

  constructor(options:any) {
    // record the options
    this.options = options;
    this.requestor.topicName = this.options.topic ? this.options.topic : defaults.requestTopic;;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
  }

  // Establishes connection to Solace PubSub+ Event Broker
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.warn("Already connected and ready to send requests.");
        return;
      }

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

        });

        // define session event listeners
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.success('=== Successfully connected and ready to send requests. ===');
          resolve();
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`error: connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`),
          reject();
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Logger.success('Disconnected.');
          this.requestor.subscribed = false;
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });
      } catch (error:any) {
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

  // sends one request
  request = () => {
    //Check if the session has been established
    if (!this.session) {
      Logger.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }
    
    var requestText = this.options.message ? this.options.message : defaults.requestMessage;
    var request = solace.SolclientFactory.createMessage();
    request.setDestination(solace.SolclientFactory.createTopicDestination(this.requestor.topicName));
    request.setBinaryAttachment(requestText);
    // request.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
    this.options.deliveryMode && request.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
    this.options.timeToLive && request.setTimeToLive(this.options.timeToLive);
    this.options.dmqEligible && request.setDMQEligible(true);
    this.options.messageId && request.setApplicationMessageId(this.options.messageId);
    this.options.messageType && request.setApplicationMessageType(this.options.messageType);
    this.options.replyToTopic && request.setReplyTo(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic))
    if (this.options.userProperties) {
      let propertyMap = new solace.SDTMapContainer();
      let props:Record<string, string | string[]> = this.options.userProperties;
      Object.entries(props).forEach((entry) => {
        propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
      });
      request.setUserPropertyMap(propertyMap);    
    } 

    Logger.await('Sending request "' + requestText + '" to topic "' + this.requestor.topicName + '"...');
    try {
      var prettify = this.options.pretty;
      this.session.sendRequest(
        request,
        5000, // 5 seconds timeout for this operation
        (session:any, message:any) => {
          Logger.logSuccess('Reply received');
          Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), prettify);
          this.exit();
        },
        (session:any, event:any) => {
          Logger.logDetailedError('error: send request failed - ', event.toString())
          this.exit();
        },
        null // not providing correlation object
      );
    } catch (error:any) {
      Logger.logDetailedError('error: send request failed - ', error.toString())
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

  exit = () => {
    setTimeout(() => {
      this.disconnect();
    }, 1000); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.success('Exiting...')
      process.exit(0);
    }, 2000); // wait for 2 seconds to finish
  };
}
