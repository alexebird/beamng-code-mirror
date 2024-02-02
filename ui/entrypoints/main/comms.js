var ws
var msgBuffer = []

if( typeof beamng === 'undefined' || beamng === null ) {
  console.log("starting external client mode ...")
  beamng = {}

  beamng.shipping     = true
  beamng.product      = 'drive'
  beamng.buildtype    = ''
  beamng.version      = ''
  beamng.versionshort = ''
  beamng.buildinfo    = ''
  beamng.language     = ''
  beamng.ingame       = false
  beamng.clientId     = 0


  function sendWs(msg) {
    if(ws == null || ws.readyState != WebSocket.OPEN) {
      msgBuffer.push(msg)
      return
    }
    //console.log(" > ", msg)
    ws.send(msg)
  }

  beamng.sendGameEngine      = function(str) { sendWs('GT' + str); }
  beamng.sendActiveObjectLua = function(str) { sendWs('PO' + str); }
  beamng.queueAllObjectLua   = function(str) { sendWs('PB' + str); }
  beamng.sendEngineLua       = function(str) { sendWs('GL' + str); }
  beamng.subscribeToEvents   = function(str) { sendWs('SE' + str); }
  beamng.requestServiceProviderInfo = function() { sendWs('SI'); }

  beamng.uiUpdate  = function()    {}
  beamng.uiDestroy = function()    {}
  beamng.loadURL   = function(str) {}
} else {
  beamng.ingame = true
  // fix for console.log not showing reaching the log with all arguments: https://bitbucket.org/chromiumembedded/cef/issues/324
  /*
  log_orig = console.log
  console.log   = function(...args) { log_orig(JSON.stringify(args)); }
  log_err_orig = console.error
  console.error = function(...args) { log_err_orig(JSON.stringify(args)); }
  log_warn_orig = console.warn
  console.warn  = function(...args) { log_warn_orig(JSON.stringify(args)); }
  */
}

function get_appropriate_ws_url() {
  var pcol
  var u = document.URL
  if (u.substring(0, 5) === "https") {
    pcol = "wss://"
    u = u.substr(8)
  } else {
    pcol = "ws://"
    if (u.substring(0, 4) === "http") u = u.substr(7)
  }
  u = u.split("/")
  return pcol + u[0] + "/"
}

var hookQueue = []

function websocketCommGetConnectionState() {
  if(!ws) return "closed"
  return ws.readyState == WebSocket.OPEN ? "open" : "closed"
}

function handleMessage(msgRawData) {
  let msgId   = msgRawData.substr(0, 2)
  let msgData = msgRawData.slice(2)

  // attention: msgData needs to be eval'ed as it is not compliant Json data.

  /*
  // to get compliant json code you can use this:
  msgData = msgData.replace(/\\*\f/g, '\\f')
  .replace(/\\13/g, '\\r')
  .replace(/\\*\n/g, '\\n')
  .replace(/\\*\r/g, '\\r')
  .replace(/\\*\t/g, '\\t')
  */

  if(msgId == 'H#') {
    // we got hooks :D
    cmd = 'window.multihookUpdate(' + msgData + ')'
    if(typeof window.HookManager !== 'undefined') {
      try {
        eval(cmd)
        if(hookQueue.length > 0) {
          for (const d in hookQueue) {
            eval(hookQueue[d])
          }
          hookQueue = []
        }
      } catch(exception) {
        console.log("Exception:", exception, msgData)
      }
    } else {
      hookQueue.push(cmd)
    }

  } else if(msgId == 'S#') {
    // we got streams
    if(typeof window.streamUpdate == 'function') {
      eval('window.streamUpdate(' + msgData + ')')
    }
  } else if(msgId == 'I#') {
    // beamng base info on connect
    let bngData = JSON.parse(msgData)
    console.log('Got BeamNG client info:', bngData)
    beamng = Object.assign(beamng, bngData)
  } else {
    console.log("unknown message: ", msgId, msgData)
  }
}

function reconnectWebsocketComm() {
  ws = new WebSocket(get_appropriate_ws_url(""), "bng-ext-app-v1")
  try {
    ws.onmessage = function(evt) {
        //console.log("got data:", evt)
        if (evt.data instanceof Blob) {
            evt.data.text().then(text => {
              handleMessage(text)
            })
        } else if (typeof evt.data === 'string') {
          handleMessage(evt.data)
        }
    }
    ws.onclose = function(evt) {
      console.log('WS closed')
      if(typeof window.HookManager !== 'undefined') { window.HookManager.trigger('connectionStateChanged', ['closed']); }
      if(!ws || ws.readyState == WebSocket.CLOSED) {
        console.log("WS reconnecting in 1 second ...")
        setTimeout(function(){
          reconnectWebsocketComm()
        }, 1000)
      }
    }
    ws.onerror = function(evt) {
      console.log("WS error", evt)
    }
    ws.onopen = function() {
      console.log("WS connected")
      if(typeof window.HookManager !== 'undefined') { window.HookManager.trigger('connectionStateChanged', ['open']); }
      // send outstanding messages
      //console.log("sending buffer ...")
      for (const i in msgBuffer) {
        ws.send(msgBuffer[i])
      }
      msgBuffer = []
    }
  } catch(exception) {
    console.log("Exception:", exception)
  }
}


if(!beamng.ingame) {
  reconnectWebsocketComm()
}