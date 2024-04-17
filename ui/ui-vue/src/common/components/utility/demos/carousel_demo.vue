<template>
  <div class="demo-carousel-wrapper">
    <div>
      <h3>Carousel Default</h3>
    </div>
    <Carousel style="height: 100px" class="carousel-demo">
      <CarouselItem :style="{ background: 'blue' }" :value="1">
        <div class="slide">Slide 1</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'red' }" :value="2">
        <div class="slide">Slide 2</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'green' }" :value="3">
        <div class="slide">Slide 3</div>
      </CarouselItem>
    </Carousel>
  </div>
  <div class="demo-carousel-wrapper">
    <div>
      <h3>Carousel Horizontal</h3>
    </div>
    <Carousel horizontal style="height: 100px" class="carousel-demo">
      <CarouselItem :style="{ background: 'blue' }" :value="1">
        <div class="slide">Slide 1</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'red' }" :value="2">
        <div class="slide">Slide 2</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'green' }" :value="3">
        <div class="slide">Slide 3</div>
      </CarouselItem>
    </Carousel>
  </div>
  <div class="demo-carousel-wrapper">
    <div>
      <h3>Carousel Initial Slide</h3>
    </div>
    <Carousel :current="2" style="height: 100px" class="carousel-demo">
      <CarouselItem :style="{ background: 'blue' }" :value="1">
        <div class="slide">Slide 1</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'red' }" :value="2">
        <div class="slide">Slide 2</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'green' }" :value="3">
        <div class="slide">Slide 3</div>
      </CarouselItem>
    </Carousel>
  </div>
  <div class="demo-carousel-wrapper">
    <div>
      <h3>Carousel with transition</h3>
      <code>&lt;carousel transition :transitionTime="1500"&gt;&lt;carousel&gt; </code>
    </div>
    <Carousel style="height: 100px" class="carousel-demo" transition :transitionTime="1500">
      <CarouselItem :style="{ background: 'blue' }" :value="1">
        <div class="slide">Slide 1</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'red' }" :value="2">
        <div class="slide">Slide 2</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'green' }" :value="3">
        <div class="slide">Slide 3</div>
      </CarouselItem>
    </Carousel>
  </div>
  <div class="demo-carousel-wrapper">
    <h3>Programmatically Navigate</h3>
    <Carousel ref="carouselRef" loop style="height: 100px" class="carousel-demo">
      <CarouselItem :style="{ background: 'blue' }" :value="1">
        <div class="slide">Slide 1</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'red' }" :value="2">
        <div class="slide">Slide 2</div>
      </CarouselItem>
      <CarouselItem :style="{ background: 'green' }" :value="3">
        <div class="slide">Slide 3</div>
      </CarouselItem>
      <template #navigation> </template>
    </Carousel>
    <div>
      <button @click="goPrevious">Prev</button>
      <button @click="goNext">Next</button>
    </div>
    <div>
      <input v-model="slideValue" placeholder="Carousel item value" />
      <button @click="goToSlide">Go to slide</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { Carousel, CarouselItem } from "@/common/components/utility"

const carouselRef = ref(null)
const slideValue = ref(null)
const goNext = () => carouselRef.value.showNext()
const goPrevious = () => carouselRef.value.showPrevious()
const goToSlide = () => carouselRef.value.showSlide(slideValue.value)
</script>

<style lang="scss" scoped>
.demo-carousel-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem;
}
.slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>
