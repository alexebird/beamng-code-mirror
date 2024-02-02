// Manage blurred background areas of the UI
import { lua } from '../index.js'

const LUA_BLUR_EXTENSION = 'ui_gameBlur'

let highestId = 0
const spareIds = [], blurRegionList = {}

const
  isEmptyObject = obj => !Object.keys(obj).length,
  // check form window.beamng here so as not to cause error when working outside of game
  sendBlurListToLua = () => window.beamng && window.beamng.ingame && lua.extensions.ui_gameBlur.replaceGroup("uiBlur", blurRegionList), 
  getNextAvailableId = () => spareIds.length? spareIds.shift() : ++highestId


export default {

  register(coord) {
    if (coord === undefined) throw new Error('Cannot register bng-blur with coordinates: ' + coord)
    if (isEmptyObject(blurRegionList)) lua.extensions.load(LUA_BLUR_EXTENSION)
    const id = getNextAvailableId()
    blurRegionList[id] = coord
    sendBlurListToLua()
    return id
  },

  unregister(i) {
    if (i in blurRegionList) {
      delete blurRegionList[i]
      spareIds.push(i)
      sendBlurListToLua()
    }
    if (isEmptyObject(blurRegionList)) {
      lua.extensions.unload(LUA_BLUR_EXTENSION)
    }
  },

  update(i, coord) {
    if (!(i in blurRegionList)) {
      const msg = `Trying to update bng-blur with an ID that is not registered: ${i} (of ${Object.keys(blurRegionList)})`
      console.error(msg)
      throw new Error(msg)
    }
    blurRegionList[i] = coord
    sendBlurListToLua()
  }

}
