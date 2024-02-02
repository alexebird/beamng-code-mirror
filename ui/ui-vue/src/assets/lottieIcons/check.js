// Animated Checkmark
export default {

  lottie: {
    path: "@/lottie-animations/mission-checkbox.json", // @ refers to ui-vue/src/assets
    autoplay: false,
    loop: false,
    // initialSegment: [60, 61],
    startFrame: 60,
  },
  // additional styles can be added here
  //style: { width: "3em", height: "3em" },
  onLoad() {
    // console.log("loaded");
    window.test = this.lottie;
  },
  onChange(value, prevValue) {
    // console.log(`changed from "${prevValue}" (${typeof prevValue}) to "${value}" (${typeof value})`);
    // if (prevValue)
    //   element[0].classList.remove("check-" + prevValue);
    // if (["v", "x"].includes(value))
    //   element[0].classList.add("check-" + value);
    switch (value) {
      case "v":
        // this.lottie.playSegments([60, 120], true);
        this.lottie.setDirection(1);
        this.lottie.goToAndPlay(60, true);
        break;
      case "x":
        // this.lottie.playSegments([60, 0], true);
        this.lottie.setDirection(-1);
        this.lottie.goToAndPlay(60, true);
        break;
      default:
        this.lottie.goToAndStop(60, true);
        // setTimeout(() => { this.lottie.playSegments([60, 0], true); }, 5000);
        break;
    }
  }

}
