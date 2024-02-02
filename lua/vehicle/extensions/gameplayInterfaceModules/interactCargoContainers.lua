-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt
local M = {}
M.moduleActions = {}
M.moduleLookups = {}

local max = math.max
local moduleName = "interactCargoContainers"

local cargoContainerCache = nil
local cargoContainerById = nil

local function buildContainerCache()
  cargoContainerCache = {}
  cargoContainerById = {}
  for _, container in pairs(v.data.cargoStorage or {}) do
    -- generate an entry for the list that will be sent back to geLua.
    table.insert(cargoContainerCache, {
      id = container.cid,
      cargoTypes = container.cargoTypes,
      capacity = container.capacity,
      name = container.name or "Unnamed Container"
    })

    -- create a lookup for each container that contains nodeIds and node base weights.
    cargoContainerById[container.cid] = {
      nodes = {}
    }

    for _, nodeId in ipairs(container["weightNodes:"]) do
      local node = v.data.nodes[nodeId]
      table.insert(cargoContainerById[container.cid].nodes, {
        cid = node.cid,
        nodeWeight = node.nodeWeight
      })
    end
    -- already save the inverse of the count of the nodes, since weight can be distributed among multiple nodes
    cargoContainerById[container.cid].invNodeCount = 1 / (#cargoContainerById[container.cid].nodes + 1e-30)
  end
  -- wrap cargoContainerCache another time to conform to return value format for gameplay interface functions.
  cargoContainerCache = {cargoContainerCache}
end

local function setCargoContainers(params)
  local dataTypeCheck, dataTypeError = checkTableDataTypes(params, {"table"})
  if not dataTypeCheck then
    return {failReason = dataTypeError}
  end

  if not cargoContainerCache then
    buildContainerCache()
  end


  -- reset all container weights
  for _, container in pairs(cargoContainerById or {}) do
    container.cargoWeightPerNode = 0
  end
  -- set all container weights according to the params data.
  for _, setContainerData in pairs(params[1] or {}) do
    if not setContainerData.containerId or not setContainerData.weight then
      return {failReason = "Container Data missing either containerId or weight values."}
    end
    cargoContainerById[setContainerData.containerId].cargoWeightPerNode = max(0, setContainerData.weight * cargoContainerById[setContainerData.containerId].invNodeCount)
  end
  -- get the final weights of nodes, which is the nodes own weight plus all the cargo weights for this node
  local finalNodeWeights = {}
  for _, container in pairs(cargoContainerById or {}) do
    for _, node in ipairs(container.nodes) do
      finalNodeWeights[node.cid] = (finalNodeWeights[node.cid] or node.nodeWeight) + container.cargoWeightPerNode
    end
  end

  -- apply weight to nodes
  for nodeId, finalWeight in pairs(finalNodeWeights) do
    obj:setNodeMass(nodeId, finalWeight)
  end
end

local function getCargoContainers(params)
  local dataTypeCheck, dataTypeError = checkTableDataTypes(params, {})
  if not dataTypeCheck then
    return {failReason = dataTypeError}
  end
  -- create the cache if it doesnt exist yet.
  if not cargoContainerCache then
    buildContainerCache()
  end
  return cargoContainerCache
end

local function requestRegistration(gi)
  gi.registerModule(moduleName, M.moduleActions, M.moduleLookups)
end

local function onExtensionLoaded()
  M.moduleActions.setCargoContainers = setCargoContainers
  M.moduleLookups.getCargoContainers = getCargoContainers
end

M.onExtensionLoaded = onExtensionLoaded
M.requestRegistration = requestRegistration

return M
