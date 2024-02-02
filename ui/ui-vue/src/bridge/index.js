// Take care with import paths here as this file is also going to be imported outside of a bundler (by the original code)
import { BeamNGAPI, EventBus, StreamManager, UIUnits, Hooks, Lua, GameBlurrer, UINavEvents } from "./libs/index.js"

// Dependencies - need to pass in from outside
let dependencies

// Provide a bridge to the game engine
let bridge

export { Lua as lua }
export { GameBlurrer as gameBlurrer }

export const useBridge = () => {
  if (bridge) return bridge
  if (window.bridge) return (bridge = window.bridge)

  const events = eventBusFactory(dependencies.Emitter),
    api = gameAPIFactory(events, dependencies.beamng),
    streams = streamsManagerFactory(api),
    units = uiUnitsFactory(events, api),
    lua = Lua,
    gameBlurrer = GameBlurrer,
    uiEvents = useUINavEvents(events)

  return (bridge = {
    api,
    lua,
    events,
    streams,
    units,
    hooks: Hooks,
    gameBlurrer,
    uiNavEvents: uiEvents,
  })
}

export const setBridgeDependencies = deps => (dependencies = deps)

const eventBusFactory = Emitter => {
  return new Emitter()
  //return new EventBus(emitter)
}

const gameAPIFactory = (eventBus, beamNG) => {
  return dependencies.overrideAPI || new BeamNGAPI(eventBus, beamNG)
}

const streamsManagerFactory = api => {
  return new StreamManager(api)
}

const uiUnitsFactory = (eventBus, api) => {
  return new UIUnits(eventBus, api)
}

const useUINavEvents = eventBus => {
  UINavEvents.eventBus = eventBus
  return UINavEvents
}
