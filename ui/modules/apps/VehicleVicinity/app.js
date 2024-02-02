angular.module('beamng.apps')
.directive('vehicleVicinityApp', [function () {
  return {
    template: '<svg style="width: 100%; height: 100%; border:1px solid black;background:rgba(0,0,0,0.3);box-sizing: border-box;"></svg>',
    replace: true,
    link: function ($scope, element, attrs) {
      var svg = element[0];
      element.css({'transform': "scale(-1,1)"})

      function drawGrid(viewBoxSize, gridSize) {
        const gridGroup = hu('<g>', svg).attr({ stroke: 'grey', 'stroke-width': 0.02 });

        // Draw horizontal and vertical grid lines
        for (let i = -viewBoxSize / 2; i <= viewBoxSize / 2; i += gridSize) {
          hu('<line>', gridGroup).attr({ x1: i, y1: -viewBoxSize / 2, x2: i, y2: viewBoxSize / 2 });
          hu('<line>', gridGroup).attr({ x1: -viewBoxSize / 2, y1: i, x2: viewBoxSize / 2, y2: i });
        }
      }

      function rotatePoint(x, y, angle) {
        return {
          x: x * Math.cos(angle) - y * Math.sin(angle),
          y: x * Math.sin(angle) + y * Math.cos(angle)
        };
      }

      function createArrowHead(x, y, vehicleWidth, vehicleHeight, group) {
        // Define the aspect ratio and calculate the arrowhead dimensions
        const aspectRatio = 2; // Width is twice the height
        const arrowWidth = vehicleWidth / 2; // Half of the vehicle's width
        const arrowHeight = arrowWidth / aspectRatio; // Calculate height based on the aspect ratio

        const points = [
          `${x}, ${y - vehicleHeight / 4}`, // Top point (base of the arrow at the front of the vehicle)
          `${x - arrowWidth / 2}, ${y - vehicleHeight / 4 + arrowHeight}`, // Bottom left
          `${x + arrowWidth / 2}, ${y - vehicleHeight / 4 + arrowHeight}` // Bottom right
        ].join(' ');

        hu('<polygon>', group).attr({
          points: points,
          fill: 'white'
        });
      }

      $scope.$on('onVehicleVicinityData', function (event, data) {
        //console.log(data)
        svg.innerHTML = '';

        let plObject = data.objects[data.playerVehicleId];
        let vehicleRotation = -plObject.rotX;

        let viewBoxSize = Math.max(plObject.sizeX, plObject.sizeY) * 5;

        drawGrid(viewBoxSize, 1); // Grid size set to 1 meter


        for (var id in data.objects) {
          let object = data.objects[id];
          let position = rotatePoint(
            object.centerX - plObject.centerX,
            object.centerY - plObject.centerY,
            vehicleRotation
          );

          let color = 'blue'
          if(object.type === 'traffic') {
            color = 'grey'
          } else if(object.type === 'parked') {
            color = 'grey'
          } else if(object.type === 'trailer') {
            color = 'green'
          }

          let isPlayer = (id == data.playerVehicleId)

          let objectRotation = object.rotX - plObject.rotX; // Adjust rotation relative to the player vehicle
          let group = hu('<g>', svg); // Create a group for the vehicle and arrow
          let rect = hu('<rect>', group).attr({
            x: position.x - object.sizeX / 2,
            y: position.y - object.sizeY / 2,
            width: object.sizeX,
            height: object.sizeY,
            fill: color,
            rx: 0.1, // Rounded corner radius (horizontal)
            ry: 0.1, // Rounded corner radius (vertical)
            stroke: isPlayer ? 'orange' : 'black',
            'stroke-width': isPlayer ? 0.1 : 0.05
          });

          for(let i in object.couplers) {
            let couplerNode = object.couplers[i]

            let positionC = rotatePoint(
              couplerNode.livePos.x - plObject.centerX,
              couplerNode.livePos.y - plObject.centerY,
              vehicleRotation
            );

            hu('<circle>', svg).attr({
              cx: positionC.x,
              cy: positionC.y,
              r: 0.4,
              fill: 'red'
            });
          }

          // Draw only the arrowhead, large and positioned at the front of the vehicle
          createArrowHead(position.x, position.y - object.sizeY / 4 + 0.5, object.sizeX, object.sizeY, group)

          // Set the rotation of the group
          group.attr('transform', `rotate(${objectRotation * 180 / Math.PI}, ${position.x}, ${position.y})`);
        }

        hu('<circle>', svg).attr({
          cx: 0,
          cy: 0,
          r: 0.02,
          fill: 'red'
        });

        svg.setAttribute('viewBox', `${-viewBoxSize / 2} ${-viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`);

        // add a legend
        let scaleLineLength = 1
        let lineYPosition = viewBoxSize / 2 - 1
        let lineXPosition = -viewBoxSize / 2 - 2
        hu('<line>', svg).attr({
          x1: lineXPosition,
          y1: lineYPosition,
          x2: lineXPosition + scaleLineLength,
          y2: lineYPosition,
          stroke: 'black',
          'stroke-width': 0.05
        });

      });

      $scope.$on('$destroy', function () {
        bngApi.engineLua('extensions.unload("ui_vehicleVicinityApp")')
      })
      bngApi.engineLua('extensions.load("ui_vehicleVicinityApp")')
    }
  }
}]);
