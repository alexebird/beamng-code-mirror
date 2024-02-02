import Logger from '@/services/logger'

const TRANSLATION_TEXT = '__text__'

let TRANSLATIONS_REQUIRING_ANGULAR_TRANSLATE = {}

let _angularTranslateFunc

let translate = val => val

export const contextTranslatePlugin = _translate => ({
  install(app, options) {
    translate = _wrapToHandleClashes(_translate)
    // Vue18n itself makes $t available in templates automatically - the three globals below make other familiar functionality available
    app.config.globalProperties.$ctx_t = (val, translateContext = true) => contextTranslate(val, translateContext)
    app.config.globalProperties.$mctx_t = multiContextTranslate
    // also make the wrapped clash handling version available in case it is needed
    app.config.globalProperties.$tt = translate
  }
})

const contextTranslate = (val, translateContext = false) => {
  if (val && val.txt && val.context) {
    let context = val.context
    if (translateContext) {
      let newContext = {}
      for (const key of Object.keys(context)) {
        newContext[key] = contextTranslate(context[key], true)
      }
      context = newContext
    }
    return getTranslation(val.txt, context)
  } else {
    return typeof val === 'undefined' ? '' : getTranslation('' + val)
  }
}

const multiContextTranslate = val => {
  if (val.txt) return contextTranslate(val)
  let description = ''
  for (const i of val) description += contextTranslate(i)
  return description
}

const angularTranslationNeeded = str => {
	const needed = !!TRANSLATIONS_REQUIRING_ANGULAR_TRANSLATE[str]
	needed && Logger.debug('Using AngularJS translation, please try to avoid using/adding translation strings with AngularJS code in them:', str)
	return needed
}

const testIfAngularTranslationRequired = str => !!str.match(/({{\s*::)|({{[^(}})]*\s*?\|)/gi)

const getAngularTranslationFunc = () => {
  if (_angularTranslateFunc) return _angularTranslateFunc
  return _angularTranslateFunc = window.angular$translate ? window.angular$translate.instant.bind(window.angular$translate) : translate
}

const getTranslation = (...vals) => (angularTranslationNeeded(vals[0]) ? getAngularTranslationFunc() : translate)(...vals)


export const $translate = {
  instant: val => val != undefined ? translate(val) : '',
  contextTranslate,
  multiContextTranslate,
}


export const preprocessLocaleJSON = obj => {
  // let clashCount = 0
  const processedJSON = {}
  TRANSLATIONS_REQUIRING_ANGULAR_TRANSLATE = {}
  for (let [key, text] of Object.entries(obj)) {
  	if (testIfAngularTranslationRequired(text)) TRANSLATIONS_REQUIRING_ANGULAR_TRANSLATE[key] = text
    const pathParts = key.split('.'), thisKey = pathParts.pop()
    let workObj = processedJSON
    pathParts.forEach(part => {
      const temp = workObj[part]
      if (temp === undefined) {
        workObj[part] = {}
      } else if (typeof temp!=='object') {
        // deal with namespace clashes
        // Logger.debug(`CLASH ${++clashCount}! ${key}`)
        workObj[part] = {[TRANSLATION_TEXT]: temp}
      }
      workObj = workObj[part]
    })
    workObj[thisKey] = text
  }
  // Logger.debug(processedJSON)
  return processedJSON
}

function _wrapToHandleClashes(f) {
  const t = {
    [f.name]: function(...args) {
      const result = f.apply(this, args)
      if (args.length==1) {
        if (args[0]!=='' && result !== '' && ~result.indexOf('.') && result.slice(-1)!=='.' && result===args[0]) {
          Logger.debug('Attempting to fix possible translation file clash with: ' + args[0])
          const tryKey = `${args[0]}.${TRANSLATION_TEXT}`
          let newResult = f.apply(null, [tryKey])
          Logger.debug(newResult===tryKey ? 'Failed' : 'Succeeded')
          return newResult===tryKey ? result : newResult
        }
      }
      return result
    }
  }
  return t[f.name]
}
