local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  --dump("CALLED onUpdateProgress")
  --dump(questType)
  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = 0,
        maxValue = 128,
        label = {txt = "quest.type.distanceDriven.progess", context={count = 50, goal = 128}},
        done=false,
      },
      {
        type = "progressBar",
        minValue = 0,
        currValue = 50,
        maxValue = 128,
        label = {txt = "quest.type.distanceDriven.progess", context={count = 50, goal = 128}},
        done=false,
      },
      {
        type = "progressBar",
        minValue = 0,
        currValue = 128,
        maxValue = 128,
        label = {txt = "quest.type.distanceDriven.progess", context={count = 50, goal = 128}},
        done=true,
      },
      {
        type = "checkbox",
        done = true,
        label = "Some Demo Text",
      },
      {
        type = "checkbox",
        done = false,
        label = "Some Demo Text asdf as",
      },
      {
        type = "checkbox",
        done = true,
        label = "Some",
      },
      {
        type = "checkbox",
        done = false,
        label = "Some Demo Textdddddddddddddddddd",
      },
    }

    quest.tempData.title = {txt = "quest.type.distanceDriven.goal", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type.distanceDriven.succeed", context={count = curr}}
  end
end


M.onUpdateProgress = onUpdateProgress

return M