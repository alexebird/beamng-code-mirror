-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

M.outputPorts = {}
M.deviceCategories = {torqueConsumer = true}

local twoPi = math.pi * 2
local avToRPM = 9.549296596425384
local abs = math.abs

local function updateVelocity(device, dt)
  device.inputAV = device.linearVelocity * device.invLeadRadian * device.gearRatio
  --print(device.inputAV)
  device.parent[device.parentOutputAVName] = device.inputAV
  device[device.outputAVName] = 0
end

local function updateTorque(device)
  local inputTorque = (device.parent[device.parentOutputTorqueName] - (device.friction * clamp(device.inputAV, -1, 1) + device.dynamicFriction * device.inputAV)) * device.gearRatio
  local actuatorForce = inputTorque / device.screwDiameter

  local invCidCount = device.invActuatorBeamCount
  local velocity = 0

  --idea 1: static friction that fades out with increasing RPM
  --idea 2: cut to 0 for the low input torques
  --idea 3: set beam friction really high with movement intention is to not move
  --idea 4: remove clutch, make motor and actuator a single device

  local frictionForce = device.frictionForce
  --if abs(electrics.values.table or 0) == 0 then
  --actuatorForce = 0
  --frictionForce = device.frictionForce * 10000
  --end

  for _, cid in ipairs(device.actuatorBeams) do
    --actuateBeam(int outId, float force, float speedLimit, float slipForce, float frictionForce, float slipSpeedLimit, float minExtend, float maxExtend)
    --screwBeam(int outId, float torqueForce, float speedLimit, float slipForce, float helixAngleCos, float face1Cos, float face2Cos, float frictionForceStick, float frictionCoef, float slipSpeedLimit, float minExtend, float maxExtend)
    velocity = velocity + obj:screwBeam(cid, actuatorForce * invCidCount, device.speedLimit, math.huge, math.cos(device.leadAngle), 1, 1, frictionForce, 0.1, 0, device.minExtend, device.maxExtend)
  end
  --if abs(electrics.values.table or 0) == 0 then
  --velocity = 0
  --frictionForce = device.frictionForceBackDriven
  --end
  --print(velocity)
  -- if abs(electrics.values.table or 0) == 0 then
  --   velocity = 0
  -- end
  device.linearVelocity = velocity * invCidCount

  device[device.outputTorqueName] = 0
  guihooks.graph({"Input Torque", inputTorque, 5, "", true}, {"Actuator Force", actuatorForce, 5000, "", true}, {"Velocity", device.linearVelocity, 1, "", true}, {"RPM", device.inputAV * avToRPM, 500, "", true})
end

local function selectUpdates(device)
  device.velocityUpdate = updateVelocity
  device.torqueUpdate = updateTorque
end

local function applyDeformGroupDamage(device, damageAmount)
  device.damageFrictionCoef = device.damageFrictionCoef + linearScale(damageAmount, 0, 0.01, 0, 0.1)
end

local function setPartCondition(device, subSystem, odometer, integrity, visual)
  device.wearFrictionCoef = linearScale(odometer, 30000000, 1000000000, 1, 1.5)
  local integrityState = integrity
  if type(integrity) == "number" then
    local integrityValue = integrity
    integrityState = {damageFrictionCoef = linearScale(integrityValue, 1, 0, 1, 50), isBroken = false}
  end

  device.damageFrictionCoef = integrityState.damageFrictionCoef or 1

  if integrityState.isBroken then
    device:onBreak()
  end
end

local function getPartCondition(device)
  local integrityState = {damageFrictionCoef = device.damageFrictionCoef, isBroken = device.isBroken}
  local integrityValue = linearScale(device.damageFrictionCoef, 1, 50, 1, 0)
  if device.isBroken then
    integrityValue = 0
  end
  return integrityValue, integrityState
end

local function validate(device)
  return true
end

local function onBreak(device)
  device.isBroken = true
  --obj:breakBeam(device.breakTriggerBeam)
  selectUpdates(device)
end

local function calculateInertia(device)
  local outputInertia
  local cumulativeGearRatio = 1
  local maxCumulativeGearRatio = 1
  --the actuator only has virtual inertia
  outputInertia = device.virtualInertia --some default inertia

  device.cumulativeInertia = outputInertia / device.gearRatio / device.gearRatio
  device.invCumulativeInertia = device.cumulativeInertia > 0 and 1 / device.cumulativeInertia or 0
  device.cumulativeGearRatio = cumulativeGearRatio * device.gearRatio
  device.maxCumulativeGearRatio = maxCumulativeGearRatio * device.gearRatio
end

local function reset(device, jbeamData)
  device.gearRatio = jbeamData.gearRatio or 1
  device.friction = jbeamData.friction or 0
  device.cumulativeInertia = 1
  device.invCumulativeInertia = 1
  device.cumulativeGearRatio = 1
  device.maxCumulativeGearRatio = 1

  device.inputAV = 0
  device.linearVelocity = 0

  device.isBroken = false
  device.wearFrictionCoef = 1
  device.damageFrictionCoef = 1

  device[device.outputTorqueName] = 0
  device[device.outputAVName] = 0

  selectUpdates(device)

  return device
end

local function new(jbeamData)
  local device = {
    deviceCategories = shallowcopy(M.deviceCategories),
    requiredExternalInertiaOutputs = shallowcopy(M.requiredExternalInertiaOutputs),
    outputPorts = shallowcopy(M.outputPorts),
    name = jbeamData.name,
    type = jbeamData.type,
    inputName = jbeamData.inputName,
    inputIndex = jbeamData.inputIndex,
    gearRatio = jbeamData.gearRatio or 1,
    friction = jbeamData.friction or 0,
    dynamicFriction = jbeamData.dynamicFriction or 0,
    wearFrictionCoef = 1,
    damageFrictionCoef = 1,
    cumulativeInertia = 1,
    invCumulativeInertia = 1,
    virtualInertia = jbeamData.virtualInertia or 2,
    cumulativeGearRatio = 1,
    maxCumulativeGearRatio = 1,
    isPhysicallyDisconnected = true,
    electricsName = jbeamData.electricsName,
    inputAV = 0,
    linearVelocity = 0,
    minExtend = jbeamData.minExtend or 1,
    maxExtend = jbeamData.maxExtend or 2,
    frictionForce = jbeamData.frictionForce or 1,
    speedLimit = jbeamData.speedLimit or 100,
    isBroken = false,
    nodeCid = jbeamData.node,
    reset = reset,
    onBreak = onBreak,
    validate = validate,
    calculateInertia = calculateInertia,
    applyDeformGroupDamage = applyDeformGroupDamage,
    setPartCondition = setPartCondition,
    getPartCondition = getPartCondition
  }

  device.screwDiameter = jbeamData.screwDiameter or 0.05
  device.leadDegree = jbeamData.leadMillimeterPerRevolution / 1000
  device.leadRadian = device.leadDegree / (math.pi / 180) --convert from one revolution (aka degree) to radian
  device.leadAngle = math.atan(device.leadDegree / (device.screwDiameter * math.pi))

  device.outputTorqueName = "outputTorque1"
  device.outputAVName = "outputAV1"
  device[device.outputTorqueName] = 0
  device[device.outputAVName] = 0

  local beamTags = jbeamData.beamTags or {}
  device.actuatorBeams = {}
  for _, tag in pairs(beamTags) do
    local beamCids = beamstate.tagBeamMap[tag]
    if beamCids then
      for _, beamCid in pairs(beamCids) do
        table.insert(device.actuatorBeams, beamCid)
      end
    end
  end
  device.actuatorBeamCount = #device.actuatorBeams
  device.invActuatorBeamCount = 1 / device.actuatorBeamCount

  device.invLeadRadian = 1 / device.leadRadian

  device.breakTriggerBeam = jbeamData.breakTriggerBeam
  if device.breakTriggerBeam and device.breakTriggerBeam == "" then
    --get rid of the break beam if it's just an empty string (cancellation)
    device.breakTriggerBeam = nil
  end

  selectUpdates(device)

  return device
end

M.new = new

return M
