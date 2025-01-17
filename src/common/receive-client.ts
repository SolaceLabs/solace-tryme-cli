import solace, { LogLevel } from "solclientjs";
import { Logger } from '../utils/logger'
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_PUBLISHED, STM_EVENT_RECEIVED } from "../utils/controlevents";
import { getDefaultClientName, getDefaultTopic, getType } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
const { uuid } = require('uuidv4');

const logLevelMap:Map<string, LogLevel> = new Map<string, LogLevel>([
  ['FATAL', LogLevel.FATAL],
  ['ERROR', LogLevel.ERROR],
  ['WARN', LogLevel.WARN],
  ['INFO', LogLevel.INFO],
  ['DEBUG', LogLevel.DEBUG],
  ['TRACE', LogLevel.TRACE]
]);

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  year: 'numeric' as 'numeric',
  month: '2-digit' as '2-digit',
  day: '2-digit' as '2-digit',
  hour: '2-digit' as '2-digit',
  minute: '2-digit' as '2-digit',
  second: '2-digit' as '2-digit',
  fractionalSecondDigits: 3 // Include milliseconds with 3 digits
};

export class SolaceClient extends VisualizeClient {
  //Solace session object
  options:any = null;
  session:any = null;
  active:boolean = false;
  receiver:any = {};
  clientName:string = ""

  constructor(options:any) {
    super();
    
    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10_5;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
    this.receiver.topics = new Set<string>();
    this.receiver.queue = this.options.queue;
    this.receiver.consuming = false;    
    this.receiver.messageConsumer = null;    
    this.clientName = this.options.clientName ? this.options.clientName : getDefaultClientName('recv')  
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
        });

        // define session event listeners

        //The UP_NOTICE dictates whether the session has been established
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('=== ' + this.clientName + ' successfully connected and ready to receive events. ===');
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_CONNECTED, { 
            type: 'receiver', clientName: this.clientName, uuid: uuid() 
          })    
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`),
          reject();
        });

        //DISCONNECTED implies the client was disconnected
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_DISCONNECTED, { 
            type: 'receiver', clientName: this.clientName, uuid: uuid() 
          })    
          Logger.logSuccess('disconnected')
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });

        //ACKNOWLEDGED MESSAGE implies that the broker has confirmed message receipt
        this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.logSuccess(`message acknowledged with correlation key '${sessionEvent.correlationKey}' confirmed [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
          else
            Logger.logSuccess(`message acknowledged [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
        });

        //REJECTED_MESSAGE implies that the broker has rejected the message
        this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.logSuccess(`message rejected with correlation key '${sessionEvent.correlationKey}', info: ${sessionEvent.infoStr} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
          else
            Logger.logSuccess(`message rejected, info: ${sessionEvent.infoStr} [${new Date().toLocaleString('en-US', dateFormatOptions)}]`);
        });

        //SUBSCRIPTION ERROR implies that there was an error in subscribing on a topic
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`cannot subscribe to topic ${sessionEvent.correlationKey} - `, sessionEvent.infoStr)
          process.exit(1)
        });

        //SUBSCRIPTION_OK implies that a subscription was successfully applied/removed from the broker
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) => {
          //Check if the topic exists in the map
          let key:string = sessionEvent.correlationKey ? sessionEvent.correlationKey.toString() : '';
          if (!key) {
            Logger.logError(`session subscription activity missing correlation-key`);
            return;
          }

          let subscription = !this.receiver.topics.has(key);
          if (subscription) {
            // subscription exists, remove the topic from the map
            this.receiver.topics.delete(key);
            Logger.logSuccess(`successfully unsubscribed from topic: ${key}`);
          } else {
            // Otherwise, add subscription
            this.receiver.topics.add(key);
            Logger.logSuccess(`successfully subscribed to topic: ${key}`);
          }
        });

        //Message callback function
        this.session.on(solace.SessionEventCode.MESSAGE, (message:any) => {
          Logger.await(`receiving message [${new Date().toLocaleString('en-US', dateFormatOptions)}]`)
          Logger.logSuccess(`received ${getType(message)} message on topic ${message.getDestination()}`)
          //Get the topic name from the message's destination
          let topicName: string = message.getDestination().getName();
          if (!this.receiver.topics.has(topicName)) {
            let matched:boolean = false;
            for (let topic of Array.from(this.receiver.topics.keys())) {
              let sub = topic as string
              if (sub.startsWith('#share'))
                sub = sub.split('/').slice(2).join('/');;

              //Replace all * in the topic filter with a .* to make it regex compatible
              let regexSub = sub.replace(/\*/g, ".*");

              //if the last character is a '>', replace it with a .* to make it regex compatible
              if (sub.lastIndexOf(">") == sub.length - 1) regexSub = regexSub.substring(0, regexSub.length - 1).concat(".*");

              matched = matched || topicName.match(regexSub) !== null;
              if (matched) break;
            }
          }

          this.publishVisualizationEvent(this.session, this.options, STM_EVENT_RECEIVED, { 
            type: 'receiver', deliveryMode: message.getDeliveryMode(), topicName, clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId() 
          })        
          Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
        });
      } catch (error: any) {
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

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribe(topicName: string) {
    if (!this.session) {
      Logger.logWarn("cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.has(topicName)) {
      Logger.logWarn(`subscription ${topicName} does not exist - Cannot unsubscribe`);
      return;
    }

    try {
      Logger.await(`unsubscribing ${topicName}...`);
      this.session.unsubscribe(solace.SolclientFactory.createTopicDestination(topicName), true, topicName);
      this.receiver.receiver.delete(topicName);
    } catch (error: any) {
      Logger.logDetailedError(`unsubscribe from ${topicName} failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribeAll() {
    if (!this.session) {
      Logger.logWarn("cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.size) {
      Logger.logWarn(`no existing subscriptions found`);
      return;
    }

    try {
      this.receiver.topics.forEach((topicName: string) => {
        Logger.await(`unsubscribing ${topicName}`);
        this.receiver.topics.delete(topicName)

        //Session Un-subscribe
        this.session.unsubscribe(
          solace.SolclientFactory.createTopicDestination(topicName), 
          true, 
          topicName);
          this.receiver.topics.delete(topicName);  
      });
    } catch (error: any) {
      Logger.logDetailedError(`unsubscribeAll failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }

  /**
   * Function that subscribes to the topic
   */
  subscribe(options: any) {
    const { topic, queue } = options;

    if (queue)
      this.receiveFromQueue(queue, options)
    else 
      this.receiveOnTopic(topic);
  }

  /**
   * A function to consume messages on topic
   */
  receiveOnTopic(topicNames: any) {
    //Check if the session has been established
    if (!this.session) {
      Logger.logWarn("cannot subscribe because not connected to Solace message router!");
      return;
    }

    let topicList:string[] = [];
    if (typeof topicNames === 'string')
      topicList.push(topicNames);
    else if (typeof topicNames === 'object')
      topicNames.forEach((name: string) => { topicList.push(name) });
    else {
      Logger.logError("unknown topic type!");
      Logger.logError('exiting...')
      process.exit(1)
    }

    try {
      topicList.forEach(topicName => {
        Logger.logInfo(`subscribing to ${topicName}`);
        this.receiver.topics.add(topicName)

        //Session subscription
        this.session.subscribe(
          solace.SolclientFactory.createTopicDestination(topicName),
          true, // generate confirmation when subscription is added successfully
          topicName, // use topic name as correlation key
          this.options.readTimeout ? this.options.readTimeout : 10000 // 10 seconds timeout for this operation, if not specified
        );                
      });
      
      // wait to be told to exit
      Logger.logInfo('press Ctrl-C to exit');  
    } catch (error: any) {
      Logger.logDetailedError(`subscribe action failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      process.exit(1);
    }
  }

  /**
   * A function to consume messages from queue
   */
  receiveFromQueue(queueName: any, options: any) {
    if (this.session !== null) {
      if (this.receiver.consuming) {
        Logger.logWarn('already started receiver for queue "' + queueName + '" and ready to receive messages.');
      } else {
        Logger.logSuccess(`starting receiver for queue ${queueName}`)
        try {
          this.options = options;

          // Create a message receiver
          this.receiver.messageReceiver = this.session.createMessageConsumer({
            // solace.MessageConsumerProperties
            queueDescriptor: { name: this.receiver.queue, type: solace.QueueType.QUEUE },
            acknowledgeMode: this.options.acknowledgeMode, // Enabling Client ack
            createIfMissing: this.options.createIfMissing // Create queue if not exists
          });

          if (this.options.topic) {
            this.options.topic.forEach((topicName: string) => {  
              if (topicName === getDefaultTopic('receive') && !this.options.createIfMissing) return;
                this.receiver.topics.add(topicName);
            })
          }

          // Define message receiver event listeners
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.UP, () => {
            this.options.topic.forEach((topicName: string) => {              
              if (topicName === getDefaultTopic('receive') && !this.options.createIfMissing) return;
              try {
                Logger.await('adding subscription to topic: ' + topicName);
                this.receiver.messageReceiver.addSubscription(
                  solace.SolclientFactory.createTopicDestination(topicName),
                  topicName, // correlation key as topic name
                  this.options.readTimeout
                );
              } catch (error:any) {
                Logger.logDetailedError(`add subscription on receiver failed - `, error.toString())
                if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
                throw error;
              }
            });

            this.receiver.consuming = true;
            Logger.logSuccess('ready to receive messages.');
            Logger.await(`waiting for events...`);
            Logger.logHint(`Use 'stm manage queue --list ${this.receiver.queue}` + (this.options.config ? ` --config ${this.options.config}` : '') + '\' to review the queue and topic subscriptions on the queue')

            // wait to be told to exit
            Logger.logInfo('press Ctrl-C to exit');  
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.CONNECT_FAILED_ERROR, (error:any) => {
            this.receiver.consuming = false;
            Logger.logDetailedError(`the message receiver could not bind to queue '${this.receiver.queue}'`, error.toString())
            if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
            if (error.toString() === 'OperationError: Unknown Queue')
              Logger.logHint(`Use 'stm manage queue --create ${this.receiver.queue}` + (this.options.config ? ` --config ${this.options.config}` : '') + `' to create the queue`)
            Logger.error('exiting...')
            process.exit(1);
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN, () => {
            this.receiver.consuming = false;
            // Logger.logError('the message receiver is now down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN_ERROR, () => {
            this.receiver.consuming = false;
            // Logger.logError('the message receiver is down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) =>  {
            Logger.logDetailedError(`cannot subscribe to topic ${sessionEvent.correlationKey} - `, sessionEvent.infoStr)
            if (sessionEvent.infoStr === 'Permission Not Allowed') {
              Logger.logHint(`You may not be the owner of the queue, update owner with 'stm manage queue --update ${this.receiver.queue} --owner ${this.options.username}` + (this.options.config ? ` --config ${this.options.config}` : '') + `' and try again!`)
              Logger.error('exiting...')
              process.exit(1)
            }
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) =>  {
            if (sessionEvent.infoStr === 'Subscription Already Exists') {
              Logger.logInfo('subscription already exists for topic: ' + sessionEvent.correlationKey);
            } else {
              Logger.logSuccess('successfully subscribed to topic: ' + sessionEvent.correlationKey);
            }
          });
          // Define message received event listener
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.MESSAGE, (message: any) => {
            Logger.logSuccess(`message Received - ${message.getDestination()}, type - ${getType(message)}`)
            Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
            this.publishVisualizationEvent(this.session, this.options, STM_EVENT_RECEIVED, { 
              type: 'receiver', deliveryMode: message.getDeliveryMode(), queue: this.receiver.queue, topicName: message.getDestination().getName(), 
              clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
            })        

            // Need to explicitly ack otherwise it will not be deleted from the message router
            message.acknowledge();
          });

          this.receiver.messageReceiver.connect();
        } catch (error:any) {
          Logger.logDetailedError(`starting message receiver failed - `, error.toString())
          if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
          throw error;
        }
      }
    } else {
      Logger.logError('not connected to Solace PubSub+ Event Broker.');
    }
  }
  
  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    Logger.logSuccess('disconnecting from Solace PubSub+ Event Broker...');
    if (this.session !== null) {
      try {
        this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_DISCONNECTED, { 
          type: 'receiver', clientName: this.clientName , uuid: uuid()
        })    
        this.session.disconnect();
      } catch (error:any) {
        Logger.logDetailedError('session disconnect failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      }
    }
  };
    
  exit() {
    if (!this.options.queue) this.unsubscribeAll();
    setTimeout(() => {
      this.disconnect();
    }, 500); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 1000); // wait for 1 second to finish
  };
}
