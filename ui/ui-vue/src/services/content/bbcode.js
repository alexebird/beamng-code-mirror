import REPLACEMENTS from './bbcode_main.js'
import VUE_EXTENSIONS from './bbcode_vue.js'
import ANGULAR_EXTENSIONS from './bbcode_angular.js'

const PARSE_NESTED = 'PARSE_NESTED'

let _extensions = VUE_EXTENSIONS  // default extensions to use

export const useExtensions = exts => _extensions = exts

export const parse = (txt, extensions = _extensions) => {
  let text = '' + txt
  const replacements = [...REPLACEMENTS, ...extensions]
  replacements.forEach(replacement => {
    const {nested, fromTo} = replacementDetails(replacement)
    text = nested ? parseNested(text, ...fromTo) : text.replace(...fromTo)
  })
  return text
}


// ** TODO ** Remove this when no longer necessary (could be a while) 
window.angularParseBBCode = txt => parse(txt, ANGULAR_EXTENSIONS)

const replacementDetails = replacement => ({
  nested: replacement.length == 3 && replacement[0] === PARSE_NESTED,
  fromTo: replacement.slice(-2)
})

const parseNested = (text, regex, template) => {
  while (~text.search(regex)) text = text.replace(regex, template)
  return text
}
