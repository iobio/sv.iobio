<template>
    <div ref="rootDraggableContainer" class="linear-sv-chart-wrapper">
      <p class="title" v-if="name">{{ name }}</p>
      <div v-if="!isProband" class="remove-button" @click="emitRemoveTrack">x</div>
      <div v-if="!isProband" class="drag-handle" @mousedown="dragChartStart($event)" @mouseup="changeCursorToGrab($event)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>drag up/down</title>
          <path d="M10,8H6L12,2L18,8H14V16H18L12,22L6,16H10V8Z" />
        </svg>
      </div>
      <div :class="{hidden: isLoading}" ref="linearChartContainer" class="linear-sv-chart"></div>
      <div class="loading-message" v-if="isLoading">
        <p>Loading...</p>
      </div>
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
    focusedVariant: {
      type: Object,
      required: false
    },
    selectedArea: Object,
    chromosomes: Array,
    centromeres: Array,
    bands: Array,
    name: String,
    isProband: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      resizeObserver: null,
      pendingDelete: false,
    }
  },
  mounted () {
    this.drawLinearSvChart();

    let debouncedDraw = this.debounce(this.drawLinearSvChart, 100);
    this.resizeObserver = new ResizeObserver(() => {
      debouncedDraw();
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
        selectionCallback: this.selectedAreaCallback,
        brush: true,
        centromeres: this.centromeres, 
        bands: this.bands,
      };
      
      if (this.focusedVariant) {
        options.focusedVariant = this.focusedVariant;
      }

      this.linearSvChart = new linearSvChart(container, this.chromosomes, this.svList,  options);

      //grab the container and append the chart
      container.appendChild(this.linearSvChart);
    },
    dragChartStart(event){
      let obj = event.target;
      obj.style.cursor = 'grabbing';

      let rootContainer = this.$refs.rootDraggableContainer;
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
    emitRemoveTrack(){
      this.$emit('removeTrack');
    }
  },
  computed: {
    hasAllOptions(){
      return this.chromosomes && this.svList && this.svList.length > 0;
    },
    isLoading(){
      //Based on whether the svList is empty or not
      return this.svList.length === 0;
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
  .tooltip-hover-variant
    position: absolute
    background-color: white
    border: 1px solid #2A65B7 
    padding: 5px
    border-radius: 5px
    pointer-events: none
    display: flex
    min-width: 200px
    flex-direction: column
    justify-content: center
    align-items: center
    overflow: hidden
    z-index: 10
  .linear-sv-chart-wrapper
    position: relative
    margin-top: 5px
    padding: 5px
    border-radius: 5px
    background-color: white
    .title
      box-sizing: border-box
      padding: 0px
      margin: 0px 0px 5px 0px
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
      background-color: white
      display: flex
      justify-content: center
      align-items: center
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
    .remove-button
      position: absolute
      top: 0px
      left: -9px
      font-size: 1.1em
      cursor: pointer
      color: #2A65B7
      width: 20px
      height: 20px
      border-radius: 50%
      border: 1px solid #2A65B7
      display: flex
      justify-content: center
      align-items: center
      line-height: 1em
      box-shadow: 0px 0px 3px 0px #2A65B7
      &:hover
        color: red
        border: 1px solid red
  .linear-sv-chart 
    height: 120px
    width: 100%
    box-sizing: border-box
    overflow: hidden
    &.hidden
      display: none
  .loading-message
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    height: 120px
    box-sizing: border-box
    padding: 5px 8px
    p
      font-weight: bold
      color: #2A65B7
      font-size: 1.25em
      padding: 0px
      margin: 0px
      height: 100%
      display: flex
      align-items: center
      justify-content: center
      background: whitesmoke
      border-radius: 5px
</style>