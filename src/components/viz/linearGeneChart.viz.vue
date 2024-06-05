<template>
    <div draggable="true" class="linear-gene-chart-wrapper">
      <p v-if="title">{{ title }}</p>
      <div class="drag-handle" @mousedown="dragChartStart">. . .</div>
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
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    title: String
  },
  data () {
    return {
      resizeObserver: null,
    }
  },
  mounted () {
    this.drawLinearGeneChart();

    this.resizeObserver = new ResizeObserver(() => {
      this.drawLinearGeneChart()
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
        selectionCallback: this.areaSelected
      };
      this.linearGeneChart = new linearGeneChart(container, this.chromosomes, this.genesList,  options);

      //grab the container and append the chart
      container.appendChild(this.linearGeneChart);
    },
    dragChartStart(){
      //We need to get the root element and allow it to be dragged
      let rootContainer = this.$refs.rootDraggableContainer;
      //allow it to be dragged
      rootContainer.setAttribute('draggable', true);
    },
  },
  watch: {
    selectedArea(){
      this.drawLinearGeneChart();
    },
    genesList(){
      this.drawLinearGeneChart();
    },
  }
}
</script>

<style lang="sass">
  .linear-gene-chart-wrapper
    position: relative
    margin-top: 2px
    padding: 5px
    border-radius: 5px
    border: 2px solid #ccc
    background-color: white
    p
      font-weight: bold
      color: #2A65B7
      margin-left: 10px
      width: 100%
      box-sizing: border-box
      text-align: center
    .drag-handle
      height: 40px
      width: 10px
      border: 2px solid #2A65B7
      background-color: white
      position: absolute
      top: 40%
      left: -7px
      border-radius: 5px
      cursor: move
      writing-mode: vertical-rl
      text-align: center
      line-height: .15em
      color: #2A65B7
  .linear-gene-chart 
    height: 120px
    width: 100%
    box-sizing: border-box

</style>