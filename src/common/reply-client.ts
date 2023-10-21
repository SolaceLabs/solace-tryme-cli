import solace from "solclientjs";
import { Signal, Logger } from '../utils/logger'
import { LogLevel } from "solclientjs";
import { defaultRequestTopic } from "../utils/defaults";

const logLevelMap:Map<string, LogLevel> = new Map<string, LogLevel>([
  ['FATAL', LogLevel.FATAL],
  ['ERROR', LogLevel.ERROR],
  ['WARN', LogLevel.WARN],
  ['INFO', LogLevel.INFO],
  ['DEBUG', LogLevel.DEBUG],
  ['TRACE', LogLevel.TRACE]
]);

export class ReplyClient {
  //Solace session object
  options:any = null;
  replier:any = {};
  session:any = null;

  constructor(options:any) {
    // record the options
    this.options = options;
    this.replier.topicName = this.options.topic ? this.options.topic : defaultRequestTopic;;
    this.replier.subscribed = false;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel) as LogLevel);
  }

  // Establishes connection to Solace PubSub+ Event Broker
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Signal.warn('Already connected and ready to receive requests.');
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
          Signal.success('=== Successfully connected and ready to subscribe to request topic. ===');
          this.subscribe();
          resolve();
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Signal.error("Connection failed to the message router: " + sessionEvent.infoStr + " - check correct parameter values and connectivity!"),
          reject();
        });
        this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
          Signal.success('Disconnected.');
          this.replier.subscribed = false;
          if (this.session !== null) {
            this.session.dispose();
            this.session = null;
          }
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent: solace.SessionEvent) => {
          Signal.error('Cannot subscribe to topic: ' + sessionEvent.correlationKey);
        });
        this.session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent: solace.SessionEvent) => {
          if (this.replier.subscribed) {
            this.replier.subscribed = false;
            Signal.success('Successfully unsubscribed from request topic: ' + sessionEvent.correlationKey);
          } else {
            this.replier.subscribed = true;
            Signal.success('Successfully subscribed to request topic: ' + sessionEvent.correlationKey);
            Signal.await('=== Ready to receive requests. ===');
          }
        });
        // define message event listener
        this.session.on(solace.SessionEventCode.MESSAGE, (message: any) => {
          try {
            this.reply(message);
          } catch (error:any) {
            Signal.error(error)
          }
        });
        // connect the session
        this.session.connect();
      } catch (error:any) {
        Signal.error(error)
      }
    });
  }

  // Subscribes to request topic on Solace PubSub+ Event Broker
  subscribe = () => {
    if (this.session !== null) {
      if (this.replier.subscribed) {
        Signal.warn('Already subscribed to "' + this.replier.topicName + '" and ready to receive messages.');
      } else {
        Signal.info('Subscribing to topic: ' + this.replier.topicName);
        try {
          this.session.subscribe(
            solace.SolclientFactory.createTopicDestination(this.replier.topicName),
            true, // generate confirmation when subscription is added successfully
            this.replier.topicName, // use topic name as correlation key
            10000 // 10 seconds timeout for this operation
          );
        } catch (err) {
          Signal.error(err);
        }
      }
    } else {
      Signal.error('Cannot subscribe because not connected to Solace PubSub+ Event Broker.');
    }
  };

  // Unsubscribes from request topic on Solace PubSub+ Event Broker
  unsubscribe = () => {
    if (this.session !== null) {
      if (this.replier.subscribed) {
        Signal.info('Unsubscribing from topic: ' + this.replier.topicName);
        try {
          this.session.unsubscribe(
            solace.SolclientFactory.createTopicDestination(this.replier.topicName),
            true, // generate confirmation when subscription is removed successfully
            this.replier.topicName, // use topic name as correlation key
            10000 // 10 seconds timeout for this operation
          );
        } catch (error:any) {
          Signal.error(error)
        }
      }
    } else {
      Signal.error('Cannot unsubscribe because not connected to Solace PubSub+ Event Broker.');
    }
  };

  reply = (message:any) => {
    Signal.success('Request received');
    Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), this.options.pretty);
    Signal.await('Replying...');
    if (this.session !== null) {
      var requestText = message.getBinaryAttachment();
      var reply = solace.SolclientFactory.createMessage();
      reply.setBinaryAttachment(requestText + " - Sample Reply");
      this.session.sendReply(message, reply);
      Signal.success('Replied.');
    } else {
      Signal.error('Cannot reply: not connected to Solace PubSub+ Event Broker.');
    }
  };

  // Gracefully disconnects from Solace PubSub+ Event Broker
  disconnect = () => {
    Signal.success('Disconnecting from Solace PubSub+ Event Broker...');
    if (this.session !== null) {
      try {
        this.session.disconnect();
      } catch (error:any) {
        Signal.error(error)
      }
    } else {
      Signal.error('Not connected to Solace PubSub+ Event Broker.');
    }
  };

  exit = () => {
    this.unsubscribe();
    setTimeout(() => {
      this.disconnect();
    }, 1000); // wait for 1 second to disconnect
    setTimeout(function () {
      process.exit();
    }, 2000); // wait for 2 seconds to finish
  };
}
