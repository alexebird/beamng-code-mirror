-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local im  = ui_imgui

local C = {}

C.name = 'Cycle Pool'
C.description = 'Toggles one active vehicle and one inactive vehicle, so that the scene will have the same amount of vehicles running.'
C.color = ui_flowgraph_editor.nodeColors.traffic
C.icon = ui_flowgraph_editor.nodeIcons.traffic
C.category = 'once_instant'

C.pinSchema = {
  { dir = 'in', type = 'table', name = 'vehPool', tableType = 'vehiclePool', description = 'Vehicle pool object; use the Create Pool node.' },
  { dir = 'in', type = 'number', name = 'vehId1', description = '(Optional) Vehicle Id of a currently active vehicle.' },
  { dir = 'in', type = 'number', name = 'vehId2', description = '(Optional) Vehicle Id of a currently inactive vehicle.' },
  { dir = 'out', type = 'number', name = 'inactiveId', description = 'Newly inactivate vehicle ID' },
  { dir = 'out', type = 'number', name = 'activeId', description = 'Newly activate vehicle ID' }
}

C.dependencies = {'core_vehiclePoolingManager'}
C.tags = {'traffic', 'budget', 'pooling'}

function C:workOnce()
  if self.pinIn.vehPool.value then
    self.pinIn.vehPool.value:cycle(self.pinIn.activeId.value, self.pinIn.inactiveId.value)
  end
end

return _flowgraph_createNode(C)