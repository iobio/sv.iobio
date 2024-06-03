<template>
    <div ref="linearChartContainer" class="linear-sv-chart"></div>
</template>

<script>
  import linearSvChart from '../../d3/linearSvChart.d3.js';

export default {
  name: 'LinearSvChartViz',
  components: {
  },
  props: {
    svList: Array,
    selectedArea: Object,
    chromosomes: Array
  },
  data () {
    return {
      resizeObserver: null,
    }
  },
  mounted () {
    this.drawLinearSvChart();

    this.resizeObserver = new ResizeObserver(() => {
      this.drawLinearSvChart()
    });

    this.resizeObserver.observe(this.$refs.linearChartContainer);
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.linearChartContainer);
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
      container.appendChild(this.linearSvChart);
    },
  }
}
</script>

<style lang="sass">
  .linear-sv-chart 
    height: 200px
    width: 100%
    box-sizing: border-box
    margin-top: 35px
</style>