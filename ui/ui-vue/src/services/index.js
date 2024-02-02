export { $translate } from "./translation.js"
export { useLibStore } from "./libStore.js"
export { useGameContextStore } from "./gameContextStore.js"
export * as $content from "./content/index.js"

import './navigator.js' // import just for side effects right now (ensure window.bngNavigator is available) - TODO - can remove when we stop using it inside Angular


// ** TODO ** remove this when we finally stop using Angular
import LottieService from './lottie.js'
import LottieIcons, { defaultCSS } from '@/assets/lottieIcons'
window.AngularLottie = {
  service: LottieService,
  defaultIconCSS: defaultCSS,
  icons: LottieIcons
}


// ** TODO ** remove this when no more references to global crossfire functions
import * as crossfire from './crossfire.js'
Object.assign(window, crossfire) 
