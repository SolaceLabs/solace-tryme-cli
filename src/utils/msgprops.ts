export const messagePropertiesJson = {
  "payloadType": {
    "exposed": true,
    "key": "payloadType",
    "property": "Payload Type",
    "description": "Hint on the payload type (BYTES or TEXT)",
    "values": ["BYTES", "TEXT"],
    "type": "select",
    "datatype": "string",
    "default": "BYTES"
  },
  "publishConfirmation": {
    "exposed": false,
    "key": "publishConfirmation",
    "property": "Publish Confirmation",
    "description": "Generate publish confirmation",
    "values": ["true", "false"],
    "type": "select",
    "datatype": "boolean",
    "default": "false"
  },
  "appMessageId": {
    "exposed": true,
    "key": "appMessageId",
    "property": "Application Message ID",
    "description": "User-defined identifier carried end-to-end",
    "values": ["", "uuid"],
    "type": "select",
    "datatype": "string",
    "default": ""
  },
  "appMessageType": {
    "exposed": false,
    "key": "appMessageType",
    "property": "Application Message Type",
    "description": "User-defined message type identifier",
    "type": "input",
    "datatype": "string",
    "default": ""
  },
  "correlationId": {
    "exposed": false,
    "key": "correlationId",
    "property": "Correlation ID",
    "description": "User-defined identifier carried end-to-end used for peer-to-peer message synchronization (request-reply)",
    "values": ["uuid"],
    "type": "select",
    "datatype": "string",
    "default": ""
  },
  "correlationKey": {
    "exposed": false,
    "key": "correlationKey",
    "property": "Correlation Key",
    "description": "Local identifier for Guaranteed messages (UUID) used to correlate a message with its acknowledgement or rejection",
    "values": ["uuid"],
    "type": "select",
    "datatype": "string",
    "default": ""
  },
  "deliveryMode": {
    "exposed": true,
    "key": "deliveryMode",
    "property": "Delivery Mode",
    "description": "Specifies the message delivery mode",
    "values": ["DIRECT", "PERSISTENT"],
    "type": "select",
    "datatype": "string",
    "default": "PERSISTENT"
  },
  "dmqEligible": {
    "exposed": true,
    "key": "dmqEligible",
    "property": "DMQ Eligible",
    "description": "Boolean flag for Dead Message Queue eligibility",
    "values": ["true", "false"],
    "type": "select",
    "datatype": "boolean",
    "default": "false"
  },
  "elidingEligible": {
    "exposed": false,
    "key": "elidingEligible",
    "property": "Eliding Eligible",
    "description": "Indicates if the message can be elided (replaced by newer messages)",
    "values": ["true", "false"],
    "type": "select",
    "datatype": "boolean",
    "default": "false"
  },
  "replyToTopic": {
    "exposed": false,
    "key": "replyToTopic",
    "property": "Reply To",
    "description": "Destination for replies (must be a topic)",
    "type": "input",
    "datatype": "string",
    "default": ""
  },
  "sequenceNumber": {
    "exposed": false,
    "key": "sequenceNumber",
    "property": "Sequence Number",
    "description": "Message sequence identifier",
    "values": ["true", "false"],
    "type": "select",
    "datatype": "boolean",
    "default": "false"
  },
  "timeToLive": {
    "exposed": true,
    "key": "timeToLive",
    "property": "Time to Live",
    "description": "Message expiration time in milliseconds",
    "type": "input",
    "datatype": "number",
    "default": ""
  },
  "userProperties": {
    "exposed": true,
    "key": "userProperties",
    "property": "User Properties",
    "description": "User properties as space-separated values if listing more than one<br>(e.g., \"key1:1st Value\" key2:\"2nd Value\" key3:3rdValue)",
    "type": "input",
    "datatype": "string",
    "default": ""
  },
  "httpContentType": {
    "exposed": false,
    "key": "httpContentType",
    "property": "HTTP Content Type",
    "description": "MIME type of HTTP content",
    "type": "input",
    "datatype": "string",
    "default": ""
  },
  "httpContentEncoding": {
    "exposed": false,
    "key": "httpContentEncoding",
    "property": "HTTP Content Encoding",
    "description": "Encoding of HTTP content",
    "type": "input",
    "datatype": "string",
    "default": ""
  }
}