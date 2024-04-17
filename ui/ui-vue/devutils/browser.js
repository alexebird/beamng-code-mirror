// Small utilities for convenience when testing / working on game UI stuff OUTSIDE of the game (in a normal browser)


/**
 * Run the passed function if we're outside of the game
 *
 * @param      {Function}  fn      The function to run
 */
export const runInBrowser = fn => {
  if (!window.beamng) fn()
}

/**
 * Sends a GUI hook via JS - AngularJS and Vue will respond appropriately
 *
 * @param      {<type>}  name    The name of the hook
 * @param      {Array}   params  The remaining parameters to send to hook
 */
export const sendGUIHook = (name, ...params) => {
  window.bridge && window.bridge.events && window.bridge.events.emit(name, ...params)
  window.globalAngularRootScope && window.globalAngularRootScope.$broadcast(name, ...params)
}
