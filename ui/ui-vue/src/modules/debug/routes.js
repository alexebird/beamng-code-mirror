// Debug routes --------------------------------------
import ComponentsView from '@/modules/debug/views/ComponentsView.vue'
import RoutesListView from '@/modules/debug/views/RouteListView.vue'
import UITestView from '@/modules/debug/views/UITestView.vue'
import UITestViewJon from '@/modules/debug/views/UITestViewJon.vue'
import UITestViewPavel from '@/modules/debug/views/UITestViewPavel.vue'
import UITestViewDestiny from '@/modules/debug/views/UITestViewDestiny.vue'
import ControllerUITest from '@/modules/debug/views/ControllerUITest.vue'
import ActiviityStart from '@/modules/activitystart/views/ActivityStart.vue'
import MissionDetails from '@/modules/missions/views/MissionDetails.vue'


export default [
  {
    path: '/components',
    name: 'components',
    component: ComponentsView
  },
  {
    path: '/routelist',
    name: 'routelist',
    component: RoutesListView
  },
  {
    path: '/ui-test',
    name: 'ui-test',
    component: UITestView
  },
  {
    path: '/ui-test-jon:id(\\*?.*?)?',
    name: 'ui-test-jon',
    component: UITestViewJon,
    props:true
  },
  {
    path: '/ui-test-pavel',
    name: 'ui-test-pavel',
    component: UITestViewPavel
  },
  {
    path: '/ui-test-destiny',
    name: 'ui-test-destiny',
    component: UITestViewDestiny
  },
  {
    path: '/controllerUITest',
    name: 'controllerUITest',
    component: ControllerUITest,
  },
  {
    path: '/ActivityStart',
    name: 'ActivityStart',
    component: ActiviityStart,
  },
  {
    path: '/mission-details',
    name: 'MissionDetails',
    component: MissionDetails
  }
]