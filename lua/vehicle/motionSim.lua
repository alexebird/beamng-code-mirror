-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local ffi = require("ffi")

local ip = nil
local port = nil

local updateTime = 0
local updateTimer = 0

local udpSocket = nil

local hasDefinedV1Struct = false
local velocityX
local velocityY
local velocityZ
local accX
local accY
local accZ
local upVectorX
local upVectorY
local upVectorZ
local posRoll
local posPitch
local posYaw
local avRoll
local avPitch
local avYaw
local lastFrameAVRoll
local lastFrameAVPitch
local lastFrameAVYaw
local accRoll
local accPitch
local accYaw

local velocityXSmoother
local velocityYSmoother
local velocityZSmoother
local accXSmoother
local accYSmoother
local accZSmoother
local posRollSmoother
local posPitchSmoother
local posYawSmoother
local avRollSmoother
local avPitchSmoother
local avYawSmoother
local accRollSmoother
local accPitchSmoother
local accYawSmoother

local isMotionSimEnabled = false

local function sendDataPaketV1(dt)
  --log('D', 'motionSim', 'sendDataPaketV1: '..tostring(ip) .. ':' .. tostring(port))

  local o = ffi.new("motionSim_t")
  o.magic = "BNG1"

  o.posX, o.posY, o.posZ = obj:getPositionXYZ()

  o.velX = velocityX
  o.velY = velocityY
  o.velZ = velocityZ

  o.accX = accX
  o.accY = accY
  o.accZ = accZ

  o.upVecX = upVectorX
  o.upVecY = upVectorY
  o.upVecZ = upVectorZ

  o.rollPos = posRoll
  o.pitchPos = posPitch
  o.yawPos = posYaw

  o.rollRate = avRoll
  o.pitchRate = avPitch
  o.yawRate = avYaw

  o.rollAcc = accRoll
  o.pitchAcc = accPitch
  o.yawAcc = accYaw

  --guihooks.graph({"Acc Roll", accRoll, 10, "", true}, {"Acc Pitch", accPitch, 10, "", true}, {"Acc Yaw", accYaw, 10, "", true})

  --convert the struct into a string
  local packet = ffi.string(o, ffi.sizeof(o))

  --log("I", "motionSim.sendDataPaketV1", "Sending To: " .. ip .. "port: " .. port)
  udpSocket:sendto(packet, ip, port)
end

local function updateGFXV1(dt)
end

local function updateV1(dt)
  if not playerInfo.firstPlayerSeated then
    return
  end

  local velocity = obj:getVelocity()
  velocityX = velocityXSmoother:get(velocity.x, dt)
  velocityY = velocityYSmoother:get(velocity.y, dt)
  velocityZ = velocityZSmoother:get(velocity.z, dt)

  local ffisensors = sensors.ffiSensors
  accX = accXSmoother:get(-ffisensors.sensorX, dt)
  accY = accYSmoother:get(-ffisensors.sensorY, dt)
  accZ = accZSmoother:get(-ffisensors.sensorZ, dt)

  local upVector = obj:getDirectionVectorUp()

  upVectorX = upVector.x
  upVectorY = upVector.y
  upVectorZ = upVector.z

  local roll, pitch, yaw = obj:getRollPitchYaw()
  posRoll = posRollSmoother:get(-roll, dt) --negated angle here, seems like that is the "standard" for motion sims here
  posPitch = posPitchSmoother:get(pitch, dt)
  posYaw = posYawSmoother:get(-yaw, dt) --negated angle here, seems like that is the "standard" for motion sims here

  local rollAV, pitchAV, yawAV = obj:getRollPitchYawAngularVelocity()
  avRoll = avRollSmoother:get(rollAV, dt)
  avPitch = avPitchSmoother:get(pitchAV, dt)
  avYaw = avYawSmoother:get(yawAV, dt)

  local dtCoef = 1 / dt
  accRoll = accRollSmoother:get((avRoll - lastFrameAVRoll) * dtCoef, dt)
  accPitch = accPitchSmoother:get((avPitch - lastFrameAVPitch) * dtCoef, dt)
  accYaw = accYawSmoother:get((avYaw - lastFrameAVYaw) * dtCoef, dt)

  lastFrameAVRoll = avRoll
  lastFrameAVPitch = avPitch
  lastFrameAVYaw = avYaw

  guihooks.graph({"Acc Roll", accRoll, 1, "", true}, {"Acc Pitch", accPitch, 1, "", true}, {"Acc Yaw", accYaw, 1, "", true})

  updateTimer = updateTimer + dt
  if updateTimer >= updateTime then
    sendDataPaketV1(updateTimer)
    updateTimer = updateTimer - updateTime
  end
end

local function resetV1()
  lastFrameAVRoll = 0
  lastFrameAVPitch = 0
  lastFrameAVYaw = 0

  velocityXSmoother:reset()
  velocityYSmoother:reset()
  velocityZSmoother:reset()

  accXSmoother:reset()
  accYSmoother:reset()
  accZSmoother:reset()

  posRollSmoother:reset()
  posPitchSmoother:reset()
  posYawSmoother:reset()

  avRollSmoother:reset()
  avPitchSmoother:reset()
  avYawSmoother:reset()

  accRollSmoother:reset()
  accPitchSmoother:reset()
  accYawSmoother:reset()
end

local function settingsChanged()
  M.onExtensionLoaded()
end

local function initV1()
  if not hasDefinedV1Struct then
    ffi.cdef [[
    typedef struct motionSim_t  {
          ////////////////
          //////////////// IMPORTANT
          //////////////// do not modify this format without also updating the documentation at git:documentation/modding/protocols
          ////////////////
      //Magic to check if packet is actually useful, fixed value of "BNG1"
      char           magic[4];

      //World position of the car
      float          posX;
      float          posY;
      float          posZ;

      //Velocity of the car
      float          velX;
      float          velY;
      float          velZ;

      //Acceleration of the car, gravity not included
      float          accX;
      float          accY;
      float          accZ;

      //Vector components of a vector pointing "up" relative to the car
      float          upVecX;
      float          upVecY;
      float          upVecZ;

      //Roll, pitch and yaw positions of the car
      float          rollPos;
      float          pitchPos;
      float          yawPos;

      //Roll, pitch and yaw "velocities" of the car
      float          rollRate;
      float          pitchRate;
      float          yawRate;

      //Roll, pitch and yaw "accelerations" of the car
      float          rollAcc;
      float          pitchAcc;
      float          yawAcc;
    } motionSim_t;
    ]]
    hasDefinedV1Struct = true
  end

  lastFrameAVRoll = 0
  lastFrameAVPitch = 0
  lastFrameAVYaw = 0

  ip = settings.getValue("motionSimIP") or "127.0.0.1"
  port = settings.getValue("motionSimPort") or 4444
  local updateRate = settings.getValue("motionSimHz") or 200
  updateTime = 1 / updateRate

  local velocityXSmoothing = settings.getValue("motionSimVelocityXSmoothing") or 2
  local velocityYSmoothing = settings.getValue("motionSimVelocityYSmoothing") or 2
  local velocityZSmoothing = settings.getValue("motionSimVelocityZSmoothing") or 2
  velocityXSmoother = newExponentialSmoothingT(velocityXSmoothing)
  velocityYSmoother = newExponentialSmoothingT(velocityYSmoothing)
  velocityZSmoother = newExponentialSmoothingT(velocityZSmoothing)

  local accSmoothingX = settings.getValue("motionSimAccelerationXSmoothing") or 20
  local accSmoothingY = settings.getValue("motionSimAccelerationYSmoothing") or 20
  local accSmoothingZ = settings.getValue("motionSimAccelerationZSmoothing") or 20
  accXSmoother = newExponentialSmoothingT(accSmoothingX)
  accYSmoother = newExponentialSmoothingT(accSmoothingY)
  accZSmoother = newExponentialSmoothingT(accSmoothingZ)

  local posRollSmoothing = settings.getValue("motionSimPosRollSmoothing") or 0
  local posPitchSmoothing = settings.getValue("motionSimPosPitchSmoothing") or 0
  local posYawSmoothing = settings.getValue("motionSimPosYawSmoothing") or 0
  posRollSmoother = newExponentialSmoothingT(posRollSmoothing)
  posPitchSmoother = newExponentialSmoothingT(posPitchSmoothing)
  posYawSmoother = newExponentialSmoothingT(posYawSmoothing)

  local avRollSmoothing = settings.getValue("motionSimAVRollSmoothing") or 10
  local avPitchSmoothing = settings.getValue("motionSimAVPitchSmoothing") or 10
  local avYawSmoothing = settings.getValue("motionSimAVYawSmoothing") or 5
  avRollSmoother = newExponentialSmoothingT(avRollSmoothing)
  avPitchSmoother = newExponentialSmoothingT(avPitchSmoothing)
  avYawSmoother = newExponentialSmoothingT(avYawSmoothing)

  local accRollSmoothing = settings.getValue("motionSimAccRollSmoothing") or 500
  local accPitchSmoothing = settings.getValue("motionSimAccPitchSmoothing") or 500
  local accYawSmoothing = settings.getValue("motionSimAccYawSmoothing") or 500
  accRollSmoother = newExponentialSmoothingT(accRollSmoothing)
  accPitchSmoother = newExponentialSmoothingT(accPitchSmoothing)
  accYawSmoother = newExponentialSmoothingT(accYawSmoothing)

  log("I", "motionSim.initV1", string.format("MotionSim V1 active! IP config: %s:%d, update rate: %dhz", ip, port, updateRate))

  udpSocket = socket.udp()

  M.update = updateV1
  M.updateGFX = updateGFXV1
  M.reset = resetV1
end

local function onExtensionLoaded()
  M.reset = nop
  M.updateGFX = nop
  M.update = nop

  isMotionSimEnabled = settings.getValue("motionSimEnabled") or false
  if isMotionSimEnabled then
    local motionSimVersion = settings.getValue("motionSimVersion") or 1
    log("I", "motionSim.init", "Trying to load motionSim with version: " .. motionSimVersion)
    if motionSimVersion == 1 then
      log("D", "motionSim.init", "MotionSim V1 active!")
      initV1()
    else
      log("E", "motionSim.init", "Unknown motionSim version: " .. motionSimVersion)
    end
  end
end

local function isPhysicsStepUsed()
  return isMotionSimEnabled
end

M.onExtensionLoaded = onExtensionLoaded
M.reset = nop
M.settingsChanged = settingsChanged

M.updateGFX = nop
M.update = nop

M.isPhysicsStepUsed = isPhysicsStepUsed

return M
