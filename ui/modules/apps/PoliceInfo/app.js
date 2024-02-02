angular.module('beamng.apps')
.directive('policeInfo', ['translateService', function (translateService) {
  return {
    template: '<object class="bngApp" style="width: 100%, height: auto, pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/PoliceInfo/police.svg"></object>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      element.on('load', function () {
        element[0].style.marginLeft = '-2px'
        const svg = element[0].contentDocument
        const levels = [svg.getElementById('levelBase1'), svg.getElementById('levelBase2'), svg.getElementById('levelBase3')]
        const visibility = {icon: svg.getElementById('visibility'), bar: svg.getElementById('visibilityFiller')}
        const arrest = {bar: svg.getElementById('arrestFiller'), txt: svg.getElementById('arrestText')}
        const evade  = {bar: svg.getElementById('evadeFiller'), txt: svg.getElementById('evadeText')}
        const infoIcons = ['iconTimer', 'iconPolice', 'iconOffense']
        const infoTexts = ['statTimer', 'statPolice', 'statOffense']
        const fillWidths = [svg.getElementById('visibilityBase').getAttribute('width') - 1, svg.getElementById('arrestBase').getAttribute('width') - 1] // bar max widths

        scope.pursuitLevel = 0
        scope.sightValue = 0
        scope.alertText = ''
        arrest.txt.innerHTML = (translateService.contextTranslate('ui.apps.police.arrest') || 'Arrest').toUpperCase()
        evade.txt.innerHTML = (translateService.contextTranslate('ui.apps.police.evade') || 'Evade').toUpperCase()

        function setPursuitLevel(level) {
          for (var i = 0; i < 3; i++) {
            if (i < level)
              levels[i].setAttribute('opacity', 1)
            else
              levels[i].setAttribute('opacity', 0.25)
          }

          scope.pursuitLevel = level
        }
        setPursuitLevel(0)

        function setVisibility(sightValue) {
          if (sightValue == 0)
            visibility.icon.setAttribute('opacity', 0.25)
          else if (sightValue < 0.5)
            visibility.icon.setAttribute('opacity', 0.75)
          else
            visibility.icon.setAttribute('opacity', 1)

          visibility.bar.setAttribute('width', sightValue * fillWidths[0])
          scope.sightValue = sightValue
        }
        setVisibility(0)

        function setArrestEvade(arrestValue, evadeValue) {
          arrest.bar.setAttribute('width', arrestValue * fillWidths[1])
          arrest.bar.setAttribute('x', 6 + (fillWidths[1] - arrestValue * fillWidths[1]))
          evade.bar.setAttribute('width', evadeValue * fillWidths[1])
          arrest.txt.setAttribute('opacity', arrestValue >= 0.001 ? 1 : 0.5)
          evade.txt.setAttribute('opacity', evadeValue >= 0.001 ? 1 : 0.5)
        }
        setArrestEvade(0, 0)
        
        function setInfoText(info) { // provides info for the three info lines in the svg
          infoTexts.forEach(function(val, idx) {
            var isObject = typeof(info) == 'object'
            svg.getElementById(val).innerHTML = isObject ? info[idx].txt : ''
            svg.getElementById(infoIcons[idx]).setAttribute('opacity', isObject ? 1 : 0)
          })
        }
        setInfoText()

        function setAlertText(alert) { // this text disappears after a few seconds (may need improvement)
          if (!alert || alert != scope.alertText) {
            scope.alertText = alert || ''
            svg.getElementById('iconAlert').setAttribute('opacity', alert ? 1 : 0)
            svg.getElementById('alert').innerHTML = (translateService.contextTranslate(scope.alertText, true) || scope.alertText)
            if (scope.alertTextTimeout)
              clearTimeout(scope.alertTextTimeout)
            scope.alertTextTimeout = setTimeout(function () {
              scope.alertText = ''
              svg.getElementById('iconAlert').setAttribute('opacity', 0)
              svg.getElementById('alert').innerHTML = scope.alertText
            }, 8000)
          }
        }
        setAlertText()

        scope.$on('PoliceInfoUpdate', function (evt, data) {
          if (data.pursuitLevel !== undefined)
            setPursuitLevel(data.pursuitLevel)
          if (data.sightValue !== undefined)
            setVisibility(data.sightValue)
          if (data.arrest !== undefined && data.evade !== undefined)
            setArrestEvade(data.arrest, data.evade)
          if (data.info !== undefined)
            setInfoText(data.info)
          if (data.alert !== undefined)
            setAlertText(data.alert)
        })
      })

      bngApi.engineLua('extensions.load("ui_policeInfo")')
      scope.$on('$destroy', function () {
        bngApi.engineLua('extensions.unload("ui_policeInfo")')
      })
    }
  }
}])
