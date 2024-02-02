-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {"util_stepHandler"}
local active
local vehicleCount = 1
local setupSteps = nil
local state = "none"
local speedTraps = {}


local function addSpeedTrap(pos, radius, triggerSpeed)
  table.insert(speedTraps,{
    pos = pos,
    radius = radius,
    triggerSpeed = triggerSpeed,
    name = string.format("Trap %d at %0.1fm/s", #speedTraps+1, triggerSpeed),
    active = true
  })
end

local function activate()
  table.clear(speedTraps)
  addSpeedTrap(vec3(901,-462,43), 5, 10)
end

local function deactivate()
end

local function toggleActive()
  if active then
    deactivate()
  else
    activate()
  end
end


local function flashTrap(trap, velocity)
  trap.active = false
  local helper= {
    ttl = 5,
    msg = string.format("%s triggered: %0.2f m/s", trap.name, velocity),
    icon = "warning"
  }
  guihooks.trigger('Message',helper)
end

local drawDebug = true
local function onUpdate(dtReal, dtSim, dtRaw)
  local player = be:getPlayerVehicle(0)
  local playerPos = player:getPosition()
  for _, trap in ipairs(speedTraps) do
    if (playerPos-trap.pos):length() < trap.radius then
      if trap.active then
        local playerSpeed = player:getVelocity():length()
        if playerSpeed >= trap.triggerSpeed then
          flashTrap(trap, playerSpeed)
        end
      end
    else
      trap.active = true
    end

    -- debug drawing
    if drawDebug then
      debugDrawer:drawSphere(trap.pos, trap.radius, trap.active and ColorF(0.0,0.9,0.0,0.25) or ColorF(0.9,0.0,0.0,0.25))
      debugDrawer:drawTextAdvanced(trap.pos, String(trap.name), ColorF(1,1,1,1), true, false, ColorI(0,0,0,192))
    end
  end
end

local function onClientEndMission()
  deactivate()
end

local function onVehicleSwitched()
  --deactivate()
end

local function isActive()
  return active
end

local function onSerialize()
  deactivate()
end

local function onDeserialized()
end

local function onCareerActive(enabled)
  if enabled then
    deactivate()
  end
end


M.activate = activate
M.deactivate = deactivate
M.toggleActive = toggleActive
M.isActive = isActive


M.onUpdate = onUpdate
M.onClientEndMission = onClientEndMission
M.onVehicleSwitched = onVehicleSwitched
M.onSerialize = onSerialize
M.onDeserialized = onDeserialized
M.onCareerActive = onCareerActive

M.onExtensionLoaded = function()
  M.activate()
end


return M