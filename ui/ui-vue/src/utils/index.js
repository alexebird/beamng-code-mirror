export { getMockedData } from '@/../devutils/mock.js'
export { runInBrowser } from '@/../devutils/browser.js'

export function getAssetURL(assetPath) {
	return bngVue.isProd ? `/ui/ui-vue/dist/${assetPath}` : `http://localhost:9000/${assetPath}`
}

export function useAppGlobals(appContext) {
	return appContext.config.globalProperties
}

export function useAppGlobalsFromBinding(binding) {
	return useAppGlobals(binding.instance.$.appContext)
}

export const ucaseFirst = str => str[0].toUpperCase() + str.slice(1)


// Simplistic, probably crappy '$q.defer' implementation (only accepts a notify handler at the top-level 'then')
// ** TODO ** Find a better (correct) implementation if this turns out to be wrong!
export const defer = () => {
  
  const noop = () => {}
  let resolve, reject, _notifyHandler = noop
  const promise = new Promise((res, rej) => {
    [resolve, reject] = [res, rej]
  })
  
  const _wrappedPromise = {
    then: (resolveHandler, rejectHandler=noop, notifyHandler=noop) => {
      _notifyHandler = notifyHandler
      return promise.then(resolveHandler, rejectHandler)
    }
  }
  
  const notify = val => _notifyHandler(val)
    
  return {
    promise: _wrappedPromise,
    resolve,
    reject,
    notify
  }
  
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
