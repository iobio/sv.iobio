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
  },
  data () {
    return {
      chromosomes: null,
      chromSelectBarChart: null,
      resizeObserver: null
    }
  },
  mounted () {
    // Get the ref chromosomes from http://localhost:3000/chromosomes?build=hg38
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
  },
  onUpdated() {
    if (this.chromosomes) {
      this.resizeObserver = new ResizeObserver(() => {
        this.drawChromSelectBar()
      });

      this.resizeObserver.observe(document.getElementById('chrom-select-bar'));
    }
  },
  beforeDestroy() {
    if (this.resizeObserver){
      this.resizeObserver.unobserve(document.getElementById('chrom-select-bar'));
    }
  },
  methods: {
    drawChromSelectBar() {
      let containerTag = '#chrom-select-bar';
      this.chromSelectBarChart = new chromSelectBar(containerTag, this.chromosomes);

      //if there is anything in the container, remove it
      d3.select(containerTag).selectAll("*").remove();

      //get the container and append the chart
      let container = d3.select(containerTag);
      container.node().append(this.chromSelectBarChart);
    }
  },
  computed: {
  },
  watch: {
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