<template>
    <div id="chrom-select-bar"></div>
  </template>
  
<script>
  import chromSelectBar from '../../d3/chromSelectBar.d3.js';
  import * as d3 from 'd3';

  export default {
    name: "ChromSelectBarViz",
    components: {
    },
    props: {
      selectedArea: Object,
      bands: Array,
      centromeres: Array,
      chromosomes: Array,
    },
    data () {
      return {
        chromSelectBarChart: null,
        resizeObserver: null,
      }
    },
    mounted () {
      if (this.chromosomes) {
            this.resizeObserver = new ResizeObserver( () => {
              this.drawChromSelectBar()
            });

            this.resizeObserver.observe(document.getElementById('chrom-select-bar'));
          }
    },
    onUpdated() {
    },
    beforeDestroy() {
      if (this.resizeObserver){
        this.resizeObserver.unobserve(document.getElementById('chrom-select-bar'));
      }
    },
    methods: {
      drawChromSelectBar() {
        let containerTag = '#chrom-select-bar';
        d3.select(containerTag).selectAll("*").remove(); //remove before redrawing

        //if we dont have chromosomes, centromeres, or bands, dont draw the chart
        if (!this.hasAllOptions) {
          return;
        }

        let options = {
          centromeres: this.centromeres, 
          bands: this.bands,
          brush: true,
          selection: this.selectedArea,
          selectionCallback: this.areaSelected
        };
        this.chromSelectBarChart = new chromSelectBar(containerTag, this.chromosomes, options);
        
        //get the container and append the chart
        let container = d3.select(containerTag);
        container.node().append(this.chromSelectBarChart);

      },
      areaSelected(selection){
        this.$emit('area-selected', selection);
      }
    },
    computed: {
      hasAllOptions() {
        return this.chromosomes && this.centromeres && this.bands;
      }, 
    },
    watch: {
      //if any of the options change, redraw the chart
      hasAllOptions: function() {
        this.drawChromSelectBar();
      },
      selectedArea: function() {
        this.drawChromSelectBar();
      },
    },
  }
</script>
  
<style lang="sass">
  #chrom-select-bar
    width: 100%
    height: 100%
    margin: 0
    padding: 0
    background-color: inherit
</style>