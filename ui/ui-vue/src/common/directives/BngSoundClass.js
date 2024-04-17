// BngSoundClass Directive - allows elements to have 'sound classes'

import { lua } from "@/bridge"

const events = ["click", "dblclick", "focus", "mouseenter"]
const unmutedValues = [null, undefined, false, "0", "false", 0]

const updateSound = (el, binding) => {
	setHandlerState(el, false)
	delete el.soundClass
	if (!binding.value) return
	el.soundClass = binding.value
	setHandlerState(el, true)
}

export default {
	mounted: updateSound,
	updated: updateSound,
	unmounted: el => updateSound(el, {}) 
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

	const unmuted = unmutedValues.includes(ev.currentTarget.getAttribute("mute"))
	if (unmuted) lua.ui_audio.playEventSound(ev.currentTarget.soundClass, ev.type)
}
