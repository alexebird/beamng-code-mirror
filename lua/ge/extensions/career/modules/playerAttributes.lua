-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local dlog = function(m) log("D","",m) end -- set to nop to disable loggin

M.dependencies = {'career_career'}

local attributes
local attributeLog

local function init()
  attributeLog = {}
  attributes = {}
  attributes["beamXP"] = {value = 0, min = 0}
  attributes["money"] = {value = 0}
  attributes["bonusStars"] = {value = 0, min = 0}
  for _, branch in ipairs(career_branches.getSortedBranches()) do
    attributes[branch.attributeKey] = {value = branch.defaultValue or 0}
  end
  local startingCapital = 10000
  if not career_career.tutorialEnabled then
    startingCapital = startingCapital + 3500
  end
  M.addAttribute("money", startingCapital, {label="Starting Capital"})
  dlog("Initialized Attributes to: " ..dumps(attributes))
end

local function clampAttributeValue(attribute)
  if attribute.max then
    attribute.value = math.min(attribute.value, attribute.max)
  end
  if attribute.min then
    attribute.value = math.max(attribute.value, attribute.min)
  end
end

local function setAttribute(attributeName, value)
  local attribute = attributes[attributeName]
  attribute.value = value
  clampAttributeValue(attribute)
  extensions.hook("onPlayerAttributesChanged", attributeName)
end

local function addAttribute(attributeName, value, reason)
  local attribute = attributes[attributeName] or {value = 0}
  local before = attribute.value
  local after = attribute.value + value
  setAttribute(attributeName, after)
  dlog("Added " .. dumps(value) .. " to attribute " .. dumps(attributeName) ..". ("..dumps(before).." -> " .. dumps(attribute.value))
  if not reason then
    reason = {
      label = "Unknown Reason",
      origin = debug.tracesimple()
    }
    log("W","","Changed attribute without giving a reason...")
  end
  if not reason.noLog then
    M.logAttributeChange({[attributeName] = value}, reason)
  end
end

-- attribute log utils

local function logAttributeChange(change, reason)
  table.insert(attributeLog, {
    attributeChange = change,
    reason = reason,
    time = os.time()
  })
end

local function getAttribute(attribute)
  return attributes[attribute]
end

local function getAllAttributes()
  return attributes
end


local function onExtensionLoaded()
  if not career_career.isActive() then return false end
  if not attributes then
    init()
  end

  -- load from saveslot
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  local jsonData = (savePath and jsonReadFile(savePath .. "/career/playerAttributes.json")) or {}

  for name, data in pairs(jsonData) do
    if attributes[name] and attributes[name].value then
      attributes[name].value = data.value
    end
  end

  attributeLog = (savePath and jsonReadFile(savePath .. "/career/attributeLog.json")) or attributeLog
end

-- this should only be loaded when the career is active
local function onSaveCurrentSaveSlot(currentSavePath)
  jsonWriteFile(currentSavePath .. "/career/playerAttributes.json", attributes, true)
  jsonWriteFile(currentSavePath .. "/career/attributeLog.json", attributeLog, true)
end



-- logbook integration
local function onLogbookGetEntries(list)

  local financialsText = '<span>Below is an overview of how you spent and earned money.<ul><li><b>Earn money</b> by playing Challenges and completing new Objectives, or by selling Vehicles and Parts.</li><li><b>Spend your Money</b> on new Vehicles and Parts, Insurances and Repairs, or by taking a Taxi.</li></ul><span><i>Disclaimer: Financial values are not balanced yet across the whole of career mode. So you might end up with too much or too little money in the long run.</i></span></span>'
  local financialsTable = {
    headers = {'Reason','Change','Time'},
    rows = {}
  }
  for _, change in ipairs(arrayReverse(deepcopy(attributeLog))) do
    if change.attributeChange.money then
      local changeText = ""
      local key = "money"
      changeText = changeText .. string.format('<span><b>%s</b>: %s%0.2f</span>', key, change.attributeChange[key] > 0 and "+" or "", change.attributeChange[key])
      table.insert(financialsTable.rows,
        {change.reason.label, changeText, os.date("%c",change.time)}
      )
    end
  end

  local formattedFinancials = {
    entryId = "playerAttributeFinancials",
    type = "progress",
    cardTypeLabel = "ui.career.poiCard.generic",
    title = "Financial History",
    text = financialsText,
    time = os.time(),
    hideInRecent = true,
    tables = {financialsTable}
  }
  table.insert(list, formattedFinancials)

  local gameplayText = '<span style="margin-bottom:0.5em">Below is an overview of rewards you earned from Challenges, Milestones and Deliveries.<ul><li><b>Money</b> can be used to make purchases.</li><li><b>Beam XP</b> is a measure of your overall general progress, but has no use in game currently.</li><li><b>Branch XP</b> for the four branches will let you reach the next tier of that branch, unlocking new missions.</li><li><b>Bonus Stars</b> can currently only be used for fast repairs.</li></ul></span>'
  local gameplayTable = {
    headers = {'Reason','Change','Time'},
    rows = {}
  }
  for _, change in ipairs(arrayReverse(deepcopy(attributeLog))) do
    if change.reason.isGameplay then
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
    entryId = "playerAttributeGameplay",
    type = "progress",
    cardTypeLabel = "ui.career.poiCard.generic",
    title = "Rewards History",
    text = gameplayText,
    time = os.time()-1,
    hideInRecent = true,
    tables = {gameplayTable}
  }
  table.insert(list, formattedGameplay)

end

M.addAttribute = addAttribute
M.setAttribute = setAttribute
M.getAttribute = getAttribute
M.getAllAttributes = getAllAttributes
M.getAttributeLog = function() return attributeLog end

M.logAttributeChange = logAttributeChange
M.onLogbookGetEntries = onLogbookGetEntries
M.onSaveCurrentSaveSlot = onSaveCurrentSaveSlot
M.onExtensionLoaded = onExtensionLoaded
return M