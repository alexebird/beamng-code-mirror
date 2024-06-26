-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local LUTDetail = 10
local uv = {
    width  = 0.2,
    height = 0.2
  }


local shape = {
  crossPoints = {

    { point = vec3( 0, 0, 1)              },
    { point = vec3( 1, 0, 1), sharp = true},
    { point = vec3( 1, 0, 0), sharp = true},
    { point = vec3( 0, 0, 0)              },
    { point = vec3(-1, 0, 0), sharp = true},
    { point = vec3(-1, 0, 1), sharp = true},
    { point = vec3( 0, 0, 1)              },
  },
  uvCenterIndex = {4},
  faces = {{1,2,3,4,5,6,7}},
  cap = {
    {1,2,3},
    {1,3,4},
    {1,4,5},
    {1,5,6}
  }

}
local function computeFaces()
  local faces = {}
  local vertexCount = #shape.crossPoints
  local sharpCount = 0

  for _, faceList in ipairs(shape.faces) do
    for vIndex = 2, #faceList -1 do
      if shape.crossPoints[vIndex].sharp then
        sharpCount = sharpCount +1
      end
    end
  end

  local vOff = 0
  for _, faceList in ipairs(shape.faces) do
    local vOff = 0
    for vIndex = 1, #faceList -1 do
        local this = faceList[vIndex]
        local right = faceList[vIndex+1]

        local up = this + vertexCount
        local upRight = right + vertexCount
        if shape.crossPoints[this].sharp then
          vOff = vOff + 1
        end

        faces[#faces+1] = {v = this, n = this + vOff ,u=this}
        faces[#faces+1] = {v = up, n = up + vOff + sharpCount ,u=up}
        faces[#faces+1] = {v = right, n = right + vOff ,u=right}

        faces[#faces+1] = {v = up, n = up + vOff + sharpCount ,u=up}
        faces[#faces+1] = {v = upRight, n =upRight + vOff + sharpCount ,u=upRight}
        faces[#faces+1] = {v = right, n =right + vOff , u=right}
    end
  end

  local startCap = {}
  local endCap = {}
  for i,face in ipairs(shape.cap) do
    startCap[(i-1)*3 + 1] = { v = face[1]-1, n = 0, u = 0}
    startCap[(i-1)*3 + 2] = { v = face[2]-1, n = 0, u = 0}
    startCap[(i-1)*3 + 3] = { v = face[3]-1, n = 0, u = 0}

    endCap[(i-1)*3 + 1] = { v = -(vertexCount+2) + face[1], n = 1, u = 0}
    endCap[(i-1)*3 + 2] = { v = -(vertexCount+2) + face[3], n = 1, u = 0}
    endCap[(i-1)*3 + 3] = { v = -(vertexCount+2) + face[2], n = 1, u = 0}
  end

  shape.faceInfo = {
      faces = faces,
      faceCount = #faces,
      vertexCount = vertexCount,
      normalCount = sharpCount + vertexCount,
      startCap = startCap,
      endCap = endCap
    }
  shape.vertexLUT = {}
  shape.LUTMax = 10
  shape.LUTMin = 11
end

local function computeNormals(segment)
  local maxWidth = 0
  local minWidth = 50
  for _,p in ipairs(segment.points) do
    if p.width and p.width > maxWidth then
      maxWidth = math.ceil(p.width)
    end
    if p.width and p.width < minWidth then
      minWidth = math.floor(p.width)
    end
  end

  --dump(minWidth .. " " ..shape.LUTMin .. " - " .. shape.LUTMax .. " " .. maxWidth)

  local widthsNeeded = {}
  if minWidth < shape.LUTMin then
    for i = minWidth, shape.LUTMin-1 do
      widthsNeeded[#widthsNeeded+1] = i
    end
    shape.LUTMin = minWidth
  end
  if maxWidth > shape.LUTMax then
    for i = shape.LUTMax+1, maxWidth do
      widthsNeeded[#widthsNeeded+1] = i
    end
    shape.LUTMax = maxWidth
  end
  local scaledWidthsNeeded = {}
  for _,s in ipairs(widthsNeeded) do
    for i = s*LUTDetail, (s+1) * LUTDetail do
      scaledWidthsNeeded[#scaledWidthsNeeded+1] = i
    end
  end
  local cpc = #shape.crossPoints
  -- now comes actual lookuptable calculation:
  for _,s in ipairs(scaledWidthsNeeded) do
    -- This is the actual width of the track we are dealing with in this step.
    local scl = (s/LUTDetail) /2
    local vertices = {}
    local normals = {}
    -- calculate the scaled vertices first.
    for i = 1, cpc do
      local currentP = shape.crossPoints[i]
      vertices[i] = {}
      vertices[i].position = vec3(currentP.point.x * scl, currentP.point.y, currentP.point.z)
      vertices[i].sharp = shape.crossPoints[i].sharp or false
    end
    -- caluclate the normals
    for _, faceList in ipairs(shape.faces) do
      -- normal for the first point is always sharp
      local a =  (vertices[faceList[2]].position - vertices[faceList[1]].position)
      a:normalize()
      normals[#normals+1] = vec3(-a.z,0,a.x)

      for vIndex = 2, #faceList -1 do
        local currentP = vertices[faceList[vIndex]].position
        local nextP = vertices[faceList[vIndex+1]].position
        local prevP = vertices[faceList[vIndex-1]].position

        -- Vector from previous point to current point.
        local a = (currentP - prevP)
        a:normalize()
        -- Vector from current point to next point.
        local b = (nextP - currentP)
        b:normalize()

        if not vertices[faceList[vIndex]].sharp then
          -- Actual normal.
          local n = vec3(
            -(a.z) - (b.z),
            0,
            (a.x) + (b.x)
          )
          local len = n:length()
          -- If the normal has no length (a and b parallel), simply use perpendicular vector from a.
          if len <=0.00001 then
            n = vec3(
              -(nextP.z - currentP.z),
              0,
              (nextP.x - currentP.x)
            )
          end
          -- Make sure that the normal is actually pointing outwards.
          if (-(nextP.z - currentP.z)*n.x) + ((nextP.x - currentP.x) * n.z) < 0 then
            n = -n / len
          end
          n:normalize()
          normals[#normals+1] = n
        else
          normals[#normals+1] = vec3(-a.z,0,a.x)
          normals[#normals+1] = vec3(-b.z,0,b.x)
        end
      end
      a =  (vertices[faceList[#faceList]].position - vertices[faceList[#faceList-1]].position)
      a:normalize()
      normals[#normals+1] = vec3(-a.z,0,a.x)

    end

    -- calculcate uvX
    local len = 0
    for i =  1, #vertices-1 do
      vertices[i].uvX = len
      len = len +vertices[i].position:distance(vertices[i+1].position)
    end
    vertices[#vertices].uvX = len
    for i, faceList in ipairs(shape.faces) do
      local uvCenterOff = vertices[shape.uvCenterIndex[i]].uvX
      for _,fIndex in ipairs(faceList) do
        vertices[fIndex].uvX = vertices[fIndex].uvX - uvCenterOff
      end
    end

    shape.vertexLUT[s] = {
      vertices = vertices,
      normals = normals
    }
  end
end

local function compileMeshInfo(segment)
  local vertexCount = 1
  local normalCount = 1
  local pointsCount = 0

  local vertices = {}
  local uvs =  {}
  local normals = {}
  local faces = {}
  local LUTindex, vertexLUT

  -- create vertex, uvs and normals from points
  local point = nil
  local pointCount = 0
  local tmpVec3 = vec3()
  for pIndex = 1, #segment.points do
    point = segment.points[pIndex]
    if point.quality[segment.quality] then
      pointsCount = pointsCount +1
      LUTindex = math.floor(point.width * LUTDetail +0.5)
      vertexLUT = shape.vertexLUT[LUTindex]

      for i,p in ipairs(vertexLUT.vertices) do
        tmpVec3:set(
          p.position.x * point.orientation.nx +
          p.position.y * point.orientation.ny +
          point.ceilingMeshHeight * point.orientation.nz +
          p.position.z * point.orientation.nz +
          point.position + vec3(0,0,point.zOffset)
          )
        vertices[vertexCount] ={x = tmpVec3.x, y = tmpVec3.y, z = tmpVec3.z}
        uvs[vertexCount] = {u = (p.uvX * uv.width), v = (point.uvY * uv.height)}
        vertexCount = vertexCount + 1
      end
      for i,p in ipairs(vertexLUT.normals) do
        tmpVec3:set(
          p.x * point.orientation.nx +
          p.y * point.orientation.ny +
          p.z * point.orientation.nz
          )
        normals[normalCount] ={x = tmpVec3.x, y = tmpVec3.y, z = tmpVec3.z}
        normalCount = normalCount +1
      end
    end
  end

  -- create faces from face list
  for cpIndex = 0, pointsCount-2 do
    local vOff = shape.faceInfo.vertexCount * cpIndex
    local nOff = shape.faceInfo.normalCount * cpIndex
    for i, f in ipairs(shape.faceInfo.faces) do
      faces[i + cpIndex * shape.faceInfo.faceCount] = {v = f.v + vOff-1, n = f.n + nOff-1, u = f.u + vOff-1}
    end
  end

  -- cap parts (omitted for now)


  if segment.meshInfo.ceilingMesh.startCap or segment.meshInfo.ceilingMesh.endCap or segment.meshInfo.forceStartCap or segment.meshInfo.forceEndCap then
    local startPoint = segment.points[1]
    local endPoint   = segment.points[#segment.points]
    local faceCount = #faces
    local uvCount = #uvs+1

    normals[normalCount+0] = {x = -startPoint.orientation.ny.x, y =  -startPoint.orientation.ny.y, z = -startPoint.orientation.ny.z}
    normals[normalCount+1] = {x = endPoint.orientation.ny.x, y =  endPoint.orientation.ny.y, z = endPoint.orientation.ny.z}

    uvs[uvCount+0]  = {u = 0.125, v = 0 }
    uvs[uvCount+1]  = {u = 0.125, v = startPoint.width/2 * uv.width }
    uvs[uvCount+2]  = {u = 0,     v = startPoint.width/2 * uv.width }
    uvs[uvCount+3]  = {u = 0,     v = 0 }
    uvs[uvCount+4]  = {u = 0,     v = -startPoint.width/2 * uv.width }
    uvs[uvCount+5]  = {u = 0.125, v = -startPoint.width/2 * uv.width }

    uvs[uvCount+6]  = {u = 0.125, v = 0 }
    uvs[uvCount+7]  = {u = 0.125, v = endPoint.width/2 * uv.width }
    uvs[uvCount+8]  = {u = 0,     v = endPoint.width/2 * uv.width }
    uvs[uvCount+9]  = {u = 0,     v = 0 }
    uvs[uvCount+10] = {u = 0,     v = -endPoint.width/2 * uv.width }
    uvs[uvCount+11] = {u = 0.125, v = -endPoint.width/2 * uv.width }
    if not extensions.util_trackBuilder_splineTrack.ignoreCapsForMeshes then

      if segment.meshInfo.ceilingMesh.startCap or segment.meshInfo.forceStartCap then
        for i, f in ipairs(shape.faceInfo.startCap) do
          faces[faceCount+i] = {v = f.v, n = normalCount-1, u = f.v + uvCount-1 }
        end
        faceCount = faceCount + #shape.faceInfo.startCap
      end
      if segment.meshInfo.ceilingMesh.endCap or segment.meshInfo.forceEndCap then
        for i, f in ipairs(shape.faceInfo.endCap) do
          faces[faceCount+i] = {v = vertexCount +f.v, n = normalCount, u = f.v + 13 + uvCount }
        end
      end
    end

  end
    segment.submeshIndexes.ceilingMesh = segment.submeshCount
    segment.submeshCount = segment.submeshCount +1
    return {
      verts = vertices,
      uvs = uvs,
      normals = normals,
      faces = faces,
      material = segment.materialInfo.ceilingMesh or 'track_editor_A_center',
      tag = "ceiling"
    }
end

local function getMeshes(segment)

  if segment.quality == 4 or not segment.meshInfo.ceilingMesh.active then
    return {}
  end

  computeNormals(segment)
  return {
    compileMeshInfo(segment)
  }
end

computeFaces()
M.getMeshes = getMeshes
return M