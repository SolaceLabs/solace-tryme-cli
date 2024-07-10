import { processAirlineRules, processBooleanRules, processCommerceRules, processDateRules, 
        processFinanceRules, processLocationRules, processLoremRules, processNullRules, 
        processNumberRules, processObjectRules, processPersonRules, processStringRules } from './feed-datarules';

function getFieldValue (obj:any, path:string):any {
  if (path.indexOf('.') < 0)
    return obj[path];

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  return getFieldValue(obj[field], remaining);
}
        
function setFieldValue(obj:any, path:string, value:any) {
  var tokens = path.split('.');
  if (tokens.length <= 1) {
    if (Array.isArray(obj)) {
      obj.forEach(aObj => {
        if (aObj.hasOwnProperty(path))
          aObj[path] = value;
        else
          setFieldValue(aObj, path, value);
      })
    } else {
      obj[path] = value;
    }
    return;
  }

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  setFieldValue(obj[field], remaining, value);
}

function getNestedField(obj:any, path:string) {
  var tokens = path.split('.');
  if (tokens.length <= 1)
    return obj;

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  var nestedField = obj[field];
  if (Array.isArray(nestedField)) {
    var elements:any = [];
    nestedField.forEach((el:any) => {
      elements = elements.concat(getNestedField(el, remaining));
    })
    return elements;
  }

  return getField(obj[field], remaining);
}

export function getField (obj:any, path:string):any {
  var tokens = path.split('.');
  if (tokens.length <= 1)
    return obj;

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  return getField(obj[field], remaining);
}
        
function getObjectKeys(obj:any, path:string):any {
  var tokens = path.split('.');
  if (tokens.length <= 1)
    return typeof obj === 'object' ? Object.keys(obj) : path;

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  return getObjectKeys(obj[field], remaining);

}

const fakeEventGenerator = async (data:any) => {
  var topicParams:any = {};
  var keys = Object.keys(data.rule.topicParameters);
  for (var i=0; i<keys.length; i++) {
    topicParams[keys[i]] = fakeDataValueGenerator({ rule: data.rule.topicParameters[keys[i]].rule, count: data.count});
  }

  var payloads = fakeDataObjectGenerator({ payload: data.rule.payload, count: data.count});
  var fakeData = [];
  var mappedTopicParams:any = [];
  if (data.rule.mappings && data.rule.mappings.length) {
    for (var j=0; j<data.rule.mappings.length; j++) {
      if (data.rule.mappings[j].target.type === 'Topic Parameter') {
        mappedTopicParams.includes(data.rule.mappings[j].target.fieldName) ? 
          mappedTopicParams : mappedTopicParams.push(data.rule.mappings[j].target.fieldName)
      }
    }
  }

  for (var i=0; i<data.count; i++) {
    var topic = data.rule.topic;
    var topicValues:any = {};
    for (var j=0; j<keys.length; j++) {
      if (!mappedTopicParams.includes(keys[j]))
      topic = topic.replace(`{${keys[j]}}`, topicParams[keys[j]]);
      topicValues[`_${keys[j]}`] = topicParams[keys[j]];
    }
    var payload = data.count > 1 ? payloads[i] : payloads;

    // apply mapping
    if (data.rule.mappings && data.rule.mappings.length) {
      for (var j=0; j<data.rule.mappings.length; j++) {
        var mapping = data.rule.mappings[j];
        var source:any = undefined;
        var target:any = undefined;

        if (mapping.source.type === 'Payload Parameter') {
          let sourceName = mapping.source.name.replaceAll('.properties', '').replaceAll('[]', '');
          if (mapping.source.fieldType === 'object')
            source = getField(payload, sourceName);
          else
            source = getFieldValue(payload, sourceName);
        } else
          
        if (mapping.target.type === 'Payload Parameter') {
          let targetName = mapping.target.name.replaceAll('.properties', '').replaceAll('[]', '');
          // target = getField(payload, targetName);
          // if (!target)
            target = getNestedField(payload, targetName);

          // src [obj] -> target [obj]
          if (mapping.target.fieldType === 'object') {
            // src [obj] -> target [array of obj]
            if (Array.isArray(target)) {
              target.forEach(tObj => {
                Object.keys(tObj).forEach(key => {
                  if (tObj.hasOwnProperty(key) && mapping.target.fieldName === key)
                    tObj[mapping.target.fieldName] = typeof source[mapping.source.fieldName]  === 'object' ?
                                                      { ...source[mapping.source.fieldName] } : source[mapping.source.fieldName];
                })  
              })
            } else {
              // src [obj] -> target [obj]
              let targetKeys = getObjectKeys(payload, targetName);
              targetKeys.forEach((key:string) => {
                if (source.hasOwnProperty(mapping.source.fieldName) && mapping.target.fieldName === key) {
                  target[mapping.target.fieldName] = typeof source[mapping.source.fieldName]  === 'object' ?
                                                        { ...source[mapping.source.fieldName] } : source[mapping.source.fieldName];
                }
              })
            }
          } else {
            // src [field] -> target [field]
            if (Array.isArray(target)) {
              target.forEach(tObj => {
                Object.keys(tObj).forEach(key => {
                  if (tObj.hasOwnProperty(mapping.target.fieldName) && mapping.target.fieldName === key)
                    tObj[mapping.target.fieldName] = source;
                })  
              })
            } else {
              setFieldValue(payload, targetName, source);
            }
          }
        } else {
          target = topicParams[mapping.target.name];          
          for (var k=0; k<keys.length; k++) {
            if (keys[k] === mapping.target.name) {
              if (mappedTopicParams.includes(keys[k]))
                topic = topic.replace(`{${keys[k]}}`, source);
              else
                topic = topic.replace(`{${keys[k]}}`, topicParams[keys[k]][i]);
            }
          }
        }
      }
    }

    fakeData.push({
      topic,
      payload
    })
  }

  return fakeData;
}

const fakeDataObjectGenerator = (data:any) => {
  var fakeObjects: any[] | any = [];
  var count = data.count ? data.count : 1;
  if (data.payload)
    fakeObjects = processObjectRules(data.payload, count);
  else
    fakeObjects = Array(count).fill({});

  return fakeObjects
}

const fakeDataValueGenerator = (data:any) => {
  var fakeData: any[] | any = [];
  var count = data.count ? data.count : 1;
  if (data.rule.group === 'StringRules')
    fakeData = processStringRules(data.rule, count);
  else if (data.rule.group === 'NullRules')
    fakeData = processNullRules(data.rule, count);
  else if (data.rule.group === 'NumberRules')
    fakeData = processNumberRules(data.rule, count);
  else if (data.rule.group === 'BooleanRules')
    fakeData = processBooleanRules(data.rule, count);
  else if (data.rule.group === 'DateRules')
    fakeData = processDateRules(data.rule, count);
  else if (data.rule.group === 'LoremRules')
    fakeData = processLoremRules(data.rule, count);
  else if (data.rule.group === 'PersonRules')
    fakeData = processPersonRules(data.rule, count);
  else if (data.rule.group === 'LocationRules')
    fakeData = processLocationRules(data.rule, count);
  else if (data.rule.group === 'FinanceRules')
    fakeData = processFinanceRules(data.rule, count);
  else if (data.rule.group === 'AirlineRules')
    fakeData = processAirlineRules(data.rule, count);
  else if (data.rule.group === 'CommerceRules')
    fakeData = processCommerceRules(data.rule, count);
  else throw new Error("Unknown rules group");

  return fakeData;
}

export { fakeDataValueGenerator, fakeDataObjectGenerator, fakeEventGenerator, getFieldValue };
