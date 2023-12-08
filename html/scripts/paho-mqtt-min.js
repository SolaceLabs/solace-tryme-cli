/** *****************************************************************************
 * Copyright (c) 2013, 2016 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 ****************************************************************************** */
(function (p, s) { typeof exports === 'object' && typeof module === 'object' ? module.exports = s() : typeof define === 'function' && define.amd ? define(s) : typeof exports === 'object' ? exports = s() : (typeof p.Paho === 'undefined' && (p.Paho = {}), p.Paho.MQTT = s()); }(this, () => (function (p) {
  function s(a, b, c) { b[c++] = a >> 8; b[c++] = a % 256; return c; } function u(a, b, c, k) { k = s(b, c, k); D(a, c, k); return k + b; } function n(a) { for (var b = 0, c = 0; c < a.length; c++) { const k = a.charCodeAt(c); k > 2047 ? (k >= 55296 && k <= 56319 && (c++, b++), b += 3) : k > 127 ? b += 2 : b++; } return b; }
  function D(a, b, c) { for (let k = 0; k < a.length; k++) { let e = a.charCodeAt(k); if (e >= 55296 && e <= 56319) { const g = a.charCodeAt(++k); if (isNaN(g)) throw Error(f(h.MALFORMED_UNICODE, [e, g])); e = (e - 55296 << 10) + (g - 56320) + 65536; }e <= 127 ? b[c++] = e : (e <= 2047 ? b[c++] = e >> 6 & 31 | 192 : (e <= 65535 ? b[c++] = e >> 12 & 15 | 224 : (b[c++] = e >> 18 & 7 | 240, b[c++] = e >> 12 & 63 | 128), b[c++] = e >> 6 & 63 | 128), b[c++] = e & 63 | 128); } return b; } function E(a, b, c) {
    for (var k = '', e, g = b; g < b + c;) {
      e = a[g++]; if (!(e < 128)) {
        const m = a[g++] - 128; if (m < 0) {
          throw Error(f(h.MALFORMED_UTF, [e.toString(16), m.toString(16),
            '']));
        } if (e < 224)e = 64 * (e - 192) + m; else { const d = a[g++] - 128; if (d < 0) throw Error(f(h.MALFORMED_UTF, [e.toString(16), m.toString(16), d.toString(16)])); if (e < 240)e = 4096 * (e - 224) + 64 * m + d; else { const l = a[g++] - 128; if (l < 0) throw Error(f(h.MALFORMED_UTF, [e.toString(16), m.toString(16), d.toString(16), l.toString(16)])); if (e < 248)e = 262144 * (e - 240) + 4096 * m + 64 * d + l; else throw Error(f(h.MALFORMED_UTF, [e.toString(16), m.toString(16), d.toString(16), l.toString(16)])); } }
      }e > 65535 && (e -= 65536, k += String.fromCharCode(55296 + (e >> 10)), e = 56320 + (e
& 1023)); k += String.fromCharCode(e);
    } return k;
  } const z = function (a, b) { for (let c in a) if (a.hasOwnProperty(c)) if (b.hasOwnProperty(c)) { if (typeof a[c] !== b[c]) throw Error(f(h.INVALID_TYPE, [typeof a[c], c])); } else { c = 'Unknown property, ' + c + '. Valid properties are:'; for (const k in b)b.hasOwnProperty(k) && (c = c + ' ' + k); throw Error(c); } }; const v = function (a, b) { return function () { return a.apply(b, arguments); }; }; var h = {
    OK: { code: 0, text: 'AMQJSC0000I OK.' },
    CONNECT_TIMEOUT: { code: 1, text: 'AMQJSC0001E Connect timed out.' },
    SUBSCRIBE_TIMEOUT: {
      code: 2,
      text: 'AMQJS0002E Subscribe timed out.'
    },
    UNSUBSCRIBE_TIMEOUT: { code: 3, text: 'AMQJS0003E Unsubscribe timed out.' },
    PING_TIMEOUT: { code: 4, text: 'AMQJS0004E Ping timed out.' },
    INTERNAL_ERROR: { code: 5, text: 'AMQJS0005E Internal error. Error Message: {0}, Stack trace: {1}' },
    CONNACK_RETURNCODE: { code: 6, text: 'AMQJS0006E Bad Connack return code:{0} {1}.' },
    SOCKET_ERROR: { code: 7, text: 'AMQJS0007E Socket error:{0}.' },
    SOCKET_CLOSE: { code: 8, text: 'AMQJS0008I Socket closed.' },
    MALFORMED_UTF: { code: 9, text: 'AMQJS0009E Malformed UTF data:{0} {1} {2}.' },
    UNSUPPORTED: { code: 10, text: 'AMQJS0010E {0} is not supported by this browser.' },
    INVALID_STATE: { code: 11, text: 'AMQJS0011E Invalid state {0}.' },
    INVALID_TYPE: { code: 12, text: 'AMQJS0012E Invalid type {0} for {1}.' },
    INVALID_ARGUMENT: { code: 13, text: 'AMQJS0013E Invalid argument {0} for {1}.' },
    UNSUPPORTED_OPERATION: { code: 14, text: 'AMQJS0014E Unsupported operation.' },
    INVALID_STORED_DATA: { code: 15, text: 'AMQJS0015E Invalid data in local storage key\x3d{0} value\x3d{1}.' },
    INVALID_MQTT_MESSAGE_TYPE: { code: 16, text: 'AMQJS0016E Invalid MQTT message type {0}.' },
    MALFORMED_UNICODE: { code: 17, text: 'AMQJS0017E Malformed Unicode string:{0} {1}.' },
    BUFFER_FULL: { code: 18, text: 'AMQJS0018E Message buffer is full, maximum buffer size: {0}.' }
  }; const H = {
    0: 'Connection Accepted', 1: 'Connection Refused: unacceptable protocol version', 2: 'Connection Refused: identifier rejected', 3: 'Connection Refused: server unavailable', 4: 'Connection Refused: bad user name or password', 5: 'Connection Refused: not authorized'
  }; var f = function (a, b) {
    var c = a.text; if (b) {
      for (var k, e, g = 0; g < b.length; g++) {
        if (k = '{'
+ g + '}', e = c.indexOf(k), e > 0) { var h = c.substring(0, e); 
var c = c.substring(e + k.length); 
var c = h + b[g] + c; }
      }
    } return c;
  }; const A = [0, 6, 77, 81, 73, 115, 100, 112, 3]; const B = [0, 4, 77, 81, 84, 84, 4]; const q = function (a, b) { this.type = a; for (const c in b)b.hasOwnProperty(c) && (this[c] = b[c]); }; q.prototype.encode = function () {
    var a = (this.type & 15) << 4; var b = 0; const c = []; var k = 0; let e; void 0 !== this.messageIdentifier && (b += 2); switch (this.type) {
      case 1: switch (this.mqttVersion) { case 3: b += A.length + 3; break; case 4: b += B.length + 3; }b += n(this.clientId) + 2; void 0 !== this.willMessage && (b += n(this.willMessage.destinationName)
+ 2, e = this.willMessage.payloadBytes, e instanceof Uint8Array || (e = new Uint8Array(h)), b += e.byteLength + 2); void 0 !== this.userName && (b += n(this.userName) + 2); void 0 !== this.password && (b += n(this.password) + 2); break; case 8: for (var a = a | 2, g = 0; g < this.topics.length; g++)c[g] = n(this.topics[g]), b += c[g] + 2; b += this.requestedQos.length; break; case 10: a |= 2; for (g = 0; g < this.topics.length; g++)c[g] = n(this.topics[g]), b += c[g] + 2; break; case 6: a |= 2; break; case 3: this.payloadMessage.duplicate && (a |= 8); a = a |= this.payloadMessage.qos << 1; this.payloadMessage.retained
&& (a |= 1); var k = n(this.payloadMessage.destinationName); var h = this.payloadMessage.payloadBytes; var b = b + (k + 2) + h.byteLength; h instanceof ArrayBuffer ? h = new Uint8Array(h) : h instanceof Uint8Array || (h = new Uint8Array(h.buffer));
    } var f = b; var g = Array(1); let d = 0; do { let t = f % 128; var f = f >> 7; f > 0 && (t |= 128); g[d++] = t; } while (f > 0 && d < 4); f = g.length + 1; b = new ArrayBuffer(b + f); d = new Uint8Array(b); d[0] = a; d.set(g, 1); if (this.type == 3)f = u(this.payloadMessage.destinationName, k, d, f); else if (this.type == 1) {
      switch (this.mqttVersion) {
        case 3: d.set(A, f); f += A.length;
          break; case 4: d.set(B, f), f += B.length;
      }a = 0; this.cleanSession && (a = 2); void 0 !== this.willMessage && (a = a | 4 | this.willMessage.qos << 3, this.willMessage.retained && (a |= 32)); void 0 !== this.userName && (a |= 128); void 0 !== this.password && (a |= 64); d[f++] = a; f = s(this.keepAliveInterval, d, f);
    } void 0 !== this.messageIdentifier && (f = s(this.messageIdentifier, d, f)); switch (this.type) {
      case 1: f = u(this.clientId, n(this.clientId), d, f); void 0 !== this.willMessage && (f = u(this.willMessage.destinationName, n(this.willMessage.destinationName), d, f),
      f = s(e.byteLength, d, f), d.set(e, f), f += e.byteLength); void 0 !== this.userName && (f = u(this.userName, n(this.userName), d, f)); void 0 !== this.password && u(this.password, n(this.password), d, f); break; case 3: d.set(h, f); break; case 8: for (g = 0; g < this.topics.length; g++)f = u(this.topics[g], c[g], d, f), d[f++] = this.requestedQos[g]; break; case 10: for (g = 0; g < this.topics.length; g++)f = u(this.topics[g], c[g], d, f);
    } return b;
  }; const F = function (a, b, c) {
    this._client = a; this._window = b; this._keepAliveInterval = 1E3 * c; this.isReset = !1; const k = (new q(12)).encode();
    const e = function (a) { return function () { return g.apply(a); }; }; var g = function () { this.isReset ? (this.isReset = !1, this._client._trace('Pinger.doPing', 'send PINGREQ'), this._client.socket.send(k), this.timeout = this._window.setTimeout(e(this), this._keepAliveInterval)) : (this._client._trace('Pinger.doPing', 'Timed out'), this._client._disconnected(h.PING_TIMEOUT.code, f(h.PING_TIMEOUT))); }; this.reset = function () {
      this.isReset = !0; this._window.clearTimeout(this.timeout); this._keepAliveInterval > 0 && (this.timeout = setTimeout(e(this),
        this._keepAliveInterval));
    }; this.cancel = function () { this._window.clearTimeout(this.timeout); };
  }; const w = function (a, b, c, f, e) { this._window = b; c || (c = 30); this.timeout = setTimeout((function (a, b, c) { return function () { return a.apply(b, c); }; }(f, a, e)), 1E3 * c); this.cancel = function () { this._window.clearTimeout(this.timeout); }; }; const d = function (a, b, c, d, e) {
    if (!('WebSocket' in p && p.WebSocket !== null)) throw Error(f(h.UNSUPPORTED, ['WebSocket'])); if (!('localStorage' in p && p.localStorage !== null)) throw Error(f(h.UNSUPPORTED, ['localStorage']));
    if (!('ArrayBuffer' in p && p.ArrayBuffer !== null)) throw Error(f(h.UNSUPPORTED, ['ArrayBuffer'])); this._trace('Paho.MQTT.Client', a, b, c, d, e); this.host = b; this.port = c; this.path = d; this.uri = a; this.clientId = e; this._wsuri = null; this._localKey = b + ':' + c + (d != '/mqtt' ? ':' + d : '') + ':' + e + ':'; this._msg_queue = []; this._buffered_msg_queue = []; this._sentMessages = {}; this._receivedMessages = {}; this._notify_msg_sent = {}; this._message_identifier = 1; this._sequence = 0; for (const g in localStorage) {
      g.indexOf('Sent:' + this._localKey) !== 0 && g.indexOf('Received:' + this._localKey)
!== 0 || this.restore(g);
    }
  }; d.prototype.host = null; d.prototype.port = null; d.prototype.path = null; d.prototype.uri = null; d.prototype.clientId = null; d.prototype.socket = null; d.prototype.connected = !1; d.prototype.maxMessageIdentifier = 65536; d.prototype.connectOptions = null; d.prototype.hostIndex = null; d.prototype.onConnected = null; d.prototype.onConnectionLost = null; d.prototype.onMessageDelivered = null; d.prototype.onMessageArrived = null; d.prototype.traceFunction = null; d.prototype._msg_queue = null; d.prototype._buffered_msg_queue = null; d.prototype._connectTimeout = null; d.prototype.sendPinger = null; d.prototype.receivePinger = null; d.prototype._reconnectInterval = 1; d.prototype._reconnecting = !1; d.prototype._reconnectTimeout = null; d.prototype.disconnectedPublishing = !1; d.prototype.disconnectedBufferSize = 5E3; d.prototype.receiveBuffer = null; d.prototype._traceBuffer = null; d.prototype._MAX_TRACE_ENTRIES = 100; d.prototype.connect = function (a) {
    const b = this._traceMask(a, 'password'); this._trace('Client.connect',
      b,
      this.socket,
      this.connected); if (this.connected) throw Error(f(h.INVALID_STATE, ['already connected'])); if (this.socket) throw Error(f(h.INVALID_STATE, ['already connected'])); this._reconnecting && (this._reconnectTimeout.cancel(), this._reconnectTimeout = null, this._reconnecting = !1); this.connectOptions = a; this._reconnectInterval = 1; this._reconnecting = !1; a.uris ? (this.hostIndex = 0, this._doConnect(a.uris[0])) : this._doConnect(this.uri);
  }; d.prototype.subscribe = function (a, b) {
    this._trace('Client.subscribe', a, b); if (!this.connected) {
      throw Error(f(h.INVALID_STATE,
        ['not connected']));
    } const c = new q(8); c.topics = [a]; c.requestedQos = void 0 !== b.qos ? [b.qos] : [0]; b.onSuccess && (c.onSuccess = function (a) { b.onSuccess({ invocationContext: b.invocationContext, grantedQos: a }); }); b.onFailure && (c.onFailure = function (a) { b.onFailure({ invocationContext: b.invocationContext, errorCode: a, errorMessage: f(a) }); }); b.timeout && (c.timeOut = new w(this, window, b.timeout, b.onFailure, [{ invocationContext: b.invocationContext, errorCode: h.SUBSCRIBE_TIMEOUT.code, errorMessage: f(h.SUBSCRIBE_TIMEOUT) }])); this._requires_ack(c);
    this._schedule_message(c);
  }; d.prototype.unsubscribe = function (a, b) { this._trace('Client.unsubscribe', a, b); if (!this.connected) throw Error(f(h.INVALID_STATE, ['not connected'])); const c = new q(10); c.topics = [a]; b.onSuccess && (c.callback = function () { b.onSuccess({ invocationContext: b.invocationContext }); }); b.timeout && (c.timeOut = new w(this, window, b.timeout, b.onFailure, [{ invocationContext: b.invocationContext, errorCode: h.UNSUBSCRIBE_TIMEOUT.code, errorMessage: f(h.UNSUBSCRIBE_TIMEOUT) }])); this._requires_ack(c); this._schedule_message(c); };
  d.prototype.send = function (a) {
    this._trace('Client.send', a); wireMessage = new q(3); wireMessage.payloadMessage = a; if (this.connected)a.qos > 0 ? this._requires_ack(wireMessage) : this.onMessageDelivered && (this._notify_msg_sent[wireMessage] = this.onMessageDelivered(wireMessage.payloadMessage)), this._schedule_message(wireMessage); else if (this._reconnecting && this.disconnectedPublishing) {
      if (Object.keys(this._sentMessages).length + this._buffered_msg_queue.length > this.disconnectedBufferSize) {
        throw Error(f(h.BUFFER_FULL,
          [this.disconnectedBufferSize]));
      } a.qos > 0 ? this._requires_ack(wireMessage) : (wireMessage.sequence = ++this._sequence, this._buffered_msg_queue.push(wireMessage));
    } else throw Error(f(h.INVALID_STATE, ['not connected']));
  }; d.prototype.disconnect = function () {
    this._trace('Client.disconnect'); this._reconnecting && (this._reconnectTimeout.cancel(), this._reconnectTimeout = null, this._reconnecting = !1); if (!this.socket) throw Error(f(h.INVALID_STATE, ['not connecting or connected'])); wireMessage = new q(14); this._notify_msg_sent[wireMessage] = v(this._disconnected, this); this._schedule_message(wireMessage);
  }; d.prototype.getTraceLog = function () { if (this._traceBuffer !== null) { this._trace('Client.getTraceLog', new Date()); this._trace('Client.getTraceLog in flight messages', this._sentMessages.length); for (var a in this._sentMessages) this._trace('_sentMessages ', a, this._sentMessages[a]); for (a in this._receivedMessages) this._trace('_receivedMessages ', a, this._receivedMessages[a]); return this._traceBuffer; } }; d.prototype.startTrace = function () {
    this._traceBuffer === null
&& (this._traceBuffer = []); this._trace('Client.startTrace', new Date(), '1.0.3');
  }; d.prototype.stopTrace = function () { delete this._traceBuffer; }; d.prototype._doConnect = function (a) {
    this.connectOptions.useSSL && (a = a.split(':'), a[0] = 'wss', a = a.join(':')); this._wsuri = a; this.connected = !1; this.socket = this.connectOptions.mqttVersion < 4 ? new WebSocket(a, ['mqttv3.1']) : new WebSocket(a, ['mqtt']); this.socket.binaryType = 'arraybuffer'; this.socket.onopen = v(this._on_socket_open, this); this.socket.onmessage = v(this._on_socket_message,
      this); this.socket.onerror = v(this._on_socket_error, this); this.socket.onclose = v(this._on_socket_close, this); this.sendPinger = new F(this, window, this.connectOptions.keepAliveInterval); this.receivePinger = new F(this, window, this.connectOptions.keepAliveInterval); this._connectTimeout && (this._connectTimeout.cancel(), this._connectTimeout = null); this._connectTimeout = new w(this, window, this.connectOptions.timeout, this._disconnected, [h.CONNECT_TIMEOUT.code, f(h.CONNECT_TIMEOUT)]);
  }; d.prototype._schedule_message = function (a) {
    this._msg_queue.push(a);
    this.connected && this._process_queue();
  }; d.prototype.store = function (a, b) {
    const c = { type: b.type, messageIdentifier: b.messageIdentifier, version: 1 }; switch (b.type) {
      case 3: b.pubRecReceived && (c.pubRecReceived = !0); c.payloadMessage = {}; for (var d = '', e = b.payloadMessage.payloadBytes, g = 0; g < e.length; g++)d = e[g] <= 15 ? d + '0' + e[g].toString(16) : d + e[g].toString(16); c.payloadMessage.payloadHex = d; c.payloadMessage.qos = b.payloadMessage.qos; c.payloadMessage.destinationName = b.payloadMessage.destinationName; b.payloadMessage.duplicate
&& (c.payloadMessage.duplicate = !0); b.payloadMessage.retained && (c.payloadMessage.retained = !0); a.indexOf('Sent:') === 0 && (void 0 === b.sequence && (b.sequence = ++this._sequence), c.sequence = b.sequence); break; default: throw Error(f(h.INVALID_STORED_DATA, [key, c]));
    }localStorage.setItem(a + this._localKey + b.messageIdentifier, JSON.stringify(c));
  }; d.prototype.restore = function (a) {
    var b = localStorage.getItem(a); const c = JSON.parse(b); const d = new q(c.type, c); switch (c.type) {
      case 3: for (var b = c.payloadMessage.payloadHex, e = new ArrayBuffer(b.length
/ 2), e = new Uint8Array(e), g = 0; b.length >= 2;) { const m = parseInt(b.substring(0, 2), 16); var b = b.substring(2, b.length); e[g++] = m; }b = new Paho.MQTT.Message(e); b.qos = c.payloadMessage.qos; b.destinationName = c.payloadMessage.destinationName; c.payloadMessage.duplicate && (b.duplicate = !0); c.payloadMessage.retained && (b.retained = !0); d.payloadMessage = b; break; default: throw Error(f(h.INVALID_STORED_DATA, [a, b]));
    }a.indexOf('Sent:' + this._localKey) === 0 ? (d.payloadMessage.duplicate = !0, this._sentMessages[d.messageIdentifier] = d) : a.indexOf('Received:'
+ this._localKey) === 0 && (this._receivedMessages[d.messageIdentifier] = d);
  }; d.prototype._process_queue = function () { for (let a = null, b = this._msg_queue.reverse(); a = b.pop();) this._socket_send(a), this._notify_msg_sent[a] && (this._notify_msg_sent[a](), delete this._notify_msg_sent[a]); }; d.prototype._requires_ack = function (a) {
    const b = Object.keys(this._sentMessages).length; if (b > this.maxMessageIdentifier) throw Error('Too many messages:' + b); for (;void 0 !== this._sentMessages[this._message_identifier];) this._message_identifier++;
    a.messageIdentifier = this._message_identifier; this._sentMessages[a.messageIdentifier] = a; a.type === 3 && this.store('Sent:', a); this._message_identifier === this.maxMessageIdentifier && (this._message_identifier = 1);
  }; d.prototype._on_socket_open = function () { const a = new q(1, this.connectOptions); a.clientId = this.clientId; this._socket_send(a); }; d.prototype._on_socket_message = function (a) { this._trace('Client._on_socket_message', a.data); a = this._deframeMessages(a.data); for (let b = 0; b < a.length; b += 1) this._handleMessage(a[b]); };
  d.prototype._deframeMessages = function (a) {
    a = new Uint8Array(a); const b = []; if (this.receiveBuffer) { var c = new Uint8Array(this.receiveBuffer.length + a.length); c.set(this.receiveBuffer); c.set(a, this.receiveBuffer.length); a = c; delete this.receiveBuffer; } try {
      for (c = 0; c < a.length;) {
        var d; a: {
          const e = a; var g = c; var m = g; const n = e[g]; const l = n >> 4; const t = n & 15; var g = g + 1; let x = void 0; let C = 0; let p = 1; do { if (g == e.length) { d = [null, m]; break a; }x = e[g++]; C += (x & 127) * p; p *= 128; } while ((x & 128) !== 0); x = g + C; if (x > e.length)d = [null, m]; else {
            const y = new q(l); switch (l) {
              case 2: e[g++] & 1 && (y.sessionPresent = !0); y.returnCode = e[g++]; break; case 3: var m = t >> 1 & 3; var s = 256 * e[g] + e[g + 1]; var g = g + 2; var u = E(e, g, s); var g = g + s; m > 0 && (y.messageIdentifier = 256 * e[g] + e[g + 1], g += 2); var r = new Paho.MQTT.Message(e.subarray(g, x)); (t & 1) == 1 && (r.retained = !0); (t & 8) == 8 && (r.duplicate = !0); r.qos = m; r.destinationName = u; y.payloadMessage = r; break; case 4: case 5: case 6: case 7: case 11: y.messageIdentifier = 256 * e[g] + e[g + 1]; break; case 9: y.messageIdentifier = 256 * e[g] + e[g + 1], g += 2, y.returnCode = e.subarray(g, x);
            }d = [y, x];
          }
        } const v = d[0]; var c = d[1]; if (v !== null)b.push(v); else break;
      }c
< a.length && (this.receiveBuffer = a.subarray(c));
    } catch (w) { d = w.hasOwnProperty('stack') == 'undefined' ? w.stack.toString() : 'No Error Stack Available'; this._disconnected(h.INTERNAL_ERROR.code, f(h.INTERNAL_ERROR, [w.message, d])); return; } return b;
  }; d.prototype._handleMessage = function (a) {
    this._trace('Client._handleMessage', a); try {
      switch (a.type) {
        case 2: this._connectTimeout.cancel(); this._reconnectTimeout && this._reconnectTimeout.cancel(); if (this.connectOptions.cleanSession) {
          for (var b in this._sentMessages) {
            var c = this._sentMessages[b];
            localStorage.removeItem('Sent:' + this._localKey + c.messageIdentifier);
          } this._sentMessages = {}; for (b in this._receivedMessages) { var d = this._receivedMessages[b]; localStorage.removeItem('Received:' + this._localKey + d.messageIdentifier); } this._receivedMessages = {};
        } if (a.returnCode === 0) this.connected = !0, this.connectOptions.uris && (this.hostIndex = this.connectOptions.uris.length); else { this._disconnected(h.CONNACK_RETURNCODE.code, f(h.CONNACK_RETURNCODE, [a.returnCode, H[a.returnCode]])); break; }a = []; for (var e in this._sentMessages) {
            this._sentMessages.hasOwnProperty(e)
&& a.push(this._sentMessages[e]);
          } if (this._buffered_msg_queue.length > 0) { e = null; for (var g = this._buffered_msg_queue.reverse(); e = g.pop();)a.push(e), this.onMessageDelivered && (this._notify_msg_sent[e] = this.onMessageDelivered(e.payloadMessage)); }a = a.sort((a, b) => a.sequence - b.sequence); for (var g = 0, m = a.length; g < m; g++) if (c = a[g], c.type == 3 && c.pubRecReceived) { var n = new q(6, { messageIdentifier: c.messageIdentifier }); this._schedule_message(n); } else this._schedule_message(c); if (this.connectOptions.onSuccess) this.connectOptions.onSuccess({ invocationContext: this.connectOptions.invocationContext });
          c = !1; this._reconnecting && (c = !0, this._reconnectInterval = 1, this._reconnecting = !1); this._connected(c, this._wsuri); this._process_queue(); break; case 3: this._receivePublish(a); break; case 4: if (c = this._sentMessages[a.messageIdentifier]) if (delete this._sentMessages[a.messageIdentifier], localStorage.removeItem('Sent:' + this._localKey + a.messageIdentifier), this.onMessageDelivered) this.onMessageDelivered(c.payloadMessage); break; case 5: if (c = this._sentMessages[a.messageIdentifier]) {
          c.pubRecReceived = !0, n = new q(6, { messageIdentifier: a.messageIdentifier }),
          this.store('Sent:', c), this._schedule_message(n);
        } break; case 6: d = this._receivedMessages[a.messageIdentifier]; localStorage.removeItem('Received:' + this._localKey + a.messageIdentifier); d && (this._receiveMessage(d), delete this._receivedMessages[a.messageIdentifier]); var l = new q(7, { messageIdentifier: a.messageIdentifier }); this._schedule_message(l); break; case 7: c = this._sentMessages[a.messageIdentifier]; delete this._sentMessages[a.messageIdentifier]; localStorage.removeItem('Sent:' + this._localKey + a.messageIdentifier);
          if (this.onMessageDelivered) this.onMessageDelivered(c.payloadMessage); break; case 9: if (c = this._sentMessages[a.messageIdentifier]) { c.timeOut && c.timeOut.cancel(); if (a.returnCode[0] === 128) { if (c.onFailure)c.onFailure(a.returnCode); } else if (c.onSuccess)c.onSuccess(a.returnCode); delete this._sentMessages[a.messageIdentifier]; } break; case 11: if (c = this._sentMessages[a.messageIdentifier])c.timeOut && c.timeOut.cancel(), c.callback && c.callback(), delete this._sentMessages[a.messageIdentifier]; break; case 13: this.sendPinger.reset();
          break; case 14: this._disconnected(h.INVALID_MQTT_MESSAGE_TYPE.code, f(h.INVALID_MQTT_MESSAGE_TYPE, [a.type])); break; default: this._disconnected(h.INVALID_MQTT_MESSAGE_TYPE.code, f(h.INVALID_MQTT_MESSAGE_TYPE, [a.type]));
      }
    } catch (t) { c = t.hasOwnProperty('stack') == 'undefined' ? t.stack.toString() : 'No Error Stack Available', this._disconnected(h.INTERNAL_ERROR.code, f(h.INTERNAL_ERROR, [t.message, c])); }
  }; d.prototype._on_socket_error = function (a) {
    this._reconnecting || this._disconnected(h.SOCKET_ERROR.code, f(h.SOCKET_ERROR,
      [a.data]));
  }; d.prototype._on_socket_close = function () { this._reconnecting || this._disconnected(h.SOCKET_CLOSE.code, f(h.SOCKET_CLOSE)); }; d.prototype._socket_send = function (a) { if (a.type == 1) { const b = this._traceMask(a, 'password'); this._trace('Client._socket_send', b); } else this._trace('Client._socket_send', a); this.socket.send(a.encode()); this.sendPinger.reset(); }; d.prototype._receivePublish = function (a) {
    switch (a.payloadMessage.qos) {
      case 'undefined': case 0: this._receiveMessage(a); break; case 1: var b = new q(4, { messageIdentifier: a.messageIdentifier });
        this._schedule_message(b); this._receiveMessage(a); break; case 2: this._receivedMessages[a.messageIdentifier] = a; this.store('Received:', a); a = new q(5, { messageIdentifier: a.messageIdentifier }); this._schedule_message(a); break; default: throw Error('Invaild qos\x3d' + wireMmessage.payloadMessage.qos);
    }
  }; d.prototype._receiveMessage = function (a) { if (this.onMessageArrived) this.onMessageArrived(a.payloadMessage); }; d.prototype._connected = function (a, b) { if (this.onConnected) this.onConnected(a, b); }; d.prototype._reconnect = function () { this._trace('Client._reconnect'); this.connected || (this._reconnecting = !0, this.sendPinger.cancel(), this.receivePinger.cancel(), this._reconnectInterval < 128 && (this._reconnectInterval *= 2), this.connectOptions.uris ? (this.hostIndex = 0, this._doConnect(this.connectOptions.uris[0])) : this._doConnect(this.uri)); }; d.prototype._disconnected = function (a, b) {
    this._trace('Client._disconnected', a, b); if (void 0 !== a && this._reconnecting) this._reconnectTimeout = new w(this, window, this._reconnectInterval, this._reconnect);
    else if (this.sendPinger.cancel(), this.receivePinger.cancel(), this._connectTimeout && (this._connectTimeout.cancel(), this._connectTimeout = null), this._msg_queue = [], this._buffered_msg_queue = [], this._notify_msg_sent = {}, this.socket && (this.socket.onopen = null, this.socket.onmessage = null, this.socket.onerror = null, this.socket.onclose = null, this.socket.readyState === 1 && this.socket.close(), delete this.socket), this.connectOptions.uris && this.hostIndex < this.connectOptions.uris.length - 1) this.hostIndex++, this._doConnect(this.connectOptions.uris[this.hostIndex]);
    else if (void 0 === a && (a = h.OK.code, b = f(h.OK)), this.connected) {
      this.connected = !1; if (this.onConnectionLost) {
        this.onConnectionLost({
          errorCode: a, errorMessage: b, reconnect: this.connectOptions.reconnect, uri: this._wsuri
        });
      } a !== h.OK.code && this.connectOptions.reconnect && (this._reconnectInterval = 1, this._reconnect());
    } else if (this.connectOptions.mqttVersion === 4 && !1 === this.connectOptions.mqttVersionExplicit) {
      this._trace('Failed to connect V4, dropping back to V3'), this.connectOptions.mqttVersion = 3, this.connectOptions.uris
        ? (this.hostIndex = 0, this._doConnect(this.connectOptions.uris[0])) : this._doConnect(this.uri);
    } else if (this.connectOptions.onFailure) this.connectOptions.onFailure({ invocationContext: this.connectOptions.invocationContext, errorCode: a, errorMessage: b });
  }; d.prototype._trace = function () {
    if (this.traceFunction) { for (var a in arguments) typeof arguments[a] !== 'undefined' && arguments.splice(a, 1, JSON.stringify(arguments[a])); a = Array.prototype.slice.call(arguments).join(''); this.traceFunction({ severity: 'Debug', message: a }); } if (this._traceBuffer
!== null) { a = 0; for (let b = arguments.length; a < b; a++) this._traceBuffer.length == this._MAX_TRACE_ENTRIES && this._traceBuffer.shift(), a === 0 ? this._traceBuffer.push(arguments[a]) : typeof arguments[a] === 'undefined' ? this._traceBuffer.push(arguments[a]) : this._traceBuffer.push('  ' + JSON.stringify(arguments[a])); }
  }; d.prototype._traceMask = function (a, b) { const c = {}; let d; for (d in a)a.hasOwnProperty(d) && (c[d] = d == b ? '******' : a[d]); return c; }; const G = function (a, b, c, k) {
    let e; if (typeof a !== 'string') {
      throw Error(f(h.INVALID_TYPE,
        [typeof a, 'host']));
    } if (arguments.length == 2) { k = b; e = a; var g = e.match(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/); if (g)a = g[4] || g[2], b = parseInt(g[7]), c = g[8]; else throw Error(f(h.INVALID_ARGUMENT, [a, 'host'])); } else { arguments.length == 3 && (k = c, c = '/mqtt'); if (typeof b !== 'number' || b < 0) throw Error(f(h.INVALID_TYPE, [typeof b, 'port'])); if (typeof c !== 'string') throw Error(f(h.INVALID_TYPE, [typeof c, 'path'])); e = 'ws://' + (a.indexOf(':') !== -1 && a.slice(0, 1) !== '[' && a.slice(-1) !== ']' ? '[' + a + ']' : a) + ':' + b + c; } for (let m = g = 0; m < k.length; m++) { const n = k.charCodeAt(m); n >= 55296 && n <= 56319 && m++; g++; } if (typeof k !== 'string' || g > 65535) throw Error(f(h.INVALID_ARGUMENT, [k, 'clientId'])); const l = new d(e, a, b, c, k); this._getHost = function () { return a; }; this._setHost = function () { throw Error(f(h.UNSUPPORTED_OPERATION)); }; this._getPort = function () { return b; }; this._setPort = function () { throw Error(f(h.UNSUPPORTED_OPERATION)); }; this._getPath = function () { return c; }; this._setPath = function () { throw Error(f(h.UNSUPPORTED_OPERATION)); }; this._getURI = function () { return e; };
    this._setURI = function () { throw Error(f(h.UNSUPPORTED_OPERATION)); }; this._getClientId = function () { return l.clientId; }; this._setClientId = function () { throw Error(f(h.UNSUPPORTED_OPERATION)); }; this._getOnConnected = function () { return l.onConnected; }; this._setOnConnected = function (a) { if (typeof a === 'function')l.onConnected = a; else throw Error(f(h.INVALID_TYPE, [typeof a, 'onConnected'])); }; this._getDisconnectedPublishing = function () { return l.disconnectedPublishing; }; this._setDisconnectedPublishing = function (a) {
      l.disconnectedPublishing = a;
    }; this._getDisconnectedBufferSize = function () { return l.disconnectedBufferSize; }; this._setDisconnectedBufferSize = function (a) { l.disconnectedBufferSize = a; }; this._getOnConnectionLost = function () { return l.onConnectionLost; }; this._setOnConnectionLost = function (a) { if (typeof a === 'function')l.onConnectionLost = a; else throw Error(f(h.INVALID_TYPE, [typeof a, 'onConnectionLost'])); }; this._getOnMessageDelivered = function () { return l.onMessageDelivered; }; this._setOnMessageDelivered = function (a) {
      if (typeof a === 'function') {
        l.onMessageDelivered = a;
      } else throw Error(f(h.INVALID_TYPE, [typeof a, 'onMessageDelivered']));
    }; this._getOnMessageArrived = function () { return l.onMessageArrived; }; this._setOnMessageArrived = function (a) { if (typeof a === 'function')l.onMessageArrived = a; else throw Error(f(h.INVALID_TYPE, [typeof a, 'onMessageArrived'])); }; this._getTrace = function () { return l.traceFunction; }; this._setTrace = function (a) { if (typeof a === 'function')l.traceFunction = a; else throw Error(f(h.INVALID_TYPE, [typeof a, 'onTrace'])); }; this.connect = function (a) {
      a = a || {}; z(a,
        {
          timeout: 'number', userName: 'string', password: 'string', willMessage: 'object', keepAliveInterval: 'number', cleanSession: 'boolean', useSSL: 'boolean', invocationContext: 'object', onSuccess: 'function', onFailure: 'function', hosts: 'object', ports: 'object', reconnect: 'boolean', mqttVersion: 'number', mqttVersionExplicit: 'boolean', uris: 'object'
        }); void 0 === a.keepAliveInterval && (a.keepAliveInterval = 60); if (a.mqttVersion > 4 || a.mqttVersion < 3) throw Error(f(h.INVALID_ARGUMENT, [a.mqttVersion, 'connectOptions.mqttVersion'])); void 0
=== a.mqttVersion ? (a.mqttVersionExplicit = !1, a.mqttVersion = 4) : a.mqttVersionExplicit = !0; if (void 0 !== a.password && void 0 === a.userName) throw Error(f(h.INVALID_ARGUMENT, [a.password, 'connectOptions.password'])); if (a.willMessage) {
        if (!(a.willMessage instanceof r)) throw Error(f(h.INVALID_TYPE, [a.willMessage, 'connectOptions.willMessage'])); a.willMessage.stringPayload = null; if (typeof a.willMessage.destinationName === 'undefined') throw Error(f(h.INVALID_TYPE, [typeof a.willMessage.destinationName, 'connectOptions.willMessage.destinationName']));
      } typeof a.cleanSession === 'undefined' && (a.cleanSession = !0); if (a.hosts) {
        if (!(a.hosts instanceof Array)) throw Error(f(h.INVALID_ARGUMENT, [a.hosts, 'connectOptions.hosts'])); if (a.hosts.length < 1) throw Error(f(h.INVALID_ARGUMENT, [a.hosts, 'connectOptions.hosts'])); for (var b = !1, d = 0; d < a.hosts.length; d++) {
          if (typeof a.hosts[d] !== 'string') throw Error(f(h.INVALID_TYPE, [typeof a.hosts[d], 'connectOptions.hosts[' + d + ']'])); if (/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/.test(a.hosts[d])) {
            if (d === 0)b = !0; else if (!b) {
 throw Error(f(h.INVALID_ARGUMENT,
              [a.hosts[d], 'connectOptions.hosts[' + d + ']'])); 
} 
} else if (b) throw Error(f(h.INVALID_ARGUMENT, [a.hosts[d], 'connectOptions.hosts[' + d + ']']));
        } if (b)a.uris = a.hosts; else {
          if (!a.ports) throw Error(f(h.INVALID_ARGUMENT, [a.ports, 'connectOptions.ports'])); if (!(a.ports instanceof Array)) throw Error(f(h.INVALID_ARGUMENT, [a.ports, 'connectOptions.ports'])); if (a.hosts.length !== a.ports.length) throw Error(f(h.INVALID_ARGUMENT, [a.ports, 'connectOptions.ports'])); a.uris = []; for (d = 0; d < a.hosts.length; d++) {
            if (typeof a.ports[d] !== 'number'
|| a.ports[d] < 0) throw Error(f(h.INVALID_TYPE, [typeof a.ports[d], 'connectOptions.ports[' + d + ']'])); var b = a.hosts[d]; const g = a.ports[d]; e = 'ws://' + (b.indexOf(':') !== -1 ? '[' + b + ']' : b) + ':' + g + c; a.uris.push(e);
          }
        }
      }l.connect(a);
    }; this.subscribe = function (a, b) {
      if (typeof a !== 'string') throw Error('Invalid argument:' + a); b = b || {}; z(b, {
        qos: 'number', invocationContext: 'object', onSuccess: 'function', onFailure: 'function', timeout: 'number'
      }); if (b.timeout && !b.onFailure) throw Error('subscribeOptions.timeout specified with no onFailure callback.');
      if (typeof b.qos !== 'undefined' && b.qos !== 0 && b.qos !== 1 && b.qos !== 2) throw Error(f(h.INVALID_ARGUMENT, [b.qos, 'subscribeOptions.qos'])); l.subscribe(a, b);
    }; this.unsubscribe = function (a, b) {
      if (typeof a !== 'string') throw Error('Invalid argument:' + a); b = b || {}; z(b, {
        invocationContext: 'object', onSuccess: 'function', onFailure: 'function', timeout: 'number'
      }); if (b.timeout && !b.onFailure) throw Error('unsubscribeOptions.timeout specified with no onFailure callback.'); l.unsubscribe(a, b);
    }; this.send = function (a, b, c, d) {
      let e; if (arguments.length
=== 0) throw Error('Invalid argument.length'); if (arguments.length == 1) { if (!(a instanceof r) && typeof a !== 'string') throw Error('Invalid argument:' + typeof a); e = a; if (typeof e.destinationName === 'undefined') throw Error(f(h.INVALID_ARGUMENT, [e.destinationName, 'Message.destinationName'])); } else e = new r(b), e.destinationName = a, arguments.length >= 3 && (e.qos = c), arguments.length >= 4 && (e.retained = d); l.send(e);
    }; this.publish = function (a, b, c, d) {
      Logger.debug('Publising message to: ', a); let e; if (arguments.length === 0) throw Error('Invalid argument.length');
      if (arguments.length == 1) { if (!(a instanceof r) && typeof a !== 'string') throw Error('Invalid argument:' + typeof a); e = a; if (typeof e.destinationName === 'undefined') throw Error(f(h.INVALID_ARGUMENT, [e.destinationName, 'Message.destinationName'])); } else e = new r(b), e.destinationName = a, arguments.length >= 3 && (e.qos = c), arguments.length >= 4 && (e.retained = d); l.send(e);
    }; this.disconnect = function () { l.disconnect(); }; this.getTraceLog = function () { return l.getTraceLog(); }; this.startTrace = function () { l.startTrace(); }; this.stopTrace = function () { l.stopTrace(); }; this.isConnected = function () { return l.connected; };
  }; G.prototype = {
    get host() { return this._getHost(); },
    set host(a) { this._setHost(a); },
    get port() { return this._getPort(); },
    set port(a) { this._setPort(a); },
    get path() { return this._getPath(); },
    set path(a) { this._setPath(a); },
    get clientId() { return this._getClientId(); },
    set clientId(a) { this._setClientId(a); },
    get onConnected() { return this._getOnConnected(); },
    set onConnected(a) { this._setOnConnected(a); },
    get disconnectedPublishing() { return this._getDisconnectedPublishing(); },
    set disconnectedPublishing(a) { this._setDisconnectedPublishing(a); },
    get disconnectedBufferSize() { return this._getDisconnectedBufferSize(); },
    set disconnectedBufferSize(a) { this._setDisconnectedBufferSize(a); },
    get onConnectionLost() { return this._getOnConnectionLost(); },
    set onConnectionLost(a) { this._setOnConnectionLost(a); },
    get onMessageDelivered() { return this._getOnMessageDelivered(); },
    set onMessageDelivered(a) { this._setOnMessageDelivered(a); },
    get onMessageArrived() { return this._getOnMessageArrived(); },
    set onMessageArrived(a) { this._setOnMessageArrived(a); },
    get trace() { return this._getTrace(); },
    set trace(a) { this._setTrace(a); }
  }; var r = function (a) {
    let b; if (typeof a === 'string' || a instanceof ArrayBuffer || a instanceof Int8Array || a instanceof Uint8Array || a instanceof Int16Array || a instanceof Uint16Array || a instanceof Int32Array || a instanceof Uint32Array || a instanceof Float32Array || a instanceof Float64Array)b = a; else throw f(h.INVALID_ARGUMENT, [a, 'newPayload']); this._getPayloadString = function () { return typeof b === 'string' ? b : E(b, 0, b.length); }; this._getPayloadBytes = function () { if (typeof b === 'string') { var a = new ArrayBuffer(n(b)); var a = new Uint8Array(a); D(b, a, 0); return a; } return b; }; let c; this._getDestinationName = function () { return c; }; this._setDestinationName = function (a) { if (typeof a === 'string')c = a; else throw Error(f(h.INVALID_ARGUMENT, [a, 'newDestinationName'])); }; let d = 0; this._getQos = function () { return d; }; this._setQos = function (a) { if (a === 0 || a === 1 || a === 2)d = a; else throw Error('Invalid argument:' + a); }; let e = !1; this._getRetained = function () { return e; }; this._setRetained = function (a) {
      if (typeof a
=== 'boolean')e = a; else throw Error(f(h.INVALID_ARGUMENT, [a, 'newRetained']));
    }; let g = !1; this._getDuplicate = function () { return g; }; this._setDuplicate = function (a) { g = a; };
  }; r.prototype = {
    get payloadString() { return this._getPayloadString(); },
    get payloadBytes() { return this._getPayloadBytes(); },
    get destinationName() { return this._getDestinationName(); },
    set destinationName(a) { this._setDestinationName(a); },
    get topic() { return this._getDestinationName(); },
    set topic(a) { this._setDestinationName(a); },
    get qos() { return this._getQos(); },
    set qos(a) { this._setQos(a); },
    get retained() { return this._getRetained(); },
    set retained(a) { this._setRetained(a); },
    get duplicate() { return this._getDuplicate(); },
    set duplicate(a) { this._setDuplicate(a); }
  }; return { Client: G, Message: r };
}(window))));
