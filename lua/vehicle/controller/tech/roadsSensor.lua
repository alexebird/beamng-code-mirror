-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt
local M = {}
M.type = "auxiliary"

local max, min, abs, sqrt, acos, deg = math.max, math.min, math.abs, math.sqrt, math.acos, math.deg
local NaN = 0/0

-- Roads sensor core properties.
local sensorId  -- The unique Id number for roads sensor.
local GFXUpdateTime  -- The GFX step update time (ie how often readings data is available to the user).

local timeSinceLastPoll = 0.0 -- The time since this roads sensor was last polled (for graphics step).

-- Physics step parameters.
local physicsTimer  -- A timer used for the physics step, to check if an readings update is required.
local physicsUpdateTime  -- How often the physics should be updated, in seconds.

-- Roads readings data.
local readings = {} -- The table of raw sensor readings (since the last graphics step update).
local readingIndex = 1 -- The index in the raw readings array at which to place the next data.

-- Initialisation :
local distToCenterline, distToLeft, distToRight = 0.0, 0.0, 0.0
local initTimer = 0
local fwd = vec3(0, 0, 0)
local length = 0.0
local front, rear = vec3(0, 0, 0), vec3(0, 0, 0)
local rearBumperRelToRearAxle, frontBumperRelToRearAxle = 0.0, 0.0
local halfWidth = 0.0
local headingAngle = 0.0

-- Navigraph data.
local graph = {}                        -- Initialise a table to store the navigraph map.
local coords = {}                       -- Initialise a table to store the navigraph node coordinates.
local widths = {}                       -- Initialise a table to store the navigraph road widths (at nodes).
local normals = {}                      -- Initialise a table to store the navigraph normal vectors (at nodes).
local isMapDataCached = false           -- A flag which indicates if the navigraph map data has been cached, and is ready to access here in vlua.

local pos = vec3(0, 0, 0)

-- The navigraph state.
local coeffsCL, coeffsL, coeffsR = {}, {}, {}  -- coefficients of the centerline, right and left roadedge of the road
local coordsCL = {}  -- coordinates of the closest points
local roadRadius = NaN
local drivability = NaN
local speedLimit = NaN
local oneWay = NaN
local lookAheadDistance = 150.0          -- The distance ahead, in metres, by which the navigraph road network will be scanned to collect curvature data.

-- Linearly interpolate the width values on a line segment to get the width at some point along the line segment.
local function interpolateWidth(intersectionPoint, p1, p2, p1Key, p2Key, widths)
  local w1, w2 = widths[p1Key], widths[p2Key]
  return w1 + ((p1 - intersectionPoint):length() / (p2 - p1):length() * (w2 - w1))
end

-- Projects a vector (a) onto another vector (b).
local function project(a, b)
  return (a:dot(b) / b:dot(b)) * b
end

-- Computes the relative quantity (difference) between two vectors in the direction of a given axis.
local function getRelativeQuantity(v1, v2, axis)
  local v1Proj = project(v1, axis)
  local v2Proj = project(v2, axis)
  return v2Proj:length() - v1Proj:length()
end

-- Compute the two tangents used when fitting a parametric cubic (from 4 points, we go to 2 inner points and 2 defined CR-based tangents there).
local function computeTangents(pn0, pn1, pn2, pn3)
  local d1, d2, d3 = max(sqrt(pn0:distance(pn1)), 1e-12), sqrt(pn1:distance(pn2)), max(sqrt(pn2:distance(pn3)), 1e-12)
  local m = (pn1 - pn0) / d1 + (pn0 - pn2) / (d1 + d2)
  local n = (pn1 - pn3) / (d2 + d3) + (pn3 - pn2) / d3
  local pn12 = pn2 - pn1
  local t1 = (d2 * m) + pn12
  if t1:length() < 1e-5 then
    t1 = pn12 * 0.5
  end
  local t2 = (d2 * n) + pn12
  if t2:length() < 1e-5 then
    t2 = pn12 * 0.5
  end
  return t1, t2
end

-- Compute the reference line cubic equations (parametric).
local function computeRefLineCubic(p0, p1, p2, p3)
  local p1_2d = p1
  local pn0_2d, pn1_2d, pn2_2d, pn3_2d = p0 - p1_2d, vec3(0.0, 0.0, 0.0), p2 - p1_2d, p3 - p1_2d
  local geodesicLength2d = pn1_2d:distance(pn2_2d)
  local t1, t2 = computeTangents(pn0_2d, pn1_2d, pn2_2d, pn3_2d)
  local coeffC, coeffD = (-2.0 * t1) - t2 + (3.0 * pn2_2d), t1 + t2 - (2.0 * pn2_2d)
  return { uA = pn1_2d.x, uB = t1.x, uC = coeffC.x, uD = coeffD.x, vA = pn1_2d.y, vB = t1.y, vC = coeffC.y, vD = coeffD.y }
end

-- For a given navigraph node, width and direction, compute the left and right road edge points.
local function computeRoadEdgePoints(key, dir)
  local coord, n = coords[key], normals[key]
  dir:normalize()
  n:normalize()
  local lateralVec = dir:cross(n) * widths[key]
  return coord - lateralVec, coord + lateralVec
end

local function inCurvature(vec1, vec2)

  local vec1Sqlen, vec2Sqlen = vec1:squaredLength(), vec2:squaredLength()
  local dot12 = vec1:dot(vec2)
  local cos8sq = min(1, dot12 * dot12 / max(1e-30, vec1Sqlen * vec2Sqlen))

  if dot12 < 0 then -- angle between the two segments is acute
    local minDsq = min(vec1Sqlen, vec2Sqlen)
    local maxDsq = minDsq / max(1e-30, cos8sq)
    if max(vec1Sqlen, vec2Sqlen) > (minDsq + maxDsq) * 0.5 then
      if vec1Sqlen > vec2Sqlen then
        vec1, vec2 = vec2, vec1
        vec1Sqlen, vec2Sqlen = vec2Sqlen, vec1Sqlen
      end
      vec2:setScaled(sqrt(0.5 * (minDsq + maxDsq) / max(1e-30, vec2Sqlen)))
    end
  end

  vec2:setScaled(-1)
  return 2 * sqrt((1 - cos8sq) / max(1e-30, vec1:squaredDistance(vec2)))
end

-- Physics step update for this roads sensor instance.
local function update(dtSim)
  -- After init, we must wait a few frames before running any map-based computations.
  if initTimer < 5000 then
    if initTimer == 0 then
      mapmgr.requestMap()
    end
    initTimer = initTimer + 1
    return
  end

  -- Cycle the physics update timer. If we are not ready for a physics step update, leave immediately.
  if physicsTimer < physicsUpdateTime then
    physicsTimer = physicsTimer + dtSim
    return
  end
  physicsTimer = physicsTimer - physicsUpdateTime

  -- Cache the map data if we do not already have it yet.
  if isMapDataCached == false then
    -- Get the raw road network data from the currently-loaded map.
    graph = mapmgr.mapData.graph
    coords = mapmgr.mapData.positions
    widths = mapmgr.mapData.radius
    for k, v in pairs(coords) do
      normals[k] = mapmgr.surfaceNormalBelow(v)
    end
    isMapDataCached = true
  end

  -- Player vehicle.
  pos = obj:getPosition()
  fwd = obj:getForwardVector():normalized()
  length = obj:getInitialLength()
  front = obj:getFrontPosition()
  rear = front - (fwd * length)
  local wp = {}
  local ctr = 0
  for _, wheel in pairs(wheels.wheels) do
    ctr = ctr + 1
    wp[ctr] = obj:getNodePosition(wheel.node1)
  end
  local frontAxleMidpoint, rearAxleMidpoint = pos + (wp[min(ctr, 3)] + wp[min(ctr,4)]) * 0.5, pos + (wp[min(ctr,1)] + wp[min(ctr, 2)]) * 0.5
  rearBumperRelToRearAxle, frontBumperRelToRearAxle =  getRelativeQuantity(rear, rearAxleMidpoint, fwd), getRelativeQuantity(front, rearAxleMidpoint, fwd)
  local frontAxleMidpointProjGround = vec3(frontAxleMidpoint.x, frontAxleMidpoint.y, obj:getSurfaceHeightBelow(frontAxleMidpoint))
  local p1Key, p2Key, dist = mapmgr.findClosestRoad(frontAxleMidpointProjGround)
  if p1Key ~= nil and p2Key ~= nil then
    local p1, p2 = coords[p1Key], coords[p2Key]
    local intersectionPoint = linePointFromXnorm(p1, p2, frontAxleMidpointProjGround:xnormOnLine(p1, p2))
    local dotP1, dotP2 = fwd:dot(p1), fwd:dot(p2)
    local lineSegNorm = (p2 - p1):normalized()  -- take the unit line segment vector, in the direction closest to vehicle facing.
    if dotP1 > dotP2 then
      lineSegNorm = (p1 - p2):normalized()
    end
    halfWidth = interpolateWidth(intersectionPoint, p1, p2, p1Key, p2Key, widths) -- road width at front axle midpoint.
    local perpVector = vec3(lineSegNorm.y, -lineSegNorm.x, lineSegNorm.z)
    local lateralVector = halfWidth * perpVector
    local leftEdgePoint, rightEdgePoint = intersectionPoint - lateralVector, intersectionPoint + lateralVector
    distToCenterline, distToLeft, distToRight = dist, (leftEdgePoint - frontAxleMidpointProjGround):length(), (rightEdgePoint - frontAxleMidpointProjGround):length()
    headingAngle = acos(max(-1, min(1, fwd:dot(lineSegNorm))))
  end

  -- Compute the parametric polynomials for the road centerline (reference line), road left edge, and road right edge.
  local pointAhead = rearAxleMidpoint + (lookAheadDistance * fwd)
  local path = mapmgr.getPointToPointPath(rearAxleMidpoint, pointAhead, nil, 1e-4, nil, nil, nil)  -- the navigraph path from
  coeffsCL, coeffsL, coeffsR, coordsCL = {}, {}, {}, {}
  local startCL, startL, startR = nil, nil, nil
  roadRadius = NaN
  if #path > 3 then
    local p1, p2, p3, p4 = coords[path[1]], coords[path[2]], coords[path[3]], coords[path[4]]
    local left1, right1 = computeRoadEdgePoints(path[1], p2 - p1)
    local left2, right2 = computeRoadEdgePoints(path[2], p3 - p1)
    local left3, right3 = computeRoadEdgePoints(path[3], p4 - p2)
    local left4, right4 = computeRoadEdgePoints(path[4], p4 - p3)
    coeffsCL = computeRefLineCubic(p1, p2, p3, p4)
    coeffsL, coeffsR = computeRefLineCubic(left1, left2, left3, left4), computeRefLineCubic(right1, right2, right3, right4)
    startCL, startL, startR = p2, left2, right2
    coordsCL = { a = p1, b = p2, c = p3, d = p4 }
    roadRadius = 1.0 / inCurvature(p2 - p1, p3 - p2)
  elseif #path > 2 then
    local p1, p2, p3 = coords[path[1]], coords[path[2]], coords[path[3]]
    local left1, right1 = computeRoadEdgePoints(path[1], p2 - p1)
    local left2, right2 = computeRoadEdgePoints(path[2], p3 - p1)
    local left3, right3 = computeRoadEdgePoints(path[3], p3 - p2)
    coeffsCL = computeRefLineCubic(p1, p1, p2, p3)
    coeffsL, coeffsR = computeRefLineCubic(left1, left1, left2, left3), computeRefLineCubic(right1, right1, right2, right3)
    startCL, startL, startR = p1, left1, right1
    coordsCL = { a = p1, b = p2, c = p3, d = vec3(NaN, NaN, NaN) }
    roadRadius = 1.0 / inCurvature(p2 - p1, p3 - p2)
  elseif #path > 1 then
    local p1, p2 = coords[path[1]], coords[path[2]]
    local dir = p2 - p1
    local left1, right1 = computeRoadEdgePoints(path[1], dir)
    local left2, right2 = computeRoadEdgePoints(path[2], dir)
    coeffsCL = computeRefLineCubic(p1, p1, p2, p2)
    coeffsL, coeffsR = computeRefLineCubic(left1, left1, left2, left2), computeRefLineCubic(right1, right1, right2, right2)
    startCL, startL, startR = p1, left1, right1
    coordsCL = { a = p1, b = p2, c = vec3(NaN, NaN, NaN), d = vec3(NaN, NaN, NaN) }
    roadRadius = NaN  -- we have no path, so road must be straight and long - radius is infinite in this case.
  end

  -- Extract some useful road meta-data.
  drivability, speedLimit, oneWay = NaN, NaN, NaN
  if p1Key ~= nil then
    if graph[p1Key][p2Key].drivability ~= nil then
      drivability = graph[p1Key][p2Key].drivability
    end
    if graph[p1Key][p2Key].speedLimit ~= nil then
      speedLimit = graph[p1Key][p2Key].speedLimit
    end
    if graph[p1Key][p2Key].oneWay ~= nil then
      if graph[p1Key][p2Key].oneWay == true then
        oneWay = 1.0
      else
        oneWay = 0.0
      end
    end
  end

  -- Fetch the latest readings from the roads sensor.
  local latestReading = {time = obj:getSimTime(),     -- Time-stamp the sample reading.
    dist2CL = distToCenterline,    -- Approx. minimum distance between vehicle front-axle-midpoint and road reference line (center line), in metres.
    dist2Left = distToLeft,        -- Approx. minimum distance between vehicle front-axle-midpoint and left road edge, in metres.
    dist2Right = distToRight,      -- Approx. minimum distance between vehicle front-axle-midpoint and right road edge, in metres.
    halfWidth = halfWidth,         -- The half-width (center to edge) of the road at the front-axle-midpoint, in metres.
    roadRadius = roadRadius,       -- The radius of the curvature of the road, in metres.  If road is straight, radius = NaN.
    headingAngle = headingAngle,   -- The angle between the vehicle forward direction and the road reference line, in rad.
    -- geometric data :
    -- coordinates of the closest road points
    xP0onCL = coordsCL['a'].x,             -- The world-space X coordinate of the closest road point, 'P0', in metres.  Fit with points P0, P1, P2, P3.
    yP0onCL = coordsCL['a'].y,             -- The world-space Y coordinate of the closest road point, 'P0', in metres.
    zP0onCL = coordsCL['a'].z,             -- The world-space Z coordinate of the closest road point, 'P0', in metres.
    xP1onCL = coordsCL['b'].x,            -- The world-space X coordinate of the 2nd-closest road point, 'P1', in metres.
    yP1onCL = coordsCL['b'].y,            -- The world-space Y coordinate of the 2nd-closest road point, 'P1', in metres.
    zP1onCL = coordsCL['b'].z,            -- The world-space Z coordinate of the 2nd-closest road point, 'P1', in metres.
    xP2onCL = coordsCL['c'].x,            -- The world-space X coordinate of the 3rd-closest road point, 'P2', in metres.
    yP2onCL = coordsCL['c'].y,            -- The world-space Y coordinate of the 3rd-closest road point, 'P2', in metres.
    zP2onCL = coordsCL['c'].z,            -- The world-space Z coordinate of the 3rd-closest road point, 'P2', in metres.
    xP3onCL = coordsCL['d'].x,            -- The world-space X coordinate of the 4th-closest road point, 'P3', in metres.
    yP3onCL = coordsCL['d'].y,            -- The world-space Y coordinate of the 4th-closest road point, 'P3', in metres.
    zP3onCL = coordsCL['d'].z,            -- The world-space Z coordinate of the 4th-closest road point, 'P3', in metres.
    -- for the centerline of the road, the left roadedge and last the right roadedge, here are the parametric cubic polynomial U and V equation
    uAofCL = coeffsCL['uA'],        -- Road Reference-Line Parametric Cubic Polynomial U equation, constant term.
    uBofCL = coeffsCL['uB'],        -- Road Reference-Line Parametric Cubic Polynomial U equation, linear term.
    uCofCL = coeffsCL['uC'],        -- Road Reference-Line Parametric Cubic Polynomial U equation, quadratic term.
    uDofCL = coeffsCL['uD'],        -- Road Reference-Line Parametric Cubic Polynomial U equation, cubic term.
    vAofCL = coeffsCL['vA'],             -- Road Reference-Line Parametric Cubic Polynomial V equation, constant term.
    vBofCL = coeffsCL['vB'],             -- Road Reference-Line Parametric Cubic Polynomial V equation, linear term.
    vCofCL = coeffsCL['vC'],             -- Road Reference-Line Parametric Cubic Polynomial V equation, quadratic term.
    vDofCL = coeffsCL['vD'],             -- Road Reference-Line Parametric Cubic Polynomial V equation, cubic term.
    uAofLeftRE = coeffsL['uA'],          -- Road Left Edge Parametric Cubic Polynomial U equation, constant term.
    uBofLeftRE = coeffsL['uB'],          -- Road Left Edge Parametric Cubic Polynomial U equation, linear term.
    uCofLeftRE = coeffsL['uC'],          -- Road Left Edge Parametric Cubic Polynomial U equation, quadratic term.
    uDofLeftRE = coeffsL['uD'],          -- Road Left Edge Parametric Cubic Polynomial U equation, cubic term.
    vAofLeftRE = coeffsL['vA'],          -- Road Left Edge Parametric Cubic Polynomial V equation, constant term.
    vBofLeftRE = coeffsL['vB'],          -- Road Left Edge Parametric Cubic Polynomial V equation, linear term.
    vCofLeftRE = coeffsL['vC'],          -- Road Left Edge Parametric Cubic Polynomial V equation, quadratic term.
    vDofLeftRE = coeffsL['vD'],          -- Road Left Edge Parametric Cubic Polynomial V equation, cubic term.
    uAofRightRE = coeffsR['uA'],         -- Road Right Edge Parametric Cubic Polynomial U equation, constant term.
    uBofRightRE = coeffsR['uB'],         -- Road Right Edge Parametric Cubic Polynomial U equation, linear term.
    uCofRightRE = coeffsR['uC'],         -- Road Right Edge Parametric Cubic Polynomial U equation, quadratic term.
    uDofRightRE = coeffsR['uD'],         -- Road Right Edge Parametric Cubic Polynomial U equation, cubic term.
    vAofRightRE = coeffsR['vA'],         -- Road Right Edge Parametric Cubic Polynomial V equation, constant term.
    vBofRightRE = coeffsR['vB'],         -- Road Right Edge Parametric Cubic Polynomial V equation, linear term.
    vCofRightRE = coeffsR['vC'],         -- Road Right Edge Parametric Cubic Polynomial V equation, quadratic term.
    vDofRightRE = coeffsR['vD'],              -- Road Right Edge Parametric Cubic Polynomial V equation, cubic term.
    xStartCL = startCL.x,
    yStartCL = startCL.y,
    zStartCL = startCL.z,
    xStartL = startL.x,
    yStartL = startL.y,
    zStartL = startL.z,
    xStartR = startR.x,
    yStartR = startR.y,
    zStartR = startR.z,

    -- semantic road data
    drivability = drivability,       -- The 'drivability' number of the road [smaller = dirt/country roads, larger = highways etc].
    speedLimit = speedLimit,         -- The speed limit of the road, in m/sec
    flag1way = oneWay            -- A flag which indicates if the road is bi-directional (val = 0.0), or one-way (val = 1.0).
  }

  -- Store the latest readings for this roads sensor in the extension. This is used for sending back on the physics step.
  extensions.tech_roadsSensor.cacheLatestReading(sensorId, latestReading)

  -- Add the data to the readings array, for later retrieval. This is used for sending back on the graphics step.
  readings[readingIndex] = latestReading
  readingIndex = readingIndex + 1
end

-- Initialises this roads sensor instance.
local function init(data)
  sensorId = data.sensorId
  GFXUpdateTime = data.GFXUpdateTime
  timeSinceLastPoll = 0.0
  readings = {}
  readingIndex = 1
  physicsTimer = 0.0
  physicsUpdateTime = data.physicsUpdateTime
end

local function reset()
  readings = {} -- empty the table of raw readings, because we have now collected them in the GFX step update.
  readingIndex = 1 -- and reset the index.
  timeSinceLastPoll = timeSinceLastPoll % math.max(GFXUpdateTime, 1e-30)
end

local function getSensorData()
  return {
    readings = readings,
    GFXUpdateTime = GFXUpdateTime,
    timeSinceLastPoll = timeSinceLastPoll
  }
end

local function incrementTimer(dtSim)
  timeSinceLastPoll = timeSinceLastPoll + dtSim
end
-- Public interface:
M.update = update
M.init = init
M.reset = reset
M.getSensorData = getSensorData
M.incrementTimer = incrementTimer

return M
