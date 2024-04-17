<template>
  <AspectRatio v-bng-sound-class="'bng_click_generic'" :image="'/levels/west_coast_usa/spawns_quarry.jpg'" :ratio="'4:3'" @click="goToBigMap()">
    <div style="position:absolute; left:0; right:0; top:0; bottom:0; background:rgba(0,0,0,0.5)">
      <BngCardHeading style="color:white;" type="ribbon">{{levelTitle}}</BngCardHeading>
      <BngButton style="position:absolute; bottom:1em; right:1em;" tabindex="1" accent="text" @click="goToBigMap()">Open Map</BngButton>
    </div>
  </AspectRatio>
</template>

<script>
import { icons as iconTypes } from "@/assets/icons"
</script>

<script setup>
import { lua } from "@/bridge"
import { BngCard, BngCardHeading, BngButton} from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { $content, $translate } from "@/services"
import { onMounted, onUnmounted } from "vue"
import { ref, computed } from "vue"

const levelTitle = ref("")
const levelImage = ref("")

//const emit = defineEmits(["goToBigMap"])
//const goToBigMap = mission => emit("goToBigMap", mission)

function setup(data) {
  levelTitle.value = $translate.contextTranslate(data.title, true)
  levelImage.value = data.previews[0]
}

const start = () => {
  lua.career_modules_uiUtils.getCareerCurrentLevelName().then(setup)
}

function goToBigMap(){
   lua.freeroam_bigMapMode.enterBigMap()
}

onMounted(start)
</script>

<style scoped lang="scss">

.flex-row {
  display: flex;
  flex-flow: row wrap;
}

.card {
  width:100%;
  height:100%;
  overflow:hidden;

  //font-size: 0.875em;



}
.overlay {
  position: relative;
  z-index: 1;
  margin: auto;
  width: 50%;
}
.icon{
  font-size: 8rem;
  position: absolute;
}

.mission-label{
    margin: 0.15em 0 1rem;
    font-family: "Overpass", var(--fnt-defs);
    font-size: 1rem;
    font-weight: 700;
}

.preview {
  min-width: 8em;
  min-height: 5rem;
  border-radius: var(--bng-corners-2);
}
.mission-details{
  display: flex;
  flex-wrap: nowrap;
}

.mission-stars {
  padding: 2rem 0.5rem ;
> .main-stars {
    --star-color: var(--bng-ter-yellow-50);
    padding: 0.25rem 0.25rem;
  }
}


</style>
