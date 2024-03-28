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
      svList: Array
    },
    data () {
      return {
        chromosomes: null,
        centromeres: null,
        bands: null,
        chromSelectBarChart: null,
        resizeObserver: null,
      }
    },
    mounted () {
      fetch('http://localhost:3000/chromosomes?build=hg38')
        .then(response => response.json())
        .then(data => {
          this.chromosomes = data;
          this.drawChromSelectBar()

          if (this.chromosomes) {
            this.resizeObserver = new ResizeObserver( () => {
              this.drawChromSelectBar()
            });

            this.resizeObserver.observe(document.getElementById('chrom-select-bar'));
          }
      });

      fetch('http://localhost:3000/centromeres?build=hg38')
        .then(response => response.json())
        .then(data => {
          this.centromeres = data;
        });

      fetch('http://localhost:3000/bands?build=hg38')
        .then(response => response.json())
        .then(data => {
          this.bands = data;
        });
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
          pointsOfInterest: this.svListSorted,
          selectionCallback: this.areaSelected
        };
        this.chromSelectBarChart = new chromSelectBar(containerTag, this.chromosomes, options);
        
        //get the container and append the chart
        let container = d3.select(containerTag);
        container.node().append(this.chromSelectBarChart);

      },
      areaSelected(selection){
        console.log('area selected', selection);
      }
    },
    computed: {
      hasAllOptions() {
        return this.chromosomes && this.centromeres && this.bands && (this.svListSorted && this.svListSorted.length > 0);
      }, 
      svListSorted() {
        return [...this.svList].sort((a, b) => {
          if (a.chromosome === b.chromosome) {
            return a.start - b.start;
          }
          return a.chromosome - b.chromosome;
        });
      }
    },
    watch: {
      //if any of the options change, redraw the chart
      hasAllOptions: function() {
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