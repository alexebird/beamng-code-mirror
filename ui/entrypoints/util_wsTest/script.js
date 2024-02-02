
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

var lastTime
var lineCounter = 0
var bwTestMode = ''
var bwTestDataSize = 10 * 1000000 // 10 MB

document.addEventListener("DOMContentLoaded", function() {
  var ws = new WebSocket(get_appropriate_ws_url(""), "bng-test")
  var inputText = document.getElementById("inputText")
  var execGELuaBtn = document.getElementById("execGELua")
  var log = document.getElementById("log")
  try {
    ws.onopen = function() {
      inputText.disabled = 0
      execGELuaBtn.disabled = 0
    }

    ws.onmessage = function got_packet(msg) {
      if(msg.data == 'pong') {
        var dt = performance.now() - lastTime
        log.value = log.value + 'PingPong connection delay: ' + dt.toFixed(2) + "ms\n"
        log.scrollTop = log.scrollHeight
        lineCounter++
      } else if(msg.data == 'ack' && bwTestMode == 'down') {
        var dtS = (performance.now() - lastTime) / 1000
        var dlSpeed = (bwTestDataSize / dtS) / 1024
        var dlSpeedStr
        if(dlSpeed < 1024) {
          dlSpeedStr = dlSpeed.toFixed(2) + ' kB/s'
        } else {
          dlSpeed  = dlSpeed / 1024
          dlSpeedStr = dlSpeed.toFixed(2) + ' MB/s'
        }
        log.value = log.value + 'Bandwidth download: ' + dlSpeedStr + "\n"
        log.scrollTop = log.scrollHeight
        lineCounter++
        bwTestMode = 'up'
        ws.send(JSON.stringify({ "type": "bandwidthUpStart", "size": bwTestDataSize }))
      } else if(msg.data == 'ack' && bwTestMode == 'up') {
        lastTime = performance.now()
      } else if(msg.data == 'done' && bwTestMode == 'up') {
        var dtS = (performance.now() - lastTime) / 1000
        var dlSpeed = (bwTestDataSize / dtS) / 1024
        var dlSpeedStr
        if(dlSpeed < 1024) {
          dlSpeedStr = dlSpeed.toFixed(2) + ' kB/s'
        } else {
          dlSpeed  = dlSpeed / 1024
          dlSpeedStr = dlSpeed.toFixed(2) + ' MB/s'
        }
        document.getElementById("bandwidth").disabled = 0
        log.value = log.value + 'Bandwidth upload: ' + dlSpeedStr + "\n"
        log.scrollTop = log.scrollHeight
        lineCounter++
        bwTestMode = ''

      } else if (bwTestMode == '') {
        log.value = log.value + msg.data + "\n"
        log.scrollTop = log.scrollHeight
        lineCounter++
      }
      if(lineCounter > 1000) {
        log.value = ""
      }
    }

    ws.onclose = function() {
      inputText.disabled = 1
      execGELuaBtn.disabled = 1
    }
  } catch(exception) {
    alert("<p>Error " + exception)
  }

  function execGELua() {
    ws.send(JSON.stringify({ "type": "execGELua", "cmd": inputText.value}))
    inputText.value = ""
  }

  document.getElementById("execGELua").addEventListener("click", execGELua)

  document.getElementById("reloadGELua").addEventListener("click", function(){
    ws.send(JSON.stringify({ "type": "reloadGELua" }))
  })

  document.getElementById("reloadCEF").addEventListener("click", function(){
    ws.send(JSON.stringify({ "type": "reloadCEF" }))
  })

  document.getElementById("toggleCEFDevConsole").addEventListener("click", function(){
    ws.send(JSON.stringify({ "type": "toggleCEFDevConsole" }))
  })

  document.getElementById("ping").addEventListener("click", function(){
    ws.send("ping")
    lastTime = performance.now()
  })

  function generateRandomData(length) {
    var result           = []
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
    }
    return result.join('')
  }

  document.getElementById("bandwidth").addEventListener("click", function() {
    document.getElementById("bandwidth").disabled = 1
    ws.send(JSON.stringify({ "type": "bandwidthDown", "data": generateRandomData(bwTestDataSize) }))
    bwTestMode = 'down'
    lastTime = performance.now()
  })




}, false)
