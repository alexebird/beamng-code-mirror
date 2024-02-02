angular.module('beamng.apps')
.directive('forceFeedbackGraph', function () {
  return {
    restrict: 'E',
    template: `
      <div>
        <canvas width="400" height="160"></canvas>
        <div class="md-caption" style="padding: 2px; color: silver; position: absolute; top: 0; left: 0; width: auto; height: auto; background-color: rgba(50, 50, 50, 0.9)" layout="column">
          <md-checkbox style="margin:0px" ng-model="showForces">{{:: 'ui.apps.ffb_graph.Force' | translate}}</md-checkbox>
          <span ng-show="showForces" layout="column">
              <span style="color: #FD9393; margin:0px">{{:: 'ui.apps.ffb_graph.Atdriver' | translate}}: {{ sensors.ffbAtDriver }}</span>
              <span style="color: #FF4343; margin:0px">{{:: 'ui.apps.ffb_graph.Atwheel' | translate}}: {{ sensors.ffbAtWheel }}</span>
              <span style="color: #992343; margin:0px">{{:: 'ui.apps.ffb_graph.Limit' | translate}}: &plusmn;{{ sensors.maxffb }}</span>
          </span>
          <md-checkbox style="margin:0px" ng-model="showInput">{{:: 'ui.apps.ffb_graph.Input' | translate}}</md-checkbox>
          <span ng-show="showInput" layout="column">
              <span style="color: #A8DD73; margin:0px">{{:: 'ui.apps.ffb_graph.Steering' | translate}}: {{ input }}%</span>
              <span style="color: #A8DD73; margin:0px">{{:: 'ui.apps.ffb_graph.MaxSteering' | translate}}: {{ maxInput }}%</span>
          </span>
        </div>
      </div>`,
    replace: true,
    link: function (scope, element, attrs) {
      var streamsList = ['sensors', 'electrics']
      StreamsManager.add(streamsList)
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      scope.showForces = true
      scope.showInput = true
      var canvas = element[0].children[0]
      var chart = new SmoothieChart({
          minValue: -1.0,
          maxValue: 1.0,
          millisPerPixel: 20,
          interpolation: 'linear',
          grid: { fillStyle: 'rgba(0,0,0,0.43)', strokeStyle: 'black', verticalSections: 4, millisPerLine: 1000, sharpLines: true }
        })
        , ffbAtDriverGraph=new TimeSeries()
        , ffbAtWheelGraph= new TimeSeries()
        , steerGraph     = new TimeSeries({"resetBoundsInterval":250})
        , maxffbGraphPos = new TimeSeries()
        , maxffbGraphNeg = new TimeSeries()
        , steerLine     = { strokeStyle: '#A8DD73', lineWidth: 3 }
        , maxffbLinePos = { strokeStyle: '#992343', lineWidth: 1 }
        , maxffbLineNeg = { strokeStyle: '#992343', lineWidth: 1 }
        , ffbAtDriverLine={ strokeStyle: '#FD9393', lineWidth: 2 }
        , ffbAtWheelLine= { strokeStyle: '#FF4343', lineWidth: 2 }
        , ffbScale      = 10.0


      let pausedTime = 0
      chart.addTimeSeries(steerGraph,     steerLine)
      chart.addTimeSeries(maxffbGraphPos, maxffbLinePos)
      chart.addTimeSeries(maxffbGraphNeg, maxffbLineNeg)
      chart.addTimeSeries(ffbAtDriverGraph,            ffbAtDriverLine)
      chart.addTimeSeries(ffbAtWheelGraph,      ffbAtWheelLine)
      chart.streamTo(canvas, 40+pausedTime)

      scope.sensors = {
        maxffb: 0,
        ffbAtDriver: 0,
        ffbAtWheel: 0,
      }
      scope.input = 0

      let lastPaused = undefined
      scope.$on('streamsUpdate', function (event, streams) {
        if (!streams.sensors || !streams.electrics) { return }

        let now = new Date().getTime()
        if (scope.$parent.$parent.app.showPauseIcon) {
          if (lastPaused === undefined) {
            lastPaused = now
            chart.stop()
          }
          return
        }
        if (lastPaused !== undefined) {
          pausedTime += now - lastPaused
          lastPaused = undefined
          chart.streamTo(canvas, 40+pausedTime)
          chart.start()
        }

        let dataTime = now - pausedTime
        if (scope.showInput) {
          steerGraph.append(dataTime, streams.electrics.steering_input);   // current steering
        }
        if (scope.showForces) {
          maxffbGraphPos.append(dataTime,  streams.sensors.maxffb / ffbScale); // ffb limit (from binding settings)
          maxffbGraphNeg.append(dataTime, -streams.sensors.maxffb / ffbScale); // ffb limit (from binding settings)
          ffbAtDriverGraph.append(dataTime,  streams.sensors.ffbAtDriver / ffbScale); // current ffb, corrected against FFB response curve
          ffbAtWheelGraph.append(dataTime,  streams.sensors.ffbAtWheel    / ffbScale); // current ffb
        }

        var dirty = false
        for (var key in scope.sensors) {
            if (streams.sensors[key] !== undefined && scope.sensors[key] != streams.sensors[key].toFixed(1)) {
                dirty = true
                break
            }
        }
        if (streams.electrics.steering_input !== undefined && scope.input != (streams.electrics.steering_input*100).toFixed(0)) dirty = true

        if (dirty) {
          scope.$apply(() => {
            for (var key in scope.sensors) {
              if (streams.sensors[key] !== undefined) {
                scope.sensors[key] = streams.sensors[key].toFixed(1)
              }
            }
            if (streams.electrics.steering_input !== undefined) {
              scope.input = (streams.electrics.steering_input*100).toFixed(1)
              scope.maxInput = (steerGraph.maxValue*100).toFixed(1)
            }
          })
        }
      })

      scope.$on('app:resized', function (event, data) {
        canvas.width = data.width
        canvas.height = data.height
      })
    }
  }
})
