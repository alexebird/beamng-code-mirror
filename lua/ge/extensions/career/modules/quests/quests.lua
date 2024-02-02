-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {"career_modules_questManager"}

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
    local _, savePath = career_saveSystem.getCurrentSaveSlot()
    if savePath then
      log("I", "career", "Loading the user quest data form the saved file." .. savePath)
      userData = jsonReadFile(savePath .. "/career/"..fileName) or {}
    end

    -- load filebased quests
    --print("loading quest files - lineart tutorial: " .. dumps(career_modules_linearTutorial.isLinearTutorialActive()))
    for _,questInfo in ipairs(FS:findFiles(questsDir, 'info.quest.json', -1, false, true)) do
      --print(questInfo)
      if not career_modules_linearTutorial.isLinearTutorialActive() and string.find(questInfo, "tutorial") then
        --print("skip tutorial")
        goto continue
      end
      if career_modules_linearTutorial.isLinearTutorialActive() and string.find(questInfo, "01%-buyVehicle") then
        --print("skip buy")
        goto continue
      end
      local questDir, _, _ = path.split(questInfo)
      questDir = string.sub(questDir,0,-2)
      local questData = loadQuest(questDir)
      if filesData[questData.id] then
        log("E", "career", "Duplicated quest ID : " .. quest.id .. ". skipping second instance.")
        goto continue
      end
      if not questData then
        goto continue
      end
      hasData = true
      fromFilesCount = fromFilesCount + 1
      career_modules_questManager.setQuestByType(questData)
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

-- local function saveMission(questData, newFolder)
--   local targetFolder = (newFolder or questData.missionFolder) .. "/"..infoFile
--   questData.recommendedAttributes = {}
--   for k, v in pairs(questData.recommendedAttributesKeyBasedCache or {}) do
--     if v then
--       table.insert(questData.recommendedAttributes, k)
--     end
--   end
--   local careerSetup = deepcopy(questData.careerSetup or {})
--   careerSetup._activeStarCache = nil
--   local data = {
--     name = questData.name or "",
--     description = questData.description or "",
--     missionType = questData.missionType or "",
--     retryBehaviour = questData.retryBehaviour or "infiniteRetries",
--     startCondition = questData.startCondition or {type='always'},
--     visibleCondition = questData.visibleCondition or {type='always'},
--     startTrigger = deepcopy(questData.startTrigger),
--     --recommendedAttributes = questData.recommendedAttributes,
--     --prefabs = questData.prefabs or {},
--     --prefabsRequireCollisionReload = questData.prefabsRequireCollisionReload or false,
--     missionTypeData = questData.missionTypeData or {},
--     --trafficAllowed = questData.trafficAllowed or (questData.trafficAllowed==nil),
--     devNotes = questData.devNotes,
--     additionalAttributes = questData.additionalAttributes,
--     customAdditionalAttributes = questData.customAdditionalAttributes,
--     grouping = questData.grouping,
--     isAvailableAsScenario = questData.isAvailableAsScenario,
--     author = questData.author,
--     date = questData.date,
--     careerSetup = careerSetup,
--     setupModules = questData.setupModules,
--     devMission = questData.devMission,
--   }
--   -- write pretty
--   jsonWriteFile(targetFolder, data, true)
--   log("I","","Wrote questData successfully to " .. targetFolder)
-- end

-- local function createMission(id, data)
--   data = data or {}
--   data.name = data.name or id
--   data.id = id
--   data.description = data.description or "questData Description for " .. id
--   data.startCondition = data.startCondition or {{type="vehicleDriven"}}
--   data.visibleCondition = data.visibleCondition or {}
--   data.missionType = data.missionType or "flowgraph"
--   data.startTrigger = data.startTrigger or {type="level", level='gridmap'}
--   --data.retryBehaviour = data.retryBehaviour or "infiniteRetries"
--   --data.recommendedAttributesKeyBasedCache = data.recommendedAttributesKeyBasedCache or {}
--   saveMission(data, questsDir.."/"..id)
--   local loaded = loadMission(questsDir.."/"..id)
--   table.insert(loaded, data)
--   table.insert(filesData, loaded)
--   return loaded
-- end

M.getQuestTypes = getQuestTypes
M.getQuestConstructor = getQuestConstructor
M.getQuestEditorForType = getQuestEditorForType
M.getQuestStaticData = getQuestStaticData
M.loadQuest = loadQuest
M.getFilesData = getFilesData

M.reloadCompleteMissionSystem = function()
  -- log("I","","Reloading complete questData system.")
  -- log("I","","Clearing MissionEnter.")
  -- gameplay_markerInteraction.clearCache()
  -- log("I","","Clearing Missions.")
  -- gameplay_missions_missions.clearCache()
  -- log("I","","Clearing Complete.")
end

--M.clearCache = function() filesData = nil locationsCache = {} quests = nil end
M.editorHelper = function(C, ...) return require('/lua/ge/extensions/editor/newEditorHelper')(C, 'questData', ...) end
return M
