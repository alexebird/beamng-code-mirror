-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local defaultSaveSlot = 'default'
local currentSaveSlotName = defaultSaveSlot
local saveRoot = 'settings/cloud/questProgress/'
local savePath = saveRoot .. defaultSaveSlot .. "/"
local versionFile = 'version.json'

local batchMode = false

local plog = log


local function setSaveSlot(slotName)
  plog("I", "", "Progress Save Slot changed to " .. dumps(slotName))
  savePath = saveRoot .. slotName .. "/"
  currentSaveSlotName = slotName
end

local function setSavePath(path)
  savePath = path and path or (saveRoot .. defaultSaveSlot .. "/")
end

local function getSaveSlot()
  return currentSaveSlotName, savePath
end

local function saveMissionSaveData(id, dirtyDate)
  plog("I", "", "Saved Mission Progress for mission id " .. dumps(id))
  local mission = gameplay_missions_missions.getMissionById(id)
  if not mission then
    plog("E", "", "Trying to saveMissionAttempt nonexitent mission by ID: " .. dumps(id))
    return
  end
  local path = savePath .. id .. '.json'
  mission.saveData.dirtyDate = dirtyDate
  jsonWriteFile(path, mission.saveData, true)
end

local permaLogFile = 'permaMissionProgressLog.json'
local function permaLog(data)
  local file = {}
  if FS:fileExists(permaLogFile) then
    local state, result = xpcall(function()
      return jsonReadFile(permaLogFile)
    end, debug.traceback)
    if state ~= false and result ~= nil then
      file = result
    else
      plog("E", "", "Could not read permaProgress version file under " .. dumps(permaLogFile))
    end
  end
  local entry = { date = os.time(), humanDate = os.date("!%Y-%m-%dT%TZ"), data = data or {}, source = debug.tracesimple() }
  table.insert(file, entry)
  jsonWriteFile(permaLogFile, file, true)
  --log("","D",dumps(entry))
end

-- local function sanitizeAttempt(attempt, mission)
--   attempt.type = attempt.type or 'none'
--   -- remove all non-active stars from attempt
--   local unlockedClean = {}
--   for key, val in pairs(attempt.unlockedStars or {}) do
--     if mission.careerSetup.starsActive[key] then
--       unlockedClean[key] = val
--     end
--   end
--   attempt.unlockedStars = unlockedClean

--     -- automatically calculate the type (passed/completed etc) based on the stars
--   local currentType = "none"
--   local defaultStarsUnlockedCount = 0
--   local bonusStarsUnlockedCount = 0
--   for key, _ in pairs(mission.careerSetup._activeStarCache.defaultStarKeysByKey) do
--     if attempt.unlockedStars[key] then
--       defaultStarsUnlockedCount = defaultStarsUnlockedCount +1
--     end
--   end
--   for key, _ in pairs(mission.careerSetup._activeStarCache.bonusStarKeysByKey) do
--     if attempt.unlockedStars[key] then
--       bonusStarsUnlockedCount = defaultStarsUnlockedCount +1
--     end
--   end
--   if defaultStarsUnlockedCount >= 1 then
--     currentType = 'passed'
--   end
--   if defaultStarsUnlockedCount == mission.careerSetup._activeStarCache.defaultStarCount
--     and bonusStarsUnlockedCount ==  mission.careerSetup._activeStarCache.bonusStarCount then
--     currentType = "completed"
--   end
--   attempt.type = currentType
-- end

local function getCleanSaveData(mission)
  -- local defaultKey = mission.defaultProgressKey
  -- local ret = {}
  -- local prog = {}
  -- prog[defaultKey] = {
  --   aggregate = {
  --     bestType = 'none',
  --     passed = false,
  --     completed = false,
  --     mosttimespan = nil,
  --     attemptCount = 0
  --   },
  --   attempts = {},
  --   leaderboards = {
  --     recent = {},
  --   }
  -- }

  -- for progressKey, defaults in pairs(mission.defaultAggregateValues or {}) do
  --   if progressKey ~= "all" then
  --     if not prog[progressKey] then
  --       prog[progressKey] = deepcopy(prog[defaultKey])
  --     end
  --     --for key, val in pairs(defaults) do
  --     --  prog[progressKey].aggregate[key] = val
  --     --end
  --   end
  -- end

  -- ret.progress = prog

  -- ret.unlockedStars = {}

  -- if mission.latestVersion then
  --   ret.version = mission.latestVersion
  -- else
  --   log("E","","Mission type '"..mission.missionType.."' needs version added!")
  -- end

  -- if mission.setupSaveData then
  --   local succ, err, prog = xpcall(function()
  --     mission:setupSaveData(ret)
  --   end, debug.traceback)
  --   if not succ then
  --     plog("E", "", "Error setting up custom mission progress, ID: " .. dumps(id) .. ". Error follows:")
  --     plog("E", "", err)
  --   else
  --     ret = prog
  --   end
  -- end
  -- return ret
end

local function updateSaveData(mission, saveData)
  -- log("I", "", "UpdateSaveData was called")
  -- local fileVersion = saveData.version
  -- log("I", "", dumps(saveData))

  -- -- iterate over version updates
  -- while (fileVersion < mission.latestVersion) do

  --   -- iterate over progressKeys
  --   for progressKey, progressData in pairs(saveData.progress) do

  --     -- iterate over attempts
  --     for _, attempt in ipairs(progressData.attempts) do

  --       -- update attempt
  --       mission:updateAttempt(attempt, fileVersion)
  --     end
  --   end

  --   fileVersion = fileVersion + 1
  -- end

  -- -- saveData has to be already set here, because it's used in aggregateAttempt
  -- mission.saveData = getCleanSaveData(mission)

  -- -- iterate over progressKeys
  -- for progressKey, progressData in pairs(saveData.progress) do

  --   -- create empty progressKeys to insert attemptData into
  --   M.ensureProgressExistsForKey(mission, progressKey)
  --   -- iterate over attempts
  --   for _, attempt in ipairs(progressData.attempts) do

  --     -- batchmode to stop unlock stuff from happening, this happens after loading the missions anyway
  --     batchMode = true
  --     aggregateAttempt(mission.id, attempt, progressKey)
  --     batchMode = false
  --   end
  -- end

  -- -- setup
  -- local saveFile = savePath .. mission.id .. '.json'
  -- local backupFile = savePath .. mission.id .. '-backup.json'
  -- FS:copyFile(saveFile,backupFile)

  -- -- update (if application quits before finishing, we should replace saveFile with backupFile)
  -- jsonWriteFile(saveFile, mission.saveData, true)

  -- -- cleanup
  -- FS:removeFile(backupFile)
  -- plog("I", "", "Updated Mission Progress for mission id " .. dumps(mission.id))

  -- return mission.saveData
end

local function loadMissionSaveData(mission)
  -- local id = mission.id
  -- local path = savePath .. id .. '.json'

  -- if FS:fileExists(path) then
  --   local state, result = xpcall(function()
  --     local saveData = jsonReadFile(path)
  --     if career_career and career_career.isActive() then
  --       career_modules_missionWrapper.onMissionLoaded(id, saveData.dirtyDate)
  --     end

  --     -- check if saveData is outdated and if it has an update function
  --     if saveData.version < mission.latestVersion and mission.updateAttempt then
  --       saveData = updateSaveData(mission, saveData)
  --     end

  --     return saveData
  --   end, debug.traceback)
  --   if state ~= false and result ~= nil then
  --     -- sanitize progress (add default)
  --     if mission.loadSaveData then
  --       local succ, err, prog = xpcall(function()
  --         mission:loadSaveData(result)
  --       end, debug.traceback)
  --       if not succ then
  --         plog("E", "", "Error loading custom mission progress, ID: " .. dumps(id) .. ". Error follows:")
  --         plog("E", "", err)
  --       else
  --         result = prog
  --       end
  --     end
  --     return result
  --   else
  --     -- check for backupFile
  --   end
  -- end

  -- return getCleanSaveData(mission)
end

-- local function ensureProgressExistsForKey(missionInstance, progressKey)
--   if not missionInstance.saveData.progress[progressKey] then
--     plog("I", "Created Missing Progress for key " .. dumps(progressKey))
--     missionInstance.saveData.progress[progressKey] = {
--       aggregate = {
--         bestType = 'none',
--         passed = false,
--         completed = false,
--         mosttimespan = nil,
--         attemptCount = 0
--       },
--       attempts = {},
--       leaderboards = {
--         recent = {}
--       }
--     }
--   end
-- end

M.saveMissionSaveData = saveMissionSaveData
M.loadMissionSaveData = loadMissionSaveData
M.setSaveSlot = setSaveSlot
M.getSaveSlot = getSaveSlot
M.setSavePath = setSavePath

local function onExtensionLoaded()
  -- local files = FS:findFiles('/lua/ge/extensions/gameplay/missions/progress/conditions', '*.lua', -1)
  -- local count = 0
  -- for _, file in ipairs(files) do
  --   local aConds = require(file:sub(0, -5))

  --   for key, value in pairs(aConds) do
  --     count = count + 1
  --     conditionTypes[key] = value
  --   end
  -- end
  -- plog("D", "", "Loaded " .. count .. " condition types from " .. #files .. " files.")
end
M.onExtensionLoaded = onExtensionLoaded

M.startBatchMode = function()
  batchMode = true
end
M.endBatchMode = function()
  batchMode = false
end

M.exportAllProgressToCSV = function()


end

return M
