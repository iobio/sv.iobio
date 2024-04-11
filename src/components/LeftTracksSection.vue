<template>
    <div id="left-tracks-section">
      <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Jump To Variant</button>
        <svCircos 
          :svList="svList"
          :zoomZone="selectedArea"
          :focusedVariant="focusedVariant"
          :needsFocus="needsFocus"
          @circos-zoom-event="circosZoomFired"/>
    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos
  },
  props: {
    svList: Array,
    selectedArea: Object,
    focusedVariant: Object
  },
  data () {
    return {
      needsFocus: false,
      showButton: false
    }
  },
  mounted () {
  },
  methods: {
    circosZoomFired(zoomZone) {
      if (this.needsFocus) {
        this.needsFocus = false
      } else {
        this.showButton = true
      }
      
      this.$emit('circos-zoom-event', zoomZone)
    },
    focusOnVariant() {
      this.needsFocus = true
      this.showButton = false
    }
  },
  computed: {
  },
  watch: {
    focusedVariant() {
      if (this.focusedVariant) {
        this.showButton = true
      } else {
        this.showButton = false
      }
    },
  },
  }
</script>

<style lang="sass">
  #left-tracks-section
    position: relative
    padding-top: 10px
    padding-bottom: 10px
    flex-grow: 1
    flex-basis: 0
    height: 100%
    box-sizing: border-box
    // border: 1px solid #F5F5F5
    // border-radius: 5px
    transition: all 0.5s
  
  #focus-chart-btn
    position: absolute
    top: 10px
    right: 10px
    &:hover
      cursor: pointer
      opacity: 0.7

</style>