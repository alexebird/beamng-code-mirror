// Lottie service - manages loading of Lottie resources only when they're on-screen
import Lottie from 'lottie-web'
import { getAssetURL } from "@/utils"

const
  BNG_LOTTIE_ID = Symbol('BNG Lottie Instance ID'),
  RENDERER_OPTIONS = {
    renderer: 'svg',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  }

const instances = {}
let onScreenObserver, count = 0

const
  processOnScreenItems = items => {
    items.filter(i => i.intersectionRatio > 0).forEach(item => {
      const id = item.target[BNG_LOTTIE_ID]
      if (id && instances[id]) {
        const instance = instances[id], anim = makeLottieAnimation(instance)
        instance.lottieAnim = anim
        instance.loaded = true
        if (instance.startFrame) anim[instance.autoplay ? 'goToAndPlay' : 'goToAndStop'](instance.startFrame, true)

        // events: https://github.com/airbnb/lottie-web/wiki/Usage#events
        // opts.lottie.addEventListener("DOMLoaded", () => {
        //   $timeout(() => {
        //     opts.onLottieAnimCreated({ lottie: opts.lottie });
        //   });
        // });

        if (typeof instance.onLottieAnimCreated === 'function') instance.onLottieAnimCreated(anim)

        anim.addEventListener('data_failed', () => console.error(`Cannot load lottie file "${instance.path}"`))
        // const events = ["data_ready", "DOMLoaded", "config_ready", "loaded_images", "segmentStart", "enterFrame", "drawnFrame", "complete"];
        // events.forEach(evt => anim.addEventListener(evt, () => console.log(evt)))
        // anim.addEventListener("config_ready", () => console.log(`total segment frames: ${opts.lottie.totalFrames}`, opts))
      }
      onScreenObserver.unobserve(item.target)
      delete item.target[BNG_LOTTIE_ID]
    })
  },
  processPath = path => path.startsWith('@/') ? getAssetURL(path.slice(2)) : path,
  makeLottieAnimation = opts => Lottie.loadAnimation({
    container: opts.element,
    path: processPath(opts.path),
    autoplay: !!opts.autoplay,
    loop: typeof opts.loop !== 'undefined'? opts.loop : false,
    initialSegment: opts.initialSegment,
    ...RENDERER_OPTIONS
  })


export default {

  register(instance) {
    if (!Object.keys(instances).length) {
      onScreenObserver = new IntersectionObserver(processOnScreenItems, {
        rootMargin: "0px",
        threshold: 0
      })
    }
    onScreenObserver.observe(instance.element)
    instances[++count] = instance
    return instance.element[BNG_LOTTIE_ID] = count 
  },

  unregister(id) {
    let i
    if (!id || !(i=instances[id])) return
    if (i.loaded) {
      i.lottieAnim.destroy()
    } else {
      onScreenObserver.unobserve(i.element)
    }
    delete instances[id]
    if (!Object.keys(instances).length) {
      onScreenObserver.disconnect()
      onScreenObserver = null
    }
  }

}
