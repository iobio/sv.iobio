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
      //if we dont have a parent element, dont draw the chart
      if (!container || !container.clientWidth) {
        return;
      }
      //remove anything in the container
      container.innerHTML = '';

      if (!this.svList || !this.chromosomes) {
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
    margin-top: 2px
    padding: 5px
    border-radius: 5px
    border: 2px solid #ccc
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
</style>