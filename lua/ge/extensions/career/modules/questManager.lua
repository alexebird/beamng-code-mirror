local M = {}
M.dependencies = {
'career_career',
}

M.getExtensionsByQuestType = function(questType)
  return _G['career_modules_quests_questTypes_'..questType]
end

M.onPreLoad = function()
  local extensionFiles = {}
  local files = FS:findFiles('/lua/ge/extensions/career/modules/quests/questTypes', '*.lua', -1, true, false)
  for i = 1, tableSize(files) do
    local extensionFile = string.gsub(files[i], "/lua/ge/extensions/", "")
    extensionFile = string.gsub(extensionFile, ".lua", "")
    local extName = extensions.luaPathToExtName(extensionFile)
    table.insert(M.dependencies, extName)
  end
end

local fileName = "quests.json"

local quests = {}
local questsByType = {}
--[[quests = {
  tempData = {},
  userData = {},
  anything in the root is from the core quest data
}--]]

--those two are temporarily used when initialization. they are populated then put in the quests table
local dirty = false -- if any data has been modified since the last save

-- this function formats the quest to be viewed by the UI.
local function formatQuest(quest)
  local formattedQuest = {}
  formattedQuest.id = quest.id
  formattedQuest.title = quest.tempData.title
  formattedQuest.goalReached = quest.tempData.goalReached
  formattedQuest.description = quest.description
  formattedQuest.logbookFile = quest.logbookFile
  formattedQuest.popUpImage = quest.popUpFile
  formattedQuest.progress = quest.tempData.progress
  formattedQuest.unlocks = quest.tempData.nextQuests
  formattedQuest.unlockedBy = quest.unlock.unlockedBy
  formattedQuest.isMilestone = quest.isMilestone
  formattedQuest.status = quest.userData.status
  formattedQuest.rewards = quest.rewards
  formattedQuest.tracked = quest.userData.tracked
  formattedQuest.claimed = quest.userData.claimed
  formattedQuest.isNew = quest.userData.isNew
  formattedQuest.claimable = quest.userData.status == "completed" and not quest.userData.claimed
  formattedQuest.claimed = quest.userData.claimed
  formattedQuest.activateTimestamp = quest.userData.activateTimestamp
  formattedQuest.completedTimestamp = quest.userData.completedTimestamp
  formattedQuest.claimedTimestamp = quest.userData.claimedTimestamp
  formattedQuest.progressTimestamp = quest.userData.progressTimestamp
  formattedQuest.hidden = quest.hidden or false
  return formattedQuest
end

local function getUIFormattedQuests()
  local list = {}
  local sortedKeys = tableKeysSorted(quests)
  gameplay_statistic.forceTimerUpdate()
  extensions.hook("onUpdateProgress")
  for _, qId in ipairs(sortedKeys) do
    table.insert(list, formatQuest(quests[qId]))
  end
  return list
end

------------------- DO NOT DISTURB STUFF -------------------

local inAMission = false

local function canBeDisturbed()
  return not inAMission
end

local function tryPushNotifications()
  local activatedQuests = {}
  local completedQuests = {}
  if canBeDisturbed() then
    for _, quest in pairs(quests)do
      if quest.userData.status == "completed" and not quest.userData.completedViewed then
        completedQuests[quest.id] = formatQuest(quest)
      end
      if quest.userData.status == "activated" and not quest.userData.activatedViewed then
        activatedQuests[quest.id] = formatQuest(quest)
      end
    end
    if next(completedQuests) then extensions.hook("onQuestCompleted", completedQuests) end
    if next(activatedQuests) then extensions.hook("onUpdateProgress") end
  end
end

local function onAnyMissionChanged(state, mission)
  inAMission = state == "started"
  tryPushNotifications()
end

---------------------------------------------------------

local function setDirtyToTrue()
  dirty = true
  guihooks.trigger("QuestsChanged")
end



local function setQuestToViewed(questId)
  quests[questId].userData.completedViewed = true
end

-- When booting the game, the UI will show a list of completed quests that the user didnt see
local function getNotViewedButCompleteQuests()
  local list = {}
  for _, quest in pairs(quests)do
    if quest.userData.status == "completed" and not quest.userData.completedViewed then
      list[quest.id] = formatQuest(quest)
    end
  end
  return list
end



local function getQuestsWithStatus(status)
  local ret = {}
  for _, quest in pairs(quests)do
    if quest.userData.status == status then
      table.insert(ret, quest)
    end
  end
  return ret
end

local function isQuestRewardsClaimable(quest)
  return (not quest.userData.claimed and quest.userData.status == "completed" and quest.rewards ~= nil) and true or false
end

local function getCompleteQuests()
  local ret = {}
  for _, quest in pairs(quests) do
    if quest.userData.status == "completed" then
      table.insert(ret, quest)
    end
  end
  return ret
end

local function getUnClaimedQuests()
  local ret = {}
  for _, quest in pairs(getQuestsWithStatus("completed"))do
    if isQuestRewardsClaimable(quest) then
      table.insert(ret, quest)
    end
  end
  return ret
end

--A quest is considered a root quest if it cant be unlocked AND is not complete AND isnt a sub Quest, which means it needs to be a current quest
local function checkIsRootQuest(quest)
  if not quest.unlock or #quest.unlock.unlockedBy == 0 then
    return (quest.userData.status ~= "completed" and not quest.tempData.isSubQuest) and true or false
  end
  return false
end

local function activateQuest(quest)
  if quest.userData.status ~= "active" then
    quest.userData.status = "active"
    quest.userData.tracked = true
    quest.userData.isNew = true
    quest.userData.activateTimestamp = os.time()
    if quest.questType then
      local ext = M.getExtensionsByQuestType(quest.questType)
      if ext and ext.questActivated then
        ext.questActivated(quest)
      end
    end
    --Auto track feature, if quest was activated through completing another quest, then track
    if #quest.unlock.unlockedBy ~= 0 then
      quest.userData.tracked = true
    end
    if canBeDisturbed() then
      --extensions.hook("onQuestActivated", {M.formattedQuest(quest)})
    end
    setDirtyToTrue()
  else
    log("W","","Tried to activate quest that is already active! questid:" .. dumps(quest.id))
  end
end

-- will find if quest is locked, active or done
local function updateQuestStatus(quest)
  --basically if this quest cant be unlocked from any other quest, then it is a "root" quest, thus needs to be active
  if checkIsRootQuest(quest) then
    M.activateQuest(quest)
    return
  end

  if quest.userData.status  ~= "completed" then
    --this bit only checks if the current quest is "locked" or "active" according to its previous (not sub) quests
    if quest.unlock.unlockedBy then -- if unlocked by other quests
      local flag = true
      for _, id in pairs(quest.unlock.unlockedBy)do
        if not quests[id] then
          log("E", "", "Unlock information for quest " .. dumps(quest.id) .. " contains nonexisten ID: " .. dumps(id))
        else
          if quests[id].userData.status == "completed" then
            if quest.unlock.unlockType == "or" then
              M.activateQuest(quest)
              flag = false
            end
          else
            if quest.unlock.unlockType == "and" then
              flag = false
            end
          end
        end
      end
      if quest.unlock.unlockType == "and" then
        if not flag then
          quest.userData.status = "locked"
        else
          M.activateQuest(quest)
        end
      else
        if flag then
          quest.userData.status = "locked"
        end
      end
    end
  end
  setDirtyToTrue()
end

-- when a quest is done, we need to update its following quests status
local function updateFollowingQuestsStatus(quest)
  if quest.tempData.nextQuests then
    for _, id in pairs(quest.tempData.nextQuests) do
      updateQuestStatus(quests[id])
    end
  end
end



local function initFollowingQuests()
  for _, quest in pairs(quests) do
    if quest.unlock then
      if quest.questType == "questOfQuests" then
        if quest.unlock.subTasks then -- if unlock other quests
          for _, questId in pairs(quest.unlock.subTasks)do
            table.insert(quests[questId].tempData.nextQuests, quest.id)
          end
        end
      end
      if quest.unlock.unlockedBy then -- if unlock other quests
        for _, questId in pairs(quest.unlock.unlockedBy)do
          table.insert(quests[questId].tempData.nextQuests, quest.id)
        end
      end
    end
  end
end


--Load the quests data from all files inside gameplay/quests folder.
local function loadQuests()
  --[[
  local questsFiles = FS:findFiles('/gameplay/quests', '*.quest.json', -1, true, false)
  local qD = {}
  local hasData = false
  local count = 0

  local userData = {}
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if savePath then
    userData = jsonReadFile(savePath .. "/career/"..fileName) or {}
  end
  print("tutorial active:" .. dumps(career_modules_linearTutorial.isLinearTutorialActive()))
  for _, file in pairs(questsFiles) do
    local quest = jsonReadFile(file)
    print(file)
    if not career_modules_linearTutorial.isLinearTutorialActive() and string.find(file, "tutorial") then
      print("skip tut")
      goto continue
    end
    if career_modules_linearTutorial.isLinearTutorialActive() and string.find(file, "01-buyVehicle") then
      print("skip buy")
      goto continue
    end
    if quests[quest.id] then
      log("E", "career", "Duplicated quest ID : " .. quest.id .. ". skipping second instance.")
      goto continue
    end

    -- if quest type extension cannot be found, skip
    if quest.questType and FS:fileExists('/lua/ge/extensions/career/modules/quests/questTypes/' .. quest.questType .. ".lua") then
      -- sanitize quest
      if not quest.unlock then quest.unlock = {unlockedBy = {}} end
      if not quest.description then quest.description = "No description" end
      if string.find(file, "milestones") then quest.isMilestone = true else quest.isMilestone = false end
      --if not quest.isMilestone then quest.isMilestone = false end

      quest.tempData = {
        isSubQuest = false,
        nextQuests = {}
      }


      --add userData to quest, or add default userData
      quest.userData = userData[quest.id] or {
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
      -- add to questData table
      quests[quest.id] = quest
      questsByType[quest.questType] = questsByType[quest.questType] or {}
      table.insert(questsByType[quest.questType], quest)
      count = count + 1
      hasData = true
    end
    ::continue::
  end]]
end

local function setQuestByType(quest)
  questsByType[quest.questType] = questsByType[quest.questType] or {}
  table.insert(questsByType[quest.questType], quest)
end

local function onSaveCurrentSaveSlot(currentSavePath, oldSaveDate, forceSyncSave)
  local saveUserData = {}
  for _, quest in pairs(quests) do
    saveUserData[quest.id] = quest.userData
  end
  jsonWriteFile(currentSavePath .. "/career/" .. fileName, saveUserData, true)
  dirty = false
end

local function claimRewardsById(qId)
  local q = M.getQuestById(qId)
  if not q then
    log("E","","Tried to claim rewards for " .. dumps(qId) .. " but the quest does not exist.")
    return
  end
  M.claimRewards(q)
end
local function claimRewards(quest)
  if quest.rewards and not quest.userData.claimed then
    local sumChange = {}
    for _, reward in pairs(quest.rewards) do
      sumChange[reward.attributeKey] = (sumChange[reward.attributeKey] or 0) + reward.rewardAmount
      career_modules_playerAttributes.addAttribute(reward.attributeKey, reward.rewardAmount, {noLog = true})
    end
    career_modules_playerAttributes.logAttributeChange(sumChange, {label="Claimed Rewards for quest " .. (translateLanguage(quest.name,quest.name,true) or "(Unnamed Quest)")})
    quest.userData.claimed = true
    quest.userData.claimedTimestamp = os.time()
    career_saveSystem.saveCurrent()
  else
    -- log("W","","Tried to claim rewards for " .. dumps(quest.id) .. " the quest has no rewards or is not claimable.")
    -- log("W","","Rewards for " .. dumps(quest.id) .. " :" .. dumps(quest.rewards))
    -- log("W","","Userdata for " .. dumps(quest.id) .. " :" .. dumps(quest.userData))
  end
  setDirtyToTrue()
end

local function claimEveryRewards()
  for _, quest in pairs(getUnClaimedQuests()) do
    claimRewards(quest)
  end
end

local function addCompleteQuest(quest)
  if quest.userData.status == "active" then
    quest.userData.status = "completed"
    quest.userData.isNew = false
    quest.userData.completedTimestamp = os.time()
    updateQuestStatus(quest)
    updateFollowingQuestsStatus(quest) --update following quests and sub quests if there are any
    setDirtyToTrue()
    if canBeDisturbed() and not quest.tracked then
      --extensions.hook("AddQuestPopUp", {formatQuest(quest)})
      guihooks.trigger('AddQuestPopUp', formatQuest(quest))
    end
    extensions.hook("onQuestCompleted",quest)
  end
end

local function getActiveQuestsByType(qType)
  local list = {}
  for _, quest in pairs(quests) do
    if quest.userData.status == "active" and quest.questType == qType then
      table.insert(list, quest)
    end
  end
  return list
end

local function getQuestById(id)
  if not quests[id] then
    log("E","","No quest by id " ..dumps(id))
    dumps(tableKeys(quests))
  end
  return quests[id]
end

local function loadDataAndInit()
  --loadQuests()
  quests = career_modules_quests_quests.getFilesData();

  initFollowingQuests() -- for ease of use, we calculate and set the following tasks for each task
end

local function onCareerModulesActivated(alreadyInLevel)
  loadDataAndInit()
  if alreadyInLevel then
    for _, quest in pairs(quests) do
    updateQuestStatus(quest)
    end
    extensions.hook("onUpdateProgress")
  end
end

M.onClientStartMission = function()
  -- once we have all quests loaded, update quests status (unlocking etc)
  for _, quest in pairs(quests) do
    updateQuestStatus(quest)
  end
  extensions.hook("onUpdateProgress")
end

local function completeQuest(questId)
  addCompleteQuest(quests[questId])
end

local function setQuestAsTracked(questId, tracked)
  for _, q in pairs(quests) do
    if q.tracked then q.tracked = false end
  end
  quests[questId].userData.tracked = tracked
  setDirtyToTrue()
end

local function setQuestAsNotNew(questId)
  quests[questId].userData.isNew = false
  setDirtyToTrue()
end

M.onExtensionUnloaded = function()
  extensions.hook("onQuestsUnloaded")
end

--DEBUG ------------------------------------

local function d_unlockQuest(questID)
  dump(quests[questID])
  if quests[questID].userData.status ~= "active" then
    quests[questID].userData.status = "active"
    quests[questID].userData.isNew = true
    setDirtyToTrue()
  end
end
local function d_completeQuest(questID)
  if quests[questID].userData.status ~= "completed" then
    quests[questID].userData.status = "completed"
    quests[questID].userData.isNew = false
    updateQuestStatus(quests[questID])
    updateFollowingQuestsStatus(quests[questID])
    setDirtyToTrue()
  end
end
local function d_claimQuest(questID)
  claimRewards(quests[questID])
end

local function d_unlockAllQuest()
  for _, quest in pairs(quests) do
    if quest.userData.status ~= "active" then
      quest.userData.status = "active"
      quest.userData.isNew = true
      setDirtyToTrue()
    end
  end
end

local function d_completeAllQuest()
  for _, quest in pairs(quests) do
    if quest.userData.status ~= "completed" then
      quest.userData.status = "completed"
      quest.userData.isNew = false
      updateQuestStatus(quest)
      updateFollowingQuestsStatus(quest)
      setDirtyToTrue()
    end
  end
end

local function d_claimAllQuest()
  claimEveryRewards()
end


--DEBUG API
M.d_unlockQuest = d_unlockQuest
M.d_completeQuest = d_completeQuest
M.d_claimQuest = d_claimQuest

M.d_unlockAllQuest = d_unlockAllQuest
M.d_completeAllQuest = d_completeAllQuest
M.d_claimAllQuest = d_claimAllQuest

--------------------------------------------

M.activateQuest = activateQuest
M.updateQuestStatus = updateQuestStatus
M.saveUserData = saveUserData
M.setQuestByType = setQuestByType

M.onCareerModulesActivated = onCareerModulesActivated
M.onSaveCurrentSaveSlot = onSaveCurrentSaveSlot

M.getQuestById = getQuestById
M.addCompleteQuest = addCompleteQuest
M.getActiveQuestsByType = getActiveQuestsByType

M.onAnyMissionChanged = onAnyMissionChanged

--UI API
M.claimRewardsById = claimRewardsById
M.claimRewards = claimRewards
M.claimEveryRewards = claimEveryRewards
M.getUIFormattedQuests = getUIFormattedQuests
M.setQuestToViewed = setQuestToViewed
M.getNotViewedButCompleteQuests = getNotViewedButCompleteQuests
M.setQuestAsTracked = setQuestAsTracked
M.setQuestAsNotNew = setQuestAsNotNew
M.completeQuest = completeQuest

return M