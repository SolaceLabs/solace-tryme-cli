// FEEDS PAGE
const loaded = {
  rulesForm: false,
  mapsForm: false,
}

function resetFeeds() {
  var parent = document.getElementById('feeds-list');
  if (parent) parent.innerHTML = '';
}

function addFeed(feed) {
  var parent = document.getElementById('feeds-list');
  if (!parent) return;

  var config = feed.config;
  var feedTpl = ``;
  if (feed.type === 'asyncapi_feed') {
    feedTpl = `
      <div  class='card card-primary card-outline card-tile'>
        <div class='card-tile-header card-header'>
          <h5 style='padding-right: 10px;' class='card-header-title m-0'>${feed.name}</h5>
          ${feed.invalid && feed.invalid.startsWith('info') ?
            `<i class="fa fa-exclamation-triangle fa-lg card-header-button" style="text-align: center;color: #ffcc00" aria-hidden="true"></i>` :
            `<a href='#' id='${feed.name}' data-feedtype='${feed.type}' data-feedname='${feed.name}' class="btn btn-primary card-header-button" onclick="explore(this)">Explore</a>`}
        </div>
        <div style='height: 220px' class='card-body'>
          <h5 class='card-title' style='padding-bottom: 10px;'>AsyncAPI Document: <span class='card-body-title'>${config.fileName}</span></h5>
          <h3 class='card-title' style='width: 100%;'>Title: <span style='font-style: unset;' class='card-body-title'>${config.info.title ? config.info.title : 'N/A'}</span></h3>
          <h3 class='card-title'>Description: <span style='font-style: unset;' class='card-body-title'>${config.info.description ? config.info.description : 'N/A'}</span></h3>
          ${feed.invalid ?  `<h6 class='card-title'style="color: red; padding-top: 20px;">${feed.invalid}</h6>` : ``}
        </div>
      </div>
    `;
  } else if (feed.type === 'restapi_feed') {
    feedTpl = `
      <div  class='card card-primary card-outline card-tile'>
        <div class='card-tile-header card-header'>
          <h5 style='padding-right: 10px;' class='card-header-title m-0'>${feed.name}</h5>
          ${feed.invalid ?
            `<i class="fa fa-exclamation-triangle fa-lg card-header-button" style="text-align: center;color: #ffcc00" aria-hidden="true"></i>` :
            `<a href='#' id='${feed.name}' data-feedtype='${feed.type}' data-feedname='${feed.name}' class="btn btn-primary card-header-button" onclick="explore(this)">Explore</a>`}
        </div>
        <div style='height: 220px' class='card-body'>
          ${config.apiUrl ?
            `<h5 class='card-title' style='padding-bottom: 10px;'>API Endpoint: <span class='card-body-title'>${config.apiUrl}</span></h5>` : ''}
          <h3 class='card-title' style='width: 100%;'>Title: <span style='font-style: unset;' class='card-body-title'>${feed.info.name ? feed.info.name : 'N/A'}</span></h3>
          <h3 class='card-title'>Description: <span style='font-style: unset;' class='card-body-title'>${feed.info.description ? feed.info.description : 'N/A'}</span></h3>
          ${feed.invalid ?  `<h6 class='card-title'style="color: ${feed.invalid.startsWith('info') ? 'green' : 'red'}; padding-top: 20px;">${feed.invalid}</h6>` : ``}
          </div>
      </div>
    `;
  } else if (feed.type === 'custom_feed') {

  }

  var el = document.createElement('div');
  el.classList.add('col-lg-4');
  el.innerHTML = feedTpl;

  parent.appendChild(el);
}

function loadBroker(feed, page) {
  if (!feed.brokers || !feed.brokers.length) {
    console.log(`No brokers found on the feed`);
    return;
  }

  var brokerName = page.split('#').pop();
  if (!brokerName) {
    console.log(`Missing broker name in URL`);
    return;
  }
  brokerName = decodeURIComponent(brokerName);

  var broker = feed.brokers.find(b => b.broker === `${brokerName}.json`);
  if (!broker) {
    console.log(`${brokerName} broker not found`);
    return;
  }

  var el = document.getElementById('feed-info-filename');
  if (el) el.innerHTML = feed.fileName;

  el = document.getElementById('broker-feed-name');
  if (el) el.innerHTML = brokerName;
  el = document.getElementById('broker-name');
  if (el) el.innerHTML = brokerName;

  var parent = document.getElementById('connection_details');
  var el = undefined;
  if (parent) {
    if (broker.config && broker.config.url) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Broker URL</td><td>${broker.config.url}</td>`;
      parent.appendChild(el);
    }
    if (broker.config && broker.config.vpn) {
      el = document.createElement('tr');
      el.innerHTML = `<td>VPN</td><td>${broker.config.vpn}</td>`;
      parent.appendChild(el);
    }
    if (broker.config && broker.config.username) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Username</td><td>${broker.config.username}</td>`;
      parent.appendChild(el);
    }
    if (broker.config && broker.config.password) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Username</td><td>*******</td>`;
      parent.appendChild(el);
    }
  } 

  return brokerName;
}

function loadSchema(feed, page) {
  var config = feed.config;
  if (!config.schemas || !Object.keys(config.schemas).length) {
    console.log(`No schemas found on the feed`);
    return;
  }

  var schemaName = window.location.href.split('#').pop();
  if (!schemaName) {
    console.log(`Missing schema name in URL`);
    return;
  }
  schemaName = decodeURIComponent(schemaName);

  var schema = config.schemas[schemaName];
  if (!schema) {
    console.log(`${schemaName} schema not found`);
    return;
  }

  var el = document.getElementById('feed-info-filename');
  if (el) el.innerHTML = feed.fileName;

  el = document.getElementById('schema-feed-name');
  if (el) el.innerHTML = schemaName;
  el = document.getElementById('schema-name');
  if (el) el.innerHTML = schemaName;

  var parent = document.getElementById('standard_attributes');
  var el = undefined;
  if (parent) {
    if (schema.title) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Title</td><td>${schema.title}</td>`;
      parent.appendChild(el);
    }
    if (schema.type) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Type</td><td>${schema.type}</td>`;
      parent.appendChild(el);
    }
  } 

  parent = document.getElementById('custom_attributes');
  el = undefined;
  if (parent) {
    Object.keys(schema).forEach(key => {
      if (key.startsWith('x-')) {
        el = document.createElement('tr');
        el.innerHTML = `<td>${key}</td><td>${schema[key]}</td>`;
        parent.appendChild(el);
      }
    })
  } 

  schema && Object.keys(schema).forEach(prop => {
    prop.startsWith('x-') && delete schema[prop];
  });
  parent = document.getElementById('schema_definition');
  el = document.createElement('pre');
  el.innerHTML = `<code>${prettyPrint(schema)}</code>`;
  parent.appendChild(el);

  $('#copyToClipboard').click(async function writeDataToClipboard () {
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    toastr.success('Copied to clipboard.')
  });

  return schemaName;
}

function addSchemas(config) {
  if (!config.schemas || !Object.keys(config.schemas).length)
    return;

  var schemas = config.schemas;
  var parent = document.getElementById('sidebar-schema');
  if (!parent) return;

  var schemaNames = Object.keys(schemas); 
  for (var i=0; i<schemaNames.length; i++) {
    var schemaTpl = `
      <a id="m_${decodeURIComponent(schemaNames[i])}" href="schema.html#${schemaNames[i]}" class="nav-link" style="display: flex; align-items: center;" 
        onclick="window.location.href='schema.html#${schemaNames[i]}'; window.location.reload();">
        <i class="nav-icon"><img width=24 src="images/schinstance.png"/></i>
        <p style="margin-left: 8px;word-break: break-word;">${schemaNames[i].trim()}</p>
      </a>
    `;

    var el = document.createElement('li');
    el.classList.add('nav-item');
    el.classList.add('nav-item-child');
    el.innerHTML = schemaTpl;
  
    parent.appendChild(el);
  }
}

function loadMessage(feed, page) {
  var config = feed.config;
  if (!config.messages || !Object.keys(config.messages).length) {
    console.log(`No messages found on the feed`);
    return;
  }

  var messageName = window.location.href.split('#').pop();
  if (!messageName) {
    console.log(`Missing message name in URL`);
    return;
  }
  messageName = decodeURIComponent(messageName);

  var message = config.messages[messageName];
  if (!message) {
    console.log(`${messageName} message not found`);
    return;
  }

  var el = document.getElementById('feed-info-filename');
  if (el) el.innerHTML = feed.fileName;

  configureMessageInfo(messageName, message, config);
  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  configureMessageSendTopics(messageName, feed.rules, ruleIndex, true);
  configureMessageReceiveTopics(messageName, feed.rules, ruleIndex, true);

  return messageName;
}

function configureMessageInfo(messageName, message, config) {
  el = document.getElementById('message-feed-name');
  if (el) el.innerHTML = messageName;
  el = document.getElementById('message-name');
  if (el) el.innerHTML = fixAnonNames(messageName);
  el = document.getElementById('schema-name');
  if (el) el.innerHTML = message.schema ? fixAnonNames(message.schema) : 'N/A';

  value = 'N/A';
  if (config && config.messages) {
    value = config.messages[messageName].send ? config.messages[messageName].send.length : 0;
    var ptl = document.getElementById('send_topics');
    config.messages[messageName].send && config.messages[messageName].send.forEach(send => {
      var tl = document.createElement('tr');
      tl.innerHTML = `<td style="word-break: break-word;">${send.topicName}</td>`;
      ptl.appendChild(tl);
    })
    if (!value) {
      var tl = document.createElement('tr');
      tl.innerHTML = `<td></td>`;
      ptl.appendChild(tl);      
    }
  } 
  el = document.getElementById('send-topics-count');
  if (el) el.innerHTML = value;
  if (!value) $('#message-tabs-stopics-tab').remove();

  value = 'N/A';
  if (config && config.messages) {
    value = config.messages[messageName].receive ? config.messages[messageName].receive.length : 0;
    var ptl = document.getElementById('receive_topics');
    config.messages[messageName].receive && config.messages[messageName].receive.forEach(receive => {
      var tl = document.createElement('tr');
      tl.innerHTML = `<td style="word-break: break-word;">${receive.topicName}</td>`;
      ptl.appendChild(tl);
    })
  } 
  if (!value) {
    var tl = document.createElement('tr');
    tl.innerHTML = `<td></td>`;
    ptl.appendChild(tl);      
  }

  el = document.getElementById('receive-topics-count');
  if (el) el.innerHTML = value;  
  if (!value) $('#message-tabs-rtopics-tab').remove();

  value = 'N/A';
  if (config && config.messages) {
    var consumerCount = 0;
    var ptl = document.getElementById('consumers');
    config.messages[messageName].receive.forEach(receive => {
      consumerCount += receive.consumers ? Object.keys(receive.consumers).length : 0;
      receive.consumers && Object.keys(receive.consumers).forEach(consumerName => {
        var tl = document.createElement('tr');
        tl.innerHTML = `<td style="word-break: break-word;">${consumerName}</td>`;
        ptl.appendChild(tl);  
      })
    })
    if (!consumerCount) {
      var tl = document.createElement('tr');
      tl.innerHTML = `<td></td>`;
      ptl.appendChild(tl);      
    }
  } 
  el = document.getElementById('consumers-count');
  if (el) el.innerHTML = consumerCount;  
}

function buildRuleForm(rule, schema) {
  if (rule.type === 'string')
    return stringRuleForm(rule, schema);
  else if (rule.type === 'number')
    return numbergRuleForm(rule, schema);
  else if (rule.type === 'integer')
    return integergRuleForm(rule, schema);
}

async function editTopicVariable(el) {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var param = el.dataset.name;
  console.log(`topic - ${topic}, param - ${param}`);
  console.log(feed.rules);

  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  console.log('rule-param - ', rule.topicParameters[`${param}`])
  
  $('#parameterRuleType').html('Topic Variable');
  $('#parameterTopicName').text(topic);
  $('#dataFieldName').html(`${param.replaceAll('.properties', '')}`)
  $('#dataFieldType').html(`${rule.topicParameters[`${param}`].rule.type}`)
  $('#parameterMessageName').text(message);
  $('#parameterTopicVariableName').text(param);
  $('#parameterPayloadFieldName').text('');
  $('#parameterName').attr("placeholder", param);
  
  setRuleSet($('#parameterRuleSets'), $('#parameterRulesetFeedback'), rule.topicParameters[param].rule.group, rule.topicParameters[param].rule.type);
  setRules($('#parameterRules'), $('#parameterRuleFeedback'), rule.topicParameters[param].rule.group, rule.topicParameters[param].rule.rule);

  $('#parameterRuleSets').selectpicker();
  $('#parameterRuleSets').attr('data-type', 'topic');

  $('#parameterRuleSets').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (e.target.dataset.type !== 'topic') return false;

    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      var newRuleSet = Object.keys(defaultRules)[clickedIndex];
      var firstRule = Object.keys(defaultRules[newRuleSet].rules)[0];
      setRules($('#parameterRules'), $('#parameterRuleFeedback'), newRuleSet, firstRule);
      setRuleFeedback(0, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      setRulesetFeedback(clickedIndex, $('#parameterRulesetFeedback'));
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");

      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), firstRule, true);
    }
  });

  $('#parameterRules').selectpicker();
  $('#parameterRules').attr('data-type', 'topic');

  $('#parameterRules').selectpicker('val', rule.topicParameters[param].rule.rule);
  $('#parameterRules').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (e.target.dataset.type !== 'topic') return false;

    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      setRuleFeedback(clickedIndex, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), rule.topicParameters[param].rule, true);
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");
    }
  });
  $('#parameterRules').selectpicker("refresh");
  $('#parameterRuleSets').selectpicker("refresh");
  fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), rule.topicParameters[param].rule);

}

function editArrayInstanceCount(name, topic, type, nodeId) {
  var html = ``;
  if (type === 'topic') return html;

  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  console.log(`topic - ${topic}, param - ${name}`);
  console.log(feed.rules);

  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  var node = $('#payload-tree-pane').treeview('getSelected');
  if (!node || !node.length) return;

  var param = node[0].path
  console.log('rule-param - ', rule.payload[`${name}`])
  
  var field = rule.payload[param];
  if (param.indexOf('.') > 0)
    field = getFieldRule(rule.payload, param)

  if (field.type !== 'array') return html;

  var count = ' ('.concat(field.rule.count ? field.rule.count : 1).concat(')');
  html = `
        <span class='jstooltip' style="margin-right: 10px">
          <span class="btn btn-primary" data-topic="${topic}" data-name="${rule.name}" 
              data-count="${rule.count ? rule.count : 1}"
              data-toggle="modal" data-target="#field_instance_count_form" data-type="${type}"
              data-backdrop="static" data-keyboard="false" ` +
              `onclick="editInstanceCount(this, '${node.nodeId}')`+ 
              `">
              <i class="fa fa-hashtag" aria-hidden="true">${count}</i>
          </span>
          <span class="jstooltiptext jstooltip-top">Instance count</span>
        </span>`;

  return html;
}

async function editPayloadField(el) {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var param = el.dataset.name;
  console.log(`topic - ${topic}, param - ${param}`);
  console.log(feed.rules);

  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  var node = $('#payload-tree-pane').treeview('getSelected');
  if (!node || !node.length) return;

  var param = node[0].path
  console.log('rule-param - ', rule.payload[`${param}`])
  
  var field = rule.payload[param];
  if (param.indexOf('.') > 0)
    field = getFieldRule(rule.payload, param)

  $('#parameterRuleType').html('Payload Field');
  $('#parameterTopicName').text(topic);
  $('#dataFieldName').html(`${param.replaceAll('.properties', '')}`)
  $('#dataFieldType').html(`${field.type}${field.subType ? ' of ' + field.subType : ''}`)
  $('#parameterMessageName').text(message);
  $('#parameterPayloadFieldName').text(param);
  $('#parameterTopicVariableName').text('');
  $('#parameterName').attr("placeholder", param);
  setRuleSet($('#parameterRuleSets'), $('#parameterRulesetFeedback'), field.rule.group, field.type);

  setRules($('#parameterRules'), $('#parameterRuleFeedback'), field.rule.group, field.rule.rule);
  console.log('Default ruleset', field.rule.group);

  $('#parameterRuleSets').selectpicker();
  $('#parameterRuleSets').attr('data-type', 'payload');

  $('#parameterRuleSets').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (e.target.dataset.type !== 'payload') return false;

    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      var newRuleSet = Object.keys(defaultRules)[clickedIndex];
      var firstRule = Object.keys(defaultRules[newRuleSet].rules)[0];
      setRules($('#parameterRules'), $('#parameterRuleFeedback'), newRuleSet, firstRule);
      setRuleFeedback(0, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      setRulesetFeedback(clickedIndex, $('#parameterRulesetFeedback'));
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");

      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), firstRule, true);
    }
  });

  $('#parameterRules').selectpicker();
  $('#parameterRules').attr('data-type', 'payload');

  $('#parameterRules').selectpicker('val', field.rule.rule);
  $('#parameterRules').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (e.target.dataset.type !== 'payload') return false;

    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      setRuleFeedback(clickedIndex, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), field.rule, true);
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");
    }
  });
  $('#parameterRules').selectpicker("refresh");
  $('#parameterRuleSets').selectpicker("refresh");
  fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), field.rule);

}

async function editInstanceCount(el) {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var message = $('#message-feed-name').text();
  var param = el.dataset.name;
  console.log(`topic - ${topic}, param - ${param}`);
  console.log(feed.rules);

  var rule = feed.rules.find(r => r.topic === topic && r.messageName === message);
  var node = $('#payload-tree-pane').treeview('getSelected');
  if (!node || !node.length) return;

  var param = node[0].path
  console.log('rule-param - ', rule.payload[`${param}`])
  
  var field = rule.payload[param];
  if (param.indexOf('.') > 0)
    field = getFieldRule(rule.payload, param)

  $('#arr_parameterRuleType').html('Payload Array Field');
  $('#arr_parameterTopicName').text(topic);
  $('#arr_dataFieldName').html(`${param.replaceAll('.properties', '')}`)
  $('#arr_dataFieldType').html(`${field.type}${field.subType ? ' of ' + field.subType : ''}`)
  $('#arr_parameterMessageName').text(message);
  $('#arr_parameterPayloadFieldName').text(param);
  $('#arr_parameterTopicVariableName').text('');
  $('#arr_parameterName').attr("placeholder", param);
  $('#arr_dataFieldCount').val(field.rule.count ? field.rule.count : 1);

}

async function editAPIParameter(el) {
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topic = $('#topic_name').text();
  var param = el.dataset.name;
  console.log(`topic - ${topic}, param - ${param}`);
  console.log(feed.rules);

  var rules = feed.rules.rules;
  var rule = rules[param];
  console.log('rule-param - ', rules[`${param}`])
  
  $('#parameterRuleType').html('API Variable');
  $('#parameterTopicName').text(topic);
  $('#dataFieldName').html(`${param}`)
  $('#dataFieldType').html(`${rule.schema.type}`)
  // $('#parameterMessageName').text(message);
  $('#parameterTopicVariableName').text(param);
  $('#parameterPayloadFieldName').text('');
  $('#parameterName').attr("placeholder", param);
  
  var paramRule = rule.rule;
  setRuleSet($('#parameterRuleSets'), $('#parameterRulesetFeedback'), paramRule.group, paramRule.type);
  setRules($('#parameterRules'), $('#parameterRuleFeedback'), paramRule.group, paramRule.rule);

  $('#parameterRuleSets').selectpicker();
  $('#parameterRuleSets').attr('data-type', 'topic');

  $('#parameterRuleSets').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      var newRuleSet = Object.keys(defaultRules)[clickedIndex];
      var firstRule = Object.keys(defaultRules[newRuleSet].rules)[0];
      setRules($('#parameterRules'), $('#parameterRuleFeedback'), newRuleSet, firstRule);
      setRuleFeedback(0, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      setRulesetFeedback(clickedIndex, $('#parameterRulesetFeedback'));
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");

      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), firstRule, true);
    }
  });

  $('#parameterRules').selectpicker();
  $('#parameterRules').attr('data-type', 'topic');

  $('#parameterRules').selectpicker('val', paramRule.rule);
  $('#parameterRules').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (isSelected) {
      console.log('Here', clickedIndex, isSelected, previousValue);
      setRuleFeedback(clickedIndex, $('#parameterRuleSets').val(), $('#parameterRuleFeedback'));
      fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), paramRule.rule, true);
      $('#parameterRuleSets').selectpicker("refresh");
      $('#parameterRules').selectpicker("refresh");
    }
  });
  $('#parameterRules').selectpicker("refresh");
  $('#parameterRuleSets').selectpicker("refresh");
  fixParameters($('#parameterRuleSets').val(), $('#parameterRules').val(), paramRule);

}

function buildParamRuleUI(action, rule, topic, type = 'topic', node = '', name = '') {
  // no need to process receive messages
  if (!rule) return;

  var html = `      
      <div class="card"  >
        <div class="card-header">
          <div class="card-title w-100">          
            <i class="fa fa-sticky-note "></i>
            ${action === 'receive' ? name : rule.name}`;
  if (action === 'send') {
    html += `<span style="display:flex;float:right;">`;
    if (type !== 'topic')
      html += editArrayInstanceCount(rule.name, topic, type, node.nodeId);
    if (!(node.type === 'array' && node.subType === 'object')) {
      html += `
          <span class='jstooltip'>
            <span class="btn btn-primary" style="float:right;" data-topic="${topic}" data-name="${rule.name}" 
              data-toggle="modal" data-target="#field_rules_form" data-type="${type}"
              data-backdrop="static" data-keyboard="false" ` +
              `onclick="` + (type === 'topic' ? `editTopicVariable(this)` : `editPayloadField(this, '${node.nodeId}')`) + 
              `">
              <i class="fa fa-edit" aria-hidden="true"></i>
            </span>
            <span class="jstooltiptext jstooltip-top">Set rule</span>
          </span>`;
    }
    html += `</span>`;
  }

  html += `
          </div>
        </div>
        <!-- /.card-header -->
        <div class="card-body" style="overflow-y: auto">
          <dl class='row'>`;

  const orderedFields = ['name', 'description', 'type', 'group', 'rule'];
  orderedFields.forEach((p) => {
    if (!rule || !rule[p]) 
      console.log('rule[p]', p, rule[p]);
    if (rule[p]) {
      if (p === 'type' && node.type === 'array') {
        html += `<dt class='col-sm-4'>TYPE</dt><dd class='col-sm-8'>Array of ${rule.type}s</dd>`;
      } else {
        html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`;
      }
    }
  });
  Object.keys(rule).sort().forEach((p) => {
    if (!orderedFields.includes(p)) {
      html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`
    }
  });
  html += `
          </dl>
        </div>
        <!-- /.card-body -->
      </div>
  `;

  return html;

}

function buildArrayParamRuleUI(action, rule, topic, type = 'topic', node = '', name = '') {
  var html = `      
      <div class="card"  >
        <div class="card-header">
          <div class="card-title w-100">          
            <i class="fa fa-sticky-note "></i>
            ${action === 'receive' ? name : rule.name}`;
  if (action === 'send') {
    html += `<span style="display:flex;float:right;">`;
    if (type !== 'topic')
      html += editArrayInstanceCount(rule.name, topic, type, node.nodeId);
    html += `</span>`;
  }

  html += `<div class="lockscreen-wrapper">
              <div class="lockscreen-logo">
                <b>${node.text}</b>
              </div>
              
              <!-- /.lockscreen-item -->
              <div class="help-block text-center">
                An array of ${node.subType}s - go ahead and set rules for ${node.subType === 'string' ? 'array element' : 'object atributes'}!
              </div>
            </div>`

  html += `
          </div>
        </div>
        <!-- /.card-header -->
        <div class="card-body" style="overflow-y: auto">
          <dl class='row'>`;
  const orderedFields = ['name', 'description', 'type', 'group', 'rule'];;
  orderedFields.forEach((p) => {
    if (rule[p]) {
      html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`;
    }
  });
  Object.keys(rule).sort().forEach((p) => {
    if (!orderedFields.includes(p)) {
      html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`
    }
  });
  html += `
          </dl>
        </div>
        <!-- /.card-body -->
      </div>
  `;

  return html;

}

function buildAPIParamRuleUI(rule) {
  var html = `      
      <div class="card" style="max-height: 320px;" >
        <div class="card-header">
          <div class="card-title w-100">          
            <i class="fa fa-sticky-note "></i>
            ${rule.name}`;
  html += `
          <span class="btn btn-primary" style="float:right;" data-name="${rule.name}" 
            data-toggle="modal" data-target="#field_rules_form"
            data-backdrop="static" data-keyboard="false"
            onclick="editAPIParameter(this)">
            <i class="fa fa-edit" aria-hidden="true"></i>
          </span>`

  html += `
          </div>
        </div>
        <!-- /.card-header -->
        <div class="card-body" style="overflow-y: auto">
          <dl class='row'>`;
  const orderedFields = ['name', 'description', 'type', 'group', 'rule'];;
  orderedFields.forEach((p) => {
    if (rule[p]) {
      html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`;
    }
  });
  Object.keys(rule).sort().forEach((p) => {
    if (!orderedFields.includes(p)) {
      html += `<dt class='col-sm-4'>${p.toUpperCase()}</dt><dd class='col-sm-8'>${rule[p]}</dd>`
    }
  });
  html += `
          </dl>
        </div>
        <!-- /.card-body -->
      </div>
  `;

  return html;

}

function getTree(json) {
  var tree = [];
  var root = { text: 'Payload', type: 'object', path: '', nodes: [] }
  buildTree('Payload', json, root);
  tree.push(root);

  return tree;
}

function buildTree(name, json, parent) {
  if (!json) {
    console.log('JSON is empty');
    return;
  }
  console.log('JSON', json);
  var fields = Object.keys(json);
  console.log('FIELDS', fields);

  if (name === 'mentions') {
    console.log('MENTIONS', json);
  }

  var doNotIgnoreFields = {
    'type': fields.includes('type') && !json?.type?.rules,
    'subType': fields.includes('subType') && !json?.subType?.rules,
    'rule': fields.includes('rule') && !json?.rule?.rules,
    'properties': fields.includes('properties') && !json?.properties?.rules,
  }

  fields.forEach(field => {
    if ((field === 'type' && !doNotIgnoreFields.type) || 
        (field === 'subType' && !doNotIgnoreFields.subType) || 
        (field === 'rule' && !doNotIgnoreFields.rule) || 
        (field === 'properties' && !doNotIgnoreFields.properties)) 
      return;

    var node = { text: field, type: json[field].type, path: parent.path ?`${parent.path}.properties.${field}` : field};
    if (json[field].type === 'object' && json[field].properties) {
      node.nodes = [];
      buildTree(field, json[field].properties, node);
    } else if (json[field].type === 'array' && json[field].subType !== 'object') {
      node.text += '[]'
      node.subType = json[field].subType;
      node.nodes = [];
    } else if (json[field].type === 'array' && json[field].subType === 'object') {
      node.text += '[]'
      node.subType = json[field].subType;
      node.nodes = [];
      buildTree(field, json[field].items.properties, node);
    }
    parent.nodes.push(node)
  })

  return parent;
}

function getFieldRule(obj, path) {
  if (path.indexOf('.') < 0)
    return obj[path];

  let field = path.substring(0, path.indexOf('.'));
  var remaining = path.substring(path.indexOf('.')+1);
  if (obj[field].type === 'array' && obj[field].subType === 'object')
    obj[field] = obj[field].items;
  return getFieldRule(obj[field], remaining);
}

async function refreshMappingRules(rule) {
  $('#sourceField').val('');
  $('#targetField').val('');

  $('#mapping_rules').empty();

  // ATTRIBUTE MAPPING COUNT
  var el = document.getElementById('attribute_mapping_count');
  var mappings = rule.mappings ? Object.keys(rule.mappings) : [];
  if (mappings.length) {
    if (el) el.innerHTML = `<b> (${mappings.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
  
  // MAPPING RULES
  el = document.getElementById('mapping_rules');
  if (!rule.mappings || !rule.mappings.length) {
    var mapRow = document.createElement('div');
    mapRow.classList.add('card');
    mapRow.style.padding = '3px';
    mapRow.style.marginLeft = '15%';
    mapRow.style.marginRight = '15%';

    mapHtml = `
      <div class="text-center" style="padding: 15px;">
        No Mapping rules defined!
      </div>
    `;
    mapRow.innerHTML = mapHtml;
    el.appendChild(mapRow);
    return;
  }

  rule.mappings.forEach((mapping, index) => {
    var mapRow = document.createElement('div');
    mapRow.classList.add('card');
    mapRow.style.margin = '20px';
    var mapHtml = `
        <div class="rules-toolbar">
          <span style="text-align: left;  margin-right:15%">
            <i>${mapping.source.type}</i><br/>
            <b>${mapping.source.name}</b>
          </span>
          <span><b>⇒</b></span>
          <span style="text-align: left; margin-left:15%">
            <i>${mapping.target.type}</i><br/>
            <b>${mapping.target.name}</b>
          </span>
          <ul class="navbar-nav ml-auto float-right" style="display:flex; flex-direction: row;">
            <li class="nav-item" style="padding: 5px;">
              <a class="nav-link" data-map-index="${index}" role="button" onclick="pushUpMappingRule(this)">
                <i class="fas fa-arrow-up"></i>
              </a>
            </li>
            <li class="nav-item" style="padding: 5px;">
              <a class="nav-link" data-map-index="${index}" role="button" onclick="pushDownMappingRule(this)">
                <i class="fas fa-arrow-down"></i>
              </a>
            </li>
            <li class="nav-item" style="padding: 5px;">
              <a class="nav-link" data-map-index="${index}" role="button" onclick="deleteMappingRule(this)">
                <i class="fas fa-trash"></i>
              </a>
            </li>
          </ul>
        </div>
    `
    mapRow.innerHTML = mapHtml;
    el.appendChild(mapRow);
  })
}

const swapElements = (array, index1, index2) => {
  array[index1] = array.splice(index2, 1, array[index1])[0];
};

async function deleteMappingRule(el) {
  var page = window.location.href.split('/').pop();
  var messageName = page.split('#').pop();
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topicRules = feed.rules.filter((r) => r.messageName === messageName);
  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  var rule = topicRules[ruleIndex];

  if (!rule) return;

  var pos = parseInt(el.dataset.mapIndex);
  rule.mappings.splice(pos, 1);
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  await fetch(path + `/feedrules`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: localStorage.getItem('currentFeed')
  });

  toastr.success('Mapping deleted successfully.')
  refreshMappingRules(rule);
}
  
async function pushDownMappingRule(el) {
  var page = window.location.href.split('/').pop();
  var messageName = page.split('#').pop();
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  
  var topicRules = feed.rules.filter((r) => r.messageName === messageName);
  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  var rule = topicRules[ruleIndex];
  if (!rule) return;

  var pos = parseInt(el.dataset.mapIndex);
  if (pos+1 < rule.mappings.length) {
    swapElements(rule.mappings, pos, pos+1);

    localStorage.setItem('currentFeed', JSON.stringify(feed));

    // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    const path = window.location.origin;
    await fetch(path + `/feedrules`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: localStorage.getItem('currentFeed')
    });

    toastr.success('Mapping reordered successfully.')
    refreshMappingRules(rule);
  }
}
  
async function pushUpMappingRule(el) {
  var page = window.location.href.split('/').pop();
  var messageName = page.split('#').pop();
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var topicRules = feed.rules.filter((r) => r.messageName === messageName);
  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  var rule = topicRules[ruleIndex];
  if (!rule) return;

  var pos = parseInt(el.dataset.mapIndex);
  if (pos >= 1) {
    swapElements(rule.mappings, pos, pos-1);

    localStorage.setItem('currentFeed', JSON.stringify(feed));

    // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    const path = window.location.origin;
    await fetch(path + `/feedrules`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: localStorage.getItem('currentFeed')
    });

    toastr.success('Mapping reordered successfully.')
    refreshMappingRules(rule);
  }
}
  
async function configureApiPlaceHolderRules(rules, refresh = false) {
  if (!rules) {
    el = document.getElementById("rules_section");
    if (el) el.innerHTML = "Missing rules, try regenerating feed by running <pre>stm feed generate</pre>"
    return;
  }

  // API VARIABLES
  var params = Object.keys(rules.rules);
  el = document.getElementById('api_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
  
  el = document.getElementById('api_variable_info');
  if (!params.length) {
    el.innerHTML = 'No API variables identified on the endpoint!'
  } else {
    parent = document.getElementById('api_variable_info');
    if (refresh)
      $('#api_variable_info').empty();

    params.forEach((param) => {
      var el = document.createElement('div');
      el.classList.add('col-md-6')
    
      el.innerHTML = buildAPIParamRuleUI(rules.rules[param].rule);
      parent.appendChild(el);
    })
  }

  // PUBLISH SETTINGS
  el = document.getElementById('publish_settings');
  if (el) el.innerHTML = `
  <div class="card-body">
    <div class="row">
      <div class="col-4">
        <label for="count-publish" class="small">No. of Events</label>
        <input id="count-publish" type="number" class="form-control" 
            value="${rules.publishSettings.count}" min="0" max="1000" default="0" data-min="0" data-max="1000" data-default="0" data-param="count" onchange="publishApiSettingsChange(this)">
        <span style="font-size: 0.75rem;">Default: 0 (infinite) or a +ve number</span>
      </div>
      <div class="col-4">
        <label for="interval-publish" class="small">Interval (milliseconds)</label>
        <input id="interval-publish" type="number" class="form-control" 
          value="${rules.publishSettings.interval}" min="1000" max="120000" default="1000" data-min="1000" data-max="120000" data-default="1000" data-param="interval" onchange="publishApiSettingsChange(this)">
        <span style="font-size: 0.75rem;">Range: 1000 - 120000 ms</span>
      </div>
      <div class="col-4">
        <label for="delay-publish" class="small">Initial Delay (milliseconds)</label>
        <input id="delay-publish" type="number" class="form-control" 
          value="${rules.publishSettings.delay}" min="0" max="120000" default="0" data-min="0" data-max="120000" data-default="0" data-param="delay" onchange="publishApiSettingsChange(this)">
        <span style="font-size: 0.75rem;">Range: 0 - 120000 ms</span>  
      </div>
    </div>
  </div>`;
  
  el = document.getElementById('api_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
}

async function configureAPIVariables(rules, refresh = false) {
  if (!rules) {
    el = document.getElementById("rules_section");
    if (el) el.innerHTML = "Missing rules, try regenerating feed by running <pre>stm feed generate</pre>"
    return;
  }

  var params = Object.keys(rules);
  el = document.getElementById('api_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
  
  el = document.getElementById('api_variable_info');
  if (!params.length) {
    el.innerHTML = 'No API variables identified on the endpoint!'
  } else {
    parent = document.getElementById('api_variable_info');
    if (refresh)
      $('#api_variable_info').empty();

    params.forEach((param) => {
      var el = document.createElement('div');
      el.classList.add('col-md-6')
    
      el.innerHTML = buildAPIParamRuleUI(rules[param].rule);
      parent.appendChild(el);
    })
  }
}

async function configureMessageSendTopics(messageName, rules, ruleIndex = 0, refresh = false) {
  if (!rules) {
    el = document.getElementById("rules_section");
    if (el) el.innerHTML = "Missing rules, try regenerating feed by running <pre>stm feed generate</pre>"
    return;
  }

  var topicRules = rules.filter((r) => r.messageName === messageName);
  if (!topicRules || !topicRules.length) return;

  $('#p_send_topics').empty();
  localStorage.setItem('currentRuleIndex', ruleIndex);
  topicRules.forEach((rule, index) => {
    $('#p_send_topics').append(`<option value="${rule.topic}">${rule.topic}</option>`);
  })
  $('#p_send_topics').selectpicker("refresh");
  $('#p_send_topics').selectpicker('val', topicRules[ruleIndex].topic);
  $('#p_send_topics').selectpicker('render')
  $('#send_topic_count').html(`(${topicRules.length})`);

  $('#p_send_topics').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if (clickedIndex === null || !isSelected) return;

    console.log('Selected');
    var page = window.location.href.split('/').pop();
    var messageName = page.split('#').pop();
    var feed = JSON.parse(localStorage.getItem('currentFeed'));
    $('#p_send_topics').empty();

    var el = document.getElementById('payload-variable-pane');
    el.innerHTML = '';
    el.style.width = 'auto';

    configureMessageSendTopics(messageName, feed.rules, clickedIndex, true);
  });

  var rule = topicRules[ruleIndex];
  el = document.getElementById('topic_name');
  if (el) el.innerHTML = rule.topic;

  // TOPIC VARIABLES
  var params = rule.topicParameters ? Object.keys(rule.topicParameters) : [];
  el = document.getElementById('topic_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
  
  el = document.getElementById('topic_variable_info');
  if (!params.length) {
    el.innerHTML = 'No Topic variables identified on the topic!'
  } else {
    parent = document.getElementById('topic_variable_info');
    if (refresh)
      $('#topic_variable_info').empty();

    params.forEach((param) => {
      var el = document.createElement('div');
      el.classList.add('col-md-6')
    
      el.innerHTML = buildParamRuleUI('send', rule.topicParameters[param].rule, rule.topic, 'topic');
      parent.appendChild(el);
    })
  }

  // TOPIC PAYLOAD
  el = document.getElementById('topic_payload_info');
  if (!rule.payload) {
    el.style.height = 'unset';
    el.innerHTML = `<div style="margin: 5%; text-align: center;">
      <b>Empty payload!</b>
    </div>
    `
  } else {
    let nodeData = getTree(rule.payload, null);
    $('#payload-tree-pane').treeview({
      expandIcon: 'glyphicon glyphicon-plus',
      collapseIcon: 'glyphicon glyphicon-minus',
      nodeIcon: 'glyphicon',
      data: nodeData,
      onNodeSelected: function(event, node) {
        console.log(node.text + ' @ ' + node.path + ' was selected');
        if (!node.path) {
          var el = document.getElementById('payload-variable-pane');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>Message Payload</b>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              Set rules for the payload attributes!
            </div>
          </div>
          `
          return;
        } else if (node.type === 'object') {
          var el = document.getElementById('payload-variable-pane');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>${node.text}</b>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              Okay, go ahead and set rules for the object attributes!
            </div>
          </div>
          `
          return;
        } 
        // else if (node.type === 'array' && node.subType === 'object') {
        //   var el = document.getElementById('payload-variable-pane');
        //   el.innerHTML = '';
        //   el.style.width = 'auto';
        //   el.innerHTML = `<div class="lockscreen-wrapper">
        //     <div class="lockscreen-logo">
        //       <b>${node.text}</b>
        //     </div>
            
        //     <!-- /.lockscreen-item -->
        //     <div class="help-block text-center">
        //       An array of ${node.subType}s - go ahead and set rules for ${node.subType === 'string' ? 'array element' : 'object attributes'}!
        //     </div>
        //   </div>
        //   `
        //   return;
        // }

        parent = document.getElementById('payload-variable-pane');
        parent.innerHTML = '';
        parent.style.width = 'auto';

        var messageName = window.location.href.split('#').pop();
        var feed = JSON.parse(localStorage.getItem('currentFeed'));
        var topicRules = feed.rules.filter((r) => r.messageName === messageName);
        var ruleIndex = localStorage.getItem('currentRuleIndex');
        if (ruleIndex === null) ruleIndex = 0;
        var rule = topicRules[ruleIndex];
        if (!rule) return;
      
        var el = document.createElement('div');
        var field = rule.payload[node.path];
        if (node.path.indexOf('.') > 0)
          field = getFieldRule(rule.payload, node.path)

        el.innerHTML = buildParamRuleUI('send', field.rule, rule.topic, 'payload', node);
        parent.appendChild(el);
    
      },
      onNodeUnselected: function (event, node) {
        console.log(node.text + ' was unselected');
        var el = document.getElementById('payload-variable-pane');
        el.innerHTML = '';
        el.style.width = 'auto';
      }
    });
  }


  // PUBLISH SETTINGS
  el = document.getElementById('publish_settings');
  if (el) el.innerHTML = `
  <div class="card-body">
    <div class="row">
      <div class="col-4">
        <label for="count-publish" class="small">No. of Events</label>
        <input id="count-publish" type="number" class="form-control" 
            value="${rule.publishSettings.count}" min="0" max="1000" default="0" data-min="0" data-max="1000" data-default="0" data-param="count" onchange="publishSettingsChange(this)">
        <span style="font-size: 0.75rem;">Default: 0 (infinite) or a +ve number</span>
      </div>
      <div class="col-4">
        <label for="interval-publish" class="small">Interval (milliseconds)</label>
        <input id="interval-publish" type="number" class="form-control" 
          value="${rule.publishSettings.interval}" min="0" max="120000" default="1000" data-min="0" data-max="120000" data-default="1000" data-param="interval" onchange="publishSettingsChange(this)">
        <span style="font-size: 0.75rem;">Range: 0 - 120000 ms</span>
      </div>
      <div class="col-4">
        <label for="delay-publish" class="small">Initial Delay (milliseconds)</label>
        <input id="delay-publish" type="number" class="form-control" 
          value="${rule.publishSettings.delay}" min="0" max="120000" default="0" data-min="0" data-max="120000" data-default="0" data-param="delay" onchange="publishSettingsChange(this)">
        <span style="font-size: 0.75rem;">Range: 0 - 120000 ms</span>  
      </div>
    </div>
  </div>`;
  
  var params = rule.topicParameters ? Object.keys(rule.topicParameters) : [];
  el = document.getElementById('topic_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }

  manageFieldMap();

  refreshMappingRules(rule);  
}

async function configureMessageReceiveTopics(messageName, rules, ruleIndex = 0, refresh = false) {
  if (!rules) {
    el = document.getElementById("recv_rules_section");
    if (el) el.innerHTML = "Missing rules, try regenerating feed by running <pre>stm feed generate</pre>"
    return;
  }

  var topicRules = rules.filter((r) => r.messageName === messageName);
  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  var rule = topicRules[ruleIndex];
  if (!rule) return;

  el = document.getElementById('recv_topic_name');
  if (el) el.innerHTML = rule.topic;

  // TOPIC VARIABLES
  var params = rule.topicParameters ? Object.keys(rule.topicParameters) : [];
  el = document.getElementById('recv_topic_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }
  
  el = document.getElementById('recv_topic_variable_info');
  if (!params.length) {
    el.innerHTML = 'No Topic variables identified on the topic!'
  } else {
    parent = document.getElementById('recv_topic_variable_info');
    if (refresh)
      $('#recv_topic_variable_info').empty();

    params.forEach((param) => {
      var el = document.createElement('div');
      el.classList.add('col-md-6')
    
      el.innerHTML = buildParamRuleUI('receive', rule.topicParameters[param].schema, rule.topic, 'topic', '', param);
      parent.appendChild(el);
    })
  }

  // TOPIC PAYLOAD
  el = document.getElementById('recv_topic_payload_info');
  if (!rule.payload) {
    el.style.height = 'unset';
    el.innerHTML = `<div style="margin: 5%; text-align: center;">
      <b>Empty payload!</b>
    </div>
    `
  } else {
    $('#recv_payload-tree-pane').treeview({
      expandIcon: 'glyphicon glyphicon-plus',
      collapseIcon: 'glyphicon glyphicon-minus',
      nodeIcon: 'glyphicon',
      data: getTree(rule.payload, null),
      onNodeSelected: function(event, node) {
        console.log(node.text + ' @ ' + node.path + ' was selected');
        if (!node.path) {
          var el = document.getElementById('recv_payload-variable-pane');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>Message Payload</b>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              Explore payload composition!
            </div>
          </div>
          `
          return;
        } else if (node.type === 'object') {
          var el = document.getElementById('recv_payload-variable-pane');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>${node.text}</b>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              Object, expand to see the field composition!
            </div>
          </div>
          `
          return;
        } else if (node.type === 'array' && node.subType === 'object') {
          var el = document.getElementById('recv_payload-variable-pane');
          el.innerHTML = '';
          el.style.width = 'auto';
          el.innerHTML = `<div class="lockscreen-wrapper">
            <div class="lockscreen-logo">
              <b>${node.text}</b>
            </div>
            
            <!-- /.lockscreen-item -->
            <div class="help-block text-center">
              An array of ${node.subType}s - go ahead and set rules for ${node.subType === 'string' ? 'array element' : 'object atributes'}!
            </div>
          </div>
          `
          return;
        }

        parent = document.getElementById('recv_payload-variable-pane');
        parent.innerHTML = '';
        parent.style.width = 'auto';

        var page = window.location.href.split('/').pop();
        var messageName = page.split('#').pop();
        var feed = JSON.parse(localStorage.getItem('currentFeed'));
        var rule = feed.schemas.find((r) => r.messageName === messageName);
        if (!rule) return;
      
        var el = document.createElement('div');
        var field = rule.payload[node.path];
        if (node.path.indexOf('.') > 0)
          field = getFieldRule(rule.payload, node.path)

        el.innerHTML = buildParamRuleUI('receive', field, rule.topic, 'payload', node, node.text);
        parent.appendChild(el);
    
      },
      onNodeUnselected: function (event, node) {
        console.log(node.text + ' was unselected');
        var el = document.getElementById('recv_payload-variable-pane');
        el.innerHTML = '';
        el.style.width = 'auto';
      }
    });
  }

  params = rule.topicParameters ? Object.keys(rule.topicParameters) : [];
  el = document.getElementById('recv_topic_variable_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }

  params = rule.consumers ? Object.values(rule.consumers) : [];
  el = document.getElementById('recv_consumer_count');
  if (params.length) {
    if (el) el.innerHTML = `<b> (${params.length}) </b>`;
  } else {
    if (el) el.innerHTML = ``;
  }

  el = document.getElementById('recv_consumers_info');
  if (!params.length) {
    el.innerHTML = `<div style="margin: 0 auto;">
        <b>No consumers defined!</b>
    </div>
    `
  } else {
    parent = document.getElementById('recv_consumers_info');
    if (refresh)
      $('#recv_consumers_info').empty();

    if (params.length) {
      params.forEach((param) => {
        var el = document.createElement('div');
        el.classList.add('col-md-12')
        el.innerHTML = `
          <table class="table table-striped">
            <tbody id="consumers">
              <tr>
                <td class="card-title" style="word-break: break-word;">${param.name}</td>
                <td style="word-break: break-word;">${param.topicSubscriptions.join('<br>')}</td>
              </tr>
            </tbody>
          </table>`
        parent.appendChild(el);
      })
    }
  }

  manageFieldMap();
}

function fixAnonNames (name) {
  if (name.length > 3 && name[0] === '<' && name[name.length-1] === '>')
    name = name.substring(1, name.length-1);
  // name = name.replaceAll('/', '_');
  // name = name.replace(/[^a-zA-Z0-9]/g,'_');
  return name;
}

function addMessages(config) {
  if (!config.messages || !Object.keys(config.messages).length)
    return;

  var messages = config.messages;
  var parent = document.getElementById('sidebar-message');
  if (!parent) return;

  var messageNames = Object.keys(messages); 
  for (var i=0; i<messageNames.length; i++) {
    var schemaTpl = `
      <a id="m_${decodeURIComponent(fixAnonNames(messageNames[i]))}" href="message.html#${fixAnonNames(messageNames[i])}" 
        class="nav-link" style="display: flex; align-items: center; cursor: pointer;" 
      >
        <i class="nav-icon"><img width=24 src="images/msginstance.png"/></i>
        <p style="margin-left: 8px;word-break: break-word;">${fixAnonNames(messageNames[i].trim())}</p>
      </a>
    `;

    var el = document.createElement('li');
    el.classList.add('nav-item');
    el.classList.add('nav-item-child');
    el.innerHTML = schemaTpl;
    el.addEventListener('click', async function (event) { 
      window.location.href = this.getElementsByClassName('nav-link')[0].href;
      window.location.reload();
      return false;
    });

    parent.appendChild(el);
  }
}

function addConsumers(page, config) {
  if (!config.messages || !Object.keys(config.messages).length)
    return;

  var messageName = page.split('#').pop();
  if (!messageName) {
    console.log(`Missing message name in URL`);
    return;
  }
  messageName = decodeURIComponent(messageName);

  var receivers = config.messages[messageName].receive;
  if (!receivers || !receivers.length)
    return;

  var parent = document.getElementById('consumers-tab');
  if (!parent) return;

  for (var i=0; i<receivers.length; i++) {
    var receiver = receivers[i];
    var consumerNames = Object.keys(receiver.consumers); 
    for (var i=0; i<consumerNames.length; i++) {
      var consumerTpl = `
      <div style="border-left-color:#00c895;" class="callout callout-info row">
        <div class="col-12" style="display:flex; flex-direction: row; justify-content: space-between;">
          <div class="info-box shadow-sm" style="width: 400px">
            <span class="info-box-icon bg-gray">
              <i style="color: #00c895" class="nav-icon"><img width=56 src="images/t_queue.png"/></i>
            </span>
    
            <div class="info-box-content">
              <h5 class='card-title'>${decodeURIComponent(consumerNames[i])}</span></h5>
            </div>
            <!-- /.info-box-content -->
          </div>
          <!-- /.info-box -->
          <table class="table table-striped">
            <tbody>
              <tr><td><h5 class='card-title'>Subscriptions</h5></td></tr>
              <tr><td>
                <p style="margin-left: 8px;word-break: break-word;">${receiver.consumers[consumerNames[i]].topicSubscriptions.join('<br>')}</p>                
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
      `

      var el = document.createElement('div');
      el.innerHTML = consumerTpl;
    
      parent.appendChild(el);
    }
  }

}

function addServers(config) {
  if (!config.servers || !Object.keys(config.servers).length)
    return;

  var servers = config.servers;
  var parent = document.getElementById('sidebar-server');
  if (!parent) return;

  var serverNames = Object.keys(servers); 
  for (var i=0; i<serverNames.length; i++) {
    var messageTpl = `
      <a id="m_${decodeURIComponent(serverNames[i])}" href="server.html#${serverNames[i]}" class="nav-link" style="display: flex; align-items: center;"
        onclick="window.location.href='server.html#${serverNames[i]}'; window.location.reload();">
        <i class="nav-icon"><img width=24 src="images/svrinstance.png"/></i>
        <p style="margin-left: 8px;word-break: break-word;">${serverNames[i].trim()}</p>
      </a>
    `;

    var el = document.createElement('li');
    el.classList.add('nav-item');
    el.classList.add('nav-item-child');
    el.innerHTML = messageTpl;
  
    parent.appendChild(el);
  }
}

// HOME PAGE
const explore = async (btn) => {
  var feedName = btn.dataset.feedname;
  var feedType = btn.dataset.feedtype;
  if (!feedName) return;

  var feed = await getFeed(feedName);
  console.log('Feed', feed);
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  var rules = feed.type === 'asyncapi_feed' ? await getFakerRules(feedName) :
                  feed.type === 'restapi_feed' ? await getFakerRules(feedName) : null;
  console.log('Rules', rules);
  localStorage.setItem('defaultRules', JSON.stringify(rules));

  window.location.href = feedType === 'asyncapi_feed' ? 'feed.html' : 
                            feedType === 'restapi_feed' ? 'apifeed.html' : 'custom_feed.html';
}
// HOME PAGE

// INFO PAGE
function updateInfo(feed) {
  var el = document.getElementById('feed-info-filename');
  if (el) el.innerHTML = feed.fileName;

  var value = 'N/A';
  if (feed.config && feed.config.messages)
    value = Object.keys(feed.config.messages).length;
  el = document.getElementById('messages-count');
  if (el) el.innerHTML = value;

  value = 'N/A';
  if (feed.config && feed.config.messages) {
    value = 0;
    Object.keys(feed.config.messages).forEach(key => {
      value += feed.config.messages[key].send ? feed.config.messages[key].send.length : 0;
    })
  } 
  el = document.getElementById('send-topics-count');
  if (el) el.innerHTML = value;

  value = 'N/A';
  if (feed.config && feed.config.messages) {
    value = 0;
    Object.keys(feed.config.messages).forEach(key => {
      value += feed.config.messages[key].receive ? feed.config.messages[key].receive.length : 0;
    })
  } 
  el = document.getElementById('receive-topics-count');
  if (el) el.innerHTML = value;

  value = 'N/A';
  if (feed.config && feed.config.schemas)
    value = Object.keys(feed.config.schemas).length;
  el = document.getElementById('schemas-count');
  if (el) el.innerHTML = value;

  var parent = document.getElementById('standard_attributes');
  var info = feed.config ? feed.config.info : undefined;
  var el = undefined;
  if (parent && info) {
    if (info.title) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Title</td><td>${info.title}</td>`;
      parent.appendChild(el);
    }
    if (info.version) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Version</td><td>${info.version}</td>`;
      parent.appendChild(el);
    }
    if (info.description) {
      el = document.createElement('tr');
      el.innerHTML = `<td>Description</td><td>${info.description}</td>`;
      parent.appendChild(el);
    }
    if (feed.config) {
      el = document.createElement('tr');
      el.innerHTML = `<td>View</td><td>${feed.config?.view === 'receiver' ? 
                          'Feed built on receive events' : 'Feed built on send events'}</td>`;
      parent.appendChild(el);
    }
  } 

  parent = document.getElementById('custom_attributes');
  el = undefined;
  if (parent && info) {
    Object.keys(info).forEach(key => {
      if (key.startsWith('x-')) {
        el = document.createElement('tr');
        el.innerHTML = `<td>${key}</td><td>${info[key]}</td>`;
        parent.appendChild(el);
      }
    })
  } 
}
// INFO PAGE

document.addEventListener('DOMContentLoaded', async function () {
  localStorage.setItem('currentRuleIndex', 0);
  
  window.history.pushState({ prevUrl: window.location.href }, null);
  var queryString = window.location.search || '';
  var keyValPairs = [];
  var params      = {};
  queryString     = queryString.substr(1);

  if (queryString.length)
  {
     keyValPairs = queryString.split('&');
     for (pairNum in keyValPairs)
     {
        var key = keyValPairs[pairNum].split('=')[0];
        if (!key.length) continue;
        if (typeof params[key] === 'undefined')
           params[key] = keyValPairs[pairNum].split('=')[1];
     }
  }

  var page = window.location.pathname.split('/').pop();
  page = !page ? 'feeds.html' : page;
  console.log('DOM Loaded', window.location.href, page);

  if (page === 'feeds.html') {
    resetFeeds();
    if (params['feed']) {
      var feed = await getFeed(params['feed']);
      addFeed(feed);
      localStorage.setItem('currentFeed', JSON.stringify(feed));

      console.log('Feed', feed);
      $( `#${feed.name}` ).trigger( "click" );

    } else {
      var feeds = await getFeeds();
      feeds.forEach(feed => {
        addFeed(feed);
      });
      console.log('Feeds', feeds);
    }
  }

  if (page === 'feed.html') {
    if (localStorage.getItem('currentFeed')) {
      var feed = JSON.parse(localStorage.getItem('currentFeed'));
      document.getElementById('event-feed-name').innerHTML = feed.name;
      updateInfo(feed)
    }
  }
  if (page === 'apifeed.html') {
    if (localStorage.getItem('currentFeed')) {
      var feed = JSON.parse(localStorage.getItem('currentFeed'));
      document.getElementById('api-feed-name').innerHTML = feed.info.name;
      if (feed.info.description)
        document.getElementById('api-feed-description').innerHTML = feed.info.description;
      else 
        document.getElementById('api-feed-description-pane').remove();

      if (feed.config.apiKey)
        document.getElementById('api-feed-key').innerHTML = "*******"; //feed.config.apiKey;
      else 
        document.getElementById('api-feed-key-pane').remove();
        
      if (document.getElementById('topic_name')) document.getElementById('topic_name').innerHTML = feed.config.topic;
      if (document.getElementById('api-feed-url')) document.getElementById('api-feed-url').innerHTML = feed.config.apiUrl;
      if (document.getElementById('api-feed-auth-type')) document.getElementById('api-feed-auth-type').innerHTML = feed.config.apiAuthType;
      if (document.getElementById('api-feed-key')) document.getElementById('api-feed-key').innerHTML = feed.config.apiKey;
      if (feed.config.apiKeyUrlEmbedded) {
        if (document.getElementById('api-feed-key-embedded')) document.getElementById('api-feed-key-embedded').innerHTML = feed.config.apiKeyUrlEmbedded;
        if (document.getElementById('api-feed-key-param')) document.getElementById('api-feed-key-param').innerHTML = feed.config.apiKeyUrlParam;
      } else {
        $('#api-feed-key-embedded-pane').remove();
        $('#api-feed-key-param-pane').remove();
      }

      if (feed.config.apiKeyUrl) {
        if (document.getElementById('api-feed-key-gen-url')) document.getElementById('api-feed-key-gen-url').innerHTML = feed.config.apiKeyUrl;
      } else {
        $('#api-feed-key-gen-pane').remove();
      }
      if (document.getElementById('api-feed-topic')) document.getElementById('api-feed-topic').innerHTML = feed.config.topic;
      updateInfo(feed)
    }
  }
});


$(window).bind("load", function () {
  loadPage();
});

function loadPage() {
  // var page = window.location.href.split('/').pop();
  var page = window.location.pathname.split('/').pop();
  var menuSelection = undefined;
  page = !page ? 'feed.html' : page;
  if (page === 'feeds.html') {
    localStorage.removeItem('currentFeed');
    menuSelection = document.getElementById('m_application')
    $('#footer-title').html('Solace Event Feeds')
  } else {
    $( "#main-footer" ).css( "left", "300px" );    
    $( "#main-footer" ).css( "width", "calc(100% - 300px)" );    
  }

  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  if (feed) {
    if (feed.type === 'asyncapi_feed') {
      addMessages(feed.config);
      addSchemas(feed.config);
      addServers(feed.config);
    }
  }
  if (page.startsWith('feed.html')) {
    $('#sidebar-application-root')[0].classList.add('menu-open');
    $('#sidebar-server-root')[0].classList.remove('menu-open');
    $('#sidebar-message-root')[0].classList.remove('menu-open');
    $('#sidebar-schema-root')[0].classList.remove('menu-open');
    document.getElementById('event-feed-name').innerHTML = feed.name;
    menuSelection = document.getElementById('m_info');  
  } else if (page.startsWith('message.html')) {
    $('#sidebar-application-root')[0].classList.add('menu-open');
    $('#sidebar-server-root')[0].classList.remove('menu-open');
    $('#sidebar-message-root')[0].classList.add('menu-open');
    $('#sidebar-schema-root')[0].classList.remove('menu-open');
    menuSelection = document.getElementById('m_messages');
    if (feed) {
      var msgName = loadMessage(feed, page);
      menuSelection = document.getElementById(`m_${msgName}`);
    }

    $.fn.selectpicker.Constructor.BootstrapVersion = '4';
  } else if (page.startsWith('schema.html')) {
    $('#sidebar-application-root')[0].classList.add('menu-open');
    $('#sidebar-server-root')[0].classList.remove('menu-open');
    $('#sidebar-message-root')[0].classList.remove('menu-open');
    $('#sidebar-schema-root')[0].classList.add('menu-open');
    if (feed) {
      var schemaName = loadSchema(feed, page);
      menuSelection = document.getElementById(`m_${schemaName}`);
    }
  } else if (page.startsWith('server.html')) {
    $('#sidebar-application-root')[0].classList.add('menu-open');
    $('#sidebar-server-root')[0].classList.add('menu-open');
    $('#sidebar-message-root')[0].classList.remove('menu-open');
    $('#sidebar-schema-root')[0].classList.remove('menu-open');
    if (feed) {
      var serverName = loadServer(feed, page);
      menuSelection = document.getElementById(`m_${serverName}`);
    }
  } else if (page.startsWith('apifeed.html')) {
    configureApiPlaceHolderRules(feed.rules);
  }
  
  $( "nav li.nav-item a.nav-link" ).css( "bobackground-color", "unset" );

  if (menuSelection) menuSelection.style.backgroundColor = "#00c89587";

  if (localStorage.getItem('currentFeed')) {
    var feed = JSON.parse(localStorage.getItem('currentFeed'));
    if (document.getElementById('footer-feed-type')) document.getElementById('footer-feed-type').innerHTML = '[ ' + feed.type + '] ';
    if (document.getElementById('footer-feed-info-filename')) document.getElementById('footer-feed-info-filename').innerHTML = feed.fileName;
    if (document.getElementById('footer-feed-name')) document.getElementById('footer-feed-name').innerHTML = feed.name;
  }
}

// server interactions
async function getFeeds() {
  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  const response = await fetch(path + "/feeds");
  const feeds = await response.json();
  return feeds;
}

async function getFeed(feedName) {
  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  const response = await fetch(path + `/feeds?feed=${feedName}`);
  const feed = await response.json();
  return feed;
}

async function getFakerRules(feedName) {
  // const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  const path = window.location.origin;
  const response = await fetch(path + `/fakerrules?feed=${feedName}`);
  const rules = await response.json();
  return rules;
}

function prettyPrint(jsonObject) {
  var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
  var replacer = function(match, pIndent, pKey, pVal, pEnd) {
      var key = '<span class="json-key" style="color: brown">',
          val = '<span class="json-value" style="color: navy">',
          str = '<span class="json-string" style="color: olive">',
          r = pIndent || '';
      if (pKey)
          r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
      if (pVal)
          r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
      return r + (pEnd || '');
  };

  return JSON.stringify(jsonObject, null, 3)
             .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
             .replace(/</g, '&lt;').replace(/>/g, '&gt;')
             .replace(jsonLine, replacer);
}

async function exitTool() {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  window.location.href = path + '/exit.html';
  try {
    await fetch(path + `/exit`, {
      method: "POST",
    });
  } catch (error) {
    console.log(error);
  }
}

async function publishApiSettingsChange(evt) {
  var data = evt.dataset;
  console.log('DATA', data);

  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var rule = feed.rules

  console.log('RULE', rule);
  if (!rule) return;

  var publishSettings = rule.publishSettings ? rule.publishSettings : {};
  var el = document.getElementById(`${data.param}-publish`);
  var val = el.value;
  console.log('VAL', val);

if (data.param === 'count') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  }
  else if (data.param === 'interval') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  } else if (data.param === 'delay') {
    if (el && (parseInt(val) < parseInt(el.getAttribute('min')) || 
                parseInt(val) > parseInt(el.getAttribute('max')))) {
      val = parseInt(el.getAttribute('default'));
    }
    document.getElementById(`${data.param}-publish`).value = val;
    publishSettings[data.param] = val;
  }

  rule.publishSettings = publishSettings;
  localStorage.setItem('currentFeed', JSON.stringify(feed));

  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  await fetch(path + `/feedrules`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: localStorage.getItem('currentFeed')
  });
}

const defaultRules = localStorage.getItem('defaultRules') ? JSON.parse(localStorage.getItem('defaultRules')) : {};
