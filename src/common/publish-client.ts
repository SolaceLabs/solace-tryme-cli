import solace from 'solclientjs';
import { Logger } from '../utils/logger'
import { LogLevel, MessageDeliveryModeType } from "solclientjs";
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_DELIVERED, STM_EVENT_PUBLISHED } from "../utils/controlevents";
import { getDefaultClientName, getType } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
import { randomUUID } from "crypto";
import { chalkEventCounterValue } from '../utils/chalkUtils';
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

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  hour: '2-digit' as '2-digit',
  minute: '2-digit' as '2-digit',
  second: '2-digit' as '2-digit',
  fractionalSecondDigits: 3 // Include milliseconds with 3 digits
};

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
  pubConfirmationId = 100001;

  constructor(options:any) {
    super();

    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10_5;
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
        Logger.logWarn("already connected and ready to subscribe");
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
          Logger.logSuccess('=== ' + this.clientName + ' successfully connected and ready to publish events. ===');
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

        if (this.options.publishConfirmation) {
          //ACKNOWLEDGED MESSAGE implies that the vpn has confirmed message receipt
          this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
            if (sessionEvent.correlationKey) 
              Logger.await(`publish confirmation received for message with correlation key ${sessionEvent.correlationKey} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
            else
              Logger.await(`publish confirmation received for message [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
          });

          //REJECTED_MESSAGE implies that the vpn has rejected the message
          this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
            if (sessionEvent.correlationKey) 
              Logger.logError(`publish rejected for message with correlation key ${sessionEvent.correlationKey}, info: ${sessionEvent.infoStr} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
            else
              Logger.logError(`publish rejected for message, info: ${sessionEvent.infoStr} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
          });
        }
      } catch (error: any) {
        Logger.logDetailedError('session creation failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }

      // connect the session
      try {
        Logger.await(`connecting to broker [${this.options.url}, vpn: ${this.options.vpn}, username: ${this.options.username}, password: ******]`)
        if (this.options.clientName) Logger.info(`client name: ${this.clientName}`)
        this.session.connect();
      } catch (error:any) {
        Logger.logDetailedError('failed to connect to broker - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    });
  }

  // get field value from the payload
  getSourceFieldValue (obj:any, path:string):any {
    if (path.indexOf('.') < 0)
      if (!obj.hasOwnProperty(path))
        throw new Error(`field ${path} not found in payload`)
      else
        return obj[path];
  
    let field = path.substring(0, path.indexOf('.'));
    let fieldName = field.replaceAll('[0]', '');
    var remaining = path.substring(path.indexOf('.')+1);
    return this.getSourceFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining);
  }
  
  // Publish a message on a topic
  publish(topicName: string, payload: string | Buffer | undefined, payloadType: string, iter: number = 0) {
    if (this.exited) return;
    
    if (!this.session) {
      Logger.logWarn("cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      if (!topicName.startsWith('@STM')) {
        this.options.publishConfirmation && this.options.deliveryMode === 'PERSISTENT' ?
          Logger.await(`${chalkEventCounterValue(iter+1)} publishing ${this.options.deliveryMode} message with correlation key ${this.pubConfirmationId} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`) :
          Logger.await(`${chalkEventCounterValue(iter+1)} publishing ${this.options.deliveryMode} message [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
      }
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
      this.options.httpContentEncoding !== undefined && message.setHttpContentEncoding(this.options.httpContentEncoding);
      this.options.httpContentType !== undefined && message.setHttpContentType(this.options.httpContentType);
      if (this.options.correlationId) {
        if (this.options.correlationId === 'uuid')
          message.setCorrelationId(uuid());
        else
          message.setCorrelationId(this.options.correlationId);
      }
      if (payload) {
        if (payloadType.toLocaleLowerCase() === 'text') {
          payload = payload === "{}" ? "" : payload;
          try {
            if (typeof payload === 'object') {
              message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, JSON.stringify(payload)));
            } else {
              message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, payload));
            }
          } catch (error) {
            message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, payload));
          }
        } else {
          if (typeof payload === 'object') {
            const encoder = new TextEncoder(); 
            const result = encoder.encode(JSON.stringify(payload)); 
            message.setBinaryAttachment(result);
          } else if (typeof payload === 'string') {
            const encoder = new TextEncoder(); 
            const result = encoder.encode(payload); 
            message.setBinaryAttachment(result);
          } else {
            message.setBinaryAttachment(payload);
          }
        }

        // payloadType.toLocaleLowerCase() === 'text'
        // ? message.setSdtContainer(
        //     solace.SDTField.create(
        //       solace.SDTFieldType.STRING,
        //       JSON.stringify(payload)
        //     )
        //   )
        // : message.setBinaryAttachment(
        //     typeof payload === 'object' ? JSON.stringify(payload) : payload
        //   );        
      } 
      else {
        message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, ""));
      }

      this.options.acknowledgeImmediately !== undefined && message.setAcknowledgeImmediately(this.options.acknowledgeImmediately);
      if (this.options.correlationKey) {
        if (this.options.correlationKey === 'uuid')
          message.setCorrelationKey(uuid());
        else
          message.setCorrelationKey(this.options.correlationKey);
      }
      !this.options.correlationKey && this.options.deliveryMode === 'PERSISTENT' && this.options.publishConfirmation && message.setCorrelationKey('' + this.pubConfirmationId++);      
      this.options.deliveryMode !== undefined && message.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode.toUpperCase()) as MessageDeliveryModeType);
      this.options.timeToLive !== undefined && message.setTimeToLive(this.options.timeToLive);
      this.options.dmqEligible !== undefined && message.setDMQEligible(this.options.dmqEligible);
      this.options.appMessageId !== undefined && message.setApplicationMessageId(this.options.appMessageId);
      if (this.options.visualization === 'on' && !this.options.appMessageId) message.setApplicationMessageId(randomUUID());
      this.options.appMessageType !== undefined && message.setApplicationMessageType(this.options.appMessageType);
      this.options.replyToTopic !== undefined && message.setReplyTo(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic))
      if (this.options.userProperties) {
        let propertyMap = new solace.SDTMapContainer();
        let props:Record<string, string | string[]> = this.options.userProperties;
        Object.entries(props).forEach((entry) => {
          propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
        });
        message.setUserPropertyMap(propertyMap);    
      }

      if (this.options.partitionKeysCount) {
        let propertyMap = message.getUserPropertyMap();
        if (!propertyMap) propertyMap = new solace.SDTMapContainer();
        
        var pKey2 = 'pkey-' + Date.now() % this.options.partitionKeysCount;
        propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey2));
        message.setUserPropertyMap(propertyMap);    
      } else if (this.options.partitionKeysList && this.options.partitionKeysList.length) {
        let propertyMap = message.getUserPropertyMap();
        if (!propertyMap) propertyMap = new solace.SDTMapContainer();
        
        var pKey1 = this.options.partitionKeysList[iter % this.options.partitionKeysList.length];
        propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey1));
        message.setUserPropertyMap(propertyMap);    
      } else if (this.options.partitionKeys) {
        if (Array.isArray(this.options.partitionKeys) && !this.options.partitionKeys.length) {
          this.options.partitionKeys = '';
        }
        
        var fields = this.options.partitionKeys.split('|').map((field:string) => field.trim());
        if (fields.length) {
          let propertyMap = message.getUserPropertyMap();
          if (!propertyMap) propertyMap = new solace.SDTMapContainer();
          
          var values:string[] = [];
          fields.forEach((field:string) => {
            try {
              let val:string = this.getSourceFieldValue(payload, field);
              values.push(val);
            } catch (error:any) {
              Logger.logWarn(`failed to get field value for ${field} - ${error.toString()}`)
            }
          });
          var pKey1:any = values.join('-');            
          propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey1));
          message.setUserPropertyMap(propertyMap);    
        }
      }
      
      Logger.logSuccess(`published ${getType(message)} message to topic - ${message.getDestination()} }`)
      Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
      this.session.send(message);
      this.publishVisualizationEvent(this.session, this.options, STM_EVENT_PUBLISHED, { 
        type: 'sender', deliveryMode: message.getDeliveryMode(), topicName, clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
      })    
    } catch (error:any) {
      Logger.logDetailedError('message publish failed - ', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }

  // Deliver a message to a queue
  deliver(queueName: string, payload: string | Buffer | undefined, payloadType: string, iter: number = 0) {
    if (this.exited) return;

    if (!this.session) {
      Logger.logWarn("cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      this.options.publishConfirmation ?
        Logger.await(`${chalkEventCounterValue(iter+1)} publishing ${this.options.deliveryMode} message with correlation key ${this.pubConfirmationId} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`) :
        Logger.await(`${chalkEventCounterValue(iter+1)} publishing ${this.options.deliveryMode} message [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createDurableQueueDestination(queueName));
      this.options.httpContentEncoding !== undefined && message.setHttpContentEncoding(this.options.httpContentEncoding);
      this.options.httpContentType !== undefined && message.setHttpContentType(this.options.httpContentType);
      if (this.options.correlationId) {
        if (this.options.correlationId === 'uuid')
          message.setCorrelationId(uuid());
        else
          message.setCorrelationId(this.options.correlationId);
      }
      if (payload) {
        if (payloadType.toLocaleLowerCase() === 'text') {
          payload = payload === "{}" ? "" : payload;
          try {
            if (typeof payload === 'object') {
              message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, JSON.stringify(payload)));
            } else {
              message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, payload));
            }
          } catch (error) {
            message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, payload));
          }
        } else {
          if (typeof payload === 'object') {
            const encoder = new TextEncoder();
            const result = encoder.encode(JSON.stringify(payload));
            message.setBinaryAttachment(result);
          } else if (typeof payload === 'string') {
            const encoder = new TextEncoder();
            const result = encoder.encode(payload);
            message.setBinaryAttachment(result);
          } else {
            message.setBinaryAttachment(payload);
          }
        }
      }
      else {
        message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, ""));
      }

      this.options.acknowledgeImmediately !== undefined && message.setAcknowledgeImmediately(this.options.acknowledgeImmediately);
      if (this.options.correlationKey) {
        if (this.options.correlationKey === 'uuid')
          message.setCorrelationKey(uuid());
        else
          message.setCorrelationKey(this.options.correlationKey);
      }
      !this.options.correlationKey && this.options.deliveryMode === 'PERSISTENT' && this.options.publishConfirmation && message.setCorrelationKey('' + this.pubConfirmationId++);      
      message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
      this.options.timeToLive !== undefined && message.setTimeToLive(this.options.timeToLive);
      this.options.dmqEligible !== undefined && message.setDMQEligible(this.options.dmqEligible);
      this.options.appMessageId !== undefined && message.setApplicationMessageId(this.options.appMessageId);
      if (this.options.visualization === 'on' && !this.options.appMessageId) message.setApplicationMessageId(randomUUID());
      this.options.appMessageType !== undefined && message.setApplicationMessageType(this.options.appMessageType);
      this.options.replyToTopic !== undefined && message.setReplyTo(solace.SolclientFactory.createTopicDestination(this.options.replyToTopic))
      if (this.options.userProperties) {
        let propertyMap = new solace.SDTMapContainer();
        let props:Record<string, string | string[]> = this.options.userProperties;
        Object.entries(props).forEach((entry) => {
          propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
        });
        message.setUserPropertyMap(propertyMap);
      }

      if (this.options.partitionKeysCount) {
        let propertyMap = message.getUserPropertyMap();
        if (!propertyMap) propertyMap = new solace.SDTMapContainer();

        var pKey2 = 'pkey-' + Date.now() % this.options.partitionKeysCount;
        propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey2));
        message.setUserPropertyMap(propertyMap);
      } else if (this.options.partitionKeysList && this.options.partitionKeysList.length) {
        let propertyMap = message.getUserPropertyMap();
        if (!propertyMap) propertyMap = new solace.SDTMapContainer();

        var pKey1 = this.options.partitionKeysList[iter % this.options.partitionKeysList.length];
        propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey1));
        message.setUserPropertyMap(propertyMap);
      } else if (this.options.partitionKeys) {
        if (Array.isArray(this.options.partitionKeys) && !this.options.partitionKeys.length) {
          this.options.partitionKeys = '';
        }

        var fields = this.options.partitionKeys.split('|').map((field:string) => field.trim());
        if (fields.length) {
          let propertyMap = message.getUserPropertyMap();
          if (!propertyMap) propertyMap = new solace.SDTMapContainer();

          var values:string[] = [];
          fields.forEach((field:string) => {
            try {
              let val:string = this.getSourceFieldValue(payload, field);
              values.push(val);
            } catch (error:any) {
              Logger.logWarn(`failed to get field value for ${field} - ${error.toString()}`);
            }
          });
          var pKey1:any = values.join('-');
          propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey1));
          message.setUserPropertyMap(propertyMap);
        }
      }

      Logger.logSuccess(`published ${getType(message)} message to queue - ${message.getDestination()} }`)
      Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
      this.session.send(message);
      this.publishVisualizationEvent(this.session, this.options, STM_EVENT_DELIVERED, {
        type: 'sender', deliveryMode: message.getDeliveryMode(), queueName, clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
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
    }
  };
  
  exit() {
    this.setExited(true);
    setTimeout(() => {
      this.disconnect();
    }, 500); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 1000); // wait for 1 second to finish
  };
}
