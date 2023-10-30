import solace from "solclientjs";
import { Logger } from '../utils/logger'
import { LogLevel } from "solclientjs";

const logLevelMap:Map<string, LogLevel> = new Map<string, LogLevel>([
  ['FATAL', LogLevel.FATAL],
  ['ERROR', LogLevel.ERROR],
  ['WARN', LogLevel.WARN],
  ['INFO', LogLevel.INFO],
  ['DEBUG', LogLevel.DEBUG],
  ['TRACE', LogLevel.TRACE]
]);

export class SolaceClient {
  //Solace session object
  options:any = null;
  session:any = null;
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
    this.receiver.topics = new Set<string>();
    this.receiver.queue = this.options.queue;
    this.receiver.consuming = false;    
    this.receiver.messageConsumer = null;    
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
          Logger.success('=== Successfully connected and ready to receive events. ===');
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`error: connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`),
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

        //ACKNOWLEDGED MESSAGE implies that the broker has confirmed message receipt
        this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.success("Delivery of message with correlation key = " + sessionEvent.correlationKey + " confirmed.");
          else
            Logger.success("Delivery of message confirmed.");
        });

        //REJECTED_MESSAGE implies that the broker has rejected the message
        this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
          if (sessionEvent.correlationKey) 
            Logger.warn("Delivery of message with correlation key = " + sessionEvent.correlationKey + " rejected, info: " + sessionEvent.infoStr);
          else
            Logger.warn("Delivery of message rejected: " + sessionEvent.infoStr);
        });

        //SUBSCRIPTION ERROR implies that there was an error in subscribing on a topic
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`error: cannot subscribe to topic ${sessionEvent.correlationKey} - `, sessionEvent.infoStr)
        });

        //SUBSCRIPTION_OK implies that a subscription was successfully applied/removed from the broker
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) => {
          //Check if the topic exists in the map
          let key:string = sessionEvent.correlationKey ? sessionEvent.correlationKey.toString() : '';
          if (!key) {
            Logger.error(`error: session subscription activity missing correlation-key`);
            return;
          }

          let subscription = !this.receiver.topics.has(key);
          if (subscription) {
            // subscription exists, remove the topic from the map
            this.receiver.topics.delete(key);
            Logger.logSuccess(`Successfully unsubscribed from topic: ${key}`);
          } else {
            // Otherwise, add subscription
            this.receiver.topics.add(key);
            Logger.logSuccess(`Successfully subscribed to topic: ${key}`);
          }
        });

        //Message callback function
        this.session.on(solace.SessionEventCode.MESSAGE, (message:any) => {
          Logger.logSuccess(`Message Received - ${message.getDestination()}`)

          //Get the topic name from the message's destination
          let topicName: string = message.getDestination().getName();
          if (!this.receiver.topics.has(topicName)) {
            let matched:boolean = false;
            for (let topic of Array.from(this.receiver.topics.keys())) {
              let sub = topic as string
              //Replace all * in the topic filter with a .* to make it regex compatible
              let regexSub = sub.replace(/\*/g, ".*");

              //if the last character is a '>', replace it with a .* to make it regex compatible
              if (sub.lastIndexOf(">") == sub.length - 1) regexSub = regexSub.substring(0, regexSub.length - 1).concat(".*");

              matched = matched || topicName.match(regexSub) !== null;
              if (matched) break;
            }
            if (!matched) {
              Logger.error('error: 💣💣 Hmm.. received message on an unsubscribed topic 💥💥')
              return;
            }
          } 
          Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.pretty);
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

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribe(topicName: string) {
    if (!this.session) {
      Logger.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.has(topicName)) {
      Logger.warn(`Subscription ${topicName} does not exist - Cannot unsubscribe`);
      return;
    }

    try {
      Logger.await(`Unsubscribing ${topicName}...`);
      this.session.unsubscribe(solace.SolclientFactory.createTopicDestination(topicName), true, topicName);
      this.receiver.receiver.delete(topicName);
    } catch (error: any) {
      Logger.logDetailedError(`error: unsubscribe from ${topicName} failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    }
  }

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribeAll() {
    if (!this.session) {
      Logger.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.size) {
      Logger.warn(`No existing subscriptions found`);
      return;
    }

    try {
      this.receiver.topics.forEach((topicName: string) => {
        Logger.await(`Unsubscribing ${topicName}`);
        this.receiver.topics.delete(topicName)

        //Session Un-subscribe
        this.session.unsubscribe(
          solace.SolclientFactory.createTopicDestination(topicName), 
          true, 
          topicName);
          this.receiver.topics.delete(topicName);  
      });
    } catch (error: any) {
      Logger.logDetailedError(`error: unsubscribeAll failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
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
      Logger.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    let topicList:string[] = [];
    if (typeof topicNames === 'string')
      topicList.push(topicNames);
    else if (typeof topicNames === 'object')
      topicNames.forEach((name: string) => { topicList.push(name) });
    else {
      Logger.error("error: unknown topic type!");
      Logger.error('Exiting...')
      process.exit(1)
    }

    try {
      topicList.forEach(topicName => {
        Logger.info(`Subscribing to ${topicName}`);
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
      Logger.info('Press Ctrl-C to exit');  
    } catch (error: any) {
      Logger.logDetailedError(`error: subscribe action failed - `, error.toString())
      if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
    }
  }

  /**
   * A function to consume messages from queue
   */
  receiveFromQueue(queueName: any, options: any) {
    if (this.session !== null) {
      if (this.receiver.consuming) {
        Logger.warn('Already started receiver for queue "' + queueName + '" and ready to receive messages.');
      } else {
        Logger.success(`Starting receiver for queue ${queueName}`)
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
              this.receiver.topics.add(topicName);            
            })
          }

          // Define message receiver event listeners
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.UP, () => {
            this.options.topic.forEach((topicName: string) => {              
              try {
                Logger.success('Adding subscription to topic: ' + topicName);
                this.receiver.messageReceiver.addSubscription(
                  solace.SolclientFactory.createTopicDestination(topicName),
                  topicName, // correlation key as topic name
                  this.options.readTimeout
                );
              } catch (error:any) {
                Logger.logDetailedError(`error: add subscription on receiver failed - `, error.toString())
                if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
                throw error;
              }
            });

            this.receiver.consuming = true;
            Logger.success('Ready to receive messages.');
            Logger.await(`Waiting for events...`);

            // wait to be told to exit
            Logger.info('Press Ctrl-C to exit');  
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.CONNECT_FAILED_ERROR, () => {
            this.receiver.consuming = false;
            Logger.logDetailedError('error: the message receiver could not bind to queue "' + this.receiver.queue,
                  'check if the queue exists on the message router vpn');
            Logger.error('Exiting...')
            process.exit(1);
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN, () => {
            this.receiver.consuming = false;
            Logger.error('error: the message receiver is now down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN_ERROR, () => {
            this.receiver.consuming = false;
            Logger.error('error: the message receiver is down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) =>  {
            Logger.logDetailedError(`error: cannot subscribe to topic ${sessionEvent.correlationKey} - `, sessionEvent.infoStr)
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) =>  {
            if (sessionEvent.infoStr === 'Subscription Already Exists') {
              Logger.warn('Subscription already exists for topic: ' + sessionEvent.correlationKey);
            } else {
              Logger.logSuccess('Successfully subscribed to topic: ' + sessionEvent.correlationKey);
            }
          });
          // Define message received event listener
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.MESSAGE, (message: any) => {
            Logger.logSuccess(`Message Received - ${message.getDestination()}`)
            Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.pretty);

            // Need to explicitly ack otherwise it will not be deleted from the message router
            message.acknowledge();
          });

          this.receiver.messageReceiver.connect();
        } catch (error:any) {
          Logger.logDetailedError(`error: starting message receiver failed - `, error.toString())
          if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
          throw error;
        }
      }
    } else {
      Logger.error('error: not connected to Solace PubSub+ Event Broker.');
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
    if (!this.options.queue) this.unsubscribeAll();
    this.disconnect();
    setTimeout(() => {
      Logger.success('Exiting...')
      process.exit(0);
    }, 1000); // wait for 1 second to finish
  };
}
