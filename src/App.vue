<template>
  <div id="app">
    <Turntable :images="getComponentData()" :width="getWidth()" :height="getHeight()"
               :quality="getQuality()"
               :antialiasing="getAntialiasing()"
               :frame-animation-delay-ms="frameAnimationDelayMs"/>
  </div>
</template>

<script>
import Turntable from './components/Turntable.vue'

export default {
  name: 'App',
  props: [
    'images',
    'width',
    'height',
    'quality',
    'antialiasing',
    'frameAnimationDelayMs'],
  components: {
    Turntable,
  },
  methods: {
    getComponentData: function() {return JSON.parse(this.images)},
    getWidth: function() {return this.width ?? 800},
    getHeight: function() {return this.height ?? 600},
    getQuality: function() {return this.quality ?? 1},
    getAntialiasing: function() {return this.antialiasing ?? true},
  },
}
</script>

<style>
#app {
  max-width: 100vw;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
