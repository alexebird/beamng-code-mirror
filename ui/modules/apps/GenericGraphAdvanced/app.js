angular.module('beamng.apps')
.directive('genericGraphAdvanced', [function () {
  return {
    template:
      `<div style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono;background-color:rgba(0, 0, 0, 0.43);">
        <div ng-if="errorMsg">
          genericGraphAdvanced: {{errorMsg}}
        </div>
        <div layout="column" style="position: absolute; top: 0; left: 5px;">
          <small ng-repeat="graph in graphList" style="color:{{ ::graph.color }}; padding:2px">{{ ::graph.title }} (AVG: {{ rollingAvg[graph.key] }} {{ ::graph.unit }})</small>
        </div>
        <canvas></canvas>
      </div>`,
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      let streamsList = ['genericGraphAdvanced']
      StreamsManager.add(streamsList)
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      let WINDOW_SIZE = 100
      let STEP_SIZE = 10
      let rollingAvg = {}
      let isRunning = true;

      let colori = 0
      let contrast_color_list = [
          [255, 0, 0, 255],
          [0, 255, 0, 255],
          [0, 0, 255, 255],
          [255, 255, 0, 255],
          [255, 0, 255, 255],
          [0, 255, 255, 255],
          [96, 128, 200, 255],
          [196, 8, 0, 255],
          [120, 0, 196, 255],
          [90, 255, 255, 255],
          [63, 102, 190, 255],
          [235, 135, 63, 255]
        ]

      scope.rollingAvg = {}; // The data to be displayed in the legend

      let canvas = element[0].getElementsByTagName('canvas')[0]

      let chart = new SmoothieChart({
          millisPerPixel: 20,
          interpolation: 'bezier',
          grid: { fillStyle: 'rgba(250,250,250,0.8)', strokeStyle: 'rgba(0,0,0,0.3)', verticalSections: 10, millisPerLine: 1000, sharpLines: true },
          labels: {fillStyle: 'black', precision: 6, fontSize:12}
        })
      let graphs = {}
      let lastFidx = -1

      scope.graphList = []

      chart.streamTo(canvas, 150)
      scope.errorMsg = undefined

      scope.$on('streamsUpdate', function (event, streams) {
        if (streams.genericGraphAdvanced && (!("_fidx" in streams.genericGraphAdvanced) || streams.genericGraphAdvanced._fidx !== lastFidx)) {
          lastFidx = streams.genericGraphAdvanced._fidx
          delete streams.genericGraphAdvanced._fidx

          if (!isRunning) {
            isRunning = true
            chart.start()
          }
          scope.errorMsg = undefined
          //console.log('genericGraphAdvanced', streams.genericGraphAdvanced)
          let xPoint = new Date()
          let streamMax = 0

          for (let data in streams.genericGraphAdvanced) {
            if (graphs[data] == null) {
              let color
              if (typeof streams.genericGraphAdvanced[data] === 'number') {
                let c = contrast_color_list[colori % contrast_color_list.length]
                color = "#" + "0".repeat(c[0]<10) + c[0].toString(16) + "0".repeat(c[1]<10) + c[1].toString(16) + "0".repeat(c[2]<10) + c[2].toString(16)
                  scope.graphList.push({
                    "title": data,
                    "color": color,
                    "key": data})
              } else {
                if ("max" in streams.genericGraphAdvanced[data]) {
                  chart.options.maxValue = Math.max(streams.genericGraphAdvanced[data].max, streamMax)
                }

                if ("min" in streams.genericGraphAdvanced[data]) {
                  chart.options.minValue = streams.genericGraphAdvanced[data].min
                }

                if ("color" in streams.genericGraphAdvanced[data]) {
                  color = streams.genericGraphAdvanced[data].color
                } else {
                  let c = contrast_color_list[colori % contrast_color_list.length]
                  color = "#" + "0".repeat(c[0]<10) + c[0].toString(16) + "0".repeat(c[1]<10) + c[1].toString(16) + "0".repeat(c[2]<10) + c[2].toString(16)
                }

                scope.graphList.push({
                  "title": ("title" in streams.genericGraphAdvanced[data] ? streams.genericGraphAdvanced[data].title : data),
                  "color": color,
                  "key": data,
                  unit: streams.genericGraphAdvanced[data].unit })
              }
              colori++

              graphs[data] = new TimeSeries()

              rollingAvg[data] = {buffer: [], sum: 0.0, idx: 0, ticks: -1}
              scope.rollingAvg[data] = '---'

              chart.addTimeSeries(graphs[data], {strokeStyle: color, lineWidth: 2})
              scope.$digest()
              return
            }
            let value = typeof streams.genericGraphAdvanced[data] === 'number' ? streams.genericGraphAdvanced[data]: streams.genericGraphAdvanced[data].value
            graphs[data].append(xPoint, value)

            if (rollingAvg[data].buffer.length < WINDOW_SIZE) {
              rollingAvg[data].buffer.push(value)
              rollingAvg[data].sum += value
            } else {
              rollingAvg[data].sum -= rollingAvg[data].buffer[rollingAvg[data].idx]
              rollingAvg[data].sum += value
              rollingAvg[data].buffer[rollingAvg[data].idx] = value
              rollingAvg[data].idx  = (rollingAvg[data].idx + 1) % WINDOW_SIZE
              rollingAvg[data].ticks = (rollingAvg[data].idx + 1) % STEP_SIZE

              if (rollingAvg[data].ticks === 0) {
                scope.rollingAvg[data] = (rollingAvg[data].sum / WINDOW_SIZE).toFixed(6)
              }
            }
          }
          colori = 0

          scope.$evalAsync(function () {})
        } else {
          if (isRunning) {
            isRunning = false
            chart.stop()
          }
          if (lastFidx === -1) {
            scope.errorMsg = 'No data received'
          }
        }
      })

      scope.$on('VehicleChange', function () {
        graphs = {}
        scope.graphList = []
        scope.$digest()
      })

      scope.$on('VehicleReset', function () {
        graphs = {}
        scope.graphList = []
        scope.$digest()
      })

      scope.$on('app:resized', function (event, data) {
        canvas.width = data.width
        canvas.height = data.height
      })
    }
  }
}])
