import { applyMockInterface, getMockedData } from './mock.js'


export default applyMockInterface({}, {

	// flag for outside code to check if the BNGAPI is the mocked version
	isMock: true,


	// apply any mocks for BeamNGAPI you require here


	engineLua(luaCode, callback = i=>{}) {
		console.log('engineLua called in mock: ' + luaCode)

		// get mock dev data if asked
		if (luaCode.startsWith('dev.getMockedData')) {
			const path = [...luaCode.matchAll(/(?:\(\")(.*)(?:\"\))/g)][0][1]
			console.log(`Getting mocked data '${path}'`)
			getMockedData(path).then(callback)
			return
		}

		callback()
	},

	serializeToLua(i) {
		return JSON.stringify(i)
	},



})
