import { Input, Parser } from '@asyncapi/parser';
import { Logger } from '../utils/logger'
import { readAsyncAPIFile } from '../utils/config';
import { ManageFeedClientOptionsEmpty } from '../utils/instances';
import { JsonSchemaParser } from '../common/jsonParser';
import { chalkBoldError, chalkBoldWarning } from '../utils/chalkUtils';

const validateSchema = (schema: any) => {
  var jsonParser = new JsonSchemaParser(schema);
  if (!jsonParser.validate()) {
    Logger.error('Invalid schema');
    process.exit(1);
  }

  return schema;
}

const getSchemaExtensions = (schema:any) => {
  let extensions:any = {};
  Array.from(schema.extensions()).forEach((ext:any) => {
    extensions[ext.id()] = ext.value();
  })
  return extensions;
}

const getChannelMessages = (channel:any) => {
  let messages:any = {};
  Array.from(channel.messages()).map((arr:any) => {
    messages[arr.id()] = arr.json()
    if (arr.hasPayload())
      validateSchema(arr.payload().json())
  })
  return messages;
}

const getConsumerBindings = (ops:any) => {
  let bindings:any = {};
  Array.from(ops).map((op:any) => {
    Array.from(op.bindings()).map((arr:any) => {
      if (arr.protocol() === 'solace') {
        let destinations = arr.value()?.destinations;
        if (destinations && destinations.length) {
          destinations.map((dest:any) => {
            if (dest.destinationType === 'queue') {
              bindings[dest.queue.name] = dest.queue;
            }
          });
        }
      }
    })        
  })

  return bindings;
}

const getChannelParameters = (channel:any) => {
  let parameters:any = {};
  Array.from(channel.parameters()).map((arr:any) => {
    parameters[arr.id()] = arr.json()
  })
  return parameters;
}

const getChannelServers = (channel:any) => {
  let servers:any = {};
  Array.from(channel.servers()).map((arr:any) => {
    servers[arr.id()] = arr.json()
  })
  return servers;
}

const getChannelBindings = (channel:any) => {
  let bindings:any = {};
  Array.from(channel.bindings()).map((arr:any) => {
    bindings[arr.id()] = arr.json()
  })
  return bindings;
}

const analyze = async (options: ManageFeedClientOptions, optionsSource: any) => {
  const { fileName } = options;

  if (!fileName) {
    Logger.logError("required option '--file-name <ASYNCAPI_FILE>' not specified")
    Logger.logError('exiting...')
    process.exit(1)
  }

  const asyncApiSchema = readAsyncAPIFile(fileName);
  var result = await analyzeAsyncAPI(asyncApiSchema);
  result.fileName = fileName.lastIndexOf('/') >= 0 ? fileName.substring(fileName.lastIndexOf('/')+1) : fileName;
  return result;
}

const analyzeAsyncAPI = async (asyncApiSchema: Input) => {
  const parser = new Parser();
  Logger.await('Validating AsyncAPI document...');
  const diagnostics = await parser.validate(asyncApiSchema);
  let errors:number = 0;
  let warns:number = 0;
  Array.from(diagnostics).forEach((issue) => {
    if (issue.severity === 0)
      errors++, Logger.error(chalkBoldError(issue.message));
    else if (issue.severity == 1) 
      warns++, Logger.warn(chalkBoldWarning(issue.message));
  })

  if (errors+warns > 0) {
    if (errors)
      Logger.logDetailedError('Validation Status', `Encountered ${warns ? warns + ' warnings' + (errors ? ', ' : '') : ''} ${errors? errors + ' errors' : ''} `);
    else
      Logger.logDetailedWarn('Validation Status', `Encountered ${warns ? warns + ' warnings' + (errors ? ', ' : '') : ''} ${errors? errors + ' errors' : ''} `);
    if (errors) {
      Logger.error('exiting...');
      process.exit(1);
    }
  }

  Logger.await('Parsing AsyncAPI document...');

  const { document } = await parser.parse(asyncApiSchema);
  const _components:any = document?.components();
  const _schemas:any = _components?.schemas();
  const _messages:any = document?.messages();
  const _channels:any = document?.channels();
  const _servers:any = document?.servers();
  const _version:string | undefined = document?.version();
  const _info:any = document?.info();

  const sendChannels:any = {};
  const receiveChannels:any = {};

  const api:any = {
    messages: {},
    schemas: {},
    servers: {},
    info: {},
    version: undefined
  };

  // extract topics
  _channels.forEach((channel:any) => {
    let operations:any = channel.operations();
    let sendOps:any = Array.from(operations).filter((o:any) => o.isSend());
    if (sendOps.length) {
      sendChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
        // json: channel.json()
      }
    }

    let receiveOps = Array.from(operations).filter((o:any) => o.isReceive());
    if (receiveOps.length) {
      receiveChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        consumers: getConsumerBindings(receiveOps),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
        // json: channel.json()
      }
    }
  })

  // extract schemas 
  _schemas.forEach((schema:any) => {
    validateSchema(schema.json())
    let id = schema._json['x-ep-schema-name']
    api.schemas[id] = schema.json();
  });

  // extract servers 
  _servers.forEach((server:any) => {
    api.servers[server.id()] = server.json()
  });
  
  // extract messages
  _messages.forEach((message:any) => {
    api.messages[message.id()] = {
      send: [],
      receive: [],
      hasPayload: message.hasPayload(),
      schema: message.hasPayload() ? message._json?.payload['x-ep-schema-name'] : undefined
    }
  });

  // classify message-based send/receive contexts
  Object.keys(sendChannels).forEach((topic:any) => {
    let channel = sendChannels[topic];
    Object.keys(channel.messages).forEach((messageName:any) => {
      api.messages[messageName].send.push({
        topicName: topic,
        topicParameters: channel.parameters,
        topicDescription: channel.description,
        message: channel.messages[messageName],
        servers: channel.servers,
        bindings: channel.bindings
      })
    })
  })
  
  Object.keys(receiveChannels).forEach((topic:any) => {
    let channel = receiveChannels[topic];
    Object.keys(channel.messages).forEach((messageName:any) => {
      api.messages[messageName].receive.push({
        topicName: topic,
        topicParameters: channel.parameters,
        topicDescription: channel.description,
        message: channel.messages[messageName],
        servers: channel.servers,
        bindings: channel.bindings,
        consumers: channel.consumers
      })
    })
  })

  api.info = _info.json();
  api.version = _version;
  return api;
}


export default analyze

export { analyze }
