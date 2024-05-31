<template>
    <div ref="linearChartContainer" class="linear-sv-chart"></div>
</template>

<script>
  import linearSvChart from '../../d3/linearSvChart.d3.js';
  import * as d3 from 'd3';
export default {
  name: 'LinearSvChartViz',
  components: {
  },
  props: {
    svList: Array,
    selectedArea: Object,
    chromosomes: Array,
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    drawLinearSvChart() {
      //Grab the container by ref
      let container = this.$refs.linearChartContainer; 
      //remove anything in the container
      container.innerHTML = '';

      if (!this.svList || !this.chromosomes) {
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
      this.linearSvChart = new linearSvChart(container, this.chromosomes, this.svList,  options);

      //grab the container and append the chart
      container.appendChild(this.linearSvChart.chart);
    },
  }
}
</script>

<style lang="sass">
  .linear-sv-chart 
    height: 200px
    width: 100%
    border: 1px solid black
    box-sizing: border-box
</style>