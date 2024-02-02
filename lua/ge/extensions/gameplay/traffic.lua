-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {'gameplay_police', 'core_vehiclePoolingManager'}

local logTag = 'traffic'

local traffic, trafficAiVehsList, trafficIdsSorted, player, rolesCache = {}, {}, {}, {}, {}
local mapNodes, mapRules
local vehPool, vehPoolId
local trafficVehicle = require('lua/ge/extensions/gameplay/traffic/vehicle')

-- const vectors --
local vecUp = vec3(0, 0, 1)
local vecY = vec3(0, 1, 0)

-- common functions --
local min = math.min
local max = math.max
local random = math.random

--------
local queuedVehicle = 0
local respawnTicks = 0
local globalSpawnDist = 0 -- dynamic respawn distance ahead for all traffic vehicles
local state = 'off'
local worldLoaded = false

local spawnProcess = {}
local vars

local defaultData = {
  countries = {usa = 'United States', germany = 'Germany', italy = 'Italy', japan = 'Japan'}, -- temporary country list
  traffic = {model = 'pickup'},
  police = {model = 'fullsize', config = 'police'}
}

local debugColors = {
  black = ColorF(0, 0, 0, 1),
  white = ColorF(1, 1, 1, 1),
  green = ColorF(0.2, 1, 0.2, 1),
  red = ColorF(0.5, 0, 0, 1),
  blackAlt = ColorI(0, 0, 0, 255),
  greenAlt = ColorI(0, 64, 0, 255)
}

local commonPaintsCache = {}
local commonPaints = {
  {0.83, 0.83, 0.83, 1}, -- white
  {0, 0, 0, 1}, -- black
  {0.33, 0.33, 0.33, 1}, -- grey
  {0.65, 0.65, 0.65, 1}, -- silver
  {0, 0.1, 0.42, 1}, -- blue
  {0.58, 0.12, 0.12, 1} -- red
}

M.debugMode = false -- visual and logging debug mode
M.showMessages = true -- if enabled, UI messages can be automatically shown
M.queueTeleport = false -- sets a flag to make all traffic vehicles teleport when they are ready

local function getAmountFromSettings() -- gets saved or calculated amount of vehicles
  local amount = settings.getValue('trafficAmount') -- get amount from gameplay settings
  if amount == 0 then -- use CPU-based value
    amount = getMaxVehicleAmount(10)
  end
  return amount
end

local function getIdealSpawnAmount(amount, ignoreAdjust) -- gets the ideal amount of vehicles to spawn based on current world state
  if not amount or amount < 0 then
    amount = getAmountFromSettings()
  end

  local vehCount = 0
  if not ignoreAdjust then
    for _, veh in ipairs(getAllVehiclesByType()) do
      if veh.isParked ~= 'true' and veh:getActive() then
        vehCount = vehCount + 1
      end
    end
  end

  return amount - vehCount
end

local function colorDifference(c1, c2) -- returns the color difference value
  -- https://stackoverflow.com/questions/9018016/how-to-compare-two-colors-for-similarity-difference/9085524#9085524
  local avg = (c1[1] + c2[1]) * 0.5
  local r = c1[1] - c2[1]
  local g = c1[2] - c2[2]
  local b = c1[3] - c2[3]
  return math.sqrt(bit.rshift(((512 + avg) * r * r), 8) + 4 * g * g + bit.rshift(((767 - avg) * b * b), 8))
end

local function getRandomPaint(vehId, commonChance) -- gets a random paint name, with a bias for real world paints
  local obj = be:getObjectByID(vehId or 0)
  local model = obj and obj.jbeam or 'pessima' -- safe default
  local config = obj and tostring(obj.partConfig)
  local paint
  commonChance = commonChance or 0

  local modelData = core_vehicles.getModel(model).model
  if modelData and modelData.paints then
    local paintNames = tableKeys(modelData.paints)

    if random() <= commonChance then -- if true, selects a color that is typically found in the real world
      local n = math.ceil(square(random()) * 6 - 0.2) -- default paint plus six common paints
      -- default paint chance: 18%
      if commonPaints[n] then
        local bestVal = math.huge
        local bestPaint
        local c = commonPaints[n]
        local c1 = {c[1] * 255, c[2] * 255, c[3] * 255}

        for k, v in pairs(modelData.paints) do
          local bc = v.baseColor
          if bc[1] == c[1] and bc[2] == c[2] and bc[3] == c[3] then -- exact match (ends the loop early)
            paint = k
            bestPaint = nil
            break
          else
            local c2 = {bc[1] * 255, bc[2] * 255, bc[3] * 255}
            local val = colorDifference(c1, c2)
            if val < bestVal then
              bestVal = val
              bestPaint = k
            end
          end
        end

        if bestPaint then
          paint = bestPaint
        end
      else
        if config then
          local _, configKey = path.splitWithoutExt(config)
          local configData = core_vehicles.getModel(model).configs[configKey]
          paint = configData and configData.defaultPaintName1 or modelData.defaultPaintName1
        else
          paint = 'Pearl White' -- fallback
        end
      end
    else -- selects any color
      paint = paintNames[random(#paintNames)]
    end
  end
  return paint
end

local function getNumOfTraffic(activeOnly) -- returns current amount of AI traffic
  return (activeOnly and vehPool) and #vehPool.activeVehs or #trafficAiVehsList
end

local function getCountry() -- gets the country from the info
  local dir = path.split(getMissionFilename()) or ''
  local json = jsonReadFile(dir..'info.json')
  if json and json.country then
    local countryKey = string.match(json.country, '%w+.%w+.%w+.(%w+)') or json.country
    local countryStr = 'default'
    if countryKey and defaultData.countries[countryKey] then
      countryStr = defaultData.countries[countryKey]
    end
    return countryStr and string.lower(countryStr) or countryKey
  else
    return 'default'
  end
end

local function setMapData() -- updates all map related data
  mapNodes = map.getMap().nodes
  mapRules = map.getRoadRules()
end

local function checkSpawnPos(pos, camRadius, plRadius, vehRadius) -- tests if the spawn point interferes with other vehicles
  vehRadius = vehRadius or 15
  camRadius = min(100, camRadius or 100)
  plRadius = min(100, plRadius or 100)

  if pos:squaredDistance(core_camera.getPosition()) < square(camRadius) then
    return false
  end

  for _, v in ipairs(getAllVehicles()) do
    local vehId = v:getId()
    if v:getActive() then
      local vPos = traffic[vehId] and traffic[vehId].pos or v:getPosition() -- traffic pos can be more accurate here
      local relSpeed = max(0, v:getVelocity():dot((pos - vPos):normalized()))
      local radius = v:isPlayerControlled() and plRadius or vehRadius
      if pos:squaredDistance(vPos) < square(square(relSpeed) / 20 + radius) then
        return false
      end
    end
  end

  return true
end

local function findSpawnPoint(startPos, startDir, minDist, maxDist, extraArgs) -- finds and returns a spawn point on the map
  setMapData()
  extraArgs = type(extraArgs) == 'table' and extraArgs or {}
  startDir = startDir:z0():normalized()
  minDist = minDist or 80  -- minimum distance along path to check for spawn points
  maxDist = maxDist or 240 -- maximum distance along path to check for spawn points

  local innerDist = 0 -- current distance along valid spawn segment of spawn path (starting from the minimum distance)
  local maxLoopCount = 50
  local status = 'working'
  local road = {}

  local lateralDist = extraArgs.lateralDist or 0 -- lateral (side) distance from the start to use for searching for a path (such as divided highways)
  local pathRandomization = extraArgs.pathRandom or 1
  local width = extraArgs.width or 2
  local length = extraArgs.length or 5
  local minDrivability = extraArgs.minRoadDrivability or 0.25
  local maxDrivability = extraArgs.maxRoadDrivability or 1
  local minRadius = extraArgs.minRoadRadius or 2.25
  local maxRadius = extraArgs.maxRoadRadius or 20

  --[[ with the above values, a path will be generated along the road ahead, and points between the minimum distance and maximum distance
  will be tested and validated before returning a new spawn point ]]--
  if M.debugMode then
    log('I', logTag, 'Spawn point params: minDist = '..minDist..', maxDist = '..maxDist..', lateralDist = '..lateralDist)
  end

  if lateralDist ~= 0 then
    startPos = startPos + startDir:cross(vecUp) * lateralDist
  end
  local n1, n2 = map.findClosestRoad(startPos)

  if n1 and mapNodes[n1] then
    if not extraArgs.ignoreRoadCheck then
      local firstLink = mapNodes[n1].links[n2] or mapNodes[n2].links[n1]
      if firstLink and (firstLink.type == 'private' or firstLink.drivability < minDrivability) then -- start link is invalid, search for another one
        if M.debugMode then
          log('I', logTag, 'Invalid start road, searching for a new one...')
        end

        local branches = map.getGraphpath():getBranchNodesAround(n1, 500)
        if branches then
          table.sort(branches, function(a, b) return a.sqDist < b.sqDist end)
          local found = false
          for _, b in ipairs(branches) do
            for _, l in ipairs(b.links) do
              local link = mapNodes[b.node].links[l] or mapNodes[l].links[b.node]
              if link and link.type ~= 'private' and link.drivability >= minDrivability then
                n1, n2 = b.node, l
                minDist = max(0, minDist - math.sqrt(b.sqDist))
                found = true

                if M.debugMode then
                  log('I', logTag, 'New start road: '..n1..', '..n2)
                end
                break
              end
            end
            if found then break end
          end
        end
      end
    end

    local p1, p2 = mapNodes[n1].pos, mapNodes[n2].pos
    if (p2 - p1):dot(startDir) < 0 then
      n1, n2 = n2, n1
      p1, p2 = p2, p1
    end

    -- spawn point is along path in direction set by startDir, with possible branching
    local path = map.getGraphpath():getRandomPathG(n1, startDir, maxDist, pathRandomization, 1, false)
    local pathDist = map.getPathLen(path)
    local pathCount = #path
    local offset = linePointFromXnorm(p1, p2, clamp(startPos:xnormOnLine(p1, p2), 0, 1)):distance(p1)
    local drivabilityCheck = math.sqrt(random()) -- to test with drivability
    local loopCount = 1

    while status == 'working' do
      if loopCount > maxLoopCount then
        status = 'loopLimit'
        break
      end
      if minDist + innerDist >= pathDist then -- extend pathDist
        local pathNode1, pathNode2 = path[pathCount], path[pathCount - 1]
        local tempDir = (mapNodes[pathNode1].pos - mapNodes[pathNode2].pos):normalized()
        local newPath = map.getGraphpath():getRandomPathG(pathNode1, tempDir, 100, pathRandomization, 1, false)
        local tempDist = map.getPathLen(newPath)
        table.remove(newPath, 1)
        pathDist = pathDist + tempDist
        path = arrayConcat(path, newPath)
      end

      table.clear(road)
      road.n1, road.n2, road.xnorm = map.getNodesFromPathDist(path, offset + minDist + innerDist) -- it may be possible to optimize this

      if road.n1 and road.n2 and mapNodes[road.n1] and mapNodes[road.n2] then
        road.link = mapNodes[road.n1].links[road.n2] or mapNodes[road.n2].links[road.n1]
        if road.link then
          local pos1, pos2 = mapNodes[road.n1].pos, mapNodes[road.n2].pos
          road.pos = linePointFromXnorm(pos1, pos2, road.xnorm)
          road.rot = (pos2 - pos1):normalized()
          road.normal = (mapNodes[road.n1].normal + mapNodes[road.n2].normal):normalized()
          road.radius = lerp(mapNodes[road.n1].radius, mapNodes[road.n2].radius, road.xnorm)
        else
          table.clear(road)
        end
      else
        table.clear(road)
      end

      if road.n1 then
        -- spawn check fails if road is not suitable enough
        local linkDrivability = road.link.drivability
        local linkCoef = road.link.oneWay and 0.5 or clamp(road.radius / 2, 0.5, 1) -- radius coefficient

        if not extraArgs.ignoreRoadCheck then
          if road.link.type == 'private' then
            status = 'roadTypeFail'
            break
          end

          if linkDrivability < max(minDrivability, drivabilityCheck)
          or linkDrivability > maxDrivability
          or road.radius < max(minRadius, (width + max(0, (length - 5) / 20)) * linkCoef)
          or road.radius > maxRadius then
            status = 'roadTestFail'
            break
          end
        end

        if extraArgs.useAutoLimits and startDir:dot(road.pos - startPos) >= 0 then
          maxDist = maxDist + clamp(square(startPos.z - road.pos.z) / 8, 0, 200) or 0 -- augments final distance with camera height if looking at point
        end
        local currDist = minDist + innerDist
        local foundSpawn = false

        if extraArgs.ignoreRaycast or currDist >= maxDist then
          foundSpawn = true
        else
          foundSpawn = true
          local posUp = road.pos + vecUp * 2 -- raise height a bit to "look" over hills
          local rayDirVecCross = (posUp - startPos):z0():normalized():cross(vecUp) -- side vector to test for narrow objects such as lampposts

          for i = -1, 1 do -- three point check for static raycast (checks for thin statics such as trees)
            local rayDirVec = (posUp + rayDirVecCross * i * 1.5) - startPos
            local rayDistMax = rayDirVec:length()
            rayDirVec = rayDirVec / (rayDistMax + 1e-30)
            local rayDist = castRayStatic(startPos, rayDirVec, rayDistMax) -- tests if spawn point is blocked by ray from start position
            if rayDist >= rayDistMax then
              foundSpawn = false
              break
            end
          end
        end

        if foundSpawn then
          if M.debugMode then
            log('I', logTag, 'Spawn point found at distance: '..currDist)
          end
          foundSpawn = checkSpawnPos(road.pos, minDist, minDist) -- ensure valid spawn point
        end

        if foundSpawn then
          road.startPos = startPos
          road.startDir = startDir

          if M.debugMode then
            log('I', logTag, 'Spawn point validated!')
            dump(road)
          end
          return road
        end

        innerDist = innerDist + max(15, road.link.speedLimit) -- higher speed limit = bigger gaps
      end
      loopCount = loopCount + 1
    end
  else
    status = 'spawnPathFail'
  end

  if M.debugMode then
    log('W', logTag, 'Spawn point failed! Reason: '..status)
  end
end

local function placeOnRoad(spawnData, placeData) -- sets a position and rotation on road
  local pos
  local rot = spawnData.rot or (mapNodes[spawnData.n2].pos - mapNodes[spawnData.n1].pos):normalized()
  local radius = spawnData.radius
  if not radius then
    radius = mapNodes[spawnData.n1] and lerp(mapNodes[spawnData.n1].radius, mapNodes[spawnData.n2].radius, 0.5) or vars.minRoadRadius
  end
  local roadWidth = radius * 2
  local laneWidth = roadWidth >= 6.1 and 3.05 or 2.4 -- gets modified for very narrow roads
  local slope = rot:dot(vecUp)
  local dirBias = placeData and placeData.dirBias or 0 -- negative = away from you, positive = towards you
  local legalSide = mapRules.rightHandDrive and -1 or 1
  local origRot = rot
  if spawnData.startPos and spawnData.startDir then
    if (spawnData.pos - spawnData.startPos):dot(spawnData.startDir) < 0 then
      dirBias = min(1, dirBias + 0.5) -- vehicles spawning on the path behind should mostly drive towards you
    end
  end

  local laneCount = max(1, math.floor(roadWidth / laneWidth)) -- estimated number of lanes (this will change when real lanes exist)
  if spawnData.link and not spawnData.link.oneWay and laneCount % 2 ~= 0 then -- two way roads currently have an even amount of expected lanes
    laneCount = max(1, laneCount - 1)
  end
  local laneChoice, roadDir, offset

  if spawnData.link and spawnData.link.oneWay then
    laneChoice = random(laneCount)
    roadDir = spawnData.link.inNode == spawnData.n1 and 1 or -1 -- spawn facing the correct way
    if vars.enablePrivateRoads then
      laneChoice = roadDir == -1 and 1 or laneCount -- temp hack for private road racetracks
    end
  else
    if laneCount == 1 then
      roadDir = 1 -- always spawn facing forwards on narrow roads
      laneChoice = 1
    else
      -- if road is steep, try spawning facing downhill; TODO: boost vehicle uphill
      --if math.abs(slope) > 0.15 then
        --roadDir = -sign2(slope)
      --else
      roadDir = dirBias > random() * 2 - 1 and -1 or 1
      --end

      local laneMin = roadDir == -1 and 1 or max(1, math.floor(laneCount * 0.5) + 1)
      local laneMax = roadDir == -1 and max(1, math.floor(laneCount * 0.5)) or laneCount
      laneChoice = random(laneMin, laneMax)
    end
  end

  offset = (laneChoice - (laneCount * 0.5 + 0.5)) * (roadWidth / laneCount) * legalSide -- lateral offset
  if placeData then -- custom placements
    offset = placeData.offset or offset
    roadDir = placeData.roadDir or roadDir
  end

  pos = spawnData.pos + origRot:z0():cross(vecUp) * offset
  rot = rot * roadDir

  local surfaceHeight = be:getSurfaceHeightBelow((pos + vecUp * 2.5))
  if surfaceHeight >= -1e6 then
    pos.z = surfaceHeight
  end
  return pos, rot
end

local function getNextSpawnPoint(id, spawnData, placeData) -- sets the new spawn point of a vehicle
  if id and be:getObjectByID(id) then
    local playerId = be:getPlayerVehicleID(0)
    if not spawnData then
      local spawnValue = traffic[id] and traffic[id].respawn.finalSpawnValue or 1
      if spawnValue > 0 then
        local freeCamMode = commands.isFreeCamera() or not traffic[playerId]
        local dirVec = freeCamMode and core_camera.getForward() or vec3(traffic[playerId].vel) / (traffic[playerId].speed + 1e-30)
        local speedValue = freeCamMode and 40 or min(120, traffic[playerId].speed * 2)
        local addedDist = globalSpawnDist * clamp(2 - spawnValue, 0, 1.5)
        local minDist = clamp(80 / spawnValue + speedValue, 40, 200) + addedDist
        local maxDist = clamp(minDist * 2.5, 140, 400) + addedDist
        local maxRandomValue = traffic[id] and traffic[id].respawn.spawnRandomization or 1
        local maxLateralDist = maxRandomValue * 0.25
        dirVec:setAdd(dirVec:cross(vecUp):normalized() * (random() * maxRandomValue * 2 - maxRandomValue)) -- small randomization of start direction

        local extraArgs = {}
        extraArgs.lateralDist = random(speedValue * -maxLateralDist, speedValue * maxLateralDist)
        extraArgs.pathRandom = freeCamMode and 1 or clamp((100 - speedValue) / 60, 0, maxRandomValue)
        extraArgs.ignoreRoadCheck = vars.enablePrivateRoads
        extraArgs.useAutoLimits = true

        local prevPos = vec3()
        if traffic[id] then
          extraArgs.width, extraArgs.length = traffic[id].width, traffic[id].length
          extraArgs.minRoadDrivability = clamp(traffic[id].drivability, vars.minRoadDrivability or 0.25, 1)
          extraArgs.minRoadRadius = vars.minRoadRadius
          prevPos:set(traffic[id].respawn.pos)
        end

        for i = 1, 2 do
          spawnData = findSpawnPoint(core_camera.getPosition(), dirVec, minDist, maxDist, extraArgs)
          if spawnData then
            if spawnData.pos:squaredDistance(prevPos) < 400 then-- tries to prevent same spawn point as last time
              spawnData = findSpawnPoint(spawnData.pos, dirVec, minDist, maxDist, extraArgs)
            end
          end

          if spawnData then break end
          dirVec = -dirVec -- try reverse search direction once
        end
      end
    end
  end

  if spawnData then
    -- adjust global respawn distance based on road network density value based on this spawn point
    local baseDensity = clamp(spawnData.radius, 2, 10)
    if not spawnData.link or not spawnData.link.oneWay then
      baseDensity = baseDensity * 0.5
    end
    local densityValue = #map.getGraphpath():getBranchNodesAround(spawnData.n1, 200)
    densityValue = 10 / (baseDensity * densityValue) + (random() - 0.5)
    if densityValue < 1 then
      globalSpawnDist = max(0, globalSpawnDist - 40)
    else
      globalSpawnDist = globalSpawnDist + 20 * (densityValue - 1)
      if globalSpawnDist >= 200 then globalSpawnDist = 0 end -- reset value if threshold reached
    end

    local pos, rot = placeOnRoad(spawnData, placeData)
    local normal = map.surfaceNormal(pos, 1)
    rot = quatFromDir(vecY:rotated(quatFromDir(rot, normal)), normal)
    return pos, rot
  end
end

local function respawnVehicle(id, pos, rot, strict) -- moves the vehicle to a new position and rotation
  local obj = id and be:getObjectByID(id)
  if not obj or not pos or not rot then return end

  if not strict then
    spawn.safeTeleport(obj, pos, rot, true) -- this is slower, but prevents vehicles from spawning inside static geometry
  else
    obj:setPositionRotation(pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, rot.w)
    obj:autoplace(false)
    obj:resetBrokenFlexMesh()
  end

  respawnTicks = 5

  if traffic[id] then
    traffic[id].pos = vec3(pos)
    traffic[id]._teleport = nil
    traffic[id]._teleportDist = nil
    traffic[id]:onRespawn()
  end
end

local function forceTeleport(id, pos, rot, minDist, maxDist) -- force teleports a traffic vehicle
  setMapData()
  minDist = minDist or 180
  maxDist = maxDist or 500

  local vehObj = be:getObjectByID(id)
  pos = pos or core_camera.getPosition()
  rot = rot or core_camera.getForward()

  if vehObj and vehObj:getActive() then
    if traffic[id] then
      traffic[id].respawn.pos = vec3(0, 0, -1000)
    end

    local data = findSpawnPoint(pos, rot, minDist, maxDist)
    local newPos, newRot
    if data then
      newPos, newRot = getNextSpawnPoint(id, data)
    else
      -- if there is no good road to teleport to, just place the vehicle by a distant spawn point
      local levelData = core_levels.getLevelByName(getCurrentLevelIdentifier())
      if levelData and levelData.spawnPoints then
        local bestSpawn, spawnObj
        local bestDist = 0
        for _, v in ipairs(levelData.spawnPoints) do
          spawnObj = scenetree.findObject(v.objectname)
          if spawnObj then
            local dist = spawnObj:getPosition():squaredDistance(core_camera.getPosition())
            if dist > bestDist then
              bestDist = dist
              bestSpawn = v.objectname
            end
          end
        end
        if bestSpawn then
          spawnObj = scenetree.findObject(bestSpawn)
          local tempPos = spawnObj:getPosition()
          local tempRot = quat(spawnObj:getRotation()) * quat(0, 0, 1, 0)
          data = findSpawnPoint(tempPos, vecY:rotated(tempRot), 0, 1000, {ignoreRoadCheck = true, ignoreRaycast = true}) -- validates the spawn point
          if data then
            newPos, newRot = getNextSpawnPoint(id, data)
          else
            -- this is not ideal, conflicts may happen; however, this is an unlikely outcome
            newPos, newRot = tempPos, tempRot
          end
        end
      end
    end
    respawnVehicle(id, newPos, newRot)
  end
end

local function scatterTraffic(vehIds, minDist, maxDist) -- teleports a group of vehicles away from the current place
  vehIds = vehIds or trafficAiVehsList
  for _, id in ipairs(trafficAiVehsList) do
    forceTeleport(id, nil, nil, minDist, maxDist)
  end
end

local function createTrafficPool() -- sets the main traffic vehicle pooling object
  if not core_vehiclePoolingManager then extensions.load('core_vehiclePoolingManager') end
  vehPool = core_vehiclePoolingManager.createPool()
  vehPool.name = 'traffic'
  vehPoolId = vehPool.id
end

local function deleteTrafficPool() -- deletes the traffic pool and resets variables
  if vehPool then
    vehPool:deletePool(true)
    vehPool, vehPoolId = nil, nil
  end
  vars.activeAmount = math.huge
end

local function updateTrafficPool() -- updates the main traffic vehicle pooling object
  if not vehPool then return end
  vehPool:setMaxActiveAmount(vars.activeAmount, vars.idealActiveAmount)
  vehPool:setAllVehs(true)
end

local function getNextVehFromPool() -- returns the next usable inactive vehicle, or nil if none found
  if vehPool then
    local pool = vehPool
    if vehPool.prevPoolId and core_vehiclePoolingManager.getPoolById(vehPool.prevPoolId) then -- alternate vehicle pool for cycling
      pool = core_vehiclePoolingManager.getPoolById(vehPool.prevPoolId)
    end

    for _, id in ipairs(pool.inactiveVehs) do
      if traffic[id] then
        local activeProbability = traffic[id].enableRespawn and traffic[id].activeProbability or 0 -- later, use zones
        if activeProbability >= random() then -- vehicles are less likely to get activated if they have a lower probability value
          return id
        end
      end
    end
  end
end

local function processNextSpawn(id, ignorePool) -- processes the next vehicle respawn action
  local newPos, newRot
  local oldId, newId = id, id

  if not ignorePool then
    local nextId = getNextVehFromPool()
    if nextId then -- if enableAutoPooling is false, bypasses the vehicle pool cycling system
      if #vehPool.activeVehs < vehPool.realActiveAmount then -- amount of active vehicles is less than the expected limit
        newId = nextId
      elseif traffic[id].enableAutoPooling then
        oldId, newId = vehPool:crossCycle(vehPool.prevPoolId, oldId, nextId) -- cycles the pool; if a previous pool exists, use a vehicle from there
      end
    end
  end

  newPos, newRot = getNextSpawnPoint(newId, nil, {dirBias = traffic[newId].respawn.spawnDirBias})
  if newPos then
    if vehPool.allVehs[newId] == 0 then -- TODO: something seems to fail here if the vehicle got force reloaded and was inactive
      vehPool:setVeh(newId, true)
    end
    respawnVehicle(newId, newPos, newRot)
  else
    traffic[newId]:onRefresh()
  end
end

local function setDebugMode(value) -- sets the debug mode
  vars.aiDebug = value and 'traffic' or 'off'
end

local function refreshVehicles() -- resets core traffic vehicle data
  for _, veh in pairs(traffic) do
    veh:onRefresh()
  end
end

local function resetTrafficVars() -- resets traffic variables to default
  vars = {
    spawnValue = 1,
    spawnDirBias = 0.2,
    baseAggression = 0.3,
    minRoadDrivability = 0.25,
    minRoadRadius = 1.2,
    activeAmount = math.huge,
    idealActiveAmount = nil,
    speedLimit = nil,
    aiMode = 'traffic',
    aiAware = 'auto',
    aiDebug = 'off',
    enableRandomEvents = false, -- enables events such as police randomly chasing AI suspects
    enablePrivateRoads = false -- enables traffic spawning on private roads (such as racetracks)
  }

  refreshVehicles()
end
resetTrafficVars()

local function setTrafficVars(data) -- sets various traffic variables
  if type(data) ~= 'table' then
    if not data then resetTrafficVars() end
    return
  end

  for k, v in pairs(data) do
    if k == 'aiMode' or k == 'aiDebug' or k == 'aiAware' then
      data[k] = type(v) == 'string' and string.lower(v) or v
    end
  end

  vars = tableMerge(vars, data)

  for _, id in ipairs(trafficAiVehsList) do
    local veh = traffic[id]

    if data.aiMode then
      veh:setAiMode(vars.aiMode)
    end
    if data.aiAware then
      veh:setAiAware(vars.aiAware)
    end
    if data.speedLimit or data.baseAggression then
      refreshVehicles()
    end
    if data.spawnValue then
      veh.respawn.spawnValue = data.spawnValue
    end
  end

  if data.aiDebug then
    M.debugMode = data.aiDebug == 'traffic'
    refreshVehicles()
  end
  if data.activeAmount and vehPool and state == 'on' then -- state needs to be on (not loading) for this to work
    updateTrafficPool()
  end
end

local function setActiveAmount(amount, idealAmount) -- sets the maximum amount of active (visible) vehicles
  -- idealAmount is optional and means the total number of active vehicles in the whole scene
  amount = amount or math.huge
  setTrafficVars({activeAmount = amount, idealActiveAmount = idealAmount})
end

local function setPursuitMode(mode) -- sets pursuit mode; -1 = busted, 0 = off, 1 and higher = pursuit level
  extensions.gameplay_police.setPursuitMode(mode)
end

local function getRoleConstructor(roleName) -- gets the role constructor module
  if not rolesCache[roleName] then
    if not FS:fileExists('/lua/ge/extensions/gameplay/traffic/roles/'..roleName..'.lua') then
      log('W', logTag, 'Traffic role does not exist: '..roleName)
      roleName = 'standard'
    end
    rolesCache[roleName] = require('/lua/ge/extensions/gameplay/traffic/roles/'..roleName)
  end
  return rolesCache[roleName]
end

local function insertTraffic(id, ignoreAi) -- inserts new vehicles into the traffic table
  -- ignoreAi prevents AI and respawn logic from getting applied to the given vehicle
  local obj = be:getObjectByID(id)

  if obj and not traffic[id] then
    traffic[id] = trafficVehicle({id = id})
    if not traffic[id] then -- traffic vehicle object creation failed
      return
    end

    obj:setDynDataFieldbyName('isTraffic', 0, not ignoreAi and 'true' or 'false')
    if not ignoreAi then
      table.insert(trafficAiVehsList, id)
      traffic[id]:setAiMode(vars.aiMode)
      gameplay_walk.addVehicleToBlacklist(id)

      obj.playerUsable = settings.getValue('trafficEnableSwitching') and true or false

      if not vehPool then
        createTrafficPool()
      end
      vehPool:insertVeh(id)
    end

    trafficIdsSorted = tableKeysSorted(traffic)
    extensions.hook('onTrafficVehicleAdded', id)
  end
end

local function removeTraffic(id, stopAi) -- removes vehicles from the traffic table
  if traffic[id] then
    local obj = be:getObjectByID(id)
    local idx = arrayFindValueIndex(trafficAiVehsList, id)
    if idx then table.remove(trafficAiVehsList, idx) end

    if obj then
      traffic[id].role:resetAction()
      obj:setMeshAlpha(1, '')
      obj.playerUsable = true
      obj.uiState = 1

      if stopAi and traffic[id].isAi then
        obj:queueLuaCommand('ai.setMode("stop")')
      end
    end

    traffic[id] = nil
    trafficIdsSorted = tableKeysSorted(traffic)
    extensions.hook('onTrafficVehicleRemoved', id)
  end

  if vehPool and not trafficAiVehsList[1] then
    deleteTrafficPool()
  end
end

local function checkPlayer(id) -- checks if the player data needs to be inserted
  if state == 'on' then
    local obj = be:getObjectByID(id)

    if obj and obj:isPlayerControlled() then
      if traffic[id] then
        if traffic[id].alpha ~= 1 then -- if vehicle was invisible, show it
          obj:setMeshAlpha(1, '')
          traffic[id].alpha = 1
        end
      else
        insertTraffic(id, true)
      end
    end
  end
end

local function onVehicleSpawned(id)
  if traffic[id] then -- if vehicle is replaced, update its traffic role and properties
    traffic[id]:applyModelConfigData()
    traffic[id]:setRole(traffic[id].autoRole)
    traffic[id]:resetAll()
  end
  if vehPool then vehPool._updateFlag = true end
end

local function onVehicleSwitched(oldId, newId)
  checkPlayer(newId, oldId)
end

local function onVehicleResetted(id)
  checkPlayer(id)
  if traffic[id] then
    traffic[id]:onVehicleResetted()
  end
end

local function onVehicleDestroyed(id)
  removeTraffic(id)
  if vehPool then vehPool._updateFlag = true end
end

local function onVehicleActiveChanged(vehId, active)
  if vehPool then
    if not vehPool.allVehs[vehId] then
      vehPool._updateFlag = true
    end

    if traffic[vehId] and traffic[vehId].isAi then
      if not active then
        traffic[vehId]._teleport = true
        traffic[vehId].alpha = 0
        be:getObjectByID(vehId):setMeshAlpha(0, '')
      else
        if traffic[vehId]._teleport then -- if flag did not get unset
          if not checkSpawnPos(be:getObjectByID(vehId):getPosition()) then -- check if vehicle appeared in valid place
            forceTeleport(vehId, nil, nil, traffic[vehId]._teleportDist)
          end
        end
      end
    end
  end
end

local function deleteVehicles() -- deletes all traffic vehicles
  for _, veh in ipairs(getAllVehiclesByType()) do
    local id = veh:getId()
    if traffic[id] and (traffic[id].isAi or tonumber(veh.isTraffic) == 1) then
      removeTraffic(id)
      veh:delete()
    end
  end
end

local function activate(vehList) -- activates traffic mode, and adds specified vehicles to the traffic table
  -- backwards compatible stuff
  if type(vehList) ~= 'table' then
    vehList = {}
    for _, v in ipairs(getAllVehiclesByType()) do
      if not v.isParked then
        table.insert(vehList, v:getId())
      end
    end
  end

  if not vehList[1] then
    log('W', logTag, 'No vehicles found; unable to start traffic!')
    return
  end

  table.sort(vehList, function(a, b) return a < b end)

  for _, id in ipairs(vehList) do
    if type(id) == 'number' then
      map.request(id, -1) -- force mapmgr to read map
      insertTraffic(id, be:getObjectByID(id):isPlayerControlled())
    end
  end

  if not next(traffic) then
    log('W', logTag, 'Traffic activation failed!')
  end
end

local function deactivate(stopAi) -- deactivates traffic mode for all vehicles
  for _, id in ipairs(tableKeysSorted(traffic)) do
    removeTraffic(id, stopAi)
  end
end

local function getTrafficGroupFromFile(filters) -- returns an existing vehicle group file
  filters = filters or {}
  local group, fileName
  local dir = path.split(getMissionFilename()) or '/levels/'
  local files = FS:findFiles(dir, '*.vehGroup.json', 0, true, true)
  if not files[1] or filters.useCustom then
    files = FS:findFiles('/vehicleGroups/', '*.vehGroup.json', -1, true, true)
  end

  if filters.name then
    local filteredFiles = {}
    for _, v in ipairs(files) do
      local d, fn = path.splitWithoutExt(v)
      if string.find(fn, string.lower(filters.name)) then
        table.insert(filteredFiles, v)
      end
    end
    files = filteredFiles
  end

  if files[1] then
    fileName = files[math.random(#files)] -- if multiple files exist, select one randomly
    group = jsonReadFile(fileName)
    if group then
      group = group.data
    end
  end
  return group, fileName
end

local function createBaseGroupParams() -- returns base group generation parameters
  return {filters = {Type = {car = 1, truck = 0.75}, ["Derby Class"] = {["heavy truck"] = 0, other = 1}}, country = getCountry(), maxYear = 0, minPop = 50}
end

local function createTrafficGroup(amount, allMods, allConfigs, simpleVehs) -- creates a traffic group with the use of some player settings
  if allMods == nil then allMods = settings.getValue('trafficAllowMods') end
  if allConfigs == nil then allConfigs = settings.getValue('trafficSmartSelections') end
  if simpleVehs == nil then simpleVehs = settings.getValue('trafficSimpleVehicles') end

  local params = createBaseGroupParams()
  params.allMods = allMods
  params.modelPopPower = 0.5
  params.configPopPower = 1

  if simpleVehs then
    params.allConfigs = true
    params.filters.Type = {proptraffic = 1}
    params.minPop = 0
  else
    params.allConfigs = allConfigs
    params.filters['Config Type'] = {Police = 0, other = 1} -- no police cars

    if params.allMods and params.filters.Type then
      params.filters.Type.automation = 1
      params.minPop = 0
    end
  end

  return core_multiSpawn.createGroup(amount, params)
end

local function createPoliceGroup(amount, allMods) -- creates a group of police vehicles
  if allMods == nil then allMods = settings.getValue('trafficAllowMods') end

  local params = createBaseGroupParams()

  params.allMods = allMods
  params.allConfigs = true
  params.minPop = 0
  params.modelPopPower = 0.5
  params.configPopPower = 1

  if params.allMods and params.filters.Type then
    params.filters.Type.automation = 1
  end
  if params.country ~= 'default' then
    params.filters.Country = {[params.country] = 100, other = 0.1} -- other is 0.1 (not 0) just in case no country matches
  end
  params.filters['Config Type'] = {police = 1}

  return core_multiSpawn.createGroup(amount, params)
end

local function spawnTraffic(amount, group) -- spawns a defined group of vehicles and sets them as traffic
  amount = amount or max(1, getAmountFromSettings() - #getAllVehiclesByType())
  group = group or core_multiSpawn.createGroup(amount)
  state = 'spawning'

  return core_multiSpawn.spawnGroup(group, amount, {name = 'autoTraffic', mode = 'traffic', gap = 20, ignoreJobSystem = not worldLoaded, ignoreAdjust = not worldLoaded})
end

local function setupTraffic(amount, policeRatio, options) -- prepares a group of vehicles for traffic
  amount = amount or -1
  policeRatio = policeRatio or 0
  options = type(options) == 'table' and options or {}

  if not options.ignoreDelete then
    deleteVehicles() -- clear current traffic
  end
  deleteTrafficPool()

  local trafficGroup, policeGroup
  local policeAmount = 0
  local activeAmount = options.activeAmount or amount

  if type(options.vehGroup) == 'table' then -- directly sets a vehicle group to be used for traffic; may overwrite other parameters
    trafficGroup = options.vehGroup
    log('I', logTag, 'Applying custom traffic group')
  end

  if amount == -1 then -- auto amount
    local amountFromSettings = getAmountFromSettings()
    amount = getIdealSpawnAmount(amountFromSettings) -- maxAmount automatically accounts for currently spawned non-traffic vehicles
    policeAmount = options.policeAmount or math.ceil(amount * policeRatio)
    activeAmount = amount

    if settings.getValue('trafficExtraVehicles') then
      local extraAmount = settings.getValue('trafficExtraAmount')
      if extraAmount == 0 then
        extraAmount = clamp(amountFromSettings, 2, 8)
      end

      amount = max(amountFromSettings, amount + extraAmount)
    end
  else
    if options.autoAdjustAmount then
      amount = getIdealSpawnAmount(amount) -- adjust for amount of existing active vehicles
    end
    policeAmount = options.policeAmount or math.ceil(amount * policeRatio)
  end

  if not trafficGroup then -- if predefined vehicle group does not exist, create it
    if policeAmount >= 1 then
      policeAmount = min(policeAmount, amount)
      local fileData, fileName
      local fileMode = options.autoLoadFromFile or settings.getValue('trafficSmartSelections')
      if fileMode then
        fileData, fileName = getTrafficGroupFromFile({name = 'police'})
        if fileData then
          fileData = core_multiSpawn.fitGroup(fileData, policeAmount)
          log('I', logTag, 'Loaded police group from file: '..tostring(fileName))
        end
      end
      policeGroup = fileData or createPoliceGroup(policeAmount)

      if not policeGroup[1] then
        for i = 1, policeAmount do
          table.insert(policeGroup, defaultData.police)
        end
      end
    end

    if amount >= 1 then
      if not trafficGroup then
        local fileData, fileName
        local fileMode = options.autoLoadFromFile and not (settings.getValue('trafficSimpleVehicles') or options.simpleVehs)
        if fileMode then
          fileData, fileName = getTrafficGroupFromFile({name = 'traffic'})
          if fileData then
            fileData = core_multiSpawn.fitGroup(fileData, amount)
            log('I', logTag, 'Loaded traffic group from file: '..tostring(fileName))
          end
        end

        trafficGroup = fileData or createTrafficGroup(amount, options.allMods, options.allConfigs, options.simpleVehs)
      end
      if not trafficGroup[1] then
        for i = 1, amount do
          table.insert(trafficGroup, defaultData.traffic)
        end
      end

      if policeGroup then
        for i = 1, policeAmount do
          if policeGroup[i] then
            table.insert(trafficGroup, 1, policeGroup[i]) -- insert at the start of the array (police vehicles have priority)
            table.remove(trafficGroup, #trafficGroup)
          end
        end
      end
    end
  end

  if amount > 0 and trafficGroup and trafficGroup[1] then
    spawnProcess.group = trafficGroup
    spawnProcess.amount = amount
    state = 'loading'

    createTrafficPool()
    setTrafficVars({aiMode = 'traffic', activeAmount = activeAmount})
    --idealActiveAmount = vehPool:getSceneActiveAmount() + activeAmount
  else
    if amount <= 0 then
      log('W', logTag, 'Traffic amount to spawn is zero!')
    else
      log('W', logTag, 'Traffic vehicle group is undefined!')
    end
    ui_message('ui.traffic.spawnLimit', 5, 'traffic', 'traffic')
    return false
  end

  return true
end

local function setupTrafficWaitForUi(usePolice) -- this is called from the radial menu and displays a loading screen
  spawnProcess.amount = -1
  spawnProcess.policeRatio = usePolice and 0.333 or 0
  spawnProcess.waitForUi = true
  setTrafficVars({aiMode = 'traffic', enableRandomEvents = true})
  guihooks.trigger('menuHide')
  guihooks.trigger('app:waiting', true) -- shows the loading icon
end

local function setupCustomTraffic(amount, params) -- spawns a group of vehicles for traffic, with custom parameters
  if type(params) ~= 'table' then params = {} end
  if not amount or amount < 0 then amount = getAmountFromSettings() end
  params.country = params.country or getCountry()

  spawnTraffic(amount, core_multiSpawn.createGroup(amount, params))
end

-- spawns and de-spawns traffic vehicles in freeroam
-- keepInMemory allows instantenous reactivation at the expense of ram consumption when traffic is disabled
local function toggle(keepInMemory)
  if core_gamestate.state.state == 'freeroam' then
    if state == 'off' then
      setupTraffic(getAmountFromSettings())
    elseif state == 'on' then
      if keepInMemory then
        if vars.activeAmount == 0 then
          vars.activeAmount = getAmountFromSettings() -- value is set directly to allow for the next line to override the default behavior
          updateTrafficPool()
        else
          vars.activeAmount = 0
          updateTrafficPool()
          for id, veh in pairs(traffic) do
            veh._teleportDist = 0
          end
        end
      else
        deleteVehicles()
      end
    end
  end
end

local function freezeState() -- stops the traffic and parking systems, and returns the state data
  return M.onSerialize(), gameplay_police.onSerialize(), gameplay_parking.onSerialize()
end

local function unfreezeState(trafficData, policeData, parkingData) -- reverts the traffic and parking systems
  if not trafficData and not parkingData then
    log('W', logTag, 'No data provided to revert state!')
    return
  end
  if trafficData then
    M.onDeserialized(trafficData)
    scatterTraffic()
  end
  if policeData then
    gameplay_police.onDeserialized(policeData)
  end
  if parkingData then
    gameplay_parking.onDeserialized(parkingData)
  end
end

local function doTraffic(dt, dtSim) -- various logic for traffic; also handles when to respawn traffic
  if not vehPool then createTrafficPool() end

  if not player.camPos then
    player.camPos, player.camDirVec = vec3(), vec3()
  end

  player.camPos:set(core_camera.getPosition())
  player.camDirVec:set(core_camera.getForward())
  player.pos = map.objects[be:getPlayerVehicleID(0)] and map.objects[be:getPlayerVehicleID(0)].pos or player.camPos

  local vehCount = 0
  for i, id in ipairs(trafficIdsSorted) do -- ensures consistent order of vehicles
    vehCount = vehCount + 1
    local veh = traffic[id]
    if veh then
      local obj = be:getObjectByID(id)
      veh.playerData = player
      veh:onUpdate(dt, dtSim)

      if veh.isAi and obj:getActive() then
        if veh.state == 'reset' then
          veh:onRefresh()

          if vars.enableRandomEvents and vars.aiMode == 'traffic' and veh.respawnCount > 0 then
            veh.role:tryRandomEvent()
          end
        end

        if i == queuedVehicle then -- checks one vehicle per frame, as an optimization
          if veh._teleport then
            forceTeleport(id, nil, nil, veh._teleportDist)
          else
            if veh.state == 'active' then
              veh:tryRespawn(#trafficAiVehsList)
            elseif veh.state == 'queued' then
              processNextSpawn(id)
            end
          end

          veh.otherCollisionFlag = nil
        end
      end
    end
  end

  queuedVehicle = queuedVehicle + 1
  if queuedVehicle > vehCount then
    queuedVehicle = 1
  end

  if respawnTicks > 0 then
    respawnTicks = respawnTicks - 1 -- optimization to prevent rapid succession of respawning vehicles
  end
end

local function doDebug() -- general debug visuals
  for id, veh in pairs(traffic) do
    local obj = be:getObjectByID(id)
    if obj:getActive() then
      local lineColor = veh.camVisible and debugColors.green or debugColors.white
      local txtColor = debugColors.white
      local bgColor = veh.isPlayerControlled and debugColors.greenAlt or debugColors.blackAlt
      if veh.state == 'fadeIn' then lineColor = debugColors.red end

      if veh.debugLine then
        local focusPos = vec3(veh.focusPos)
        local z = be:getSurfaceHeightBelow((focusPos + vecUp * 4))

        if z >= -1e6 then
          focusPos.z = z
        elseif core_terrain.getTerrain() then
          focusPos.z = core_terrain.getTerrainHeight(focusPos)
        end

        debugDrawer:drawLine(veh.pos, player.camPos + player.camDirVec - vecUp, lineColor)
        debugDrawer:drawSphere(focusPos, 0.25, debugColors.green)
      end

      if veh.debugText then
        debugDrawer:drawTextAdvanced(veh.pos, String('['..veh.id..']: '..math.floor(veh.distCam)..' m, '..math.floor((veh.speed or 0) * 3.6)..' km/h'), txtColor, true, false, bgColor)
        if veh.pursuit.mode ~= 0 then
          debugDrawer:drawTextAdvanced(veh.pos, String('[PURSUIT]: mode = '..veh.pursuit.mode..', score = '..math.ceil(veh.pursuit.score)..', offenses = '..veh.pursuit.uniqueOffensesCount), txtColor, true, false, bgColor)
        end
      end
    end
  end
end

local function onSettingsChanged()
  for id, veh in pairs(traffic) do
    if veh.isAi then
      be:getObjectByID(id).uiState = core_settings_settings.getValue('trafficMinimap') and 1 or 0
      be:getObjectByID(id).playerUsable = settings.getValue('trafficEnableSwitching') and true or false
    end
  end
end

local function trackAIAllVeh(mode) -- triggers when the player sets an AI mode for all vehicles
  vars.aiMode = string.lower(mode)
  refreshVehicles()
end

local function onVehicleMapmgrUpdate(id) -- when the latest spawned vehicle processes its mapmgr, complete the spawning process
  if vehPool and spawnProcess.vehList and spawnProcess.vehList[#spawnProcess.vehList] == id then
    if not worldLoaded then
      worldLoaded = true
    end

    if spawnProcess.waitForUi then
      guihooks.trigger('app:waiting', false)
      guihooks.trigger('QuickAccessMenu')
    end
    table.clear(spawnProcess)
    vehPool._updateFlag = true
  end
end

local function onVehicleGroupSpawned(vehList, groupId, groupName)
  if groupName == 'autoParking' then
    if not spawnProcess.trafficSetup then
      if spawnProcess.waitForUi then
        guihooks.trigger('app:waiting', false)
        guihooks.trigger('QuickAccessMenu')
      end
      table.clear(spawnProcess)
    end
  end

  if groupName == 'autoTraffic' then
    spawnProcess.vehList = vehList
    activate(spawnProcess.vehList)
  end
end

local function onUpdate(dtReal, dtSim)
  if state == 'loading' then
    spawnTraffic(spawnProcess.amount, spawnProcess.group)
  end

  -- these hooks activate the frame after the first or last traffic vehicle gets inserted or removed
  if state ~= 'on' and trafficAiVehsList[1] then
    extensions.hook('onTrafficStarted')
  end
  if state == 'on' and not trafficAiVehsList[1] then
    extensions.hook('onTrafficStopped')
  end

  if state == 'on' then
    if vehPool and vehPool._updateFlag and not spawnProcess.vehList then
      updateTrafficPool()
      vehPool._updateFlag = nil
    end

    if M.queueTeleport then
      scatterTraffic()
      M.queueTeleport = false
    end
    if be:getEnabled() and not freeroam_bigMapMode.bigMapActive() then
      doTraffic(dtReal, dtSim)
    end
  end
end

local function onPreRender(dt)
  if M.debugMode then
    doDebug()
  end
end

local function onTrafficStarted()
  setMapData()
  state = 'on'
  vehPool._updateFlag = true -- acts like a frame delay for the vehicle pooling system

  if gameplay_walk.isWalking() then -- check for player unicycle
    checkPlayer(be:getPlayerVehicleID(0))
  end
  for _, veh in ipairs(getAllVehiclesByType()) do -- check for player vehicles to insert into traffic
    checkPlayer(veh:getId())
  end

  local n1, n2 = map.findClosestRoad(core_camera.getPosition())
  if n1 then
    local link = mapNodes[n1].links[n2] or mapNodes[n2].links[n1]
    if link and link.type == 'private' and link.oneWay and min(mapNodes[n1].radius, mapNodes[n2].radius) >= 5 then
      vars.enablePrivateRoads = true -- special feature that enables AI to drive on racetracks
    end
  end
end

local function onTrafficStopped()
  deleteTrafficPool()
  table.clear(traffic)
  table.clear(trafficAiVehsList)
  table.clear(player)
  state = 'off'
end

local function onClientStartMission()
  if state == 'off' then
    worldLoaded = true
  end
end

local function onClientEndMission()
  onTrafficStopped()
  resetTrafficVars()
  worldLoaded = false
end

local function onUiWaitingState()
  if spawnProcess.waitForUi and not spawnProcess.trafficSetup and not spawnProcess.parkingSetup then
    if settings.getValue('trafficParkedVehicles') then
      spawnProcess.parkingSetup = gameplay_parking.setupVehicles(nil, {checkParkingSpots = true})
    else
      spawnProcess.parkingSetup = false
    end
    spawnProcess.trafficSetup = setupTraffic(spawnProcess.amount, spawnProcess.policeRatio)

    if not spawnProcess.trafficSetup and not spawnProcess.parkingSetup then -- if there is nothing to spawn, reset the waiting UI
      table.clear(spawnProcess)
      guihooks.trigger('app:waiting', false)
      guihooks.trigger('QuickAccessMenu')
      state = 'off'
    end
  end
end

local function onSerialize()
  local trafficData = {}
  for _, veh in pairs(traffic) do
    table.insert(trafficData, veh:onSerialize())
  end
  local data = {state = state, traffic = deepcopy(trafficData), vars = deepcopy(vars)}
  onTrafficStopped()
  mapNodes, mapRules = nil, nil
  return data
end

local function onDeserialized(data)
  worldLoaded = true
  vars = data.vars
  if data.state == 'on' then
    for _, veh in pairs(data.traffic) do
      insertTraffic(veh.id, not veh.isAi)
      if traffic[veh.id] then
        traffic[veh.id]:onDeserialized(veh)
      end
    end
    updateTrafficPool()
  end
end

---- getter functions ----

local function getState() -- returns traffic system state
  return state
end

local function getTrafficPool()
  return core_vehiclePoolingManager and core_vehiclePoolingManager.getPoolById(vehPoolId) -- returns current vehicle pool object used for traffic
end

local function getTrafficAiVehsList(override) -- returns traffic list of ids
  if override then
    local list = {}
    for _, v in ipairs(getAllVehicles()) do
      if v.isTraffic == 'true' then
        table.insert(list, v:getId())
      end
    end
    return list
  else
    return trafficAiVehsList
  end
end

local function getTrafficData() -- returns the full traffic table
  return traffic
end

local function getTrafficVars()
  return vars
end

-- public interface
M.spawnTraffic = spawnTraffic
M.setupTraffic = setupTraffic
M.setupTrafficWaitForUi = setupTrafficWaitForUi
M.createTrafficGroup = createTrafficGroup
M.createPoliceGroup = createPoliceGroup
M.setupCustomTraffic = setupCustomTraffic
M.insertTraffic = insertTraffic
M.removeTraffic = removeTraffic
M.deleteVehicles = deleteVehicles
M.activate = activate
M.deactivate = deactivate
M.toggle = toggle
M.refreshVehicles = refreshVehicles

M.getRandomPaint = getRandomPaint
M.forceTeleport = forceTeleport
M.forceTeleportAll = scatterTraffic
M.scatterTraffic = scatterTraffic
M.findSpawnPoint = findSpawnPoint
M.getRoleConstructor = getRoleConstructor
M.setPursuitMode = setPursuitMode
M.setDebugMode = setDebugMode
M.getTrafficPool = getTrafficPool
M.getTrafficVars = getTrafficVars
M.setTrafficVars = setTrafficVars
M.setActiveAmount = setActiveAmount
M.getIdealSpawnAmount = getIdealSpawnAmount

M.getState = getState
M.freezeState = freezeState
M.unfreezeState = unfreezeState
M.getNumOfTraffic = getNumOfTraffic
M.getTrafficList = getTrafficAiVehsList
M.getTrafficData = getTrafficData
M.getTraffic = getTrafficData

M.onUpdate = onUpdate
M.onPreRender = onPreRender
M.trackAIAllVeh = trackAIAllVeh
M.onSettingsChanged = onSettingsChanged
M.onVehicleMapmgrUpdate = onVehicleMapmgrUpdate
M.onVehicleSpawned = onVehicleSpawned
M.onVehicleSwitched = onVehicleSwitched
M.onVehicleResetted = onVehicleResetted
M.onVehicleDestroyed = onVehicleDestroyed
M.onVehicleActiveChanged = onVehicleActiveChanged
M.onVehicleGroupSpawned = onVehicleGroupSpawned
M.onTrafficStarted = onTrafficStarted
M.onTrafficStopped = onTrafficStopped
M.onClientStartMission = onClientStartMission
M.onClientEndMission = onClientEndMission
M.onUiWaitingState = onUiWaitingState
M.onSerialize = onSerialize
M.onDeserialized = onDeserialized

return M
