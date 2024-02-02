
const MOCK_DATA_PATH = '../mockdata'

export function applyMockInterface(originalObject, mockInterface) {
	const handler = {
		mockInterface,
		get(target, propertyName) {
			const mockedMember = this.mockInterface[propertyName]
			return mockedMember ? mockedMember : (target[propertyName] || defaultMockedMethod(propertyName)) 
		},
	}
	return new Proxy(originalObject, handler)
}

function defaultMockedMethod(name) {
	return { [name]: function(...args) {
		console.log(`Mocked method '${name}' called with:`)
		console.log(args)
	}}[name]
}


export function getMockedData(fullPath) {
	const
		[file, ...path] = fullPath.split('.'),
		filename = `${MOCK_DATA_PATH}/${file}.js`,
		toEval = ['d', 'default', ...path, ].join('.')

	return import(/* @vite-ignore */filename).then(d => eval(toEval))
}