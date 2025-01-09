import { Logger } from '../utils/logger';
import { processAirlineRules, processBaseObjectRules, processBooleanRules, processCommerceRules, processDateRules, 
        processFinanceRules, processInternetRules, processLocationRules, processLoremRules, processNullRules, 
        processNumberRules, processObjectRules, processPersonRules, processStringRules,
      } from './feed-datarules';

function getSourceFieldValue (obj:any, path:string):any {
  if (path.indexOf('.') < 0)
    return obj[path];

  let field = path.substring(0, path.indexOf('.'));
  let fieldName = field.replaceAll('[0]', '');
  var remaining = path.substring(path.indexOf('.')+1);
  return getSourceFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining);
}
        
function setTargetFieldValue(obj:any, path:string, value:any) {
  var tokens = path.split('.');
  if (tokens.length <= 1) {
    if (Array.isArray(obj)) {
      obj.forEach(aObj => {
        if (aObj.hasOwnProperty(path))
          aObj[path] = value;
        else
        setTargetFieldValue(aObj, path, value);
      })
    } else {
      obj[path] = value;
    }
    return;
  }

  let field = path.substring(0, path.indexOf('.'));
  let fieldName = field.replaceAll('[0]', '');
  var remaining = path.substring(path.indexOf('.')+1);
  setTargetFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining, value);
}

export function getField (obj:any, path:string):any {
  var tokens = path.split('.');
  if (tokens.length <= 1)
    return obj;

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  return getField(obj[field], remaining);
}

const fakeEventGenerator = async (data:any) => {
  var backwardCompatibility = typeof data?.rule?.hasPayload === 'undefined' ? true : false;
  var payloads = backwardCompatibility || data?.rule?.hasPayload  ? 
                    fakeDataObjectGenerator({ payload: data.rule.payload, count: data.count}) : 
                    Array(data.count).fill({});
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
    var topicParams:any = {};
    var keys = Object.keys(data.rule.topicParameters);
    for (var kl=0; kl<keys.length; kl++) {
      let value = fakeDataValueGenerator({ rule: data.rule.topicParameters[keys[kl]].rule, count: 1});
      topicParams[keys[kl]] = value ? value : '';
    }
    
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
        var sourceVal:any = undefined;
        var target:any = undefined;

        if (mapping.source.type === 'Payload Parameter') {
          let sourceName = mapping.source.name.replaceAll('.properties', '').replaceAll('[]', '');
          sourceVal = getSourceFieldValue(payload, sourceName);
        } else {
          sourceVal = topicValues[`_${mapping.source.name}`];
        }

        if (mapping.target.type === 'Payload Parameter') {
          let targetName = mapping.target.name.replaceAll('.properties', '').replaceAll('[]', '');
          setTargetFieldValue(payload, targetName, sourceVal);
        } else {
          target = topicParams[mapping.target.name];          
          for (var k=0; k<keys.length; k++) {
            if (keys[k] === mapping.target.name) {
              if (mappedTopicParams.includes(keys[k]))
                topic = topic.replace(`{${keys[k]}}`, sourceVal);
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
  if (data.payload.type === 'array') {
    if (data.payload.subType === 'object')
      fakeObjects = processObjectRules(data.payload.properties, count);
    else {
      // need to test
      // fakeObjects = Array(count).fill(fakeDataValueGenerator({ rule: data.payload, count: 1}));
    }
  } else if (!data.payload?.schema && (typeof data.payload?.type === 'object' || 
             data.payload?.type === 'object' || !data.payload?.type)) {
    fakeObjects = processObjectRules(data.payload, count);
  } else if (data.payload?.schema) {
    fakeObjects = processBaseObjectRules(data.payload.schema, count);
  } else {
    fakeObjects = processBaseObjectRules(data.payload, count);
  }

  return fakeObjects
}

const fakeDataValueGenerator = (data:any) => {
  var fakeData: any[] | any = [];
  var count = data.count ? data.count : 1;
  if (!data || !data.rule || !data.rule.group) {
    console.log('here');
    return;
  }
  
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
  else if (data.rule.group === 'InternetRules')
    fakeData = processInternetRules(data.rule, count);
  else {
    Logger.error("Unknown rules group: " + JSON.stringify(data.rule, null, 2));
    throw new Error("Unknown rules group");
  }
  return fakeData;
}

export { fakeDataValueGenerator, fakeDataObjectGenerator, fakeEventGenerator };
