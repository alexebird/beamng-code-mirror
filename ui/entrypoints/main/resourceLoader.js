import resources from "./resources.js"

const locSearchParams = new URLSearchParams(window.location.search)

const env = {
  isVueDev: !!+locSearchParams.get("vuedev") || !!+locSearchParams.get("vuedevtools"),
}

resources.map(res => resourceToDOMElement(res, env)).forEach(addElementToHead)

/**
 * Convert a resource item to an equivalent DOM element
 *
 * @param      {string|object}  res       The resource item
 * @param      {object}         [env={}]  The environment against which conditions will be checked
 * @return     {object}         DOM element (link/script)
 */
function resourceToDOMElement(res, env = {}) {
  // check if this file item valid with current env
  if (res && res.condition && !res.condition(env)) return false

  const realURL = getURLForResource(res)
  const { src, path, condition, ...extras } = typeof res == "string" ? {} : res

  return isScript(realURL) ? makeScript(realURL, extras) : makeStylesheetImport(realURL, extras)
}

/**
 * Adds an element to head section of page.
 *
 * @param      {object}  el      DOM Element
 */
function addElementToHead(el) {
  el && window.document.head.appendChild(el)
}

/**
 * Gets the url for resource.
 *
 * @param      {string|object}  res     The resource
 * @return     {string}         The url for resource.
 */
function getURLForResource(res) {
  return typeof res == "string" ? res : `${res.path || ""}${res.src}`
}

/**
 * Determines whether the specified url is a script.
 *
 * @param      {string}   URL     URL to check
 * @return     {boolean}  True if the specified url is script resource, False otherwise.
 */
function isScript(URL) {
  return URL.endsWith(".js") || URL.endsWith(".mjs")
}

/**
 * Makes a script dom element.
 *
 * @param      {string}  URL     The url of the script
 * @param      {object}  props   Additional properties for the element
 * @return     {object}  Script DOM element
 */
function makeScript(URL, props) {
  return makeElement("script", {
    async: false,
    ...props,
    src: URL,
  })
}

/**
 * Makes a stylesheet dom element (link tag).
 *
 * @param      {string}  URL     The url of the stylesheet
 * @param      {object}  props   Additonal properties for the element
 * @return     {object}  DOM element (link)
 */
function makeStylesheetImport(URL, props) {
  return makeElement("link", {
    rel: "stylesheet",
    type: "text/css",
    href: URL,
  })
}

/**
 * Makes a DOM element.
 *
 * @param      {string}  type        Element type (tag name)
 * @param      {object}  [props={}]  Properties for the element
 * @return     {object}  Created DOM element
 */
function makeElement(type, props = {}) {
  const el = document.createElement(type)
  Object.assign(el, props)
  return el
}

/**
 * Sets a path on all passed resources
 *
 * @param      {string}  path           The path to set
 * @param      {Array}   [resources=[]  ]  The resources
 * @return     {Array}   Resources with path set
 */
export function inPath(path, resources = []) {
  return transformResources(resources, makeResourceWithProperty("path", path))
}

/**
 * Sets a condition to all passed resources
 *
 * @param      {function}  cond           The condition function (will receive env object)
 * @param      {Array}     [resources=[]  ]  The resources
 * @return     {Array}    Resources with condition set
 */
export function onCondition(cond, resources = []) {
  return transformResources(resources, makeResourceWithProperty("condition", cond))
}

/**
 * Normalise passed resource(s) and maps the given transform over them
 *
 * @param      {Array|object}  resources      The resources to transform
 * @param      {function}      transformFunc  Transform function
 * @return     {Array}         Transformed resource(s) in array
 */
function transformResources(resources, transformFunc) {
  const normalisedResources = Array.isArray(resources) ? resources : [resources]
  return normalisedResources.map(transformFunc)
}

/**
 * Makes a function to add a given property to a resource (converting plain string resource to object if necessary).
 *
 * @param      {string}    prop    Name of property to add
 * @param      {any}       val     The value of property
 * @return     {function}  function to do the job
 */
function makeResourceWithProperty(prop, val) {
  return resource => {
    const newResource = typeof resource == "string" ? { src: resource } : resource
    newResource[prop] = val
    return newResource
  }
}
