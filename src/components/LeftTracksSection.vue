<template>
    <div id="left-tracks-section">
      <div id="chrom-select-bar-div">
        <ChromSelectBarViz v-if="chromSelectBarDataReady"
        :selectedArea="selectedArea"
        :centromeres="centromeres"
        :bands="bands"
        :chromosomes="chromosomes"
        @area-selected="circosZoomFired"/>
      </div>
      <!-- if is global view is true then we put a radio for circos/linear -->
      <div id="global-view-select-radios">
        <input type="radio" id="circos-view" name="view" value="circos" v-model="globalView">
        <label for="circos-view">Circos</label>
        <input type="radio" id="linear-view" name="view" value="linear" v-model="globalView">
        <label for="linear-view">Linear</label>
      </div>
      <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus on Variant</button>
        <svCircos 
          v-show="globalView === 'circos' && circosDataReady"
          :svList="svList"
          :zoomZone="selectedArea"
          :focusedVariant="focusedVariant"
          :needsFocus="needsFocus"
          :genesOfInterest="genesOfInterest"
          :phenRelatedGenes="phenRelatedGenes"
          :batchNum="batchNum"
          :vcfDataPro="vcfDataPro"
          :vcfDataPar1="vcfDataPar1"
          :vcfDataPar2="vcfDataPar2"
          :centromeres="centromeres"
          :bands="bands"
          :chromosomes="chromosomes"
          :genes="genes"
          @circos-zoom-event="circosZoomFired"/>

        <LinearSvChartViz
          v-show="globalView === 'linear'"
          :svList="svList"
          :title="'Proband'"
          :selectedArea="selectedArea"
          :chromosomes="chromosomes"/>

        <LinearSvChartViz
          v-show="globalView === 'linear' && vcfDataPar1"
          :svList="vcfDataPar1"
          :title="'Parent 1'"
          :selectedArea="selectedArea"
          :chromosomes="chromosomes"/>

        <LinearSvChartViz
          v-show="globalView === 'linear' && vcfDataPar2"
          :svList="vcfDataPar2"
          :title="'Parent 2'"
          :selectedArea="selectedArea"
          :chromosomes="chromosomes"/>
    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';
  import Sv from '../models/Sv.js';
  import ChromSelectBarViz from './viz/chromSelectBar.viz.vue';
  import LinearSvChartViz from './viz/linearSvChart.viz.vue';

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos,
    ChromSelectBarViz,
    LinearSvChartViz
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
      globalView: 'circos',
      vcfDataPro: null,
      vcfDataPar1: null,
      vcfDataPar2: null,
      centromeres: null,
      bands: null,
      chromosomes: null,
      genes: null,
    }
  },
  mounted () {
    fetch('http://localhost:3000/chromosomes?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.chromosomes = data;
    });

    fetch('http://localhost:3000/centromeres?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.centromeres = data;
      });

    fetch('http://localhost:3000/bands?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.bands = data;
      });
    
    //fetch all the genes for the circos chart
    fetch('http://localhost:3000/genes?build=hg38&source=refseq')
      .then(response => response.json())
      .then(data => {
        this.genes = data;
      });

    //fetch the vcf data
    fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-02_svafotate_output.filteredaf.vcf.gz')
      .then(response => response.json())
      .then(data => {
        this.vcfDataPar1 = data.map(item => new Sv(item)); 
      });  

    //fetch the vcf data
    fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-03_svafotate_output.filteredaf.vcf.gz')
      .then(response => response.json())
      .then(data => {
        this.vcfDataPar2 = data.map(item => new Sv(item)); 
      });
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
    },
    circosDataReady() {
      let ready = this.chromosomes && 
      this.centromeres && 
      this.bands && 
      this.genes && 
      this.vcfDataPar1 && 
      this.vcfDataPar2;

      return ready
    },
    chromSelectBarDataReady() {
      return this.chromosomes && this.centromeres && this.bands
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
    padding: 10px
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
    color: #2A65B7
    border: 1px solid #2A65B7
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
    border-radius: 5px
    input, label
      cursor: pointer
</style>