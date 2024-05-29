<template>
    <div id="left-tracks-section">
      <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus on Variant</button>
        <svCircos 
          :svList="svList"
          :zoomZone="selectedArea"
          :focusedVariant="focusedVariant"
          :needsFocus="needsFocus"
          :genesOfInterest="genesOfInterest"
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
    focusedVariant: Object,
    genesOfInterest: Array,
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
    height: 100%
    box-sizing: border-box
    transition: all 0.5s
    overflow: hidden
  
  #focus-chart-btn
    position: absolute
    top: 10px
    right: 40px
    padding: 5px 5px
    background-color: #C1D1EA
    color: #2A65B7
    border: 2px solid #2A65B7
    border-radius: 5px
    font-weight: bold
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
    &:hover
      cursor: pointer
      opacity: 0.7

</style>