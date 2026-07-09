import solace, { LogLevel } from "solclientjs";
import { Logger } from '../utils/logger'
import { STM_CLIENT_CONNECTED, STM_CLIENT_DISCONNECTED, STM_EVENT_RECEIVED } from "../utils/controlevents";
import { getDefaultClientName, getType } from "../utils/defaults";
import { VisualizeClient } from "./visualize-client";
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
  browser:any = {};
  clientName:string = "";
  count:number = 0;

  constructor(options:any) {
    super();

    // record the options
    this.options = options;

    //Initializing the solace client library
    let factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10_5;
    solace.SolclientFactory.init(factoryProps);
    this.options.logLevel && solace.SolclientFactory.setLogLevel(logLevelMap.get(this.options.logLevel.toUpperCase()) as LogLevel);
    this.browser.queue = this.options.queue;
    this.browser.browsing = false;
    this.browser.queueBrowser = null;
    this.clientName = this.options.clientName ? this.options.clientName : getDefaultClientName('browse')
  }

  /**
   * Asynchronous function that connects to the Solace Broker and returns a promise.
   */
  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.session !== null) {
        Logger.logWarn("already connected and ready to browse");
        resolve();
        return;
      }
      // if there's no session, create one with the properties imported from the config file
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
          generateReceiveTimestamps: this.options.receiveTimestamps,
          keepAliveIntervalInMsecs: this.options.keepAlive,
          keepAliveIntervalsLimit: this.options.keepAliveIntervalLimit,
          reapplySubscriptions: this.options.reapplySubscriptions,
        });

        // define session event listeners

        //The UP_NOTICE dictates whether the session has been established
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent: solace.SessionEvent) => {
          Logger.logSuccess('=== ' + this.clientName + ' successfully connected and ready to browse the queue. ===');
          this.publishVisualizationEvent(this.session, this.options, STM_CLIENT_CONNECTED, {
            type: 'receiver', clientName: this.clientName, uuid: uuid()
          })
          resolve();
        });

        //The CONNECT_FAILED_ERROR implies a connection failure
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent: solace.SessionEvent) => {
          Logger.logDetailedError(`connection failed to the message router ${sessionEvent.infoStr} - `, `check the connection parameters!`)
          reject(sessionEvent);
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
      } catch (error: any) {
        Logger.logDetailedError('session creation failed - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        reject(error);
        return;
      }

      // connect the session
      try {
        Logger.await(`connecting to broker [${this.options.url}, vpn: ${this.options.vpn}, username: ${this.options.username}, password: ******]`)
        if (this.options.clientName) Logger.info(`client name: ${this.options.clientName}`)
        this.session.connect();
      } catch (error:any) {
        Logger.logDetailedError('failed to connect to broker - ', error.toString())
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        reject(error);
      }
    });
  }

  /**
   * A function to browse messages spooled on a queue (non-destructive)
   */
  browse(options: any) {
    if (this.session !== null) {
      if (this.browser.browsing) {
        Logger.logWarn('already started browser for queue "' + this.browser.queue + '" and ready to browse messages.');
      } else {
        Logger.logSuccess(`starting browser for queue ${this.browser.queue}`)
        try {
          this.options = options;

          // Create a queue browser
          this.browser.queueBrowser = this.session.createQueueBrowser({
            // solace.QueueBrowserProperties
            queueDescriptor: { name: this.browser.queue, type: solace.QueueType.QUEUE },
            windowSize: this.options.windowSize
          });

          // Define queue browser event listeners
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.UP, () => {
            this.browser.browsing = true;
            Logger.logSuccess('ready to browse messages (non-destructive, messages remain on the queue).');
            Logger.await(`waiting for messages...`);
            Logger.logHint(`Use 'stm manage queue --list ${this.browser.queue}` + (this.options.config ? ` --config ${this.options.config}` : '') + '\' to review the queue')

            // wait to be told to exit
            Logger.logInfo('press Ctrl-C to exit');
          });
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.CONNECT_FAILED_ERROR, (error:any) => {
            this.browser.browsing = false;
            Logger.logDetailedError(`the queue browser could not bind to queue '${this.browser.queue}'`, error.toString())
            if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
            if (error.toString() === 'OperationError: Unknown Queue')
              Logger.logHint(`Use 'stm manage queue --create ${this.browser.queue}` + (this.options.config ? ` --config ${this.options.config}` : '') + `' to create the queue`)
            Logger.error('exiting...')
            process.exit(1);
          });
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.DOWN, () => {
            this.browser.browsing = false;
            // Logger.logError('the queue browser is now down');
          });
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.DOWN_ERROR, () => {
            this.browser.browsing = false;
            // Logger.logError('the queue browser is down');
          });
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.GM_DISABLED, () => {
            Logger.logError('guaranteed messaging is not enabled on the broker, cannot browse the queue');
            Logger.error('exiting...')
            process.exit(1);
          });
          // Define message browsed event listener
          this.browser.queueBrowser.on(solace.QueueBrowserEventName.MESSAGE, (message: any) => {
            Logger.await(`${chalkEventCounterLabel(++this.count)} browsing message [${new Date().toLocaleString('en-US', dateFormatOptions)}]`)
            Logger.logSuccess(`browsed ${getType(message)} message on topic ${message.getDestination()}`)
            Logger.dumpMessage(message, this.options.outputMode, this.options.pretty);
            this.publishVisualizationEvent(this.session, this.options, STM_EVENT_RECEIVED, {
              type: 'receiver', deliveryMode: message.getDeliveryMode(), queue: this.browser.queue, topicName: message.getDestination().getName(),
              clientName: this.clientName, uuid: uuid(), msgId: message.getApplicationMessageId()
            })

            // browsing is non-destructive - the message is left on the queue and is NOT acknowledged
          });

          this.browser.queueBrowser.connect();
        } catch (error:any) {
          Logger.logDetailedError(`starting queue browser failed - `, error.toString())
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
    setTimeout(() => {
      this.disconnect();
    }, 500); // wait for 1 second to disconnect
    setTimeout(function () {
      Logger.logSuccess('exiting...')
      process.exit(0);
    }, 1000); // wait for 1 second to finish
  };
}
