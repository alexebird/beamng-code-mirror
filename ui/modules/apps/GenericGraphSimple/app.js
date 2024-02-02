angular.module('beamng.apps')
.directive('genericGraphSimple', [function () {
  return {
    template:
      `<div style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono; color:rgba(255,255,255,1); background-color:rgba(50, 50, 50, 0.9);">
        <div layout="column" style="position: absolute; top: 0; left: 5px;">
          <small ng-repeat="graph in graphList" style="color:{{ ::graph.color }}; padding:2px">{{ ::graph.title }}: {{ values[graph.key] | number:4 }} {{ ::graph.unit }}</small>
        </div>
        <canvas></canvas>
      </div>`,
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      let streamsList = ['genericGraphSimple']
      StreamsManager.add(streamsList)
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      let canvas = element[0].getElementsByTagName('canvas')[0]
      let chart = new SmoothieChart({
        minValue: -1.0,
        maxValue: 1.0,
        millisPerPixel: 20,
        interpolation: 'linear',
        grid: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'black', verticalSections: 4, millisPerLine: 1000, sharpLines: true },
        labels: {fillStyle: 'rgba(0,0,0,0)', precision: 0, fontSize:12}
      })
      let graphs = {}
      scope.values = {}
      scope.graphList = []

      let pausedTime = 0
      chart.streamTo(canvas, 40+pausedTime)

      let lastPaused = undefined
      scope.$on('streamsUpdate', function (event, streams) {
        if (!streams.genericGraphSimple) { return }

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

        for (let i in streams.genericGraphSimple) {
          let d = streams.genericGraphSimple[i]
          let key = d[0]
          if (graphs[key] == null) {
            let unit = d[3]
            let color = d[5]
            let colorString = "#" + "0".repeat(color[0]<10) + color[0].toString(16) + "0".repeat(color[1]<10) + color[1].toString(16) + "0".repeat(color[2]<10) + color[2].toString(16)
            scope.graphList.push({"title": key, "color": colorString, "key": key, "unit": unit})
            graphs[key] = new TimeSeries()
            chart.addTimeSeries(graphs[key], {strokeStyle: colorString, lineWidth: 2})
            scope.$digest()
          }
          let value = d[1]
          let scale = d[2]
          let renderNegatives = d[4]
          let v = value/scale
          if (!renderNegatives) v = (2*Math.max(0, v)) - 1 // render [-scale..+scale], or instead only [0..+scale]
          graphs[key].append(dataTime, v)
          scope.values[key] = value
        }

        scope.$evalAsync(function () {})
      })

      scope.$on('VehicleChange', function () {
        graphs = {}
        scope.values = {}
        scope.graphList = []
        scope.$digest()
      })

      scope.$on('VehicleReset', function () {
        graphs = {}
        scope.values = {}
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
