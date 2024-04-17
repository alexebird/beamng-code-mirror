-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt


local M = {}

local vid
local sensorId
local sensorIdRadar
local WIDTH = 100
local HEIGHT = 100
local resolution = {WIDTH, HEIGHT}
local targetSpeed
local data
local debug
local prevDistanceToCars = {}
local prevSpeed
local prevSpeed2
local prevDistanceToCars2 = {}
local zeroSpeed = 0
local speedcalc = 0
local vehicleID
local noCars


local function changeSpeed(speed)
  targetSpeed = speed
end

local function onUpdate(dtReal, dtSim, dtRaw)
  
  if not loaded then 
    return
  end
  
  radarData = extensions.tech_sensors.getIdealRADARReadings(sensorIdRadar)
  local distance = {}
  
  
  if next(radarData) ~= nil then

    for k, v in pairs(radarData) do

      if type(v) == "table" then
        -- print(k)
        -- log("the coming table is in index: ")
        --print(k .. " where it is a table:")

        for k2,v2 in pairs(v) do
          -- log("the second dimenion is: ")
          -- print(k2) 

          if type(v2) == "table" then
            -- print(" v2 is a table:"..k2)
            -- print(v2)
            -- if not next (v2) then
            --   print("empty")
            --   noCars = 1
            -- else 
            --   print("notttttttttttempty")
            --   noCars = 0
            -- end

            for k3, v3 in pairs(v2) do
              -- log("the third dimention is:")
              -- print(k3)
              -- print(v3)

              if k3 == "distToPlayerVehicleSq" then
                -- log("distancetoplayervehicle")
                -- log(v3)
                -- log(math.sqrt(v3))
                if v3 ~= nil and v3 ~= 0 then
                  distance[1] = math.sqrt(v3)
                  -- print("distance: "..math.sqrt(v3))
                end
              end

              if k3 == "vehicleID" then
                -- print(v3)
                vehicleID = v3
                
              end

              -- if k3 == "relVelX" then 
              --   -- print("relvelX: "..v3)
              --   -- local x = v3
              -- end
              -- if k3 == "relVelY" then
              --   -- print("relVelY: "..v3)
              --   -- local y = v3
              -- end
              -- if k3 == "acc" then
              --   -- print("accelration: ")
              -- end

              if k3 == "vel" then
                -- log("velocity vector: ")
                -- log(type(v3))
                -- print(v3)

                if type(v3) == "cdata" then
                  local x = tonumber(v3.x)/3.6
                  local y = tonumber(v3.y)/3.6
                  local z = tonumber(v3.z)/3.6
                  -- print("X: "..x)
                  -- print("Y: "..y)
                  -- print("Z: "..z)
                  -- print("square"..x^2)
                  -- speedcalc = math.sqrt(math.sqrt(x^2) + math.sqrt(y^2)+0.01)
                  if math.sqrt( x^2 + y^2 + z^2) == 0 and zeroSpeed <=5 then
                    zeroSpeed = zeroSpeed + 1
                  elseif zeroSpeed > 5 then
                    speedcalc = 0
                  else
                    zeroSpeed = 0
                    speedcalc = math.sqrt( x^2 + y^2 + z^2 )/3.6
                  end
                  -- log(v3(0))
                  -- print("speedcalc: "..speedcalc)
                  
                  -- changeSpeed(speedcalc)
                  -- print("Speed calc: "..speedcalc)
                  targetSpeed = math.floor(speedcalc)
                end
                -- if(targetSpeed == 0) then
                --   targetSpeed = 1
                -- end

              end
              -- if x and y then
              --   local speedcalc = math.sqrt( x^2 + y^2 )/3.6
              --   targetSpeed = speedcalc
              -- end

              -- if type(v3) == "table" then
              --   for k4, v4 in pairs(v3) do
              --     --print("Kw is: ")
              --     -- print(k4)
              --     --print("v4 is: " )
              --     -- print(v4)
              --   end
              -- end

            end
          end
          
        end
      end
      --log(radarData.distance)
      --log("pairs")
      --local distance = v.distance
      --local id = v.vehicleId
      --log(id, distance)
    end

  end
  if distance[1] then
    -- print("distance in acc filee")
    
    -- print("distance: "..distance[1])
    -- prevDistanceToCars = distance
    -- prevDistanceToCars2 = prevDistanceToCars
    -- prevSpeed2 = prevSpeed
    -- print(prevDistanceToCars2)
    -- print(prevSpeed2)
    -- print("lua sidee"..prevDistanceToCars[1]..prevDistanceToCars2[1])
    -- prevDistanceToCars, prevSpeed = be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPC(%q, %q, %q, %d, %.4f, %s)", lpack.encode(distance), prevDistanceToCars2, prevSpeed2, targetSpeed, dtReal, debug))
    local inputSpeed = 3
    be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPC(%q, %d, %d, %d, %.4f, %s)", lpack.encode(distance), targetSpeed, inputSpeed, vehicleID, dtReal, debug))

    -- else 
    --   local inputSpeed = 3
    --   be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPC(%q, %d, %d, %.4f, %s)", lpack.encode(distance), targetSpeed, inputSpeed, dtReal, debug))

   -- else if 

   --   be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPCSteady(%d, %.4f, %s)",  inputSpeed, dtReal, debug))
  -- elseif noCars == 1 then
  --   print("noCars if")
  --   be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPC(%q, %d, %d, %d, %.4f, %s)", lpack.encode(distance), targetSpeed, inputSpeed, vehicleID, dtReal, debug))

    -- be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPCSteady(%d, %.4f, %s)", inputSpeed, dtSim, debug))


  end

  


  
  -- print("speedACC: "..targetSpeed)
  -- be:queueObj  ectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.changeSpeed("..targetSpeed..")")

  -- changeSpeed(5)
  -- targetSpeed = 10

  -- be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControlWithRadar.MPC(%q, %d, %.4f, %s)", lpack.encode(distance), targetSpeed, dtReal, debug))

end


local function loadWithRadar(speed, debugFlag)
  

  loaded = true
  -- Attempt to get the vehicle ID.
  vid = be:getPlayerVehicleID(0)
  if not vid or vid == -1 then
    return
  end
  assert(vid >= 0, "adaptiveCruiseControlWithRadar.lua - Failed to get a valid vehicle ID")
  --create the radar
  -- local radarArgs = {pos = vec3(1.8382, -0.1676, 0.77825), angle = 0, range = 200}
  local radarArgs = {}
  sensorIdRadar = extensions.tech_sensors.createIdealRADARSensor(vid, radarArgs)
  

  Engine.Annotation.enable(true)
  AnnotationManager.setInstanceAnnotations(true)

  targetSpeed = speed
  be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.getMass()")

  debug = debugFlag
  if debug then
    be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.createCSV()")
  end

  ui_message("ACC extension loaded", 5, "Tech", "forward")
end

local function loadWithID(vid, speed, debugFlag)
  

  loaded = true
  -- Attempt to get the vehicle ID.
  
  assert(vid >= 0, "adaptiveCruiseControlWithRadar.lua - Failed to get a valid vehicle ID")
  --create the radar
  local radarArgs = {pos = vec3(0, -2.3, 1), angle = 30, range = 200}
  sensorIdRadar = extensions.tech_sensors.createIdealRADARSensor(vid, radarArgs)

  Engine.Annotation.enable(true)
  AnnotationManager.setInstanceAnnotations(true)

  targetSpeed = speed
  be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.getMass()")

  debug = debugFlag
  if debug then
    be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.createCSV()")
  end

  ui_message("ACC extension loaded", 5, "Tech", "forward")
end




local function unloadRadar()
  loaded = false
  extensions.tech_sensors.removeIdealRADARSensor(vid, sensorIdRadar)
  be:queueObjectLua(vid, "electrics.values.throttleOverride = nil")
  be:queueObjectLua(vid, "electrics.values.brakeOverride = nil")
  log('I', 'ACC', 'adaptiveCruiseControlWithRadar extension unloaded')
  if debug then
    be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControlWithRadar.saveCSV()")
  end
  ui_message("ACC extension unloaded", 5, "Tech", "forward")
end



-- Public interface.
M.onUpdate            = onUpdate
M.onExtensionLoaded   = function() log('I', 'ACC', 'adaptiveCruiseControlWithRadar extension loaded') end
M.onExtensionUnloaded = unload
M.unloadRadar         = unloadRadar
M.load                = load
M.loadWithRadar       = loadWithRadar
M.loadWithID          = loadWithID
M.changeSpeed         = changeSpeed

return M