-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {
  devices = {}
}

local function onFirstUpdate()
  local mgr = getVirtualInputManager()
  if not mgr then
    log("E", "", "No virtual input manager found")
    return
  end
end

local function ensureOutgaugeExtension()
  local enabled = settings.getValue("outgaugeEnabled") == true
  local anyDevices = not tableIsEmpty(M.devices)
  local mustBeLoaded = enabled or anyDevices

  local cmdEnable  = 'if outgauge == nil then extensions.load  ("outgauge") end'
  local cmdDisable = 'if outgauge ~= nil then extensions.unload("outgauge") end'

  be:queueAllObjectLua(cmdDisable)
  if mustBeLoaded then
    local player = 0
    local veh = be:getPlayerVehicle(player)
    if veh then veh:queueLuaCommand(cmdEnable) end
  end
end

-- consumer API

local function createDevice(productName, vidpid, axes, buttons, povs, omitOutgauge)
  local mgr = getVirtualInputManager()
  if not mgr then return end
  local info = {productName, vidpid, axes, buttons, povs}
  local deviceInstance = mgr:registerDevice(productName, vidpid, axes, buttons, povs)
  if deviceInstance < 0 then
    log("E", "", "No device instance '"..dumps(deviceInstance).." found: "..dumps(info))
    return
  end
  log('I', '', "Registered device '"..dumps(deviceInstance).."' as vinput: "..dumps(info))
  M.devices[deviceInstance] = info
  if not omitOutgauge then
    ensureOutgaugeExtension()
  end
  return deviceInstance, info
end

local function deleteDevice(deviceInstance)
  local mgr = getVirtualInputManager()
  if not mgr then return nil end
  mgr:unregisterDevice('vinput' .. tostring(deviceInstance))
  local deviceInfo = M.devices[deviceInstance]
  log('I', '', "Deleted device '"..dumps(deviceInstance).."' as vinput: "..dumps(deviceInfo))
  M.devices[deviceInstance] = nil
  ensureOutgaugeExtension()
end

local function getDeviceInfo(vidpid)
  for deviceInstance, info in pairs(M.devices) do
    if info[2] == vidpid then
      return deviceInstance, info
    end
  end

  return nil -- no matching device found...
end

local function emit(deviceInstance, objType, objectInstance, action, val)
  local mgr = getVirtualInputManager()
  if not mgr then return nil end
  mgr:emitEvent('vinput', deviceInstance, objType, objectInstance, action, val)
end

M.onFirstUpdate = onFirstUpdate
M.createDevice = createDevice
M.deleteDevice = deleteDevice
M.getDeviceInfo = getDeviceInfo
M.emit = emit

M.onVehicleSpawned = ensureOutgaugeExtension
M.onVehicleSwitched = ensureOutgaugeExtension
M.onSettingsChanged = ensureOutgaugeExtension

return M
