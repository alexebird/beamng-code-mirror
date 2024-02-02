-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
-- questData types
local questTypesDir = "/gameplay/questTypes"
local questTypeConstructorFilename = 'constructor'
local questTypes
local filesData
local userData
local function getQuestTypes()
  if not questTypes then
    questTypes = {}
    for _,questFile in ipairs(FS:findFiles(questTypesDir, questTypeConstructorFilename..'.lua', 1, false, true)) do
      local dir,_,_ = path.splitWithoutExt(questFile)
      local splitPath = split(dir,'/')
      local questType = splitPath[#splitPath-1]
      table.insert(questTypes, questType)
    end
  end
  return questTypes
end

-- questData constructors
local questConstructors = {}
local function getQuestConstructor(questTypeName)
  if not questConstructors[questTypeName] then
    local reqPath = questTypesDir.."/"..questTypeName .."/" .. questTypeConstructorFilename
    local luaPath = reqPath..".lua"
    if not FS:fileExists(luaPath) then
      log("E", "", "Unable to load questData type, file not found: "..dumps(luaPath))
    else
      questConstructors[questTypeName] = require(reqPath)
      if not questConstructors[questTypeName] then
        log("E", "", "Unable to load questData type, couldn't require path: "..dumps(reqPath))
      end
    end
  end
  return questConstructors[questTypeName]
end

local questEditors = {}
local function getQuestEditorForType(questTypeName)
  if questEditors[questTypeName] == nil then
    local reqPath = questTypesDir.."/"..questTypeName .."/editor"
    local luaPath = reqPath..".lua"
    if not FS:fileExists(luaPath) then
      log("W", "", "found no editor for questData type " .. questTypeName ..": "..dumps(luaPath))
    else
      questEditors[questTypeName] = require(reqPath)()
      if not questEditors[questTypeName] then
        log("E", "", "could not load editor for questData type " .. questTypeName .. ": "..dumps(reqPath))
      end
    end
    -- make a default editor if none has been found.
    if not questEditors[questTypeName] then
      local E = {}
      E.__index = E
      questEditors[questTypeName] = M.editorHelper(E)
    end
  end
  return questEditors[questTypeName]
end

-- questData static data
local questStaticData = {}
local questStaticDataFilename = 'staticData.json'
local function getQuestStaticData(questTypeName)
  if not questStaticData[questTypeName] then
    local reqPath = questTypesDir.."/"..questTypeName .."/" .. questStaticDataFilename

    if FS:fileExists(reqPath) then
      questStaticData[questTypeName] = jsonReadFile(reqPath)
      if not questStaticData[questTypeName] then
        log("E", "", "Unable to read static data json file: "..dumps(reqPath))
        questStaticData[questTypeName] = {}
      end
    else
      questStaticData[questTypeName] = {}
    end
  end
  return questStaticData[questTypeName]
end

-- local function sanitizeMissionAfterCreation(questData)
--   questData.name = questData.name or ""
--   questData.description = questData.description or ""
--   questData.image = questData.image or ""
--   questData.questType = questData.questType or "None"
--   questData.questTypeData = questData.questTypeData or {}
--   questData.rewards = questData.rewards or {}
--   questData.unlock = questData.unlock or {}
-- end
-- M.sanitizeMissionAfterCreation = sanitizeMissionAfterCreation

local noLogbookFilepath = "/ui/modules/gameContext/noPreview.jpg"
local noPopUpFilepath = "/ui/modules/gameContext/noThumb.jpg"
local logbookFilenames = {"/logbookEntry.jpg","/logbookEntry.png","/logbookEntry.jpeg"}
local popUpFilenames = {"/popUpImage.jpg","/popUpImage.png","/popUpImage.jpeg"}
M.getNoPreviewFilepath = function() return noLogbookFilepath end
M.getNoThumbFilepath = function() return noPopUpFilepath end
local function getQuestLogbookFilepath(questData)
  for _, fn in ipairs(logbookFilenames) do
    if FS:fileExists(questData.id..fn) then
      return questData.id..fn
    elseif FS:fileExists(questTypesDir.."/"..questData.questType.."/"..fn) then
      return questTypesDir.."/"..questData.questType.."/"..fn
    end
  end
  return noLogbookFilepath
end
M.getQuestLogbookFilepath = getQuestLogbookFilepath

local function getPopUpFilepath(questData)
  for _, fn in ipairs(popUpFilenames) do
    if FS:fileExists(questData.id..fn) then
      return questData.id..fn
    elseif FS:fileExists(questTypesDir.."/"..questData.questType.."/"..fn) then
      return questTypesDir.."/"..questData.questType.."/"..fn
    end
  end
  local popUp = getQuestLogbookFilepath(questData)
  if popUp == noLogbookFilepath then
    return noPopUpFilepath
  end
  return popUp
end
M.getPopUpFilepath = getPopUpFilepath


local fileName = "quests.json"
local function sanitizeQuest(questData, questPath)
  -- sanitize images
  questData.logbookFile = questData.logbookFile or getQuestLogbookFilepath(questData)
  questData.popUpFile = questData.popUpFile or getPopUpFilepath(questData)

  -- sanitize name
  if not questData.name or (questData.name == "") then
    --log("E", "", "Missing 'name' field at: "..questPath)
    questData.name = "MISSING NAME, CHECK LOGS ("..(questData.name or "")..")"
  end
  if questData.name == "" or string.find(questData.name, ".json") then
    --log("E", "", "Incorrect 'name' field, please clean it up (no filepaths, no underscores, etc): "..dumps(questData.name).." at: "..questPath)
    questData.name = "INCORRECT NAME, CHECK LOGS ("..(questData.name or "")..")"
  end
  -- sanitize type
  if not questData.questType and not FS:fileExists('/lua/ge/extensions/career/modules/quests/questTypes/' .. questData.questType .. ".lua") then
    --log("E", "", "Unable to sanitize questData, the questType does not exist "..questData.questType..": "..dumps(questPath))
    questData.questType = "INCORRECT TYPE, CHECK LOGS ("..(questData.questType or "")..")"
  end
  if not questData.unlock then questData.unlock = {unlockedBy = {}} end
  if not questData.description then questData.description = "No description" end
  if string.find(questPath, "milestones") then questData.isMilestone = true else questData.isMilestone = false end
  questData.questTypeData = questData.questTypeData or {}
  questData.logbookFile = questData.logbookFile or noLogbookFilepath
  questData.popUpFile = questData.popUpFile or noPopUpFilepath


  questData.tempData = {
    isSubQuest = false,
    nextQuests = {}
  }

  --add userData to questData, or add default userData
  questData.userData = userData[questData.id] or {
    status = "none", -- TODO change this into a "status to be". then call the "setActive" or whatever functions later
    claimed = false,
    completedViewed = false,
    activatedViewed = false,
    tracked = false,
    date = "",
    isNew = false,
    activateTimestamp = -1,
    completedTimestamp = -1,
    claimedTimestamp = -1,
    progressTimestamp = -1,
  }

  -- hardcoded for 0.28 release
  questData.rewards = {{ attributeKey = "money", rewardAmount = "1000"},{ attributeKey = "beamXP", rewardAmount = "10"}}
end

local infoFile = "info.quest.json"
local questsDir = "/gameplay/quests/"
local function loadQuest(questDir)
  if not string.startswith(questDir, questsDir) then
    --log("E", "", "Unable to load questData, not placed in "..questsDir..": "..dumps(questDir))
    return
  end
  if string.find(questDir, " ") then
    --log("E", "", "Unable to load questData, the path cannot contain spaces: "..dumps(questDir))
    return
  end
  local questPath = questDir .. "/" .. infoFile
  if not FS:fileExists(questPath) then
    --log("E", "", "Unable to load questData, questData file not found: "..dumps(questPath))
    return nil
  end
  local questData = jsonReadFile(questPath)
  if not questData then
    --log("E", "", "Unable to load questData data, couldn't parse file: "..dumps(questPath))
    return nil
  end
  questData.id = questDir
  sanitizeQuest(questData, questPath)
  return questData
end

-- returns all quest data from info.quest.json files
local function getFilesData()
  local hasData = false
  if not filesData then
    filesData = {}
    local fromFilesCount = 0

    -- local _, savePath = career_saveSystem.getCurrentSaveSlot()
    -- if savePath then
    --   log("I", "career", "Loading the user quest data form the saved file." .. savePath)
    --   userData = jsonReadFile(savePath .. "/career/"..fileName) or {}
    -- end
    userData = {}

    -- load filebased quests
    for _,questInfo in ipairs(FS:findFiles(questsDir, 'info.quest.json', -1, false, true)) do
      --
      --TODO
      --
      -- if not career_modules_linearTutorial.isLinearTutorialActive() and string.find(questInfo, "tutorial") then
      --   goto continue
      -- end
      local questDir, _, _ = path.split(questInfo)
      questDir = string.sub(questDir,0,-2)
      local questData = loadQuest(questDir)
      if filesData[questData.id] then
        --log("E", "career", "Duplicated quest ID : " .. quest.id .. ". skipping second instance.")
        goto continue
      end
      if not questData then
        goto continue
      end
      hasData = true
      fromFilesCount = fromFilesCount + 1
      gameplay_quests_questManager.setQuestByType(questData)
      filesData[questData.id] = questData
      ::continue::
    end

    if hasData then
      log("I", "career", "Loaded " .. fromFilesCount .. " quests from " .. questsDir)
    else
      log("E", "career", "It was not possible to load any quest from the main files at " .. questsDir)
    end
  end
  return filesData
end

local function saveQuest (questData, newFolder)
  local targetFolder = (newFolder or questData.id) .. "/"..infoFile
  local data = {
    name = questData.name or "Generic Name",
    description = questData.description or "Generic Description",
    image = questData.image or "None",
    questType = questData.questType or "None",
    questTypeData = questData.questTypeData or {},
    rewards = questData.rewards or {},
  }
  -- write pretty
  jsonWriteFile(targetFolder, data, true)
  log("I","","Wrote questData successfully to " .. targetFolder)
end

local function createQuest(id, data)
  data = data or {}
  data.name = data.name or "Generic Name"
  data.description = data.description or "Generic Description"
  data.image = data.image or "None"
  data.questType = data.questType or "None"
  data.questTypeData = data.questTypeData or {}
  data.rewards = data.rewards or {}
  saveQuest(data, questsDir.."/"..id)
  local loaded = loadQuest(questsDir.."/"..id)
  table.insert(loaded, data)
  table.insert(filesData, loaded)
  return loaded
end

local function onExtensionLoaded()
end

M.getQuestTypes = getQuestTypes
M.getQuestConstructor = getQuestConstructor
M.getQuestEditorForType = getQuestEditorForType
M.getQuestStaticData = getQuestStaticData
M.loadQuest = loadQuest
M.getFilesData = getFilesData
M.onExtensionLoaded = onExtensionLoaded
M.saveQuest = saveQuest
M.createQuest = createQuest

M.reloadCompleteQuestSystem = function()
  log("I","","Reloading complete quest system.")
  log("I","","Clearing Quests.")
  gameplay_quests_quests.clearCache()
  log("I","","Clearing Complete.")
end

M.clearCache = function() filesData = nil end
M.editorHelper = function(C, ...) return require('/lua/ge/extensions/editor/newEditorHelper')(C, 'questData', ...) end
return M
