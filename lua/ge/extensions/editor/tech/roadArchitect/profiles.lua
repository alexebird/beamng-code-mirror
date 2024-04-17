-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- Module constants.
local num2WUserProfiles = 20                                                                        -- The number of user profiles (two-way roads).
local num1WUserProfiles = 10                                                                        -- The number of user profiles (one-way roads).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

local M = {}


-- Private constants.
local im = ui_imgui
local floor, ceil, min, max = math.floor, math.ceil, math.min, math.max
local sin, cos, pi = math.sin, math.cos, math.pi
local pView = vec3(-24.02901173,0.8800626756,1007.733115)
local pRot = quat(0.1090148618,-0.114031973,0.7137778829,0.6823735069)

-- Module state.
local profiles = {}                                                                                 -- The array of profiles currently present in the editor.
local oldPos, oldRot = nil, nil                                                                     -- The previous camera pose, before going to profile view.
local isInProfileView = false                                                                       -- A flag which indicates if the camera is in profile view, or not.


-- Gets a collection of default lateral road profiles.
local function populateProfileTemplates()

  -- If the profiles already exist, do not re-create them.
  if #profiles > 0 then
    return
  end

  -- Bi-directional / one lane / no sidewalks.
  local p = {}
  p.name = '2-way | 1-lane'
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Bi-directional / two lanes / no sidewalks.
  p = {}
  p.name = '2-way | 2-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Bi-directional / two-one lanes / no sidewalks.
  p = {}
  p.name = '2-way | 2/1-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- One-way street / one lane.
  p = {}
  p.name = '1-way | 1-lane'
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- One-way street / two lanes.
  p = {}
  p.name = '1-way | 2-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- One-way street / three lanes.
  p = {}
  p.name = '1-way | 3-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- One-way street / four lanes.
  p = {}
  p.name = '1-way | 4-lane'
  p[-4] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two-lane highway.
  p = {}
  p.name = 'Highway | 2-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two-lane highway + island.
  p = {}
  p.name = 'Highway | 2-lane/Island'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'island', width = im.FloatPtr(1.75), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'island', width = im.FloatPtr(1.75), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Three-lane highway.
  p = {}
  p.name = 'Highway | 3-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Four-lane highway.
  p = {}
  p.name = 'Highway | 4-lane'
  p[-4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two/one-lane highway.
  p = {}
  p.name = 'Highway | 2/1-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Three/two-lane highway.
  p = {}
  p.name = 'Highway | 3/2-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two-lane highway / high-wall.
  p = {}
  p.name = 'High-sided | 2-lane'
  p[-4] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  profiles[#profiles + 1] = p

  -- Three-lane highway / high-wall.
  p = {}
  p.name = 'High-sided | 3-lane'
  p[-5] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[5] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  profiles[#profiles + 1] = p

  -- Two-lane highway / high-wall / separator wall.
  p = {}
  p.name = 'High-separator | 2-lane'
  p[-4] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  profiles[#profiles + 1] = p

  -- Three-lane highway / high-wall / separator wall.
  p = {}
  p.name = 'High-separator | 3-lane'
  p[-5] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[5] = { type = 'concrete', width = im.FloatPtr(1.0), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  profiles[#profiles + 1] = p

  -- Divider wall / Two-lane highway.
  p = {}
  p.name = 'Divider | 2-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'concrete', width = im.FloatPtr(0.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Highway / Cambered / 2-lane.
  p = {}
  p.name = 'Cambered | 2-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.2), heightR = im.FloatPtr(0.8) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.2) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.2) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.2), heightR = im.FloatPtr(0.8) }
  profiles[#profiles + 1] = p

  -- Highway / Cambered / 3-lane.
  p = {}
  p.name = 'Cambered | 3-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.25), heightR = im.FloatPtr(0.8) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.25) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.25) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.25), heightR = im.FloatPtr(0.8) }
  profiles[#profiles + 1] = p

  -- Stepped sides / 2-lane.
  p = {}
  p.name = 'Stepped | 2-lane'
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Stepped sides / 3-lane.
  p = {}
  p.name = 'Stepped | 3-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Stepped sides / 2-lane / Island.
  p = {}
  p.name = 'Stepped | Island'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[-1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'island', width = im.FloatPtr(0.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Stepped sides / Divider wall / 2-lane.
  p = {}
  p.name = 'Step | Div | 2-lane'
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(1.5), heightR = im.FloatPtr(1.5) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(1.5), heightR = im.FloatPtr(1.5) }
  p[-1] = { type = 'concrete', width = im.FloatPtr(0.25), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'concrete', width = im.FloatPtr(0.25), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Stepped sides / Divider wall / 3-lane.
  p = {}
  p.name = 'Step | Div | 3-lane'
  p[-4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(1.5), heightR = im.FloatPtr(1.5) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(1.5), heightR = im.FloatPtr(1.5) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(1.5), heightR = im.FloatPtr(1.5) }
  p[-1] = { type = 'concrete', width = im.FloatPtr(0.25), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[1] = { type = 'concrete', width = im.FloatPtr(0.25), heightL = im.FloatPtr(3.0), heightR = im.FloatPtr(3.0) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'road_lane', width = im.FloatPtr(3.5), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two-way street / flat.
  p = {}
  p.name = 'Street | 2-way | flat'
  p[-2] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  profiles[#profiles + 1] = p

  -- Two-way street / raised.
  p = {}
  p.name = 'Street | 2-way | raised'
  p[-2] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- One-way street / one lane / with sidewalks.
  p = {}
  p.name = 'Street | 1-way | sidewalks'
  p[-2] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / Two-way street / two-lanes / raised.
  p = {}
  p.name = 'Urban | 2-way | 2-lane'
  p[-4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / Two-way street / one-lane / raised.
  p = {}
  p.name = 'Urban | 2-way | 1-lane'
  p[-3] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-2] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / Three/two-way street / two-lanes / raised.
  p = {}
  p.name = 'Urban | 2-way | 3/2-lane'
  p[-5] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-4] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-3] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / Two-way street / two/one-lane / raised.
  p = {}
  p.name = 'Urban | 2-way | 2/1-lane'
  p[-4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[2] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / Two-way street / one-lane / island / raised.
  p = {}
  p.name = 'Urban | 2-way | Island'
  p[-4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'island', width = im.FloatPtr(1.5), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[1] = { type = 'island', width = im.FloatPtr(1.5), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- Urban / One-way street / two-lane / raised.
  p = {}
  p.name = 'Urban | 1-way | 2-lane'
  p[-4] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  p[-3] = { type = 'cycle_lane', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-2] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  p[1] = { type = 'sidewalk', width = im.FloatPtr(2.0), heightL = im.FloatPtr(0.3), heightR = im.FloatPtr(0.3) }
  profiles[#profiles + 1] = p

  -- User profiles.
  for i = 1, num2WUserProfiles do
    p = {}
    p.name = 'User 2W ' .. tostring(i)
    p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    profiles[#profiles + 1] = p
  end
  for i = 1, num1WUserProfiles do
    p = {}
    p.name = 'User 1W (F) ' .. tostring(i)
    p[1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    profiles[#profiles + 1] = p
  end
  for i = 1, num1WUserProfiles do
    p = {}
    p.name = 'User 1W (B) ' .. tostring(i)
    p[-1] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    profiles[#profiles + 1] = p
  end
end

-- Gets the current profile index from a given profile name.
local function getIdFromName(name)
  local numProfiles = #profiles
  for i = 1, numProfiles do
    if name == profiles[i].name then
      return i
    end
  end
  return nil
end

-- Gets the profile with the given name.
local function getProfileFromName(name) return profiles[getIdFromName(name)] end

-- Cycles through the supported lane types.
local function cycleLaneType(t)
  if t == 'road_lane' then return 'sidewalk' end
  if t == 'sidewalk' then return 'cycle_lane' end
  if t == 'cycle_lane' then return 'island' end
  if t == 'island' then return 'concrete' end
  if t == 'concrete' then return 'road_lane' end
  return t
end

-- Computes an array of valid lane keys for a road, ordered from smallest to largest.
local function computeLaneKeys(profile)
  local laneKeys, leftKeys, rightKeys, ctr, ctrL, ctrR = {}, {}, {}, 1, 1, 1
  for i = -20, -1 do                                                                                -- Do the left lanes separately.
    if profile[i] then
      laneKeys[ctr], leftKeys[ctrL] = i, i
      ctr, ctrL = ctr + 1, ctrL + 1
    end
  end
  for i = 1, 20 do                                                                                  -- Do the right lanes separately.
    if profile[i] then
      laneKeys[ctr], rightKeys[ctrR] = i, i
      ctr, ctrR = ctr + 1, ctrR + 1
    end
  end
  return laneKeys, leftKeys, rightKeys
end

-- Computes an ordered array of lane indices, from smallest to largest.
-- [Also returns the total number of lanes].
local function getOrderedLanes(profile)
  local lanes, ctr = {}, 1
  for i = -20, 20 do
    if profile[i] then
      lanes[ctr] = i
      ctr = ctr + 1
    end
  end
  return lanes, ctr - 1
end

-- Computes tables of profile widths and heights (left and right), by lane key.
-- [Data is returned in imgui float ptr format].
local function getWAndHByKey(profile)
  local widths, heightsL, heightsR = {}, {}, {}
  for i = -20, 20 do
    local p = profile[i]
    if p then
      widths[i], heightsL[i],heightsR[i] = im.FloatPtr(p.width[0]), im.FloatPtr(p.heightL[0]), im.FloatPtr(p.heightR[0])
    end
  end
  return widths, heightsL, heightsR
end

-- Computes the width of the given profile.
local function getWidth(profile)
  local width = 0.0
  for i = -20, 20 do
    local p = profile[i]
    if p then
      width = width + p.width[0]
    end
  end
  return width
end

-- Gets the minimum and maximum lane key values, from a given collection of lanes.
local function getMinMaxLaneKeys(lanes)
  local l, u = 100, -100
  for i = -20, 20 do
    if lanes[i] then
      l, u = min(l, i), max(u, i)
    end
  end
  return l, u
end

-- Creates a custom profile for a link road.
local function createCustomLinkProfile(link, prof1, lie)

  -- Compute the lane types and the min and max lane indexes for the new profile.
  -- [Since validation has been done, it is sufficient to take these only from one link lane collection].
  local l1 = link.l1
  local types, tCtr, minLaneIdx, maxLaneIdx = {}, 1, 0, 0
  for i = -20, -1 do
    if l1[i] then
      types[tCtr] = prof1[i].type
      tCtr, minLaneIdx = tCtr + 1, minLaneIdx - 1
    end
  end
  for i = 1, 20 do
    if l1[i] then
      types[tCtr] = prof1[i].type
      tCtr, maxLaneIdx = tCtr + 1, maxLaneIdx + 1
    end
  end

  -- Flip the lane indices if required (to make profile take on the correct direction, in some cases).
  if lie == 'start' then
    local old = maxLaneIdx
    maxLaneIdx = -minLaneIdx
    minLaneIdx = -old
    local flippedTypes, tCtr = {}, 1
    for i = #types, 1, -1 do
      flippedTypes[tCtr] = types[i]
      tCtr = tCtr + 1
    end
    types = flippedTypes
  end

  -- Create the new profile and add it to the profiles structure.
  -- [Lane widths and heights are given default values, since the widths have already been prescribed on the link road].
  local prof, profileName = {}, tostring(worldEditorCppApi.generateUUID())
  prof.name, tCtr = profileName, 1
  for i = minLaneIdx, -1 do
    prof[i] = { type = types[tCtr], width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    tCtr = tCtr + 1
  end
  for i = 1, maxLaneIdx do
    prof[i] = { type = types[tCtr], width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    tCtr = tCtr + 1
  end

  return prof
end

-- Converts an OpenDRIVE lane type to a supported native type.
local function convertOpenDRIVEType2Native(t)
  if t == 'shoulder' then return 'road_lane' end
  if t == 'border' then return 'road_lane' end
  if t == 'driving' then return 'road_lane' end
  if t == 'stop' then return 'road_lane' end
  if t == 'restricted' then return 'island' end
  if t == 'parking' then return 'road_lane' end
  if t == 'median' then return 'road_lane' end
  if t == 'biking' then return 'cycle_lane' end
  if t == 'walking' then return 'sidewalk' end
  if t == 'curb' then return 'sidewalk' end
  if t == 'entry' then return 'road_lane' end
  if t == 'exit' then return 'road_lane' end
  if t == 'onRamp' then return 'road_lane' end
  if t == 'offRamp' then return 'road_lane' end
  if t == 'connectingRamp' then return 'road_lane' end
  if t == 'slipLane' then return 'road_lane' end
  if t == 'sideWalk' then return 'road_lane' end                                                    -- Deprecated in OpenDRIVE.
  if t == 'bidirectional' then return 'road_lane' end                                               -- Deprecated in OpenDRIVE.
  if t == 'none' then return 'island' end
  return 'road_lane'                                                                                -- Default.
end

-- Creates a custom profile for use when importing from OpenDRIVE.
local function createCustomImportProfile(lanes)

  -- Create a table of lane keys.
  local lNew = {}
  for j = -20, 20 do
    local lane = lanes[j]
    if lane then
      lNew[j] = convertOpenDRIVEType2Native(lane.type)
    end
  end

  -- Create the new profile.
  -- [Lane widths and heights are given default values - they will be imported and added later, at each node].
  local prof = { name = worldEditorCppApi.generateUUID() }
  for k, nativeLaneType in pairs(lNew) do
    prof[k] = { type = nativeLaneType, width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  end

  return prof, lNew
end

-- Copies a profile template to a new profile.
local function createProfileFromTemplate(pName, newName)
  local profile, p = getProfileFromName(pName), { name = newName }
  for i = -20, 20 do
    local lane = profile[i]
    if lane then
      p[i] = { type = lane.type, width = im.FloatPtr(lane.width), heightL = im.FloatPtr(lane.heightL), heightR = im.FloatPtr(lane.heightR) }
    end
  end
  return p
end

-- Copies a profile template to an existing profile.
local function updateToNewTemplate(road, templateName)
  local template, profile = getProfileFromName(templateName), road.profile
  table.clear(profile)
  for i = -20, 20 do
    local lane = template[i]
    if lane then
      profile[i] = { type = lane.type, width = im.FloatPtr(lane.width), heightL = im.FloatPtr(lane.heightL), heightR = im.FloatPtr(lane.heightR) }
    end
  end
end

-- Deep copies a profile.
local function copyProfile(p)
  local pCopy = { name = p.name }
  for i = -20, 20 do
    local lane = p[i]
    if lane then
      pCopy[i] = { type = lane.type, width = im.FloatPtr(lane.width), heightL = im.FloatPtr(lane.heightL), heightR = im.FloatPtr(lane.heightR) }
    end
  end
  return pCopy
end

-- Moves the camera to the profile edit pose.
-- [Also adjusts the timing parameters respectively].
local function goToProfileView(timer, time)
  if not isInProfileView then
    timer:stopAndReset()
    oldPos, oldRot = core_camera.getPosition(), core_camera.getQuat()                               -- Store the current camera position so we can return to it later.
    commands.setFreeCamera()
    core_camera.setPosRot(0, pView.x, pView.y, pView.z, pRot.x, pRot.y, pRot.z, pRot.w)             -- Move the camera to the profile pose.
    isInProfileView, time = true, 0.0
  end
  return time
end

-- Returns the camera to the stored old view.
local function goToOldView()
  if oldPos and oldRot then
    core_camera.setPosRot(0, oldPos.x, oldPos.y, oldPos.z, oldRot.x, oldRot.y, oldRot.z, oldRot.w)
  end
  isInProfileView = false
end

-- Gets some relevant numerical lanes data from the given profile.
-- [Number of left/right lanes and min/max lane indices].
local function getLanesData(p)
  local lNum, lMin, lMax = 0, 100, -100
  for i = -20, -1 do
    if p[i] then
      lMin, lMax, lNum = min(lMin, i), max(lMax, i), lNum + 1
    end
  end
  local rNum, rMin, rMax = 0, 100, -100
  for i = 1, 20 do
    if p[i] then
      rMin, rMax, rNum = min(rMin, i), max(rMax, i), rNum + 1
    end
  end
  return lNum, rNum, lMin, lMax, rMin, rMax
end

-- Removes the selected lane from the selected profile.
local function removeLane(selectedProfileIdx, selectedLaneIdx, side)
  local lNum, rNum, _, _, _, _ = getLanesData(profiles[selectedProfileIdx])
  if lNum > 1 and side == 'left' then
    local p = profiles[selectedProfileIdx]
    p[selectedLaneIdx] = nil
    for i = -1, -20, -1 do
      if not p[i] then
        p[i], p[i - 1] = p[i - 1], nil
      end
    end
    return
  end
  if rNum > 1 and side == 'right' then
    local p = profiles[selectedProfileIdx]
    p[selectedLaneIdx] = nil
    for i = 1, 20 do
      if not p[i] then
        p[i], p[i + 1] = p[i + 1], nil
      end
    end
  end
end

-- Adds a lane to the selected profile, at the chosen position.
local function addLane(selectedProfileIdx, selectedLaneIdx, side, rel)
  local p = profiles[selectedProfileIdx]
  local lNum, rNum, _, _, _, _ = getLanesData(p)
  if lNum < 20 and side == 'left' then
    if rel == 'above' then
      selectedLaneIdx = selectedLaneIdx - 1
    end
    for i = -20, selectedLaneIdx do
      p[i] = p[i + 1]
    end
    p[selectedLaneIdx] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
    return
  end
  if rNum < 20 and side == 'right' then
    if rel == 'below' then
      selectedLaneIdx = selectedLaneIdx + 1
    end
    for i = 20, selectedLaneIdx, -1 do
      p[i] = p[i - 1]
    end
    p[selectedLaneIdx] = { type = 'road_lane', width = im.FloatPtr(2.7), heightL = im.FloatPtr(0.1), heightR = im.FloatPtr(0.1) }
  end
end

-- Serialises a profile.
local function serialiseProfile(p)
  local pSer = { name = p.name }
  for i = -20, 20 do
    local l = p[i]
    if l then
      pSer[i] = { type = l.type, width = l.width[0], heightL = l.heightL[0], heightR = l.heightR[0] }
    end
  end
  return pSer
end

-- De-serialises a profile.
local function deserialiseProfile(pSer)
  local p = { name = pSer.name }
  for i = -20, 20 do
    local l = pSer[i]
    if l then
      p[i] = { type = l.type, width = im.FloatPtr(l.width), heightL = im.FloatPtr(l.heightL), heightR = im.FloatPtr(l.heightR) }
    end
  end
  return p
end

-- Saves the collection of current profiles to disk.
local function save()
  extensions.editor_fileDialog.saveFile(
    function(data)
      local pSer, numProfiles = {}, #profiles
      for i = 1, numProfiles do
        pSer[i] = serialiseProfile(profiles[i])
      end
      local encodedData = { data = lpack.encode({ profiles = pSer })}
      jsonWriteFile(data.filepath, encodedData, true)
    end,
    {{"JSON",".json"}},
    false,
    "/",
    "File already exists.\nDo you want to overwrite the file?")
end

-- Loads a collection of current profiles from disk.
local function load()
  extensions.editor_fileDialog.openFile(
    function(data)
      local loadedJson = jsonReadFile(data.filepath)
      local data = lpack.decode(loadedJson.data)
      local serProfiles = data.profiles
      table.clear(profiles)
      local numProfiles = #serProfiles
      for i = 1, numProfiles do
        profiles[i] = deserialiseProfile(serProfiles[i])
      end
    end,
    {{"JSON",".json"}},
    false,
    "/")
end


-- Public interface.
M.profiles =                                              profiles

M.populateProfileTemplates =                              populateProfileTemplates
M.getIdFromName =                                         getIdFromName
M.getProfileFromName =                                    getProfileFromName
M.cycleLaneType =                                         cycleLaneType
M.computeLaneKeys =                                       computeLaneKeys
M.getOrderedLanes =                                       getOrderedLanes
M.getWAndHByKey =                                         getWAndHByKey
M.getWidth =                                              getWidth
M.getMinMaxLaneKeys =                                     getMinMaxLaneKeys
M.createCustomLinkProfile =                               createCustomLinkProfile
M.createCustomImportProfile =                             createCustomImportProfile
M.createProfileFromTemplate =                             createProfileFromTemplate
M.updateToNewTemplate =                                   updateToNewTemplate
M.copyProfile =                                           copyProfile
M.goToProfileView =                                       goToProfileView
M.goToOldView =                                           goToOldView
M.removeLane =                                            removeLane
M.addLane =                                               addLane
M.serialiseProfile =                                      serialiseProfile
M.deserialiseProfile =                                    deserialiseProfile
M.save =                                                  save
M.load =                                                  load

return M