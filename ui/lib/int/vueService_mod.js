import { setBridgeDependencies, useBridge } from "../../ui-vue/src/bridge/index.js"


// build the bridge if we don't have it (should only be necessary in external 'pages' like vehicle gauges)
if (!window.bridge) {
	// let { setBridgeDependencies, useBridge } = await import("../../ui-vue/src/bridge/index.js");
	setBridgeDependencies({ Emitter: TinyEmitter, beamng: window.beamng })
	window.bridge = useBridge()
}

window.vueEventBus = window.bridge.events
window.vueGlobalStore = Vue.reactive({})
let creationArguments = {
  locale: 'en-US',
  fallbackLocale: 'en-US',
  silentTranslationWarn: true,
  fallbackWarn: false,
	missingWarn: false
}
if (!beamng.shipping) {
  creationArguments.fallbackLocale = ['en-US', 'not-shipping.internal']
}
window.vueI18n = VueI18n.createI18n(creationArguments)


const BeamNGBaseAppMixin = {
	mounted: function() {
		for(let k in this) {
			if(k.substr(0, 2) === 'on' && k.length > 2) {
				window.vueEventBus.on(k, this[k])
			}
		}
		if(this.streams) {
			window.bridge.streams.add(this.streams)
		}
	},
	unmounted: function() {
		for(let k in this) {
			if(k.substr(0, 2) === 'on' && k.length > 2) {
				window.vueEventBus.off(k, this[k])
			}
		}
		if(this.streams) {
			window.bridge.streams.remove(this.streams)
		}
	},
	methods: {
		// this is a helper function that allows to recursively check the excistance of a object / key chain. Will return undefined if any value is missing
		getStore(...args) {
			let obj = this.GStore
			return args.reduce((obj, level) => obj && obj[level], obj)
		}
	}
}
window.BeamNGBaseAppMixin = BeamNGBaseAppMixin

window.createVueApp = function createVueApp() {
	let app = Vue.createApp({})
	app.use(vueI18n)
	app.provide('GStore', window.vueGlobalStore)
	app.config.globalProperties.eventBus = window.vueEventBus
	return app
}

window.globalAngularRootScope = null

window.bngApi = window.bridge.api
window.StreamsManager = window.bridge.streams
//window.UiUnits = new UIUnitsClass()
window.UiUnits = window.bridge.units

// TODO: convert all AngularJS services and factories
// .factory('Environment',
// .factory('Debug',

// kill sessionStorage and localStorage

window.newPageSilenceEventCounter = false// hack to silence first Sounds when entering a state
window.newPageTimestamp = null

// *** LEVELS DATA ***
window.levelsData = null
window.getLevelsDataCached = function getLevelsDataCached(cbFct) {
	if(levelsData) {
		cbFct(levelsData)
		return
	} else {
		bngApi.engineLua('extensions.core_levels.getList()', data => {
			levelsData = data
			cbFct(levelsData)
		})
	}
}
window.clearLevelsCache = function clearLevelsCache() {
	levelsData = null
}

// *** VEHICLES DATA ***
window.vehiclesData = null


// *** Language ***
window.i18nLanguageUsed = null
window.i18NLanguageFinished = true


if (window.angularModsSetup) window.angularModsSetup()

