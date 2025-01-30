import solace, { LogLevel, MessageDeliveryModeType } from "solclientjs";
import { Logger } from '../utils/logger'
import { getDefaultClientName, getDefaultTopic, getType } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_REQUESTED, STM_EVENT_REPLY_RECEIVED } from "../utils/controlevents";
import { randomUUID } from "crypto";
import chalk from "chalk";
import { chalkEventCounterLabel } from "../utils/chalkUtils";
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
  callback:any = null;
  requestor:any = {};
  session:any = null;
  clientName:string = ""

  constructor(options:any) {
    super();

    // record the options
    this.options = options;
    this.requestor.topicName = this.options.topic ? this.options.topic : getDefaultTopic('request');

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10_5;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
    this.clientName = this.options.clientName ? this.options.clientName : getDefaultClientName('req')
  }

  // Establishes connection to Solace PubSub+ Event Broker
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.logWarn("already connected and ready to send requests");
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
          Logger.logSuccess('=== ' + this.clientName + ' successfully connected and ready to send requests. ===');
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_CONNECTED, { 
            type: 'requestor', clientName: this.clientName, uuid: uuid()
          })    
          resolve();
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`),
          reject();
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('disconnected.');
          this.requestor.subscribed = false;
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
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

  // sends one request
  request = (topicName: string, payload: string | Buffer | undefined, payloadType: string, iter: number = 1) => {
    if (!this.session) {
      Logger.logWarn("cannot subscribe because not connected to Solace message router!");
      return;
    }
    
    Logger.await(`${chalkEventCounterLabel(iter)} requesting...`);
    var request = solace.SolclientFactory.createMessage();
    request.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
    this.options.httpContentEncoding && request.setHttpContentEncoding(this.options.httpContentEncoding);
    this.options.httpContentType && request.setHttpContentType(this.options.httpContentType);

    if (payload) {
      if (payloadType.toLocaleLowerCase() === 'text') {
        try {
          if (typeof payload === 'object') {
            request.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, JSON.stringify(payload)));
          } else {
            var jsonPayload = JSON.parse(payload.toString());
            request.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, JSON.stringify(jsonPayload)));
          }
        } catch (error) {
          request.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, payload));
        }
      } else {
        if (typeof payload === 'object') {
          const encoder = new TextEncoder(); 
          const result = encoder.encode(JSON.stringify(payload)); 
          request.setBinaryAttachment(result);
        } else if (typeof payload === 'string') {
          const encoder = new TextEncoder(); 
          const result = encoder.encode(payload); 
          request.setBinaryAttachment(result);
        } else {
          request.setBinaryAttachment(payload);
        }
      }
    } else {
      request.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, ""));
    }

    this.options.correlationId ? request.setCorrelationId(this.options.correlationId) : request.setCorrelationId( `REQ-${Date.now().toString()}` );
    this.options.deliveryMode && request.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
    this.options.timeToLive && request.setTimeToLive(this.options.timeToLive);
    this.options.dmqEligible && request.setDMQEligible(true);
    this.options.appMessageId && request.setApplicationMessageId(this.options.appMessageId);
    if (this.options.visualization === 'on' && !this.options.appMessageId) request.setApplicationMessageId(randomUUID());
    this.options.appMessageType && request.setApplicationMessageType(this.options.appMessageType);
    this.options.replyToTopic && request.setReplyTo(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic))
    if (this.options.userProperties) {
      let propertyMap = new solace.SDTMapContainer();
      let props:Record<string, string | string[]> = this.options.userProperties;
      Object.entries(props).forEach((entry) => {
        propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
      });
      request.setUserPropertyMap(propertyMap);    
    } 

    Logger.logSuccess(`request sent on topic ${topicName}, type - ${getType(request)}`)
    Logger.dumpMessage(request, this.options.outputMode, this.options.pretty);
    try {
      if (this.options.replyToTopic) {
        //Session subscription
        this.session.subscribe(
          solace.SolclientFactory.createTopicDestination(this.options.replyToTopic),
          true, // generate confirmation when subscription is added successfully
          this.options.replyToTopic, // use topic name as correlation key
          this.options.readTimeout ? this.options.readTimeout : 10000 // 10 seconds timeout for this operation, if not specified
        );                
      }
      
      this.session.sendRequest(
        request,
        this.options.timeout, // 5 seconds timeout for this operation
        (session:any, message:any) => {
          Logger.logSuccess(`reply received, type - ${getType(message)}`)
          Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
          this.publishVisualizationEvent(this.session, this.options, STM_EVENT_REPLY_RECEIVED, { 
            type: 'requestor', topicName: topicName + ' [reply]', clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
          })    
          // if (this.options.waitBeforeExit) {
          //   setTimeout(() => {
          //     Logger.logWarn(`exiting session (wait-before-exit set for ${this.options.waitBeforeExit})...`);
          //     this.exit();
          //   }, this.options.waitBeforeExit * 1000);
          // } else {
          //   this.exit();
          // }
        },
        (session:any, event:any) => {
          Logger.logDetailedError('request failed - ', event.infoStr)
          if (this.options.waitBeforeExit) {
            setTimeout(() => {
              Logger.logWarn(`exiting session (wait-before-exit set for ${this.options.waitBeforeExit})...`);
              this.exit();
            }, this.options.waitBeforeExit * 1000);
          } else {
            this.exit();
          }
        },
        null // not providing correlation object
      );
      this.publishVisualizationEvent(this.session, this.options, STM_EVENT_REQUESTED, { 
        type: 'requestor', topicName, clientName: this.clientName, uuid: uuid(), msgId: request.getApplicationMessageId()
      })    
    } catch (error:any) {
      Logger.logDetailedError('request failed - ', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }

  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    if (this.session !== null) {
      Logger.logSuccess('disconnecting from Solace PubSub+ Event Broker...');
      try {
        this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_DISCONNECTED, {
          type: 'requestor', clientName: this.clientName, uuid: uuid() 
        })    
        this.session.disconnect();
      } catch (error:any) {
        Logger.logDetailedError('session disconnect failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    }
  };

  exit = () => {
    setTimeout(() => {
      this.disconnect();
    }, 500); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 1000); // wait for 1 second to finish
  };
}
