import solace, { MessageDeliveryModeType } from "solclientjs";
import { Logger } from "../utils/logger";

export class VisualizeClient {
  publishVisualizationEvent(session: any, options: any,  topicName: string, payload: any): void {
    if (options.visualization === 'on') this.publishVisualizeEvent(session, options, topicName, payload)
  }

  // Publish a message on a topic
  publishVisualizeEvent(session: any, options: any,  topicName: string, payload: string | Buffer): void {
    if (!session) {
      Logger.logWarn("cannot publish because not connected to Solace message router!");
      return;
    }
    try {
      // if (!topicName.startsWith('@STM')) Logger.await('publishing...');
      let message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
      message.setBinaryAttachment(JSON.stringify(payload));
      message.setDeliveryMode(MessageDeliveryModeType.DIRECT);
      options.dmqEligible && message.setDMQEligible(false);
      options.messageId && message.setApplicationMessageId(options.messageId);
      options.messageType && message.setApplicationMessageType('VISUALIZATION_EVENT');
      // Logger.logSuccess(`visualize message published to topic ${topicName}`)
      // Logger.printMessage(message.dump(0), message.getUserPropertyMap(), message.getBinaryAttachment(), options.outputMode);
      session.send(message);
    } catch (error:any) {
      Logger.logDetailedError('visualization publish failed - ', error.toString())
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    }
  }
}