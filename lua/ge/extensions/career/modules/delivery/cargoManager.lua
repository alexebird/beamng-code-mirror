-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local im = ui_imgui
local ffi = require('ffi')
local debugActive = false
M.dependencies = {"freeroam_facilities"}

local cargoLocationsChangedThisFrame = false

local allCargo = {}
local database
M.onCareerModulesActivated = function()
  database = career_modules_delivery_logisticDataBaseManager
end

local function norm(value, min, max)
  return (value - min) / (max - min);
end

M.addCargo = function(cargo)
  table.insert(allCargo, cargo)
  extensions.hook("onCargoGenerated", cargo)
end

M.sameLocationCargo = function(cargo, otherLoc)
  return M.sameLocation(cargo.location, otherLoc)
end

M.sameLocation = function(a, b)

  local same = true
  for k, v in pairs(a) do
    same = same and a[k] == b[k]
  end
  return same
end

M.changeCargoLocation = function(cargoId, newLocation, markTransient)
  cargoLocationsChangedThisFrame = true
  if not newLocation or not next(newLocation) then
    log("E","","Trying to set location to nil or empty! " .. dumps(cargoId) .. " -> ".. dumps(newLocation))
  end
  for _, it in ipairs(allCargo) do
    if it.id == cargoId then
      if markTransient then
        if not it.transient then
          it._preTransientLocation = deepcopy(it.location)
        end
      end
      it.location = newLocation
      if markTransient then
        it.transient = not M.sameLocation(it.origin, newLocation)
      end

      if M.sameLocation(it.destination, newLocation) then
        it.data.delivered = true
      end
    end
  end
end

local allvehiclesWithCargo = {}
local smoothnessTemplate = {
  lastPos = nil,
  lastVel = nil,
  lastAcc = nil,
  fwd = vec3(),
  smootherAcc = nil,
  smootherJer = nil,
  veh = nil,
  up = vec3(),
  currPos = vec3(),
  currVel = vec3(),
  currAcc = vec3(),
  currJer = vec3(),
  smAcc = nil,
  jer = nil,
  smJer = nil,
  smoothValue = nil,
}
local isFragileCargoInVehicles = false
M.clearTransientFlags = function()
  for _, it in ipairs(allCargo) do
    -- transient items need to have a setup when they are loaded for the first time into a car
    if it.transient then
      if not it.loadedAtTimeStamp and it.location.type == "vehicle" then
        it.loadedAtTimeStamp = database.time()
        for _, d in ipairs(it.modifiers) do
          if d.type == "timed" then
            d.expirationTimeStamp = database.time() + d.deliveryTime
            d.definitiveExpirationTimeStamp = database.time() + d.deliveryTime + d.paddingTime
          elseif d.type == "fragile" then
            allvehiclesWithCargo[it.location.vehId] = deepcopy(smoothnessTemplate)
            isFragileCargoInVehicles = true
          end
        end
      end
    end
    it.transient = nil
    it._preTransientLocation = nil
  end
end

M.undoTransientCargo = function()
  for _, it in ipairs(allCargo) do
    if it.transient then
      it.location = it.origin
      it.transient = nil
    end
  end
end


M.getAllCargoCustomFilter = function(filter, ...)
  local ret = {}
  for _, cargo in ipairs(allCargo) do
    if filter(cargo, ...) then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getAllCargoForLocation = function(loc)
  return M.getAllCargoCustomFilter(M.sameLocationCargo, loc)
end

M.getAllCargoForLocationUnexpired = function(loc)
  local ret = {}
  for _, cargo in ipairs(allCargo) do
    if M.sameLocation(cargo.location, loc) and cargo.offerExpiresAt > database.time() then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getUndeliveredAllCargoForLocationUnexpired = function(loc, timeExpire, timeGenerated)
  local ret = {}
  for _, cargo in ipairs(allCargo) do
    if    M.sameLocation(cargo.location, loc)
      and not M.sameLocation(cargo.location, cargo.destination)
      and cargo.offerExpiresAt > (timeExpire or database.time())
      and cargo.generatedAtTimestamp <= (timeGenerated or math.huge) then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getAllCargoForDestinationStillAtOriginUnexpired = function(loc, timeExpire, timeGenerated)
  local ret = {}
  for _, cargo in ipairs(allCargo) do

    if    M.sameLocation(cargo.destination, loc)
      and M.sameLocation(cargo.location, cargo.origin)
      and cargo.offerExpiresAt > (timeExpire or database.time())
      and cargo.generatedAtTimestamp <= (timeGenerated or math.huge) then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getAllCargoForDestinationFacilityStillAtOriginUnexpired = function(facId)
  local ret = {}
  for _, cargo in ipairs(allCargo) do
    if    cargo.destination.facId == facId
      and M.sameLocation(cargo.location, cargo.origin)
      and cargo.offerExpiresAt > database.time() then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getAllCargoAtFacilityUnexpired = function(facId)
  local ret = {}
  for _, cargo in ipairs(allCargo) do
    if    M.sameLocation(cargo.location, cargo.origin)
      and cargo.location.facId == facId
      and cargo.offerExpiresAt > database.time() then
      table.insert(ret, cargo)
    end
  end
  return ret
end

M.getLocationLabelShort = function(loc)
  if loc.type == "facilityParkingspot" then
    return string.format("%s",
      database.getFacilityById(loc.facId).name)
      --career_modules_delivery_logisticDataBaseManager.getParkingSpotByPath(loc.psPath).name)
  elseif loc.type == "vehicle" then
    if be:getPlayerVehicleID(0) == loc.vehId then
      return string.format("Current Vehicle (%d)", loc.vehId)
    else
      return string.format("Other Vehicle (%d)", loc.vehId)
    end
  elseif loc.type == "playerAvatar" then
    return "Player Avatar"
  else
    return "Unknown"
  end
end

M.getLocationLabelLong = function(loc)
  if loc.type == "facilityParkingspot" then
    local ps = database.getParkingSpotByPath(loc.psPath)
    return string.format("%s - %s",
      database.getFacilityById(loc.facId).name,
      ps.customFields:get("name") or ps.id)
  elseif loc.type == "vehicle" then
    if be:getPlayerVehicleID(0) == loc.vehId then
      return string.format("Current Vehicle (%d)", loc.vehId)
    else
      return string.format("Other Vehicle (%d)", loc.vehId)
    end
  elseif loc.type == "playerAvatar" then
    return "Player Avatar"
  else
    return "Unknown"
  end
end

M.getLocationCoordinates = function(loc)
  if loc.type == "facilityParkingspot" then
    local ps = database.getParkingSpotByPath(loc.psPath)
    if ps then return ps.pos end
  elseif loc.type == "vehicle" then
    local veh = scenetree.findObjectById(loc.vehId)
    if veh then return veh:getPosition() end
  end
end


M.getCargoById = function(cargoId)
  for _, c in ipairs(allCargo) do
    if c.id == cargoId then
      return c
    end
  end
end

M.checkDeliveredCargo = function()
  --TODO check per modifier if modifier is available before/after rewards, if then unlocked, display message
  local facilityStatus = {}
  for _, fac in ipairs(database.getFacilities()) do
    facilityStatus[fac.id] = {
      visible = database.isFacilityVisible(fac.id),
      unlocked = database.isFacilityUnlocked(fac.id)
    }
  end
  local delivered = {}
  for _, c in ipairs(allCargo) do
    if M.sameLocation(c.destination, c.location) then
      table.insert(delivered, c)
    end
  end
  if not next(delivered) then return end

  local fragileCargoStillInVehicle = false
  for _, c in ipairs(allCargo) do
    if c.location.type == "vehicle" then
      for _,v in ipairs(c.modifiers) do
        if v.type == "fragile" then
          fragileCargoStillInVehicle = true
        end
      end
    end
  end
  if not fragileCargoStillInVehicle then
    allvehiclesWithCargo = nil
    allvehiclesWithCargo = {}
    isFragileCargoInVehicles = false
  end

  local sumChange = {}
  local penaltyMessages = {}
  for _, c in ipairs(delivered) do
    c.location = {type = "delete"}
    for key, amount in pairs(c.rewards) do
      --Apply the modifiers to the money reward
      if #c.modifiers > 0 then
        local normalizedPenalty = 0
        for _,v in ipairs(c.modifiers) do
          if v.type == "timed" then
            local penaltyForTime = 0
            if v.expirationTimeStamp and v.definitiveExpirationTimeStamp then
              penaltyForTime = 0.1 + norm(database.time(), v.expirationTimeStamp, v.definitiveExpirationTimeStamp)*0.5
            end
            if v.definitiveExpirationTimeStamp and database.time() >= v.definitiveExpirationTimeStamp then
              penaltyForTime = 0.8
            end
            normalizedPenalty = clamp(normalizedPenalty + penaltyForTime, 0, 0.9)
            if penaltyForTime > 0 then
              penaltyMessages["time"] = true
            end
          elseif v.type == "fragile" then
            local penaltyForFragile = 0
            if v.currentHealth < 90 then
              penaltyForFragile = norm(v.currentHealth, 100, 0)*0.5
            end
            if v.currentHealth <= 0 then
              penaltyForFragile = 0.8
            end
            normalizedPenalty = clamp(normalizedPenalty + penaltyForFragile, 0, 0.9)
            if penaltyForFragile > 0 then
              penaltyMessages["fragile"] = true
            end
          end
        end
        local newAmount = lerp(amount, 0, normalizedPenalty)
        if newAmount < amount then
          if key == "money" then
            amount = newAmount
          elseif key == "beamXP" and normalizedPenalty > 0 then
            amount = 0
          else
            amount = round(newAmount)
          end
        end
      end
      sumChange[key] = (sumChange[key] or 0) + amount
      career_modules_playerAttributes.addAttribute(key, amount, {noLog=true})
    end
    local cargoDestFacility = database.getFacilityById(c.destination.facId)
    cargoDestFacility.progress.itemsDeliveredToHere.count = cargoDestFacility.progress.itemsDeliveredToHere.count + 1
    cargoDestFacility.progress.itemsDeliveredToHere.moneySum = cargoDestFacility.progress.itemsDeliveredToHere.moneySum + (sumChange.money or 0)

    local cargoOrigFacility = database.getFacilityById(c.origin.facId)
    cargoOrigFacility.progress.itemsDeliveredFromHere.count = cargoOrigFacility.progress.itemsDeliveredFromHere.count + 1
    cargoOrigFacility.progress.itemsDeliveredFromHere.moneySum = cargoOrigFacility.progress.itemsDeliveredFromHere.moneySum + (sumChange.money or 0)



  end

  if next(sumChange) then
    local label = "Reward for delivering " ..(#delivered == 1 and "Item " or "Items ").. "to " .. M.getLocationLabelLong(delivered[1].destination) ..": "
    local counts = {}
    for _, c in ipairs(delivered) do
      counts[c.name] = (counts[c.name] or 0) + 1
    end
    local itemsList = {}
    for _, name in ipairs(tableKeysSorted(counts)) do
      table.insert(itemsList, (counts[name] == 1 and "" or (counts[name].."x ")) .. name)
    end
    career_modules_playerAttributes.logAttributeChange(sumChange, {isGameplay = true, isDelivery=true, label=label .. table.concat(itemsList, ", ")})
    --TODO: Display a penalty Message
    guihooks.trigger('Message',{clear = nil, ttl = 10 + #delivered, msg = string.format("Delivered %s for a total of %0.2f$.",table.concat(itemsList, ", "), sumChange.money), category = "delivery", icon = "local_shipping"})
    extensions.hook("onCargoDelivered", delivered, sumChange)
    if penaltyMessages["time"] then
      guihooks.trigger('Message',{clear = nil, ttl = 10 + #delivered, msg = "One or more Items were deliverd too late and your reward was reduced.", category = "deliveryTimed", icon = "warning"})
    end
    if penaltyMessages["fragile"] then
      guihooks.trigger('Message',{clear = nil, ttl = 10 + #delivered, msg = "One or more fragile items were damaged and your reward was reduced.", category = "deliveryFragile", icon = "warning"})
    end
  end
  Engine.Audio.playOnce('AudioGui', 'event:>UI>Career>Buy_01')

  -- check facility unlocking status
  local unlockedFacilitesIds = {}
  for id, status in pairs(facilityStatus) do
    if not status.unlocked and database.isFacilityUnlocked(id) then
      unlockedFacilitesIds[id] = true
    end
  end

  for _, id in ipairs(tableKeysSorted(unlockedFacilitesIds)) do
    career_modules_logbook.deliveryFacilityUnlocked(id)
    guihooks.trigger('Message',{clear = nil, ttl = 10, msg = string.format("You can now deliver items from %s!",database.getFacilityById(id).name), category = "deliveryUnlock"..id, icon = "local_shipping"})
  end

  gameplay_rawPois.clear()
end

local accMult, jerkMult = 0.03, 6
local debugFragile = false
local function getVehiclesSmoothnessValues(dtSim)
  if dtSim < 10e-10 then
    return
  end

  -- Assuming you have vectors for position, forward, and up
  for vehId,vehData in pairs(allvehiclesWithCargo) do
    if not vehData.veh then
      vehData.veh = scenetree.findObjectById(vehId)

    end
    if not vehData.veh then
      log("E","","The vehicle ID: " .. vehId .. " is not in the scene, the calculations for the fragile will not be done.")
      return
    end
    vehData.oobb = vehData.veh:getSpawnWorldOOBB()

    vehData.currPos:set(vehData.oobb:getPoint(0))
    vehData.currPos:setAdd(vehData.oobb:getPoint(3))
    vehData.currPos:setAdd(vehData.oobb:getPoint(4))
    vehData.currPos:setAdd(vehData.oobb:getPoint(7))
    vehData.currPos:setScaled(0.25)

    if vehData.lastPos then
      vehData.currVel:set(vehData.currPos)
      vehData.currVel:setSub(vehData.lastPos)
      vehData.currVel:setScaled(1/dtSim)
    else
      vehData.currVel = vec3()
    end
    if vehData.lastVel then
      vehData.currAcc:set(vehData.currVel)
      vehData.currAcc:setSub(vehData.lastVel)
      vehData.currAcc:setScaled(1/dtSim)
    else
      vehData.currAcc = vec3()
    end
    if vehData.lastAcc then
      vehData.currJer:set(vehData.currAcc)
      vehData.currJer:setSub(vehData.lastAcc)
      vehData.currJer:setScaled(1/dtSim)
    else
      vehData.currJer = vec3()
    end

    --simpleDebugText3d("Pos", vehData.currPos, 0.25,  ColorF(1,0,0,0.5))
    --simpleDebugText3d("Acc", vehData.currPos + vehData.currAcc*0.05, 0.25,  ColorF(0,1,0,0.5))
    --simpleDebugText3d("Jer", vehData.currPos + vehData.currJer*0.002, 0.25,  ColorF(0,0,1,0.5))

    vehData.smootherAcc = vehData.smootherAcc or newTemporalSmoothing(20, 20)
    vehData.smAcc = vehData.smootherAcc:getUncapped(vehData.currAcc:length(), dtSim)

    if not vehData.smootherJer then vehData.smootherJer = newTemporalSmoothing(15, 50) end
    vehData.jer = vehData.currJer:length() / 5000
    vehData.smJer = vehData.smootherJer:getUncapped(vehData.jer, dtSim)
    if vehData.smJer > 2 then vehData.smootherJer:set(2) vehData.smJer = 2 end

    vehData.lastPos = vehData.lastPos or vec3()
    vehData.lastVel = vehData.lastVel or vec3()
    vehData.lastAcc = vehData.lastAcc or vec3()

    vehData.lastPos:set(vehData.currPos)
    vehData.lastVel:set(vehData.currVel)
    vehData.lastAcc:set(vehData.currAcc)

    vehData.smoothValue = vehData.smAcc * accMult + vehData.smJer * jerkMult

    if debugFragile then
      local str = string.format("smVal: %0.2f  ", vehData.smoothValue)
      for i = 0, (vehData.smAcc * accMult)*10 do
        str = str .. "A"
      end
      str = str .. " "
      for i = 0, (vehData.smJer * jerkMult)*10 do
        str = str .. "J"
      end
      log(vehData.smoothValue > 0.5 and "E" or "I", "", str)
    end
  end

end

local lastFrameTime = -1
local fragileSmoothMultiplier = 6
local function checkModifiers(dtSim)
  local secondsChanged = math.floor(database.time()) ~= math.floor(lastFrameTime)
  --if secondsChanged then print("SC") end
  for _,item in ipairs(allCargo) do
    if item.location.type == "vehicle" and not item.transient then
      if #item.modifiers > 0 then
        for _,v in ipairs(item.modifiers) do
          if v.type == "timed"then
            if v.expirationTimeStamp - database.time() <= 0 and v.definitiveExpirationTimeStamp - database.time() > 0 and not v.timeMessageFlag then
              v.timeMessageFlag = true
              guihooks.trigger('Message',{clear = nil, ttl = 10, msg = string.format("Delivery of %s to %s is now delayed.",item.name, M.getLocationLabelLong(item.destination)), category = "delivery", icon = "warning"})
            elseif v.definitiveExpirationTimeStamp - database.time() <= 0 and not v.paddingTimeMessageFlag then
              v.paddingTimeMessageFlag = true
              guihooks.trigger('Message',{clear = nil, ttl = 10, msg = string.format("Delivery of %s to %s is now late.",item.name, M.getLocationLabelLong(item.destination)), category = "delivery", icon = "warning"})
            end
          elseif v.type == "fragile" then
            for k, vData in pairs(allvehiclesWithCargo) do
              if k == item.location.vehId then
                if vData.smoothValue then
                  local diff = vData.smoothValue - v.sensitivity

                  if diff > 0 then
                    v.currentHealth = math.max(v.currentHealth - (diff * dtSim) * fragileSmoothMultiplier, 0)
                  end
                end
              end
            end
          end
        end
        if secondsChanged then
          career_modules_delivery_deliveryManager.updateTasklistForCargoId(item.id)
        end
      end
    end
  end
  lastFrameTime = database.time()
end


M.sendCargoToTasklist = function()
  career_modules_delivery_deliveryManager.sendCargoToTasklist()
end

local offerDeletionDelay = 120
M.cleanUpCargo = function()
  local newCargo = {}
  local deletedCount = 0
  for _, cargo in ipairs(allCargo) do
    if   cargo.location.type == "delete"
      or M.sameLocation(cargo.location, cargo.origin) and cargo.offerExpiresAt < database.time() - offerDeletionDelay then
      deletedCount = deletedCount + 1
    else
      table.insert(newCargo, cargo)
    end
  end
  if deletedCount > 0 then
    allCargo = newCargo
    log("I","","Deleted " .. deletedCount .. " cargo entries.")
  end
end


local function onUpdate(dtReal, dtSim, dtRaw)
  profilerPushEvent("Delivery CargoManager")
  if debugActive then
    M.drawDebugMenu()
  end

  if isFragileCargoInVehicles then
    getVehiclesSmoothnessValues(dtSim)
  end


  checkModifiers(dtSim)



  if cargoLocationsChangedThisFrame then
    M.sendCargoToTasklist()
    M.cleanUpCargo()
  end
  cargoLocationsChangedThisFrame = false
  profilerPopEvent("Delivery CargoManager")
end

local distanceCache = {}
M.ensureCargoDistanceAndRewards = function(item)
  if item.rewards then return end

  local distanceKey = string.format("%s-%s-%s-%s", item.origin.facId, item.origin.psPath, item.destination.facId, item.destination.psPath)
  distanceCache[distanceKey] = distanceCache[distanceKey] or database.distanceBetween(M.getLocationCoordinates(item.origin), M.getLocationCoordinates(item.destination))
  local distance = distanceCache[distanceKey]

  item.data.originalDistance = distance
  local template = deepcopy(database.getTemplateById(item.templateId))
  local modifiers = database.generateModifiers(item.groupSeed, template, distance) or {}
  item.modifiers = deepcopy(modifiers)
  item.rewards = {
    money = database.calcMoneyForCargoItem(item, distance),
    beamXP = 5 + round(distance/1000) + #item.modifiers,
    labourer = 1 + round(distance/2000) + #item.modifiers,
    delivery = 5 + round(distance/1000) + #item.modifiers
  }

end


---------------------



local function secondsToClock(seconds)
  local seconds = tonumber(seconds)

  if seconds <= 0 then
    return "00:00";
  else
    local mins = string.format("%02.f", math.floor(seconds/60));
    local secs = string.format("%02.f", math.floor(seconds - mins *60));
    return mins..":"..secs
  end
end

local facilityToDraw = "all"
local function drawDebugMenu()
  if not database then return end
  if im.Begin("Delivery Debug") then
    local tableFlags = bit.bor(im.TableFlags_Resizable,im.TableFlags_RowBg,im.TableFlags_Borders)
    if im.Button("Unlock All Modifiers") then
        database.unlockTimedDeliveries()
        database.unlockFragileDeliveries()
        database.unlockTimedFragileDeliveries()

    end
    if im.Button("Open Cargo Menu without Facility") then
      career_modules_delivery_deliveryManager.enterCargoOverviewScreen(nil, nil)
    end
    im.Text("Delivery Time: %s", secondsToClock(database.time()))
    if im.BeginCombo("Facility", facilityToDraw) then
      if im.Selectable1("All Facilities", facilityToDraw == 'all') then
        facilityToDraw = "all"
      end
      im.Separator()
      for _, facility in ipairs(database.getFacilities()) do
        if im.Selectable1(facility.name .. '##'..facility.id, facility.id == facilityToDraw) then
          facilityToDraw = facility.id
        end
      end
      im.EndCombo()
    end
    if next(allCargo) then
      for _, facility in ipairs(database.getFacilities()) do
        if facilityToDraw == facility.id or facilityToDraw == "all" then
          im.PushStyleColor2(im.Col_PlotHistogram, im.ImVec4(0.6, 0.5, 0.25, 0.8))
          local cargo = M.getAllCargoAtFacilityUnexpired(facility.id)
          local inCargo = M.getAllCargoForDestinationFacilityStillAtOriginUnexpired(facility.id)
          table.sort(cargo, function(a,b) return a.offerExpiresAt < b.offerExpiresAt end)
          table.sort(inCargo, function(a,b) return a.offerExpiresAt < b.offerExpiresAt end)
          im.BeginTable("facilities", 4, tableFlags)
          im.TableNextColumn()
          im.Text("Name")
          im.TableNextColumn()
          im.Text("Current Cargo")
          im.TableNextColumn()
          im.Text("New Cargo in")
          im.TableNextColumn()
          im.Text("Actions")
          im.TableNextColumn()
          im.PushFont3("cairo_semibold_large")
          im.TextColored(im.ImVec4(1,0.6,0,8,0.75),facility.name)
          im.PopFont()
          im.TableNextColumn()
          im.Text(string.format("Out: %d / %d | In: %d ", #cargo, facility.logisticMaxItems, #inCargo))
          im.TableNextColumn()

          if database.isFacilityVisible(facility.id) then
            im.TextColored(im.ImVec4(0,1,0,0.75),"Visible ")
          else
            im.TextColored(im.ImVec4(1,0,0,0.75),"Invisible ")
          end
          im.SameLine()
          if database.isFacilityUnlocked(facility.id) then
            im.TextColored(im.ImVec4(0,1,0,0.75),"Unlocked ")
          else
            im.TextColored(im.ImVec4(1,0,0,0.75),"Locked ")
          end

          im.TableNextColumn()
          if im.Button("Clear##"..facility.id) then
            for _, item in ipairs(cargo) do
              item.offerExpiresAt = database.time()-1
            end
          end

          im.TableNextColumn()
          im.Text(string.format("Prog Out: %d (%0.2f$)", facility.progress.itemsDeliveredFromHere.count, facility.progress.itemsDeliveredFromHere.moneySum))
          im.TableNextColumn()
          im.Text(string.format("Prog In: %d (%0.2f$)", facility.progress.itemsDeliveredToHere.count, facility.progress.itemsDeliveredToHere.moneySum))
          im.TableNextColumn()

          for _, generator in ipairs(facility.logisticGenerators) do

            im.ProgressBar(((generator.nextGenerationTimestamp - database.time())/generator.interval), im.ImVec2(100,im.GetTextLineHeight()),string.format("%s", secondsToClock(generator.nextGenerationTimestamp - database.time())))
            im.SameLine()
            im.Text(dumps(generator.type) .. " => " .. table.concat(generator.logisticTypes, ", "))
          end
          im.TableNextColumn()
          for i, generator in ipairs(facility.logisticGenerators) do
            if im.Button("Generate##"..facility.id..i) then
              database.triggerGenerator(facility, generator)
            end
          end


          im.EndTable()
          if next(cargo) then

            im.BeginTable("cargo", 9, tableFlags)
            im.TableNextColumn()
            im.Text("Id")
            im.TableNextColumn()
            im.Text("Name")
            im.TableNextColumn()
            im.Text("Slots")
            im.TableNextColumn()
            im.Text("Expires In")
            im.TableNextColumn()
            im.Text("Destination")
            im.TableNextColumn()
            im.Text("Distance")
            im.TableNextColumn()
            im.Text("Rewards")
            im.TableNextColumn()
            im.Text("Actions")
            im.TableNextColumn()
            im.Text("Modifiers")

            for _, item in ipairs(cargo) do
              M.ensureCargoDistanceAndRewards(item)
              --local expired = item.offerExpiresAt - database.time() < 0
              --if expired or item.data.delivered then im.BeginDisabled() end

              im.TableNextColumn()
              im.Text(""..item.id.." "..item.generatorLabel)
              im.TableNextColumn()
              im.Text(item.name)
              im.TableNextColumn()
              im.Text(string.format("%d %s", item.slots, item.type))
              im.TableNextColumn()

              im.ProgressBar(clamp((item.offerExpiresAt - database.time())/120,0,1), im.ImVec2(100,im.GetTextLineHeight()), string.format("%s",secondsToClock(item.offerExpiresAt - database.time())))
              im.TableNextColumn()
              im.Text(M.getLocationLabelLong(item.destination))
              im.TableNextColumn()
              im.Text(string.format("%0.1fkm", item.data.originalDistance/1000))
              im.TableNextColumn()
              local rewards = {}
              for _, key in ipairs(career_branches.orderAttributeKeysByBranchOrder(tableKeys(item.rewards or {}))) do
                table.insert(rewards, key=="money" and string.format("%0.2f$",item.rewards[key]) or string.format("%s: %d", key, item.rewards[key]))
              end
              im.TextWrapped(table.concat(rewards, " | "))
              im.TableNextColumn()
              if im.Button("X##"..item.id) then
                item.offerExpiresAt = database.time() - 1
              end
              im.SameLine()
              if im.Button("Extend##"..item.id) then
                item.offerExpiresAt = item.offerExpiresAt + 300
              end
              im.SameLine()
              if im.Button("Deliver##"..item.id) then
                M.changeCargoLocation(item.id, item.destination)
                M.checkDeliveredCargo()
              end
              local modifiers = {}
              im.TableNextColumn()
              if item.modifiers and #item.modifiers > 0 then
                for _, data in ipairs(item.modifiers) do
                  if data.type =="timed" then
                    table.insert(modifiers, string.format("Delivery Timer: %0.2f, Padding Timer: %0.2f",data.deliveryTime, data.paddingTime))
                  elseif data.type == "fragile" then
                    table.insert(modifiers, string.format("Health: %0.2f, Sensitivity: %0.2f.", data.currentHealth, data.sensitivity))
                  end
                end
              end
              im.TextWrapped(table.concat(modifiers, " | "))
            end
            im.EndTable()
          end
          im.PopStyleColor()

          if next(inCargo) then

            im.BeginTable("cargoIn", 8, tableFlags)
            im.TableNextColumn()
            im.Text("Id")
            im.TableNextColumn()
            im.Text("Name")
            im.TableNextColumn()
            im.Text("Slots")
            im.TableNextColumn()
            im.Text("Expires In")
            im.TableNextColumn()
            im.Text("Origin")
            im.TableNextColumn()
            im.Text("Distance")
            im.TableNextColumn()
            im.Text("Rewards")
            im.TableNextColumn()
            im.Text("Actions")
            im.PushStyleColor2(im.Col_PlotHistogram, im.ImVec4(0.6, 0.30, 0.45, 0.8))
            for _, item in ipairs(inCargo) do
              M.ensureCargoDistanceAndRewards(item)
              --local expired = item.offerExpiresAt - database.time() < 0
              --if expired or item.data.delivered then im.BeginDisabled() end

              im.TableNextColumn()
              im.Text(""..item.id.." "..item.generatorLabel)
              im.TableNextColumn()
              im.Text(item.name)
              im.TableNextColumn()
              im.Text(string.format("%d %s", item.slots, item.type))
              im.TableNextColumn()

              im.ProgressBar(clamp((item.offerExpiresAt - database.time())/120,0,1), im.ImVec2(100,im.GetTextLineHeight()), string.format("%s",secondsToClock(item.offerExpiresAt - database.time())))
              im.TableNextColumn()
              im.Text(M.getLocationLabelLong(item.origin))
              im.TableNextColumn()
              im.Text(string.format("%0.1fkm", item.data.originalDistance/1000))
              im.TableNextColumn()
              local rewards = {}
              for _, key in ipairs(career_branches.orderAttributeKeysByBranchOrder(tableKeys(item.rewards or {}))) do
                table.insert(rewards, key=="money" and string.format("%0.2f$",item.rewards[key]) or string.format("%s: %d", key, item.rewards[key]))
              end

              im.TextWrapped(table.concat(rewards, " | "))
              im.TableNextColumn()
              if im.Button("X##"..item.id) then
                item.offerExpiresAt = database.time() - 1
              end
              im.SameLine()
              if im.Button("Extend##"..item.id) then
                item.offerExpiresAt = item.offerExpiresAt + 300
              end
              im.SameLine()
              if im.Button("Deliver##"..item.id) then
                M.changeCargoLocation(item.id, {type = "delivered"})
                M.checkDeliveredCargo()
              end
              --if expired or item.data.delivered then im.EndDisabled() end
            end
            im.EndTable()
            im.PopStyleColor()
          end
          im.Dummy(im.ImVec2(1,1))
          im.Separator()
          im.Dummy(im.ImVec2(1,1))
        end
      end
    end
    im.End()
  end
end

M.onUpdate = onUpdate
M.drawDebugMenu = drawDebugMenu
return M