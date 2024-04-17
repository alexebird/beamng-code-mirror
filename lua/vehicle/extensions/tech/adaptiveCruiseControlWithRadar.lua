-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local csvWriter = require('csvlib')

local timer
local csvData

local standStillDistance = 5    -- target distance at v = 0 in m
local deltaTime = 3               -- delta time in s
local prevDistance = 0
local prevDistanceToCars = {}
local prevSpeed = 0
local distanceToLeadCar = 100 
local leadingSpeed = 100
local leadingVehicle

local pastU = 0
local mass = 0


local function createCSV()
  csvData = csvWriter.newCSV("time", "speed", "targetSpeed", "throttle")
  timer = 0
end

local function saveCSV()
  -- save in AppData/Local/BeamNG.drive/<current Version>
  csvData:write('testLog')
end

local function mMultiplication(A, B)
  local rows = #A
  local columns = #B[1]
  local length = #B
  local C = {}

  for i = 1, rows do
    table.insert(C, i, {})
    for j = 1, columns do
      table.insert(C[i], j, 0)
      for l = 1, length do
        C[i][j] = C[i][j] + A[i][l] * B[l][j]
      end
    end
  end
  return C
end

local function mPower(A, n)
  local B = A
  for i = 1, (n - 1) do
    B = mMultiplication(B, A)
  end
  return B
end

local function mSum(A, B)
  local C = {}
  for i = 1, #A do
    table.insert(C, i, {})
    for j = 1, #A[1] do
      table.insert(C[i], j, A[i][j] + B[i][j])
    end
  end

  return C
end

local function mMultiplicationScalar(A, b)
  local C = {}
  for i = 1, #A do
    table.insert(C, i, {})
    for j = 1, #A[1] do
      table.insert(C[i], j, A[i][j] * b)
    end
  end

  return C
end

local function mTranspose(A)
  local AT = {}
  for i = 1, #A[1] do
    table.insert(AT, i, {})
    for j = 1, #A do
      table.insert(AT[i], j, 0)
    end
  end

  for i = 1, #A[1] do
    for j = 1, #A do
      AT[i][j] = A[j][i]
    end
  end
  return AT
end

local function mDeterminant(A)
  local n = #A
  local toggle = 1
  local lum = {}
  for i = 1, #A do
    table.insert(lum, i, {})
    for j = 1, #A do
      table.insert(lum[i], j, A[i][j])
    end
  end

  local perm = {}
  for i = 1, n do
    table.insert(perm, i, i)
  end

  for j = 1, n do
    local max = math.abs(lum[j][j])
    local piv = j

    for i = j+1, n do
      local xij = math.abs(lum[i][j])
      if xij > max then
        max = xij
        piv = i
      end
    end

    if piv ~= j then
      lum[j] = A[piv]
      lum[piv] = A[j]

      local t = perm[piv]
      perm[piv] = perm[j]
      perm[j] = t

      toggle = - toggle
    end

    local xjj = lum[j][j]

    if xjj ~= 0 then
      for i = j+1, n do
        local xij = lum[i][j] / xjj
        lum[i][j] = xij
        for k = j+1, n do
          lum[i][k] = lum[i][k] - xij * lum[j][k]
        end
      end
    end
  end

  local det = toggle
  for i = 1, n do
    det = det * lum[i][i]
  end

  return det
end

local function mInverse(A)
  local adj = {}
  for i = 1, #A do
    table.insert(adj, i, {})
    for j = 1, #A do
      local M = {}
      for i = 1, #A do
        table.insert(M, i, {})
        for j = 1, #A do
          table.insert(M[i], j, A[i][j])
        end
      end
      table.remove(M, i)
      for k = 1, #M do
        table.remove(M[k], j)
      end
      table.insert(adj[i], j, (-1)^(i + j)*mDeterminant(M))
    end
  end
  return mMultiplicationScalar(adj, 1/mDeterminant(A))
end

local function printMatrix(A)
  for i = 1, #A do
    dump(A[i])
  end
end

local function getMass()
  for _, n in pairs(v.data.nodes) do
    mass = mass + n.nodeWeight
  end
end

local function average(t)
  local sum = 0
  for _,v in pairs(t) do
    sum = sum + v
  end
  return sum / #t
end

local function getAccFactor()
  local totalForce = 0
  local devices = powertrain.getDevicesByCategory("engine")
  for i = 1, #devices do
    local torqueData = devices[i].torqueCurve
    local gearRatio = devices[i].cumulativeGearRatio
    local torque = average(torqueData) * gearRatio
    local connectedWheels = powertrain.getChildWheels(devices[i], 1)
    local radius = connectedWheels[1].dynamicRadius
    local force = torque / radius
    totalForce = totalForce + force
  end
  local accFactor = totalForce /mass
  return accFactor
end

local function computeKmpc()
  local resFactor = - 0.0306
  local accFactor = getAccFactor()
  local Ts = 0.1
  local N = 5
  local Q = {{1}}
  local R = 10

  local A = {{1 + resFactor * Ts, Ts * (1 + 1/2*resFactor*Ts) * accFactor}, {0, 1}} -- http://profjrwhite.com/sdyn_course/SDYNnotes_files/sdyn_s3.pdf
  local B = {{Ts * (1 + 1/2*resFactor*Ts) * accFactor}, {1}}
  local C = {{1, 0}}

  local Phi = {}
  for i = 1, N do
    local A_i = mPower(A, i)
    table.insert(Phi, i*2 - 1, A_i[1])
    table.insert(Phi, i*2, A_i[2])
  end

  local Gamma = {}
  for i = 1, N*2 do
    table.insert(Gamma, i, {})
    for j = 1, N do
      table.insert(Gamma[i], j, 0)
    end
  end

  for i = 2, N do
    for j = 1, (i - 1) do
      local A_i = mPower(A, i - j)
      local Gamma_i = mMultiplication(A_i, B)
      Gamma[i*2 - 1][j] = Gamma_i[1][1]
      Gamma[i*2][j] = Gamma_i[2][1]
    end
  end
  for i = 1, N do
    Gamma[i*2 - 1][i] = B[1][1]
    Gamma[i*2][i] = B[2][1]
  end

  local Omega = {}
  for i = 1, N*2 do
    table.insert(Omega, i, {})
    for j = 1, N*2 do
      table.insert(Omega[i], j, 0)
    end
  end
  local Omega_i = mMultiplication(mMultiplication(mTranspose(C), Q), C)
  for i = 1, N do
    Omega[i*2 - 1][i*2 - 1] = Omega_i[1][1]
    Omega[i*2][i*2 - 1] = Omega_i[2][1]
    Omega[i*2 - 1][i*2] = Omega_i[1][2]
    Omega[i*2][i*2] = Omega_i[2][2]
  end

  local Sigma = {}
  for i = 1, N*2 do
    table.insert(Sigma, i, {})
    for j = 1, N do
      table.insert(Sigma[i], j, 0)
    end
  end
  local Sigma_i = mMultiplication(mTranspose(C), Q)
  for i = 1, N do
    Sigma[i*2 - 1][i] = Sigma_i[1][1]
    Sigma[i*2][i] = Sigma_i[2][1]
  end

  local Psi = {}
  for i = 1, N do
    table.insert(Psi, i, {})
    for j = 1, N do
      table.insert(Psi[i], j, 0)
      if i == j then
        Psi[i][j] = R
      end
    end
  end

  local G = mMultiplicationScalar(mSum(mMultiplication(mMultiplication(mTranspose(Gamma), Omega), Gamma), Psi), 2)
  local F = mMultiplicationScalar(mMultiplication(mMultiplication(mTranspose(Gamma), Omega), Phi), 2)
  local F_2 = mMultiplicationScalar(mMultiplication(mTranspose(Gamma), Sigma), -2)
  for i = 1, #F do
    for j = 1, #F_2[1] do
      table.insert(F[i], 2 + j, F_2[i][j])
    end
  end

  local I = {{-1}}
  for i = 2, N do
    table.insert(I[1], i, 0)
  end

  local Kmpc = mMultiplication(mMultiplication(I, mInverse(G)), F)
  return Kmpc[1]
end

--untouched version old-----------------------_________________
-- local function MPC(encodedDistances, targetSpeed, dtSim, debug) 
--   local currentSpeed = electrics.values.wheelspeed 
--   local distanceToCars = lpack.decode(encodedDistances) 
--   local targetDistance = standStillDistance + deltaTime * currentSpeed 
--   local distanceToLeadCar = 500 
--   local leadingSpeed = 100 
--   for k, v in pairs(distanceToCars) do 
--     if prevDistanceToCars[k] then 
--       local observedSpeed = (v - prevDistanceToCars[k]) / dtSim + prevSpeed 
--       if observedSpeed > - 2 and v < distanceToLeadCar then 
--         distanceToLeadCar = v 
--         leadingSpeed = observedSpeed 
--       end 
--     end 
--   end 
--   targetSpeed = math.min(leadingSpeed + (distanceToLeadCar - targetDistance) / dtSim, targetSpeed) 
--   local Kmpc = computeKmpc() 
--   local deltaU = Kmpc[1]*currentSpeed + Kmpc[2]*pastU + Kmpc[3]*targetSpeed + Kmpc[4]*targetSpeed + Kmpc[5]*targetSpeed + Kmpc[6]*targetSpeed + Kmpc[7]*targetSpeed 
--   local u = pastU + deltaU 
--   if u > 1 then 
--     u = 1 
--   end 
--   if u < - 0.5 then 
--     u = - 0.5 
--   end 
--   if electrics.values.isShifting then 
--     u = 0 
--   end 
--   if u > 0 then 
--     electrics.values.throttleOverride = u electrics.values.brakeOverride = nil 
--   else 
--     electrics.values.throttleOverride = nil electrics.values.brakeOverride = - u 
--   end 
--   if debug then 
--     local time = math.floor(timer * 1000) / 1000 -- Make sure time doesn't have dozen of digits 
--     csvData:add(time, currentSpeed, targetSpeed, u) timer = timer + dtSim 
--   end 
--   pastU = u 
--   prevDistanceToCars = distanceToCars 
--   prevSpeed = currentSpeed 
-- end

-----------------------------------------------------____________________________----------------

local function MPC(encodedDistances, targetSpeed, inputSpeed, vehicleID, dtSim, debug) 
  -- print("targetpeedfrom MPC: "..targetSpeed)
  -- print(prevDistanceToCars[1])
  -- print("mpc speed: "..math.floor(prevSpeed))
  local currentSpeed = electrics.values.wheelspeed 
  local distanceToCars = lpack.decode(encodedDistances) 
  local targetDistance = standStillDistance + deltaTime * currentSpeed 
  -- print("targetDistance: "..targetDistance)
  -- print("currentSpeed: "..math.floor(currentSpeed))
  -- distanceToLeadCar = 100 --?????
  -- leadingSpeed = 100 
  for k, v in pairs(distanceToCars) do 
    -- print(prevDistanceToCars[k])
    -- print(prevDistanceToCars[v])
    -- print("vehicle ID: "..vehicleID)

    if prevDistanceToCars[k]then 
      -- print("vehicleID detected")
      local observedSpeed = (v - prevDistanceToCars[k]) / dtSim + prevSpeed 
      -- print("observedSpeed: "..math.floor(observedSpeed))
      -- if observedSpeed > - 2 and v < distanceToLeadCar then 
      --   distanceToLeadCar = math.floor(v) 
      --   leadingSpeed = observedSpeed 
      --   -- print("distance to lead cars MPC: "..distanceToLeadCar)
      -- end 

      distanceToLeadCar = math.floor(v) 
      leadingSpeed = observedSpeed 

    end 
  end 

  -- print("leadingSpeed: "..leadingSpeed)
  -- print("distanceToLeadcar: "..distanceToLeadCar)
  -- print("targetDistance: "..targetDistance)
  -- print("dtSim: "..dtSim)
  -- print("targetSpeed: "..targetSpeed)
  
  targetSpeed = math.min(math.max(leadingSpeed + (distanceToLeadCar - targetDistance) / dtSim, 0), targetSpeed) --add .max for -ve speed
  
  -- if noCars == 1 then
  --   print("no cars infront")
  --   targetSpeed = inputSpeed
  --   local distanceToLeadCar = 100 
  --   local leadingSpeed = 100
  -- else 
  --   print(distanceToCars[1])
  -- end
  
  print("TargetSPeed update mpc: "..targetSpeed)
  local Kmpc = computeKmpc() 
  local deltaU = Kmpc[1]*currentSpeed + Kmpc[2]*pastU + Kmpc[3]*targetSpeed + Kmpc[4]*targetSpeed + Kmpc[5]*targetSpeed + Kmpc[6]*targetSpeed + Kmpc[7]*targetSpeed 
  local u = pastU + deltaU 
  print("deltaU: "..deltaU)
  print("pastU: "..pastU)
  print("U: "..u)
  if u > 1 then 
    print("u1")
    u = 1 
  end 
  if u < - 0.5 then 
    print("u2")
    u = - 0.5 
  end 
  if electrics.values.isShifting then 
    print("u3")
    u = 0 
  end 
  if u > 0 then 
    electrics.values.throttleOverride = u electrics.values.brakeOverride = nil 
    print("throttle11111")
  elseif u == 0 and targetSpeed >0 then --added for ego vehicle to move once leader vehicle moves
    print("stop and go")
    electrics.values.throttleOverride = 1 electrics.values.brakeOverride = nil 
  else 
    electrics.values.throttleOverride = nil electrics.values.brakeOverride = - u 
    print("throttle22222")
  end 
  if debug then 
    local time = math.floor(timer * 1000) / 1000 -- Make sure time doesn't have dozen of digits 
    csvData:add(time, currentSpeed, targetSpeed, u) timer = timer + dtSim 
  end 
  pastU = u 
  print("pastU: "..pastU)
  -- prevDistanceToCars = distanceToCars 
  prevDistanceToCars = distanceToCars
  prevSpeed = currentSpeed 

  -- print(prevDistanceToCars)
  -- print("mpc:  "..math.floor(prevSpeed))
  -- return updatedprevDistanceToCars, prevSpeed
end


local function MPCSteady(targetSpeed, dtSim, debug) 
  -- print("targetpeedfrom MPC: "..targetSpeed)
  -- print(prevDistanceToCars[1])
  print("mpc speed: "..math.floor(prevSpeed))
  local currentSpeed = electrics.values.wheelspeed 
  -- local distanceToCars = lpack.decode(encodedDistances) 
  -- local targetDistance = standStillDistance + deltaTime * currentSpeed 
  -- print("targetDistance: "..targetDistance)
  print("currentSpeed: "..math.floor(currentSpeed))
  -- local distanceToLeadCar = 100 --?????
  -- local leadingSpeed = 100 
  -- for k, v in pairs(distanceToCars) do 
  --   if prevDistanceToCars[k] then 
  --     -- print("distanceToCars")
  --     local observedSpeed = (v - prevDistanceToCars[k]) / dtSim + prevSpeed 
  --     print("observedSpeed: "..math.floor(observedSpeed))
  --     if observedSpeed > - 2 and v < distanceToLeadCar then 
  --       distanceToLeadCar = math.floor(v) 
  --       leadingSpeed = observedSpeed 
  --       -- print("distance to lead cars MPC: "..distanceToLeadCar)
  --     end 

  --   end 
  -- end 

  -- if not next (distanceToCars) then
  --   targetSpeed = inputSpeed
  -- end

  -- print("leadingSpeed: "..leadingSpeed)
  -- print("distanceToLeadcar: "..distanceToLeadCar)
  -- print("targetDistance: "..targetDistance)
  -- print("dtSim: "..dtSim)
  -- print("targetSpeed: "..targetSpeed)
  -- targetSpeed = math.min(math.max(leadingSpeed + (distanceToLeadCar - targetDistance) / dtSim, 0), targetSpeed) --add .max for -ve speed
  -- print("TargetSPeed update mpc: "..targetSpeed)
  local Kmpc = computeKmpc() 
  local deltaU = Kmpc[1]*currentSpeed + Kmpc[2]*pastU + Kmpc[3]*targetSpeed + Kmpc[4]*targetSpeed + Kmpc[5]*targetSpeed + Kmpc[6]*targetSpeed + Kmpc[7]*targetSpeed 
  local u = pastU + deltaU 
  if u > 1 then 
    u = 1 
  end 
  if u < - 0.5 then 
    u = - 0.5 
  end 
  if electrics.values.isShifting then 
    u = 0 
  end 
  if u > 0 then 
    electrics.values.throttleOverride = u electrics.values.brakeOverride = nil 
  else 
    electrics.values.throttleOverride = nil electrics.values.brakeOverride = - u 
  end 
  if debug then 
    local time = math.floor(timer * 1000) / 1000 -- Make sure time doesn't have dozen of digits 
    csvData:add(time, currentSpeed, targetSpeed, u) timer = timer + dtSim 
  end 
  pastU = u 
  -- prevDistanceToCars = distanceToCars 
  -- prevDistanceToCars = distanceToCars
  prevSpeed = currentSpeed 

  -- print(prevDistanceToCars)
  -- print("mpc:  "..math.floor(prevSpeed))
  -- return updatedprevDistanceToCars, prevSpeed
end


-- local function MPC(encodedDistances, prevDistanceToCars, targetSpeed, dtSim, debug)
--   local currentSpeed = electrics.values.wheelspeed

--   local distanceToCars = lpack.decode(encodedDistances)
--   -- local prevDistanceToCars = lpack.decode(encodedprevDistanceToCars)
--   -- print(prevDistanceToCars[1])

--   local targetDistance = standStillDistance + deltaTime * currentSpeed
--   local distanceToLeadCar = 50
--   local leadingSpeed = 100
--   for k, v in pairs(distanceToCars) do
--     -- print("distance to cars:")
--     -- print(v)
--     -- print(k)
--     -- print(prevDistanceToCars[k])
--     -- if prevDistanceToCars[k] then
--     --   print("prev distance to cars")
--     --   local observedSpeed = (v - prevDistanceToCars[k]) / dtSim + prevSpeed
--     --   if observedSpeed > - 2 and v < distanceToLeadCar then
--     --     distanceToLeadCar = v
--     --     leadingSpeed = observedSpeed
--     --     print("distance to lead car:")
--     --     print(distanceToLeadCar)
--     --   end
--     -- end

--     local observedSpeed = (v - 0) / dtSim + prevSpeed
--       if observedSpeed > - 2 and v < distanceToLeadCar then
--         distanceToLeadCar = 0-v
--         leadingSpeed = observedSpeed
--         print("distance to lead car:")
--         print(distanceToLeadCar)
--       end
--   end

--   targetSpeed = math.min(leadingSpeed + (distanceToLeadCar - targetDistance) / dtSim, targetSpeed)

--   -- if(distanceToLeadCar<targetDistance) then
--   --   targetSpeed = 0
--   -- end

  
--   print("TargetSPeed:")
--   print(targetSpeed)
--   print("target distance:")
--   print(targetDistance)

--   local Kmpc = computeKmpc()
--   local deltaU = Kmpc[1]*currentSpeed + Kmpc[2]*pastU + Kmpc[3]*targetSpeed + Kmpc[4]*targetSpeed + Kmpc[5]*targetSpeed + Kmpc[6]*targetSpeed + Kmpc[7]*targetSpeed
--   local u = pastU + deltaU

--   if u > 1 then u = 1 end
--   if u < - 0.5 then u = - 0.5 end

--   if electrics.values.isShifting then
--     u = 0
--   end

--   if u > 0 then
--     electrics.values.throttleOverride = u
--     electrics.values.brakeOverride = nil
--   else
--     electrics.values.throttleOverride = nil
--     electrics.values.brakeOverride = - u
--   end

--   if debug then
--     local time = math.floor(timer * 1000) / 1000 -- Make sure time doesn't have dozen of digits
--     csvData:add(time, currentSpeed, targetSpeed, u)
--     timer = timer + dtSim
--   end

--   pastU = u
--   updatedprevDistanceToCars = distanceToCars
--   -- print("check prevDistance carsss")
--   -- print(updatedprevDistanceToCars[1])
--   -- print("new distcance")
--   -- print(distanceToCars[1])

--   prevSpeed = currentSpeed

--   return updatedprevDistanceToCars
-- end



-- Public interface
M.MPCSteady   = MPCSteady
M.MPC         = MPC
M.createCSV   = createCSV
M.saveCSV     = saveCSV
M.getMass     = getMass

return M
