<template>
    <div ref="cromSelectBarContainer" id="chrom-select-bar"></div>
  </template>
  
<script>
  import chromSelectBar from '../../d3/chromSelectBar.d3.js';

  export default {
    name: "ChromSelectBarViz",
    components: {
    },
    props: {
      selectedArea: Object,
      bands: Array,
      centromeres: Array,
      chromosomes: Array,
      focusedVariant: Object,
      needsFocus: Boolean,
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
        //select the container
        let container = this.$refs.cromSelectBarContainer;
        //if the container doesnt exist, dont draw the chart or if it doesnt have a width
        if (!container || !container.clientWidth) {
          return;
        }
        container.innerHTML = '';

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
        container.appendChild(this.chromSelectBarChart);

      },
      areaSelected(selection){
        this.$emit('selectAreaEvent', selection);
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