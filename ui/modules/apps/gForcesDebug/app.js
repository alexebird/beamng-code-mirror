angular.module('beamng.apps')
.directive('gforcesDebug', [function () {
  return {
    template: '<canvas width="300" height="300"></canvas>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var streamsList = ['sensors']
      StreamsManager.add(streamsList)

      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      var c = element[0]
        , ctx = c.getContext('2d')
        , history = []
        , historySize = 50
        , maxG = 2
        , circleSize = 100 / maxG
        , gxMin = 0.0
        , gxMax = 0.0
        , gyMin = 0.0
        , gyMax = 0.0
        , gxLargest = 0.0
        , gyLargest = 0.0
        , frameCounter = 0


      ctx.setTransform(c.width/200, 0, 0, c.height/200, c.width/2,c.height/2)

      scope.$on('streamsUpdate', function (event, streams) {
        if (!streams.sensors) { return }

        var gForces = {}

        var gravity = streams.sensors.gravity
        gravity = gravity >= 0 ? Math.max(0.1, gravity) : Math.min(-0.1, gravity)

        for (var key in streams.sensors) {
          gForces[key] = streams.sensors[key] / -gravity
        }
        frameCounter++
        if (frameCounter == 200) {
          frameCounter = 0
          gxMin = 0.0
          gxMax = 0.0
          gyMin = 0.0
          gyMax = 0.0
        }

        gxMax = Math.max(gxMax, gForces.gx2)
        gxMin = Math.min(gxMin, gForces.gx2)
        gyMax = Math.max(gyMax, gForces.gy2)
        gyMin = Math.min(gyMin, gForces.gy2)
        gxLargest = -gxMin > gxMax ? gxMin : gxMax
        gyLargest = -gyMin > gyMax ? gyMin : gyMax

        var px = gForces.gx2 *  circleSize
        var py = gForces.gy2 * -circleSize

        ctx.clearRect(-100,-100,200,200)
        // ctx.clearRect(0, 0, 300, 300)

        // draw background circles
        let circleBorder = 1.5
        ctx.strokeStyle = "RGBA(0,0,0, 0.0)"
        ctx.fillStyle = "RGBA(0,0,0, 0.35)"
        ctx.lineWidth = circleBorder
        ctx.beginPath()
        ctx.arc(0,0,circleSize*maxG,0,2*Math.PI,false)
        ctx.fill()
        ctx.stroke()
        for (var i = 1; i <= maxG; i++) {
            ctx.strokeStyle = "RGBA(63,63,63, 0.5)"
            ctx.fillStyle = "RGBA(63,63,63, 0.0)"
            ctx.lineWidth = circleBorder
            ctx.beginPath()
            ctx.arc(0,0,circleSize*i-0.5*circleBorder,0,2*Math.PI,false)
            ctx.fill()
            ctx.stroke()
        }

        // draw background markers
        ctx.strokeStyle = "RGBA(63,63,63, 0.5)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(-maxG*circleSize, 0)
        ctx.lineTo(+maxG*circleSize, 0)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0,-maxG*circleSize)
        ctx.lineTo(0,+maxG*circleSize)
        ctx.stroke()

        // draw min/max G ends
        ctx.strokeStyle = "rgba(255, 165, 63, 1.0)"
        ctx.lineWidth = 2
        let size = 6
        ctx.beginPath()
        ctx.moveTo(gxLargest * circleSize, -size)
        ctx.lineTo(gxLargest * circleSize, +size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(-size, gyLargest * -circleSize)
        ctx.lineTo(+size, gyLargest * -circleSize)
        ctx.stroke()

        // draw min/max G lines
        ctx.strokeStyle = "rgba(255, 165, 63, 1.0)"
        ctx.lineWidth = 2
        ctx.lineCap = ""
        ctx.beginPath()
        ctx.moveTo(Math.sign(gxLargest)*0.5*ctx.lineWidth, 0) // don't draw from dead center, it'll show a few ugly missing pixels
        ctx.lineTo(gxLargest * circleSize, 0)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0,Math.sign(gyLargest)*0.5*ctx.lineWidth) // don't draw from dead center, it'll show a few ugly missing pixels
        ctx.lineTo(0,gyLargest * -circleSize)
        ctx.stroke()

        // previous values (historic trail)
        if(history.length > 0) {
            ctx.lineWidth = 3
            for(var i = 1; i < history.length; i++) {
                ctx.beginPath()
                ctx.moveTo(history[i-1][0], history[i-1][1])
                let p = i/history.length
                //ctx.lineWidth = 1 + (2*i/p)
                ctx.strokeStyle = "RGBA(255,255,255," + p + ")"
                ctx.lineTo(history[i][0], history[i][1])
                ctx.stroke()
            }
            if(history.length > historySize) {
                history.splice(0, 1)
            }
            var sx = Math.abs(history[history.length - 1][0] - px)
            var sy = Math.abs(history[history.length - 1][1] - py)
            if(sx > 2 || sy > 2) {
                history.push([px, py])
            }
        } else {
            history.push([px, py])
        }

        // draw 1g,2g labels
        ctx.fillStyle = "RGBA(255,255,255,1)"
        ctx.font = '12px "Lucida Console", Monaco, monospace'
        ctx.textAlign = "left"
        ctx.textBaseline = "bottom"
        for (var i = 1; i <= maxG; i++) {
            ctx.fillText(i+"g",-circleSize*i/1.41421, circleSize*i/1.41421)
        }

        // line to instant value
        ctx.strokeStyle = "RGBA(255,255,255,0.5)"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(gForces.gx*circleSize, gForces.gy*-circleSize)
        ctx.lineTo(px, py)
        ctx.stroke()

        // instant value
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.beginPath()
        ctx.arc(gForces.gx*circleSize, gForces.gy*-circleSize, 5, 0, 2*Math.PI, false)
        ctx.fill()
        ctx.fillStyle = "rgba(255, 102, 0, 0.8)"
        ctx.beginPath()
        ctx.arc(gForces.gx*circleSize, gForces.gy*-circleSize, 4, 0, 2*Math.PI, false)
        ctx.fill()

        // averaged value
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)"
        ctx.beginPath()
        ctx.arc(px, py, 7, 0, 2*Math.PI, false)
        ctx.fill()
        ctx.fillStyle = "rgba(255, 102, 0, 1.0)"
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, 2*Math.PI, false)
        ctx.fill()

        // averaged and max value labels, for x and y axis
        ctx.fillStyle = "RGBA(255,255,255,1)"
        ctx.font = 'bolder 14px "Lucida Console", Monaco, monospace'
        ctx.textAlign = "right"
        ctx.textBaseline = "top"
        ctx.fillText(Math.abs(gForces.gx2).toFixed(2), 100-2, 0)
        ctx.fillStyle = "rgba(255, 165, 63, 1.0)"
        ctx.fillText(Math.abs(gxLargest).toFixed(2), 100-2, 13)

        ctx.font = 'bolder 14px "Lucida Console", Monaco, monospace'
        ctx.fillStyle = "RGBA(255,255,255,1)"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(Math.abs(gForces.gy2).toFixed(2),  0, -(100-2))
        ctx.fillStyle = "rgba(255, 165, 63, 1.0)"
        ctx.fillText(Math.abs(gyLargest).toFixed(2), 0, -(100-2-13))
      })

      scope.$on('app:resized', function (event, data) {
        c.width = data.width
        c.height = data.height
        ctx.setTransform(c.width/200, 0, 0, c.height/200, c.width/2,c.height/2)
      })
    }
  }
}]);
