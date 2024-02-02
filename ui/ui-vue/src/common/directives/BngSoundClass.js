// BngSoundClass Directive - allows elements to have 'sound classes'

import { lua } from "@/bridge"

const events = ["click", "dblclick", "focus", "mouseenter"]
const nonMutedValues = [null, undefined, false, "0", "false", 0]

export default {
	mounted(el, binding) {
		el.soundClass = binding.value
		setHandlerState(el, true)
	},
	unmounted(el) {
		delete el.soundClass
		setHandlerState(el, false)
	},
}

function setHandlerState(el, active) {
	events.forEach(ev => el[active ? "addEventListener" : "removeEventListener"](ev, mouseEventSoundHandler))
}

function mouseEventSoundHandler(ev) {
	// TODO - implement the hack below

	// // this is a hack to prevent he following scenario:
	// // a) click on a button in page X, leading to page Y. Mouse is over an element with sound on page Y.
	// // this prevents the hover sounds on page Y
	// // ignoring the first 2 'hover' sounds
	// if(newPageSilenceEventCounter > 0 && (ev == 'mouseenter' || ev == 'focus')) {
	// 	let dt = Date.now() - newPageTimestamp
	// 	if(dt > 200) {
	// 		//console.error("page change timeout", dt)
	// 		newPageSilenceEventCounter = 0
	// 	} else {
	// 		//console.log('ignoring sound: ', soundClass, ev, dt)
	// 		newPageSilenceEventCounter--
	// 		return
	// 	}
	// }

	const muted = !nonMutedValues.includes(ev.target.getAttribute("mute"))
	if (!muted) lua.ui_audio.playEventSound(ev.target.soundClass, ev.type)
}
