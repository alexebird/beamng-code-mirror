"use strict"

const mr = /^\/ui\/modModules\/(.*)$/
let bootstrapped = false

async function boostrapAngular(modulePaths = []) {
	if(bootstrapped) {
		console.error("UI is already bootstrapped. Can do this only once.")
		return
	}
	bootstrapped = true
	// ensure the UI is loaded
	await new Promise((resolve, reject) => {
		// see the list in main.js
		const mods = ['BeamNG.ui', 'beamng.core', 'beamng.components', 'beamng.data', 'ngMaterial', 'ngAnimate', 'ui.router', 'beamng.stuff', 'beamng.gameUI', 'beamng.apps', 'beamng.color', 'pascalprecht.translate', 'beamng.gamepadNav', 'beamng.controls', 'fc.paging', 'ngSanitize', 'jkAngularRatingStars', 'ngFitText'];
		function check() {
			try { // can't find a better way checking for that in our angular version
				for (let mod of mods)
					angular.module(mod);
				return true;
			} catch (err) {
				return false;
			}
		}
		if (check())
			return resolve();
		console.log("UI is still loading...");
		let cnt = 1, lim = 200, delay = 100;
		let tmr = setInterval(() => {
			if (check()) {
				clearInterval(tmr);
				console.log(`Waited ${cnt * delay / 1000}s for the UI`);
				return resolve();
			}
			if (cnt >= lim) {
				clearInterval(tmr);
				return reject("Timeout while waiting for the UI to load");
			}
			cnt++;
		}, delay);
	});
	// load UI modules
	let promises = []
	for(const modulePathKey of Object.keys(modulePaths)) {
		let modulePath = modulePaths[modulePathKey]
		let res = mr.exec(modulePath)
		if(res && res.length == 2) {
			const moduleName = res[1]
			promises.push(import(`/ui/modModules/${moduleName}/${moduleName}.js`).then((module) => {
				angular.module('BeamNG.ui').requires.push(moduleName)
			}).catch((err) => {
				console.error(`module failed to load: '${moduleName}' [ ${err} ]`)
			}))

		} else {
			console.error(`Invalid UI module: '${modulePath}' [ ${res} ]`)
		}
	}

	await Promise.all(promises)

	// bootstrap angular after all modules are loaded
	angular.bootstrap(document, ['BeamNG.ui'])
}

function angularModsSetup() {
	// this is so we can receive the modules when the hook returns
	vueEventBus.on('onUIBootstrap', boostrapAngular)
	beamng.subscribeToEvents('{}')
	beamng.sendEngineLua('sendUIModules()')
}
