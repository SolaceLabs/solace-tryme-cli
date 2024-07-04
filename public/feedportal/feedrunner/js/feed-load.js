const communityRepoUrl = 'https://github.com/solacecommunity/solace-event-feeds';
const communityRepoRawUrl = 'https://raw.githubusercontent.com';
const communityUserName = 'solacecommunity';
const communityRepoName = 'solace-event-feeds';
const communityFeedsJson = 'EVENT_FEEDS.json';

var selectedMessages = [];
var eventFeedTimers = [];
var source = undefined;
var feedName = undefined;
var eventFeed = undefined;
var connected = false;
var publishStats = {};

document.addEventListener("DOMContentLoaded", async () => {
  $.ajaxSetup({
      cache: false
  })

  registerConnectionCallback(connectionStatusCallback);
  registerErrorCallback(errorCallback);
  registerPublishCallback(addToConsole);
  
  const currLoc = $(location).attr('href');
  const url = new URL(currLoc);
  feedName = url.searchParams.get('feed');
  source = url.searchParams.get('source');
  console.log('URL', url.searchParams.get('feed'));

  showFeedInfo();

  d3.selectAll("input").on("change", guiChangeDetected);

  $('#load-file').on('click', (e) => {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
		reader.onload = function(e) {
			var contents = e.target.result;
			// fileInput.func(contents)
			// document.body.removeChild(fileInput)
      try {
        var json = JSON.parse(contents);
        console.log(json);
      } catch (error) {
        console.log('Failed to read');
      }
  
		}
		reader.readAsText(file)
  })

  $('#connecton-load').on('change', (e) => {
    var all_files = e.target.files;
    if(all_files.length == 0) return;
  
    var file = all_files[0];
    var reader = new FileReader();
    reader.addEventListener('load', function(e) {
      var text = e.target.result;
      if (text) {
        try {
          var json = JSON.parse(text);
          var jsonKeys = Object.keys(json);
          if (!jsonKeys.includes('prettyPrint')) jsonKeys.push('prettyPrint');

          Object.keys(currentConnSettings).forEach(key => {
            if (!jsonKeys.includes(key)) {
              throw new Error("Invalid");
            }
          })
          updateConnDetailsFromObject(json);
        } catch (error) { 
          alert('Invalid file');
          return;
        }
      }
    });
  
    reader.readAsText(file);  
  })

  $('#connecton-save').on('click', () => {
    const link = document.createElement("a");
    const content = JSON.stringify(currentConnSettings, null, 4);
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "broker-connection.json";
    link.click();
    URL.revokeObjectURL(link.href);
  })

  $('#show-hide-settings').on('click', () => {
    $("#accordionFeedSettings").toggle();
    var btn = document.getElementById("show-hide-settings");
    if (btn.children[0].classList.contains('bi-arrows-angle-contract')) {
      btn.children[0].classList.remove('bi-arrows-angle-contract');
      btn.children[0].classList.add('bi-arrows-angle-expand');
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    } else {
      btn.children[0].classList.remove('bi-arrows-angle-expand');
      btn.children[0].classList.add('bi-arrows-angle-contract');
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  })

  $('#empty-log-content').hide();
  $('#empty-log-content').on('click', () => {
    $('#scrollbox').empty();
    $('#empty-log-content').hide();
  })

  $('#scrollbox').on('mouseover', () => {
    if ($('#scrollbox').is(':empty'))
      $('#empty-log-content').hide();
    else      
      $('#empty-log-content').show();
  })

  $('.connInput').on("change", guiChangeDetected);
  
  $('#select-all').on('click', () => {
    var els = document.getElementsByName('eventCheckboxes');  
    // els.forEach(el => el.checked = true)
    els.forEach(el => { el.checked = true; onEventSelection(el) });
    setTimeout(() => { $('#collapseEvents').collapse('toggle') }, 1000);
    $('#select-all').html('<i class="bi bi-check-square-fill"></i>&nbsp;Select All');
    $('#select-none').html('<i class="bi bi-square"></i>&nbsp;Select None');
  })

  $('#select-none').on('click', () => {
    var els = document.getElementsByName('eventCheckboxes');  
    els.forEach(el => { el.checked = false; onEventSelection(el) });
    $('#select-none').html('<i class="bi bi-check-square-fill"></i>&nbsp;Select None');
    $('#select-all').html('<i class="bi bi-square"></i>&nbsp;Select All');
  })

});

async function copyMessageToClipboard(msgId) {
  if (!msgId) return;
  var content = $(`#${msgId}`).text();
  console.log(content);
  var parts = content.split('::');
  if (parts.length < 2) return;

  var payload = parts[1].trim();
  var copyContent = '';
  try {
    var json = JSON.parse(payload);
    copyContent = JSON.stringify(json, null, 2);
  } catch (error) {
    copyContent = payload;
  }

  await navigator.clipboard.writeText(copyContent);
  toastr.success('Copied to clipboard.')
}

function countChange() {
  var index = selectedMessages.findIndex(m => m.message === this.event.target.dataset.message && m.topic === this.event.target.dataset.topic);
  if (index < 0) return;

  selectedMessages[index].count = this.event.target.value;
}

function intervalChange() {
  var index = selectedMessages.findIndex(m => m.message === this.event.target.dataset.message && m.topic === this.event.target.dataset.topic);
  if (index < 0) return;

  selectedMessages[index].interval = this.event.target.value;
}

function delayChange() {
  var index = selectedMessages.findIndex(m => m.message === this.event.target.dataset.message && m.topic === this.event.target.dataset.topic);
  if (index < 0) return;

  selectedMessages[index].delay = this.event.target.value;
}

function onEventSelection(el = null) {
  el = el ? el : this.event.target;
  console.log(el.dataset, el.checked);
  var index = selectedMessages.findIndex(m => m.message === el.dataset.message && m.topic === el.dataset.topic);
  if (el.checked) {
    if (index < 0) 
      selectedMessages.push({
        message: el.dataset.message, 
        topic: el.dataset.topic,
        count: parseInt($(`#count-${el.dataset.message}`).val()),
        interval: parseInt($(`#interval-${el.dataset.message}`).val()),
        delay: parseInt($(`#delay-${el.dataset.message}`).val()),
      });
      $(`#count-${el.dataset.message}`).prop( "disabled", false );
      $(`#interval-${el.dataset.message}`).prop( "disabled", false );
      $(`#delay-${el.dataset.message}`).prop( "disabled", false );
  } else if (index >= 0) {
    selectedMessages.splice(index, 1);
    $(`#count-${el.dataset.message}`).prop( "disabled", true );
    $(`#interval-${el.dataset.message}`).prop( "disabled", true );
    $(`#delay-${el.dataset.message}`).prop( "disabled", true );
  }

  if (selectedMessages.length) {
    document.getElementById('event-icon').classList.remove('bxs-message-square-dots')
    document.getElementById('event-icon').classList.add('bxs-message-square-check')  
    document.getElementById('event-icon').classList.add('color-green');

    if (connected) {
      document.getElementById('start-feed').classList.remove('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    } else {
      document.getElementById('start-feed').classList.add('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    }
  } else {
    document.getElementById('event-icon').classList.add('bxs-message-square-dots')
    document.getElementById('event-icon').classList.remove('bxs-message-square-check')  
    document.getElementById('event-icon').classList.remove('color-green');

    document.getElementById('start-feed').classList.add('disabled');
    document.getElementById('stop-feed').classList.add('disabled');
  }

  console.log(selectedMessages);
}

function connectToBroker() {
  init();
  connectButtonClicked(connectionStatusCallback);
  setTimeout(() => { 
    $('#collapseBroker').collapse('toggle');
    $('#collapseEvents').collapse('toggle');
   }, 1000);
}

function errorCallback(errorMessage) {
  var parent = $('#feed-status-log');
  var id = Date.now();
  while ($(`#${id}`).length) { id = Date.now(); console.log('bummer1...')}

  parent.append(`<div id='${id}' class='feed-error'>${errorMessage}</div>`);
  $('#feed-status-log').show();
  setTimeout(function () {
    $.each($(`#${id}`), function() { 
      var el = $(this);
      el.fadeOut('slow');
    });
  }, 3000);
}

function statusCallback(message) {
  var parent = $('#feed-status-log');
  var id = Date.now();
  while ($(`#${id}`).length) { id = Date.now(); console.log('bummer2...')}

  parent.append(`<div id='${id}' class='feed-status'>${message}</div>`);
  $('#feed-status-log').show();
  setTimeout(function () {
    $.each($(`#${id}`), function() { 
      var el = $(this);
      el.fadeOut('slow');
    });
  }, 3000);
}

function connectionStatusCallback(status) {
  console.log('Connections status update: ', status);

  if (status === 'connected') {
    connected = true;
    statusCallback('Successfully connected to broker.')

    document.getElementById('broker-icon').classList.remove('bxs-message-square-dots')
    document.getElementById('broker-icon').classList.add('bxs-message-square-check')  
    document.getElementById("broker-icon").classList.add('color-green');
    document.getElementById('connected-icon').classList.remove('bx-wifi-off');
    document.getElementById('connected-icon').classList.add('bx-wifi');
    document.getElementById('connected-icon').style.color = 'green';
    document.getElementById("connect-broker").innerHTML = 'Disconnect';

    if (selectedMessages.length) {
      document.getElementById('start-feed').classList.remove('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    } else {
      document.getElementById('start-feed').classList.add('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    }
  
  } else if (status === 'disconnected') {
    connected = false;
    errorCallback('Disconnected from broker.');

    document.getElementById('broker-icon').classList.add('bxs-message-square-dots')
    document.getElementById('broker-icon').classList.remove('bxs-message-square-check')  
    document.getElementById("broker-icon").classList.remove('color-green');
    document.getElementById('connected-icon').classList.add('bx-wifi-off');
    document.getElementById('connected-icon').classList.remove('bx-wifi');
    document.getElementById('connected-icon').style.color = 'red';
    document.getElementById("connect-broker").innerHTML = 'Connect';

    if (selectedMessages.length) {
      document.getElementById('start-feed').classList.remove('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    } else {
      document.getElementById('start-feed').classList.add('disabled');
      document.getElementById('stop-feed').classList.add('disabled');
    }
  }
}

async function loadFeed() {
  if (eventFeed) return eventFeed;
  eventFeed = await getFeed(feedName, source)
  return eventFeed;
}

function delayedStart(msg) {
  $('#show-hide-settings').click();

  sleep(msg.delay * 1000).then(() => { 
    console.log(msg);
    if (msg.delay)
      statusCallback(`Delayed start of event feed for <b>${msg.message}</b> [${msg.delay} secs]`)
    else
      statusCallback(`Starting event feed for <b>${msg.message}</b>`)

    eventFeedTimers.push({
      name: msg.message,
      message: msg,
      timer: setInterval(publishEvent, msg.interval * 1000, msg)
    });
  });

}
async function startFeed() {
  for (var i=0; i<selectedMessages.length; i++) {
    delayedStart(selectedMessages[i]);
  }

  $('#collapseInfo').collapse('hide');
  $('#collapseEvents').collapse('hide');
  $('#collapseBroker ').collapse('hide');
  document.getElementById('start-feed').classList.add('disabled');
  document.getElementById('stop-feed').classList.remove('disabled');
}

async function publishEvent(msg) {
  var feed = await loadFeed();
  var info = feed.getInfo();

  if (info.type === 'asyncapi_feed') {
    var rules = feed.getFeedParam("rules");
    var rule = rules.find((r) => r.messageName === msg.message && r.topic === msg.topic);
    if (!rule) return;

    var events = await fakeEventGenerator({rule, count: 1});  
    events.forEach(event => {
      publish(event.topic, event.payload, event.pqKey, msg.message, `${msg.message}-${msg.topic}`);
      console.log(Date.now() + ': Publishing...', msg.message, event.topic)
      if (publishStats[`${msg.message}-${msg.topic}`] >= msg.count) {
        var index = eventFeedTimers.findIndex((t) => t.name === msg.message);
        if (index < 0) {
          errorCallback('Hmm... could not find the timer');
          return;
        }
        clearInterval(eventFeedTimers[index].timer);
        statusCallback(`Event feed <b>${msg.message}</b> completed - Published ${msg.count} events`);
        eventFeedTimers.splice(index, 1);
        publishStats[`${msg.message}-${msg.topic}`] = 0;
        if (!eventFeedTimers.length) {
          document.getElementById('start-feed').classList.remove('disabled');
          document.getElementById('stop-feed').classList.add('disabled');
        }
      }
    });
  } else if (info.type === 'restapi_feed') {
    var events = [];
    var api = feed.getFeedParam('api');
    var apiUrl = api.apiUrl;
    var apiAuthType = api.apiAuthType;
    var apiKey = api.apiKey;
    var apiKeyUrlEmbedded = api.apiKeyUrlEmbedded;
    var apiToken = api.apiToken;
    var xapiPairs = api.xapiPairs;

    if (apiAuthType === 'API Key' && api.apiKeyUrlEmbedded) 
      apiUrl = apiUrl.replaceAll(`$${api.apiKeyUrlParam}`, apiKey);
  
    var apiRules = feed.getFeedParam('rules');
    var params = Object.keys(apiRules.rules);
    var ruleData = {};
    if (params.length > 0) {
      for (var i=0; i<params.length; i++) {
        ruleData[params[i]] = await fakeDataValueGenerator({rule: apiRules.rules[params[i]].rule, count: 1});
      }
    }
  
    var topic = api.topic;
    var payload = {};

    var headers = { Accept: 'application/json' };
    if (apiAuthType === 'Basic Authentication') {
      headers['Authorization'] = `Basic ${apiToken}`;
    } else if (apiAuthType === 'Token Authentication') {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else if (apiAuthType === 'API Key' && !apiKeyUrlEmbedded) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiAuthType === 'X-API Authentication') {
      for (var i=0; i<xapiPairs.length; i++) {
        var xPair = xapiPairs[i];
        headers[xPair.key] = xPair.value;
      }
    }
  
    try {
      var url = apiUrl;
      for (var j=0; j<params.length; j++) {
        url = url.replaceAll(`$${params[j]}`, ruleData[params[j]]);
        topic = topic.replaceAll(`$${params[j]}`, ruleData[params[j]]);
      }
      payload = await (await fetch(`${url}`, {
        headers: headers
      })).json();
      console.log(payload);
    } catch (error) {
      payload = { error: `fetch from api endpoint list failed with error - ${error.toString()}` };
    }

    publish(topic, payload, null, api.topic, `${msg.message}-${api.topic}`);
    console.log(Date.now() + ': Publishing...', msg.message, topic)
    if (publishStats[`${msg.message}-${api.topic}`] >= msg.count) {
      var index = eventFeedTimers.findIndex((t) => t.name === msg.message);
      if (index < 0) {
        errorCallback('Hmm... could not find the timer');
        return;
      }
      clearInterval(eventFeedTimers[index].timer);
      statusCallback(`Event feed <b>${info.name}</b> completed - Published ${msg.count} events`);
      eventFeedTimers.splice(index, 1);
      publishStats[`${msg.message}-${api.topic}`] = 0;
      if (!eventFeedTimers.length) {
        document.getElementById('start-feed').classList.remove('disabled');
        document.getElementById('stop-feed').classList.add('disabled');
      }
    }
  }
}

async function stopFeed() {
  var feed = await loadFeed();  
  var info = feed.getInfo();

  eventFeedTimers.forEach(eventFeedTimer => {
    clearInterval(eventFeedTimer.timer);
  })
  eventFeedTimers = [];

  selectedMessages.forEach((msg) => {
    publishStats[`${msg.message}-${msg.topic}`] = 0;
  });

  document.getElementById('start-feed').classList.remove('disabled');
  document.getElementById('stop-feed').classList.add('disabled');
  statusCallback(`Stopped event feed successfully.`);
}

function toggleMessageSettings(id) {
  $(id).toggle();
}

async function showFeedInfo() {  
  try {
    var feed = await loadFeed();  
    if (document.body.classList.contains("toggle-sidebar")) 
      document.body.classList.toggle("toggle-sidebar");
    var info = feed.getInfo();
    $(".feed-title").each(function (index, element) {
      element.innerHTML = info.name;
    });
    $(".feed-description").each(function (index, element) {
      element.innerHTML = info.description;
    });
    

    var parent = $('#feed-events');

    var messages = feed.getSendMessages();

    if (info.type === 'asyncapi_feed') {
      messages.forEach((msg, index) => {
        var item = `
        <div class="list-group-item list-group-item-action feed-event-item mb-3 mt-3" aria-current="true">
          <div class="d-flex flex-column">
            <div>
              <div class="d-flex w-100 justify-content-between">
                <div class="d-flex w-100">
                  <input selection-border me-1" type="checkbox" checked name="eventCheckboxes" id="eventCheckbox${index}" 
                    data-message="${msg.messageName}" data-topic="${msg.topicName}" data-count="${msg.count}" 
                    data-interval="${msg.interval}" data-delay="${msg.delay}" 
                    value="option1" aria-label="..." onchange="onEventSelection()">
                  <h5 class="mb-1">&nbsp;${msg.messageName}</h5>
                </div>
                <div>
                  <a href="#" class="show-advanced-settings d-flex align-items-center justify-content-center"
                    data-message="${msg.messageName}" onclick="toggleMessageSettings('#settings-${msg.messageName}')">
                    <i class="bi bi-gear"></i>
                  </a>        
                </div>
              </div>
              ${msg.description ? `<small>${msg.description}</small>` : `<span/>`}   
              <p class="mt-3 mb-1 small"><strong>Topic: </strong>${msg.topicName}</p>
              ${msg.schema ? `<p class="mb-1 small"><strong>Schema: </strong>${msg.schema}</p>` : `<span/>`}
              <div id="settings-${msg.messageName}" style="display:none;">
                <hr class="trans--fit hr1">
                <div class="d-flex flex-row flex-start">
                  <div class="me-3">
                    <label for="count-${msg.messageName}" class="small">No. of Events</label>
                    <input id="count-${msg.messageName}" data-message=${msg.messageName} data-topic=${msg.topicName}
                        type="number" class="form-control" value="${msg.count}" min="1" max="1000" onchange="countChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 1 to 1000</span>
                  </div>
                  <div class="me-3">
                    <label for="interval-${msg.messageName}" class="small">Interval (secs)</label>
                    <input id="interval-${msg.messageName}" data-message=${msg.messageName} data-topic=${msg.topicName}
                      type="number" class="form-control" value="${msg.interval}" min="1" max="30" onchange="intervalChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 1 to 30 secs</span>
                  </div>
                  <div class="me-3">
                    <label for="delay-${msg.messageName}" class="small">Initial Delay (secs)</label>
                    <input id="delay-${msg.messageName}" data-message=${msg.messageName} data-topic=${msg.topicName}
                        type="number" class="form-control" value="${msg.delay}" min="0" max="30" onchange="delayChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 0 to 30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        `
        parent.append(item);
      })
    } else if (info.type === 'restapi_feed') {
      messages.forEach((msg, index) => {
      var item = `
        <div class="list-group-item list-group-item-action feed-event-item mb-3 mt-3" aria-current="true">
          <div class="d-flex flex-column">
            <div>
              <div class="d-flex w-100 justify-content-between">
                <div class="d-flex w-100">
                  <input selection-border me-1" type="checkbox" name="eventCheckboxes" id="eventCheckbox${index}" 
                    data-message="${msg.simplifiedName}" data-topic="${msg.topicName}" data-count="${msg.count}" 
                    data-interval="${msg.interval}" data-delay="${msg.delay}" 
                    value="option1" aria-label="..." onchange="onEventSelection()">
                  <h5 class="mb-1">&nbsp;${msg.messageName}</h5>
                </div>
                <div>
                  <a href="#" class="show-advanced-settings d-flex align-items-center justify-content-center"
                    data-message="${msg.simplifiedName}" onclick="toggleMessageSettings('#settings-${msg.simplifiedName}')">
                    <i class="bi bi-gear"></i>
                  </a>        
                </div>
              </div>
              ${msg.description ? `<small>${msg.description}</small>` : `<span/>`}   
              ${msg.apiUrl ? `<p class="mb-1 small"><strong>API Endpoint: </strong>${msg.apiUrl}</p>` : `<span/>`}
              <p class="mt-3 mb-1 small"><strong>Topic: </strong>${msg.topicName}</p>
              <div id="settings-${msg.simplifiedName}" style="display:none;">
                <hr class="trans--fit hr1">
                <div class="d-flex flex-row flex-start">
                  <div class="me-3">
                    <label for="count-${msg.simplifiedName}" class="small">No. of Events</label>
                    <input id="count-${msg.simplifiedName}" data-message=${msg.simplifiedName} data-topic=${msg.topicName}
                        type="number" class="form-control" value="${msg.count}" min="1" max="1000" onchange="countChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 1 to 1000</span>
                  </div>
                  <div class="me-3">
                    <label for="interval-${msg.simplifiedName}" class="small">Interval (secs)</label>
                    <input id="interval-${msg.simplifiedName}" data-message=${msg.simplifiedName} data-topic=${msg.topicName}
                      type="number" class="form-control" value="${msg.interval}" min="1" max="30" onchange="intervalChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 1 to 30 secs</span>
                  </div>
                  <div class="me-3">
                    <label for="delay-${msg.simplifiedName}" class="small">Initial Delay (secs)</label>
                    <input id="delay-${msg.simplifiedName}" data-message=${msg.simplifiedName} data-topic=${msg.topicName}
                        type="number" class="form-control" value="${msg.delay}" min="0" max="30" onchange="delayChange()" disabled>
                    <span style="font-size: 0.75rem;">Range: 0 to 30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        `
        parent.append(item);

      })
    }

    parent = $('#feed-info-body');
    var keys = Object.keys(info);
    for (var i=0; i<keys.length; i++) {
      var feed = `
      <tr>
        <th scope="row">${camelCaseToWords(keys[i])}</th>
        <td>${info[keys[i]]}</td>
      </tr>`;
  
      parent.append( feed);
    }
    
    console.log(info);
    var els = document.getElementsByName('eventCheckboxes');  
    els.forEach(el => { el.checked = true; onEventSelection(el) });
    $('#select-all').html('<i class="bi bi-check-square-fill"></i>&nbsp;Select All');
    $('#select-none').html('<i class="bi bi-square"></i>&nbsp;Select None');

  } catch (error) {
    console.log(`'load feed info failed: ${error.toString()} (${error.cause?.message} ? [${error.cause?.message}] : ''`);
  }
}
function addToConsole(topic, payload, publishKey, msgName) {
  var msgId = msgName.replaceAll('$', '').replaceAll('/', '-').toLowerCase();
  publishStats[publishKey] = publishStats[publishKey] ? publishStats[publishKey] + 1 : 1;
  // consoleLines.push(str);
  var div = document.getElementById('scrollbox');
  var msgPrint = currentConnSettings.prettyPrint ?
                    topic + (payload ? ' :: ' + ((typeof payload === 'object') ? JSON.stringify(payload, null, 2) : payload) : '') :
                    topic + (payload ? ' :: ' + ((typeof payload === 'object') ? JSON.stringify(payload).trim() : payload) : '');
  var newMsg = `<p>` +
                  (payload ?
                    `<span id="copy-message-to-clipboard" onclick="copyMessageToClipboard('${msgId + '-' + publishStats[publishKey]}')">
                      <span class="badge rounded-pill copy-to-clipboard me-2">
                        <i class="bx bxs-copy-alt" aria-hidden="true"></i>
                      </span>
                    </span>` : '') +                    
                  (payload ?
                    `<span class="badge rounded-pill feed-msg-counter me-2">${publishStats[publishKey]}</span>` :
                    `<span class="badge rounded-pill feed-msg-counter me-2 empty-clipboard">${publishStats[publishKey]}</span>`) +
                  `<span class="badge rounded-pill feed-msg-name me-2">${msgName}</span>` +
                  (currentConnSettings.prettyPrint ?
                    `<pre id="${msgId + '-' + publishStats[publishKey]}">${msgPrint}</pre>` :
                    `<span id="${msgId + '-' + publishStats[publishKey]}">${msgPrint}</span>`) +
                `</p>\n`;
  div.innerHTML += newMsg;  // new message at bottom
  // div.innerHTML = newMsg + div.innerHTML;  // new message at top
  if (div.children.length > 25) {
    // consoleLines.shift();
    // div.children[0].remove();  // pop the oldest message off (new message at bottom)
    div.children[25].remove(); // pop the oldest message off (new message on top)
  }
  div.scrollTop = div.scrollHeight;

}
