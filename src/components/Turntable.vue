<template>
  <div :ref="'turntable'" class="turntable"
       :style="{'background': '#000000', 'width': width + 'px', 'height': height + 'px'}">
    <p v-if="loading" class="loading">◌</p>
    <div v-else>
      <canvas :class="{'no-antialiasing': !antialiasing}" :ref="'canvas'"
              :width="getCanvasWidth()" :height="getCanvasHeight()"
              :style="{'width': width + 'px', 'height': height + 'px'}"/>
      <div class="draggable"
           :class="{'enabled': !animating}"
           :ref="'draggable'"
           :style="{'width': width + 'px', 'height': height + 'px'}"></div>
      <div class="controls">
        <div :ref="'play'" v-if="!animating" v-on:click="startAnimation()">
          ▶
        </div>
        <div :ref="'play'" v-if="animating" v-on:click="stopAnimation()">
          ▐ ▌
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import prefetchImages from 'prefetch-image'
import ZingTouch from 'zingtouch'

export default {
  name: 'Turntable',
  props: {
    images: Array,
    width: Number,
    height: Number,
    quality: Number,
    background: String,
    frameAnimationDelayMs: Number,
    antialiasing: Boolean,
  },
  data: function() {
    return {
      loading: true,
      animating: false,
      fetchedImages: [],
      currentImageIndex: 0,
      currentImageSrc: null,
      canvasImage: new Image(),
    }
  },
  methods: {
    getCanvasWidth: function() {
      return this.width * this.quality
    },
    getCanvasHeight: function() {
      return this.height * this.quality
    },
    drawImage: function(index) {
      this.drawScaledImage(this.fetchedImages[index])
    },
    drawScaledImage: function(source) {
      let canvas = this.$refs.canvas
      let hRatio = this.getCanvasWidth() / source.width
      let vRatio = this.getCanvasHeight() / source.height
      let ratio = Math.min(hRatio, vRatio)
      let centerShift_x = (this.getCanvasWidth() - source.width * ratio) / 2
      let centerShift_y = (this.getCanvasHeight() - source.height * ratio) / 2
      let ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())
      this.canvasImage.src = source.src
      ctx.drawImage(this.canvasImage, 0, 0, source.width, source.height,
          centerShift_x, centerShift_y, source.width * ratio, source.height * ratio)
    },
    startAnimation: function() {
      this.animating = true
      this.animation = setInterval(function() {
        if (this.currentImageIndex < this.fetchedImages.length)
          this.currentImageIndex++
        else
          this.currentImageIndex = 0
        this.drawImage(this.currentImageIndex)
      }.bind(this), Math.min(this.frameAnimationDelayMs | 32))
    },
    stopAnimation: function() {
      this.animating = false
      clearInterval(this.animation)
    },
    setupDragging: function() {
      this.zt = new ZingTouch.Region(document.body)
      this.zt.bind(this.$refs.draggable, 'pan', (e) => {
        if (this.animating) return
        let direction = e.detail.data[0].currentDirection
        if (direction === 180) { //dragging right
          if (this.currentImageIndex === 0) {
            this.currentImageIndex = this.fetchedImages.length - 1
          } else {
            this.currentImageIndex--
          }
        } else if (direction === 360) { //dragging left
          if (this.currentImageIndex === this.fetchedImages.length) {
            this.currentImageIndex = 0
          } else {
            this.currentImageIndex++
          }
        }
        this.drawImage(this.currentImageIndex)
      })
    },
  },
  mounted: function() {
    prefetchImages(this.images)
        .then((results) => {
          this.fetchedImages = results
          setTimeout(() => {
            this.loading = false
            this.$nextTick(() => {
              this.drawScaledImage(this.fetchedImages[0])
              this.setupDragging()
            })
          }, 500)
        })
  },
}
</script>

<style scoped>
.turntable {
  display: block;
  position: relative;
  user-select: none;
  max-width: 100vw;
  border-radius: 8px;
  border: 1px solid rgb(150, 150, 150);
  overflow: hidden;
}

canvas {
  max-width: 100vw;
}

canvas.no-antialiasing {
  image-rendering: optimizeSpeed; /* STOP SMOOTHING, GIVE ME SPEED  */
  image-rendering: -moz-crisp-edges; /* Firefox                        */
  image-rendering: -o-crisp-edges; /* Opera                          */
  image-rendering: -webkit-optimize-contrast; /* Chrome (and eventually Safari) */
  image-rendering: pixelated; /* Chrome */
  image-rendering: optimize-contrast; /* CSS3 Proposed                  */
  -ms-interpolation-mode: nearest-neighbor; /* IE8+                           */
}

.controls {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  pointer-events: none;
}

.controls div {
  pointer-events: all;
  display: inline-block;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: white;
  width: 64px;
  border: 1px solid rgba(150, 150, 150, 0.4);
  font-size: 24px;
  backdrop-filter: blur(10px);
}

.controls div:hover {
  background: white;
  color: black;
  cursor: pointer;
}

.controls div:active {
  box-shadow: inset 0 5px 4px rgba(0, 0, 0, 0.4);
  color: black;
  background: white;
}

.loading {
  display: block;
  animation: spin 4s linear infinite;
  font-size: 120px;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
  margin-left: -60px;
  margin-top: -60px;
}

.draggable {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.draggable.enabled {
  cursor: ew-resize;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
