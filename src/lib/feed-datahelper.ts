import { Logger } from '../utils/logger';
import { processAirlineRules, processBaseObjectRules, processBooleanRules, processCommerceRules, processDateRules, 
        processFinanceRules, processInternetRules, processLocationRules, processLoremRules, processNullRules, 
        processNumberRules, processObjectRules, processPersonRules, processStringRules,
      } from './feed-datarules';

function getSourceFieldValue (obj:any, path:string):any {
  if (path.indexOf('.') < 0)
    return obj[path];

  const field = path.substring(0, path.indexOf('.'));
  const fieldName = field.replaceAll('[0]', '');
  const remaining = path.substring(path.indexOf('.')+1);
  return getSourceFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining);
}
        
function setTargetFieldValue(obj:any, path:string, value:any) {
  const tokens = path.split('.');
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

  const field = path.substring(0, path.indexOf('.'));
  const fieldName = field.replaceAll('[0]', '');
  const remaining = path.substring(path.indexOf('.')+1);
  setTargetFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining, value);
}

export function getField (obj:any, path:string):any {
  const tokens = path.split('.');
  if (tokens.length <= 1)
    return obj;

  const field = path.substring(0, path.indexOf('.'));
  const remaining = path.substring(path.indexOf('.')+1);
  return getField(obj[field], remaining);
}

const fakeEventGenerator = async (data:any) => {
  const backwardCompatibility = typeof data?.rule?.hasPayload === 'undefined' ? true : false;
  const payloads = backwardCompatibility || data?.rule?.hasPayload  ? 
                    fakeDataObjectGenerator({ payload: data.rule.payload, count: data.count}) : 
                    Array(data.count).fill({});
  const fakeData = [];
  const mappedTopicParams:any = [];
  if (data.rule.mappings && data.rule.mappings.length) {
    for (var j=0; j<data.rule.mappings.length; j++) {
      if (data.rule.mappings[j].target.type === 'Topic Parameter') {
        mappedTopicParams.includes(data.rule.mappings[j].target.fieldName) ? 
          mappedTopicParams : mappedTopicParams.push(data.rule.mappings[j].target.fieldName)
      }
    }
  }

  for (let i=0; i<data.count; i++) {
    const topicParams:any = {};
    const keys = Object.keys(data.rule.topicParameters);
    for (let kl=0; kl<keys.length; kl++) {
      const value = fakeDataValueGenerator({ rule: data.rule.topicParameters[keys[kl]].rule, count: 1});
      topicParams[keys[kl]] = value ? value : '';
    }
    
    let topic = data.rule.topic;
    const topicValues:any = {};
    for (var j=0; j<keys.length; j++) {
      if (!mappedTopicParams.includes(keys[j]))
      topic = topic.replace(`{${keys[j]}}`, topicParams[keys[j]]);
      topicValues[`_${keys[j]}`] = topicParams[keys[j]];
    }
    const payload = data.count > 1 ? payloads[i] : payloads;

    // apply mapping
    if (data.rule.mappings && data.rule.mappings.length) {
      for (var j=0; j<data.rule.mappings.length; j++) {
        const mapping = data.rule.mappings[j];
        let sourceVal:any = undefined;
        let target:any = undefined;

        if (mapping.source.type === 'Payload Parameter') {
          const sourceName = mapping.source.name.replaceAll('.properties', '').replaceAll('[]', '');
          sourceVal = getSourceFieldValue(payload, sourceName);
        } else {
          sourceVal = topicValues[`_${mapping.source.name}`];
        }

        if (mapping.target.type === 'Payload Parameter') {
          const targetName = mapping.target.name.replaceAll('.properties', '').replaceAll('[]', '');
          setTargetFieldValue(payload, targetName, sourceVal);
        } else {
          target = topicParams[mapping.target.name];          
          for (let k=0; k<keys.length; k++) {
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
  let fakeObjects: any[] | any = [];
  const count = data.count ? data.count : 1;
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
  let fakeData: any[] | any = [];
  const count = data.count ? data.count : 1;
  if (!data || !data.rule || !data.rule.group) {
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
