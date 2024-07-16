<template>
    <div id="left-tracks-section">
      <div class="upper-track-selectors-bar">
        <div id="global-view-select-radios">
          <input type="radio" id="circos-view" name="view" value="circos" v-model="globalView">
          <label for="circos-view">Circos</label>
          <input type="radio" id="linear-view" name="view" value="linear" v-model="globalView">
          <label for="linear-view">Linear</label>
        </div>

        <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus on Variant</button>
        <button v-if="zoomHistory.length > 1" @click="focusOnPrevious">Prev. Zoom</button>
      </div>
      <div class="wrapper-95">
        <div id="chrom-select-bar-div">
          <ChromSelectBarViz v-if="chromSelectBarDataReady"
          :selectedArea="selectedArea"
          :centromeres="centromeres"
          :bands="bands"
          :chromosomes="chromosomes"
          @selectAreaEvent="selectAreaEventFired"/>
        </div>

        <svCircos 
          v-if="globalView === 'circos' && circosDataReady"
          :svList="svList"
          :probandName="samples.proband.name"
          :zoomZone="selectedArea"
          :genesOfInterest="genesOfInterest"
          :phenRelatedGenes="phenRelatedGenes"
          :batchNum="batchNum"
          :samples="samplesLists"
          :samplesTitles="samplesTitles"
          :centromeres="centromeres"
          :bands="bands"
          :chromosomes="chromosomes"
          :genes="genes"
          @selectAreaEvent="selectAreaEventFired"/>

        <div id="linear-section-container" v-if="globalView === 'linear'" @dragover.prevent="handleDragOver" @drop="handleDrop">
          <LinearSvChartViz
            v-if="samples.proband.svList && samples.proband.svList.length > 0" 
            class="proband-chart"
            :svList="samples.proband.svList"
            :title="samples.proband.name"
            :chromosomes="this.chromosomes"
            :centromeres="this.centromeres"
            :bands="this.bands"
            :selectedArea="this.selectedArea"
            :isProband="true"
            @selectAreaEvent="selectAreaEventFired"/>

          <component
            v-for="(chartData, index) in chartsData"
            :key="index"
            :is="chartData.component"
            v-bind="chartData.props"
            @dragstart="handleDragStart(index, $event)"
            @selectAreaEvent="selectAreaEventFired"
            class="draggable-chart"
          />
        </div>
       
      </div>

    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';
  import Sv from '../models/Sv.js';
  import ChromSelectBarViz from './viz/chromSelectBar.viz.vue';
  import LinearSvChartViz from './viz/linearSvChart.viz.vue';
  import LinearGeneChartViz from './viz/linearGeneChart.viz.vue'

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos,
    ChromSelectBarViz,
    LinearSvChartViz,
    LinearGeneChartViz
  },
  props: {
    svList: Array,
    selectedArea: Object,
    focusedVariant: Object,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    batchNum: Number,
    samples: Object
  },
  data () {
    return {
      showButton: false,
      globalView: 'circos',
      centromeres: null,
      bands: null,
      chromosomes: null,
      chromosomeAccumulatedMap: null,
      genes: null,
      zoomHistory: [],
      chartsData: [],
      samplesTitles: [],
      samplesLists: [],
    }
  },
  mounted () {
    fetch('http://localhost:3000/chromosomes?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.chromosomes = data;
      })
      .then(() => {
        //create a map of the chromosomes to accumulate the length of each chromosome
        this.chromosomeAccumulatedMap = this.createCromosomeAccumulatedMap(this.chromosomes);
      })

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
    
    //fetch all the genes
    fetch('http://localhost:3000/genes?build=hg38&source=refseq')
      .then(response => response.json())
      .then(data => {
        this.genes = data;
        this.chartsData.push({
          component: 'LinearGeneChartViz',
          props: {
            genesList: this.genes,
            title: 'Genes',
            selectedArea: this.selectedArea,
            chromosomes: this.chromosomes,
            centromeres: this.centromeres,
            bands: this.bands,
            phenRelatedGenes: this.phenRelatedGenes,
            genesOfInterest: this.genesOfInterest,
            batchNum: this.batchNum
          }
        })
      });

    this.fetchSamples();
  },
  methods: {
    async fetchSamples() {
      this.chartsData = this.chartsData.filter(chart => chart.props.title === 'Genes');
      let index = 1;
      this.samplesLists = [];
      this.samplesTitles = [];
      for (let sample of this.samples.comparrisons) {
        let newSample = {
          component: 'LinearSvChartViz',
          props: {
            svList: [],
            title: sample.name,
            selectedArea: this.selectedArea,
            chromosomes: this.chromosomes,
            centromeres: this.centromeres,
            bands: this.bands,
            isProband: false
          }
        }
        this.chartsData.push(newSample);
        
        let res = await fetch(`http://localhost:3000/dataFromVcf?vcfPath=${sample.vcf}`)
        let data = await res.json();
        let svData = data.map(item => new Sv(item));
        this.chartsData[index].props.svList = svData;

        this.samplesLists.push(svData);
        this.samplesTitles.push(sample.name);
        
        index++;
      }
    },
    createCromosomeAccumulatedMap(chromosomeList) {
        //iterate over the chromosomes and create the arcs
        let accumulatedBP = 0;
        let chromosomeAccumulatedMap = new Map();

        for (let chromosome of chromosomeList) {
            let chromStart = accumulatedBP;

            accumulatedBP += chromosome.length;

            let chromEnd = accumulatedBP;
            chromosomeAccumulatedMap.set(chromosome.chr, {start: chromStart, end: chromEnd});
        }

        return chromosomeAccumulatedMap;
    },
    findZoomFromFocus() {
      let focusedVariant = this.focusedVariant;

      let chrom = focusedVariant.chromosome;
      let chromStart = this.chromosomeAccumulatedMap.get(chrom).start;
      let varStartAbs = parseInt(focusedVariant.start) + chromStart;
      let varEndAbs = parseInt(focusedVariant.end) + chromStart;
      let varSize = varEndAbs - varStartAbs;

      if (varSize < 50) {
          varSize = 50
      }

      let halfSize = varSize / 2;

      let focusedStart = varStartAbs - halfSize;
      let focusedEnd = varEndAbs + halfSize;
      let focusedSize = focusedEnd - focusedStart;

      let zoomedSection = {
          start: focusedStart,
          end: focusedEnd,
          size: focusedSize
      };
      return zoomedSection;
    },
    selectAreaEventFired(zoomZone) {
      //if the zoomZone is not the whole genome we push it to the zoomHistory
      if (zoomZone.start !== 0 && !(zoomZone.end > 3000000000)) {
        this.zoomHistory.push(zoomZone);
      } else {
        this.zoomHistory = [];
      }
      this.$emit('zoomEvent', zoomZone)
    },
    focusOnVariant() {
      this.showButton = false
      //We can get the focusedVariant and calculate the appropriate selectedArea for it
      let zoomZone = this.findZoomFromFocus();
      //Then we just emit that and trickle down the selectedArea to the other components
      this.$emit('zoomEvent', zoomZone)
    },
    focusOnPrevious() {
      //We want to go to the -2 but only pop the last element
      this.zoomHistory.pop();
      let zoomZone = this.zoomHistory.slice(-1)[0];
      this.$emit('zoomEvent', zoomZone)
    },
    handleDragStart(index, event) {
      this.draggedIndex = index;
      event.dataTransfer.setData('text', index);
    },
    handleDragOver(event) {
      event.preventDefault();
    },
    handleDrop(event) {
      event.preventDefault();
      //Subtract one because the first element is the proband chart in this case
      const targetIndex = Array.from(event.currentTarget.children).indexOf(event.target.closest('.draggable-chart')) - 1;
      if (targetIndex !== -1 && targetIndex !== this.draggedIndex) {
        this.reorderCharts(this.draggedIndex, targetIndex);
        this.draggedIndex = null;
      }
      //When dragged and dropped get all the .draggable-chart elements and set them not draggable again
      const draggableCharts = document.querySelectorAll('.draggable-chart');
      draggableCharts.forEach(chart => {
        chart.setAttribute('draggable', false);
      });
    },
    reorderCharts(fromIndex, toIndex) {
      const chartToMove = this.chartsData.splice(fromIndex, 1)[0];
      this.chartsData.splice(toIndex, 0, chartToMove);
    },
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
      this.svList

      return ready
    },
    chromSelectBarDataReady() {
      return this.chromosomes && this.centromeres && this.bands
    }
  },
  watch: {
    batchNum() {
      const genesChart = this.chartsData.find(chart => chart.props.title === 'Genes');
      if (genesChart) {
        genesChart.props.batchNum = this.batchNum;
      }
    },
    focusedVariant() {
      if (this.focusedVariant) {
        this.showButton = true
      } else {
        this.showButton = false
      }
    },
    svList: {
      handler() {
        //We are watching this because the svList used for the proband is sometimes updated and asynchonous
        const probandChart = this.chartsData.find(chart => chart.props.title === 'PBSV (Hifi Long Reads Revio)');
        if (probandChart) {
          probandChart.props.svList = this.svList;
          probandChart.props.selectedArea = this.selectedArea;
          probandChart.props.chromosomes = this.chromosomes;
          probandChart.props.title = 'PBSV (Hifi Long Reads Revio)';
        }
      },
      deep: true
    },
    selectedArea: {
      handler() {
        this.chartsData.forEach(chart => {
          chart.props.selectedArea = this.selectedArea;
        });
      },
      deep: true
    },
    genesOfInterest: {
      handler() {
        const genesChart = this.chartsData.find(chart => chart.props.title === 'Genes');
        if (genesChart) {
          genesChart.props.genesOfInterest = this.genesOfInterest;
        }
      },
      deep: true
    },
    phenRelatedGenes: {
      handler() {
        const genesChart = this.chartsData.find(chart => chart.props.title === 'Genes');
        if (genesChart) {
          genesChart.props.phenRelatedGenes = this.phenRelatedGenes;
        }
      },
      deep: true
    },
    samples: {
      handler(newVal, oldVal) {
        this.fetchSamples();
      },
      deep: true
    }
  },
  }
</script>

<style lang="sass">
  #left-tracks-section
    box-sizing: border-box
    display: flex
    flex-direction: column
    flex-grow: 1
    height: 100%
    overflow: hidden
    padding: 5px 10px
    position: relative
    transition: all 0.5s
    .upper-track-selectors-bar
      align-items: center
      box-sizing: border-box
      display: flex
      height: fit-content
      justify-content: space-between
      padding: 5px
      width: 100%
    .wrapper-95
      box-sizing: border-box
      display: flex
      flex-direction: column
      flex-grow: 1
      overflow: hidden
      padding: 2px
      width: 100%
      #linear-section-container
        box-sizing: border-box
        flex: 1 1 auto
        overflow-y: auto
        padding-left: 10px
        .proband-chart
          position: sticky
          top: 2px
          z-index: 1
  #focus-chart-btn
    top: 0px
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
    padding: 8px 0px 2px 0px
    border-radius: 5px
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
  #global-view-select-radios
    width: fit-content
    top: 0px
    left: 10px
    padding: 5px 5px
    color: #2A65B7
    border: 1px solid #2A65B7
    box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
    border-radius: 5px
    input, label
      cursor: pointer
</style>