import solace, { LogLevel, MessageDeliveryModeType } from "solclientjs";
import { Logger } from '../utils/logger'
import { getDefaultClientName } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_REPLIED, STM_EVENT_REQUEST_RECEIVED } from "../utils/controlevents";
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
  replier:any = {};
  session:any = null;
  clientName:string = "";
  payload:any = null;

  constructor(options:any) {
    super();

    // record the options
    this.options = options;
    this.replier.subscribed = [];

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
    this.clientName = this.options.clientName ? this.options.clientName : getDefaultClientName('rep')
  }

  // Establishes connection to Solace PubSub+ Event Broker
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.logWarn('already connected and ready to receive requests.');
        return;
      }

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
        });

        // define session event listeners
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('=== ' + this.clientName + ' successfully connected and ready to subscribe to request topic. ===');
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_CONNECTED, { 
            type: 'replier', clientName: this.clientName, uuid: uuid()
          })    
          resolve();
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`),
          reject();
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('disconnected.');
          this.replier.subscribed = false;
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`cannot subscribe to topic ${sessionEvent.correlationKey} - `, sessionEvent.infoStr)
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) => {
          if (this.replier.subscribed.includes(sessionEvent.correlationKey)) {
            this.replier.subscribed.splice(this.replier.subscribed.indexOf(sessionEvent.correlationKey), 1)
            Logger.logSuccess('successfully unsubscribed from request topic: ' + sessionEvent.correlationKey);
          } else {
            this.replier.subscribed.push(sessionEvent.correlationKey)
            Logger.logSuccess('successfully subscribed to request topic: ' + sessionEvent.correlationKey);
            Logger.await('=== ready to receive requests. ===');
          }
        });
        // define message event listener
        this.session.on(solace.SessionEventCode.MESSAGE, (message: any) => {
          try {
            var request:any = message as string;
            this.publishVisualizationEvent(this.session, this.options, STM_EVENT_REQUEST_RECEIVED, { 
              type: 'replier', topicName: request.getDestination().getName(), clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId() 
            })    

            this.reply(request, this.payload);
          } catch (error:any) {
            Logger.logDetailedError('send reply failed - ', error.toString())
            if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
          }
        });
      } catch (error:any) {
        Logger.logDetailedError('session creation failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }

      // connect the session
      try {
        Logger.await(`connecting to broker [${this.options.url}, vpn: ${this.options.vpn}, username: ${this.options.username}, password: ******]`)
        if (this.options.clientName) Logger.info(`client name: ${this.options.clientName}`)
        this.session.connect();
      } catch (error:any) {
        Logger.logDetailedError('failed to connect to broker - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    });
  }

  // Subscribes to request topic on Solace PubSub+ Event Broker
  subscribe = (topicNames: any, payload: any) => {
    //Check if the session has been established
    if (!this.session) {
      Logger.logWarn("cannot subscribe because not connected to Solace message router!");
      return;
    }

    try {
      this.payload = payload;
      topicNames.forEach((topicName:any) => {
        Logger.logInfo(`subscribing to ${topicName}`);
  
        //Session subscription
        this.session.subscribe(
          solace.SolclientFactory.createTopicDestination(topicName),
          true, // generate confirmation when subscription is added successfully
          topicName, // use topic name as correlation key
          this.options.readTimeout ? this.options.readTimeout : 10000 // 10 seconds timeout for this operation, if not specified
        );                
      });
    } catch (error: any) {
      Logger.logDetailedError(`subscribe action failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }

  };

  // Unsubscribes from request topic on Solace PubSub+ Event Broker
  unsubscribe = () => {
    if (this.session !== null) {
      this.replier.subscribed.forEach((topicName:any) => {
        Logger.logInfo('unsubscribing from topic: ' + topicName);
        try {
          this.session.unsubscribe(
            solace.SolclientFactory.createTopicDestination(topicName),
            true, // generate confirmation when subscription is removed successfully
            topicName, // use topic name as correlation key
            this.options.readTimeout ? this.options.readTimeout : 10000 // 10 seconds timeout for this operation, if not specified
          );
        } catch (error:any) {
          Logger.logDetailedError(`failed to unsubscribe to topic ${topicName} - `, error.toString())
          if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        }
      })
    } else {
      Logger.logError('cannot unsubscribe because not connected to Solace PubSub+ Event Broker.');
    }
  };

  reply = (message:any, payload:any) => {
    Logger.logSuccess('request received');
    Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.outputMode);
    Logger.await(`replying to request on topic '${message.getDestination().getName()}'...`);
    if (this.session !== null) {
      var reply = solace.SolclientFactory.createMessage();
      reply.setBinaryAttachment(JSON.stringify(payload));
      reply.setApplicationMessageId(message.getApplicationMessageId());
      if (this.options.replyToTopic) 
        reply.setDestination(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic));
      else
        reply.setDestination(message.getReplyTo());
      Logger.logInfo('Reply To: ' + message.getReplyTo());
      this.options.deliveryMode && reply.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
      this.session.sendReply(message, reply);
      // this.session.send(reply)
      Logger.logSuccess(`reply sent`);
      Logger.printMessage(reply.dump(0), reply.getUserPropertyMap(), reply.getBinaryAttachment(), this.options.outputMode);

      this.publishVisualizationEvent(this.session, this.options, STM_EVENT_REPLIED, { 
        type: 'replier', topicName: message.getDestination().getName() + ' [reply]', clientName: this.clientName, uuid: uuid(), msgId: reply.getApplicationMessageId() 
      })    
      Logger.logSuccess('replied.');
    } else {
      Logger.logError('cannot reply because not connected to Solace PubSub+ Event Broker.');
    }
  };

  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    Logger.logSuccess('disconnecting from Solace PubSub+ Event Broker...');
    if (this.session !== null) {
      try {
        this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_DISCONNECTED, {
          type: 'replier', clientName: this.clientName, uuid: uuid() 
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

  exit = () => {
    if (this.session !== null) this.unsubscribe();
    setTimeout(() => {
      this.disconnect();
    }, 500); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 1500); // wait for 1 second to finish
  };
}
