angular.module('beamng.apps')
.directive('simplePowertrainControl', ['$interval', function ($interval) {
  return {
    template:
    `<svg viewBox = "0 0 250 250" style="margin:0; padding:0; pointer-event:none;">
      <defs>
        <image id="ignition" width="100" height="100" xlink:href="/ui/modules/apps/SimplePowertrainControl/ignition_btn.svg" />

        <g id="connected">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_shaft_connected" />
        </g>
        <g id="disconnected">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_shaft_disconnected" />
        </g>
        <g id="highRangeBoxIcon">
          <circle r="16.5" cx="17.5" cy="17.5" fill="#FFFFFF"/>
          <use fill="#343434" width="36" height="36" xlink:href="#powertrain_rangebox_high" />
        </g>
        <g id="low">
          <circle r="16.5" cx="17.5" cy="17.5" fill="#FFFFFF"/>
          <use fill="#343434" width="36" height="36" xlink:href="#powertrain_rangebox_low" />
        </g>
        <g id="lockedIcon">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_differential_closed" />
        </g>
        <g id="openIcon">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_differential_open" />
        </g>
        <g id="wheelconnected">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_wheel_connected" />
        </g>
        <g id="wheeldisconnected">
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_wheel_disconnected" />
        </g>
        <g id='lsdIcon'>
          <circle r="17.5" cx="17.5" cy="17.5" fill="#343434"/>
          <use fill="white" width="36" height="36" xlink:href="#powertrain_differential_lsd" />
        </g>

        <g id="escGrp">
          <circle r="18" cx="18" cy="18" fill="#FFFFFF"/>
          <path d="M2,18.5 a1,1 0 0,0 30,0" rx="3" id="escLight" />
          <use fill="#343434" id="escIcon" width="36" height="36" xlink:href="#powertrain_esc" />
        </g>

        <g id="n2oGrp">
          <circle r="18" cx="18" cy="18" fill="#343434"/>
          <use id="n2oIcon" width="36" height="36" fill="#FFF" xlink:href="#powertrain_n2o" />
          <circle id="n2oLight" style="transform-origin: 18px 18px; transform: rotate(-90deg)" cx="18" cy="18" r="13.5" fill="transparent" stroke-width="3px" stroke-dasharray="84.78"/>
        </g>

        <g id="jatoGrp">
          <circle r="18" cx="18" cy="18" fill="#343434"/>
          <use id="jatoIcon" width="36" height="36" style="transform-origin: 18px 18px; transform: scale(0.70) rotate(-20deg)" fill="#FFF" xlink:href="#powertrain_jato" />
          <circle id="jatoLight" style="transform-origin: 18px 18px; transform: rotate(-90deg)" cx="18" cy="18" r="13.5" fill="transparent" stroke-width="3px" stroke-dasharray="84.78"/>
        </g>

        <circle r="14" cx="18" cy="18" fill="#FFFFFF" id="escLight2" />
      </defs>
    </svg>`,

    replace: true,
    link:
    function (scope, element, attrs) {
      var streamsList = ['electrics', 'powertrainDeviceData']
      StreamsManager.add(streamsList)

      var svg = element[0]
      var svgIcons = []
      var svgIgnition = []
      var svgText = []
      var svgCreated = 0
      var components = []
      var text = null
      var started = 0

      var modeMap = {
        disconnected: '#disconnected',
        connected: '#connected',
        low: '#low',
        high: '#highRangeBoxIcon',
        locked: '#lockedIcon',
        open: '#openIcon',
        lsd: '#lsdIcon'
      }

      var colour = {
        0: "#000000",
        1: "#FF6600"
      }

      function reset() {
        svgCreated = 0
        // console.log("reset icons")
      }

      function positionIcons(s) {
        var width = 200,
          height = 200,
          angle = 340,
          step = (2 * Math.PI) / 10
        radius = 65
        for (i = 0; i < s.length; i++) {
          s[i].attr({
            x: 107 + Math.round(width / 2 + radius * Math.cos(angle) - 200 / 2),
            y: 80 + Math.round(width / 2 + radius * Math.sin(angle) - 200 / 2),
          })
          angle += step
        }
      }

      function createSVG(data) {
        for (var key in svgIcons) {
          svgIcons[key].remove();  // removing all icon svgs from array
        }

        for (var key in svgIgnition) {
          svgIgnition[key].remove();  // removing all icon svgs from array
        }

        for (var key in svgText) {
          svgText[key].remove();  // removing all icon svgs from array
        }

        if (text !== null) {
          text.attr({   // fixes text from staying when vehicles are changed.
            opacity: 0,
          })
        }

        svgText = []
        svgIgnition = []
        svgIcons = []
        components = []

        // console.log(data)
        if (data.powertrainDeviceData != null) {
          if (data.powertrainDeviceData.devices["mainEngine"] != null || data.powertrainDeviceData.devices["frontMotor"] != null || data.powertrainDeviceData.devices["rearMotor"] != null) {
            var ignitionLight = hu('<circle>', svg).attr({
              cx: 120,
              cy: 90,
              r: 30,
              fill: "#FF6600",
            })

            var ignition = hu('<use>', svg).attr({
              x: 73,
              y: 49,
              'xlink:href': "#ignition",
              cursor: 'pointer',
            })

            svgIgnition.push(ignitionLight)
            svgIgnition.push(ignition)

            svgIgnition[1].on('mousedown', function () {
              bngApi.activeObjectLua('electrics.toggleIgnitionLevelOnDown()')
              // emit()
              // if (started === 1) {
              //   bngApi.activeObjectLua('controller.mainController.setStarter(true)')
              //   bngApi.activeObjectLua('controller.mainController.setStarter(false)')
              //   started = 0
              // }
              // else if (started === 0) {
              //   bngApi.activeObjectLua('controller.mainController.setStarter(true)')
              //   bngApi.activeObjectLua('controller.mainController.setStarter(false)')
              //   started = 1
              // }
            })
            svgIgnition[1].on('mouseup', function () {
              bngApi.activeObjectLua('electrics.toggleIgnitionLevelOnUp()')
            })
          }

          //TODO: remove since buttons are now generated by lua rather than JS
          //for (var key in data.powertrainDeviceData.devices) {
          //  if (data.powertrainDeviceData.devices[key].currentMode != null && data.powertrainDeviceData.devices[key].uiSimpleModeControl == true) {
          //    components.push(key)
          //  }
          //}

          components.sort()
          //console.log("components", components)

          //TODO: remove since buttons are now generated by lua rather than JS
          //for (var key in components) {
          //  if (data.powertrainDeviceData.devices[components[key]].currentMode != null) {
          //    svgIcons.push(hu('<use>', svg).attr({
          //      id: components[key],
          //      'xlink:href': modeMap[data.powertrainDeviceData.devices[components[key]].currentMode],
          //      cursor: 'pointer',
          //      "background-color": "#FFFFFF"
          //    }))
          //  }
          //}

          //TODO: remove since buttons are now generated by lua rather than JS
          // ESC Icon
          //if (data.escInfo) {
          //  svgIcons.push(hu('<use>', svg).attr({

          //    'xlink:href': '#escGrp',
          //    cursor: 'pointer',
          //  }).on('mousedown', function () {
          //    bngApi.activeObjectLua("if controller.getController('driveModes') then controller.getController('driveModes').nextDriveMode() else controller.getControllerSafe('esc').toggleESCMode() end")
          //  }))
          //}

          //TODO: remove since buttons are now generated by lua rather than JS
          // N2O Icon
          //if (data.n2oInfo) {
          //  svgIcons.push(hu('<use>', svg).attr({
          //    id: 'N2O',
          //    'xlink:href': '#n2oGrp',
          //    cursor: 'pointer',
          //  }).on('mousedown', function () {
          //    bngApi.activeObjectLua("controller.getController('nitrousOxideInjection').toggleActive()")
          //  }))
          //}

          //TODO: remove since buttons are now generated by lua rather than JS
          // jato Icon
          //if (data.electrics.jato !== undefined) {
          //  svgIcons.push(hu('<use>', svg).attr({
          //    id: 'Jato',
          //    'xlink:href': '#jatoGrp',
          //    cursor: 'pointer',
          //  }).on('mousedown', function () {
          //    bngApi.activeObjectLua("electrics.values.jatoInput = 1 - (electrics.values.jatoInput or 0)")
          //  }))
          //}

          text = hu('<text>', svg).attr({
            opacity: 0,
          }).css({
            fill: "#FFFFFF",
            "text-align": "left",
            "font-weight": "bold",
            "font-size": 15,
            "text-shadow": "1px 2px black", // allows text to be easy to read
          }).on('mouseover', function () {
            text.attr({
              opacity: 0,
            }).text(
              ""
              )
          })

          svgIcons.forEach(function (el, i) {
            el.on('mousedown', function () {
              bngApi.activeObjectLua('powertrain.toggleDeviceMode("' + components[i] + '")')
            }).on('mouseover', function () {
              //console.log(svgIcons[i])
              text.attr({
                x: svgIcons[i].attr('x'),
                y: svgIcons[i].attr('y'),
                opacity: 1,
              }).text(
                svgIcons[i].n.id
                )
            }).on('mouseleave', function () {
              text.attr({
                opacity: 0,
              }).text(
                ""
                )
            })
          })


          positionIcons(svgIcons);    // function used to position icons around starter
          svgCreated = 1
        }

        bngApi.activeObjectLua("extensions.ui_simplePowertrainControl.updateButtons()")
      }



      scope.$on('streamsUpdate', function (event, data) {
        if (svgCreated === 0) {

          createSVG(data)
          bngApi.activeObjectLua("extensions.ui_simplePowertrainControl.updateButtons()")
        }

        // updating esc light
        //if (data.escInfo) {
        //  hu('#escLight', svg).attr({ fill: "#" + data.escInfo.ledColor })
        //}

        // updating n2o light
        //if (data.n2oInfo) {
        //  hu('#n2oLight', svg).attr({ stroke: "#" + (data.n2oInfo.isArmed ? '98FB00' : 'FFFFFF') })
        //  if (data.n2oInfo.isActive) {
        //    hu('#n2oLight', svg).attr({ stroke: '#3096F1' })
        //  }
        //  hu('#n2oLight', svg).attr({ 'stroke-dashoffset': ((1 - data.n2oInfo.tankRatio) * - 84.78) })
        //}

        // updating jato light
        //if (data.electrics) {
        //  if (data.electrics.jato !== undefined) {
        //    hu('#jatoLight', svg).attr({ stroke: "#" + (data.electrics.jato === 1 ? '0072bc' : '0072bc') })
        //    hu('#jatoLight', svg).attr({ 'stroke-dashoffset': ((1 - data.electrics.jatofuel) * - 84.78) })
        //  }
        //}

        //TODO: remove since buttons are now generated by lua rather than JS
        //if (data.powertrainDeviceData) {
        //  for (i = 0; i < svgIcons.length; i++) {   // updating icons to represent their current state
        //    let device = data.powertrainDeviceData.devices[components[i]]
        //    if (device) {
        //      if (components[i] === "wheelaxleFL" || components[i] === "wheelaxleFR") {  // used to assign correct wheel axle icons instead of regular drive shafts

        //        if(svgIcons[i].n.href.baseVal !== ('#wheel' + device.currentMode))
        //          svgIcons[i].attr({ 'xlink:href': '#wheel' + device.currentMode })

        //      } else if (data.powertrainDeviceData.devices[components[i]]) {

        //        if(svgIcons[i].n.href.baseVal !== modeMap[device.currentMode])
        //          svgIcons[i].attr({ 'xlink:href': modeMap[device.currentMode] })

        //      }
        //    }
        //  }
        //}

        // updating ignition light
        if (data.electrics) {
          if (svgIgnition[1]) {
            svgIgnition[0].attr({ fill: colour[data.electrics.ignitionLevel > 0 ? 1 : 0] })
            if (data.electrics.ignitionLevel === 1){
              svgIgnition[0].attr({ class: "flashing" });
            } else {
              svgIgnition[0].attr({ class: "" });
            }
          }
        }

      })

      scope.$on('VehicleChange', function () {
        reset()
        bngApi.activeObjectLua("extensions.ui_simplePowertrainControl.updateButtons()")
      })

      scope.$on('VehicleFocusChanged', function () {
        reset()
        bngApi.activeObjectLua("extensions.ui_simplePowertrainControl.updateButtons()")
      })

      function updateSVG(data) {
        //Generates a new svg icon, appends it on the svg defs
        let detached
        if (!!data.remove){
          // removing icon
          let toRemove = svgIcons.map(e => e.n.id).indexOf(data.id)
          if (toRemove > -1){
            svgIcons[toRemove].remove()
            svgIcons.splice(toRemove, 1)
          }
          positionIcons(svgIcons)
        }

        let exists = hu("#" + data.id, svg)
        if (!exists && !data.remove){
          //Order matters
          let customGroup = hu('<g>', svg.children[0]).attr({id: data.id})
          //background circle
          let c = hu('<circle>', customGroup).attr({r: 18, cx: 18, cy:18, fill: data.ringValue ? "#343434" : data.color || "#343434"})
          //esc light bottom half circle
          if (data.color && !data.ringValue) {
            hu('<use>', customGroup).attr({
              'href': "#escLight2",
              fill: "#" + data.color
            })
          }
          //grabbing svg from external file, the front of the button
          let extSVG = hu('<use>', customGroup).attr({
            id: data.id,
            'xlink:href': "#" + data.icon,
            cursor: 'pointer',
            width: 36,
            height: 36,
            fill: "#FFFFFF"
          })
          //adding a ring on top
          if (data.ringValue){
            hu('<use>', customGroup).attr({
              'href': "#n2oLight",
              stroke: "#" + (data.color ? data.color : "FFFFFF"),
              'stroke-dashoffset': ((1 - data.ringValue) * - 84.78)
            })
          }

          svgIcons.push(hu('<use>', svg).attr({
            id: data.id,
            'xlink:href': "#" + data.id,
            cursor: 'pointer',
          }).on('mousedown', function () {
            bngApi.activeObjectLua(data.onClick)
          }).on('mouseover', function () {
            text.attr({
              x: svgIcons[svgIcons.length -1].attr('x'),
              y: svgIcons[svgIcons.length -1].attr('y'),
              opacity: 1,
            }).text(
              data.tooltip || ""
              )
          }).on('mouseleave', function () {
            text.attr({
              opacity: 0,
            }).text(
              ""
              )
          }))
          positionIcons(svgIcons)

        } else if (!data.remove) {
          let toRemove = svgIcons.map(e => e.n.id).indexOf(data.id)
          if (toRemove > -1) {
            svgIcons[toRemove].remove()
            detached = svgIcons.slice(toRemove)
            detached.shift()
            svgIcons.splice(toRemove, detached.length + 1)
          }

          let extSVG = hu("#"+data.id, exists).attr({
            id: data.id,
            'xlink:href': "#" + data.icon,
            cursor: 'pointer',
            width: 36,
            height: 36,
            fill: "#FFFFFF"
          })
          if (data.color && !data.ringValue) {
            hu('#escLight2', svg).attr({
              fill: "#" + data.color
            })
          }
          if (data.ringValue){
            hu('#n2oLight', svg).attr({
              stroke: "#" + (data.color ? data.color : "FFFFFF"),
              'stroke-dashoffset': ((1 - data.ringValue) * - 84.78)
            })
          }
          svgIcons.push(hu('<use>', svg).attr({
            id: data.id,
            'xlink:href': "#" + data.id,
            cursor: 'pointer',
          }).on('mousedown', function () {
            bngApi.activeObjectLua(data.onClick)
          }).on('mouseover', function () {
            text.attr({
              x: svgIcons[svgIcons.length -1].attr('x'),
              y: svgIcons[svgIcons.length -1].attr('y'),
              opacity: 1,
            }).text(
              data.tooltip
              )
          }).on('mouseleave', function () {
            text.attr({
              opacity: 0,
            }).text(
              ""
              )
          }))
          if (detached) svgIcons = svgIcons.concat(detached)
          positionIcons(svgIcons)
        }
      }

      scope.$on('ChangePowerTrainButtons', function (event, data) {
        // console.log("changing icons", data)
        updateSVG(data)
      })

      //uncomment for TEST with ignition button click
      // function emit(){
      //   scope.$emit('ChangePowerTrainButtons', {id: 'powertrain_device_mode_shortcut_wheelaxleFR', icon: "powertrain_esc", onClick: 'something', tooltip: "Some Tooltip", remove: false, ringValue: 0.5,
      //    color: "3096F1"})
      // }

      // function emit2(){
      //   scope.$emit('ChangePowerTrainButtons', {id: 'powertrain_device_mode_shortcut_wheelaxleFR', icon: "editor_tb_width_slimmer", color: "FFFFFF", ringValue: 0.8})
      // }

      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })
    }
  }
}])
