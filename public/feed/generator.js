async function generateEvents(rule, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(rule, count);
  const response = await fetch(path + `/fakeevent`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ rule, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  console.log(result);
  return result;
}

async function generateRuleBasedValue(rule, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(rule, count);
  const response = await fetch(path + `/fakedata`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ rule, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  // console.log(result);
  return result;
}

async function generateRuleBasedPayload(payload, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(payload, count);
  const response = await fetch(path + `/fakepayload`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ payload, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  // console.log(result);
  return result;
}

async function generateApiEvents(feed, count) {
  var events = [];
  var apiUrl = feed.config.apiUrl;
  var apiKey = feed.config.apiKey;
  if (feed.config.apiKeyUrlEmbedded) 
    apiUrl = apiUrl.replaceAll(`$${feed.config.apiKeyUrlParam}`, apiKey);

  var rules = feed.rules.rules;
  var params = Object.keys(rules);
  var ruleData = {};
  if (params.length > 0) {
    for (var i=0; i<params.length; i++) {
      ruleData[params[i]] = await generateRuleBasedValue(rules[params[i]].rule, count);
    }
  }

  for (var i=0; i<count; i++) {
    var topic = feed.config.topic;
    var payload = {};

    var headers = { Accept: 'application/json' };
    if (!feed.config.apiKeyUrlEmbedded && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      var url = apiUrl;
      for (var j=0; j<params.length; j++) {
        url = url.replaceAll(`$${params[j]}`, ruleData[params[j]][i]);
        topic = topic.replaceAll(`{${params[j]}}`, ruleData[params[j]][i]);
      }
      payload = await (await fetch(`${url}`, {
        headers: headers
      })).json();
      console.log(payload);
    } catch (error) {
      payload = { error: `fetch from api endpoint list failed with error - ${error.toString()}` };
    }

    events.push({ topic, payload });
  }

  return events;
}