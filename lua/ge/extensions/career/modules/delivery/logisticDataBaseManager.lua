-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

M.dependencies = {"freeroam_facilities", "gameplay_sites_sitesManager"}
local facilities = {}
local deliveryGameTime = 0
local im = ui_imgui
local debugEnabled = false

local progress = {
  itemsDeliveredTotal = 0,
  timedFlag = false,
  fragileFlag = false,
  timedFragileFlag = false,
  rewardFromAllDeliveries = {},
  faciliesDelivered = {},
  timedDeliveries = 0,
  fragileDeliveries = 0,

  onTimeDeliveries = 0,
  delayedDeliveries = 0,
  lateDeliveries = 0,

  noDamageDeliveries = 0,
  damagedDeliveries = 0,
  brokenDeliveries = 0,
}

local deliveriesNecessary = 10
local timedDeliveriesNecessary = 10
local fragileDeliveriesNecessary = 10

local timedModifierRewardsIncrease = 1.3
local fragileModifierRewardsIncrease = 1.7

local randomFromList = function(list)
  arrayShuffle(list)
  return list[1] or nil
end

local saveFile = "logisticsDatabase.json"
local loadData = {}
local function loadSaveData()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  local data = (savePath and jsonReadFile(savePath .. "/career/"..saveFile)) or {}

  loadData = data or {}
  progress = loadData.progress or {
    itemsDeliveredTotal = 0,
    timedFlag = false,
    fragileFlag = false,
    timedFragileFlag = false,
    rewardFromAllDeliveries = {},
    faciliesDelivered = {},
    timedDeliveries = 0,
    fragileDeliveries = 0,

    onTimeDeliveries = 0,
    delayedDeliveries = 0,
    lateDeliveries = 0,

    noDamageDeliveries = 0,
    damagedDeliveries = 0,
    brokenDeliveries = 0,
  }
  loadData.facilities = loadData.facilities or {}

  deliveryGameTime = loadData.general and loadData.general.gameTime or deliveryGameTime
  if loadData.general and loadData.general.osTime then
    log("I","",string.format("Save data age: %ds",os.time() - loadData.general.osTime))
    -- delete save data if the save is older than an hour
    if os.time() - loadData.general.osTime > 3600 then
      log("I","",string.format("Save data is older than 3600s (%d), wiping cargo and facility timers",os.time() - loadData.general.osTime))
      loadData.cargo = {}
      for key, fac in pairs(loadData.facilities) do
        fac.logisticGenerators = nil
      end
    end
  else
  end


  --log("I","",string.format("Loaded save data for logistics: %d cargo", #loadData.cargo))
end
M.loadSaveData = loadSaveData

local function onSaveCurrentSaveSlot(currentSavePath)
  local filePath = currentSavePath .. "/career/" .. saveFile
  local saveData = {
    general = {},
    penalty = career_modules_delivery_deliveryManager.getDeliveryModePenalty(),
    cargo = {},
    facilities = {},
  }

  -- general data
  saveData.general.gameTime = M.time()
  saveData.general.osTime = os.time()
  saveData.progress = progress

  -- cargo data
  local saveableCargo = career_modules_delivery_cargoManager.getAllCargoCustomFilter(
    function(cargo)
      return cargo.offerExpiresAt > M.time()
         and cargo.location.type == "facilityParkingspot"
    end
  )
  local maxGroupId = 0
  local groupMap = {}
  for _, cargo in ipairs(saveableCargo) do
    local elem = {
      rewards = cargo.rewards,
      templateId = cargo.templateId,
      name = cargo.name,
      type = cargo.type,
      slots = cargo.slots,
      offerExpiresAt = cargo.offerExpiresAt,
      location = cargo.location,
      origin = cargo.origin,
      destination = cargo.destination,
      data = cargo.data,
      generatorLabel = cargo.generatorLabel,
      modifiers = cargo.modifiers,
      generatedAtTimestamp = cargo.generatedAtTimestamp,
      weight = cargo.weight,
      groupSeed = cargo.groupSeed,
    }
    if not groupMap[cargo.groupId] then
      maxGroupId = maxGroupId + 1
      groupMap[cargo.groupId] = maxGroupId
    end
    elem.groupId = groupMap[cargo.groupId]
    table.insert(saveData.cargo, elem)
  end
  saveData.general.maxGroupId = maxGroupId

  -- facility data
  for _, facility in ipairs(facilities) do
    local elem = {
      logisticGenerators = {},
      progress = facility.progress,
    }
    for i, generator in ipairs(facility.logisticGenerators or {}) do
      elem.logisticGenerators[i] = {
        nextGenerationTimestamp = generator.nextGenerationTimestamp
      }
    end
    saveData.facilities[facility.id] = elem
  end

  -- save the data to file
  jsonWriteFile(filePath, saveData, true)
end
M.onSaveCurrentSaveSlot = onSaveCurrentSaveSlot

local facilitiesById = {}
local parkingSpotsByPath = {}

local function selectFacilityByLookupKeyByType(typeLookup, typeLookupKey, originId)
  --dump("find from " .. originId)
  local validFacs = {}
  --dump(typesLookup)
  for _, fac in ipairs(facilities) do
    if fac.id ~= originId then
      local match = false
      --dump(fac.logisticTypeLookup)
      for key, _ in pairs(typeLookup) do
        match = match or fac[typeLookupKey][key]
      end
      if match then
        table.insert(validFacs, fac)
      end
    end
  end
  return randomFromList(validFacs)
end


local tmpVec = vec3()
local distanceBetween = function(posA, posB)
  local name_a,_,distance_a = map.findClosestRoad(posA)
  local name_b,_,distance_b = map.findClosestRoad(posB)
  if not name_a or not name_b then return 1 end
  local path = map.getPath(name_a, name_b)
  local d = 0
  for i = 1, #path-1 do
    tmpVec:set(   map.getMap().nodes[path[i  ]].pos)
    tmpVec:setSub(map.getMap().nodes[path[i+1]].pos)
    d = d + tmpVec:length()
  end
  d = d + distance_a + distance_b
  return d
end
M.distanceBetween = distanceBetween

local itemTemplates = nil
local templatesById = {}
local function getDeliveryItemTemplates()
  if not itemTemplates then
    itemTemplates = {}
    local levelInfo = core_levels.getLevelByName(getCurrentLevelIdentifier())
    local files = FS:findFiles(levelInfo.dir.."/facilities/delivery/", '*.deliveryItems.json', -1, false, true)
    for _,file in ipairs(files) do
      for k, v in pairs(jsonReadFile(file) or {}) do
        local item = v
        item.id = k
        item.type = item.cargoType
        item.logisticTypesLookup = tableValuesAsLookupDict(item.logisticTypes)
        --item.generationChance = 1
        item.duplicationChanceSum = 0
        item.duplicationChance = item.duplicationChance or {1}
        for _, chance in ipairs(item.duplicationChance or {}) do
          item.duplicationChanceSum = item.duplicationChanceSum + chance
        end

        item.weight = item.weight or 10
        -- make weight into a table to pick random ones later
        if type(item.weight) ~= "table" then
          item.weight = {item.weight}
        end

        if type(item.slots) ~= "table" then
          item.slots = {item.slots}
        end
        table.sort(item.slots)
        item.minSlots = item.slots[1]
        item.maxSlots = item.slots[#item.slots]

        table.insert(itemTemplates, item)
        templatesById[item.id] = item
        item.modChance = item.modChance or {}
        item.modChance.timed = item.modChance.timed or 0.3
        item.modChance.fragile = item.modChance.fragile or 0.125
        --item.modChance.timedFragile = item.modChance.timedFragile or 0.12
      end
    end
    log("I","",string.format("Loaded %d item templates from %d files.", #tableKeys(itemTemplates), #files))
  end
  return itemTemplates
end

local function getTemplateById(templateId)
  return templatesById[templateId]
end
M.getTemplateById = getTemplateById


local function createGeneratorTemplateCache(generator)
  generator.validTemplates = {}
  generator.sumChance = 0
  for _, item in ipairs(getDeliveryItemTemplates()) do
    local match = false
    --dump(fac.logisticTypeLookup)
    for key, _ in pairs(generator.logisticTypesLookup) do
      match = match or item.logisticTypesLookup[key]
    end
    if generator.slotsMin and item.minSlots < generator.slotsMin then
      match = false
    end
    if generator.slotsMax and item.maxSlots > generator.slotsMax then
      match = false
    end
    if match then
      table.insert(generator.validTemplates, {item = item, chance = item.generationChance})
      generator.sumChance = generator.sumChance + item.generationChance
    end
  end
--[[
  print(generator.name)
  for _, item in ipairs(generator.validTemplates) do
--    print(string.format(" - %02d%% %s",100 * item.chance / generator.sumChance, item.item.id))
    for amount, amountChance in ipairs(item.item.duplicationChance) do
      print(string.format(" - %02d%% Group of %d %s (%s slots)",100 * item.chance / generator.sumChance * amountChance / item.item.duplicationChanceSum, amount, item.item.id, table.concat(item.item.slots, ", ")))
    end
  end
]]
end

local function getDeliveryItemTemplateFor(generator)
  local r = math.random() * generator.sumChance

  local sum = 0
  for _, item in ipairs(generator.validTemplates) do
    sum = sum + item.chance
    if sum >= r then
      return deepcopy(item.item)
    end
  end
end


local cargoMoneyMultiplier = 1
local function calcMoneyForCargoItem(item, distance)
  local basePrice = math.sqrt(item.slots) / 4
  local distanceExp = 1 + math.sqrt(item.slots)/100
  local pricePerM = 5 + math.pow(item.weight, 0.9)
  local modMultiplier = 0.9 + 0.1 * #item.modifiers
  for _, mod in ipairs(item.modifiers) do
    modMultiplier = modMultiplier * (mod.moneyMultipler or 1)
  end

  return ((basePrice) + math.pow(distance/1000, distanceExp) * pricePerM) * cargoMoneyMultiplier * modMultiplier, basePrice, pricePerM
end
M.calcMoneyForCargoItem = calcMoneyForCargoItem

local function calcOfferExpiration(deliveryItem)

  return M.time() + deliveryItem.offerDuration * (0.9+math.random()*0.2)
end

local function getDuplicateAmount(template)
  if not template.duplicationChance then return 1 end

  local r = math.random() * template.duplicationChanceSum
  local sum = 0
  for amount, chance in ipairs(template.duplicationChance) do
    sum = sum + chance
    if sum >= r then
      return amount
    end
  end
end

--Templates for the modifiers
local timedTemplate = { type = "timed" }
local fragileTemplate = { type = "fragile" }

local function calculateTimedModifier(distance, modAmount)
  local r = math.random()+1
  return (distance / 13) + (modAmount * 30 * r)
end

local modifierProbability = 1
local function generateModifiers(groupSeed, template, distance)
  local mods = {}
  math.randomseed(groupSeed)
  --[[if not progress.timedFlag then
    -- no modifiers
  else
    if not progress.fragileFlag then
      -- only roll for timed
      if r <= template.modChance.timed then table.insert(mods, timedTemplate) end
    else
      if not progress.timedFragileFlag then
          -- roll for timed and fragile separately
        if r <= template.modChance.timed then
          table.insert(mods, deepcopy(timedTemplate))
        elseif r <= template.modChance.timed + template.modChance.fragile then
          table.insert(mods, deepcopy(fragileTemplate))
        end
      else
        ]]
        local r = math.random()
        if r <= template.modChance.timed then
          table.insert(mods, deepcopy(timedTemplate))
        end
        r = math.random()
        if r <= template.modChance.fragile then
          table.insert(mods, deepcopy(fragileTemplate))
        end
        --elseif r <= template.modChance.timed + template.modChance.fragile + template.modChance.timedFragile then
        --  table.insert(mods, deepcopy(timedTemplate))
        --  table.insert(mods, deepcopy(fragileTemplate))
        --end
      --end
    --end
  --end

  -- initialize modifiers
  for _,modData in pairs(mods) do
    if modData.type == "timed" then
      modData.deliveryTime = calculateTimedModifier(distance, #mods)
      modData.paddingTime = modData.deliveryTime * 0.2 --For now we will do a 20% of the delivery time as a padding time
      modData.timeMessageFlag = false
      modData.paddingTimeMessageFlag = false
      modData.moneyMultipler = timedModifierRewardsIncrease
    elseif modData.type == "fragile" then
      modData.currentHealth = 100.5
      modData.sensitivity = 0.5
      modData.fragileMessageFlag = false
      modData.moneyMultipler = fragileModifierRewardsIncrease
    end
  end

  return mods
end
M.generateModifiers = generateModifiers

local cargoId = 0
local groupId = 0
local minDeliveryDistance, maxDeliveryDistance = 300, math.huge
local distanceCache = {}
local function generateItemWithDuplicates(template, origin, destination, timeOffset, generatorLabel)

  --if distance < (template.minDeliveryDistance or minDeliveryDistance)
  --   or distance > (template.maxDeliveryDistance or maxDeliveryDistance) then
  --  return 0
  --end
  profilerPushEvent("Duplicate Item")
  local offerExpiresAt = calcOfferExpiration(template) + timeOffset

  local item = {
    templateId = template.id,
    name = randomFromList(template.names),
    type = template.cargoType,
    slots = randomFromList(template.slots),
    offerExpiresAt = offerExpiresAt,
    data = {
      delivered = false,
      --deliveryGameTime = 0
    },
    location = deepcopy(origin),
    origin = deepcopy(origin),
    destination = deepcopy(destination),
    generatorLabel = generatorLabel,
    weight = randomFromList(template.weight) * (math.random()*0.2 + 0.9),
    generatedAtTimestamp = M.time() + timeOffset,
    groupSeed = round(math.random()*1000000)
  }



  local duplicateAmount = getDuplicateAmount(template)
  groupId = groupId + 1
  for d = 1, duplicateAmount do
    local copy = deepcopy(item)
    cargoId = cargoId + 1
    copy.id = cargoId
    copy.groupId = groupId
    career_modules_delivery_cargoManager.addCargo(copy)
    --table.insert(allCargo, copy)
  end
  profilerPopEvent("Duplicate Item")
  return duplicateAmount
end



local function triggerGenerator(fac, generator, timeOffset)
  profilerPushEvent("Generator: " .. generator.name)
  timeOffset = timeOffset or 0
  -- ignore item count for now
  -- which items are already at this facility? only count items still available!
  --local itemsAtFacility = career_modules_delivery_cargoManager.getAllCargoCustomFilter(function(cargo) return cargo.location.facId == fac.id and cargo.offerExpiresAt > M.time() end)

  -- how many new items should be generated?
  local typeAmount = math.random(generator.min, generator.max)
  -- limit the amount of items to the max amount for this facility
  --if #itemsAtFacility + typeAmount > fac.logisticMaxItems then
  --  typeAmount = fac.logisticMaxItems - #itemsAtFacility
  --end
  --log("D","",string.format("Setup Cargo Items: Generating %d items of the type %s at %s facility. %d already available", typeAmount, type, fac.name, #itemsAtFacility))
  -- proceed only if items are to be generated.
  if typeAmount > 0 then
    local remainingAttempts = 100
    for i = 1, typeAmount do
      -- generate locations and template
      local template = getDeliveryItemTemplateFor(generator)

      if not template then
        log("E","","No Template! " .. dumps(generator.logisticTypesLookup))
        for _, item in ipairs(getDeliveryItemTemplates()) do
          dump(item.id, item.logisticTypesLookup)
        end
        return
      else

        local origin, destination
        profilerPushEvent("Origin and Destination")
        if generator.type == "provider" then
          local originPs = randomFromList(fac.pickUpSpots)
          origin = {type = "facilityParkingspot", facId = fac.id, psPath = originPs:getPath()}

          local destinationFac = selectFacilityByLookupKeyByType(template.logisticTypesLookup, "logisticTypesReceivedLookup", fac.id)
          local destinationPs = randomFromList(destinationFac.dropOffSpots)
          destination = {type = "facilityParkingspot", facId = destinationFac.id, psPath = destinationPs:getPath()}
        elseif generator.type == "receiver" then
          local destinationPs = randomFromList(fac.dropOffSpots)
          destination = {type = "facilityParkingspot", facId = fac.id, psPath = destinationPs:getPath()}

          local originFac = selectFacilityByLookupKeyByType(template.logisticTypesLookup, "logisticTypesProvidedLookup", fac.id)
          local originPs = randomFromList(originFac.pickUpSpots)
          origin = {type = "facilityParkingspot", facId = originFac.id, psPath = originPs:getPath()}

        end
        profilerPopEvent("Origin and Destination")
        local itemsGeneratedAmount = generateItemWithDuplicates(template, origin, destination, timeOffset, generator.name)
        typeAmount = typeAmount + (itemsGeneratedAmount - 1)
      end
      remainingAttempts = remainingAttempts - 1
      if remainingAttempts <= 0 then
        log("E","","Could not generate items after 100 tries: " .. fac.id.. " -> " .. dumps(generator))
        return
      end
    end
  end
  profilerPopEvent("Generator: " .. generator.name)
end

M.triggerGenerator = triggerGenerator

local facilitiesSetup = false
M.setupFacilities = function()
  if not facilitiesSetup then
    for _, fac in ipairs(freeroam_facilities.getFacilitiesByType("deliveryProvider")) do
      --print("Loading " .. fac.name)
      local sites = gameplay_sites_sitesManager.loadSites(fac.sitesFile)
      fac.pickUpSpots = {}
      for _, name in ipairs(fac.pickUpSpotNames) do
        local ps = sites.parkingSpots.byName[name]
        if ps then
          table.insert(fac.pickUpSpots, ps)
          parkingSpotsByPath[ps:getPath()] = ps
        else
          log("E","missing parking spot: " .. name)
        end
      end
      fac.dropOffSpots = {}
      for _, name in ipairs(fac.dropOffSpotNames) do
        local ps = sites.parkingSpots.byName[name]
        if ps then
          table.insert(fac.dropOffSpots, ps)
          parkingSpotsByPath[ps:getPath()] = ps
        else
          log("E","missing parking spot: " .. name)
        end
      end

      fac.progress = {
        itemsDeliveredFromHere = {
          count = 0,
          moneySum = 0
        },
        itemsDeliveredToHere = {
          count = 0,
          moneySum = 0
        }
      }

      if loadData.facilities and loadData.facilities[fac.id] and loadData.facilities[fac.id].progress then
        fac.progress = loadData.facilities[fac.id].progress
      end

      --fac.logisticCreationTime = M.time()
      --fac.logisticExpirationTime = M.time() + fac.logisticsGenerationTimer
      fac.logisticMaxItems = fac.logisticMaxItems or -1
      fac.logisticGenerators = fac.logisticGenerators or {}
      for i, generator in ipairs(fac.logisticGenerators) do
        generator.nextGenerationTimestamp = M.time() + (generator.interval) * math.random()
        if loadData.facilities and loadData.facilities[fac.id] and loadData.facilities[fac.id].logisticGenerators and loadData.facilities[fac.id].logisticGenerators[i] then
          generator.nextGenerationTimestamp = loadData.facilities[fac.id].logisticGenerators[i].nextGenerationTimestamp
        end
        generator.logisticTypesLookup = tableValuesAsLookupDict(generator.logisticTypes)
        generator.name = string.format("%s %d %s %d", fac.name, i, generator.type, generator.interval)
        createGeneratorTemplateCache(generator)
      end

      fac.logisticTypesProvidedLookup = tableValuesAsLookupDict(fac.logisticTypesProvided)
      fac.logisticTypesReceivedLookup = tableValuesAsLookupDict(fac.logisticTypesReceived)

      table.insert(facilities, fac)
      facilitiesById[fac.id] = fac
    end
    table.sort(facilities, function(a,b)
      return translateLanguage(a.name, a.name, true) < translateLanguage(b.name, b.name, true)end)
    log("I","",string.format("Setup Logistics Facilities: %d Facilities, %d Parking spots", #tableKeys(facilitiesById), #tableKeys(parkingSpotsByPath)))
    facilitiesSetup = true
  end
end

local function generateInitialCargo()
  loadSaveData()
  map.assureLoad()
  M.setupFacilities()

  -- use the existing cargo if its there
  if loadData.cargo and next(loadData.cargo) then
    cargoId = 0
    log("I","","Loading Cargo from file... " .. #loadData.cargo)
    for _, cargo in ipairs(loadData.cargo) do
      cargoId = cargoId + 1
      cargo.id = cargoId
      career_modules_delivery_cargoManager.addCargo(cargo)
    end
    groupId = loadData.general.maxGroupId + 1
  else
    -- otherwise, generate some new cargo
    for _,fac in ipairs(facilities) do
      for _, generator in ipairs(fac.logisticGenerators) do
        for i = 0, round(240/generator.interval) do
          triggerGenerator(fac, generator, -generator.interval*i)
        end
      end
    end
  end
end

local function onCareerModulesActivated(alreadyInLevel)
  if alreadyInLevel then
    generateInitialCargo()
  end
end
M.onCareerModulesActivated = onCareerModulesActivated

local function onClientStartMission(levelPath)
  generateInitialCargo()
end
M.onClientStartMission = onClientStartMission



-- onTimeDeliveries = 0,
-- delayedDeliveries = 0,
-- lateDeliveries = 0,

-- noDamageDeliveries = 0,
-- damagedDeliveries = 0,
-- brokenDeliveries = 0,
--database.time(), v.expirationTimeStamp, v.definitiveExpirationTimeStamp


M.unlockTimedDeliveries = function()
  --guihooks.trigger('Message',{clear = nil, ttl = 15, msg = "", category = "timedUnlock", icon = "local_shipping"})
  guihooks.trigger("toastrMsg", {type="success", title="Modifier Unlocked", msg="Urgent cargo is now available for deliveries! Received 1 Bonus Star."})
  career_modules_playerAttributes.addAttribute("bonusStars",1,{isGameplay = true, isDelivery=true, label="Unlocked Urgent Cargo Modifier."})
  progress.timedFlag = true
end

M.unlockFragileDeliveries = function()
  --guihooks.trigger('Message',{clear = nil, ttl = 15, msg = "Precious cargo is now aviable for deliveries! Received 1 Bonus Star.", category = "fragileUnlock", icon = "local_shipping"})
  guihooks.trigger("toastrMsg", {type="success", title="Modifier Unlocked", msg="Precious cargo is now available for deliveries! Received 1 Bonus Star."})
  career_modules_playerAttributes.addAttribute("bonusStars",1,{isGameplay = true, isDelivery=true, label="Unlocked Precious Cargo Modifier."})
  progress.fragileFlag = true
end

M.unlockTimedFragileDeliveries = function()
  --guihooks.trigger('Message',{clear = nil, ttl = 15, msg = "Urgent precious cargo is now aviable for deliveries! Received 1 Bonus Star.", category = "timedFragileUnlock", icon = "local_shipping"})
  guihooks.trigger("toastrMsg", {type="success", title="Modifier Unlocked", msg="Urgent precious cargo is now available for deliveries! Received 1 Bonus Star."})
  career_modules_playerAttributes.addAttribute("bonusStars",1,{isGameplay = true, isDelivery=true, label="Unlocked Urgent and Precious Cargo Modifier."})
  progress.timedFragileFlag = true
end

M.isTimedDeliveriesUnlocked = function() return progress.timedFlag end
M.isFragileDeliveriesUnlocked = function() return progress.fragileFlag end
M.isTimedFragileDeliveriesUnlocked = function() return progress.timedFragileFlag end

M.onCargoDelivered = function(items, sumChange)
  for key, amount in pairs(sumChange) do
    progress.rewardFromAllDeliveries[key] = (progress.rewardFromAllDeliveries[key] or 0) + amount
  end
  progress.itemsDeliveredTotal = progress.itemsDeliveredTotal + #items
  for _, v in ipairs(items) do
    progress.faciliesDelivered[v.destination.facId] = true
    if #v.modifiers > 0 then
      for _, m in ipairs(v.modifiers) do
        if m.type == "fragile" then
          progress.fragileDeliveries = progress.fragileDeliveries + 1
          if m.currentHealth and m.currentHealth >= 90 then
            progress.noDamageDeliveries = progress.noDamageDeliveries + 1
          elseif m.currentHealth and m.currentHealth > 0 and m.currentHealth < 90 then
            progress.damagedDeliveries = progress.damagedDeliveries + 1
          elseif m.currentHealth and m.currentHealth <= 0 then
            progress.brokenDeliveries = progress.brokenDeliveries + 1
          end
        elseif m.type == "timed" then
          progress.timedDeliveries = progress.timedDeliveries + 1
          if m.expirationTimeStamp and M.time() < m.expirationTimeStamp then
            progress.onTimeDeliveries = progress.onTimeDeliveries + 1
          elseif m.expirationTimeStamp and m.definitiveExpirationTimeStamp and M.time() > m.expirationTimeStamp and M.time() < m.definitiveExpirationTimeStamp then
            progress.delayedDeliveries = progress.delayedDeliveries + 1
          elseif m.definitiveExpirationTimeStamp and M.time() > m.definitiveExpirationTimeStamp then
            progress.lateDeliveries = progress.lateDeliveries + 1
          end
        end
      end
    end
  end

  if not progress.timedFlag and progress.itemsDeliveredTotal >= deliveriesNecessary then
    M.unlockTimedDeliveries()
  end
  if not progress.fragileFlag and progress.onTimeDeliveries >= timedDeliveriesNecessary then
    M.unlockFragileDeliveries()
  end
  if not progress.timedFragileFlag and progress.noDamageDeliveries >= fragileDeliveriesNecessary then
    M.unlockTimedFragileDeliveries()
  end
end

M.setDebugProgress = function (key, value)
  progress[key] = value
end


local fast = 1
local logTimer = 1
local lastLogTimer = 0
M.onUpdate = function(dtReal, dtSim, dtRaw)
  profilerPushEvent("Delivery logisticsDatabase")
  if debugEnabled then M.drawDebugMenu() end

  if freeroam_bigMapMode.bigMapActive() and not freeroam_bigMapMode.isTransitionActive() then
    deliveryGameTime = deliveryGameTime + dtReal * fast
  else
    deliveryGameTime = deliveryGameTime + dtSim * fast
  end
  --[[
  if math.floor(deliveryGameTime/logTimer) ~= math.floor(lastLogTimer/logTimer) then
    print("---")
    for _, fac in ipairs(facilities) do
      local itemsAtFacility = career_modules_delivery_cargoManager.getAllCargoCustomFilter(
          function(cargo)
            return cargo.location.facId == fac.id
            and cargo.offerExpiresAt > deliveryGameTime
            --and cargo.generatedAtTimestamp <= cargoOverviewMaxTimeTimestamp
          end)
      local moneySum = 0
      for _, item in ipairs(itemsAtFacility) do
        moneySum = item.rewards.money + moneySum
      end
      print(string.format("%s: %02d items worth %0.2f", fac.name, #itemsAtFacility, moneySum))
    end
  end
  lastLogTimer = deliveryGameTime
  ]]

  if loadData.penalty and loadData.penalty > 0 then
    --ui_message(string.format("Penalty for abandoning cargo: %0.2f$", loadData.penalty),10, "exitDeliveryMode", "warning")
    guihooks.trigger("toastrMsg", {type="warning", title="Cargo abandoned", msg=string.format("Cargo from last save was abandoned. Penalty: %0.2f$", loadData.penalty)})
    log("I","",string.format("Penalty for abandoning cargo: %0.2f$", loadData.penalty))
    career_modules_playerAttributes.addAttribute("money", -loadData.penalty, {isGameplay = true, label="Penalty for abandoning cargo."})
    loadData.penalty = nil
  end

  for _, fac in ipairs(facilities or {}) do
    for _, generator in ipairs(fac.logisticGenerators) do
      if generator.nextGenerationTimestamp - M.time() <= 0 then
        generator.nextGenerationTimestamp = M.time() + generator.interval
        M.triggerGenerator(fac, generator)
      end
    end
  end
  profilerPopEvent("Delivery logisticsDatabase")
end

M.drawDebugMenu = function()
  if not itemTemplates then return end
  if im and im.Begin("Cargo Comparison") then
    local distances = {0.1, 0.5, 1, 2, 3, 4}
    local tableFlags = bit.bor(im.TableFlags_Resizable,im.TableFlags_RowBg,im.TableFlags_Borders)
    im.BeginTable("templates", 8+#distances, tableFlags)
    im.TableNextColumn()
    im.Text("Id")
    im.TableNextColumn()
    im.Text("Name(s)")
    im.TableNextColumn()
    im.Text("Slots")
    im.TableNextColumn()
    im.Text("Weights")
    im.TableNextColumn()
    im.Text("Rarity")
    im.TableNextColumn()
    im.Text("Worth")
    im.TableNextColumn()
    im.Text("Base")
    im.TableNextColumn()
    im.Text("perKm")
    for _, d in ipairs(distances) do
      im.TableNextColumn()
      im.Text(string.format("%0.1fkm", d ))
    end

    for _, template in ipairs(getDeliveryItemTemplates()) do
      local _, base, perM = calcMoneyForCargoItem(item, 0)
      im.TableNextColumn()
      im.Text(template.id)
      im.TableNextColumn()
      for _, n in ipairs(template.names) do
        im.Text(n)
      end
      im.TableNextColumn()
      im.Text(string.format("%d %s", table.concat(template.slots,", "), template.type))
      im.TableNextColumn()
      im.Text(table.concat(template.weight, " "))
      im.TableNextColumn()
      im.Text(string.format("%0.1f",template.rarity))
      im.TableNextColumn()
      im.Text(string.format("%0.1f",template.worth))
      im.TableNextColumn()
      im.Text(string.format("%0.2f$",base*cargoMoneyMultiplier))
      im.TableNextColumn()
      im.Text(string.format("%0.2f$",perM*cargoMoneyMultiplier))

      for _, d in ipairs(distances) do
        im.TableNextColumn()
        local money  = calcMoneyForCargoItem(item, d*1000)
        im.Text(string.format("%0.2f$", money ))
      end
    end
    im.EndTable()

    im.End()
  end
end

M.getLocationCoordinates = function(loc)
  if loc.type == "facilityParkingspot" then
    local ps = M.getParkingSpotByPath(loc.psPath)
    if ps then return ps.pos end
  elseif loc.type == "vehicle" then
    local veh = scenetree.findObjectById(loc.vehId)
    if veh then return veh:getPosition() end
  end
end

M.time = function() return deliveryGameTime end



M.isFacilityUnlocked = function(facId)
  local fac = facilitiesById[facId]
  if not fac.unlockCondition then
    return true
  end
  if fac.unlockCondition.type == "minItemCount" then
    local val = fac.progress.itemsDeliveredToHere.count
    local tgt = fac.unlockCondition.target
    if val >= tgt then
      return true
    else
      return false, {
        disabledReasonHeader = "Facility not yet unlocked!",
        disabledReasonContent = string.format("Deliver %d Items here to be able to deliver from here.",tgt),
        progress = {
          {type="progressBar",minValue=0,maxValue=tgt,currValue=val, label=string.format("%d / %d Items delivered.", val, tgt)}
        }
      }
    end
  elseif fac.unlockCondition.type == "branchLevel" then
    --[[
    local branchId = fac.unlockCondition.branchId
    local branchInfo = career_branches.getBranchById(branchId)
    local currentXp = career_modules_playerAttributes.getAttribute(branchId).value or -1
    local currLevel  = career_branches.getBranchLevel(branchId)

    local targetLevel = quest.questTypeData.level
    local minXp = branchInfo.levels[targetLevel-1].requiredValue
    local maxXp = branchInfo.levels[targetLevel  ].requiredValue

    if currentXp >= maxXp then
      quest.userData.progressTimestamp = os.time()
      career_modules_questManager.addCompleteQuest(quest)
      currentXp = maxXp
    end
    if currentXp < minXp then
      -- quest shouldnt be active?
      log("E","","This quest shouldnt be active...")
    end

    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = targetLevel, branch = branchInfo.name}}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={level = currLevel, branch = branchInfo.name}}
    quest.description = {txt = "quest.type."..questType..".description", context = {branch = branchInfo.name, branchDescription = branchInfo.description}}
    quest.logbookFile = branchInfo.questCover
    quest.tempData.progress = { {
      type = "progressBar",
      minValue = minXp,
      currValue = currentXp,
      maxValue = maxXp,
      label = {txt = "quest.type."..questType..".progressBarLabel", context={maxXp = maxXp, currentXp = currentXp, branch = branchInfo.name}},
      done = currentXp >= maxXp,
      }
    }
    ]]
  end
  return true
end

M.isFacilityVisible = function(facId)
  local fac = facilitiesById[facId]
  if not fac.visibleCondition then
    return true
  end
  if fac.visibleCondition.type == "minItemCount" then
    local val = fac.progress.itemsDeliveredToHere.count
    local tgt = fac.unlockCondition.target
    if val >= tgt then
      return true
    else
      return false
    end
  end
  return true
end

M.getFacilities = function()
  return facilities
end

M.getFacilityById = function(id) return facilitiesById[id] end
M.getParkingSpotByPath = function(path) return parkingSpotsByPath[path] end


--logbook integration


-- logbook integration
local function onLogbookGetEntries(list)

  local facTable = {
    headers = {'Name','Delivered from here','Delivered to here'},
    rows = {}
  }

  local unlockedCount, providingFacilitiesCount = 0, 0
  local totalItems, totalMoney
  for _, fac in ipairs(M.getFacilities()) do
    if M.isFacilityUnlocked(fac.id) then
      unlockedCount = unlockedCount +1
    end
    if next(fac.logisticTypesProvided) then
      providingFacilitiesCount = providingFacilitiesCount + 1
    end
    if M.isFacilityVisible(fac.id) and (fac.progress.itemsDeliveredFromHere.count > 0 or fac.progress.itemsDeliveredToHere.count > 0 or (M.isFacilityUnlocked(fac.id) and next(fac.logisticTypesProvided))) then
      table.insert(facTable.rows,{
        fac.name,
        fac.progress.itemsDeliveredFromHere.count > 0
          and string.format("%d Items, %0.2f$",fac.progress.itemsDeliveredFromHere.count, fac.progress.itemsDeliveredFromHere.moneySum)
          or "-",

        fac.progress.itemsDeliveredToHere.count > 0
        and string.format("%d Items, %0.2f$",fac.progress.itemsDeliveredToHere.count, fac.progress.itemsDeliveredToHere.moneySum)
        or "-"
      }
      )
    end
  end

  local facText = string.format('<span>Below is an overview of all facilities you have delivered an item to or from.</span><ul><li>You have <b>unlocked %d/%d facilities</b> that send out cargo. To unlock a facility and be able to deliver items for them, first deliver an item there.</li><li>You delivered a total of <b>%d items</b> and earned a total of <b>%0.2f$</b> with deliveries. You can see a more detailled list of delivered items in the Delivery History.</li></ul>',unlockedCount, providingFacilitiesCount, progress.itemsDeliveredTotal or 0, progress.rewardFromAllDeliveries.money or 0 )

  local formattedFacilities = {
    entryId = "deliveryFacilities",
    type = "progress",
    cardTypeLabel = "ui.career.poiCard.generic",
    title = "Delivery Facilities",
    text = facText,
    time = os.time()-2,
    hideInRecent = true,
    tables = {facTable}
  }
  table.insert(list, formattedFacilities)


  local gameplayText = '<span>Below is an overview of all rewards earned from Deliveries.</span><ul><li><b>Money</b> can be used to purchase vehicles, vehicle parts, repairs, towing and more.</li><li><b>Beam XP</b> is a measure of your overall general progress, but has no use in game currently.</li><li><b>Labourer XP</b> accumulates as you progress through labourer branch gameplay challenges.</li><li><b>Delivery XP</b> is a skill-specific points system within the laborer branch, not yet in use, it will be used to track progression and unlock gameplay.</li></ul>'
  local gameplayTable = {
    headers = {'Reason','Change','Time'},
    rows = {}
  }
  for _, change in ipairs(arrayReverse(deepcopy(career_modules_playerAttributes.getAttributeLog()))) do
    if change.reason.isDelivery then
      local changeText = ""
      for _, key in ipairs(career_branches.orderAttributeKeysByBranchOrder(tableKeys(change.attributeChange))) do
        changeText = changeText .. string.format('<span><b>%s</b>: %s%0.2f</span><br>', key, change.attributeChange[key] > 0 and "+" or "", change.attributeChange[key])
      end
      table.insert(gameplayTable.rows,
        {change.reason.label, changeText, os.date("%c",change.time)}
      )
    end
  end

  local formattedGameplay = {
    entryId = "deliveryHistory",
    type = "progress",
    cardTypeLabel = "ui.career.poiCard.generic",
    title = "Delivery History",
    text = gameplayText,
    time = os.time()-3,
    hideInRecent = true,
    tables = {gameplayTable}
  }
  table.insert(list, formattedGameplay)







  local deliveriesText = "<span>Cargo items can have <strong>modifiers</strong> that will change how you need to handle the cargo. Each modifier will increase the potential rewards you receive upon delivery, but can also reduce rewards if you fail to meet the requirements.</span>"


  -- urgent deliveries
  deliveriesText = deliveriesText.. "<h3>Urgent Cargo</h3><span><strong>Urgent Cargo</strong> has a time limit that starts once you exit the cargo screen after picking it up. Deliver the item <b>before the time runs out</b> for the full reward. After the time runs out, you will have a few more minutes, but the delivery will be considered <i>delayed</i> and your rewards are reduced. Once that time runs out, your delivery is <i>late</i> and you will receive substantially less rewards.</span><br><br><span>This modifier increases the potential rewards by about <b>30%</b>.</span><br><br>"

  if not progress.timedFlag then
    deliveriesText = deliveriesText .. string.format("<span>Urgent Delivieries are still locked. Deliver <b>%d items in total</b> to unlock them. (<b>%d / %d</b>).</span>", deliveriesNecessary, progress.itemsDeliveredTotal, deliveriesNecessary)
  else
    deliveriesText = deliveriesText .. string.format("<span>You have delivered a total of %d Urgent Cargo items. Of those, %d were delivered on time, %d were delayed and %d were late.</span>",progress.timedDeliveries, progress.onTimeDeliveries, progress.delayedDeliveries, progress.lateDeliveries)
  end

  --precious cargo
  deliveriesText = deliveriesText.. "<h3>Precious Cargo</h3><span><strong>Precious Cargo</strong> needs to be handled delicately. <b>Strong acceleration or sharp turns will damage it</b> and you will receive less and less rewards. If the health of the item falls below 90%, it is considered <i>damaged</i> and your rewards will be reduced. If it reaches 0%, it is considered <i>destroyed</i> and you will receive substantially less rewards.</span><br><br><span>This modifier increases the potential rewards by about <b>70%</b>.</span><br><br>"

  if not progress.fragileFlag then
    deliveriesText = deliveriesText .. string.format("<span>Precious Cargo Deliveries are still locked. Deliver <b>%d items with the Urgent Cargo modifier on time</b> to unlock them. (<b>%d / %d</b>)</span>", timedDeliveriesNecessary, progress.onTimeDeliveries, timedDeliveriesNecessary)
  else
    deliveriesText = deliveriesText .. string.format("<span>You have delivered a total of %d Precious Cargo items. Of those, %d were delivered intact, %d were damaged and %d were destroyed.</span>",progress.fragileDeliveries, progress.noDamageDeliveries, progress.damagedDeliveries, progress.brokenDeliveries)
  end

  -- combo
  deliveriesText = deliveriesText.. "<h3>Urgent and Precious Cargo</h3><span>Cargo items can have multiple modifiers, combining their properties.</span><br><br>"

  if not progress.timedFragileFlag then
    deliveriesText = deliveriesText .. string.format("<span>Urgent and Precious Cargo Deliveries are still locked. Deliver <b>%d items with the Precious Cargo modifier intact</b> to unlock them. (<b>%d / %d</b>)</span>", fragileDeliveriesNecessary, progress.noDamageDeliveries, fragileDeliveriesNecessary)
  else
    deliveriesText = deliveriesText .. "<span>Urgent and Precious Cargo is unlocked.</span>"
  end

  local formattedDeliveries = {
    entryId = "deliveryProgress",
    type = "progress",
    cardTypeLabel = "ui.career.poiCard.generic",
    title = "Cargo Modifiers",
    text = deliveriesText,
    time = os.time()-4,
    hideInRecent = true,
    tables = {}
  }

  table.insert(list, formattedDeliveries)
end
M.onLogbookGetEntries = onLogbookGetEntries

return M