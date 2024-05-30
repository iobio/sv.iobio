<template>
    <div id="left-tracks-section">
      <div id="chrom-select-bar-div">
        <ChromSelectBarViz
        :svList="svList"
        :selectedArea="selectedArea"
        @area-selected="circosZoomFired"/>
      </div>
      <!-- if is global view is true then we put a radio for circos/linear -->
      <div id="global-view-select-radios" v-if="isGlobalView">
        <input type="radio" id="circos-view" name="view" value="circos" v-model="globalView">
        <label for="circos-view">Circos</label>
        <input type="radio" id="linear-view" name="view" value="linear" v-model="globalView">
        <label for="linear-view">Linear</label>
      </div>
      <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus on Variant</button>
        <svCircos 
          :svList="svList"
          :zoomZone="selectedArea"
          :focusedVariant="focusedVariant"
          :needsFocus="needsFocus"
          :genesOfInterest="genesOfInterest"
          :phenRelatedGenes="phenRelatedGenes"
          :batchNum="batchNum"
          @circos-zoom-event="circosZoomFired"/>
    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';
  import ChromSelectBarViz from './viz/chromSelectBar.viz.vue';

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos,
    ChromSelectBarViz
  },
  props: {
    svList: Array,
    selectedArea: Object,
    focusedVariant: Object,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    batchNum: Number,
  },
  data () {
    return {
      needsFocus: false,
      showButton: false,
      globalView: 'circos'
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
    isGlobalView() {
      if (this.selectedArea) {
        return this.selectedArea.start === 0 && this.selectedArea.end > 3000000000
      } else {
        return true
      }
    }
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
    display: flex
    flex-direction: column
    padding-top: 10px
    padding-bottom: 10px
    flex-grow: 1
    height: 100%
    box-sizing: border-box
    transition: all 0.5s
    overflow: hidden
  
  #focus-chart-btn
    position: absolute
    top: 40px
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
  #chrom-select-bar-div
    height: 27px
  #global-view-select-radios
    position: absolute
    width: fit-content
    top: 40px
    left: 10px
    padding: 5px 5px
    border: 2px solid #2A65B7
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
    border-radius: 5px
    input[type="radio"]
      cursor: pointer
</style>