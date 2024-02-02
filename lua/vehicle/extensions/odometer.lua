-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local abs = math.abs

local relativeOdometer = 0
local submitedStatOdo = 0
local submitedTime = 0

local function onReset()
  M.submitStatistic()
end

local function updateGFX(dt)
  relativeOdometer = relativeOdometer + abs(electrics.values.wheelspeed or 0) * dt
  submitedTime = submitedTime+dt
  if ai.mode == "disabled" and submitedTime > 30 then
    M.submitStatistic()
    submitedTime = 0
  end
end

local function startRecording()
  --relativeOdometer = 0
end

local function getRelativeRecording()
  return relativeOdometer
end

local function onExtensionLoaded()
end

local function submitStatistic()
  if ai.mode ~= "disabled" or (relativeOdometer-submitedStatOdo)<1 then return end
  local model = v.vehicleDirectory:match('/vehicles/([^/]+)')
  extensions.gameplayStatistic.metricAdd("vehicle/odometer/".. model ..".length", relativeOdometer-submitedStatOdo)
  extensions.gameplayStatistic.metricAdd("vehicle/total_odometer.length", relativeOdometer-submitedStatOdo)
  submitedStatOdo = relativeOdometer
end

-- public interface
M.onReset = onReset
M.updateGFX = updateGFX

M.startRecording = startRecording
M.getRelativeRecording = getRelativeRecording
M.submitStatistic = submitStatistic

M.onExtensionLoaded = onExtensionLoaded

return M
