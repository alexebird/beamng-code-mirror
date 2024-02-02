angular.module('beamng.apps')
    .directive('dragRaceApp', ['StreamsManager', function (StreamsManager) {
        return {
            template:
                '<div style="max-height:100%; width:100%; background:transparent;" layout="row" layout-align="center center" layout-wrap>' +
                `<md-button flex style="margin: 2px; min-width: 198px" md-no-ink class="md-raised" ng-click="startTest()">{{:: 'ui.apps.escstiffness.start' | translate}}</md-button>` +
                `<md-button flex style="margin: 2px; min-width: 122px" md-no-ink class="md-raised" ng-click="stopTest()">{{:: 'ui.apps.escstiffness.stop' | translate}}</md-button>` +
                '<div style="height:100%; width:100%; background-color: rgba(255,255,255,0.9)">' +
                `{{:: 'ui.apps.escstiffness.state' | translate}}: {{ data.state }}<br>` +
                `{{:: 'ui.apps.escstiffness.progress' | translate}}: {{ data.progress.toFixed(2) }}%<br>` +
                `{{:: 'ui.apps.escstiffness.targetAngle' | translate}}: {{ data.currentAngle }}<br>` +
                `{{:: 'ui.apps.escstiffness.targetSpeed' | translate}}: {{ data.currentSpeed.toFixed() }}<br>` +
                `{{:: 'ui.apps.escstiffness.maxStiffnessFront' | translate}}: {{ data.stiffnessFront.toFixed() }}<br>` +
                `{{:: 'ui.apps.escstiffness.maxStiffnessRear' | translate}}: {{ data.stiffnessRear.toFixed() }}<br>` +
                '</div>' +
                '</div>',
            replace: true,
            restrict: 'EA',
            scope: true,
            controller: ['$log', '$scope', function ($log, $scope) {
                require: '^bngApp',
                    $scope.startTest = function () {
                        bngApi.activeObjectLua('extensions.Dragrace.DragraceTest()')
                    }

                $scope.stopTest = function () {
                    bngApi.activeObjectLua('extensions.dragrace.stopDragraceTest()')
                }

                $scope.data = {
                    player: {
                        model: "A very expensive car",
                        config: "irresponsabe",
                        reaction_t: 0.01,
                        sixty_foot_t: 1.1,
                        threehundred_foot_t: 10,
                        eight_mile_t: 20,
                        eight_mile_v: 60,
                        thousand_feet_t: 45,
                        quarter_mile_t: 70,
                        quarter_mile_v: 78,
                    },

                    foe: {
                        model: "A very expensive car ",
                        config: "irresponsabe 12",
                        reaction_t: 0.01,
                        sixty_foot_t: 1.1,
                        threehundred_foot_t: 10,
                        eight_mile_t: 20,
                        eight_mile_v: 60,
                        thousand_feet_t: 45,
                        quarter_mile_t: 70,
                        quarter_mile_v: 78,
                    }
                }


                StreamsManager.add(streamsList);

                // [3] Use a variable to keep the settings
                var appSettings = null;

                // When DOM is ready and controllers are set up, get the stored settings.
                element.ready(function () {
                    // [4] Call the getSettings() function of the controller
                    ctrl.getSettings()
                        .then(function (settings) {
                            appSettings = settings;
                        })
                });

                scope.$on('$destroy', function () {
                    StreamsManager.remove(streamsList);
                    // [5] Optionally save the (possibly modified) app settings when done
                    ctrl.saveSettings(appSettings);
                });

                scope.$on('streamsUpdate', function (event, streams) {
                    /* Some code that uses the streams' values */
                });
            }
            ]
        }
    }
    ]
    );