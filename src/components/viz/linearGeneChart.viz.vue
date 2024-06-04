<template>
    <div class="linear-gene-chart-wrapper">
      <p v-if="title">{{ title }}</p>
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
  },
  data () {
    return {
      resizeObserver: null,
      title: 'Genes'
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
      //remove anything in the container
      container.innerHTML = '';

      if (!this.genesList || !this.chromosomes) {
        return;
      }

      //if we dont have a parent element, dont draw the chart
      if (!container) {
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
  },
  watch: {
    selectedArea(){
      this.drawLinearGeneChart();
    }

  }
}
</script>

<style lang="sass">
  .linear-gene-chart-wrapper
    margin-top: 10px
    border-radius: 5px
    padding: 5px
    box-shadow: 0 0 5px 0 rgba(0,0,0,0.2)
    p
      font-weight: bold
      color: #2A65B7
      margin-left: 10px
      width: 100%
      box-sizing: border-box
      text-align: center
  .linear-gene-chart 
    height: 120px
    width: 100%
    box-sizing: border-box
  .linear-gene-chart-d3
    border-bottom: none
</style>