-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

M.dependencies = {'career_career'}

local function canPay(price)
  for currency, info in pairs(price) do
    if not info.canBeNegative and career_modules_playerAttributes.getAttribute(currency).value < info.amount then
      return false
    end
  end
  return true
end

local function pay(price, reason)
  if not canPay(price) then return false end
  for currency, info in pairs(price) do
    career_modules_playerAttributes.addAttribute(currency, -info.amount, reason)
  end
  return true
end

M.canPay = canPay
M.pay = pay

return M