<template>
    <div id="svCircos"></div>
</template>

<script>
import svCircos from '../../d3/svCircos.js'
import * as d3 from 'd3';

export default {
  name: 'svCircos',
  components: {
  },
  props: {
  },
  data () {
    return {
      vcfData: null,
      circosChart: null,
      centromeres: null,
    }
  },
  mounted () {
    fetch('../vcf.json')
      .then(response => response.json())
      .then(data => {
          this.vcfData = data;
      });

    fetch('http://localhost:3000/centromeres?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.centromeres = data;
      });

    this.resizeObserver = new ResizeObserver(() => {
      //set a timeout to prevent the drawCircos from being called too many times
      this.drawCircos()
    });

    this.resizeObserver.observe(document.getElementById('svCircos'));
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(document.getElementById('svCircos'));
  },
  methods: {
    async drawCircos() {
      let containerTag = '#svCircos';
      let container = d3.select(containerTag);
      container.selectAll("*").remove();

      //if we dont have centromeres, dont draw the circos
      if (!this.centromeres) {
        return;
      }

      let options = {
        centromeres: this.centromeres
      }
      //remove anything from the container
      this.circosChart = new svCircos(containerTag, this.vcfData, options)

      //if we dont have the data we need (vcfData), dont draw the circos
      if (!this.vcfData) {
        return;
      }

      container.node().appendChild(this.circosChart);
    }
  },
  computed: {
    hasAllOptions() {
      return this.centromeres;
    }
  },
  watch: {
    vcfData: function() {
      this.drawCircos()
    },
    hasAllOptions: function() {
      this.drawCircos()
    }
  }
}
</script>

<style lang="sass">
  #svCircos
    align-items: center
    background-color: none
    border-radius: 5px
    border: none
    // box-sizing: border-box
    display: flex
    flex-direction: column
    height: 100%
    justify-content: center
    width: 100%
</style>