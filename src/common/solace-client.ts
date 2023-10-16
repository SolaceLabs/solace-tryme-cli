import solace from "solclientjs";
import { signale, stmLog } from '../utils/logger'
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
  receiver:any = {};

  constructor(options:any) {
    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel) as LogLevel);
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
        signale.warn("Already connected and ready to subscribe.");
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
          stmLog.connected()
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          signale.error("Connection failed to the message router: " + sessionEvent.infoStr + " - check correct parameter values and connectivity!"),
          reject();
        });

        //DISCONNECTED implies the client was disconnected
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          stmLog.disconnected()
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });

        //ACKNOWLEDGED MESSAGE implies that the broker has confirmed message receipt
        this.session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (sessionEvent: solace.SessionEvent) => {
          signale.success("Delivery of message with correlation key = " + sessionEvent.correlationKey + " confirmed.");
        });

        //REJECTED_MESSAGE implies that the broker has rejected the message
        this.session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (sessionEvent: solace.SessionEvent) => {
          signale.warn("Delivery of message with correlation key = " + sessionEvent.correlationKey + " rejected, info: " + sessionEvent.infoStr);
        });

        //SUBSCRIPTION ERROR implies that there was an error in subscribing on a topic
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) => {
          signale.error("Cannot subscribe to topic: " + sessionEvent.correlationKey);
        });

        //SUBSCRIPTION_OK implies that a subscription was successfully applied/removed from the broker
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) => {
          signale.info(`Session subscription activity for correlation-key: ${sessionEvent.correlationKey}`);
          //Check if the topic exists in the map
          let key:string = sessionEvent.correlationKey ? sessionEvent.correlationKey.toString() : '';
          if (!key) {
            signale.error(`Session subscription activity missing correlation-key`);
            return;
          }

          let subscription = !this.receiver.topics.has(key);
          if (subscription) {
            // subscription exists, remove the topic from the map
            this.receiver.topics.delete(key);
            signale.success(`Successfully unsubscribed from topic: ${key}`);
          } else {
            // Otherwise, add subscription
            this.receiver.topics.add(key);
            signale.success(`Successfully subscribed to topic: ${key}`);
            stmLog.waitingForEvents();

            // wait to be told to exit
            signale.warn('Press Ctrl-C to exit');  
          }
        });

        //Message callback function
        this.session.on(solace.SessionEventCode.MESSAGE, (message:any) => {
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
              signale.error('💣💣 Hmm.. received message on an unsubscribed topic 💥💥')
              return;
            }
          } 

          this.callback(message, this.options.pretty);
        });
      } catch (error: any) {
        signale.error(error);
      }

      // connect the session
      try {
        stmLog.connecting(this.options.url, this.options.vpn, this.options.username, this.options.clientName);
        this.session.connect();
      } catch (error:any) {
        signale.error(error);
      }
    });
  }

  /**
   * A function to disconnect session
   */
  disconnect() {
    stmLog.disconnecting();
    if (this.session !== null) {
      try {
        this.session.disconnect();
      } catch (error:any) {
        signale.error(error);
      }
    } else {
      signale.error("Not connected to Solace PubSub+ Event Broker.");
    }
  }

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribe(topicName: string) {
    if (!this.session) {
      signale.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.has(topicName)) {
      signale.warn(`Subscription ${topicName} does not exist - Cannot unsubscribe`);
      return;
    }

    try {
      signale.info(`Unsubscribing from ${topicName}...`);
      this.session.unsubscribe(solace.SolclientFactory.createTopicDestination(topicName), true, topicName);
      this.receiver.receiver.delete(topicName);
    } catch (error: any) {
      signale.error(error);
    }
  }

  /**
   * A function to unsubscribe a topic
   * @param topicName The topicName to unsubscribe
   */
  unsubscribeAll() {
    if (!this.session) {
      signale.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    if (!this.receiver.topics.size) {
      signale.warn(`No existing subscriptions found`);
      return;
    }

    try {
      this.receiver.topics.forEach((topicName: string) => {
        signale.info(`Unsubscribing ${topicName}`);
        this.receiver.topics.delete(topicName)

        //Session Un-subscribe
        this.session.unsubscribe(
          solace.SolclientFactory.createTopicDestination(topicName), 
          true, 
          topicName);
          this.receiver.topics.delete(topicName);  
      });
    } catch (error: any) {
      signale.error(error);
    }
  }

  /**
   * Function that subscribes to the topic
   * @param topicName Topic string for the subscription
   * @param callback Callback for the function
   */
  subscribe(options: any, callback:any) {
    const { topic, queue } = options;

    if (queue)
      this.receiveFromQueue(queue, callback, options)
    else 
      this.receiveOnTopic(topic, callback);
  }

  receiveOnTopic(topicNames: any, callback:any) {
    //Check if the session has been established
    if (!this.session) {
      signale.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }

    this.callback = callback;

    let topicList:string[] = [];
    if (typeof topicNames === 'string')
      topicList.push(topicNames);
    else if (typeof topicNames === 'object')
      topicNames.forEach((name: string) => { topicList.push(name) });
    else {
      signale.fatal("Unknown topic type!");
      process.exit(1)
    }

    try {
      topicList.forEach(topicName => {
        signale.info(`Subscribing to ${topicName}`);
        this.receiver.topics.add(topicName)

        //Session subscription
        this.session.subscribe(
          solace.SolclientFactory.createTopicDestination(topicName),
          true, // generate confirmation when subscription is added successfully
          topicName, // use topic name as correlation key
          this.options.readTimeout ? this.options.readTimeout : 10000 // 10 seconds timeout for this operation, if not specified
        );                
      });
    } catch (error: any) {
      signale.error(error);
    }
  }

  /**
   * A function to consume messages from queue
   */
  receiveFromQueue(queueName: any, callback:any, options: any) {
    if (this.session !== null) {
      if (this.receiver.consuming) {
        signale.warn('Already started receiver for queue "' + queueName + '" and ready to receive messages.');
      } else {
        stmLog.startingConsumer(queueName);
        try {
          // record the callback
          this.callback = callback;
          this.options = options;

          // Create a message receiver
          this.receiver.messageReceiver = this.session.createMessageConsumer({
            // solace.MessageConsumerProperties
            queueDescriptor: { name: this.receiver.queue, type: solace.QueueType.QUEUE },
            acknowledgeMode: this.options.acknowledgeMode, // Enabling Client ack
            createIfMissing: this.options.createIfMissing // Create queue if not exists
          });

          if (this.options.addSubscription && this.options.topic) {
            this.options.topic.forEach((topicName: string) => {  
              this.receiver.topics.add(topicName);            
            })
          }

          // Define message receiver event listeners
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.UP, () => {
            this.options.topic.forEach((topicName: string) => {              
              try {
                signale.success('Subscribing to topic: ' + topicName);
                this.receiver.messageReceiver.addSubscription(
                  solace.SolclientFactory.createTopicDestination(topicName),
                  topicName, // correlation key as topic name
                  this.options.readTimeout
                );
              } catch (error) {
                signale.error(error);
                throw error;
              }
            });

            this.receiver.consuming = true;
            signale.success('Ready to receive messages.');
            stmLog.waitingForEvents();

            // wait to be told to exit
            signale.warn('Press Ctrl-C to exit');  
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.CONNECT_FAILED_ERROR, () => {
            this.receiver.consuming = false;
            signale.error('Error: the message receiver could not bind to queue "' + this.receiver.queue +
                  '"\n   Ensure this queue exists on the message router vpn');
            process.exit();
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN, () => {
            this.receiver.consuming = false;
            signale.error('The message receiver is now down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.DOWN_ERROR, () => {
            this.receiver.consuming = false;
              signale.log('An error happened, the message receiver is down');
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) =>  {
            signale.log('Cannot subscribe to topic ' + sessionEvent);
          });
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) =>  {
            if (sessionEvent.infoStr === 'Subscription Already Exists') {
              signale.success('Subscription already exists for topic: ' + sessionEvent.correlationKey);
            } else {
              signale.success('Successfully subscribed to topic: ' + sessionEvent.correlationKey);
            }
            signale.success('Ready to receive messages.');
          });
          // Define message received event listener
          this.receiver.messageReceiver.on(solace.MessageConsumerEventName.MESSAGE, (message: any) => {
            this.callback(message, this.options.pretty);

            // Need to explicitly ack otherwise it will not be deleted from the message router
            message.acknowledge();
          });

          this.receiver.messageReceiver.connect();
        } catch (error) {
          signale.error(error)
          throw error;
        }
      }
    } else {
      signale.error('Solace PubSub+ Event Broker.');
    }
  }
  
  /**
   * Publish a message on a topic
   * @param topicName Topic to publish on
   * @param payload Payload on the topic
   */
  publish(topicName: string, payload: string | Buffer) {
    if (!this.session) {
      signale.warn("Cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
      message.setBinaryAttachment(payload);
      message.setCorrelationKey(this.options.correlationKey ? this.options.correlationKey : topicName);
      this.options.deliveryMode && message.setDeliveryMode(deliveryModeMap.get(this.options.deliveryMode) as MessageDeliveryModeType);
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
      
      !this.options.dumpMessage && signale.info(`Publishing message '${payload}' to topic ${topicName}...`);
      this.options.dumpMessage && stmLog.messagePubDump(message.dump(0), message.getBinaryAttachment());

      this.session.send(message);
      stmLog.published()
    } catch (error:any) {
      signale.error(error);
    }
  }

  /**
   * Publish a message on a topic
   */
  exit() {
    if (!this.options.queue) this.unsubscribeAll();
    this.disconnect();
    setTimeout(() => {
      process.exit();
    }, 1000); // wait for 1 second to finish
  };
}
