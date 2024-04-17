<!--*** Test Page for Jon -->
<template>
{{ ff }}
  <div class="demo">
    <h1><code>ui_nav</code> DOM event demo</h1>
    <h2>{{ $t("jon.msg3", {aa:"jon.test"})}}</h2>
    <button @click="testTempStorage">Test object passing with gotoGameState</button>
    <ul>
      <li>Rename <code>lua/ge/extensions/core/input/actions/uinav.json.txt</code> to <code>.json</code></li>
      <li>Set up some bindings for some of the actions in that file (use options > controls in the game is easiest)</li>
      <li>(You may need to temporarily disable some MenuItemNavigation actions - menu.json - in order to stop them swallowing the events. There is something about setting 'trap' to false, but I couldn't make it work in testing.</li>
      <li>Fully refresh this page with <code>F5</code></li>
      <li>Switch the UI events on here: <button @click="toggleEvents">{{ eventsOn ? "Switch off" : "Switch on" }}</button></li>
      <li>Use your controller to initiate some of the actions for which you defined bindings</li>
      <li>Observe results in console (data about the action is in the <code>event.detail</code> object</li>
      <li>Try focusing either of the inner buttons before initiating controller actions</li>
    </ul>
    <p>Interestingly, I discovered that the <code>@eventname</code> syntax in Vue for registering event handlers also works with custom events, which is nice.</p>
    <div id="outer" @ui_nav="uiNavOuter">
      Outer
      <!-- <div id="inner1" @ui_nav="uiNavInner1">Inner 1 <button>Focus me</button></div> -->
      <div ref="domel" id="inner2" @uis_nav="uiNavInner2">Inner 2 <button>Focus me</button></div>
    </div>

  <button @click="popup">Popup</button>

  <div id="scrolly">
    fefjwifjweijf fjwiefj owjijf jijoiwj<br/>fejwifjwioefjwoijfiojweiofjoiwejfoiwjeiofjowiejfoijweoifjoiwejfoiwejfoijweoifjoiewjfoiewjfoiwjefoijwoeifjewoi fejwifjewifjwiejfi fdejji djewijfiweji<br />
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </div> 
    
  </div>

</template>

<script></script>

<script setup>
import { ref, inject, onMounted, getCurrentInstance } from "vue"
import storage from "@/services/tempStorage"

import { openConfirmation } from "@/services/popup"

async function popup() {
  const res = await openConfirmation("", "Are you sure?", [
    { label: $translate.instant("ui.common.yes"), value: true, extras: {accent:'secondary'} },
    { label: $translate.instant("ui.common.no"), value: false },
  ])
}


import { $translate} from '@/services/translation'
console.log($translate.contextTranslate("jon.zzz", {poopy:'abcde'}))
console.log(getCurrentInstance())

import logger from "@/services/logger"

import useControls from "@/services/controls"

import UINavHandlers from "@/services/uiNavHandlers"

const c = useControls()

const domel = ref(null)

window.sss = storage

window.logger = logger

logger.debug('A debug message')
logger.info('An info message')
logger.warn('A warning message')
logger.error('An error message')

logger.debug('Another debug message with stack trace', 3, logger.STACK_TRACE)
logger.debug('A bunch of different stuff', 1, {a:2, b:3}, 101n, [8,5,3])

const props = defineProps({
  id:undefined
})

try {
  console.log(storage.pop(props.id))
} catch (e) {
  console.log(e.message)
}

window.jonTesto = () => {
  $game.lua.WinInput.setForwardRawEvents(true)
  const cap=c.captureBinding()
  
  cap.then(b=>{
    console.log('Got:', b)
    $game.lua.WinInput.setForwardRawEvents(false)
  }, (d)=>d, c=>console.log('Notify:', c))
}

function testTempStorage() {
  const id = storage.push({a:111, b:222, c:333})
  window.bngVue.gotoGameState('ui-test-jon', {params:{id}})
}



const $game = inject("$game")


const eventsOn = ref(true)

const toggleEvents = () => {
  eventsOn.value =!eventsOn.value

  // maybe it should be on by default? but just for safety in this demo, it is off by default
  $game.uiNavEvents.activate(eventsOn.value)
  
  document[eventsOn.value ? 'addEventListener' : 'removeEventListener']("ui_nav", uiNavDoc)
}

const uiNavOuter = e => (e.stopPropagation(),console.log(`Outer received ui_nav event [${e.detail.name}]`, e))
const uiNavInner1 = e => console.log(`Inner 1 received ui_nav event [${e.detail.name}]`, e)
// const uiNavInner2 = e => (e.stopPropagation(), console.log(`Inner 2 received ui_nav event [${e.detail.name}] and stopped propagation`, e))
const uiNavInner2 = e => (console.log(`Inner 2 received ui_nav event [${e.detail.name}] and didn't stop propagation`, e))
const uiNavDoc = e => console.log(`Document received ui_nav event [${e.detail.name}]`, e)


onMounted(()=>{

  // const myUINavHandler = UINavHandlers.add(domel.value, {name:v=>['rotate_h_cam','rotate_v_cam'].includes(v)}, (val, modified, extras)=>{
  //   console.log('hello', val, modified, extras)
  // })

  const myUINavHandler = UINavHandlers.add(domel.value, {name:'ok', modified:true}, ()=>console.log('WE GOT ONE!!!'))
  window.jonNav = myUINavHandler

})

</script>

<style lang="scss" scoped>
#scrolly {
  display:inline-block;
  width:100px;
  height:100px;
  overflow: auto;
}

.demo {
  position: absolute;
  inset: 0 0 0 0;
  background-color: black;
  color: white;
  padding:30px;
}

button:focus {
  border: 5px solid darkblue;
}
button {
  border: 5px solid transparent;
}

#outer {
  width: 300px;
  margin: 50px;
}

#outer,
#outer div {
  border: 1px solid blue;
  padding: 40px;
}
</style>
