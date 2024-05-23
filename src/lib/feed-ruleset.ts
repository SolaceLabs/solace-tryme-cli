const removeMetaParams = (obj: any) => {
  for(const prop in obj) {
    if (prop.startsWith('x-'))
      delete obj[prop];
    else if (typeof obj[prop] === 'object')
      removeMetaParams(obj[prop]);
  }
}

const setDefaultTopicVariableRules = (obj: any) => {
  for(const prop in obj) {
    var schema = obj[prop].schema;
    if (schema.type.toLowerCase() === 'string') {
      if (schema.enum) {
        obj[prop].rule = { name: prop, type: 'string', group: 'StringRules', rule: 'enum', enum: schema.enum }
      } else {
        obj[prop].rule = { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
      }
    } else if (schema.type.toLowerCase() === 'number') {
      obj[prop].rule = { name: prop, type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
    } else if (schema.type.toLowerCase() === 'integer') {        
      obj[prop].rule = { name: prop, type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
    } else if (schema.type.toLowerCase() === 'boolean') {        
      obj[prop].rule = { name: prop, type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
    } else if (schema.type.toLowerCase() === 'null') {        
      obj[prop].rule = { name: prop, type: 'null', group: 'NullRules', rule: 'null' }
    } else {
      obj[prop].rule = { name: prop, type: schema.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    }
  }
}

const setDefaultSchemaRules = (msgs: any) => {
  msgs.forEach((msg:any) => {
    var payload = msg.payload;
    if (!payload) return;

    processPayload(msg);
  });
}

const processPayload = (msg: any) => {
  var payload = msg.payload;
  payload = payload ? payload : msg.properties;
  if (!payload) return;

  for(const prop in payload) {
    if (payload[prop].type === 'object') {
      payload[prop].rule = { name: prop, type: 'object'};
      if (payload[prop].properties) 
        processPayload(payload[prop])
      continue;
    }

    if (payload[prop].type === 'array') {
      payload[prop].subType = payload[prop].items.type;
      payload[prop].name = prop;
      if (payload[prop].items.type === 'string') {
        payload[prop].rule = { name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
        delete payload[prop].items;
      } else if (payload[prop].items.type === 'object') {
        payload[prop].properties = payload[prop].items.properties;
        payload[prop].rule = { name: prop, type: 'object'};
        if (payload[prop].properties) 
          processPayload(payload[prop])
        delete payload[prop].items;
      }
      continue;
    }

    var schema = payload[prop];
    if (schema.type.toLowerCase() === 'string') {
      if (schema.enum) {
        payload[prop].rule = { ...payload[prop], name: prop, type: 'string', group: 'StringRules', rule: 'enum', enum: schema.enum.join(',') }
      } else {
        payload[prop].rule = { ...payload[prop], name: prop, type: 'string', group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
      }
    } else if (schema.type.toLowerCase() === 'number') {
      payload[prop].rule = { ...payload[prop], name: prop, type: 'number', group: 'NumberRules', rule: 'float', minimum: 0, maximum: 1000, fractionDigits: 2 }
    } else if (schema.type.toLowerCase() === 'integer') {        
      payload[prop].rule = { ...payload[prop], name: prop, type: 'integer', group: 'NumberRules', rule: 'int', minimum: 0, maximum: 1000 }
    } else if (schema.type.toLowerCase() === 'boolean') {        
      payload[prop].rule = { ...payload[prop], name: prop, type: 'boolean', group: 'BooleanRules', rule: 'boolean' }
    } else if (schema.type.toLowerCase() === 'null') {        
      payload[prop].rule = { ...payload[prop], name: prop, type: 'null', group: 'NullRules', rule: 'null' }
    } else {
      payload[prop].rule = { ...payload[prop], name: prop, type: schema.type, group: 'StringRules', rule: 'alpha', casing: 'mixed', minLength: 10, maxLength: 10 }
    }
  }
}

const formulateRules = async (data: any) => {
  var ruleSet:any = [];
  var msgNames = Object.keys(data.messages);
  msgNames.forEach((msgName) => {    
    var message = data.messages[msgName];
    if (message.send.length) {
      message.send.forEach((send: any) => {
        var topic:any = {};
        topic.topic = send.topicName;
        topic.eventName = send.message['x-ep-event-name'];
        topic.eventVersion = send.message['x-ep-event-version'];
        topic.messageName = msgName;
        topic.topicParameters = send.topicParameters;
        if (message.hasPayload) {
          topic.payload = send.message.payload.properties;
        }
        topic.publishSettings = {
          count: 20,
          interval: 1,
          delay: 0
        }
        ruleSet.push(topic);
      })
    }
  })

  removeMetaParams(ruleSet);
  ruleSet.forEach((rule:any) => setDefaultTopicVariableRules(rule.topicParameters))
  setDefaultSchemaRules(ruleSet);
  return ruleSet;
}

const formulateSchemas = async (data: any) => {
  var schemaSet:any = [];
  var msgNames = Object.keys(data.messages);
  msgNames.forEach((msgName) => {    
    var message = data.messages[msgName];
    if (message.receive.length) {
      message.receive.forEach((receive: any) => {
        var schema:any = {};
        schema.topic = receive.topicName;
        schema.eventName = receive.message['x-ep-event-name'];
        schema.eventVersion = receive.message['x-ep-event-version'];
        schema.messageName = msgName;
        schema.topicParameters = receive.topicParameters;
        if (message.hasPayload) {
          schema.payload = receive.message.payload.properties;
        }
        schema.consumers = receive.consumers ? Object.values(receive.consumers) : undefined;
        schemaSet.push(schema);
      })
    }
  })

  removeMetaParams(schemaSet);
  return schemaSet;
}


export { formulateRules, formulateSchemas }
