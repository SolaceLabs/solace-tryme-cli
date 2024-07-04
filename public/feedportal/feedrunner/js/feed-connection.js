// DEFAULT starting values, override here for Solace Cloud?
var currentConnSettings = {
  protocol: "SMF",
  transport: "non",
  host: "localhost",
  vpn: 'default',
  username: "default",
  password: "default",
  // do these two belong here?  Maybe outside of connection params
  qos: 'direct',    // SMF, REST: 0 == direct, 1 == persistent/guaranteed
  msgType: 'text',    // SMF only: either 'text' or 'bytes'
  prettyPrint: true
}

var defaultPorts = {};
defaultPorts['SMF'] = {};
defaultPorts['MQTT'] = {};
defaultPorts['REST'] = {};

const regexWsUrl = /^(wss?):\/\/(.+):(\d\d+)$/;  // port needs to be at least 2 digits
const regexHttpUrl = /^(https?):\/\/(.+):(\d\d+)$/;

const transportOptions = ['non', 'tls'];
const wsOptions = { 'non': 'ws', 'tls': 'wss' };
const httpOptions = { 'non': 'http', 'tls': 'https' };

var connStatus = 'disconnected';  // 'disconnected', 'connecting', 'connected', 'disconnecting'
var publisher = {};  // "global" var where our client lives

var errorCallbacks = [];
var callbacks = [];
var publishCallbacks = [];

function updateDefaultPortsForSoftwareBroker() {
  console.log('Switching to default software broker ports');
  // broker ports
  defaultPorts.SMF['non'] = 8008;
  defaultPorts.SMF['tls'] = 1443;
  defaultPorts.MQTT['non'] = 8000;
  defaultPorts.MQTT['tls'] = 8443;
  defaultPorts.REST['non'] = 9000;
  defaultPorts.REST['tls'] = 9443;
  // derived varables now...
  currentConnSettings.port = getDefaultPort();  // starting port
  d3.select('#textPort').property("value", currentConnSettings.port);
  // document.getElementById('textPort').value = currentConnSettings.port;
  d3.select('#textUrl').property("value", generateUrl());
}
// setup broker ports as default
updateDefaultPortsForSoftwareBroker();

function updateDefaultPortsForSolaceCloud() {
  console.log('Switching to remapped Solace Cloud ports');
  // Solace Cloud ports
  // maybe these should get passed in or something?  JSON object?
  defaultPorts.SMF['non'] = 80;
  defaultPorts.SMF['tls'] = 443;
  defaultPorts.MQTT['non'] = 8000;
  defaultPorts.MQTT['tls'] = 8443;
  defaultPorts.REST['non'] = 9000;
  defaultPorts.REST['tls'] = 9443;
  currentConnSettings.port = getDefaultPort();
  d3.select('#textPort').property("value", currentConnSettings.port);
  d3.select('#textUrl').property("value", generateUrl());
}

function updateConnDetailsFromObject(newConnDetails) {
  // can have any of (all optional): host, port, vpn, username, password, protocol, transport
  // current values or defaults will be used if not specified
  try {
    if (newConnDetails.host) {
      currentConnSettings.host = newConnDetails.host;
      d3.select('#textHost').property("value", currentConnSettings.host);
    }
    // set the port later, in case not defined, but transport and/or procol defined
    if (newConnDetails.vpn) {
      currentConnSettings.vpn = newConnDetails.vpn;
      d3.select('#textVpn').property("value", currentConnSettings.vpn);
    }
    if (newConnDetails.username) {
      currentConnSettings.username = newConnDetails.username;
      d3.select('#textUsername').property("value", currentConnSettings.username);
    }
    if (newConnDetails.password) {
      currentConnSettings.password = newConnDetails.password;
      d3.select('#textPassword').property("value", currentConnSettings.password);
    }
    if (newConnDetails.protocol) {
      const protocol = newConnDetails.protocol.toUpperCase();
      if (protocol == 'SMF' || protocol == 'MQTT' || protocol == 'REST') {
        currentConnSettings.protocol = protocol;
        updateselectProtocol();
      } else {
        console.error('received unexpected "protocol" value of "' + protocol + '" from remote side. Ignoring');
      }
    }
    if (newConnDetails.transport) {
      const transport = newConnDetails.transport.toLowerCase();
      if (transport == 'non' || transport == 'tls') {
        currentConnSettings.transport = transport;
        // updateselectTransport();
        updateCheckTls();
                // d3.select('#transtextPort').property("value", currentConnSettings.transport);
      } else {
        console.error('received unexpected "transport" value of "' + transport + '" from remote side. Ignoring');
      }
    }
    // possibly override default port with manually set port
    if (newConnDetails.port) {
      currentConnSettings.port = newConnDetails.port;
    } else {
      currentConnSettings.port = getDefaultPort();
    }
    d3.select('#textPort').property("value", currentConnSettings.port);
    d3.select('#textUrl').property("value", generateUrl());
  } catch (error) {
    connStatus = 'disconnected';
    notifyErrorStatus(error.message);
    console.error('caught while trying to update remotely with new connection details');
    console.error(error);
  }
}

function parseUrlAndUpdateVars(newUrl) {
  var match;
  if (currentConnSettings.protocol == 'REST') {
    console.log('it is "' + newUrl + '" here');
    match = newUrl.match(regexHttpUrl);
  } else {
    var match = newUrl.match(regexWsUrl);
  }
  if (match) {
    console.log("MATCH! " + JSON.stringify(match));
    if (match[1] == 'ws' || match[1] == 'http') {
      currentConnSettings.transport = 'non';
    } else {
      currentConnSettings.transport = 'tls';
    }
    currentConnSettings.host = match[2];
    currentConnSettings.port = +match[3];
    // currentConnSettings.url = newUrl;
  } else {
    connStatus = 'disconnected';
    console.log("NO MATCH!");
    alert('Illegal URL format for selected protocol');
    notifyErrorStatus("Illegal URL format for selected protocol");
  }
  return match;
}

/** returns a string with the derived value of URL (protocol + transport + host + port) */
function generateUrl() {
  var t = (currentConnSettings.protocol == 'REST' ? httpOptions[currentConnSettings.transport] : wsOptions[currentConnSettings.transport]);
  return t + "://" + currentConnSettings.host + ":" + currentConnSettings.port;
}

function getDefaultPort() {
  var newPort = defaultPorts[currentConnSettings.protocol][currentConnSettings.transport];
  if (!newPort) {
    console.error("Couldn't find appropriate port matching for protocol " + currentConnSettings.protocol + " and transport " + currentConnSettings.transport);
    return 0;
  }
  return newPort;
}

function updateCheckTls() {  // this replaces 
  const check = document.getElementById('checkTls');
  check.checked = currentConnSettings.transport == 'tls';
}

function updateselectProtocol() {  // one of SMF, MQTT, REST
  const select = document.getElementById('selectProtocol');
  select.value = currentConnSettings.protocol;
  updateCheckTls();
}


function guiChangeDetected() {
  // console.log(this);
  console.log("change() fired on GUI: " + this.name + ", val=" + this.value + ", id=" + this.id);
  if (this.name.startsWith('check')) {
    console.log(this.checked);
  }
  switch (this.name) {
    case 'selectProtocol':  // SMF, MQTT, REST
      // only update the port if the previous port value is non-default (i.e. it's been on-purposfully changed already)
      if (currentConnSettings.port == getDefaultPort()) {  // default port for the old protocol (haven't updated the var yet)
        currentConnSettings.protocol = this.value;
        currentConnSettings.port = getDefaultPort();
      } else {  // leave the port alone
        currentConnSettings.protocol = this.value;  // update protocol, and update other stuff
      }
      d3.select('#textPort').property("value", currentConnSettings.port);
      // currentConnSettings.url = generateUrl();  // update my var
      d3.select('#textUrl').property("value", generateUrl());
      // What about the VPN text box?  Only specified using SMF
      if (currentConnSettings.protocol == 'SMF') {
        document.getElementById('textVpn').disabled = null;
        // d3.select('#textVpn').attr('disabled', (currentConnSettings.protocol == 'SMF' ? null : 'true'));  // disable the VPN text if using MQTT or REST
        document.getElementById('textVpn').value = currentConnSettings.vpn;
      } else {
        document.getElementById('textVpn').disabled = true;
        document.getElementById('textVpn').value = 'determined by port';
      }
      if (currentConnSettings.protocol == 'MQTT') {
        for (let radio of document.querySelectorAll('input[name=radioFormat')) radio.disabled = true;
        document.getElementById('radioAtMostOnceLabel').innerHTML = '&nbsp;QoS0';
        document.getElementById('radioAtLeastOnceLabel').innerHTML = '&nbsp;QoS1';
      } else {
        for (let radio of document.querySelectorAll('input[name=radioFormat')) radio.disabled = null;
        document.getElementById('radioAtMostOnceLabel').innerHTML = '&nbsp;Direct';
        document.getElementById('radioAtLeastOnceLabel').innerHTML = '&nbsp;Guaranteed';
      }
      break;
    case 'textUrl':  // user trying to update the full URL directly in GUI, so need to parse and make sure is ok...
      var success = parseUrlAndUpdateVars(this.value);
      if (!success) {
        this.value = generateUrl();  // reset back to my previous vals  (this somehow updates the GUI)
      } else {  // all good!
        updateCheckTls();
        d3.select('#textHost').property("value", currentConnSettings.host);
        d3.select('#textPort').property("value", currentConnSettings.port);
      }
      break;
    case 'selectTransport':  // WS, WSS, HTTP, HTTPS    (OLD WAY NOW)
      // only update the port if the previous port value is non-default (i.e. it's been on-purposfully changed already)
      if (currentConnSettings.port == getDefaultPort()) {  // default port for the old protocol (haven't updated the var yet)
        currentConnSettings.transport = this.value;
        currentConnSettings.port = getDefaultPort();
      } else {  // leave the port alone
        currentConnSettings.transport = this.value;  // update transport, and update other stuff
      }
      d3.select('#textPort').property("value", currentConnSettings.port);
      // currentConnSettings.url = generateUrl();  // update my var
      // d3.select('#textUrl').property("value", currentConnSettings.url);
      d3.select('#textUrl').property("value", generateUrl());

      break;
    case 'checkTls':  // WS, WSS, HTTP, HTTPS
      // only update the port if the previous port value is non-default (i.e. it's been on-purposfully changed already)
      if (currentConnSettings.port == getDefaultPort()) {  // default port for the old protocol (haven't updated the var yet)
        currentConnSettings.transport = this.checked ? 'tls' : 'non';
        currentConnSettings.port = getDefaultPort();
      } else {  // leave the port alone
        currentConnSettings.transport = this.checked ? 'tls' : 'non';  // update transport, and update other stuff
      }
      document.getElementById('textPort').value = currentConnSettings.port;
      // d3.select('#textPort').property("value", currentConnSettings.port);
      // currentConnSettings.url = generateUrl();  // update my var
      // d3.select('#textUrl').property("value", currentConnSettings.url);
      // d3.select('#textUrl').property("value", generateUrl());
      document.getElementById('textUrl').value = generateUrl();
      break;
    case 'textHost':
      currentConnSettings.host = this.value;
      document.getElementById('textUrl').value = generateUrl();
      // d3.select('#textUrl').property("value", generateUrl());
      break;
    case 'textPort':
      if (!this.value) {  // blanked the port, so update to default for this protocol + transport
        this.value = getDefaultPort();
      }
      var newPort = +this.value;
      if (newPort > 9) {  // two digits
        currentConnSettings.port = newPort;
        d3.select('#textUrl').property("value", generateUrl());
        break;
      } else {
        this.value = currentConnSettings.port;
      }
      break;
    case 'textUsername':
      currentConnSettings.username = this.value;
      break;
    case 'textPassword':
      currentConnSettings.password = this.value;
      break;
    case 'textVpn':
      currentConnSettings.vpn = this.value;
      break;
    case 'radioQoS':
      currentConnSettings.qos = this.id == 'radioAtMostOnce' ? 'direct' : 'guaranteed';
      break;
    case 'radioFormat':
      currentConnSettings.msgType = this.id == 'radioTextMsg' ? 'text' : 'bytes';
      break;
    case 'prettyPrint':
      currentConnSettings.prettyPrint = this.checked;
      break
    }
}

// PubSub+ Interactions
function init() {
  // Initialize factory with the most recent Solace API defaults
  var factoryProps = new solace.SolclientFactoryProperties();
  factoryProps.profile = solace.SolclientFactoryProfiles.version10;
  solace.SolclientFactory.init(factoryProps);
  solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);  // INFO is too chatty
}

// connection & error callback management
function registerConnectionCallback(cb) {
  if (callbacks.includes(cb)) return;
  callbacks.push(cb);
}

function unregisterConnectionCallback(cb) {
  if (!callbacks.includes(cb)) return;
  callbacks.splice(callbacks.findIndex(cb), 1);
}

function notifyConnectionStatus(status) {
  callbacks.forEach(cb => {
    cb(status);
  })
}

// notify connection status at startup (disconnected)
notifyConnectionStatus(connStatus);

function registerErrorCallback(cb) {
  if (errorCallbacks.includes(cb)) return;
  errorCallbacks.push(cb);
}

function unregisterErrorCallback(cb) {
  if (!errorCallbacks.includes(cb)) return;
  errorCallbacks.splice(errorCallbacks.findIndex(cb), 1);
}

function notifyErrorStatus(status) {
  errorCallbacks.forEach(cb => {
    cb(status);
  })
}

// successful publish callback management
function registerPublishCallback(cb) {
  if (publishCallbacks.includes(cb)) return;
  publishCallbacks.push(cb);
}

function unregisterPublishCallback(cb) {
  if (!publishCallbacks.includes(cb)) return;
  publishCallbacks.splice(publishCallbacks.findIndex(cb), 1);
}

function notifySuccessfulPublish(topic, payload, msgName, publishKey) {
  publishCallbacks.forEach(cb => {
    cb(topic, payload, publishKey, msgName);
  })
}

function connectButtonClicked(callback = null) {
  // are we already connected?  Maybe need to disconnect..!
  if (connStatus == 'connected') {
    // this will initiate a disconnection...
    connStatus = 'disconnecting';
    notifyConnectionStatus(connStatus);
    switch (currentConnSettings.protocol) {
      // these will trigger the 'onDisconnect' event handlers
      case 'SMF':
        if (!publisher.session) return;
        publisher.session.disconnect();
        return;
      case 'MQTT':
        if (!publisher.client) return;
        publisher.client.end();
        return;
      case 'REST':
        // since this is stateless, we need to update the connection button and other stuff manually
        updateConnectionPanelAfterDisconnect();
        return;
    }
  }


  if (connStatus != 'disconnected') return;
  connStatus = 'connecting';
  notifyConnectionStatus(connStatus);
  // start the connection process
  d3.selectAll('.connInput').attr('disabled', true);   // could also use selectors on ID or name: https://stackoverflow.com/questions/8714090/how-to-do-a-wildcard-element-name-match-with-queryselector-or-queryselector
  switch (currentConnSettings.protocol) {
    case 'SMF':
      publisher.session = null;
      try {
        publisher.session = solace.SolclientFactory.createSession({
          // solace.SessionProperties
          // DO WE GRAB FROM THE GUI OR FROM OUR INTERNAL OBJECT?????
          url: generateUrl(),
          vpnName: currentConnSettings.vpn,
          userName: currentConnSettings.username,
          password: currentConnSettings.password ? currentConnSettings.password : "",
          connectRetries: 0,
        });
        // define session event listeners
        publisher.session.on(solace.SessionEventCode.UP_NOTICE, function (sessionEvent) {
          // console.log('=== Successfully connected and ready to publish messages. ===');
          // console.log(sessionEvent);
          onConnectSuccess();
        });
        publisher.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, function (sessionEvent) {
          console.log('CONNECT_FAILED_ERROR Connection failed to the message router: ' + sessionEvent.infoStr +
            ' - check correct parameter values and connectivity!');
          onConnectFailure(sessionEvent.infoStr);
        });
        publisher.session.on(solace.SessionEventCode.DOWN_ERROR, function (sessionEvent) {
          console.log('DOWN_ERROR Connection failed to the message router: ' + sessionEvent.infoStr +
            ' - check correct parameter values and connectivity!');
          onConnectFailure(sessionEvent.infoStr);
        });
        publisher.session.on(solace.SessionEventCode.DISCONNECTED, function (sessionEvent) {
          console.log('Disconnected.');
          onDisconnect(sessionEvent.infoStr);
        });
        // if all looks ok try to connect!
        publisher.session.connect();
      } catch (error) {
        d3.selectAll('.connInput').attr('disabled', null);
        notifyErrorStatus(error.message);
        console.log(error.toString());
        updateConnectionPanelAfterDisconnect();
      }
      break;
    case 'MQTT':
      // publisher = {};
      var connSettings = { protocolVersion: 5, resubscribe: true, reconnectPeriod: 1000 };  // anything else to add here?
      if (currentConnSettings.username) connSettings.username = currentConnSettings.username;
      if (currentConnSettings.password) connSettings.password = currentConnSettings.password;
      publisher.client = mqtt.connect(wsOptions[currentConnSettings.transport] + '://' + currentConnSettings.host + ':' + currentConnSettings.port, connSettings);

      publisher.client.on("connect", () => {
        onConnectSuccess();
      });
      publisher.client.on('error', function (err) {
        d3.selectAll('.connInput').attr('disabled', null);
        console.log(new Date() + " ERRROROROROROOR");
        console.log(err);
        onConnectFailure(err);
      });
      publisher.client.on('close', function (err) {
        d3.selectAll('.connInput').attr('disabled', null);
        console.log(new Date() + " CLOSE");
        onDisconnect(err);
      });
      break;

    case 'REST':
      // curl -u pq:pq http://pq.messaging.solace.cloud:9000/QUEUE/a/b/c -X POST -v -H "Solace-Delivery-Mode: Direct"    generates 200OK,  good enough to prove conneciton
      console.log(currentConnSettings.username);
      console.log(currentConnSettings.password);
      
      let headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(currentConnSettings.username + ":" + currentConnSettings.password));
      headers.set('Content-Type', 'text/plain');
      headers.set('Solace-Delivery-Mode', 'direct');

      var postUrl = generateUrl() + `/${currentConnSettings.username}/test`;
      console.log(postUrl);
      fetch(postUrl, {
        method: 'POST',
        credentials: 'same-origin',
        // cache: 'no-cache',
        mode: "no-cors",
        // headers: headers
        headers: { "Authorization": 'Basic ' + btoa(currentConnSettings.username + ":" + currentConnSettings.password) }
      })
        .then(response => {
          console.log(response);
          onConnectSuccess();
          return;
        })  // initial SEMPv2 queue fetch block
        .catch(error => {
          d3.selectAll('.connInput').attr('disabled', null);
          notifyErrorStatus("Error when trying to connect to Solace REST Messaging");
          console.error("Error when trying to connect to Solace REST Messaging");
          console.error(error);
          onConnectFailure('REST connection failed');
          updateConnectionPanelAfterDisconnect();
        });
      break;

  }

  if (callback) callback(connStatus);
}

function onConnectSuccess() {
  console.log("Connected!");
  connStatus = 'connected';
  notifyConnectionStatus(connStatus);

  d3.select('#buttonConnect')
    .attr('disabled', null)
    .text("Disconnect")
    .style('border-color', getComputedStyle(document.documentElement).getPropertyValue('--text'));
}

// MQTT doesn't call this apparently
function onConnectFailure(something) {
  if (connStatus == 'connected') {
    console.log("LOST CONNECTION!" + (something ? " " + something : ""));
  }
  onDisconnect(something);
}

function onDisconnect(something) {
  console.log("Disconnected!");
  if (connStatus == 'connecting') {  // was in the process of trying to connect..!
    console.log("Couldn't connect!" + (something ? " " + something : ""));
    notifyErrorStatus("Couldn't connect!" + (something ? " " + something : ""));
  } else if (connStatus != 'disconnecting') {  // mqtt goes here
    console.log("LOST CONNECTION!" + (something ? " " + something : ""));
    notifyErrorStatus("LOST CONNECTION!" + (something ? " " + something : ""));
  }
  switch (currentConnSettings.protocol) {
    case 'SMF':
      if (publisher.session) {
        publisher.session.dispose();
        publisher.session = null;
      }
      break;
    case 'MQTT':
      if (publisher.client) {
        publisher.client.end();
        publisher.client = null;
      }
      break;
    // no connection cleanup for REST
  }
  updateConnectionPanelAfterDisconnect();
}

function updateConnectionPanelAfterDisconnect() {
  d3.selectAll('.connInput').attr('disabled', null);
  d3.select('#textVpn').attr('disabled', (currentConnSettings.protocol == 'SMF' ? null : 'true'));  // disable the VPN text if using MQTT or REST
  d3.select('#buttonConnect').attr('disabled', null)
    .text("Connect")
    .style('border-color', '#00c895');
  if (connStatus === 'disconnecting')
    notifyConnectionStatus('disconnected');
  connStatus = 'disconnected';
}

async function postData(topic = "", data = {}) {  
  var postUrl = generateUrl() + '/' + topic;
  console.log(postUrl);

  fetch(postUrl, {
    method: 'POST',
    credentials: 'same-origin',
    mode: "no-cors",
    // headers: { "Authorization": 'Basic ' + btoa(currentConnSettings.username + ":" + currentConnSettings.password) },
    body: data,
  })
    .then(response => {
      console.log(response);
    })  // initial SEMPv2 queue fetch block
    .catch(error => {
      notifyErrorStatus(error.message);
      console.error("Error when trying send a message to Solace REST Messaging");
      console.error(error);
    });
}

async function publish(topic, payload, partitionKey, msgName, publishKey) {
  if (connStatus != 'connected') {
    notifyErrorStatus('Not connected to broker!');
    return;
  }
  
  switch (currentConnSettings.protocol) {
    case 'SMF':
      // var messageText = 'Sample Message';
      var message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(topic));
      if (currentConnSettings.msgType == 'text') {
        if (!isEmpty(payload)) message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STRING, JSON.stringify(payload)));
      } else {
        if (!isEmpty(payload)) message.setBinaryAttachment(typeof payload === 'object' ? JSON.stringify(payload) : payload);  // binary msg
      }
      if (currentConnSettings.qos == 'direct') {
        // solace.MessageDeliveryModeType.DIRECT;
        message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
      } else {
        // solace.MessageDeliveryModeType.PERSISTENT;
        message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
        // message.setCorrelationKey(message);
        if (partitionKey) {
          var map = new solace.SDTMapContainer();
          map.addField('JMSXGroupId', solace.STRING, 'pqKey');
          message.setUserPropertyMap(map);
        }
      }
      try {
          publisher.session.send(message);
        } catch (error) {
          notifyErrorStatus(error.message);
          console.log(error.toString());
          return;
      }
      break;

    case 'MQTT':
      try {
        var options = {};
        options.qos = currentConnSettings.qos == 'direct' ? 0 : 1;
        if (options.qos == 1 && partitionKey) {
          options.properties =  { userProperties: { JMSXGroupId: partitionKey }};
          options.properties.payloadFormatIndicator = true;
        }

        if (!isEmpty(payload)) payload = (typeof payload === 'object') ? JSON.stringify(payload) : payload;  // binary msg

        publisher.client.publish(topic, payload, options);
      } catch (error) {  // i have no idea if pubish throws off any errors?
        notifyErrorStatus(error.message);
        console.error("error during MQTT publish!!");
        console.error(error);
        return;
      }
      break;

    case 'REST':
      // just a post!  Hopefully we're in messaging mode
      if (!isEmpty(payload)) payload = (typeof payload === 'object') ? JSON.stringify(payload) : payload;
      try {
        await postData(topic, payload);
      } catch (error) {  // i have no idea if pubish throws off any errors?
        notifyErrorStatus(error.message);
        console.error("error during REST publish!!");
        console.error(error);
        return;
      }
      break;
  }

  // if we made it here, it was successful
  notifySuccessfulPublish(topic, payload, msgName, publishKey);
}