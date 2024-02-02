angular.module('beamng.controls')

.directive('bngSelect', ['$translate', function ($translate) {
  return {
    scope: {
      options: '=',
    },
    require: ['ngModel', '?^bngNavItem'],
    replace: true,
    template: `
      <div tabindex="-1" class="bng-select">
        <span bng-nav-item ng-click="changeValue(-1)" class="button left" bng-sound-class="bng_click_generic"></span>
        <span class="text"></span>
        <span bng-nav-item ng-click="changeValue(1)" class="button right" bng-sound-class="bng_click_generic"></span>
      </div>
    `,

    link: function (scope, element, attrs, controllers) {
      var ngModel = controllers[0]
        , navItemCtrl = controllers[1]


      var txt = element[0].querySelector('.text')
      var loop = 'loop' in attrs && (attrs.loop == "" ? true : scope.$eval(attrs.loop))

      var lButton = element[0].querySelector('.button.left')
        , rButton = element[0].querySelector('.button.right')

      var config = angular.merge({ value: x => x, label: x => x },  eval(`(${attrs.config})`) )
        , index = -1


      var findIndex = () => {
        index = scope.options.findIndex(
          x => angular.equals(config.value(x), ngModel.$modelValue)
        )
      }

      var updateText = () => {
        txt.innerHTML = index > -1 ? $translate.instant(config.label(scope.options[index])) : "?"
      }

      ngModel.$render = () => {
        if('bngOptions' in attrs) {
          scope.options = JSON.parse(attrs.bngOptions)
        }
        if('bngRangeMin' in attrs && 'bngRangeMax' in attrs) {
          scope.options = []
          let idx = 0
          for(var i = parseInt(attrs.bngRangeMin) ; i < parseInt(attrs.bngRangeMax)+1; i++) {
            scope.options[idx] = {v:i, l:i}
            idx++
          }
        }
        findIndex()
        updateText()
      }

      scope.changeValue = (offset) => {
        if (index < 0) return
        if (loop) {
          index = (scope.options.length + index + offset) % (scope.options.length)
        } else {
          index += offset
          index = Math.max(0, index)
          index = Math.min(index, scope.options.length-1)

          if (index == 0) {
            lButton.classList.add('bng-disabled')
          } else {
            lButton.classList.remove('bng-disabled')
          }

          if (index == scope.options.length - 1) {
            rButton.classList.add('bng-disabled')
          } else {
            rButton.classList.remove('bng-disabled')
          }
        }
        bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', 'event:>UI>Generic>Select', {unique = true})`)
        // don't use primitives for ng-model for this component, always use objects. ref: https://github.com/angular/angular.js/wiki/Understanding-Scopes
        ngModel.$modelValue = config.value(scope.options[index])
        ngModel.$viewValue  = ngModel.$modelValue
        ngModel.$$writeModelToScope()
        updateText()
      }

      if (navItemCtrl) {
        navItemCtrl.actions.right = {cmd: () => { scope.changeValue(1); }, name: 'Increase'}
        navItemCtrl.actions.left = {cmd: () => { scope.changeValue(-1); }, name: 'Decrease'}
      }
      var _init_ = () => {
        findIndex()
        // scope.changeValue(0); // <-- why? this just triggers an ng-change on initialisation and works fine without as far as i see it
      }

      element.ready(_init_)
      scope.$watch('options', _init_)

    }
  }
}])

.directive('bngSlider', ['$document', 'Utils', function ($document, Utils) {
  return {
    restrict: 'E',
    require: ['ngModel', '?^bngNavItem'],
    template: `
      <div class="bng-slider" tabindex="a" ondragstart="return false;">
        <div class="bng-slider-filler">
          <div class="bng-slider-handle"></div>
        </div>
      </div>
    `,
    replace: true,
    link: function (scope, element, attrs, controllers) {
      var ngModel = controllers[0]
        , navItemCtrl = controllers[1]


      // TODO: The <div> element should not be focusable at all!
      // Not sure why it has a tabindex value 0, possibly from ng-material.
      // For the moment, an invalid value like "a" does the job.
      var xOffset = () => element[0].getBoundingClientRect().left
        , xFactor = () => (max - min) / element[0].offsetWidth
        , min = parseFloat(attrs.min) || 0
        , max = parseFloat(attrs.max) || 100
        , step = parseFloat(attrs.step) || 1

      var track = angular.element(element[0])
        , filler = element[0].querySelector('.bng-slider-filler')

      var drawFiller = () => {
        filler.style.width = (ngModel.$modelValue - min) / xFactor() + 'px'
      }

      scope.moveSlider = function (ticks) {
        var short =  Utils.round(ngModel.$modelValue + ticks*step, step)
        if (short <= max && short >= min) {
          setVal(short)
        }
      }

      if (navItemCtrl) {
        navItemCtrl.actions.right = {cmd: () => { scope.moveSlider(1); }, name: 'Increase'}
        navItemCtrl.actions.left = {cmd: () => { scope.moveSlider(-1); }, name: 'Decrease'}
      }

      var setValue = ($event) => {
        scope.$evalAsync(() => {
          var v = min + ($event.clientX - xOffset()) * xFactor()
          v = Math.round(v / step) * step
          if (v > max) v = max
          else if (v < min) v = min
          setVal(v)
        })
      }

      function setVal (v) {
        bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', 'event:>UI>Generic>Select', {unique = true})`)
        ngModel.$modelValue = v
        ngModel.$viewValue  = ngModel.$modelValue
        ngModel.$$writeModelToScope()
        drawFiller()
      }

      ngModel.$render = drawFiller
      var addListeners    = () => { $document.on('mousemove', setValue); }
      var removeListeners = () => { $document.off('mousemove', setValue); }

      track.on('mousedown', (event) => {
        drawFiller()
        scope.$evalAsync(() => {
          setValue(event)
        })

        addListeners()
      })

      track.on('dragend', () => { removeListeners(); })
      $document.on('mouseup', () => { removeListeners(); })

      element.ready(() => {
        ngModel.$render()
      })
    }
  }
}])

.directive('bngButton', function () {
  return {
    restrict: 'E',
    scope: {
      click: '&'
    },
    require: ['?^navItem'],
    template: `
      <div bng-font="secondary" class="bng-button color-white bd-padding bd-margin" layout="row" layout-align="center center" ng-focus="focus=true"
        ng-blur="focus=false" ng-class="{'bg-primary-dark': focus, 'bg-primary-light': !focus}" ng-click="click()">
        <ng-transclude></ng-transclude>
      </div>
    `,
    transclude: true,
    replace: true,
    link: function (scope, element, attrs, controllers) {
      var navItemCtrl = controllers[0]

      if (navItemCtrl) {
        navItemCtrl.actions.click = {cmd: () => scope.click(), navigation: true}
      }
    }
  }
})


.service('ConfirmationDialog', function ($q) {
  let dialogs = [],
      openFn,
      dialogDisplayed = false,
      currentDialog,
      config;

  function open (title, text, options, additionalConfig = {}, additionalText = "") {
    window.bridge && window.bridge.uiNavEvents.clearFilteredEvents()
    const deferred = $q.defer()
    config = additionalConfig

    if (typeof options[0] === 'string') {
      options = options.map(e => ({ label: e, key: e }));
    }
    let dialog = {
      dialog: { title, text, options, additionalConfig, additionalText },
      deferred: deferred,
      resolve: (res) => {
        deferred.resolve(res);
        dialogDisplayed = false;
        currentDialog = null
        if (dialogs.length > 0) {
          showDialog();
        } else {
        }
      }
    }
    dialogs.push(dialog)

    if (!dialogDisplayed) {
      showDialog();
    }
    let result = Object()
    result.then = function(...args) { deferred.promise.then(...args) }
    result.close = function(...args) { closeFn(dialog.resolve) }
    return result
  }

  function showDialog () {
    const d = dialogs.shift();
    if (d === undefined)
      return console.error('Tried to show dialog when there was non queued');

    dialogDisplayed = true;
    currentDialog = d

    if (openFn === undefined) {
      d.deferred.reject('Missing dialog dir in current DOM.');
    } else {
      openFn(d.dialog, d.resolve);
    }
  }

  function register (open, close) {
    openFn = open
    closeFn = close
  }

  function getConfig() {
    return config
  }

  // This should be an id but data doesn't have one so use title or text instead
  function containsDialog(title, text) {
    const containsDialog = dialogs.filter(d => (title && d.title === title) || (text && d.text === text)).length > 0

    return containsDialog || (currentDialog && ((title && currentDialog.dialog.title === title) ||
      (text && currentDialog.dialog.text === text)))
  }

  //  IMPORTANT: It is on purpose, that there is no hook here. Do NOT add one.
  return {
    open,
    _registerDir: register,
    getConfig,
    containsDialog
  }
})

.directive('bngDialog', ["ConfirmationDialog", "InputCapturer", function (ConfirmationDialog, InputCapturer) {
  return {
    restrict: 'E',
    replace: true,
    template: `
    <div ng-if="show" class="confirmation-dialog container" style="background-color: rgba(0,0,0, 0.5); z-index:var(--zorder-index_popup);" bng-blur="true">
      <style ng-if="!app.mainmenu">
        body > * { opacity: 0; }
        .confirmation-dialog { opacity: 1 !important; }
      </style>
      <div nav-root class="dialog {{dialog.additionalConfig.class||''}}" position="center center" layout="column">
        <div ng-if="dialog.title" class="header bg-primary" layout="row" layout-align="center center">
          <div class="color-white bd-padding heading2">
            <h4>{{dialog.title | translate}}</h4>
          </div>
        </div>
        <div flex class="content bd-padding" layout="column">
          <div flex class="color-white msg bd-margin text">
            <span bng-translate='{ "txt":"{{dialog.text}}", "context":{{config}} }'></span>
            <span ng-bind-html="dialog.additionalText"></span>
          </div>
          <div class="options" layout="row" layout-align="center center" layout-wrap>
            <bng-button
              style="margin-bottom:0.5em;"
              ng-repeat="option in dialog.options track by $index"
              ng-disabled="option.enabled!==undefined && !option.enabled"
              focus-if="{{ option.default }}"
              nav-item click="(option.enabled||option.enabled===undefined) && clicked(option.key)"
              style="position: relative;"
              class="md-raised heading3 {{ option.default ? 'bng-button-main' : 'bng-button-outline' }} {{ option.class }}"
              bng-sound-class="{{ option.soundClass || (option.isCancel ? 'bng_cancel_generic' : 'bng_click_generic') }}"
            >
              <span bng-translate="{{ option.label | contextTranslate }}"></span>
              <span style="font-style:italic; font-weight:200;" ng-if="option.disableReason" bng-translate="{{ option.disableReason | contextTranslate }}"></span>
            </bng-button>
          </div>
        </div>
      </div>
    </div>`,
    link: function (scope, element, attrs) {
      //  IMPORTANT: It is on purpose, that there is no hook here. Do NOT add one.
      ConfirmationDialog._registerDir(openFn, closeFn)
      scope.config = ConfirmationDialog.getConfig()

      const captureInput = InputCapturer({
        backAction() {
          if (Array.isArray(scope.dialog.options)) {
            for (let btn of scope.dialog.options) {
              if (btn.isCancel) {
                scope.clicked(btn.key);
                break;
              }
            }
          }
          return true;
        }
      });
      scope.$on("$destroy", () => captureInput(false)); // just in case

      function closeFn(callback) {
        scope.show = false
        captureInput(false);
        callback()
      }
      function openFn (dialog, callback) {
        scope.$evalAsync(() => {
          scope.show = true
          captureInput(true);
          scope.dialog = dialog
          scope.config = ConfirmationDialog.getConfig()
          scope.clicked = (val) => {
            scope.show = false
            captureInput(false);
            callback(val)
          }
        })
      }

      // opens popup from lua
      scope.$on("showConfirmationDialog", (evt, opts) => {
        if (typeof opts !== "object")
          return;
        const lua = !!opts.buttons.find(btn => btn.luaCallback);
        if (!lua)
          throw new Error("Only lua callbacks are supported for now");
        if (lua) {
          for (let btn of opts.buttons)
            btn.key = btn.luaCallback || null;
        }

        let className;
        if (opts.text === 'ui.career.towPrompt') {
          // To prevent duplicate confirmation dialogs when spamming 'r' key
          if (ConfirmationDialog.containsDialog(opts.title, opts.text))
            return;
          // set custom layout class
          className = "career-towprompt";
        }

        ConfirmationDialog.open(opts.title, opts.text, opts.buttons, { class: className }).then(res => {
          if (res)
            bngApi.engineLua(res);
        });
      });
      // test:
      // scope.$broadcast("showConfirmationDialog", {
      //   title: "optional title",
      //   text: "some text",
      //   buttons: [
      //     { label: "button 1", key: true, default: true, luaCallback: "some_lua_module.promptCallback()" },
      //     { label: "button 2", key: false }
      //   ]
      // });
    }
  }
}])

;
