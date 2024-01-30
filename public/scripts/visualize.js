const STM_CLIENT_CONNECTED = '@STM/cli/client/connected'
const STM_CLIENT_DISCONNECTED = '@STM/cli/client/disconnected'
const STM_CLIENT_RECONNECTED = '@STM/cli/client/reconnected'
const STM_EVENT_PUBLISHED = '@STM/cli/event/published'
const STM_EVENT_RECEIVED = '@STM/cli/event/received'
const STM_EVENT_REQUESTED = '@STM/cli/event/requested'
const STM_EVENT_REQUEST_RECEIVED = '@STM/cli/event/requestreceived'
const STM_EVENT_REPLIED = '@STM/cli/event/replied'
const STM_EVENT_REPLY_RECEIVED = '@STM/cli/event/replyreceived'

const svgNS = 'http://www.w3.org/2000/svg';
const gridSpacing = 25;
var mySvg = null;
var gridSvg = null;

var width = null
var height = null;

var navOpen = false;
var client = null;

const local = {
  events: [],
  clients: [],
  broker: {},
  publishedCount: {},
  receivedCount: {},
  speed: 1,
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function stmMessageReceived(message) {
	let topic = message.destinationName;
	const payload = JSON.parse(message.payloadString);

	let event = {action: topic, played: false, playing: false, ...payload};

  if ([STM_EVENT_RECEIVED, STM_EVENT_REPLIED, STM_EVENT_REQUEST_RECEIVED, STM_EVENT_REPLY_RECEIVED].includes(event.action)) {
    let clients = local.clients;
    let clIndex = clients.findIndex(cl => cl.clientName === event.clientName && cl.type === event.type && cl.zombie);
    let evIndex = local.events.findIndex(ev => ev.clientName === event.clientName && ev.type === event.type);
    if (clIndex < 0 && evIndex < 0) {
      console.log('Message from (past client)', payload)
      let _event = {action: STM_CLIENT_CONNECTED, played: false, 
                    playing: false, zombie: true, ...payload, uuid: payload.uuid + '-' + local.events.length};
      local.events.push(_event)
      let eventEntry = `<li>${_event.action}<br>${_event.clientName}<br>${_event.type.toUpperCase()}</li>`
      document.getElementById('events').insertAdjacentHTML('beforeend', eventEntry);
    }
  }

	local.events.push(event)
  let eventEntry = `<li>${event.action}<br>${event.clientName}<br>${event.type.toUpperCase()}</li>`
  document.getElementById('events').insertAdjacentHTML('beforeend', eventEntry);
}

function solaceClientConnected() {
  if (client.connected) {
    local.broker.connected = true;
		renderBroker();
    client.subscribe(`@STM/#`, stmMessageReceived);
  }
}

function solaceClientDisconnected() {
  local.broker.connected = false;
	renderBroker();
	console.log('Solace client disconnected');
}

function solaceClientConnectionError() {
  local.broker.connected = false;
	renderBroker();
	console.log('Solace client connection encountered an error');
}

function connectToBroker() {
	client = new SolaceClient(
		solaceClientConnected,
		solaceClientConnectionError,
		solaceClientDisconnected
	);
	client.connect();
}

function removeElement(elName) {
	let el = document.getElementById(elName);
	if (el !== null) {
		var parent = el.parentNode;
		parent.removeChild(el);
	}
}

function removeClient(client) {
	removeElement(`line-${client.uuid}`);
	removeElement(`${client.uuid}`);
	removeElement(`tip-${client.uuid}`);
	removeElement(`text-${client.uuid}`);
}

function renderClients() {
	let broker = local.broker;
	let clients = local.clients;
	if (!clients.length)
		return;

  local.clientRendering = true;
  const nClients = clients.length;
	const angleIncrement = (Math.PI * 2) / nClients
	const xCenter = broker.width / 2;
	const yCenter = (broker.height -10) / 2;
	const arcRadius = broker.height * 0.45;
	let currentAngle = 0;

	for (let i=0; i<clients.length; i++) {
		const xClient = xCenter - Math.cos(i * angleIncrement) * arcRadius
		const yClient = yCenter - Math.sin(i * angleIncrement) * arcRadius

		removeElement(`line-${clients[i].uuid}`);
		const lineClient = document.createElementNS(svgNS, 'line');
		lineClient.setAttribute('id', `line-${clients[i].uuid}`);
		lineClient.setAttributeNS(null, 'x1', xClient);
		lineClient.setAttributeNS(null, 'y1', yClient);
		lineClient.setAttributeNS(null, 'x2', xCenter);
		lineClient.setAttributeNS(null, 'y2', yCenter);
		lineClient.setAttributeNS(null, 'class', 'connection tooltip-trigger');
		mySvg.appendChild(lineClient);

		removeElement(`${clients[i].uuid}`);

    let clientClass = 'sender';
    if (clients[i].type === 'sender')  clientClass = 'sender'
		else if (clients[i].type === 'receiver')  clientClass = 'receiver'
		else if (clients[i].type === 'requestor')  clientClass = 'requestor'
		else if (clients[i].type === 'replier')  clientClass = 'replier'

		const client = document.createElementNS(svgNS, 'circle');
		client.setAttribute('id', `${clients[i].uuid}`);
		client.setAttributeNS(null, 'cx', xClient);
		client.setAttributeNS(null, 'cy', yClient);
		client.setAttributeNS(null, 'r', 30);
		client.setAttributeNS(null, 'class', clientClass);
    client.setAttributeNS(null, 'stroke', "black");
    client.setAttributeNS(null, 'stroke-width', "3");
    
		mySvg.appendChild(client);

		removeElement(`tip-${clients[i].uuid}`);
		const tip = document.createElementNS(svgNS, "title");
		tip.setAttribute('id', `tip-${clients[i].uuid}`);
		if (clients[i].type === 'sender')  tip.textContent = `Sender: ${clients[i].clientName}`
		else if (clients[i].type === 'receiver')  tip.textContent = `Receiver: ${clients[i].clientName}`
		else if (clients[i].type === 'requestor')  tip.textContent = `Requestor: ${clients[i].clientName}`
		else if (clients[i].type === 'replier')  tip.textContent = `Replier: ${clients[i].clientName}`
		client.appendChild(tip);

		removeElement(`text-${clients[i].uuid}`);
		const text = document.createElementNS(svgNS, "text");
		text.setAttribute('id', `text-${clients[i].uuid}`);
		text.setAttribute("class", "label");
		text.setAttribute("x", xClient + 35);
		text.setAttribute("y", yClient - 10);
		text.textContent = clients[i].clientName
		mySvg.appendChild(text);

		currentAngle += angleIncrement;
	}

  local.clientRendering = false;
}

function renderBroker() {
	let broker = local.broker;
	removeElement('broker');

	let xCenter = broker.width / 2;
	const yCenter = (broker.height -10) / 2;

	let _broker = document.createElementNS(svgNS, 'circle');
	_broker.setAttribute('id', `broker`);
	_broker.setAttributeNS(null, 'cx', xCenter);
	_broker.setAttributeNS(null, 'cy', yCenter);
	_broker.setAttributeNS(null, 'r', 50);
	_broker.setAttributeNS(null, 'stroke', "black");
	_broker.setAttributeNS(null, 'stroke-width', "5");
	_broker.setAttributeNS(null, 'fill', broker.connected === undefined ? "darkgrey" : 
																					broker.connected ? "#00C895" : "red");

	const tip = document.createElementNS(svgNS, "title");
	tip.textContent = `Solace PubSub+ Broker:\nURL: ${connection.MQTT_HOST}:${connection.MQTT_PORT}`;
	_broker.appendChild(tip);

	mySvg.appendChild(_broker);
}

function recordClientDisconnected(clientEvent) {
  // console.log('recordClientDisconnected');
	let clients = local.clients;
	let clIndex = clients.findIndex(cl => cl.clientName === clientEvent.clientName);
  if (clIndex < 0) return;

  clients[clIndex].disconnected = true;

	let evIndex = local.events.findIndex(ev => ev.uuid === clientEvent.uuid)
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  local.events[evIndex].disconnected = true;
}

function renderClientConnected(clientEvent) {
	// console.log('renderClientConnected');
	let clients = local.clients;
  let clIndex = clients.findIndex(cl => cl.clientName === clientEvent.clientName && cl.type === clientEvent.type);
  if (clIndex < 0) {
	  clients.push({inUse: 0, disconnected: false, ...clientEvent});
    local.events.filter(ev => ev.playing && !ev.played).map(ev => ev.redraw = true);
  }

	// cleanup event
	let evIndex = local.events.findIndex(ev => ev.uuid === clientEvent.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  local.events[evIndex].played = true;
  local.events[evIndex].playing = false;

  if (clIndex < 0) {
    renderClients(clientEvent);
  }
}

function renderClientDisconnected(clientEvent) {
	// console.log('renderClientDisconnected')
	let clients = local.clients;
	let clIndex = clients.findIndex(cl => cl.clientName === clientEvent.clientName);
	if (clIndex < 0) return;

	// cleanup event
	let evIndex = local.events.findIndex(ev => ev.uuid === clientEvent.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  local.events[evIndex].played = true;
  local.events[evIndex].playing = false;
  local.events[evIndex].disconnected = true;
}

function renderClientReconnected(client) {
	// console.log('renderClientReconnected')
}

function animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, duration) {
  let startTimestamp = null;
  const step = timestamp => {
    if (!startTimestamp) 
      startTimestamp = timestamp;
    let _event = local.events[evIndex];
    if (_event.redraw) {
      let client = document.getElementById(`${_client.uuid}`);
      let broker = document.getElementById('broker');
      if ([STM_EVENT_PUBLISHED, STM_EVENT_REQUESTED].includes(_event.action)) {
        startX = Number(client.getAttribute('cx'));
        startY = Number(client.getAttribute('cy'));
        endX = Number(broker.getAttribute('cx'));
        endY = Number(broker.getAttribute('cy'));
      } else {
        endX = Number(client.getAttribute('cx'));
        endY = Number(client.getAttribute('cy'));
        startX = Number(broker.getAttribute('cx'));
        startY = Number(broker.getAttribute('cy'));      
      }
      _event.redraw = false;
    }
    
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    event.setAttributeNS(null, 'cx', startX + (progress * (endX - startX)));
    event.setAttributeNS(null, 'cy', startY + (progress * (endY - startY)));
    text.setAttributeNS(null, 'x', startX + (progress * (endX - startX)));
    text.setAttributeNS(null, 'y', startY + (progress * (endY - startY)));

    if (progress < 1) {
      local.events[evIndex].step = local.events[evIndex].step ? local.events[evIndex].step+1 : 1;
      window.requestAnimationFrame(step);
    } else {
      removeElement(groupId);
      local.events[evIndex].played = true;
      local.events[evIndex].playing = false;
      // console.log('Rendered Event: ', evIndex, events[evIndex].uuid, 'Played: ', events[evIndex].played, 'Playing: ', events[evIndex].playing)

      _client.inUse--;
    }
  }

  window.requestAnimationFrame(step);
}

function renderEventReplied(_event) {
	// console.log('renderEventReplied');
  let clients = local.clients;
  let clIndex = clients.findIndex(cl => cl.clientName === _event.clientName);
  if (clIndex < 0) return;

  let evIndex = local.events.findIndex(ev => ev.uuid === _event.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  if (local.events[evIndex].playing || local.events[evIndex].played)
    return;
  
  let source = local.events.findIndex(ev => ev.msgId === _event.msgId && ev.action === STM_EVENT_REQUEST_RECEIVED);
  if (source < 0 || source === evIndex) {
    ; // no source pub event found, ok to proceed
  } else if (source && !local.events[source].played) {
      return;
  }
  
  local.clients[clIndex].inUse++;
  local.events[evIndex].playing = true;

  let _client = clients[clIndex];
  let client = document.getElementById(`${_client.uuid}`);
  let broker = document.getElementById('broker');
  const startX = Number(client.getAttribute('cx'));
  const startY = Number(client.getAttribute('cy'));
  const endX = Number(broker.getAttribute('cx'));
  const endY = Number(broker.getAttribute('cy'));

  let groupId = `group-${_event.uuid}`;
  // console.log(groupId);
  var g = document.createElementNS(svgNS, "g");
  g.setAttribute('id', groupId);
  g.setAttribute('shape-rendering', 'inherit');
  g.setAttribute('pointer-events', 'all');

  const event = document.createElementNS(svgNS, 'circle');
  event.setAttributeNS(null, 'r', '13');
  event.setAttributeNS(null, 'cx', startX);
  event.setAttributeNS(null, 'cy', startY);
  event.setAttributeNS(null, 'class', 'event');
  if (_event.deliveryMode === 1) {
    event.setAttributeNS(null, 'stroke', "black");
    event.setAttributeNS(null, 'stroke-width', "3");
    event.setAttributeNS(null, 'fill', "darkgrey");
  }
  g.appendChild(event);

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', startX + 100);
  text.setAttribute('y', startY + 85);
  text.setAttributeNS(null, 'class', 'eventNameText')
  local.publishedCount[_event.clientName] = local.publishedCount[_event.clientName] ? local.publishedCount[_event.clientName] + 1 : 1;
  text.textContent = _event.topicName; // + ` ${local.publishedCount[_event.clientName]}`;
  g.appendChild(text);

  mySvg.appendChild(g);

  let speed = (2 - local.speed) * 3000 ? (2 - local.speed) * 3000 : 100;
  animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, speed);
}

function renderEventPublished(_event) {
	// console.log('renderEventPublished');
  let clients = local.clients;
  let clIndex = clients.findIndex(cl => cl.clientName === _event.clientName);
  if (clIndex < 0) return;

  let evIndex = local.events.findIndex(ev => ev.uuid === _event.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  if (local.events[evIndex].playing || local.events[evIndex].played)
    return;
  
  local.clients[clIndex].inUse++;
  local.events[evIndex].playing = true;

  let _client = clients[clIndex];
  let client = document.getElementById(`${_client.uuid}`);
  let broker = document.getElementById('broker');
  const startX = Number(client.getAttribute('cx'));
  const startY = Number(client.getAttribute('cy'));
  const endX = Number(broker.getAttribute('cx'));
  const endY = Number(broker.getAttribute('cy'));

  let groupId = `group-${_event.uuid}`;
  // console.log(groupId);
  var g = document.createElementNS(svgNS, "g");
  g.setAttribute('id', groupId);
  g.setAttribute('shape-rendering', 'inherit');
  g.setAttribute('pointer-events', 'all');

  const event = document.createElementNS(svgNS, 'circle');
  event.setAttributeNS(null, 'r', '13');
  event.setAttributeNS(null, 'cx', startX);
  event.setAttributeNS(null, 'cy', startY);
  event.setAttributeNS(null, 'class', 'event');
  if (_event.deliveryMode === 1) {
    event.setAttributeNS(null, 'stroke', "black");
    event.setAttributeNS(null, 'stroke-width', "3");
    event.setAttributeNS(null, 'fill', "darkgrey");
  }
  g.appendChild(event);

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', startX + 100);
  text.setAttribute('y', startY + 85);
  text.setAttributeNS(null, 'class', 'eventNameText')
  local.publishedCount[_event.clientName] = local.publishedCount[_event.clientName] ? local.publishedCount[_event.clientName] + 1 : 1;
  text.textContent = _event.topicName; // + ` ${local.publishedCount[_event.clientName]}`;
  g.appendChild(text);

  mySvg.appendChild(g);

  let speed = (2 - local.speed) * 3000 ? (2 - local.speed) * 3000 : 100;
  animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, speed);
}

function renderEventReplyReceived(_event) {
	// console.log('renderEventReplyReceived')

  let clients = local.clients;
	let clIndex = clients.findIndex(cl => cl.clientName === _event.clientName);
  if (clIndex < 0) return;

	let evIndex = local.events.findIndex(ev => ev.uuid === _event.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  if (local.events[evIndex].playing || local.events[evIndex].played)
    return;
  
  let source = local.events.findIndex(ev => ev.msgId === _event.msgId && ev.action === STM_EVENT_REPLIED);
  if (source < 0 || source === evIndex) {
    ; // no source pub event found, ok to proceed
  } else if (source && !local.events[source].played) {
      return;
  }

  local.clients[clIndex].inUse++;
  local.events[evIndex].playing = true;

	let _client = clients[clIndex];
	let client = document.getElementById(`${_client.uuid}`);
	let broker = document.getElementById('broker');
	const endX = Number(client.getAttribute('cx'));
	const endY = Number(client.getAttribute('cy'));
	const startX = Number(broker.getAttribute('cx'));
	const startY = Number(broker.getAttribute('cy'));

	let groupId = `group-${_event.uuid}`;
	var g = document.createElementNS(svgNS, "g");
	g.setAttribute('id', groupId);
	g.setAttribute('shape-rendering', 'inherit');
	g.setAttribute('pointer-events', 'all');

	const event = document.createElementNS(svgNS, 'circle');
	event.setAttributeNS(null, 'r', '13');
	event.setAttributeNS(null, 'cx', startX);
	event.setAttributeNS(null, 'cy', startY);
	event.setAttributeNS(null, 'class', 'event');
  if (_event.deliveryMode === 1) {
    event.setAttributeNS(null, 'stroke', "black");
    event.setAttributeNS(null, 'stroke-width', "3");
    event.setAttributeNS(null, 'fill', "darkgrey");
  }

	g.appendChild(event);

	const text = document.createElementNS(svgNS, 'text');
	text.setAttribute("class", "eventNameText");
	text.setAttribute('x', startX + 100);
	text.setAttribute('y', startY + 85);
  local.receivedCount[_event.clientName] = local.receivedCount[_event.clientName] ? local.receivedCount[_event.clientName] + 1 : 1;
  text.textContent = _event.topicName; // + ` ${local.receivedCount[_event.clientName]}`;
	g.appendChild(text);

	mySvg.appendChild(g);
  // console.log(_event.clientName + ' :: ' + String(local.receivedCount[_event.clientName]).padStart(3, '0') + ' :: ' + _event.msgId )

  let speed = (2 - local.speed) * 3000 ? (2 - local.speed) * 3000 : 100;
  // console.log(Date.now(), ': Speed: ', speed);
  animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, speed);
}

function renderEventReceived(_event) {
	// console.log('renderEventReceived')

  let clients = local.clients;
	let clIndex = clients.findIndex(cl => cl.clientName === _event.clientName);
  if (clIndex < 0) return;

	let evIndex = local.events.findIndex(ev => ev.uuid === _event.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  if (local.events[evIndex].playing || local.events[evIndex].played)
    return;
  
  let source = local.events.findIndex(ev => ev.msgId === _event.msgId);
  if (source < 0 || source === evIndex) {
    ; // no source pub event found, ok to proceed
  } else if (source && !local.events[source].played) {
      return;
  } else if (source && (local.events[source].played || local.events[source].playing)) {
    let nextPubIndex = local.events.findIndex((item, index) => index > evIndex && 
                        item.clientName === local.events[source].clientName && (item.action === STM_EVENT_PUBLISHED || item.action === STM_CLIENT_DISCONNECTED));
    while (nextPubIndex > 0) {
      local.events[nextPubIndex].ready = true;
      nextPubIndex = local.events.findIndex((item, index) => index > nextPubIndex && 
                        item.clientName === local.events[source].clientName && (item.action === STM_EVENT_PUBLISHED || item.action === STM_CLIENT_DISCONNECTED));
    }
  }

  local.clients[clIndex].inUse++;
  local.events[evIndex].playing = true;

	let _client = clients[clIndex];
	let client = document.getElementById(`${_client.uuid}`);
	let broker = document.getElementById('broker');
	const endX = Number(client.getAttribute('cx'));
	const endY = Number(client.getAttribute('cy'));
	const startX = Number(broker.getAttribute('cx'));
	const startY = Number(broker.getAttribute('cy'));

	let groupId = `group-${_event.uuid}`;
	var g = document.createElementNS(svgNS, "g");
	g.setAttribute('id', groupId);
	g.setAttribute('shape-rendering', 'inherit');
	g.setAttribute('pointer-events', 'all');

	const event = document.createElementNS(svgNS, 'circle');
	event.setAttributeNS(null, 'r', '13');
	event.setAttributeNS(null, 'cx', startX);
	event.setAttributeNS(null, 'cy', startY);
	event.setAttributeNS(null, 'class', 'event');
  if (_event.deliveryMode === 1) {
    event.setAttributeNS(null, 'stroke', "black");
    event.setAttributeNS(null, 'stroke-width', "3");
    event.setAttributeNS(null, 'fill', "darkgrey");
  }

	g.appendChild(event);

	const text = document.createElementNS(svgNS, 'text');
	text.setAttribute("class", "eventNameText");
	text.setAttribute('x', startX + 100);
	text.setAttribute('y', startY + 85);
  local.receivedCount[_event.clientName] = local.receivedCount[_event.clientName] ? local.receivedCount[_event.clientName] + 1 : 1;
  text.textContent = _event.topicName; // + ` ${local.receivedCount[_event.clientName]}`;
	g.appendChild(text);

	mySvg.appendChild(g);
  // console.log(_event.clientName + ' :: ' + String(local.receivedCount[_event.clientName]).padStart(3, '0') + ' :: ' + _event.msgId )

  let speed = (2 - local.speed) * 3000 ? (2 - local.speed) * 3000 : 100;
  // console.log(Date.now(), ': Speed: ', speed);
  animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, speed);
}

function renderEventRequestReceived(_event) {
	// console.log('renderEventRequestReceived')

  let clients = local.clients;
	let clIndex = clients.findIndex(cl => cl.clientName === _event.clientName);
  if (clIndex < 0) return;

	let evIndex = local.events.findIndex(ev => ev.uuid === _event.uuid);
  if (evIndex < 0) {
    console.log('Something went wrong - missing event')
    return;
  }

  if (local.events[evIndex].playing || local.events[evIndex].played)
    return;
  
  let source = local.events.findIndex(ev => ev.msgId === _event.msgId);
  if (source < 0 || source === evIndex) {
    ; // no source pub event found, ok to proceed
  } else if (source && !local.events[source].played) {
      return;
  }

  local.clients[clIndex].inUse++;
  local.events[evIndex].playing = true;

	let _client = clients[clIndex];
	let client = document.getElementById(`${_client.uuid}`);
	let broker = document.getElementById('broker');
	const endX = Number(client.getAttribute('cx'));
	const endY = Number(client.getAttribute('cy'));
	const startX = Number(broker.getAttribute('cx'));
	const startY = Number(broker.getAttribute('cy'));

	let groupId = `group-${_event.uuid}`;
	var g = document.createElementNS(svgNS, "g");
	g.setAttribute('id', groupId);
	g.setAttribute('shape-rendering', 'inherit');
	g.setAttribute('pointer-events', 'all');

	const event = document.createElementNS(svgNS, 'circle');
	event.setAttributeNS(null, 'r', '13');
	event.setAttributeNS(null, 'cx', startX);
	event.setAttributeNS(null, 'cy', startY);
	event.setAttributeNS(null, 'class', 'event');
  if (_event.deliveryMode === 1) {
    event.setAttributeNS(null, 'stroke', "black");
    event.setAttributeNS(null, 'stroke-width', "3");
    event.setAttributeNS(null, 'fill', "darkgrey");
  }

	g.appendChild(event);

	const text = document.createElementNS(svgNS, 'text');
	text.setAttribute("class", "eventNameText");
	text.setAttribute('x', startX + 100);
	text.setAttribute('y', startY + 85);
  local.receivedCount[_event.clientName] = local.receivedCount[_event.clientName] ? local.receivedCount[_event.clientName] + 1 : 1;
  text.textContent = _event.topicName; // + ` ${local.receivedCount[_event.clientName]}`;
	g.appendChild(text);

	mySvg.appendChild(g);
  // console.log(_event.clientName + ' :: ' + String(local.receivedCount[_event.clientName]).padStart(3, '0') + ' :: ' + _event.msgId )

  let speed = (2 - local.speed) * 3000 ? (2 - local.speed) * 3000 : 100;
  // console.log(Date.now(), ': Speed: ', speed);
  animate(groupId, evIndex, _client, event, text, startX, startY, endX, endY, speed);
}

async function renderEvent(event) {
  if (!event || !event.action)
    console.log('Error');
	switch (event.action) {
		case STM_CLIENT_CONNECTED: renderClientConnected(event); break;
		case STM_CLIENT_DISCONNECTED: recordClientDisconnected(event); break;
		case STM_CLIENT_RECONNECTED: renderClientReconnected(event); break;
		case STM_EVENT_PUBLISHED: renderEventPublished(event); break;
		case STM_EVENT_RECEIVED: renderEventReceived(event); break;
		case STM_EVENT_REQUESTED: renderEventPublished(event); break;
		case STM_EVENT_REPLY_RECEIVED: renderEventReplyReceived(event); break;
		case STM_EVENT_REQUEST_RECEIVED: renderEventRequestReceived(event); break;
		case STM_EVENT_REPLIED: renderEventReplied(event); break;
		default: console.log('Unknown event');
	}
	renderBroker();

}

function renderGrid() {
	let broker = local.broker;

	for (let x = 0; x < broker.width; x += gridSpacing) {
		const line = document.createElementNS(svgNS, 'line');
		line.setAttributeNS(null, 'x1', x);
		line.setAttributeNS(null, 'y1', 0);
		line.setAttributeNS(null, 'x2', x);
		line.setAttributeNS(null, 'y2', broker.height);
		gridSvg.appendChild(line);
	}
	for (let y = 0; y < broker.height; y += gridSpacing) {
		const line = document.createElementNS(svgNS, 'line');
		line.setAttributeNS(null, 'x1', 0);
		line.setAttributeNS(null, 'y1', y);
		line.setAttributeNS(null, 'x2', broker.width);
		line.setAttributeNS(null, 'y2', y);
		gridSvg.appendChild(line);
	}
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log('DOM Loaded');
  await getEndpoints();
  console.log('gotEndpoints', connection);

  mySvg = document.getElementById('eventFlow');
	gridSvg = document.getElementById('gridView');
	width = mySvg.getBoundingClientRect().width;
	height = mySvg.getBoundingClientRect().height;

	local.broker = { width, height, connected: undefined};

  renderGrid();
	renderBroker();
	connectToBroker()

	setInterval(() => {
    let count = 0;
    let evIndex = local.events.findIndex(ev => !ev.played && !ev.playing && !ev.disconnected);
    do {
      if (evIndex < 0 || local.clientRendering) {
        return;
      }
      // console.log('Found: ', local.events.length, evIndex, local.events[evIndex].clientName, 
      //         local.events[evIndex].action, 'pla', local.events[evIndex].played, 'ply', local.events[evIndex].playing)
      // console.log('Ready to play: ', evIndex, local.events[evIndex].action, local.events[evIndex].uuid, 'Played: ', local.events[evIndex].played, 'Playing: ', local.events[evIndex].playing)

      let actioned = false;
      if ([STM_CLIENT_CONNECTED, STM_CLIENT_RECONNECTED].includes(local.events[evIndex].action))
        actioned = true, renderEvent(local.events[evIndex])
      if ([STM_EVENT_PUBLISHED, STM_EVENT_RECEIVED, STM_EVENT_REQUESTED, STM_EVENT_REQUEST_RECEIVED, STM_EVENT_REPLIED, STM_EVENT_REPLY_RECEIVED].includes(local.events[evIndex].action))
        actioned = true, renderEvent(local.events[evIndex])
      if ([STM_CLIENT_DISCONNECTED].includes(local.events[evIndex].action))
        actioned = true, renderEvent(local.events[evIndex])
      if (!actioned)
        console.log('Hmmm....')

      evIndex = local.events.findIndex(ev => !ev.played && !ev.playing && !ev.disconnected);        
      // console.log('Found - ', evIndex);
      count++;

      let readyIndex = local.events.findIndex(ev => !ev.played && !ev.playing && !ev.disconnected && ev.ready);
      if (readyIndex >= 0) {
        // console.log('Playing Next Event', local.events.length, readyIndex, local.events[readyIndex].clientName, local.events[readyIndex].action)
        setTimeout(() => { renderEvent(local.events[readyIndex]) }, 200);
        // renderEvent(local.events[readyIndex]);
      }
  
    } while (evIndex < 0);
	}, 100)

  setInterval(() => {
		let clients = local.clients;
		let clIndex = clients.findIndex(cl => !cl.played && cl.disconnected);
		if (clIndex < 0) return;

    if (local.clients[clIndex].disconnected && !local.clients[clIndex].inUse) {
    // if (local.clients[clIndex].disconnected) {
      console.log('READY TO DISCONNECT', local.clients[clIndex].clientName, local.clients[clIndex].type)
      renderClientDisconnected(clients[clIndex])
      removeClient(clients[clIndex])
      clients.splice(clIndex, 1);
      local.events.filter(ev => ev.playing).map(ev1 => ev1.redraw = true);    
      renderClients()
      renderBroker();
    }
  },500)

  document.getElementById('inputfile')
    .addEventListener('change', function () {

        let fr = new FileReader();
        fr.onload = function () {
            // console.log(fr.result);
            local.clients.map(c => removeClient(c));
            local.events.map(e => removeElement(`group-${e.uuid}`));

            let loaded = JSON.parse(fr.result);
            local.broker = loaded.broker;
            local.broker.width = mySvg.getBoundingClientRect().width;
            local.broker.height = mySvg.getBoundingClientRect().height;
            local.publishedCount = {};
            local.receivedCount = {};
            local.clients = [];
            local.speed = loaded.speed;
            local.events = [];
            for (let i=0; i<loaded.events.length; i++) {
              loaded.events[i].played = false;
              loaded.events[i].playing = false;
              loaded.events[i].disconnected = false;
              loaded.events[i].redraw = false;
              let eventEntry = `<li>${loaded.events[i].action}<br>${loaded.events[i].clientName}<br>${loaded.events[i].type.toUpperCase()}</li>`
              document.getElementById('events').insertAdjacentHTML('beforeend', eventEntry);
            }
            local.events = loaded.events;
          
            modal.style.display = "none";
        }

        fr.readAsBinaryString(this.files[0]);
    })

    // Get the modal
    var modal = document.getElementById("loadFileModal");

    // Get the button that opens the modal
    var btn = document.getElementById("fileopen");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
      document.getElementById('inputfile').value = '';
      closeNav();
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        resetVisualization();
      }
    }

});

function rewindAndReplay() {
  // mySvg.innerHtml = '';
  document.getElementById('eventFlow').innerHTML = '';
  local.clients = [];
  local.publishedCount = {};
  local.receivedCount = {};
  for (let i=0; i<local.events.length; i++) {
    local.events[i].played = false;
    local.events[i].playing = false;
    local.events[i].disconnected = false;
    local.events[i].redraw = false;
  }
  closeNav();
}

function showDropdown() {
  document.getElementById("speedDropDown").classList.toggle("show");
}

function setSpeed(elId, speed) {
  local.speed = speed;
  let elements = document.querySelectorAll('.speedItem');
  elements.forEach((element) => {
    element.classList.remove('checkmark');
  })
  
  let el = document.getElementById(elId);
  el.classList.add('checkmark');
  showDropdown();
}

const saveToFile = () => {
  const link = document.createElement("a");
  const file = new Blob([JSON.stringify(local, null, 4)], { type: 'text/plain' });
  link.href = URL.createObjectURL(file);
  link.download = "stm-visualize.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

const loadFromFile = () => {
  let fr = new FileReader();
  fr.onload = function () {
      console.log(fr.result)
  }
}

function openNav() {
  if (navOpen) {
    closeNav();
    return;
  }
  document.getElementById("eventsList").style.width = "300px";
  document.getElementById("navMain").style.marginLeft = "300px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
  navOpen = true;
}

function closeNav() {
  document.getElementById("eventsList").style.width = "0";
  document.getElementById("navMain").style.marginLeft= "0";
  document.body.style.backgroundColor = "white";
  navOpen = false;
}

function showSpeedControl() {
  document.getElementById("speedList").classList.toggle("show");
}
