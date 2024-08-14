<template>
    <div draggable="true" class="linear-gene-chart-wrapper" ref="rootDraggableContainer">
      <p v-if="name">{{ name }}</p>
      <div class="drag-handle" @mousedown="dragChartStart($event)" @mouseup="changeCursorToGrab($event)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>drag up/down</title>
          <path d="M10,8H6L12,2L18,8H14V16H18L12,22L6,16H10V8Z" />
        </svg>
      </div>
      <div ref="linearGeneChartContainer" class="linear-gene-chart"></div>
    </div>
</template>

<script>
  import linearGeneChart from '../../d3/linearGeneChart.d3.js';

export default {
  name: 'LinearGeneChartViz',
  components: {
  },
  props: {
    genesList: Object,
    selectedArea: Object,
    chromosomes: Array,
    centromeres: Array,
    bands: Array,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    name: String,
    batchNum: Number,
  },
  data () {
    return {
      resizeObserver: null,
    }
  },
  mounted () {
    this.drawLinearGeneChart();

    let debouncedDraw = this.debounce(this.drawLinearGeneChart, 100);
    this.resizeObserver = new ResizeObserver(() => {
      debouncedDraw();
    });

    this.resizeObserver.observe(this.$refs.linearGeneChartContainer);
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.linearGeneChartContainer);
  },
  methods: {
    drawLinearGeneChart() {
      //Grab the container by ref
      let container = this.$refs.linearGeneChartContainer; 
      //if we dont have a parent element, dont draw the chart
      if (!container || !container.clientWidth) {
        return;
      }
      //remove anything in the container
      container.innerHTML = '';

      if (!this.genesList || !this.chromosomes) {
        return;
      }

      let options = {
        selection: this.selectedArea,
        selectionCallback: this.selectedAreaCallback,
        brush: true,
        genesOfInterest: this.genesOfInterest,
        phenRelatedGenes: this.phenRelatedGenes,
        centromeres: this.centromeres, 
        bands: this.bands,
      };
      this.linearGeneChart = new linearGeneChart(container, this.chromosomes, this.genesList,  options);

      //grab the container and append the chart
      container.appendChild(this.linearGeneChart);
    },
    dragChartStart(event){
      let obj = event.target;
      obj.style.cursor = 'grabbing';
      //We need to get the root element and allow it to be dragged
      let rootContainer = this.$refs.rootDraggableContainer;
      //allow it to be dragged
      rootContainer.setAttribute('draggable', true);
    },
    changeCursorToGrab(event){
      let obj = event.target;
      obj.style.cursor = 'grab';
    },
    selectedAreaCallback(selectedArea){
      this.$emit('selectAreaEvent', selectedArea);
    },
    debounce(func, delay) {
        let timeout;
        return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), delay);
        };
      },
  },
  watch: {
    batchNum(newVal, oldVal){
      if (newVal !== oldVal) {
        this.drawLinearGeneChart();
      }
    },
    selectedArea(newVal, oldVal){
      if (newVal !== oldVal) {
        this.drawLinearGeneChart();
      } 
    },
    genesList(newVal, oldVal){
      if (newVal !== oldVal) {
        this.drawLinearGeneChart();
      }
    },
    genesOfInterest: {
      handler(){
        this.drawLinearGeneChart();
      },
      deep: true
    },
    phenRelatedGenes: {
      handler(){
        this.drawLinearGeneChart();
      },
      deep: true
    },
  }
}
</script>

<style lang="sass">
  .linear-gene-chart-wrapper
    position: relative
    margin-top: 5px
    padding: 5px
    border-radius: 5px
    background-color: white
    p
      font-weight: bold
      color: #2A65B7
      width: 100%
      box-sizing: border-box
      text-align: center
      margin: 5px
    .drag-handle
      height: 30px
      width: 15px
      border: 2px solid #2A65B7
      display: flex
      justify-content: center
      align-items: center
      background-color: white
      position: absolute
      top: 40%
      left: -10px
      font-weight: bold
      border-radius: 5px
      cursor: grab
      writing-mode: vertical-rl
      text-align: center
      line-height: .3em
      color: #2A65B7
      box-sizing: content-box
      &:hover
        box-shadow: 0px 0px 5px 0px #2A65B7
        background-color: #C1D1EA
      svg
        width: 20px
        height: 20px
        fill: #2A65B7
  .linear-gene-chart 
    height: 120px
    width: 100%
    box-sizing: border-box
    overflow: hidden

</style>