(function () {
  'use strict'
  angular.module('beamng.apps')
  .directive('damageApp', ['$sce', '$timeout', 'translateService', function ($sce, $timeout, translateService) {
    return {
      template:
      `
        <div>
          <div style="width: 100%; height: 100%" ng-include="'/ui/modules/apps/DamageAppVehicleSimple/damage_car.svg'" onload="svgLoaded()"></div>
        </div>
      `,
      replace: true,
      link: function ($scope, element, attrs) {
        // Streams:
        var streamsList = ['wheelThermalData', 'engineInfo']
        StreamsManager.add(streamsList)

        var greenColor  = `rgba(0,   255, 0, 0.6)`,
            orangeColor = `rgba(255, 132, 0, 0.6)`,
            redColor    = `rgba(255, 0,   0, 0.6)`,
            noDataColor = 'rgba(0,   0,   0, 0  )',
            damageQueue = [],     // Array used to store each instance of damage so that damage text can be cycled through
            hasDamage = 0, // Value to check if damage has occured
            textDisplayTime = 2000,// Amount of time damage text is shon in milliseconds
            beams = {},
            appDisplayed = 0,
            animTimeout,
            damageTimeout = null,
            textFunction,
            permanentDamage = 0,
            permanentDamagedParts = 0

        // Method only called once the SVG has completed loaded
        $scope.svgLoaded = function () {
          var svg = element[0].children[0].children[0],
              svgCarGroup = hu('#carGroup', svg),
              svgDamageTextContainer = hu('#dmgContainer', svg),
              svgDamageText = hu('#dmgText', svg)

          // Map for powertrain components
          // Since we re-use the same SVG for multiple damage types, the priority value is used so
          // that more important damage can be shown as red else the damage will be shown as orange
            var componentDamageMap = {
              body: {
                FL: { svgId: '#bodyFL', priority: 2, damageDisplayed: 0, tempDamage: false },
                FR: { svgId: '#bodyFR', priority: 2, damageDisplayed: 0, tempDamage: false },
                ML: { svgId: '#bodyML', priority: 2, damageDisplayed: 0, tempDamage: false },
                MR: { svgId: '#bodyMR', priority: 2, damageDisplayed: 0, tempDamage: false },
                RL: { svgId: '#bodyRL', priority: 2, damageDisplayed: 0, tempDamage: false },
                RR: { svgId: '#bodyRR', priority: 2, damageDisplayed: 0, tempDamage: false }
              },

              engine: {
                oilStarvation:                  { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.oilStarvation',                tempDamage: true },
                coolantHot:                     { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.coolantHot',                   tempDamage: false },
                oilHot:                         { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.oilHot',                       tempDamage: false },
                pistonRingsDamaged:             { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.pistonRingsDamaged',           tempDamage: false },
                rodBearingsDamaged:             { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.rodBearingsDamaged',           tempDamage: false },
                headGasketDamaged:              { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.headGasketDamaged',            tempDamage: false },
                turbochargerHot:                { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.turbochargerHot',              tempDamage: false },
                engineIsHydrolocking:           { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.engineIsHydrolocking',         tempDamage: false },
                engineReducedTorque:            { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.engineReducedTorque',          tempDamage: false },
                mildOverrevDamage:              { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.mildOverrevDamage',            tempDamage: false },
                catastrophicOverrevDamage:      { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.catastrophicOverrevDamage',    tempDamage: false },
                overRevDanger:                  { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.overRevDanger',                tempDamage: false },
                overTorqueDanger:               { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.overTorqueDanger',             tempDamage: false },
                catastrophicOverTorqueDamage:   { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.catastrophicOverTorqueDamage', tempDamage: false },
                engineHydrolocked:              { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.engineHydrolocked',            tempDamage: false },
                engineDisabled:                 { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.engineDisabled',               tempDamage: false },
                blockMelted:                    { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.blockMelted',                  tempDamage: false },
                engineLockedUp:                 { svgId: '#engine',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.engineLockedUp',               tempDamage: false },
                radiatorLeak:                   { svgId: '#radiator',   priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.radiatorLeak',                 tempDamage: false },
                oilpanLeak:                     { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.oilpanLeak',                   tempDamage: false },
                inductionSystemDamaged:         { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.inductionSystemDamaged',       tempDamage: false },
                impactDamage:                   { svgId: '#engine',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.engine.impactDamage',                 tempDamage: false },
              },
              gearbox: {
                synchroWear: { svgId: '#engine', priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.gearbox.synchroWear', tempDamage: true }
              },
              powertrain: {
                wheelaxleFL:    { svgId: '#wheelaxleFL',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.wheelaxleFL',      tempDamage: false },
                wheelaxleFR:    { svgId: '#wheelaxleFR',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.wheelaxleFR',      tempDamage: false },
                wheelaxleRL:    { svgId: '#wheelaxleRL',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.wheelaxleRL',      tempDamage: false },
                wheelaxleRR:    { svgId: '#wheelaxleRR',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.wheelaxleRR',      tempDamage: false },
                driveshaft:     { svgId: '#driveshaft',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.driveshaft',       tempDamage: false },
                driveshaft_F:   { svgId: '#driveshaft',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.driveshaft_F',     tempDamage: false },
                mainEngine:     { svgId: '#engine',         priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.powertrain.mainEngine',       tempDamage: false }
              },
              energyStorage: {
                mainTank: { svgId: '#fueltank', priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.energyStorage.mainTank', tempDamage: false }
              },
              wheels: {
                tireFL:             { svgId: '#tireFL',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.tireFL',           tempDamage: false },
                tireFR:             { svgId: '#tireFR',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.tireFR',           tempDamage: false },
                tireRL:             { svgId: '#tireRL',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.tireRL',           tempDamage: false },
                tireRR:             { svgId: '#tireRR',     priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.tireRR',           tempDamage: false },
                brakeFL:            { svgId: '#brakeFL',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeFL',          tempDamage: false },
                brakeFR:            { svgId: '#brakeFR',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeFR',          tempDamage: false },
                brakeRL:            { svgId: '#brakeRL',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeRL',          tempDamage: false },
                brakeRR:            { svgId: '#brakeRR',    priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeRR',          tempDamage: false },
                brakeOverHeatFL:    { svgId: '#brakeFL',    priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeOverHeatFL',  tempDamage: true },
                brakeOverHeatFR:    { svgId: '#brakeFR',    priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeOverHeatFR',  tempDamage: true },
                brakeOverHeatRL:    { svgId: '#brakeRL',    priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeOverHeatRL',  tempDamage: true },
                brakeOverHeatRR:    { svgId: '#brakeRR',    priority: 0, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.brakeOverHeatRR',  tempDamage: true },
                FL:                 { svgId: '#tireFL',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.FL',               tempDamage: false },
                FR:                 { svgId: '#tireFR',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.FR',               tempDamage: false },
                RL:                 { svgId: '#tireRL',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.RL',               tempDamage: false },
                RR:                 { svgId: '#tireRR',     priority: 1, damageDisplayed: 0, damageText: 'ui.apps.damage_app_vehicle_simple.component.wheels.RR',               tempDamage: false }
              }
            }


          function showText() {
            if (damageQueue && damageQueue.length > 0) {
              svgDamageText.css({opacity:1}).text(translateService.contextTranslate(damageQueue[0].damageText))
              svgDamageTextContainer.css({opacity:1})
              damageQueue.splice(0, 1);  // removing current item from array
              animTimeout = $timeout(showText, textDisplayTime)
            }
            else {
              svgDamageText.css({opacity:0}).text('')
              svgDamageTextContainer.css({opacity:0})

              if (permanentDamagedParts === 0) {
                if(damageTimeout){
                  $timeout.cancel(damageTimeout)
                }
                damageTimeout = $timeout(function() {
                  svgCarGroup.animate({opacity: 0}, 200)
                }, 2500)
              } else {
                $timeout.cancel(damageTimeout)
              }

              appDisplayed = 0
              damageQueue = []
              $timeout.cancel(animTimeout)
            }
          }

          function showApp(arr) {

            svgCarGroup.animate({opacity: 1,},200)
            showText()
          }

          function reset() {
            for (var key in componentDamageMap) {
              for (var val in componentDamageMap[key]) {
                hu(componentDamageMap[key][val].svgId, svg).css({
                  fill: noDataColor
                })
                componentDamageMap[key][val].damageDisplayed = 0
                hu(componentDamageMap[key][val].svgId, svg).n.classList.remove("flashAnim")
              }
            }
            // svgCarGroup.attr({opacity: 1})
            hasDamage = 0
            permanentDamage = 0
            permanentDamagedParts = 0
            appDisplayed = 0
            damageQueue = []
            showApp()
          }

          function setDamage(component, color, anim) {
            hu(component.svgId, svg).css({
              fill: color
            }).attr({
              class: anim
            }).on('webkitAnimationEnd', function (){
              hu(component.svgId, svg).n.classList.remove("flashAnim")
            })
          }

          function checkDamage(type, component, data) {
            if (componentDamageMap[type] && componentDamageMap[type][component] !== undefined) {
              var damagedComponent = componentDamageMap[type][component]
              if (damagedComponent.damageDisplayed === 0) {
                if (data[type][component] === true || data[type][component] > 0) {
                  if (damagedComponent.priority === 1) {
                    permanentDamage = 1
                    permanentDamagedParts += 1
                    $timeout.cancel(damageTimeout)
                    setDamage(damagedComponent, redColor, 'flashAnim')
                  } else if (damagedComponent.priority === 0) {
                    permanentDamage = 1
                    permanentDamagedParts += 1
                    $timeout.cancel(damageTimeout)
                    setDamage(damagedComponent, orangeColor, 'flashAnim')
                  } else if (damagedComponent.priority === 2 ) {
                    var damageAmount = Math.round(data[type][component] * 1000)
                    var bodyColor = `rgba(${150+damageAmount}, ${150-damageAmount}, 0, 0.6)`
                    setDamage(damagedComponent, bodyColor, '')
                  }
                  hasDamage = 1
                  if (damagedComponent.damageText !== undefined && damagedComponent.damageDisplayed === 0) {
                    damageQueue.push(damagedComponent); // Adding damaged components to a queue so their damage text can be displayed over a certain period of time
                    damagedComponent.damageDisplayed = 1
                  }
                }
              } else if (damagedComponent.tempDamage) {
                if (data[type][component] === true || data[type][component] > 0) {
                  setDamage(damagedComponent, orangeColor, 'flashAnim')
                }
                else if (data[type][component] === false || data[type][component] === 0) {
                  damagedComponent.damageDisplayed = 0
                  permanentDamagedParts -= 1
                  setDamage(damagedComponent, noDataColor, '')
                }
              }
            }
          }

          $scope.$on('DamageData', (ev, data) => {
            for (var key in data) {
              for (var val in data[key]) {
                checkDamage(key, val, data)
              }
            }
            if (appDisplayed === 0 && hasDamage) {
              appDisplayed = 1
              showApp(damageQueue)
            }
          })

          $scope.$on('DamageMessage', (ev, data) => {
            damageQueue.push(data)
            showApp()
          })

          $scope.$on('VehicleReset', function() {
            reset()
          })

          $scope.$on('VehicleChange', function() {
            reset()
          })

          // request skeleton on TAB
          $scope.$on('VehicleFocusChanged', function(evt, data) {
            if (data.mode === true) {
              reset()
            }
          })

          $scope.$on('$destroy', function () {
            StreamsManager.remove(streamsList)
          })
        }
      }
    }
  }])
})()
