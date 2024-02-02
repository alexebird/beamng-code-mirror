angular.module('beamng.stuff')

.directive('useLangFont', ['$translate', function ($translate) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      function setFont () {
        var key = `ui.fonts.${attrs.useLangFont}`
        $translate(key).then((font) => {
          if (font === key) {
            // in case a font doesn't specify the key requested fallback to the default font
            $translate('ui.fonts.1').then((font) => {
              elem.css('font-family', font)
            })
          } else {
            elem.css('font-family', font)
          }
        })
      }

      setFont()
      scope.$on('languageChange', setFont)
    }
  }
}])


.constant('spriteDuplicates', {})

// .run(function (FS, spriteDuplicates) {
//   FS.loadJSON('Components/Icons/duplicates.json').then((dupes) => {
//     for (var key in dupes) {
//       spriteDuplicates[key] = dupes[key]
//     }
//   })
// })

// use this directive for icons
// icons should always be squares otherwise they are images and should not be handled here.
.directive('bngIcon', function () {
  return {
    template: `
      <bng-box1x1 class="filler" ng-switch="type" ng-style="{transform: getTransform()}">
        <bng-flag ng-switch-when="flag" src="val" deg="getDeg()"></bng-flag>
        <bng-icon-img ng-switch-when="img" src="val" deg="getDeg()"></bng-icon-img>
        <bng-icon-svg ng-switch-when="svg" src="val" deg="getDeg()" color="color"></bng-icon-svg>
        <bng-icon-svg-sprite ng-switch-when="sprite" src="val" deg="getDeg()" color="color"></bng-icon-svg-sprite>
        <bng-icon-svg-sprite ng-switch-default src="'general_beamng_logo_bw'" color="color"></bng-icon-svg-sprite>
      </bng-box1x1>
    `,
    scope: {
      type: '@',
      val: '=src',
      color: '=',
      direction: '=?',
      degree: '=?'
    },
    link: function (scope) {
      scope.degree = scope.degree || 0

      scope.getDeg = function () {
        switch (scope.direction) {
        case 'top': scope.degree = 0; break
        case 'right': scope.degree = 90; break
        case 'bottom': scope.degree = 180; break
        case 'left': scope.degree = 270; break
        }
        return scope.degree
      }
    }
  }
})



// === important: do not use any of these directly! use the above (bngIcon) instead =================================
.directive('bngIconSvg', function () {
  return {
    restrict: 'E',
    // template: `<img ng-src="{{src}}" style="{{!color ? 'fill: currentColor;' : ''}} pointer-events: none; transform: rotate({{deg}}deg);" class="{{color ? 'fill-' + color : ''}}"></img>`,
    // template: `<object data="{{src}}" type="image/svg+xml">`,
    // template: `<div class="filler" style="background: url('{{src}}')"></div>`,
    template: `<div ng-include="src" style="{{!color ? 'fill: currentColor;' : ''}} pointer-events: none; transform: rotate({{deg}}deg);" class="filler {{color ? 'fill-' + color : ''}}"></div>`,
    scope: {
      src: '=',
      color: '=',
      deg: '='
    }
  }
})

// === important: do not use any of these directly! use the above (bngIcon) instead =================================
.directive('bngIconSvgSprite', function (spriteDuplicates) {
  return {
    restrict: 'E',
    template: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="{{color ? 'fill-' + color : ''}} filler" style="{{!color ? 'fill: currentColor;' : ''}} pointer-events: none; transform: rotate({{deg}}deg);"><use xlink:href="{{getPath(src)}}"/></svg>`,
    scope: {
      src: '=',
      color: '=',
      deg: '='
    },
    link: function (scope) {
      scope.getPath = (src) => `#${spriteDuplicates[src] || src}`
    }
  }
})

// === important: do not use any of these directly! use the above (bngIcon) instead =================================
.directive('bngIconImg', function () {
  return {
    restrict: 'E',
    template: `<img class="filler" ng-src="{{src}}" style="transform: rotate({{deg}}deg);"/>`,
    scope: {
      src: '=',
      deg: '='
    },
  }
})

// === important: do not use any of these directly! use the above (bngIcon) instead =================================
.directive('bngFlag', function () {
  return {
    restrict: 'E',
    template: `<img class="filler" ng-src="{{imgSrc}}"  style="transform: rotate({{deg}}deg);"/>`,
    scope: {
      src: '=',
      deg: '='
    },
    link: function (scope) {
      var shortHand =
        { 'United States': 'USA'
        , 'Japan': 'JP'
        , 'Germany': 'GER'
        , 'Italy': 'IT'
        , 'France': 'FR'
        }

      function setSrc () {
        scope.imgSrc = `Assets/Icons/CountryFlags/${shortHand[scope.src] || scope.src || 'missing'}.png`
      }

      scope.$watch('src', setSrc)

      setSrc()
    }
  }
})




.directive('bngBox1x1', function () {
  return {
    restrict: 'E',
    template: `
      <div class='box1_1'>
        <div class='container' ng-transclude></div>
      </div>
    `,
    transclude: true
  }
})

.directive('bngGrid', function () {
  return {
    restrict: 'E',
    template: `
      <div class="container" ng-transclude></div>`,
    scope: {
      rows: '@',
      cols: '@'
    },
    transclude: true,
    controller: function ($scope, $element) {
      var vm = this
        , childs = [] // TODO: implement this, so we can have some more control over how items are placed it the values do not result in a pixel perfect grid
          // otherwise we'll have some pixel fragments between and around the right and bottom border


      vm.register = function (x, y, rowspan, colspan, cb) {
        var res = {}
          , width = 100/Number($scope.cols)
          , height = 100/Number($scope.rows)

        res.width = `${width * colspan}%`
        res.height = `${height * rowspan}%`
        res.left = `${(x - 1) * width}%`
        res.top = `${(y - 1) * height}%`
        cb(res)
      }
    }
  }
})

.directive('bngGridItem', function () {
  return {
    require: '^bngGrid',
    // todo: perf only adjust height and width once (they are percentage based anyway and should then be handled by css)
    template: `
        <div style="position: absolute;" ng-transclude>
      </div>`,
    restrict: 'E',
    transclude: true,
    scope: {
      row: '@',
      col: '@',
      rowspan: '@',
      colspan: '@'
    },
    replace: true,
    link: function (scope, elem, attrs, gridCtrl) {
      var x = Number(scope.col)
        , y = Number(scope.row)
        , colspan = scope.colspan ? Number(scope.colspan) : 1
        , rowspan = scope.rowspan ? Number(scope.rowspan) : 1

      gridCtrl.register(x, y, rowspan, colspan, function (dim) {
        // console.log(x, y, rowspan, colspan, dim)
        for (var key in dim) {
          elem.css(key, dim[key])
        }
      })
    }
  }
})



.directive('bngBox', function () {
  return {
    restrict: 'E',
    replace: true,
    template: `
      <div class='box'>
        <div class='container' ng-transclude></div>
      </div>
    `,
    transclude: true
  }
})

.directive('bngVList', function ($compile) {
  return {
    scope: true, // Use a scope that inherits from parent to access data
    restrict: 'A',
    compile: function (tElement, tAttrs, transclude) {
      let vRepeatAttr = tAttrs.bngVRepeat.split('in')
      let itemAlias = vRepeatAttr[0].replace(' ', '')

      let template = angular.element(`
        <div class="container bng-v-list" bng-nav-scroll>
          <div style="position: relative;">
            <div class="bng-v-list-items" style="position: absolute; width: 100%; box-sizing: border-box">
            </div>
          </div>
        </div>`)

      let scroller = template[0].children[0]
      let vscreen  = scroller.children[0]

      let clone = angular.element(tElement.children()[0])
      clone.attr('ng-repeat', `${itemAlias} in visibleItems`)
      clone.addClass('bng-v-list__item')

      angular.element(vscreen).append(clone)

      tElement.html('')
      tElement.append(template)

      let element = angular.element(tElement.children()[0])

      function getVisible (firstItem, lastItem, data) {
        firstItem = firstItem < 0 ? 0 : firstItem
        lastItem = lastItem > data.length - 1 ? data.length - 1 : lastItem
        return data.slice(firstItem, lastItem + 1)
      }

      return {
        post: function (scope, rootElem, attrs) {
          let rowHeight
          let itemsPerRow
          let currentRows = [0, 0]

          scope.allData = scope.$eval(vRepeatAttr[1].replace(' ', '')) || []
          scope.visibleItems = getVisible(0, 1, scope.allData)

          function handleScroll (forceRefresh) {
            // if possible show a row below visible and above visible as well, so gamepad nav can "scroll"
            let elemRect = element[0].getBoundingClientRect()
            let nrRowsNotShown = 10
            let scrollPos = element[0].scrollTop
            let rowScroll = Math.floor(scrollPos / rowHeight)
            let firstRow = Math.max(0, rowScroll - nrRowsNotShown)
            let lastRow = firstRow + Math.ceil(elemRect.height / rowHeight) + nrRowsNotShown
            let firstItem = Math.max(0, firstRow * itemsPerRow)
            let lastItem = Math.min(scope.allData.length - 1, (lastRow + 1) * itemsPerRow - 1 + itemsPerRow * 10)

            if (forceRefresh || currentRows[0] !== firstRow || currentRows[1] !== lastRow) {
              currentRows = [firstRow, lastRow]
              //console.log('rows: ', firstRow, lastRow, 'items:', firstItem, lastItem, lastItem - firstItem, 'rowScroll', rowScroll)
              // console.log(itemsPerRow)
              scope.$evalAsync(() => {
                // subtract the amount of not shown rows
                // subtract the part of a row we are not showing, since we are moving a container and the elems inside it are always at the top
                newScrollPos = scrollPos - (nrRowsNotShown * rowHeight) - (scrollPos % rowHeight)
                vscreen.style.transform = `translateY(${newScrollPos < 0 ? 0 : newScrollPos}px)`
                // console.log('debug', `Rows: ${firstRow} - ${lastRow}, Items: ${firstItem} - ${lastItem}`)
                scope.visibleItems = getVisible(firstItem, lastItem, scope.allData)
                // console.log('debug', vscreen.style.transform, scrollPos, rowHeight)
              })
            }
          }

          function initHelper () {
            // TODO: check if both offsetWidth and getBoundingClientRect() caue a reflow or if one would be cheaper
            // for now we'll use clientRect, since it is more precise
            let item = vscreen.querySelector('.bng-v-list__item')
            let iRect = item.getBoundingClientRect()
            let vRect = vscreen.getBoundingClientRect()

            // this sets a global CSS variable for the size of the selector items.
            // ONLY WORKS WITH ONE SELECTOR ONSCREEN
            // HACK
            /*
            function updateWidths() {
              let w = vscreen.clientWidth / Math.max(1, Math.floor(vscreen.clientWidth / 300)) - 11;
              document.documentElement.style.setProperty('--gridItemVScrollWidth',  w + 'px');
            }
            const resizeObserver = new ResizeObserver(entries => {
              updateWidths()
            })
            resizeObserver.observe(vscreen)
            updateWidths()
            */

            rowHeight = iRect.height
            itemsPerRow = Math.floor(vRect.width / iRect.width)
            // console.debug(itemsPerRow, vRect.width, iRect.width)
            // console.log('rowHeight:', rowHeight, '#items/row:', itemsPerRow)
            let maxHeight = Math.ceil(scope.allData.length / itemsPerRow) * rowHeight + 'px'
            if (maxHeight !== scroller.style.height) {
              // console.debug(maxHeight, scroller.style.maxHeight)
              scroller.style.height = maxHeight
            }
            handleScroll(true)
          }

          // if for some reason the data is loaded later etc.
          // or for some other reason the visibleitem list is empty
          // and thus resulting in no bng-v-list__item existing
          // mock one, so we can call init
          // otherwise we would never be able to apply new data that was available only after compilation
          function init () {
            if (scope.visibleItems.length === 0) {
              scope.visibleItems = [{}]
              setTimeout(initHelper)
            } else {
              initHelper()
            }
          }

          // it is important () => handleScroll() is used here instead of handlescroll,
          // since in the on scroll case handleScroll should be called without forceRefresh,
          // but if passed as before handlescroll will be passed the scroll event object
          // which will evaluate to truthy thus acting like forceRefresh = true
          // TODO: consider not binding this directly as it could get spammy
          element.on('scroll', () => handleScroll())

          scope.$watch(() => scope.$eval(vRepeatAttr[1].replace(' ', '')), (val) => {
            scope.allData = val || []
            init()
          })

          window.onresize = function () {
            init()
          }
        }
      }
    }
  }
})



/**
 * @ngdoc directive
 * @name beamng.stuff:qrCode
 * @description A general-purpose, canvas-based QR code visualization directive
 */
.directive('qrCode', function () {
  return {
    template: '<div style="display: flex; justify-content: center; align-items: center"><canvas></canvas></div>',
    replace: true,
    scope: {
      data: '=',
      color: '@?'
    },
    link: function (scope, element, attrs) {
      var canvas = element[0].children[0]
        , ctx = canvas.getContext('2d')
        , size = Math.min(element[0].clientWidth, element[0].clientHeight) - 10


      canvas.width = size
      canvas.height = size

      scope.$watch('data', function (data) {
        ctx.clearRect(0, 0, size, size)
        if (!data) return

        var gridSize = data.length
          , tileSize = Math.floor(size / gridSize) // round to avoid gaps between tiles
          , offset = Math.floor((size - tileSize * gridSize) / 2)// offset to center in canvas


        ctx.fillStyle = scope.color || 'black'

        for (var i=0; i<gridSize; i++) {
          for (var j=0; j<gridSize; j++) {
            if (scope.data[i][j] < 0) continue
            ctx.fillRect(i*tileSize + offset, j*tileSize + offset, tileSize, tileSize)
          }
        }
      })
    }
  }
})


/**
 * @ngdoc directive
 * @name beamng.stuff:qrCode
 * @description JS rendered
 */
 .directive('qrCode2', function () {
  return {
    template: '<div></div>',
    replace: true,
    scope: {
    },
    link: function (scope, element, attrs) {
      var qrcode = new QRCode(element[0], {
        text: attrs.href,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      })
    }
  }
})


/**
 * @ngdoc filter
 * @name beamng.stuff:orderObjectBy
 * @description Helper-Filter to order objects in a list in ng-repeat, from here: {@link https://github.com/fmquaglia/ngOrderObjectBy}
**/
.filter('orderObjectBy', function() {
    /*
    The MIT License (MIT)

    Copyright (c) 2015 Fabricio Quagliariello

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
    return function (items, field, reverse) {
      var filtered = []
      angular.forEach(items, function(item) {
        filtered.push(item)
      })
      function index(obj, i) {
        return obj[i]
      }
      filtered.sort(function (a, b) {
        var comparator
        var reducedA = field.split('.').reduce(index, a)
        var reducedB = field.split('.').reduce(index, b)
        if (reducedA === reducedB) {
          comparator = 0
        } else {
          comparator = (reducedA > reducedB ? 1 : -1)
        }
        return comparator
      })
      if (reverse) {
        filtered.reverse()
      }
      return filtered
    }
  })

.filter('maxFractions', ['Utils', function (Utils) {
  return function (num, frac) {
    // first part is copied form angulars number filter
    return (num == null)
      ? num
      : Utils.roundDec(num, frac)
  }
}])

.filter('bbcode', ['$sce', 'Utils', function($sce, Utils) {
  return function (text) {
    return $sce.trustAsHtml(Utils.parseBBCode(args.msg))
  }
}])

.filter('numStr', ['Utils', function (Utils) {
  function putSpacesIn (str, sep, every) {
    if (str.length > every) {
      return putSpacesIn(str.slice(0, -every)) + sep + str.slice(-every)
    }
    return str
  }
  return function (num, sep, every) {
    every = every || 3
    sep = sep || ' '
    return (num == null)
      ? num
      : putSpacesIn(num.toString(), sep, every)
  }
}])

.filter("numShort", function() {
  const units = ["", "K", "M", "B", "T", "Q"];
  return function(num, reminder=0) {
    if (!num)
      return "0";
    if (isNaN(parseFloat(num)) || !isFinite(num))
      return "n/a";
    let power = Math.floor(Math.abs(Math.log(num) / Math.log(1000)));
    if (power >= units.length)
      power = units.length - 1;
    return (num / Math.pow(1000, power)).toFixed(reminder).replace(/\.?0+$/,"") + units[power];
  }
})

.filter('bytes', function() {
  return function(bytes, precision) {
    if(!bytes) return ''
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-'
    if (typeof precision === 'undefined') precision = 0
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number]
  }
})

/**
 * @ngdoc filter
 * @name beamng.stuff:objectSize
 * @description Small filter used to get the number of keys from an object (found it in SO:25299436)
**/
.filter('objectSize', function(){
  return function(input){
    if(!angular.isObject(input)){
      return 0
    }
    return Object.keys(input).length
  }
})

/**
 * @ngdoc directive
 * @name beamng.stuff:bngAllClicks
 * @description Small directive to allow catching both single and double clicks.
 * No scope is created in order to avoid multidir error when used on top of other
 * directives.
 * IMPORTANT:
 * This is only designed for cases, where the single click doesn't prevent the dblclick for other cases use bngAllClicks (so no page navigation for example)
 *
 * @example
     <div bng-all-clicks single="ctrl.onSingle()" double="ctrl.onDouble()"></div>
 *
**/
.directive('bngAllClicksNoNav', function ($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function (scope, element, attrs) {
      var maxDoubleClickDelayMS = 300 // allow 300 ms for double clicking
        , lastTileClick = null
        , single = $parse(attrs.single)
        , double = $parse(attrs.double)


      element.on('click', function () {
        // console.log('clicked')
        var timestamp = new Date().getTime()

        if (lastTileClick !== null && timestamp - lastTileClick < maxDoubleClickDelayMS) {
          // double click
          scope.$evalAsync(function () {
            double(scope)
          })

        }
        lastTileClick = timestamp
        // boring single click only
        scope.$evalAsync(function () {
          single(scope)
        })
      })
    }
  }
})

.directive('bngAllClicks', ['$parse', '$timeout', function ($parse, $timeout) {
  return {
    restrict: 'A',
    scope: false,
    link: function (scope, element, attrs) {
      var maxDoubleClickDelayMS = 300 // allow 300 ms for double clicking
        , lastTileClick = null
        , single = $parse(attrs.single)
        , double = $parse(attrs.double)
        , timeoutPromise


      element.on('click', function () {
        // console.log('clicked')
        var timestamp = new Date().getTime()

        if (timeoutPromise !== undefined) {
          $timeout.cancel(timeoutPromise)
          timeoutPromise = undefined
        }
        if (lastTileClick !== null && timestamp - lastTileClick < maxDoubleClickDelayMS) {
          scope.$evalAsync(function () {
            double(scope)
          })
        } else {
          timeoutPromise = $timeout(function () {
            scope.$evalAsync(function () {
              single(scope)
            })
          }, maxDoubleClickDelayMS)
        }
        lastTileClick = timestamp
      })
    }
  }
}])

.directive('ngRightClick', ['$parse', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick)
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault()
        fn(scope, {$event: event})
      })
    })
  }
}])


//Thanks to: http://stackoverflow.com/questions/30207272/capitalize-the-first-letter-of-string-in-angularjs
.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : ''
    }
})


/**
 * @ngdoc service
 * @description Small utility to convert values from raw input coming from streams to game's metric/imperial units
 */


// little filter to convert units to the user's units
.filter('unit', [function() {
  return function(num, type, numDec) {
    return UiUnits.buildString(type, num, numDec)
  }
}])

// little filter to convert units to the user's units
.filter('unitStats', ["$filter", function($filter) {
  return function(num, type) {
    if (typeof num === "undefined" || typeof type === "undefined")
      return "n/a"
    let numDec=1
    if(num>1000) numDec=0
    if(type in UiUnits)
      return UiUnits.buildString(type, num, numDec)
    if(type=="time")
      return $filter("timeSimple")(num)
    if(Number.isInteger(num))
      numDec=0;
    if(type.length)
      return num.toFixed(numDec)+" "+type
    return $filter("numShort")(num,1)
  }
}])

.filter('replace', [function () {

  return function (input, from, to) {

    if(input === undefined) {
      return
    }

    var regex = new RegExp(from, 'g')
    return input.replace(regex, to)

  }


}])

.directive('bngTooltip', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      let value;
      attrs.$observe("bngTooltip", newval => value = newval);
      element.on("mouseenter focusin mousemove", () => $rootScope.$emit("bngTooltipValue", value, true));
      element.on("mouseleave focusout", () => $rootScope.$emit("bngTooltipValue", value, false));
    }
  }
}])

.directive('bngTranslate', ['$compile', '$filter', 'Utils', '$rootScope', function ($compile, $filter, Utils, $rootScope) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      // Get the translation

      attrs.$observe('bngTranslate', translate)

      var lastAppended

      function translate(val) {
        if (lastAppended !== undefined) {
          lastAppended.html('')
        }

        var str

        try {
          var translationObj = JSON.parse(val)
          if (translationObj.fallback) {
            var val =  $filter('translate')(translationObj.txt, translationObj.context)
            if (val === translationObj.txt) {
              str = translationObj.fallback
            } else {
              str = val
            }
          } else {
            str = $filter('translate')(translationObj.txt, translationObj.context)
          }
        } catch (err) {
          str = $filter('translate')(val)
        }
        var html = Utils.parseBBCode(str)

        lastAppended = element.append( $compile(`<div>${html}</div>`)(scope).contents())
      }

      // on language change, update translation
      $rootScope.$on('$translateChangeSuccess', () => {
        translate(attrs.bngTranslate)
      })
    }
  }
}])

.directive("bngTimespan", ["$filter", function($filter) {
  return {
    restrict: "A",
    link(scope, elem, attrs) {
      function calc(cur) {
        let res = $filter("timeSpan")(cur, null, 1, true);
        if (res === "-")
          return;
        elem.text(res);
      }
      calc(attrs.bngTimespan);
      attrs.$observe("bngTimespan", calc);
    }
  };
}])

.filter("timeSpan", ["$filter", function($filter) {
  const translateId = "ui.timespan."; // with trailing dot
  const spans = [
    [ 365 * 24 * 60 * 60, "year"   ],
    [  30 * 24 * 60 * 60, "month"  ],
    [   7 * 24 * 60 * 60, "week"   ],
    [       24 * 60 * 60, "day"    ],
    [            60 * 60, "hour"   ],
    [                 60, "minute" ],
    [                  1, "second" ],
  ];
  const none = "-"; // no translation
  function date2epoch(date) {
    if (!date)
      return 0;
    if (typeof date === "string") {
      if (/^\d+$/.test(date))
        date *= 1;
      else
        date = Math.trunc((new Date(date)).getTime() / 1000);
    } else if (typeof date !== "number") {
      return 0;
    }
    return date;
  }
  return (date1, date2=null, length=2, named=false) => {
    let res = none;
    // parse input
    date1 = date2epoch(date1);
    if (date1 === 0)
      return res;
    if (date2) {
      date2 = date2epoch(date2);
      if (date2 === 0)
        return res;
    } else {
      date2 = Math.trunc((new Date()).getTime() / 1000); // now
    }
    if (named)
      res = $filter("translate")(translateId + "justnow");
    // calc diff
    let diff, diffname;
    if (date1 >= date2) {
      diff = date1 - date2;
      if (named)
        diffname = $filter("translate")(translateId + "future");
    } else {
      diff = date2 - date1;
      if (named)
        diffname = $filter("translate")(translateId + "past");
    }
    if (diff < spans[spans.length - 1][0])
      return res;
    // build result into an array
    const ares = [];
    for (let span of spans) {
      if (diff < span[0])
        continue;
      const abs = length === 1 ? Math.round(diff / span[0]) : Math.floor(diff / span[0]);
      let cur;
      if (!named && abs === 1) // one
        cur = $filter("translate")(translateId + span[1] + ".singular");
      else if (abs === 1) // one
        cur = $filter("translate")(translateId + span[1] + ".singular_pastfuture");
      else if (named && abs > 20 && abs % 10 === 1) // one from base10 above 20
        cur = abs + " " + $filter("translate")(translateId + span[1] + ".plural_1_pastfuture");
      else if (abs <= 4 || (named && abs > 20 && abs % 10 <= 4)) // 2..4
        cur = abs + " " + $filter("translate")(translateId + span[1] + ".plural_234");
      else // 5 and more
        cur = abs + " " + $filter("translate")(translateId + span[1] + ".plural");
      if (cur)
        ares.push(cur);
      if (length === 1)
        break;
      length--;
      diff %= span[0];
    }
    // build string
    res = "";
    const len = ares.length;
    for (let i = 0; i < len; i++) {
      ares[i] = ares[i].replace(" ", "\u00A0"); // nbsp
      if (i === 0) {
        res += ares[i].substring(0, 1).toUpperCase() + ares[i].substring(1);
      } else {
        if (i === len - 1)
          res += " " + $filter("translate")(translateId + "and") + " ";
        else
          res += $filter("translate")(translateId + "sep") + " ";
        res += ares[i];
      }
    }
    if (diffname)
      res += " " + diffname;
    // return the result
    return res;
  }
}])

.filter("time", [function() {
  const div = [
    // [
    //  time modulus in ms,
    //  str,
    //  +leading or -trailing zeros count, - only if there was something above
    //  is optional
    // ]
    [24 * 60 * 60e3, "d ", 0, true], // days
    [     60 * 60e3, ":",  0, true], // hours
    [          60e3, ":",  2],       // minutes
    [           1e3, ".",  2],       // seconds
    [             1, "",  -3],       // milliseconds
  ];
  const zeros = "000"; // max available zeros
  return sec => {
    let ms = Math.round(sec * 1000);
    let res = "";
    for (let itm of div) {
      let f = ms >= itm[0] ? Math.floor(ms / itm[0]) : 0;
      if (itm[3] && f === 0 && !res)
        continue;
      ms %= itm[0];
      f = f.toString();
      if (itm[2] && res) {
        const len = f.length;
        if (itm[2] > len)
          f = zeros.substring(0, itm[2] - len) + f;
        else if (-itm[2] > len)
          f += zeros.substring(0, -itm[2] - len);
      }
      res += f + itm[1];
    }
    return res;
  }
}])

.filter("timeSimple", [function() {
  const div = [
    // [
    //  time modulus in ms,
    //  str,
    //  +leading or -trailing zeros count, - only if there was something above
    //  is optional
    // ]
    [24 * 60 * 60e3, "d ", 0, true], // days
    [     60 * 60e3, "h ",  0, true], // hours
    [          60e3, "m ",  2],       // minutes
    [           1e3, "s ",  2],        // seconds
    // [           1e3, ".",  2],       // seconds
    // [             1, "",  2],       // milliseconds
  ];
  const zeros = "000"; // max available zeros
  return sec => {
    let ms = Math.round(sec * 1000);
    let res = "";
    let items = 0;
    for (let itm of div) {
      let f = ms >= itm[0] ? Math.floor(ms / itm[0]) : 0;
      if (itm[3] && f === 0 && !res)
        continue;
      items += 1
      if (items > 2) break
      ms %= itm[0];
      f = f.toString();
      if (itm[2] && res) {
        const len = f.length;
        if (itm[2] > len)
          f = zeros.substring(0, itm[2] - len) + f;
      }
      res += f + itm[1];
    }
    return res;
  }
}])




.directive("bngSimplestars", function () {
  return {
    restrict: "A",
    link(scope, elem, attrs) {
      let charToStar = {D:"star",d:"star_outline",B:"star",b:"star_outline"}
      function calc(cur) {
        if (!cur) return;
        elem.text("")
        for (let c of cur) {
          elem.append("<md-icon class='material-icons small-star'>" + charToStar[c] +  "</md-icon>")
        }
      }
      calc(attrs.bngSimplestars)
      attrs.$observe("bngSimplestars", calc);
    }
  };
})

.directive("bngStarLine", function ($rootScope) {
  return {
    template: `
    <div class="mission-star-wrapper" ng-class="{ 'mission-star-with-content': hasContent, 'cross-out': mission && !mission.userSettingsAreDefault && data.isDefaultStar }">
      <div class="mission-star multi-stars-{{data.defaultStarIndex}}" ng-class="{
        'bonus-star': !data.isDefaultStar,
        'unlocked': data.unlocked,
      }"></div>
      <div class="mission-star-container">
        <div class="mission-star-label">{{data.label | contextTranslate}}</div>
        <div class="mission-star-content" ng-if="hasContent" ng-transclude></div>
      </div>
    </div>
    `,
    replace: true,
    transclude: true,
    scope: {
      data: "<",
      hasContent: "=",
      mission: "<"
    },
    // link: function (scope, elm, attrs, ctrl, transclude) {
    //   // check for transclude content (not reliable thanks to unknown effects)
    //   transclude(clone => {
    //     // scope.hasContent = clone.length > 0;
    //     for (let i = 0; i < clone.length; i++) {
    //       switch (clone[i].nodeName) {
    //         case "#comment":
    //           break;
    //         case "#text":
    //           scope.hasContent = clone[i].textContent.replace(/[ \r\n]+/gm, "").length > 0;
    //           break;
    //         default:
    //           scope.hasContent = true;
    //           break;
    //       }
    //       if (scope.hasContent)
    //         break;
    //     }
    //   });
    // }
  }
})

// focus element on conditional
.directive('focusIf', ["$timeout", "Utils", function($timeout, Utils) {
  return {
    restrict: 'A', // attribute only
    scope: false,
    link: function ($scope, $element, $attrs) {
      $scope.$watch($attrs.focusIf, function(newValue, oldValue) {
        if (!newValue) { return }

        const element = $element[0]
        function focus() {
          element.focus() // ask browser to focus the element. The element needs to have a tabindex attribute: tabindex="-1"
          if (document.activeElement === element) {
            // if successful, add the frame around it properly for the gamepad nav
            element.classList.add("menu-navigation");
            return true;
          } else {
            return false;
          }
        }
        // the timeout is needed for letting the page/DOM finish construction
        $timeout(function() {
          //console.log('focusIf element focussed: ', element, newValue)
          element.tabIndex = 0 // make the element focus-able
          if (!focus()) {
            // console.error('Unable to autofocus element. tabindex="-1" missing?', element)
            // console.error('Wanted to focus: ', element, ' browser decided on this element instead: ', document.activeElement)
            Utils.waitForCefAndAngular(focus); // try again once
          }
        }, 0)
      })
    }
  }
}])

// for putting a dom element into view. I.e.:
// <li ng-repeat="msg in ctrl.chatMessages track by $index" scroll-if="$last">{{msg}}</li>
.directive('scrollIf', function() {
  return function(scope, element, attrs) {
    scope.$watch(attrs.scrollIf, function(value) {
      if (value) {
        element[0].scrollIntoView({block: "end", behavior: "smooth"})
      }
    })
  }
})

// helper for using enter keys on input elements:
// <input type="text" ng-model="chatmsg" on-key-enter="ctrl.sendChatMessage()">
.directive('onKeyEnter', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('keydown keypress', function(event) {
        if (event.which === 13) {
          scope.$eval(attrs.onKeyEnter)
          event.preventDefault()
        }
      })
      scope.$on('$destroy', function() {
        element.unbind('keydown keypress')
      })
    }
  }
}])

// focus an element properly upon mouse over event - works in sync with the gamepad navigation and crossfire
// (but don't steal focus from input elements, or marked elements - huge annoyance otherwise)
// Mark elements with 'no-focus-steal' class to prevent focus stealing
.directive('focusOnHover', function($timeout) {
  return {
    restrict: 'A', // attribute only
    scope: false,
    link: function ($scope, $element, $attrs) {
      if (typeof $attrs.focusOnHover === "string" && $attrs.focusOnHover === "false")
        return;
      $timeout(function () {
        const element = $element[0]
        $element.on('mouseover', (event) => {
          if (!document.activeElement.matches('input, textarea, .no-focus-steal')){
            element.tabIndex = 0 // make the element focus-able
            element.focus() // focus
            element.classList.add('menu-navigation') // add navigation rect around it
          }
        })
        $element.on('mouseleave', (event) => {
          element.tabIndex = 0 // make the element focus-able
          element.blur() // lose focus
          element.classList.remove('menu-navigation') // remove navigation rect around it
        })
      })
    }
  }
})

// Message Toaster Service - can be used to redirect specified categories of "Message" events to the toaster
.service('MessageToasterService', ['$rootScope', 'toastr', "translateService", function($rootScope, toastr, translateService) {

  const DEFAULT_TOAST_OPTIONS = {
    positionClass: 'toast-top-right',
    timeOut: 5000,
    extendedTimeOut: 1000,
    toastClass: "beamng-message-toast"
  }

  let _handledCategories = []
  let _toastOptions = {...DEFAULT_TOAST_OPTIONS }
  let active = false
  let hooked = false

  const _handleMessage = (event, args) => {
    if (active && _handledCategories.includes(args.category)) {
      toastr.info(translateService.contextTranslate(args.msg, true), "", {
        ..._toastOptions,
        ...args.ttl && { timeOut: args.ttl*1000 }
      })
    }
  }

  return {
    get toastOptions() { return _toastOptions },
    get handledCategories() { return _handledCategories },
    set handledCategories(cats) { return _handledCategories = cats},
    get activeCategories() {
      return active ? _handledCategories : []
    },
    set active(state) {
      if (state && !hooked) {
        $rootScope.$on('Message', _handleMessage)
        hooked = true
      }
      active = state
    },
    get active() {return active}
  }
}])


/**
 * @ngdoc service
 * @name beamng.stuff:Utils
 * @description A set of general-purpose functions that wouldn't fit in a more specific-usage service, meant to be shared
 * throughout the game.
 */
.factory('Utils', ['$rootScope', function ($rootScope) {
  return {
    clamp: function (val, min, max) {
      return Math.min(Math.max(val, min), max)
    },

    roundDec: function (val, num) {
      num = num || 0
      if (val !== undefined) {
        var help = Math.pow(10, num)
        return Math.round(val * help) / help
      } else {
        throw new Error ('The function at least needs a value ')
      }
    },

    roundDecStr: function (val, num) {
      var r = this.roundDec(val, num).toString()
      var h = r.split('.')
      h[1] = h[1] || ''
      if (h[1].length !== num) {
        var t = ''
        for (var i = 0; i < num; i += 1) {
          t += '0'
        }
        r = h[0] + '.' + (h[1] + t).slice(0, num)
      }
      return r
    },

    round: function (val, step) {
      step = step || 1
      if (val !== undefined) {
        return Math.round(val / step) * step
      } else {
        throw new Error ('The function at least needs a value ')
      }
    },

    waitForCefAndAngular: function (func) {
      var cancel
      // wait for angulars digest loop
      cancel = setTimeout(() =>
        // wait for digest to be applied to dom
        window.requestAnimationFrame(() =>
          cancel = setTimeout(() =>
            // be really sure browser has rendered
            window.requestAnimationFrame(() =>
              // just in case (maybe an images takes longer or smth similar)
              cancel = setTimeout(func, 100)
            )
          ), 100
        ), 100
      )
      return () => clearTimeout(cancel); // this is on purpose in order to always call the latest function stored as "cancel".
    },

    rainbow: function (numOfSteps, step) {
      // This function generates vibrant, "evenly spaced" colors (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
      // Adam Cole, 2011-Sept-14
      // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      var r, g, b
      var h = step / numOfSteps
      var i = ~~(h * 6)
      var f = h * 6 - i
      var q = 1 - f
      switch(i % 6){
        case 0: r = 1; g = f; b = 0; break
        case 1: r = q; g = 1; b = 0; break
        case 2: r = 0; g = 1; b = f; break
        case 3: r = 0; g = q; b = 1; break
        case 4: r = f; g = 0; b = 1; break
        case 5: r = 1; g = 0; b = q; break
      }
      //var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2)
      return [r, g, b]
    },

    /**
     * @ngdoc method
     * @name parseBBCode
     * @methodOf beamng.stuff:Utils
     * @param {string} text The text to be parsed.
     * @description Surprise, this parses BBCode! Like for example the one returned from Steams API.
     */
    parseBBCode: function (text) {
      if (typeof text !== "string") text = ''
      return window.angularParseBBCode(text) // defined in ui/ui-vue/src/services/content/bbcode.js
    },


    /**
     * @ngdoc method
     * @name deepFreeze
     * @methodOf beamng.stuff:Utils
     * @description
     * From mdn: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
     * To make obj fully immutable, freeze each object in obj.
     *  To do so, we use this function.
     */
    deepFreeze: function _deepfreeeze_ (obj) {

      // Retrieve the property names defined on obj
      var propNames = Object.getOwnPropertyNames(obj)

      // Freeze properties before freezing self
      propNames.forEach(function(name) {
        var prop = obj[name]

        // Freeze prop if it is an object
        if (typeof prop == 'object' && prop !== null)
          _deepfreeeze_(prop)
      })

      // Freeze self (no-op if already frozen)
      return Object.freeze(obj)
    },

    /**
     * @ngdoc method
     * @name dateFromUnixTs
     * @methodOf beamng.stuff:Utils
     * @param {number} seconds A Unix timestamp (seconds since Jan 01 1970)
     *
     * @description Converts unix timestamp to Date format
     */
    dateFromUnixTs: function (seconds) {
      return new Date(seconds * 1000)
    },

    mapUI: function(model, view, path, modelToView, viewToModel) {
      // Helper to use a custom scale in the final visible UI, by mapping the real source value (the "model"), to a fake visual-only value ("view"). For example:
      //  - display a linear value in logarithmic scale:            mapUI(myModel, myView, "audio.eq.cutoffFrequency", v=>Math.log10(v), v=>Math.pow(10, v))
      //  - display a C++ index (0 to N-1) as a LUA index (1 to N): mapUI(myModel, myView, "graphics.render.quality",  v=>v+1,           v=>v-1)
      function ref(obj, route, value) {
        // if <route> has a value of "foo.bar.z", this function will return obj.foo.bar.z
        // if <value> is defined, obj.foo.bar.z will be assigned <value> before returning
        if (typeof route == 'string') route = route.split('.')
        if (route.length == 1 && value !== undefined) return obj[route[0]] = value
        if (route.length == 0) return obj
        return ref(obj[route[0]], route.slice(1), value)
      }
      // build the necessary empty dict structure in 'view', that allows access to the 'path' object
      var subpaths = path.split('.')
      var subpath
      for(i in subpaths) {
        subpath = subpaths[i]
        if (i == subpaths.length-1) break
        if (view[subpath] === undefined) view[subpath] = {}
        view = view[subpath]
      }
      // define the actual conversion getter and setter
      Object.defineProperty(view, subpath, {
        get:function() { return modelToView(ref(model, path)); },
        set:function(v) { ref(model, path, viewToModel(v)); }
      })
    },

    random: function (lower, upper, int) {
      lower = lower || 0
      upper = (upper === undefined ? 1 : upper)
      if (int !== undefined && int) {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower
      } else {
        return Math.random() * (upper - lower) + lower
      }
    }
  }
}])



.service("NumAnim", ["$timeout", function($timeout) {
  const time = 1000; // target time for a single item
  const delay = 500; // delay between queued items
  const tick = 50; // one tick time

  let cnt = 0, running = false;
  const queue = {}, seq = [], f = time / tick;

  function run() {
    if (seq.length === 0) {
      running = false;
      return;
    }
    running = true;
    let tmr = tick;
    const id = seq[0];
    const itm = queue[id];
    itm.cur += itm.delta;
    if (itm.cur >= itm.val) {
      itm.cur = itm.val;
      seq.splice(0, 1);
      delete queue[id];
      tmr = delay;
    }
    render(itm);
    $timeout(run, tmr);
  }

  function parse(itm) {
    try {
      itm.val = parseFloat(itm.val);
    } catch (fire) {
      itm.val = 0;
    }
    if (itm.val === 0) {
      itm.float = false;
      itm.delta = 1;
      return;
    }
    itm.neg = itm.val < 0;
    if (itm.neg)
      itm.val = -itm.val;
    itm.float = itm.val % 1 > 0;
    itm.delta = itm.val / f;
    if (itm.float) {
      if (itm.delta < 0.001)
        itm.delta = 0.001;
    } else {
      itm.delta = ~~itm.delta;
      if (itm.delta < 1)
        itm.delta = 1;
    }
  }
  function render(itm) {
    let str = itm.cur;
    if (itm.float)
      str = str.toFixed(3).replace(/\.0+$/, "");
    if (itm.cur > 0 && itm.neg)
      str = "-" + str;
    itm.elm.innerHTML = str;
  }

  return {
    add(elm, val) {
      const id = cnt++;
      queue[id] = { elm, val, cur: 0 };
      parse(queue[id]);
      seq.push(id);
      $timeout(() => {
        render(queue[id]); // draw initial value
        if (!running)
          run();
      }, 0);
    },
    change(id, val) {
      if (queue.hasOwnProperty(id)) {
        itm.val = val;
        parse(queue[id]);
      }
    },
    del(id) {
      if (queue.hasOwnProperty(id)) {
        seq.splice(seq.indexOf(id), 1);
        delete queue[id];
      }
    },
  }
}])

.directive("bngNumAnim", ["NumAnim", function(NumAnim) {
  return {
    restrict: "A",
    scope: false,
    link: function ($scope, $element, $attrs) {
      const id = NumAnim.add($element[0], $attrs.bngNumAnim);
      $scope.$watch($attrs.bngNumAnim, function (val) {
        NumAnim.change(id, val);
      });
      $scope.$on("$destroy", () => NumAnim.del(id));
    }
  };
}])






//non enumerable sum function for arrays
Object.defineProperty(Array.prototype, 'sum', {
  value: function () {
    return this.reduce(function(pv, cv) { return pv + cv; }, 0)
  }
})

Object.defineProperty(Array.prototype, 'add', {
  value: function (arr) {
    return this.concat.apply(this, arr)
  }
})

// Simulates the press of a key for a specific target
Object.defineProperty(Element.prototype, 'dispatchKey', {
  value: function dispatchKey (key) {
    // key should be ther number of the keycode one wants to dispatch
    if (typeof key !== 'number') {
      throw new Error('Invalid key')
    }

    // Default to document
    target = this || document

    // actual event to be dipatched
    var ev = document.createEvent('KeyboardEvent')

    // Hack Idea from: http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key/10520017#10520017
    // Basically what this does is it overwrites the inhereted in cef buggy and not working property keyCode
    Object.defineProperty(ev, 'keyCode', {
      get : function() {
        return this.keyCodeVal
      }
    })

    // Also tested with keypress, but apparently that does not work in cef for arrow keys but only most other ones
    ev.initKeyboardEvent('keydown', true, true)

    // Used for the getter of the keyCode property
    // Stored as ownproperty so the function execution does not leave an open closure
    ev.keyCodeVal = key

    // Dispatch keypress and return if it worked
    return target.dispatchEvent(ev)
  }

})






// idea from: http://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
Object.defineProperty(Array.prototype, 'unique', {
  value: function () {
    return this.filter((item, pos) => this.indexOf(item) === pos)
  }
})

Object.defineProperty(Array.prototype, 'last', {
  value: function () {
    return this[this.length - 1]
  }
})

// convert array like objects to arrays.
// Normaly you would not have to use this. Rather make get array right in the first place
Object.defineProperty(Object.prototype, 'convertToArray', {
  value: function () {
    return Object.keys(this).map((key) => this[key])
  }
})

Object.defineProperty(Object.prototype, 'isEmpty', {
  value: function () {
    return Object.keys(this).length === 0
  }
})

//https://stackoverflow.com/q/17369098
Object.defineProperty(Number.prototype, 'countDecimals', {
  value: function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0
    return this.toString().split(".")[1].length || 0
  }
})

function nop () {}

window.print = nop



function fnCallCounter (fn) {
  ctr = 0
  interval = 1000
  i = setInterval(() => {
    console.log(ctr, interval)
    ctr = 0
  }, interval)
  return {intervalHandel: i, newFn: function () {
      ctr += 1
      fn.apply(undefined, arguments)
    }}

}
