angular.module('beamng.apps')
.directive('turboActivityGraph', [function () {
  return {
    template:
        '<div style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono;">' +
          '<div layout="column" style="position: absolute; top: 0; left: 5px;">' +
            '<small style="color:#0F51BA; padding:2px">{{:: "ui.apps.turbo_activity_graph.TurboRPM" | translate}}</small>' +
            '<small style="color:#15DA00; padding:2px">{{:: "ui.apps.turbo_activity_graph.Boost" | translate}}</small>'+
            '<small style="color:#FB000D; padding:2px" >{{:: "ui.apps.turbo_activity_graph.Wastegate" | translate}}</small>'+
            '<small style="color:#FFA200; padding:2px">{{:: "ui.apps.turbo_activity_graph.BOV" | translate}}</small>' +
          '</div>' +
          '<canvas></canvas>' +
        '</div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var streamsList = ['forcedInductionInfo']
      StreamsManager.add(streamsList)
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      var chart = new SmoothieChart({
          //minValue: -3,
          //maxValue: 3,
          millisPerPixel: 20,
          interpolation: 'bezier',
          grid: { fillStyle: 'rgba(250,250,250,0.8)', strokeStyle: 'rgba(0,0,0,0.3)', verticalSections: 0, millisPerLine: 1000, sharpLines: true },
          labels: {fillStyle: 'black'}
        })
        , rpmGraph = new TimeSeries()
        , boostGraph = new TimeSeries()
        , wastegateGraph = new TimeSeries()
        , bovGraph = new TimeSeries()

      var canvas = element[0].getElementsByTagName('canvas')[0]

      let isRunning = false

      chart.addTimeSeries(rpmGraph,         {strokeStyle: '#0F51BA', lineWidth: 1.5})
      chart.addTimeSeries(boostGraph,       {strokeStyle: '#15DA00', lineWidth: 1.5})
      chart.addTimeSeries(wastegateGraph,   {strokeStyle: '#FB000D', lineWidth: 1.5})
      chart.addTimeSeries(bovGraph,         {strokeStyle: '#FFA200', lineWidth: 1.5})
      chart.streamTo(canvas, 40)

      scope.$on('streamsUpdate', function (event, streams) {
        if (streams.forcedInductionInfo) {
          if (!isRunning) {
            isRunning = true
            chart.start()
          }
          var xPoint = new Date()
          rpmGraph.append(xPoint, streams.forcedInductionInfo.rpm / 10000)
          boostGraph.append(xPoint, streams.forcedInductionInfo.boost)
          wastegateGraph.append(xPoint, streams.forcedInductionInfo.wastegateFactor)
          bovGraph.append(xPoint, streams.forcedInductionInfo.bovEngaged)
        } else {
          if (isRunning) {
            isRunning = false
            chart.stop()
          }
        }
      })

      scope.$on('app:resized', function (event, data) {
        canvas.width = data.width
        canvas.height = data.height
      })

    }
  }
}])