<template>
    <div id="chrom-select-bar"></div>
  </template>
  
<script>
  import chromSelectBar from '../../d3/chromSelectBar.d3.js';

  export default {
  name: "ChromSelectBarViz",
  components: {
  },
  props: {
  },
  data () {
    return {
      chromosomes: null,
      chromSelectBarChart: null
    }
  },
  mounted () {
    // Get the ref chromosomes from http://localhost:3000/chromosomes?build=hg38
    fetch('http://localhost:3000/chromosomes?build=hg38')
      .then(response => response.json())
      .then(data => {
          this.chromosomes = data;
          this.drawChromSelectBar()
      });
  },
  methods: {
    drawChromSelectBar() {
      let containerTag = '#chrom-select-bar';
      this.chromSelectBarChart = new chromSelectBar(containerTag, this.chromosomes);
      
      //grab the container
      let container = document.querySelector(containerTag);
      //inject the svg
      container.appendChild(this.chromSelectBarChart);
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