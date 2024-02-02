'use strict'

angular.module('beamng.apps')
  .directive('messages', [function () {
    return {
      template: `
        <div style="background:transparent;" class="fillParent Messages">
          <link type="text/css" rel="stylesheet" href="/ui/modules/apps/messages/app.css">
          <div ng-repeat="c in data" class="message bngApp" layout="row" layout-align="start center">
            <div ng-if="c.icon" class="MessagesIcon">
              <md-icon class="material-icons">{{c.icon}}</md-icon>
            </div>
            <div some="{{c}}" bng-translate="{{c.txt}}" flex style="flex-wrap: wrap" layout="row" layout-align="start center" class="fillParent"></div>
            <!-- <div>{{c.ttl}}</div> -->
          </div>
        </div>`,
      replace: true,
      restrict: 'EA',
      scope: true,
      controller: ['$log', '$scope', '$interval', '$sce', 'Utils', '$rootScope', 'MessageToasterService', function ($log, $scope, $interval, $sce, Utils, $rootScope, messageToasterService) {
        $scope.data = {}
        let xinputStatus = {
          0: { connected: false, battery: 1 },
          1: { connected: false, battery: null },
          2: { connected: false, battery: null },
          3: { connected: false, battery: null }
        }

        function getIcon(category) {
          if (category.indexOf('damage.') !== -1) {
            return 'priority_high'
          }

          if (category.indexOf('controller') !== -1) {
            return undefined
          }

          switch (category) {
            case 'cameramode':
              return 'videocam'
            default:
              return 'menu'
          }
        }

        const timerDTMs = 300

        function timer() {
          // count down the ttl and delete items eventually
          for (let i in $scope.data) {
            let c = $scope.data[i]
            c.ttl -= timerDTMs
            if( c.ttl < 0) {
              delete $scope.data[i]
            }
          }
          //console.log('active data: ', $scope.data)
        }
        let internalinstance = $interval(timer, timerDTMs)

        $scope.$on('$destroy', function () {
          $interval.cancel(internalinstance)
        })

        function onMessage(event, args) {
          // bail if message category is being handled by MessageToaster
          if (messageToasterService.activeCategories.includes(args.category)) return false;
          if(args.ttl == null) args.ttl = 5
          if(args.category === null) args.category = 'default'
          //console.log(`> got message: ${JSON.stringify(args)}`)

          let matchedCategories = []

          // try to match the category as a regexp. for example, match all "^damage\." categories, and set an empty message to them all
          let re = new RegExp(args.category)
          for (let i in $scope.data) {
            if (re.test(i)) {
              matchedCategories.push(i)
            }
          }

          // if no category was found, assume this is not a regexp but an actual category name
          if (matchedCategories.length == 0) matchedCategories.push(args.category)

          $scope.$evalAsync(function () {
            // go through all categories, removing previous messages and adding new messages
            for (let i in matchedCategories) {
              let cat = matchedCategories[i]
              if (args.clear) {
                delete $scope.data[cat]
              } else {
                // this is not how it is supposed to be, but it breaks messages for whatever reason
                if (args.msg === "") {
                  delete $scope.data[cat]
                  continue
                }
                $scope.data[cat] = {
                  icon: args.icon || getIcon(cat),
                  txt: args.msg,
                  ttl: args.ttl * 1000 + Object.keys($scope.data).length * timerDTMs * 2
                }
              }
            }
          })
        }
        $rootScope.$on('Message', onMessage)
        $scope.$on('Message', onMessage)
        $scope.$on('ClearAllMessages', function(event, args) {
          $scope.$evalAsync(function () {
            $scope.data = {}
          })
        });

        // xinput module almost complet yl as before, since it didn't end up well in it's own module :-(
        // BTW: there si as small problem if two controllers are connected at the same time, only one will be shown
        $scope.$on('XInputControllerUpdated', function (event, args) {
          // console.log(args)
          let ttl = 10 // in seconds
          let levels = { 0: "empty", 1: "low", 2: "medium", 3: "full" }
          let n = args.controller
          let connected = args.connected
          let battery = args.battery; // 0 to 3 included
          let m

          if (battery !== undefined) {
            if (xinputStatus[n].battery !== null) {
              let level = levels[battery]

              m = "<div class='imgdiv'>"

              for (let i in xinputStatus) {
                m += "  <div class='" + (n == i ? "blink" : "imgover nonsubject") + " color controller_mask_" + i + "'></div>"
              }

              m += "  <div class='color imgover bat_" + level + " battery_" + battery + "_mask'></div>"
              m += "</div>"
              m += "<div>Controller " + (n + 1) + " Battery " + level + "</div>"

              $scope.$emit('Message', { msg: m, ttl: ttl, category: 'battery_xi_controller_' + n })
            }
            xinputStatus[n].battery = battery
          }

          if (connected !== undefined) {
            if (connected === 0) {
              xinputStatus[n].battery = null
            }
            xinputStatus[n].connected = connected

            m = "<div class='imgdiv'>"

            for (let i in xinputStatus) {
              m += "  <div class='" + (n == i ? "blink" : "imgover nonsubject") + " color controller_mask_" + i + "'></div>"
            }

            m += "  <div style=\"position: absolute; top: 0; right: 0; bottom: 0; left:0;\" layout layout-align=\"center center\">"
            m += "    <md-icon class=\"material-icons\" style=\"color: white; font-size:20px;\">games</md-icon>"
            m += "  </div>"
            m += "</div>"
            m += "<div>Controller " + (n + 1) + " " + (connected ? "connected" : "unplugged") + "</div>"

            $scope.$emit('Message', { msg: m, ttl: ttl, category: 'xi_controller_' + n })
          }
        })
      }]
    }
  }])
