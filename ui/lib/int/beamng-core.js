angular.module('beamng.core', [])

/**
 * @ngdoc service
 * @name  beamng.core:RateLimiter
 *
 * @description
 * Limits the rate of function calls by means of throttling or
 * debouncing. Essentially the two functions of the service are
 * (simplified) copies of {@link http://underscorejs.org/ underscore}
 * library implementations.
 *
 * @note
 * These are _not_ Angular ports of underscore's functions. This
 * means that scope digests should be called manually (if at all).
 */
.service('RateLimiter', function () {
  return {

    /**
     * @ngdoc method
     * @name debounce
     * @methodOf beamng.core:RateLimiter
     * @param {function} func The function to be debounced
     * @param {int} wait Time in milliseconds to allow between successive calls.
     * @param {boolean} immediate Whether to allow first function call
     *
     * @description
     * underscore.js debounce utility, partially rewritten as
     * seen in {@link http://davidwalsh.name/function-debounce}
    **/
    debounce: function (func, wait, immediate) {
      var timeout
      return function () {
        var context = this, args = arguments
        var later = function () {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
      }
    },

    /**
     * @ngdoc method
     * @name throttle
     * @methodOf beamng.core:RateLimiter
     * @param {func} The function to throttle
     * @param {int} wait Number of milliseconds between successive calls.
     *
     * @description
     * underscore.js throttle utility, partially rewritten as seen
     * in {@link http://briantford.com/blog/huuuuuge-angular-apps}
    **/
    throttle: function (func, wait) {
      var context, args, timeout, result
      var previous = 0
      var later = function () {
        previous = new Date()
        timeout = null
        result = func.apply(context, args)
      }
      return function () {
        var now = new Date()
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0) {
          clearTimeout(timeout)
          timeout = null
          previous = now
          result = func.apply(context, args)
        } else if (!timeout) {
          timeout = setTimeout(later, remaining)
        }
        return result
      }
    }
  }
})

.directive('bngSound', [function () {
  var path = 'core/art/sound'

  return function (scope, element, attrs) {
    var config = scope.$eval(attrs.bngSound)
    if (!config)
      return console.warn("bng-sound is empty or cannot be evaluated", element[0]);

    Object.keys(config).forEach((ev) => {
      element.on(ev, () => {
        // console.log(config[ev], config[ev].disabled ? config[ev].disabled() : 'non obj')

        if (typeof config[ev] === 'string') {
          var soundLoc = config[ev].startsWith('event:') ? config[ev] : `${path}/${config[ev]}`
          bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', '${soundLoc}')`)
        } else if (!config[ev].disabled()) {
          var soundLoc = config[ev].sound.startsWith('event:') ? config[ev].sound : `${path}/${config[ev].sound}`
          bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', '${soundLoc}')`)
        }
      })
    })
  }
}])

.directive('bngSoundClass', [function () {
  return function (scope, element, attrs) {
    var eventList = ["click", "dblclick", "focus", "mouseenter", "mouseleave"]
    var soundClass = attrs.bngSoundClass

    eventList.forEach((ev) => {
      element.on(ev, () => {
        // this is a hack to prevent he following scenario:
        // a) click on a button in page X, leading to page Y. Mouse is over an element with sound on page Y.
        // this prevents the hover sounds on page Y
        // ignoring the first 2 'hover' sounds
        if(newPageSilenceEventCounter > 0 && (ev == 'mouseenter' || ev == 'focus')) {
          let dt = Date.now() - newPageTimestamp
          if(dt > 200) {
            //console.error("page change timeout", dt)
            newPageSilenceEventCounter = 0
          } else {
            //console.log('ignoring sound: ', soundClass, ev, dt)
            newPageSilenceEventCounter--
            return
          }
        }
        // another hack to prevent hover triggering for an element the user is already focusing on
        // it compares the bounding box of the current and previous hover elements
        if(ev == 'mouseleave') {
            if(typeof lasthoverbox !== "undefined") {
                delete lasthoverbox
            }
            return
        }
        if(ev == 'mouseenter' || ev == 'focus') {
            if(typeof lasthoverbox !== "undefined") {
                let cbox = element[0].getBoundingClientRect()
                if(cbox.left >= lasthoverbox.left && cbox.right <= lasthoverbox.right &&
                    cbox.top >= lasthoverbox.top && cbox.bottom <= lasthoverbox.bottom) {
                    return
                }
            }
            lasthoverbox = element[0].getBoundingClientRect()
        }
        //console.log('playing sound: ', soundClass, ev)
        bngApi.engineLua(`ui_audio.playEventSound('${soundClass}', '${ev}')`);
      })
    })
  }
}])

.directive('bngTestSound', [function () {
  // for UI debug window
  return function (scope, element, attrs) {
    let elm = document.getElementById(attrs.bngTestSound);
    if (!elm)
      return;
    element.on("click", () => bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', '${elm.value}')`));
  }
}])

// todo use camelcase here and udpated every other entry -yh
.directive('imageslider', ['$interval', '$timeout', function ($interval, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: `
      <div class="imageslider">
        <div class="imageslideItem filler" ng-repeat="image in images track by $index" ng-show="image.visible">
          <div ng-style="{ backgroundImage: 'url(\\'' + image.url + '\\')', backgroundSize: 'cover', backgroundPosition: 'center center' }" class="filler"></div>
        </div>
      </div>
      `,
    scope:{
      imageurls: '=',
      delay: '@'
    },
    link: function (scope, elem, attrs) {
      let timer
      let offsetTimer
      let c = 0
      let delayMin = 3000
      let delayVar = 1000
      let delay = Number(scope.delay) || (delayMin + delayVar * Math.random())
      let initialDelay = delay * 0.3

      //console.log("imageslider delay: ", delay, ' inital: ' , initialDelay)

      scope.images = []

      // go through the images list and disable everything except the one to currently be shown
      function switchImages () {
        c = (c + 1) % scope.images.length
        scope.images.forEach((elem, i) => elem.visible = i === c)
      }

      function getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min) + min)
      }

      function setup () {
        // if it's empty or undefined
        if (!scope.imageurls)
          scope.imageurls = [];
        // if it's a string, it'll have only one picture
        else if (typeof scope.imageurls === 'string')
          scope.imageurls = [scope.imageurls];

        // if not array
        if(typeof scope.imageurls !== 'object' || !Array.isArray(scope.imageurls)) {
          console.debug("invalid image data: imageurls = ", scope.imageurls)
          return
        }

        // set default image
        if (scope.imageurls.length === 0 || !scope.imageurls[0])
          scope.imageurls = ["/ui/images/appDefault.png"];

        //console.debug(scope.imageurls)

        // force browser to preload all images into its cache
        for(const u of scope.imageurls) {
          let tmp = new Image()
          tmp.src = u
          tmp.onload = () => tmp = null
        }

        // choose a random start image
        c = getRandomInt(0, scope.imageurls.length)
        scope.images = scope.imageurls.map((elem) => {return {url: elem, visible: true}})
        scope.images.forEach((elem, i) => elem.visible = i === c)

        // This is needed to reset the timer whenever the urls changes
        if (scope.imageurls) {
          if(offsetTimer) $timeout.cancel(offsetTimer)
          if(timer) $interval.cancel(timer)
        }

        // only do the animations if we have more than one image
        if(scope.images.length > 1) {
          // don't start right away
          offsetTimer = $timeout(function() {
            timer = $interval(switchImages, delay)
          }, initialDelay)
        }
        //console.log('scope.images = ', scope.images)
      }

      scope.$watch('imageurls', setup)

      scope.$on('$destroy', function() {
        if(offsetTimer) $timeout.cancel(offsetTimer)
        if(timer) $interval.cancel(timer)
      })
    }
  }
}])

.directive("imgCarousel", ["$interval", "$timeout", function ($interval, $timeout) {
  return {
    restrict: "E",
    replace: true,
    template: `
      <div class="img-carousel" style="background-image: url({{ imgcurrent }});">
        <div ng-if="imgprev" class="img-carousel-prev" style="{{ cssprev }}"></div>
        <div ng-if="navshow && images.length > 1" class="img-carousel-nav">
          <span bng-no-nav="true"
            ng-repeat="img in images track by $index" ng-click="switchImage($index)"
            class="{{ index === $index ? 'selected' : '' }}"></span>
        </div>
      </div>
    `,
    scope: {
      imageurls: "=",
      delay: "@",
      slow: "@",   // default: false
      nav: "@",    // default: true
      random: "@", // default: true
      sync: "@",  // default: false (see example in mainmenu.html/js)
    },
    link: function (scope, elem, attrs) {
      // element expose __sync([index]) function, __images image list and __index

      const imgNotFound = "/ui/images/appDefault.png";
      // use rgba(0,0,0, 0.5) png as an initial image
      const imgInitial = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=";

      function boolParse(val, valDefault=false) {
        if (typeof val === "string")
          return val.toLowerCase() === (!valDefault).toString() ? !valDefault : valDefault;
        else
          return typeof val === "undefined" || val === null ? valDefault : !!val;
      }
      /// boolParse test:
      // console.log(
      //   0, boolParse(undefined, true) === true, boolParse(undefined, false) === false,
      //   1, boolParse(true, true) === true, boolParse(true, false) === true,
      //   2, boolParse(false, false) === false, boolParse(false, true) === false,
      //   3, boolParse("true", true) === true, boolParse("true", false) === true,
      //   4, boolParse("false", false) === false, boolParse("false", true) === false,
      // );

      scope.index = -1; // current index; must be -1
      const allowRandom = boolParse(scope.random, true);
      const isSynced = boolParse(scope.sync, false);

      let randomStart = allowRandom; // choose a random start image

      let timer, offsetTimer;
      let delayMin = 3000;
      let delayVar = 1000;
      let delay = +scope.delay || (delayMin + (allowRandom ? delayVar * Math.random() : 0));
      let initialDelay = delay * 0.3;

      scope.navshow = boolParse(scope.nav, true);

      let animslow = boolParse(scope.slow, false);

      let cssprev;
      function updCssprev() {
        cssprev = {
          init: "opacity: 1;",
          anim: `opacity: 0; transition: opacity ${animslow ? 1900 : 300}ms;` // minus 100ms
        };
      }
      updCssprev();

      function reset() {
        if (offsetTimer)
          $timeout.cancel(offsetTimer);
        if (timer)
          $interval.cancel(timer);
      }
      function start() {
        if (isSynced)
          return;
        if (timer)
          $interval.cancel(timer);
        timer = $interval(() => switchImage(), delay);
      }

      elem[0].__sync = idx => {
        console.log("sync", idx);
        if (typeof idx === "number")
          scope.index = --idx;
        scope.index -= 1;
        reset();
        // start();
        switchImage();
      };

      const cache = [];
      scope.images = [];
      scope.imgcurrent = imgInitial;
      let syncs = [], syncImagesFunc = imgs => imgs;

      function switchImage(idx) {
        if (scope.index > -1) {
          scope.imgprev = scope.imgcurrent;
          scope.cssprev = `background-image: url(${scope.imgprev}); ${cssprev.init}`;
          $timeout(() => scope.cssprev += cssprev.anim, 100);
        }
        if (typeof idx !== "number")
          idx = scope.index + 1;
        else if (!isSynced)
          start();
        scope.index = idx % scope.images.length;
        scope.imgcurrent = scope.images[scope.index];
        for (let slv of syncs)
          slv.__switchImage(scope.index);
      }
      scope.switchImage = switchImage;

      function setup() {
        cache.splice(0, cache.length);
        scope.imgprev = null;
        scope.cssprev = "";

        let imageurls = scope.imageurls;

        // if not an array
        if (typeof imageurls === "string")
          imageurls = [imageurls];
        if (typeof imageurls !== "object" || !Array.isArray(imageurls)) {
          console.debug("Invalid imageurls:", imageurls);
          return;
        }

        scope.images = (imageurls || []).map(itm => {
          let url = itm || imgNotFound;
          // preload
          let tmp = new Image();
          tmp.src = url;
          // tmp.onload = () => tmp = null;
          tmp.onerror = () => { console.debug("Cannot load:", url); tmp = null; };
          cache.push(tmp);
          // return
          return url;
        });

        if (randomStart)
          scope.index = Math.floor(Math.random() * scope.images.length);
        else
          scope.index = -1;
        if (!isSynced) {
          // update properties on slaves
          setupSyncs();
          // show initial image
          switchImage();
        }

        // This is needed to reset the timer whenever the urls changes
        reset();

        // only do the animations if we have more than one image
        if (scope.images.length > 1 && !isSynced) {
          // don't start right away
          offsetTimer = $timeout(start, initialDelay);
        }
        //console.log('scope.images = ', scope.images)

        if (!isSynced) {
          // patch for the conflict with angular-aria
          $timeout(() => {
            let elms = Array.from(elem[0].querySelectorAll("[bng-no-nav='true']"));
            elms.forEach(elm => elm.removeAttribute("tabindex"));
          }, 100);
        }
      } // /setup

      function setupSyncs() {
        for (let slv of syncs) {
          slv.__syncSetter({
            navshow: scope.navshow,
            delay,
            animslow,
            images: syncImagesFunc(scope.images),
          });
        }
      }

      if (!isSynced) { // master mode
        scope.$watch("imageurls", setup);
        scope.$on("$destroy", reset);
        elem[0].__connect = (switches, imagesFunc=imgs=>imgs) => {
          syncs = (switches || [])
            .filter(sw => typeof sw.__switchImage === "function");
          syncImagesFunc = imagesFunc;
          setupSyncs();
          for (let slv of syncs)
            slv.__switchImage(scope.index);
        };
        Object.defineProperties(elem[0], {
          __images: {
            get() { return JSON.parse(JSON.stringify(scope.images)); }
          },
          __index: {
            get() { return scope.index; }
          },
        });
      } else { // sync mode
        elem[0].__switchImage = switchImage;
        elem[0].__syncSetter = opts => {
          scope.navshow = opts.navshow;
          delay = opts.delay;
          animslow = opts.animslow;
          updCssprev();
          scope.images = opts.images;
        };
      }
    }
  }
}])

.directive('countryFlag', function () {
  return {
    restrict: 'E',
    template: `<img class="filler" ng-src="{{imgSrc}}"/>`,
    scope: {
      src: '='
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
        scope.imgSrc = `/ui/lib/int/country_flags/${shortHand[scope.src] || scope.src || 'missing'}.png`
      }

      scope.$watch('src', setSrc)

      setSrc()
    }
  }
})

.service("bngWSApi", ['$rootScope', function($rootScope) {
  $rootScope.instances = {}
  $rootScope.connectionState = websocketCommGetConnectionState()
  $rootScope.ingame = beamng.ingame

  $rootScope.$on('connectionStateChanged', function(evt, state, ) {
    //console.log('connectionStateChanged: ', state)
    $rootScope.$apply(function () {
      $rootScope.connectionState = state
    })
  })

}])

.directive("bngAttr", function ($parse) {
  return {
    restrict: "A",
    link: function (scope, elems, attrs) {
      const elm = elems[0];
      function upd(name, value) {
        // it seems either jqlite or cef do not care about NS in svg
        // if (elm.namespaceURI)
        //   elm.setAttributeNS(elm.namespaceURI, name, value);
        // else
          elm.setAttribute(name, value);
      }
      for (let name in attrs) {
        if (name.indexOf("bngAttr.") === 0) {
          scope.$watch(() => attrs[name], (name => val => upd(name, val))(
            attrs.$attr[name].replace(/^(bngAttr|bng\-attr)\./, "")
          ));
        }
      }
    }
  }
})


.service("svcLazyImg", function () {
  const timings = {
    // (ms) fade-in; set to 0 to disable
    transition: 200,
    // how many images to load simultaneously in a single tick (for delay)
    // it is recommended to set it for a number of maximum items per line
    batch: 6,
    // (ms) max delay between images in queue; set to 0 to disable
    delay: 50,
    // when delay is dynamic:
    //   images will show up faster when there's a lot in queue
    //   when queue >= delay, delay gets disabled automatically
    dynamicDelay: true,
  };
  const imgs = {}, queue = [];
  let observer, count = 0, running = false;
  // run queue
  function run() {
    if (load()) {
      // will not evaluate if there's no delay
      setTimeout(run, timings._delay);
      return;
    }
    running = false;
    if (Object.keys(imgs).length === 0) {
      observer.disconnect();
      observer = null;
    }
  }
  // load image and decide to go next
  function load() {
    let id, i = 0;
    while (id = queue.shift()) {
      if (!imgs.hasOwnProperty(id))
        continue;
      const img = imgs[id];
      img.elm.src = img.src;
      if (img.fade)
        img.elm.style.opacity = 1;
      delete imgs[id];
      i++;
      if (
        timings.delay > 0 // do all if there's no delay
        && i === timings.batch
      )
        break;
    }
    return queue.length > 0;
  }
  function intersecting(entries) {
    for (let entry of entries) {
      if (entry.intersectionRatio > 0) {
        const id = entry.target.__BNG_LAZY;
        if (id && imgs.hasOwnProperty(id))
          queue.push(id);
        observer.unobserve(entry.target);
        delete entry.target.__BNG_LAZY;
      }
    }
    // console.log(`svcLazyImg: Queued: ${queue.length} images`);
    timings._delay = timings.delay === 0 ? 0 :
      timings.delay - (timings.dynamicDelay ? Math.min(timings.delay, queue.length) : 0);
    if (!running) {
      running = true;
      run();
    }
  }
  return {
    register(elm, src, fade=false) {
      if (!elm || !src) {
        console.error("svcLazyImg: Element and/or source are not specified", { element: elm, source: src });
        return null;
      }
      if (Object.keys(imgs).length === 0) {
        observer = new IntersectionObserver(intersecting, {
          rootMargin: "0px",
          threshold: 0
        });
      }
      observer.observe(elm);
      imgs[++count] = { elm, src };
      elm.__BNG_LAZY = count;
      if (fade && timings.transition > 0) {
        imgs[count].fade = true;
        elm.style.opacity = 0;
        elm.style.transition = `opacity ${timings.transition}ms`;
      }
      return count;
    },
    unregister(id) {
      if (!id || !imgs.hasOwnProperty(id))
        return;
      if (!imgs[id].seen)
        observer.unobserve(imgs[id].elm);
      delete imgs[id];
      if (Object.keys(imgs).length === 0) {
        observer.disconnect();
        observer = null;
      }
    }
  };
})
.directive("imgLazy", ["svcLazyImg", function (svcLazyImg) {
  return {
    restrict: "E",
    // transparent bng-orange ;)
    template: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="" />',
    replace: true,
    scope: {
      url: "<",
      fade: "<",
    },
    link: function (scope, element, attrs) {
      const id = svcLazyImg.register(element[0], scope.url, !!scope.fade);
      if (id)
        scope.$on("$destroy", () => svcLazyImg.unregister(id));
    }
  }
}])

.service("svcLottie", function () {
  return window.AngularLottie.service
})

.directive("lottie", ["svcLottie", function (svcLottie) {
  return {
    restrict: "E",
    template: '<div class="lottie-animation" ng-style="css"></div>',
    replace: true,
    scope: {
      // presets
      icon: "<",
      value: "<",
      // direct
      path: "<",
      loop: "<",
      autoplay: "<",
      initialSegment: "<", // [60, 120]
      startFrame: "<", // 60
      onLottieAnimCreated: "&",
    },
    link: function (scope, element, attrs) {
      let cfg;
      if (scope.icon) { // one of our internal icons
        let lottie, onChange;
        // default icon style and presets (see ui/ui-vue/src/assets/lottieIcons)
        const iconcss = window.AngularLottie.defaultIconCSS, icons = window.AngularLottie.icons;

        if (!icons[scope.icon]) throw new Error(`lottieIcon: No icon named "${scope.icon}"`);

        const icon = icons[scope.icon];
        scope.css = { ...iconcss, ...icon.style };
        cfg = {...icon.lottie}; // clone to ensure lottie won't mutate it
        cfg.element = element[0];
        cfg.onLottieAnimCreated = anim => {
          lottie = anim;
          // console.log(cfg, lottie);
          if (icon.onLoad) icon.onLoad.bind({lottie})();
          if (icon.onChange) (onChange = icon.onChange.bind({lottie}))(scope.value);
        };
        if (icon.onChange) scope.$watch("value", (val, prev) => { if (lottie) onChange(val, prev); });
      } else { // direct (normal lottie file)
        cfg = {
          element: element[0],
          path: scope.path,
          loop: scope.loop,
          autoplay: scope.autoplay,
          initialSegment: scope.initialSegment,
          startFrame: scope.startFrame,
          onLottieAnimCreated: scope.onLottieAnimCreated,
        };
      }
      const id = svcLottie.register(cfg);
      if (id) scope.$on("$destroy", () => svcLottie.unregister(id));
    }
  }
}])

.service("svcOffscreen", function () {
  let observer, count = 0;
  function intersecting(entries) {
    for (let entry of entries) {
      const cls = entry.target.__BNG_OFFSCREEN;
      if (cls) {
        // console.log(entry.intersectionRatio, entry);
        const func = entry.intersectionRatio === 0 ? "add" : "remove";
        entry.target.classList[func](cls);
      } else {
        observer.unobserve(entry.target);
        count--;
      }
    }
  }
  return {
    register(elm, cls) {
      if (!elm || !cls) {
        console.error("svcOffscreen: Element and/or class are not specified", { element: elm, class: cls });
        return null;
      }
      if (count === 0) {
        observer = new IntersectionObserver(intersecting, {
          rootMargin: "300px",
          threshold: 0
        });
      }
      count++;
      observer.observe(elm);
      elm.__BNG_OFFSCREEN = cls;
      return;
    },
    unregister(elm) {
      observer.unobserve(elm);
      if (elm.__BNG_OFFSCREEN)
        delete elm.__BNG_OFFSCREEN;
      count--;
      // if (count <= 0) { // may be unreliable with this approach on angular
      //   count = 0;
      //   observer.disconnect();
      //   observer = null;
      // }
    }
  };
})
.directive("bngOffscreenClass", ["svcOffscreen", function (svcOffscreen) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      svcOffscreen.register(element[0], attrs.bngOffscreenClass);
      scope.$on("$destroy", () => svcOffscreen.unregister(element[0]));
    }
  }
}])


.directive("input", ["Settings", function (Settings) {
  return {
    restrict: "E",
    link: (scope, elem, attrs) => bngLinkInput(scope, elem, attrs, Settings)
  };
}])
.directive("textarea", ["Settings", function (Settings) {
  return {
    restrict: "E",
    link: (scope, elem, attrs) => bngLinkInput(scope, elem, attrs, Settings)
  };
}])

;

function bngLinkInput(scope, elem, attrs, Settings) {
  if (!Settings.values.runningOnSteamDeck) // restrict this code to steamdeck only
    return;
  elem.on("focus", function () {
    const elm = elem[0];
    const tag = elm.tagName.toLowerCase();
    let type = 0; // single line
    if (tag === "input") {
      if (!["text", "number", "password", "search"].includes(elm.type.toLowerCase()))
        return;
    } else if (tag === "textarea") {
      type = 1; // multiple lines
    }
    const rect = elm.getBoundingClientRect(); // might need to dive through parents
    // console.log("TEXT FOCUS", elm, rect);
    bngApi.engineLua(`Steam.showFloatingGamepadTextInput(${type}, ${rect.left}, ${rect.top}, ${rect.width}, ${rect.height})`);
  });
}
