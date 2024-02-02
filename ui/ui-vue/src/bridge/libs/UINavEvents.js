import { default as lua, runRaw as runRawLua } from "./Lua.js"
import * as Crossfire from "../../services/crossfire.js"


const
  /** Action Group used when filtering UI Nav actions in Lua */
  UI_NAV_ACTION_GROUP = "UINavActions",
  /** Name of the event we receive from GuiHook in Lua */
  GAME_UI_NAVIGATION_EVENT = 'UINavigation',
  /** Name of the event when menu enabled state changes Lua side */
  GAME_UI_NAV_MAP_ENABLED_EVENT = 'UINavMapEnabled',
  /** 'Type' of event we create inside the DOM */
  DOM_UI_NAVIGATION_EVENT = 'ui_nav',
  /** Name of the UI actionmap within Lua */
  UI_NAVIGATION_ACTION_MAP = '_UINavActionMap',
  /** HTML element attribute name used for defining UI scopes */
  UI_SCOPE_ATTR = 'bng-ui-scope',

  /**
   * Actions that correspond to UI Events
   * @readonly
   * @enum {string}
   */
   ACTIONS_BY_UI_EVENT = {
    'focus_u': 'menu_item_up',
    'focus_r': 'menu_item_right',
    'focus_d': 'menu_item_down',
    'focus_l': 'menu_item_left',
    'pause': 'pause',
    'menu': 'toggleMenues',
    'back': 'menu_item_back',
    'details': 'cui_details',
    'advanced': 'cui_advanced',
    'camera': 'cui_camera',
    'logs': 'cui_logs',
    'tab_l': 'menu_tab_left',
    'tab_r': 'menu_tab_right',
    'modifier': 'cui_modifier',
    'zoom_out': 'cui_zoom_out',
    'zoom_in': 'cui_zoom_in',
    'subtab_l': 'cui_subtab_l',
    'subtab_r': 'cui_subtab_r',
    'center_cam': 'center_camera',
    'action_4': 'cui_action_4',
    'move_ud': 'cui_move_ud',
    'move_lr': 'cui_move_lr',
    'focus_ud': 'menu_item_radial_y',
    'focus_lr': 'menu_item_radial_x',
    'rotate_h_cam': 'menu_item_radial_right_x',
    'rotate_v_cam': 'menu_item_radial_right_y',
    'ok': 'menu_item_select',
    'cancel': 'cui_cancel',
    'action_2': 'cui_action_2',
    'action_3': 'cui_action_3',
    'context': 'cui_context',
  },

  UI_EVENTS_BY_ACTION = Object.assign({}, ...Object.entries(ACTIONS_BY_UI_EVENT).map(([k,v]) => ({[v]:k}))),

  /**
   * UI Events available in the UI Nav system
   * @readonly
   * @enum
   */
  UI_EVENTS = {
    /** Move focus up to nearest UI element */
    'focus_u': 'focus_u',
    /** Move focus right to nearest UI element */
    'focus_r': 'focus_r',
    /** Move focus down to nearest UI element */
    'focus_d': 'focus_d',
    /** Move focus left to nearest UI element */
    'focus_l': 'focus_l',
    /** Pause/unpause */
    'pause': 'pause',
    /** Activate the menu (or possibly 'select') */
    'menu': 'menu',
    /** 'Cancel' or return back to previous screen */
    'back': 'back',
    /** View details */
    'details': 'details',
    /** Advanced */
    'advanced': 'advanced',
    /** Camera switch */
    'camera': 'camera',
    /** View logs */
    'logs': 'logs',
    /** Move to the previous tab to the left */
    'tab_l': 'tab_l',
    /** Move to the next tab to the right */
    'tab_r': 'tab_r',
    /** Modifier key has been pressed/released */
    'modifier': 'modifier',
    /** Zoom out */
    'zoom_out': 'zoom_out',
    /** Zoom in */
    'zoom_in': 'zoom_in',
    /** Move to the previous subtab to the left */
    'subtab_l': 'subtab_l',
    /** Move to the next subtab to the right */
    'subtab_r': 'subtab_r',
    /** Centre the camera */
    'center_cam': 'center_cam',
    /** Quaternary action */
    'action_4': 'action_4',
    /** Move vertically (up/down) using a scalar input */
    'move_ud': 'move_ud',
    /** Move horizontally (left/right) using a scalar input */
    'move_lr': 'move_lr',
    /** Move focus vertically (up/down) using a scalar input  (usually radial menu) */
    'focus_ud': 'focus_ud',
    /** Move focus horizontally (left/right) using a scalar input  (usually radial menu) */
    'focus_lr': 'focus_lr',
    /** Scroll menu horizontally / Rotate camera on horizontal-axis (scalar input) */
    'rotate_h_cam': 'rotate_h_cam',
    /** Scroll menu vertically / Rotate camera on vertical-axis (scalar input) */
    'rotate_v_cam': 'rotate_v_cam',
    /** Accept/click/take the currently selected item */
    'ok': 'ok',
    /** Cancel */
    'cancel': 'cancel',
    /** Secondary action */
    'action_2': 'action_2',
    /** Tertiary action */
    'action_3': 'action_3',
    /** Toggle context menu / take context specific action */
    'context': 'context',
  },

  /**
   * UI Event groups available in the UI Nav system
   * @readonly
   * @enum
   */
  UI_EVENT_GROUPS = {
    /** Non-scalae Focus Move events */
    focusMove: [UI_EVENTS.focus_u, UI_EVENTS.focus_d, UI_EVENTS.focus_l, UI_EVENTS.focus_r],
    /** Scalar Focus Move events (usually radial menu) */
    focusMoveScalar: [UI_EVENTS.focus_ud, UI_EVENTS.focus_lr],
    /** Scalar Move events */
    moveScalar: [UI_EVENTS.move_ud, UI_EVENTS.move_lr],
    /** All UI Events */
    allEvents: Object.keys(ACTIONS_BY_UI_EVENT)
  }


let
  eventBus,
  eventsActive = false,
  globalEventsHooked = false,
  isModified = false,
  activeScope = undefined

/**
 * Activates/Deactivates the UINavEvent system
 *
 * @param      {boolean}  [state=true]  The state (active/inactive)
 */
const activate = (state=true) => {
  activateUINavActionMap(state)
  attachEventListener(state)
  eventsActive = state
}

/**
 * Use Lua to activate/deactivate the given action map within the game
 *
 * @param      {string}     actionMapName  The action map name
 * @param      {(boolean)}  [state=true]   The state (active/inactive)
 */
const activateActionMap = (actionMapName, state=true) => {
  runRawLua(`scenetree.findObject("${actionMapName}"):${state?'push':'pop'}()`)
}

/**
 * Activate/Dectivate our UINav action map
 *
 * @param      {boolean}  [state=true]  The state
 */
const activateUINavActionMap = (state=true) => {
  lua.extensions.core_input_bindings.setMenuActionMapEnabled(state) // not 100% sure this is safe
  activateActionMap(UI_NAVIGATION_ACTION_MAP, state)
}

/**
 * Attaches/detaches the event listener for our UINav events coming from the GuiHook
 *
 * @param      {boolean}  [state=true]  The state (attach/detach)
 */
const attachEventListener = (state=true) => {
  if (!eventBus) return
  eventBus.off(GAME_UI_NAVIGATION_EVENT)
  eventBus.off(GAME_UI_NAV_MAP_ENABLED_EVENT)
  if (state) {
    eventBus.on(GAME_UI_NAVIGATION_EVENT, gameUIEventHandler)
    eventBus.on(GAME_UI_NAV_MAP_ENABLED_EVENT, handleEnabledChangeFromLua)
  }
}

/**
 * Handle the UI Nav events bring switched on/off in Lua
 *
 * @param      {boolean}         state   The state
 */
const handleEnabledChangeFromLua = state => {
  eventsActive = state
}

/**
 * Main handler for events from Lua coming from the UI Nav GuiHook (send out a DOM event based on the received data)
 *
 * @param      {string}  name               The name of the UI event
 * @param      {any}     [value=undefined]  The value associated with UI Event
 * @param      {Array}   extras             An array of any additional values passed after VALUE in the guihook
 */
const gameUIEventHandler = (name, value=undefined, ...extras) => {
  if (!window.beamng.ingame) return
  if(name == "modifier" && value == 1) {
    isModified = true
  } else if(name == "modifier" && value != 1) {
    isModified = false
  }
  const data = {
    name,
    value,
    modified: isModified,
    extras,
    boundAction: ACTIONS_BY_UI_EVENT[name]
  }
  sendDOMEvent(new CustomEvent(DOM_UI_NAVIGATION_EVENT, {
    detail: data,
    cancelable: true,
    bubbles: true
  }))
}

/**
 * Dispatches the passed DOM event from the correct DOM element (based on UI scope etc.).
 *
 * @param      {CustomEvent}  event   The event to dispatch
 */
const sendDOMEvent = event => {
  const el = getEventBroadcastElement()
  el.dispatchEvent(event)
}

/**
 * Gets the UI Nav event broadcast element.
 *
 * @return     {DOMElement}  The event broadcast element (based on any active UI scope and active element).
 */
const getEventBroadcastElement = () => {
  if (activeScope) {
    const scopeElement = window.document.querySelector(`[${UI_SCOPE_ATTR}="${activeScope}"]`)
    if (scopeElement) return scopeElement.querySelector(':focus') || scopeElement
  }
  return window.document.activeElement || window.document.body 
}

/**
 * Sets a group of events to be filtered, and starts filtering. Events will be entirely disregarded and will pass through UIEvents completely (useful for allowing the game to use the actions)
 *
 * @param      {Array}  events  The events to filter (UI_EVENTS and UI_EVENT_GROUPS can be useful for building a list)
 */
const setFilteredEvents = (...events) => {
  clearFilteredEvents()
  let actionsToFilter = [...new Set(events.flat(Infinity))].map(event => ACTIONS_BY_UI_EVENT[event])
  lua.extensions.core_input_actionFilter.setGroup(UI_NAV_ACTION_GROUP, actionsToFilter)
  lua.extensions.core_input_actionFilter.addAction(0, UI_NAV_ACTION_GROUP, true)
}

/**
 * Sets a group of events to be unfiltered, filtering all the rest.
 *
 * @param      {Array}  events  The events to NOT filter (UI_EVENTS and UI_EVENT_GROUPS can be useful for building a list)
 */
setFilteredEvents.allExcept = (...events) => {
  let eventsToNotFilter = [...new Set(events.flat(Infinity))]
  let eventsToFilter = UI_EVENT_GROUPS.allEvents.filter(ev => !eventsToNotFilter.includes(ev))
  setFilteredEvents(eventsToFilter)
}


/**
 * Switches off event filtering, and clears the list of filtered events
 */
const clearFilteredEvents = () => {
  lua.extensions.core_input_actionFilter.addAction(0, UI_NAV_ACTION_GROUP, false)
  lua.extensions.core_input_actionFilter.setGroup(UI_NAV_ACTION_GROUP, [])
}




// Handling events globally -----------------------------------------

let useCrossfire = true

/**
 * Switch on/off the handler for 'Global' UI Nav events (ones that were not handled and bubbled right to the top level)
 *
 * @param      {boolean}  [state=true]  The state (on/off)
 */
const hookGlobalEvents = (state=true) => {
  const listenerElement = window.document.body
  listenerElement[`${state?'add':'remove'}EventListener`](DOM_UI_NAVIGATION_EVENT, handleGlobalUINavEvent)
  globalEventsHooked = state
}


const NAV_ACTIONS = ['focus_u', 'focus_d', 'focus_l', 'focus_r']

/**
 * Handler for global UI Nav events (perform default actions, use Crossfire if it is switched on)
 *
 * @param      {CustomEvent}  e       The UI Event obkect
 * @return     void
 */
const handleGlobalUINavEvent = e => {
  const d = e.detail, action = d.name
  const globalAngularRootScope = window.globalAngularRootScope

  // tell angular to toggle menu (TODO - maybe remove this eventually when menus not in Angular?)
  if (action == 'menu' && d.value == 1) {
    globalAngularRootScope && globalAngularRootScope.$broadcast('MenuToggle')
    return

  // tell angular to go back (toggle menu = was default behaviour there) (TODO - maybe remove this eventually when menus not in Angular?)
  } else if (action == 'back' && d.value == 1) {
    globalAngularRootScope && globalAngularRootScope.$broadcast('MenuToggle')
    return

  // tell Lua we're in MenuItemNavigation
  } else if (NAV_ACTIONS.includes(action) && d.value == 1) {
    lua.extensions.hook('onMenuItemNavigation')

  // pause
  } else if (action == 'pause' && d.value == 1) {
    lua.simTimeAuthority.togglePause()
  
  // centre camera
  } else if (action == 'center_cam' && d.value == 1) {
    let [player] = d.extras
    runRawLua(`if core_camera then core_camera.resetCamera(${player}) end`, false)
  }

  if (useCrossfire) Crossfire.handleUINavEvent(e)

  // some default stuff (only if Crossfire didn't do a preventDefault)
  if (e.defaultPrevented) return


  // TODO - check if all the below is sensible??

  // rotate camera
  if (['rotate_h_cam', 'rotate_v_cam'].includes(action)) {
    let camDir = action == 'rotate_v_cam'? 'pitch' : 'yaw'
    let [ filterType ] = d.extras
    runRawLua(`if core_camera then core_camera.rotate_${camDir}(${d.value}, ${filterType}) end`, false)
  }

}



const _exported = {

  /**
   * Active UI Scope
   *
   * @type       {string}
   */
  get activeScope() { return activeScope },
  set activeScope(value) { activeScope = value },

  /**
   * Crossfire status (on/off)
   *
   * @type       {boolean}
   */
  get useCrossfire() { return useCrossfire },
  set useCrossfire(value) { useCrossfire = value },

  hookGlobalEvents,

  /**
   * Flag for checking if global events are hooked or not
   *
   * @type       {<type>}
   */
  get globalEventsHooked() { return globalEventsHooked },

  /**
   * Event bus that emits the game events (where we get our origin UI nav events)
   *
   * @type       {<type>}
   */
  set eventBus(bus) { eventBus = bus },
  get eventBus() { return eventBus },

  activate,

  /**
   * Flag for checking if the UI Events system is on/off
   *
   * @type       {<type>}
   */
  get eventsActive() { return eventsActive },

  setFilteredEvents,
  clearFilteredEvents,

}

export default _exported

export {
  DOM_UI_NAVIGATION_EVENT,
  UI_SCOPE_ATTR,
  ACTIONS_BY_UI_EVENT,
  UI_EVENTS_BY_ACTION,
  UI_EVENTS,
  UI_EVENT_GROUPS
}
