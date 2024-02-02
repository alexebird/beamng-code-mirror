// UINav - some convenience functions/composables for working with UI Nav stuff

import { default as UINavEvents, ACTIONS_BY_UI_EVENT } from "@/bridge/libs/UINavEvents"
import { ref, onMounted, onUnmounted, watch, computed } from "vue"

/**
 * Composable to allow component to easily make use of UI scopes
 *
 * @param      {string|undefined}  [scope=undefined]             The scope to use when the component mounts (can be
 *                                                               unset)
 * @param      {boolean}           [restoreScopeOnUnmount=true]  Switch to automatically restore previous UI scope
 *                                                               (before the component was mounted) upon unmount
 * @return     {Object}            An interface with methods to retrieve the `current()` UI scope (as a computed), and to
 *                                 `set()` the current scope
 */
export function useUINavScope(scope = undefined, restoreScopeOnUnmount = true) {

  const currentScope = ref(scope)
  let oldScope, scopeChanged = false

  const setScope = newScope => {
    scopeChanged = true
    currentScope.value = newScope
    UINavEvents.activeScope = newScope
  }

  onMounted(() => {
    oldScope = UINavEvents.activeScope
    if (currentScope.value) {
      setScope(currentScope.value)
    } else {
      currentScope.value = oldScope
    }
  })

  onUnmounted(() => {
    if (scopeChanged && restoreScopeOnUnmount) {
      UINavEvents.activeScope = oldScope
    }
  })

  return {
    current: computed(() => currentScope.value),
    set: setScope
  }

}


/**
 * Convenience function to set up a watcher for the `ui-nav-event` attribute on an element
 *
 * @param      {ref}       domElementRef  The dom element reference
 * @param      {function}  handler        Function to handle changes (receives the UI event name, and corresponding
 *                                        action from the actionMaps)
 * @return     {function}  A function that will switch off the watcher if called (standard return from a Vue watch)
 */
export function watchUINavEventChange(domElementRef, handler) {
  return watch(() => {
    if (!domElementRef.value) return {}
    const eventName = domElementRef.value.getAttribute("ui-nav-event")
    return {
      eventName,
      action: ACTIONS_BY_UI_EVENT[eventName]
    }
  }, handler)
}
