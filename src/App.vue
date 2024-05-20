<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar 
        @updateGenesOfInterest="updateGenesOfInterest"
        @updatePhenotypesOfInterest="updatePhenotypesOfInterest"/>
      <!-- <UpperChromBar
        :svList="svList"
        :zoomZone="selectedArea"
        @area-selected="areaSelected"/> -->
    </div>

    <div id="lower-block-container">
      <div id="var-list-bar-button-container" :class="{collapsed: !variantListBarOpen}">
        <button id="var-list-bar-toggle-btn" @click="variantListBarOpen = !variantListBarOpen">
          <img v-if="variantListBarOpen" src="/arrow-expand-left.svg" alt="close">
          <img v-else src="/arrow-expand-right.svg" alt="open">
        </button>
        <VariantListBar 
        :svList="svList"
        @variant-clicked="updateFocusedVariant"/>
      </div>


      <div id="lower-sections-container">
        <LeftTracksSection 
          :svList="svList"
          :selectedArea="selectedArea"
          :focusedVariant="focusedVariant"
          :genesOfInterest="genesOfInterest"
          @circos-zoom-event="circosZoomFired"/>
        <RightSection 
          :variantOfInterest="focusedVariant"/>
      </div>
    </div>

  </div>
</template>

<script>
  import UpperChromBar from './components/UpperChromBar.vue'
  import LeftTracksSection from './components/LeftTracksSection.vue';
  import RightSection from './components/RightSection.vue';
  import VariantListBar from './components/VariantListBar.vue';
  import NavBar from './components/NavBar.vue';
  import Sv from './models/Sv.js'

  export default {
    name: 'app',
    components: {
      UpperChromBar,
      LeftTracksSection,
      RightSection,
      VariantListBar,
      NavBar
    },
    data() {
      return {
        svList: [],
        focusedVariant: null,
        selectedArea: null,
        variantListBarOpen: true,
        genesOfInterest: [],
        phenotypesOfInterest: [],
      }
    },
    mounted() {
      fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-01_svafotate_output.filteredaf.vcf.gz')
        .then(response => response.json())
        .then(data => {
          this.svList = data.map(item => new Sv(item))
        });
    },
    methods: {
      updateFocusedVariant(variant, flag) {
        if (this.focusedVariant === variant) {
          this.focusedVariant = null
        } else if (this.focusedVariant !== variant && flag == 'hide') {
          //dont change focused variant
        } else {
          this.focusedVariant = variant
        }
      },
      areaSelected(selectedArea) {
        this.selectedArea = selectedArea
      },
      circosZoomFired(zoomZone) {
        this.selectedArea = zoomZone
      }, 
      updateGenesOfInterest(newGOI) {
        this.genesOfInterest = newGOI;
      },
      updatePhenotypesOfInterest(newPOI) {
        this.phenotypesOfInterest = newPOI;        
      }
    },
  }

</script>

<style lang="sass">
  #logo-div 
    position: absolute
    right: 5px
    top: 0px
  
  #main-container 
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 100vh
    width: 100%
  
  #lower-block-container 
    display: flex
    flex-direction: row
    flex-grow: 1
    justify-content: center
    width: 100%
    overflow: hidden

  #upper-bar-container
    display: flex
    flex-direction: column
    height: fit-content
    width: 100%
  
  #lower-sections-container
    display: flex
    flex-direction: row
    height: 100%
    justify-content: center
    flex-grow: 1
    overflow: hidden

  img 
    height: 30px
    margin-right: 0px
    padding-right: 0px
    transform: translate(3px, 5px)
    width: 30px

  #var-list-bar-button-container
    position: relative
    height: 100%
    padding: 0px
    margin: 0px
    width: 250px
    transition: width 0.5s
    &.collapsed
      width: 0px
  #var-list-bar-toggle-btn
    position: absolute
    top: 5px
    right: -35px
    z-index: 2
    padding: 3px
    margin: 0px
    border-radius: 50%
    display: flex
    justify-content: center
    align-items: center
    border: 2px solid #2A65B7
    background-color: #C1D1EA
    &:hover
      cursor: pointer
      opacity: 0.8
    img
      height: 23px
      width: 23px
      display: flex 
      justify-content: center
      align-items: center
      transform: translate(0px, 0px)
</style>