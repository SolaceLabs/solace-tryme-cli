import solace from "solclientjs";
import { Signal, Logger } from '../utils/logger'
import { LogLevel } from "solclientjs";
import { defaultRequestMessage, defaultRequestTopic } from "../utils/defaults";

const logLevelMap:Map<string, LogLevel> = new Map<string, LogLevel>([
  ['FATAL', LogLevel.FATAL],
  ['ERROR', LogLevel.ERROR],
  ['WARN', LogLevel.WARN],
  ['INFO', LogLevel.INFO],
  ['DEBUG', LogLevel.DEBUG],
  ['TRACE', LogLevel.TRACE]
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
    this.requestor.topicName = this.options.topic ? this.options.topic : defaultRequestTopic;;

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
        Signal.warn("Already connected and ready to send requests.");
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
        Signal.success('=== Successfully connected and ready to send requests. ===');
        resolve();
      });
      this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
        Signal.error("Connection failed to the message router: " + sessionEvent.infoStr + " - check correct parameter values and connectivity!"),
        reject();
      });
      this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent: solace.SessionEvent) => {
        Signal.success('Disconnected.');
        this.requestor.subscribed = false;
        if (this.session !== null) {
          this.session.dispose();
          this.session = null;
        }
      });

      // connect the session
      this.session.connect();

      } catch (error:any) {
        Signal.error(error)
      }
    });
  }

  // sends one request
  request = () => {
    //Check if the session has been established
    if (!this.session) {
      Signal.warn("Cannot subscribe because not connected to Solace message router!");
      return;
    }
    
    var prettify = this.options.pretty;
    var requestText = this.options.message ? this.options.message : defaultRequestMessage;
    var request = solace.SolclientFactory.createMessage();
    request.setDestination(solace.SolclientFactory.createTopicDestination(this.requestor.topicName));
    request.setBinaryAttachment(requestText);
    request.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
    Signal.await('Sending request "' + requestText + '" to topic "' + this.requestor.topicName + '"...');
    try {
      this.session.sendRequest(
        request,
        5000, // 5 seconds timeout for this operation
        (session:any, message:any) => {
          Signal.success('Reply received');
          Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), prettify);
          this.exit();
        },
        (session:any, event:any) => {
          Signal.error('Request failure: ' + event.toString());
          this.exit();
        },
        null // not providing correlation object
      );
    } catch (error:any) {
      Signal.error(error)
    }
  }

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
    setTimeout(() => {
      this.disconnect();
    }, 1000); // wait for 1 second to disconnect
    setTimeout(function () {
      process.exit();
    }, 2000); // wait for 2 seconds to finish
  };
}
