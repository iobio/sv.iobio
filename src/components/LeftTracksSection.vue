<template>
    <div id="left-tracks-section">
      <div class="upper-track-selectors-bar">
        <div id="radios-tools-container">
          <fieldset class="location-indicator">
            <legend>Location</legend>
            <p class="entry">{{ zoomedStamp }}</p>
          </fieldset>

          <div id="global-chart-style-selection">
            <select name="chart-view-selection" id="chart-view-select" v-model="globalView">
              <option value="circos">Circos</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          <button @click="toggleLineTool" v-if="globalView == 'linear'" class="line-tool-btn"> 
            <span>Line<br>Tool</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>drag-vertical-variant</title><path d="M11 21H9V3H11V21M15 3H13V21H15V3Z" /></svg>
          </button>
        </div>
        <div v-if="(showButton && focusedVariant) || zoomHistory.length > 1" id="buttons-container">
          <button v-if="showButton && focusedVariant" id="focus-chart-btn" @click="focusOnVariant">Focus On <br> Variant</button>
          <button v-if="zoomHistory.length > 1" @click="focusOnPrevious" id="prev-zoom-btn">Prev. <br> Zoom</button>
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
          :focusedVariant="focusedVariant"
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
        <component
            :is="geneChartData.component"
            v-bind="geneChartData.props"
            @selectAreaEvent="selectAreaEventFired"/>

          <IdiogramScaleBarViz
            :selectedArea="selectedArea"
            :bands="bands"
            :centromeres="centromeres"
            :chromosomes="chromosomes"
            @selectAreaEvent="selectAreaEventFired"/>

          <LinearSvChartViz
            v-if="svList && svList.length > 0" 
            class="proband-chart"
            :svList="svList"
            :focusedVariant="focusedVariant"
            :name="samples.proband.name"
            :chromosomes="chromosomes"
            :centromeres="centromeres"
            :bands="bands"
            :selectedArea="selectedArea"
            :isProband="true"
            @selectAreaEvent="selectAreaEventFired"/>

          <component
            v-for="(chartData, index) in chartsData"
            :key="index"
            :is="chartData.component"
            v-bind="chartData.props"
            @dragstart="handleDragStart(index, $event)"
            @selectAreaEvent="selectAreaEventFired"
            @removeTrack="removeTrack(index)"
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
  import IdiogramScaleBarViz from './viz/idiogramScaleBar.viz.vue'

  export default {
  name: "LeftTracksSection",
  components: {
    svCircos,
    ChromSelectBarViz,
    LinearSvChartViz,
    LinearGeneChartViz, 
    IdiogramScaleBarViz
  },
  props: {
    svList: Array,
    selectedArea: Object,
    focusedVariant: Object,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    focusedGeneName: String,
    batchNum: Number,
    samples: Object,
    multiSampleVcf: Boolean,
    genomeStart: Number,
    genomeEnd: Number
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
      geneChartData: {},
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

        this.geneChartData = {
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
        }
      } catch (error) {
        console.error('Error fetching genes:', error);
      }
    },
    async fetchSamples() {
      let locComparisons = this.samples.comparisons;
      let locChartsData = [];
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

          locChartsData[i].props.svList = svData;
          locSamplesLists[i] = svData;
          locSamplesTitles[i] = sample.name;
        } catch (error) {
          console.error(`Error fetching data for sample ${sample.name}:`, error);
        }
      }

      this.chartsData = locChartsData;
      this.samplesLists = locSamplesLists;
      this.$emit('update-comparison-lists', locSamplesLists);
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

        this.$emit('set-chromosome-accumulated-map', chromosomeAccumulatedMap);
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

      if (focusedStart < 0) {
          focusedStart = 0;
      }

      if (focusedEnd >= this.genomeEnd) {
          focusedEnd = this.genomeEnd;
      }

      let zoomedSection = {
          start: focusedStart,
          end: focusedEnd,
          size: focusedSize
      };
      return zoomedSection;
    },
    findZoomFromFocusedGene() {
      if (!this.focusedGeneName) {
        return null;
      } else if (!this.genes) {
        return null;
      }

      let gene = this.genes[this.focusedGeneName];

      if (!gene) {
        return null;
      }

      let chrom = gene.chr.replace('chr', '');
      let chromStart = this.chromosomeAccumulatedMap.get(chrom).start;
      let geneStartAbs = gene.start + chromStart;
      let geneEndAbs = gene.end + chromStart;
      let geneSize = geneEndAbs - geneStartAbs;

      let focusedStart = geneStartAbs - geneSize;
      let focusedEnd = geneEndAbs + geneSize;

      if (focusedStart < 0) {
        focusedStart = 0;
      }

      if (focusedEnd >= this.genomeEnd) {
        focusedEnd = this.genomeEnd;
      }

      let zoomedSection = {
        start: focusedStart,
        end: focusedEnd,
        size: geneSize
      };

      this.$emit('zoomEvent', zoomedSection, true);
      return zoomedSection;
    },
    selectAreaEventFired(zoomZone) {
      //if the zoomZone is not the whole genome we push it to the zoomHistory
      if (zoomZone && zoomZone.start !== 0 && !(zoomZone.end >= this.genomeEnd)) {
        //BUG: this may not catch the case that we are at the end or beginning but not selecting the whole? check
        this.zoomHistory.push(zoomZone);
      } else {
        this.zoomHistory = [];
        if (this.focusedVariant) {
          this.showButton = true
        }
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
      const targetIndex = Array.from(event.currentTarget.children).indexOf(event.target.closest('.draggable-chart'));
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
        return this.selectedArea.start === 0 && this.selectedArea.end >= this.genomeEnd;
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
    },
    zoomedStamp() {
      if (this.isGlobalView) {
        return 'Whole Genome';
      } else if (!this.chromosomeAccumulatedMap || !this.selectedArea) {
        return 'Whole Genome';
      } else {
        let startChromosome;
        let relativeStart;
        this.chromosomeAccumulatedMap.forEach((value, key) => {
          if (this.selectedArea.start >= value.start && this.selectedArea.start <= value.end) {
            startChromosome = key;
            relativeStart = this.selectedArea.start - value.start;

            if (relativeStart <= 0) {
              relativeStart = 1;
            }
          }
        });
        let endChromosome;
        let relativeEnd;
        this.chromosomeAccumulatedMap.forEach((value, key) => {
          //Subtract one because igv is 1 based and we are 0 based
          if ((this.selectedArea.end - 1 )>= value.start && (this.selectedArea.end - 1) <= value.end) {
            endChromosome = key;
            relativeEnd = this.selectedArea.end - value.start;
          }
        });

        if (startChromosome === endChromosome) {
          return `chr${startChromosome}:${relativeStart}-${relativeEnd}`;
        } else {
          return `chr${startChromosome}:${relativeStart}-chr${endChromosome}:${relativeEnd}`;
        }
      }
    }
  },
  watch: {
    focusedGeneName(newVal, oldVal) {
      if (newVal && newVal !== oldVal && this.genes) {
        this.findZoomFromFocusedGene();
      }
    },
    batchNum() {
      const genesChart = this.chartsData.find(chart => chart.props.name === 'Genes');
      if (genesChart) {
        genesChart.props.batchNum = this.batchNum;
      }
    },
    focusedVariant(newVal, oldVal) {
      if (this.focusedVariant) {
        this.focusOnVariant();
      } else if (!this.focusedVariant) {
        this.$emit('zoomEvent', null)
        this.showButton = false
      }
    },
    selectedArea: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            this.geneChartData.props.selectedArea = this.selectedArea
            this.chartsData.forEach(chart => {
                chart.props.selectedArea = this.selectedArea;
            });
        } else if (!newVal) {
            this.geneChartData.props.selectedArea = null;
            this.chartsData.forEach(chart => {
                chart.props.selectedArea = null;
            });
        }
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
    justify-content: flex-start
    align-items: flex-end
    height: 100%
    .line-tool-btn
      padding: 5px 5px
      margin-left: 10px
      display: flex
      flex-direction: row
      align-items: center
      border: none
      color: #474747
      background-color: #EBEBEB
      font-size: 0.8em
      border-radius: 5px
      text-transform: uppercase
      text-align: left
      height: 100%
      &:hover
        cursor: pointer
        background-color: #E0E0E0
      svg
        width: 20px
        height: 20px
        fill: #2A65B7
        border-radius: 50%
        margin-left: 3px
    .location-indicator
      display: flex
      flex-direction: row
      align-items: center
      padding: 5px
      border: none
      border-bottom: 1px solid #E0E0E0
      margin-left: 10px
      legend
        margin: 0px
        padding: 0px
        font-size: 0.6em
        text-transform: uppercase
        font-style: italic
        color: #474747
      p.entry
        margin: 0px
        padding: 0px
        font-size: 0.8em
        border-radius: 5px
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
      width: 100%
      padding-bottom: 5px
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
    height: 100%
    #focus-chart-btn
      padding: 5px
      border: none
      margin-left: 10px
      border-radius: 5px
      text-transform: uppercase
      color: #474747
      height: 100%
      &:hover
        cursor: pointer
        background-color: #E0E0E0
    #prev-zoom-btn
      padding: 5px
      border: none
      margin-left: 10px
      border-radius: 5px
      text-transform: uppercase
      color: #474747
      height: 100%
      &:hover
        cursor: pointer
        background-color: #E0E0E0
  #chrom-select-bar-div
    height: 32px
    padding: 8px 0px 2px 0px
    border-bottom: 1px solid #E0E0E0
    box-sizing: content-box
  #global-chart-style-selection
    width: fit-content
    color: #2A65B7
    background-color: #EBEBEB
    border-radius: 5px
    margin-left: 10px
    padding: 5px
    height: 100%
    display: flex
    align-items: center
    &:hover
      cursor: pointer
      background-color: #E0E0E0
    select
      border: none
      font-weight: bold
      font-size: 1em
      text-transform: uppercase
      background-color: inherit
      &:hover
        cursor: pointer
        background-color: #E0E0E0
      &:focus
        outline: none
</style>