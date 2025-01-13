import parser, { AsyncAPIDocumentInterface, Input, Parser } from '@asyncapi/parser';
import { Logger } from '../utils/logger'
import { readAsyncAPIFile } from '../utils/config';
import { JsonSchemaParser } from '../common/jsonParser';
import { Channel } from '@asyncapi/parser/esm/models/v2/channel';
import { validateAsyncAPI } from './feed-validate';
import { chalkBoldError, chalkBoldWarning } from '../utils/chalkUtils';

const validateSchema = (schema: any) => {
  var jsonParser = new JsonSchemaParser(schema);
  if (!jsonParser.validate()) {
    Logger.error('Invalid schema');
    process.exit(1);
  }

  return schema;
}

const getChannelMessages = (channel:any) => {
  let messages:any = {};
  Array.from(channel.messages()).map((arr:any) => {
    let key = arr.id() ? arr.id() : arr.name();
    messages[key] = arr.json()
    if (arr.hasPayload())
      validateSchema(arr.payload().json())
  })
  return messages;
}

const getOpMessages = (op:any) => {
  let messages:any = {};
  Array.from(op.messages()).map((arr:any) => {
    let key = arr.id() ? arr.id() : arr.name();
    messages[key] = arr.json()
  })
  return messages;
}

const getChannelParameters = (channel:any) => {
  let parameters:any = {};
  Array.from(channel.parameters()).map((arr:any) => {
    let key = arr.id() ? arr.id() : arr.name();
    parameters[key] = arr.json()
  })
  return parameters;
}

const getChannelServers = (channel:any) => {
  let servers:any = {};
  Array.from(channel.servers()).map((arr:any) => {
    let key = arr.id() ? arr.id() : arr.name();
    servers[key] = arr.json()
  })
  return servers;
}

const getChannelBindings = (channel:any) => {
  let bindings:any = {};
  Array.from(channel.bindings()).map((arr:any) => {
    bindings[arr.protocol()] = arr.json()
  })
  return bindings;
}

const removeMetaParams = (obj: any) => {
  for(const prop in obj) {
    if (prop.startsWith('x-'))
      delete obj[prop];
    else if (typeof obj[prop] === 'object')
      removeMetaParams(obj[prop]);
  }
}

const enhanceRuleWithValidatorsAndFormats = (schema: any, rule: any) => {
  if (schema.minLength !== undefined) rule.minLength = schema.minLength;
  if (schema.maxLength !== undefined) rule.maxLength = schema.maxLength;
  if (rule.minLength > rule.maxLength && schema.minLength !== undefined && schema.maxLength === undefined) rule.maxLength = rule.minLength + 10;
  if (rule.minLength > rule.maxLength && schema.minLength === undefined && schema.maxLength !== undefined) rule.minLength = rule.maxLength - 10;
  if (rule.minLength < 0) rule.minLength = 1;

  if (schema.minimum !== undefined) rule.minimum = schema.minimum;
  if (schema.maximum !== undefined) rule.maximum = schema.maximum;
  if (rule. minimum > rule.maximum && schema. minimum !== undefined && schema.maximum === undefined) rule.maximum = rule. minimum + 100;
  if (rule. minimum > rule.maximum && schema. minimum === undefined && schema.maximum !== undefined) rule. minimum = rule.maximum - 100;
  if (rule. minimum< 0) rule. minimum = 1;

  if (schema.pattern !== undefined) rule.pattern = schema.pattern;
  if (schema.format !== undefined) rule.format = schema.format;
  if (schema.exclusiveMinimum !== undefined) rule.exclusiveMinimum = schema.exclusiveMinimum;
  if (schema.exclusiveMaximum !== undefined) rule.exclusiveMaximum = schema.exclusiveMaximum;
  if (schema.multipleOf !== undefined) rule.multipleOf = schema.multipleOf;
  if (schema.const !== undefined) {
    rule.group = 'StringRules';
    rule.rule = 'static';
    rule.static = schema.const;
  }
  if (schema.minItems !== undefined) rule.minItems = schema.minItems;
  if (schema.maxItems !== undefined) rule.maxItems = schema.maxItems;
  if (schema.uniqueItems !== undefined) rule.uniqueItems = schema.uniqueItems;
  if (schema.title !== undefined) rule.title = schema.title;
  if (schema.description !== undefined) rule.description = schema.description;
  if (schema.default !== undefined) rule.default = schema.default;
  if (schema.examples !== undefined) rule.examples = schema.examples;

  // currently they are removed from the rule settings
  ['default', 'pattern', 'examples', 'exclusiveMaximum', 'exclusiveMinimum', 'pattern', 'multipleOf'].forEach(key => delete rule[key]);

  if (schema.format) {
    switch (schema.format) {
      case "date-time":
        rule.group = 'DateRules';
        rule.rule = 'currentDateWithTime';
        rule.format = 'MM-DD-YYYY HH:mm:ss';
        ['casing', 'minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "date":
        rule.group = 'DateRules';
        rule.rule = 'currentDate';
        rule.format = 'MM-DD-YYYY';
        ['casing', 'minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "time":
        rule.group = 'DateRules';
        rule.rule = 'currentTime';
        rule.format = 'HH:mm:ss';
        ['casing', 'minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "duration":
        rule.group = 'StringRules';
        rule.rule = 'numeric';
        rule.minLength = 1;
        rule.maxLength = 2;
        ['casing', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "hostname":
      case "idn-hostname":
        rule.group = 'InternetRules';
        rule.rule = 'domainWord';        
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "email":
      case "idn-email":
        rule.group = 'InternetRules';
        rule.rule = 'email';
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;        
      case "ipv4":
      case "ipv6":
        rule.group = 'InternetRules';
        rule.rule = schema.format;
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;        
      case "uri":
      case "uri-reference":
      case "iri":
      case "iri-reference":
      case "uri-template":
        rule.group = 'InternetRules';
        rule.rule = 'url';
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;        
      case "json-pointer":
      case "relative-json-pointer":
      case "regex":
        rule.group = 'InternetRules';
        rule.rule = 'url';
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      case "uuid":
        rule.group = 'StringRules';
        rule.rule = 'uuid';
        ['minLength', 'maxLength', 'minimum', 'maximum', 'enum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems'].forEach(key => delete rule[key]);
        break;
      default:
        break;
    }
  }
}

const setDefaultTopicVariableRules = (obj: any) => {
  for(const prop in obj) {
    var schema = obj[prop].schema;
    schema = !schema || !schema.type ? { ...obj[prop], type: 'string' } : schema;
    if (schema.type.toLowerCase() === 'string') {
      obj[prop].rule = schema.enum ? 
      { name: prop, type: 'string', group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :      
      { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    } else if (schema.type.toLowerCase() === 'number') {
      obj[prop].rule = schema.enum ? 
      { name: prop, type: 'number', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
      { name: prop, type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
    } else if (schema.type.toLowerCase() === 'integer') {        
      obj[prop].rule = schema.enum ? 
      { name: prop, type: 'integer', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
      { name: prop, type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
    } else if (schema.type.toLowerCase() === 'boolean') {        
      obj[prop].rule = schema.enum ? 
      { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'enum', enum: schema.enum.map(Boolean) } : 
      { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
    } else if (schema.type.toLowerCase() === 'null') {        
      obj[prop].rule = { name: prop, type: 'null', group: 'NullRules', rule: 'null' }
    } else {
      obj[prop].rule = schema.enum ?
      { name: prop, type: schema.type, group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :
      { name: prop, type: schema.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    }

    obj[prop].description = schema.description ? schema.description : undefined;
    enhanceRuleWithValidatorsAndFormats(schema, obj[prop].rule);
  }
}

const processObjectPayload = async (payload: any) => {
  for(const prop in payload) {
    if (payload[prop].type === undefined)
      continue;

    if (payload[prop].type === 'object') {
      payload[prop].rule = { name: prop, type: 'object'};
      if (payload[prop].properties) 
        processObjectPayload(payload[prop].properties);
      else {
        let keys = Object.keys(payload[prop]);
        if (keys.includes('allOf') && payload[prop]['allOf'].length) {
          payload[prop].properties = payload[prop]['allOf'][0].properties;
          processObjectPayload(payload[prop].properties);
        } else if (keys.includes('anyOf') && payload[prop]['anyOf'].length) {
          payload[prop].properties = payload[prop]['anyOf'][0].properties;
          processObjectPayload(payload[prop].properties);
        } else if (keys.includes('oneOf') && payload[prop]['oneOf'].length) {
          payload[prop].properties = payload[prop]['oneOf'][0].properties;
          processObjectPayload(payload[prop].properties);
        }
      }
      continue;
    }

    if (payload[prop].type === 'array') {
      if (!payload[prop].items || Object.keys(payload[prop].items).length === 0) {
        // missing items details (intended or misconfigured), either way nothing to do here!
        delete payload[prop];
        continue;
      }
  
      payload[prop].subType = payload[prop].items.type;
      payload[prop].name = prop;

      var schema = payload[prop].items;
      if (schema.type.toLowerCase() === 'object') {
        payload[prop].rule = { name: prop, type: 'object'};
        enhanceRuleWithValidatorsAndFormats(schema, payload[prop].rule);
        processObjectPayload(schema.properties);
        continue;
      } else if (schema.type.toLowerCase() === 'array') { 
        payload[prop].rule = { name: prop, type: 'array', subType: schema.items.type};
        enhanceRuleWithValidatorsAndFormats(schema, payload[prop].rule);
        processArrayPayload(schema);
        continue;
      }

      if (schema.type.toLowerCase() === 'string') {
        payload[prop].rule = schema.enum ? 
        { name: prop, type: 'string', group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :      
        { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
      } else if (schema.type.toLowerCase() === 'number') {
        payload[prop].rule = schema.enum ? 
        { name: prop, type: 'number', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
        { name: prop, type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
      } else if (schema.type.toLowerCase() === 'integer') {        
        payload[prop].rule = schema.enum ? 
        { name: prop, type: 'integer', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
        { name: prop, type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
      } else if (schema.type.toLowerCase() === 'boolean') {        
        payload[prop].rule = schema.enum ? 
        { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'enum', enum: schema.enum.map(Boolean) } : 
        { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
      } else if (schema.type.toLowerCase() === 'null') {        
        payload[prop].rule = { name: prop, type: 'null', group: 'NullRules', rule: 'null' }
      } else {
        payload[prop].rule = schema.enum ?
        { name: prop, type: schema.type, group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :
        { name: prop, type: schema.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
      }
  
      payload[prop].description = schema.description ? schema.description : undefined;
      enhanceRuleWithValidatorsAndFormats(schema, payload[prop].rule);
  
      delete payload[prop].items;
      continue;
    }

    var schema = payload[prop];
    var schemaType = schema.type;
    if (Array.isArray(schemaType)) {
      schemaType.forEach((type) => type.toLowerCase());
      schema.type = schemaType.find((type: string) => type.toLowerCase() !== 'null') || schemaType[0];
    }

    if (schema.type.toLowerCase() === 'string') {
      payload[prop].rule = schema.enum ? 
      { name: prop, type: 'string', group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :      
      { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    } else if (schema.type.toLowerCase() === 'number') {
      payload[prop].rule = schema.enum ? 
      { name: prop, type: 'number', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
      { name: prop, type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
    } else if (schema.type.toLowerCase() === 'integer') {        
      payload[prop].rule = schema.enum ? 
      { name: prop, type: 'integer', group: 'NumberRules', rule: 'enum', enum: schema.enum.map(Number) } : 
      { name: prop, type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
    } else if (schema.type.toLowerCase() === 'boolean') {        
      payload[prop].rule = schema.enum ? 
      { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'enum', enum: schema.enum.map(Boolean) } : 
      { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
    } else if (schema.type.toLowerCase() === 'null') {        
      payload[prop].rule = { name: prop, type: 'null', group: 'NullRules', rule: 'null' }
    } else {
      payload[prop].rule = schema.enum ?
      { name: prop, type: schema.type, group: 'StringRules', rule: 'enum', enum: schema.enum.map(String) } :
      { name: prop, type: schema.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    }
  
    enhanceRuleWithValidatorsAndFormats(schema, payload[prop].rule);
  }
}

const processPayloadField = (payload: any) => {
  if (payload.type.toLowerCase() === 'string') {
    payload.rule = payload.enum ? 
    { type: 'string', group: 'StringRules', rule: 'enum', enum: payload.enum.map(String) } :      
    { type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
  } else if (payload.type.toLowerCase() === 'number') {
    payload.rule = payload.enum ? 
    { type: 'number', group: 'NumberRules', rule: 'enum', enum: payload.enum.map(Number) } : 
    { type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
  } else if (payload.type.toLowerCase() === 'integer') {        
    payload.rule = payload.enum ? 
    { type: 'integer', group: 'NumberRules', rule: 'enum', enum: payload.enum.map(Number) } : 
    { type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
  } else if (payload.type.toLowerCase() === 'boolean') {        
    payload.rule = payload.enum ? 
    { type: 'boolean', group: 'BooleanRules', rule: 'enum', enum: payload.enum.map(Boolean) } : 
    { type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
  } else if (payload.type.toLowerCase() === 'null') {        
    payload.rule = { type: 'null', group: 'NullRules', rule: 'null' }
  } else {
    payload.rule = payload.enum ?
    { type: payload.type, group: 'StringRules', rule: 'enum', enum: payload.enum.map(String) } :
    { type: payload.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
  }

  enhanceRuleWithValidatorsAndFormats(payload, payload.rule);
}

const processArrayPayload = (payload: any) => {
  var prop = 'items';
  payload[prop].rule = { name: prop, type: 'array', subType: 'object'};
  if (payload[prop].properties) 
    processPayload(payload[prop].properties)
  else {
    let keys = Object.keys(payload[prop]);
    if (keys.includes('allOf') && payload[prop]['allOf'].length) {
      payload[prop].properties = payload[prop]['allOf'][0].properties;
      payload[prop].type = payload[prop]['allOf'][0].type;
      payload[prop].name = prop;
      processPayload(payload[prop].properties)
    } else if (keys.includes('anyOf') && payload[prop]['anyOf'].length) {
      payload[prop].properties = payload[prop]['anyOf'][0].properties;
      payload[prop].type = payload[prop]['anyOf'][0].type;
      payload[prop].name = prop;
      processPayload(payload[prop].properties)
    } else if (keys.includes('oneOf') && payload[prop]['oneOf'].length) {
      payload[prop].properties = payload[prop]['oneOf'][0].properties;
      payload[prop].type = payload[prop]['oneOf'][0].type;
      payload[prop].name = prop;
      processPayload(payload[prop].properties)
    }
  }

  payload.subType = payload.items.type;
  if (payload.items.type === 'string') {
    payload.rule = { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    delete payload.items;
  } else if (payload.items.type === 'object') {
    payload.properties = payload.items.properties;
    payload.rule = { name: prop, type: 'object'};
    if (payload.properties) 
      processObjectPayload(payload.properties)
    delete payload.items;
  }

  payload.items = { ...payload };
  ['properties', 'type', 'subType', 'rule'].forEach(e => delete payload[e]);
}

const processPayload = (msg: any) => {
  // Logger.info('processing message: ' + JSON.stringify(msg));
  // Logger.info('message type: ' + msg.type);
  var payload = msg.payload;
  // Logger.info('payload type: ' + payload.type);

  if (!payload && msg.properties) {
    payload = msg.properties;
    processObjectPayload(payload);
  } else if (payload.type === 'array') {
    processArrayPayload(payload);
  } else if (typeof payload?.type === 'string' && 
            ['string', 'number', 'integer', 'boolean', 'null'].includes(payload.type)) {
    processPayloadField(payload);
  } else {
    processObjectPayload(payload);
  }
}

const setDefaultPayloadRules = (msgs: any) => {
  msgs.forEach(async (msg:any) => {
    var payload = msg.payload;
    if (payload && payload.type === 'object' && payload.properties) {
      msg.payload = { ...payload.properties }
      payload = msg.payload;
    }

    if (payload && payload.schema && payload.schema.properties) {
      delete payload?.schemaFormat;
      msg.payload = { ...payload.schema.properties }
      payload = msg.payload;
    }

    // scenario encountered in asyncapiv3/gitter-streaming-asyncapi.yml where payload contains schema (directly)
    if (payload && payload.schema && payload.schema.type !== undefined) {
      delete payload?.schemaFormat;
      msg.payload = { ...payload }
      payload = msg.payload;
    }

    if (!payload && msg.properties) {
      msg.payload = { payload: { ...msg.properties } }
      payload = msg.payload;
    }

    if (!payload) return;
  
    processPayload(msg);
  });
}

const checkIfPlainJson = (schemaFormant: string) => {
  const jsonFormats = ['vnd.aai.asyncapi+json;', 'application/json;'];
  let plainJson = jsonFormats.some((format: string) =>
    schemaFormant.toLowerCase().includes(format.toLowerCase())
  );
  return plainJson;
}

const checkSchemaFormat = (schemaFormat: string) => {
  const supportedSchemaFormats = ['vnd.aai.asyncapi+json', 'application/schema+yaml', 'vnd.aai.asyncapi', 'json', 'avro'];
  let supported = supportedSchemaFormats.some((format: string) => 
    schemaFormat.toLowerCase().includes(format.toLowerCase())
  );
  return supported;
}

const fixUpJsonPayload = (payload:any, parent:any) => {
  if (payload.type === 'object' && !payload.properties) {
    payload = {
      type: 'object',
      properties: { ...payload }
    }
    delete payload.properties.type;
    for (const prop in payload.properties) {
      if (prop.startsWith('x-')) delete payload.properties[prop];
      if (Array.isArray(payload.properties[prop]) && payload.properties[prop].length > 1) {
        if (Array.isArray(payload.properties[prop][0])) {
          payload.properties[prop] = {
            type: 'array',
            items: {
              type: typeof payload.properties[prop][0],
              properties: payload.properties[prop][0]
            }
          }
        } else
        if (typeof payload.properties[prop][0] === 'object') {
          payload.properties[prop] = {
            type: 'object',
            properties: payload.properties[prop][0]
          }
        } else {
          payload.properties[prop] = {
            type: typeof payload.properties[prop][0]
          }
        }
      }
    }
    for (const prop in payload.properties) {
      payload.properties[prop] = fixUpJsonPayload(payload.properties[prop], payload.properties);
    }  
  } else if (Array.isArray(payload) && payload.length === 1) {
    payload = {
      type: 'array',
      items: {
        type: 'object',
        properties: payload[0]
      }
    }
    for (const prop in payload.items.properties) {
      if (prop.startsWith('x-')) delete payload.items.properties[prop];
      if (Array.isArray(payload.items.properties[prop]) && payload.items.properties[prop].length > 1) {
        if (Array.isArray(payload.items.properties[prop][0])) {
          payload.items.properties[prop] = {
            type: 'array',
            items: {
              type: typeof payload.items.properties[prop][0],
              properties: payload.items.properties[prop][0]
            }
          }
        } else
        if (typeof payload.items.properties[prop][0] === 'object') {
          payload.items.properties[prop] = {
            type: 'object',
            properties: payload.items.properties[prop][0]
          }
        } else {
          payload.items.properties[prop] = {
            type: typeof payload.items.properties[prop][0]
          }
        }
      }      
    }
    for (const prop in payload.items.properties) {
      payload.items.properties[prop] = fixUpJsonPayload(payload.items.properties[prop], payload.items.properties);
    }  
  } else {
    payload = typeof payload === 'object' ? 
                  { ...payload, type: payload.type ? payload.type : typeof payload } : 
                  { type: payload.type ? payload.type : typeof payload};
  }

  return payload;
}

const fixUpMessageApplicators = (message:any) => {
  if (message?.properties) {
    message.properties = fixUpPayloadApplicators(message.properties);
  } else {
    message = { ...message, type: 'object', ...fixUpPayloadApplicators(message) };
  }
  return message;
}

const fixUpPayloadApplicators = (payload:any):any => {
  if (payload?.type === 'object') {
    if (payload.properties) {
      return fixUpPayloadApplicators(payload.properties);
    } else {
      let keys = Object.keys(payload);
      if (keys.includes('allOf')) {
        return fixUpPayloadApplicators(payload['allOf'][0]);
      } else if (keys.includes('anyOf')) {
        return fixUpPayloadApplicators(payload['anyOf'][0]);
      } else if (keys.includes('oneOf')) {
        return fixUpPayloadApplicators(payload['oneOf'][0]);
      } else {
        return payload;
      }
    }
  } else {
    let keys = Object.keys(payload);
    if (keys.includes('allOf')) {
      return fixUpPayloadApplicators(payload['allOf'][0]);
    } else if (keys.includes('anyOf')) {
      return fixUpPayloadApplicators(payload['anyOf'][0]);
    } else if (keys.includes('oneOf')) {
      return fixUpPayloadApplicators(payload['oneOf'][0]);
    } else {
      return payload;
    }
  }
}

const load = async (asyncApiSchema: Input, validate: boolean = true) => {
  try {
    const parser = new Parser();
    const { document: rDocument, diagnostics: rDiagnostics } = await parser.parse(asyncApiSchema);
    
    if (!rDocument) {
      if (rDiagnostics.length) {
        let errors = 0;
        let warns = 0;
        Array.from(rDiagnostics).forEach((issue) => {
          if (issue.severity === 0)
            errors++;
          if (issue.message.indexOf('stack:') < 0)
            Logger.error(chalkBoldError(issue.message));
          else 
          Logger.error(chalkBoldError(issue.message.substring(0, issue.message.indexOf('stack:')-2)));
          if (issue.severity == 1) 
            warns++;
        })
        
        if (errors+warns > 0) {
          if (errors)
            Logger.logDetailedError('Validation Status', `Encountered ${warns ? warns + ' warnings' + (errors ? ', ' : '') : ''} ${errors? errors + ' errors' : ''} `);
        }
      
        if (errors) {
          Logger.error('AsyncAPI document parsing failed');
          Logger.error('exiting...');
          process.exit(1);
        }   
      } else {
          Logger.error('Unable to parse AsyncAPI document');
          Logger.error('exiting...');
          process.exit(1);
      }
    }
    
    validate && await validateAsyncAPI(asyncApiSchema);

    const $RefParser = require("@apidevtools/json-schema-ref-parser");
    const bundledDocument = await $RefParser.bundle(rDocument?.json());
    const resolvedDocument = await $RefParser.dereference(bundledDocument);
    
    const { document } = await parser.parse(resolvedDocument);
  
    // check for schema format - error if unsupported
    const _messages = document?.messages();
    if (_messages) {
      _messages.forEach((message:any) => {
        if (message.schemaFormat() && !checkSchemaFormat(message.schemaFormat())) {
          Logger.error(`Unsupported schema format: ${message.schemaFormat()}`);
          Logger.error('exiting...');
          process.exit(1);
      }
      })
    }

    const extensionIds = Array.from(document?.info()?.extensions() || []).map(e => e.id());
    return {
      asyncApiVersion: document?.version(),
      epSpecification: extensionIds ? 
      extensionIds.includes('x-ep-application-id') || extensionIds.includes('x-ep-event-api-id') : 
      false,
      epSpecificationType: extensionIds ?
        extensionIds.includes('x-ep-application-id') ? 'Application' :  
        extensionIds.includes('x-ep-event-api-id') ? 'Event API' : 'Unknown' :
        'Unknown',
      document: document
    };
  } catch (error:any) {
    Logger.logDetailedError('Unable to load AsyncAPI document', error);
    Logger.error('exiting...');
    process.exit(1);
  }
}

const validateTopic = (topic: string) => {
  let tokens = topic.split('/');
  let valid = true;
  valid = tokens.length > 0;
  if (!valid) return false;

  if (valid) {
    tokens.forEach((token, index) => {
      if (!token.length)
        valid = false;
      if (valid && token[0] === '{' && token[token.length-1] !== '}')
        valid = false;
      if (valid && token[token.length-1] === '}' && token[0] !== '{')
        valid = false;
      if (valid && (token.includes('*') || token.includes('>')))
        valid = false;
      tokens[index] = token.replaceAll('{', '').replaceAll('}', '');
    })
  }
  return valid;
}

const analyze = async (document: AsyncAPIDocumentInterface, reverse:boolean = false) => {
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
    version: undefined,
    fileName: undefined
  };

  // extract topics
  _channels.forEach((channel:Channel) => {
    let operations:any = channel.operations();
    let sendOps:any = reverse ?
                        Array.from(operations).filter((o:any) => !o.isSend()) :
                        Array.from(operations).filter((o:any) => o.isSend());
    if (sendOps.length) {
      if (!channel.address() || !validateTopic(channel.address())) {
        Logger.error(`Invalid topic: ${channel.address()}`);
        Logger.error('exiting...');
        process.exit(1);
      }

      sendOps.forEach((sendOp:any) => {
        sendChannels[sendOp.id()] = {
            address: channel.address(),
            description: channel.description(),
            bindings: getChannelBindings(channel),
            messages: getOpMessages(sendOp),
            parameters: getChannelParameters(channel),
            servers: getChannelServers(channel),
        }
      })
    }

    let receiveOps = reverse ?
                        Array.from(operations).filter((o:any) => !o.isReceive()) :
                        Array.from(operations).filter((o:any) => o.isReceive());
    if (receiveOps.length) {
      receiveOps.forEach((receiveOp:any) => {
        receiveChannels[receiveOp.id()] = {
          address: channel.address(),
          description: channel.description(),
          bindings: getChannelBindings(channel),
          messages: getOpMessages(receiveOp),
          parameters: getChannelParameters(channel),
          servers: getChannelServers(channel),
        }
      })
    }
  })

  // extract schemas 
  _schemas.forEach((schema:any) => {
    validateSchema(schema.json())
    let id = schema.id();
    api.schemas[id] = schema.json();
  });

  // extract servers 
  _servers.forEach((server:any) => {
    api.servers[server.id()] = server.json()
  });
  
  // extract messages
  _messages.forEach((message:any) => {
    let messageName = message.id() ? message.id() : message.name();
    messageName = messageName ? messageName : message.extensions().get('x-parser-message-name')?.json();
    if (!messageName) {
      Logger.error('Unable to extract message name');
      Logger.error('exiting...');
      process.exit(1);
    }

    api.messages[messageName] = {
      send: [],
      receive: [],
      hasPayload: message.hasPayload(),
      schema: message.hasPayload() ? message.payload().id() : undefined
    }
  });

  // classify message-based send/receive contexts
  Object.keys(sendChannels).forEach((topic:any) => {
    let channel = sendChannels[topic];
    Object.keys(channel.messages).forEach((messageName:any) => {
      api.messages[messageName].send.push({
        topicName: channel.address,
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
        topicName: channel.address,
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
  api.view = reverse ? 'receiver' : 'sender';
  return api;
}

const analyzeV2 = async (document: AsyncAPIDocumentInterface, reverse:boolean = false) => {
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
    version: undefined,
    fileName: undefined
  };

  // extract topics
  _channels.forEach((channel:Channel) => {
    let operations:any = channel.operations();
    let sendOps:any = reverse ?
                          Array.from(operations).filter((o:any) => !o.isSend()) :
                          Array.from(operations).filter((o:any) => o.isSend());
    if (sendOps.length) {
      if (!channel.address() || !validateTopic(channel.address())) {
        Logger.error(`Invalid topic: ${channel.address()}`);
        Logger.error('exiting...');
        process.exit(1);
      }

      sendChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
      }
    }

    let receiveOps = reverse ?
                        Array.from(operations).filter((o:any) => !o.isReceive()) :
                        Array.from(operations).filter((o:any) => o.isReceive());
    if (receiveOps.length) {
      receiveChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
      }
    }
  });

  // extract schemas 
  _schemas.forEach((schema:any) => {
    validateSchema(schema.json())
    let id = schema.id();
    api.schemas[id] = schema.json();
  });

  // extract servers 
  _servers.forEach((server:any) => {
    api.servers[server.id()] = server.json()
  });
  
  // extract messages
  _messages.forEach((message:any) => {
    let key = message.id() ? message.id() : message.name();
    api.messages[key] = {
      send: [],
      receive: [],
      hasPayload: message.hasPayload(),
      schema: message.hasPayload() ? message.payload().id() : undefined
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
  api.view = reverse ? 'receiver' : 'sender';
  return api;
}

const analyzeEP = async (document: AsyncAPIDocumentInterface, reverse:boolean = false) => {
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
    version: undefined,
    fileName: undefined
  };

  // extract topics
  _channels.forEach((channel:Channel) => {
    let operations:any = channel.operations();
    let sendOps:any = reverse ? 
                        Array.from(operations).filter((o:any) => !o.isSend()) :
                        Array.from(operations).filter((o:any) => o.isSend());
    if (sendOps.length) {
      if (!channel.address() || !validateTopic(channel.address())) {
        Logger.error(`Invalid topic: ${channel.address()}`);
        Logger.error('exiting...');
        process.exit(1);
      }

      sendChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
      }
    }

    let receiveOps = reverse ?
                        Array.from(operations).filter((o:any) => !o.isReceive()) :
                        Array.from(operations).filter((o:any) => o.isReceive());
    if (receiveOps.length) {
      receiveChannels[channel.id()] = {
        address: channel.address(),
        description: channel.description(),
        bindings: getChannelBindings(channel),
        messages: getChannelMessages(channel),
        parameters: getChannelParameters(channel),
        servers: getChannelServers(channel),
      }
    }
  });

  // extract schemas 
  _schemas.forEach((schema:any) => {
    validateSchema(schema.json())
    let id = schema.id();
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
      schema: message.hasPayload() ? message.payload().id() : undefined
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
  api.view = reverse ? 'receiver' : 'sender';
  return api;
}

const formulateRules = (document:AsyncAPIDocumentInterface|undefined, reverse:boolean = false) => {
  var ruleSet:any = [];

  const checkHasPayload = (message:any) => {
    if (!message?.hasPayload())
      return false;

    let obj = message?.payload()?.json();
    let keys = Object.keys(obj).filter((k:any) => !k.startsWith('x-'));
    return keys.length > 0;
  };

  let _info = document?.info();

  document?.operations().forEach((_operation) => {
    let consideration = reverse ? _operation.isReceive() : _operation.isSend();
    if (consideration) {
      let _channels = _operation.channels();
      let _messages = _operation.messages();

      _channels.forEach((channel:any) => {
        Array.from(_messages).map((message:any) => {
          let messageName = message.id() ? message.id() : message.name();
          messageName = messageName ? messageName : message.extensions().get('x-parser-message-name')?.json();
          if (!messageName) {
            Logger.error('Unable to extract message name');
            Logger.error('exiting...');
            process.exit(1);
          }
            
          let hasPayload = checkHasPayload(message);
          let fixedUpPayload = hasPayload ? 
                                    fixUpMessageApplicators(message?.payload()?.json()) : 
                                    undefined;
          let plainJson = hasPayload ? checkIfPlainJson(message.schemaFormat()) : false;
          if (plainJson) {
            fixedUpPayload = fixUpJsonPayload(fixedUpPayload, fixedUpPayload);
          }

          let rule = {
            topic: channel.address(),
            topicParameters: getChannelParameters(channel),
            eventName: message.extensions().get('x-ep-event-name') ? 
                          message.extensions().get('x-ep-event-name')?.json() :
                          messageName,
            eventVersion: message.extensions().get('x-ep-event-version') ?
                            message.extensions().get('x-ep-event-version')?.json() :
                            _info?.version() || '1.0.0',
            messageName: messageName,
            hasPayload: hasPayload,
            payload: fixedUpPayload,
            publishSettings:{
              count: 0,
              interval: 1000,
              delay: 0
            }
          }
          ruleSet.push(rule);
        })
      })
    }
  })

  removeMetaParams(ruleSet);
  ruleSet.forEach((rule:any) => {
    setDefaultTopicVariableRules(rule.topicParameters);
  })
  setDefaultPayloadRules(ruleSet);

  return ruleSet;
}

const formulateSchemas = (document:AsyncAPIDocumentInterface|undefined) => {
  var schemaSet:any = [];

  document?.schemas().forEach((_schema) => {
    schemaSet[_schema.id()] = _schema.json();
  })

  removeMetaParams(schemaSet);
  return schemaSet;  
}


export { load, analyze, analyzeV2, analyzeEP, formulateRules, formulateSchemas }