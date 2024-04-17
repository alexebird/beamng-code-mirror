// Library of wrappers for Lua function calls

import { useBridge } from "../index.js"
import LuaFunctionSignatures from "../LuaFunctionSignatures.js"

let api
const loadAPI = () => api || ({ api } = useBridge())

export const Any = i => i
export const Integer = i => +i | 0

const argTransformers = {
  Any,
  String,
  Number,
  Boolean,
  Object,
  Integer,
}

signaturesToWrappers(LuaFunctionSignatures)

export default LuaFunctionSignatures

/**
 * Converts Lua function signatures in an object to wrappers for Lua calls (beware - mutates original object)
 *
 * @param      {function[]}  sigsObject    The signatures
 * @param      {string[]}    [prefixes=[]  ]  The prefixes (namespace ancestors)
 * @return     {object}      Object containing signatures transformed into wrappers
 */
function signaturesToWrappers(sigsObject, prefixes = []) {
  let sigType, sig, funcPath, paramTypes, callName
  for (let key in sigsObject) {
    sig = sigsObject[key]
    sigType = typeof sig
    funcPath = [...prefixes, key]
    // if it is an arrow function, transform it
    if (sigType === "function" && isArrowFunction(sig)) {
      paramTypes = normaliseTypes(sig(), sig.length)
      callName = funcPath.join(".")
      sigsObject[key] = buildWrapper(callName, paramTypes, sig.mocked)
      // namespace
    } else if (sigType === "object") {
      sigsObject[key] = signaturesToWrappers(sig, funcPath)
    }
  }
  return sigsObject
}

/**
 * Builds a wrapper function that actually makes the Lua call
 *
 * @param      {string}      callName                  The Lua function name to call
 * @param      {function[]}  paramTypes                The parameter types
 * @param      {any}         [mockResponse=undefined]  The mock response for the wrapper (will be returned if outside
 *                                                     game)
 * @return     {function}    The wrapper.
 */
function buildWrapper(callName, paramTypes, mockResponse = undefined) {
  return (...args) => run(callName, args, { argTypes: paramTypes, mockResponse })
}

/**
 * Checks if the passed function is an arrow function. This could be a bit naive, we need to be sure to write
 * non-transformable methods (i.e. signatures) starting with 'function('
 *
 * @param      {function}  func    The function to check
 * @return     {boolean}   True if the specified function is an arrow function, False otherwise.
 */
function isArrowFunction(func) {
  return !(("" + func).indexOf("function(") == 0)
}

/**
 * Normalise the type signature returned by the Lua function signature
 *
 * @param      {any}     types       The type signature
 * @param      {number}  paramCount  The number of parameters
 * @return     {Array}   Array with matching param type for each param
 */
function normaliseTypes(types, paramCount) {
  if (!types) return Array(paramCount).fill(Any)
  if (Array.isArray(types)) return types
  return [types]
}

/**
 * Runs a named Lua function with the given arguments
 *
 * @param      {string}      funcName                                      The Lua function name
 * @param      {array}       args                                          Arguments for the function
 * @param      {Object}      arg3                                          Options
 * @param      {function[]}  [arg3.argTypes=Array(args.length).fill(Any)]  Argument types
 * @param      {any}         arg3.mockResponse                             The mock response to use if we're outside
 *                                                                         game
 * @return     {promise}     Promise that will resolve to the Lua return value
 */
export function run(funcName, args, { argTypes = Array(args.length).fill(Any), mockResponse }) {
  loadAPI()
  if (args.length < argTypes.length)
    throw new Error(
      `Wrong number of required arguments (${args.length}) provided for Lua function '${funcName}' which takes ${argTypes.length ? `${argTypes.length}` : "none"}`
    )

  let transformedArgs
  if (api.isMock && mockResponse) {
    transformedArgs = args.map((arg, i) => (argTypes[i] && argTransformers[argTypes[i].name] || Any)(arg))
    return runMocked(mockResponse, transformedArgs)
  }

  transformedArgs = args.map((arg, i) => serialize((argTypes[i] && argTransformers[argTypes[i].name] || Any)(arg)))
  return runRaw(`${funcName}(${transformedArgs})`)
}

/**
 * Run raw Lua code via 'engineLua'
 *
 * @param      {string}   luaCode  Code to run
 * @return     {Promise}  Promise that will resolve to the Lua return value
 */
export function runRaw(luaCode, withPromise = true) {
  loadAPI()
  // console.log('Running Lua code:')
  // console.log(luaCode)
  //
  // There are situations when you may want to run without a promise as some Lua code inserted into the code generated by BeamNGAPI.englineLua can break when callbacks are requested
  if (withPromise) {
    return new Promise(function (resolve, reject) {
      api.engineLua(luaCode, resolve)
    })
  }
  return api.engineLua(luaCode)
}

/**
 * Run the mocked result for a signature
 *
 * @param      {any}      response  The response (if it is a function, will run it first - then will return value
 *                                  wrapped in a Promise if not a promise, or the promise)
 * @return     {Promise}  promise that resolves to the result
 */
function runMocked(response, args) {
  let ret
  if (typeof response === "function") {
    ret = response(...args)
  } else {
    ret = response
  }
  return (ret && ret.then) ? ret : new Promise((resolve, reject) => resolve(ret))
}

/**
 * Serialize given input for passing to Luas functions
 *
 * @param      {any}     o       value to serialize
 * @return     {string}  serialized value
 */
export function serialize(o) {
  loadAPI()
  return api.serializeToLua(o)
}

/**
 * Do the serialization and throw the result to Lua to check for problems
 *
 * @param      {any}     o       value to serialize
 * @return     {string}  serialized value
 */
export function serializeCheck(o) {
  loadAPI()
  return api.serializeToLua(o)
}
