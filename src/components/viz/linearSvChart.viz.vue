<template>
    <div ref="rootDraggableContainer" class="linear-sv-chart-wrapper">
      <p v-if="title">{{ title }}</p>
      <div class="drag-handle" @mousedown="dragChartStart">. . .</div>
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
    title: String,
    focusedVariant: Object,
    needsFocus: Boolean,
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

      if (!this.hasAllOptions) {
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
    dragChartStart(){
      //We need to get the root element and allow it to be dragged
      let rootContainer = this.$refs.rootDraggableContainer;
      //allow it to be dragged
      rootContainer.setAttribute('draggable', true);
    },
  },
  computed: {
    hasAllOptions(){
      return this.chromosomes && this.svList && this.svList.length > 0;
    }
  },
  watch: {
    selectedArea(){
      this.drawLinearSvChart();
    },
    svList: {
      handler() {
        this.drawLinearSvChart();
      },
      deep: true
    }
  }
}
</script>

<style lang="sass">
  .linear-sv-chart-wrapper
    position: relative
    margin-top: 5px
    padding: 5px
    border-radius: 5px
    border: 1px solid #2A65B7
    background-color: white
    box-shadow: 0px 0px 5px 0px #2A65B7
    p
      font-weight: bold
      color: #2A65B7
      margin-left: 10px
      width: 100%
      box-sizing: border-box
      text-align: center
      margin: 5px
    .drag-handle
      height: 40px
      width: 15px
      border: 2px solid #2A65B7
      background-color: white
      position: absolute
      top: 35%
      left: -10px
      font-weight: bold
      border-radius: 5px
      cursor: move
      writing-mode: vertical-rl
      text-align: center
      line-height: .3em
      color: #2A65B7
      &:hover
        box-shadow: 0px 0px 5px 0px #2A65B7
        background-color: #C1D1EA
  .linear-sv-chart 
    height: 120px
    width: 100%
    box-sizing: border-box
</style>