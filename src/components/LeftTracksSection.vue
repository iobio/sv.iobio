<template>
    <div id="left-tracks-section">
      <div class="upper-track-selectors-bar">
        <div id="radios-tools-container">
          <div id="global-view-select-radios">
            <input type="radio" id="circos-view" name="view" value="circos" v-model="globalView">
            <label for="circos-view">Circos</label>
            <input type="radio" id="linear-view" name="view" value="linear" v-model="globalView">
            <label for="linear-view">Linear</label>
          </div>

          <button @click="toggleLineTool" v-if="globalView == 'linear'" class="line-tool-btn">Line Tool</button>
        </div>
        <div v-if="(showButton && focusedVariant) || zoomHistory.length > 1" id="buttons-container">
          <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus on Variant</button>
          <button v-if="zoomHistory.length > 1" @click="focusOnPrevious" id="prev-zoom-btn">Prev. Zoom</button>
        </div>
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
          @deleteTrack="removeTrack"
          @selectAreaEvent="selectAreaEventFired"/>

        <div id="linear-section-container" v-if="globalView === 'linear'" @dragover.prevent="handleDragOver" @drop="handleDrop">
          <div id="linear-marker-line" v-if="tools.line"></div>
          <LinearSvChartViz
            v-if="samples.proband.svList && samples.proband.svList.length > 0" 
            class="proband-chart"
            :svList="samples.proband.svList"
            :name="samples.proband.name"
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
            @removeTrack="removeTrack(index - 1)"
            class="draggable-chart"
          />
        </div>
       
      </div>

    </div>
  </template>
  
<script>
  import svCircos from './viz/svCircos.viz.vue';
  import * as dataHelper from '../dataHelpers/dataHelpers.js';
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
    samples: Object,
    multiSampleVcf: Boolean,
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
      tools: {
        line: false
      },
    }
  },
  async mounted () {
    await this.getBaseData();
    await this.fetchSamples();
  },
  methods: {
    toggleLineTool() {
      this.tools.line = !this.tools.line
    },
    async getBaseData(build='hg38', source='refseq') {
      try {
        let data = await dataHelper.getChromosomes(build);
        this.chromosomes = data;

        //create a map of the chromosomes to accumulate the length of each chromosome
        this.chromosomeAccumulatedMap = this.createCromosomeAccumulatedMap(this.chromosomes);
      } catch (error) {
        console.error('Error fetching chromosomes:', error);
      }

      try {
        let data = await dataHelper.getCentromeres(build);
        this.centromeres = data;
      } catch (error) {
        console.error('Error fetching centromeres:', error);
      }

      try {
        let data = await dataHelper.getBands(build);
        this.bands = data;
      } catch (error) {
        console.error('Error fetching bands:', error);
      }
      
      try {
        let data = await dataHelper.getGenes(build, source);
        this.genes = data;

        this.chartsData.push({
          component: 'LinearGeneChartViz',
          props: {
            genesList: this.genes,
            name: 'Genes',
            selectedArea: this.selectedArea,
            chromosomes: this.chromosomes,
            centromeres: this.centromeres,
            bands: this.bands,
            phenRelatedGenes: this.phenRelatedGenes,
            genesOfInterest: this.genesOfInterest,
            batchNum: this.batchNum
          }
        })
      } catch (error) {
        console.error('Error fetching genes:', error);
      }
    },
    async fetchSamples() {
      let locComparisons = this.samples.comparisons;
      let locChartsData = this.chartsData.filter(chart => chart.props.name=== 'Genes');
      let locSamplesLists = new Array(this.samples.comparisons.length);
      let locSamplesTitles = new Array(this.samples.comparisons.length);

      for (let i = 0; i < locComparisons.length; i++) {
        let sample = locComparisons[i];

        let newSample = {
          component: 'LinearSvChartViz',
          props: {
            svList: [],
            name: sample.name,
            selectedArea: this.selectedArea,
            chromosomes: this.chromosomes,
            centromeres: this.centromeres,
            bands: this.bands,
            isProband: false
          }
        };

        locChartsData.push(newSample);

        try {
          let data;
          let svData;
          
          if (!this.multiSampleVcf && !sample.id) {
            data = await dataHelper.getSVsFromVCF(sample.vcf);
            svData = data.map(item => new Sv(item));
          } else {
            data = await dataHelper.getSVsFromVCF(sample.vcf, sample.id);
            svData = data.map(item => new Sv(item));
          }

          locChartsData[i + 1].props.svList = svData;
          locSamplesLists[i] = svData;
          locSamplesTitles[i] = sample.name;
        } catch (error) {
          console.error(`Error fetching data for sample ${sample.name}:`, error);
        }
      }

      this.chartsData = locChartsData;
      this.samplesLists = locSamplesLists;
      this.samplesTitles = locSamplesTitles;
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
        //BUG: this may not catch the case that we are at the end or beginning but not selecting the whole? check
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
      let obj = event.target;
      obj.style.cursor = 'grab';
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
    trackCursor() {
      let cursorTrackingZone = document.getElementById('linear-section-container');
      cursorTrackingZone.addEventListener('mousemove', this.moveMarkerLine); 
    },
    untrackCursor() {
      let cursorTrackingZone = document.getElementById('linear-section-container');
      cursorTrackingZone.removeEventListener('mousemove', this.moveMarkerLine);
    },
    moveMarkerLine(event) {
      let line = document.getElementById('linear-marker-line');
      if (line) {
        let x = this.trackMouseX(event);
        line.style.left = x + 'px';
      }
    },
    trackMouseX(event) {
      let container = document.getElementById('linear-section-container');
      let containerRect = container.getBoundingClientRect();
      let containerX = containerRect.x + 2;
      let x = event.clientX - containerX;
      if (x < 0) {
        return 0;
      } else if (x > containerRect.width) {
        return containerRect.width;
      } else {
        return x;
      }
    },
    removeTrack(trackIndex) {
      let localSampleComparisons = this.samples.comparisons;
      localSampleComparisons.splice(trackIndex, 1);
      this.$emit('updateComparisons', localSampleComparisons);
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
      this.svList

      return ready
    },
    chromSelectBarDataReady() {
      return this.chromosomes && this.centromeres && this.bands
    }
  },
  watch: {
    batchNum() {
      const genesChart = this.chartsData.find(chart => chart.props.name === 'Genes');
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
    svList(newVal){
      //if the svList changes we need to update the samples.proband.svList
      this.samples.proband.svList = newVal;
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
        const genesChart = this.chartsData.find(chart => chart.props.name === 'Genes');
        if (genesChart) {
          genesChart.props.genesOfInterest = this.genesOfInterest;
        }
      },
      deep: true
    },
    phenRelatedGenes: {
      handler() {
        const genesChart = this.chartsData.find(chart => chart.props.name === 'Genes');
        if (genesChart) {
          genesChart.props.phenRelatedGenes = this.phenRelatedGenes;
        }
      },
      deep: true
    },
    samples: {
      async handler(newVal, oldVal) {
          await this.fetchSamples();
      },
      deep: true
    }, 
    tools: {
      handler() {
        if (this.tools.line) {
          this.trackCursor();
        } else {
          this.untrackCursor();
        }
      },
      deep: true
    },
  },
  }
</script>

<style lang="sass">
  #radios-tools-container
    display: flex
    justify-content: space-between
    .line-tool-btn
      top: 0px
      right: 10px
      padding: 5px 5px
      margin-left: 10px
      color: #2A65B7
      border: 1px solid #2A65B7
      border-radius: 5px
      font-weight: bold
      box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
      &:hover
        cursor: pointer
        opacity: 0.7
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
        position: relative
        #linear-marker-line
          position: absolute
          top: 0px
          left: 0px
          width: 1px
          height: 100%
          background-color: red
          z-index: 2
        .proband-chart
          position: sticky
          top: 2px
          z-index: 1
  #buttons-container
    display: flex
    justify-content: space-between
    width: fit-content
    #focus-chart-btn
      top: 0px
      right: 40px
      padding: 5px 5px
      color: #2A65B7
      border: 1px solid #2A65B7
      margin-right: 10px
      border-radius: 5px
      font-weight: bold
      box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3)
      &:hover
        cursor: pointer
        opacity: 0.7
    #prev-zoom-btn
      top: 0px
      right: 10px
      padding: 5px 5px
      color: #2A65B7
      border: 1px solid #2A65B7
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
    box-sizing: content-box
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