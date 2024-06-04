<template>
    <div class="linear-sv-chart-wrapper">
      <p v-if="title">{{ title }}</p>
      <div ref="linearChartContainer" class="linear-sv-chart"></div>
    </div>
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
    chromosomes: Array,
    title: String
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
  },
  watch: {
    selectedArea(){
      this.drawLinearSvChart();
    }

  }
}
</script>

<style lang="sass">
  .linear-sv-chart-wrapper
    margin-top: 38px
    border-radius: 5px
    p
      font-weight: bold
      color: #2A65B7
      margin-left: 10px
      width: 100%
      box-sizing: border-box
      text-align: center
  .linear-sv-chart 
    height: 120px
    width: 100%
    box-sizing: border-box
  .linear-sv-chart-d3
    border-bottom: none
</style>