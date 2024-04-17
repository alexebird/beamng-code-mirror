-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.type = "auxiliary"

local abs = math.abs

local attachedPosition = nil
local detachedPosition = nil
local currentTargetPosition = nil
local manualMoveInput
local motorThrottleElectricsName
local actuator
local attachmentStates = {detached = "detached", attached = "attached", detachedMoveFeet = "detachedMoveFeet", attachedMoveFeet = "attachedMoveFeet"}
local currentAttachmentState = attachmentStates.detached
local couplerNodeId

local function moveFeet(input)
  manualMoveInput = input
  if currentAttachmentState == attachmentStates.attachedMoveFeet then
    currentAttachmentState = attachmentStates.attached
  elseif currentAttachmentState == attachmentStates.detachedMoveFeet then
    currentAttachmentState = attachmentStates.detached
  end
end

local function updateGFX(dt)
  local currentPosition = actuator.currentExtendPercent

  electrics.values[motorThrottleElectricsName] = manualMoveInput

  if abs(manualMoveInput) > 0.05 then
    if currentAttachmentState == attachmentStates.attached then
      attachedPosition = currentPosition
    elseif currentAttachmentState == attachmentStates.detached then
      detachedPosition = currentPosition
    end
  end

  if currentAttachmentState == attachmentStates.attachedMoveFeet or currentAttachmentState == attachmentStates.detachedMoveFeet then
    currentTargetPosition = currentAttachmentState == attachmentStates.attachedMoveFeet and attachedPosition or detachedPosition
    local positionDelta = currentPosition - currentTargetPosition
    if abs(positionDelta) > 0.01 then
      electrics.values[motorThrottleElectricsName] = positionDelta > 0 and -1 or 1
    else
      currentAttachmentState = currentAttachmentState == attachmentStates.attachedMoveFeet and attachmentStates.attached or attachmentStates.detached
    end
  end
  --print(string.format("Detached: %.2f, attached: %.2f, current: %.2f", detachedPosition, attachedPosition, currentPosition))
end

local function onCouplerAttached(nodeId, obj2id, obj2nodeId)
  if obj:getId() ~= obj2id and nodeId == couplerNodeId then
    currentAttachmentState = attachmentStates.attachedMoveFeet
  end
end

local function onCouplerDetached(nodeId, obj2id, obj2nodeId, breakForce)
  if obj:getId() ~= obj2id and nodeId == couplerNodeId then
    currentAttachmentState = attachmentStates.detachedMoveFeet
  end
end

local function init(jbeamData)
  attachedPosition = jbeamData.attachedDefaultPosition or 0
  detachedPosition = jbeamData.detachedDefaultPosition or 1

  local actuatorName = jbeamData.linearActuatorName
  actuator = powertrain.getDevice(actuatorName)

  motorThrottleElectricsName = jbeamData.motorThrottleElectricsName
  if not motorThrottleElectricsName then
    local motorName = jbeamData.motorName
    local motor
    if motorName then
      motor = powertrain.getDevice(motorName)
    else
      motor = powertrain.getPropulsionDeviceForDevice(actuator)
    end

    motorThrottleElectricsName = motor.electricsThrottleName
  end

  couplerNodeId = jbeamData.couplerNodeName and beamstate.nodeNameMap[jbeamData.couplerNodeName]

  local startValue = jbeamData.startValue or 0
  electrics.values[motorThrottleElectricsName] = startValue

  manualMoveInput = 0
  currentTargetPosition = detachedPosition
  currentAttachmentState = attachmentStates.detached
end

M.init = init
M.onCouplerAttached = onCouplerAttached
M.onCouplerDetached = onCouplerDetached
M.updateGFX = updateGFX
M.moveFeet = moveFeet

return M
