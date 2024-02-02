-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

M.dependencies = {"career_career"}

local function getCareerStatusData()
  local data = {}
  data.money = career_modules_playerAttributes.getAttribute("money").value
  data.beamXP = career_modules_playerAttributes.getAttribute("beamXP").value
  data.bonusStars = career_modules_playerAttributes.getAttribute("bonusStars").value

  return data
end

M.getCareerStatusData = getCareerStatusData

return M