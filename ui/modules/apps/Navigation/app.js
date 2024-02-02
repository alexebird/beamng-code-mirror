angular.module("beamng.apps").directive("navigation", function () {
    return {
      template: `
      <div style="height: 100%; width: 100%; position: relative;">

        <!-- map container -->
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden">
          <div id="map-container" style="overflow: visible;">
            <svg style="overflow: visible">
              <defs>
                <image id="vehicleMarker" width="40" height="40" x="-20" y="-20" xlink:href="/ui/modules/apps/Navigation/vehicleMarker.svg"/>
              </defs>
            </svg>
          </div>

          <div style="position: absolute; top: 12px; left: 12px; width: calc(100% - 24px); height: calc(100% - 24px);">
            <svg id="north-point" style="position: absolute; transform: translate(-50%, -50%);" width="20" height="20">
              <!--<path d="M20.272 3.228l-5.733 10.52-3.878 6.51c-1.22 1.87-1.873 4.056-1.877 6.29 0 6.38 5.17 11.55 11.55 11.55 6.38 0 11.55-5.17 11.55-11.55-.002-2.257-.666-4.466-1.91-6.35l-3.92-6.505z" fill="#282828" fill-rule="evenodd" stroke="#fff" stroke-width="2.88"/>-->
              <!-- ???
              <circle cx="20" cy="20" r="10" stroke="#FFF" stroke-width="1.5" fill="#282828" />
              <text style="line-height:125%" x="14.265" y="1043.581" font-size="14" font-family="sans-serif" letter-spacing="0" word-spacing="0" fill="#fff" transform="translate(1 -1012.362)"><tspan x="14" y="1037">N</tspan></text>
              -->
              <circle cx="10" cy="10" r="10" stroke="#FFF" stroke-width="1.5" fill="#282828" />
              <text x="0" y="0" font-size="14" font-family="sans-serif" letter-spacing="0" word-spacing="0" fill="#fff"><tspan x="5" y="15">N</tspan></text>
            </svg>
          </div>
        </div>

        <div ng-click="openBigMap()" style="cursor: pointer; position: absolute; top: 0; background-color:rgba(0, 0, 0, 0.6)">
          <md-icon class="material-icons" style="color:rgb(255, 103, 0, 128); margin: 0.1em">map</md-icon>
        </div>

      </div>
      `,
      replace: true,
      restrict: "EA",
      link: function (scope, element, attrs) {

        const root = element[0];

        const bngnav = new bngNavigator({
          // elements
          root,
          container: "#map-container",
          north: "#north-point",
          // options
          backgroundRgb: [50, 50, 50],
          roadColors: ["#DCDCDCFF", "#969678FF", "#967864FF"], // from most driveable to least
          markers: true,
          markerColor: "#2C5CFF", // POI
          vehicles: true,
          vehicleMarker: "#vehicleMarker", // player vehicle svg def id
          vehicleColor: "#A3D39C", // other vehicles colour
          cameraColor: "#FD6A00", // player shape colour
          routes: true,
          rotate: true,
          scale: 0.8,
          offsetX: 0, // offsets will be set by app size
          offsetY: 0,
          speedOffset: 0,
          pitch: 0,
          speedPitch: 30,
          speedZoom: true,
          speedZoomIncrements: 1,
          speedZoomMultiplier: 2,
        });

        // control map opacity
        let bgStates = [0.2, 0.6, 0.8, 1], bgCurrent = 0;
        function cycleOpacity() {
          bgCurrent = ++bgCurrent % bgStates.length;
          bngnav.setOpacity(bgStates[bgCurrent]);
        }
        root.addEventListener("click", cycleOpacity);
        cycleOpacity();

        // control zoom level
        let zoomStates = [1, 0.75, 0.6, 0.45], zoomCurrent = 0;
        function cycleZoom() {
          zoomCurrent = ++zoomCurrent % zoomStates.length;
          bngnav.setScale(zoomStates[zoomCurrent]);
        }
        root.addEventListener("contextmenu", cycleZoom);
        cycleZoom();

        // update the map when necessary
        scope.$on("NavigationMapUpdate", (_, data) => {
          if (!data) return;
          if (data && data.controlID && data.objects) {
            let obj = data.objects[data.controlID];
            bngnav.updateData({
              x: obj.pos[0],
              y: obj.pos[1],
              rotation: obj.rot + 180,
              speed: obj.speed,
            });
          }
          bngnav.setData(data);
        })

        // handle app resize
        function updateOffset() {
          bngnav.setOptions({
            offsetX: root.children[0].clientWidth * 0.5,
            offsetY: root.children[0].clientHeight * 0.65,
            speedOffset: root.children[0].clientHeight * 0.2,
          });
        }
        scope.$on("app:resized", (_, streams) => {
          element.css({
            width: streams.width - 25 + "px",
            height: streams.height - 25 + "px",
          });
          updateOffset();
        });
        updateOffset();

        // shut down
        scope.$on("$destroy", () => {
          bngApi.engineLua('extensions.unload("ui_uiNavi")');
          //StreamsManager.remove(requiredStreams)
        });

        // receive one-time map setup
        const NavigationMapOff = scope.$on("NavigationMap", (_, data) => {
          NavigationMapOff(); // unregister listener
          bngnav.setData(data);
        });

        scope.$on("NavigationStaticMarkers", (_, data) => bngnav.setMarkers(data));
        scope.$on("NavigationGroundMarkersUpdate", (_, data) => bngnav.setRoute(data));

        scope.openBigMap = () => bngApi.engineLua("if freeroam_bigMapMode then freeroam_bigMapMode.enterBigMap() end");

        bngApi.engineLua("extensions.ui_uiNavi.requestUIDashboardMap()");
        bngApi.engineLua("if gameplay_markerInteraction then freeroam_bigMapPoiProvider.sendMissionLocationsToMinimap() end");
      },
    }
  },
)
