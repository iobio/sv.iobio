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
    svList: Array
  },
  data () {
    return {
      vcfData: null,
      circosChart: null,
      centromeres: null,
      bands: null,
      chromosomes: null,
    }
  },
  mounted () {
    fetch('http://localhost:3000/chromosomes?build=hg38')
      .then(response => response.json())
      .then(data => {
        this.chromosomes = data;
        this.drawCircos()

        if (this.chromosomes) {
          this.resizeObserver = new ResizeObserver( () => {
            this.drawCircos()
          });

          this.resizeObserver.observe(document.getElementById('svCircos'));
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
  beforeDestroy() {
    this.resizeObserver.unobserve(document.getElementById('svCircos'));
  },
  methods: {
    async drawCircos() {
      let containerTag = '#svCircos';
      let container = d3.select(containerTag);
      container.selectAll("*").remove(); //remove before redrawing

      //if we dont have centromeres, bands, or chromosomes dont draw the chart
      if (!this.hasAllOptions) {
        return;
      }

      let options = {
        centromeres: this.centromeres,
        bands: this.bands
      }
      //remove anything from the container
      this.circosChart = new svCircos(containerTag, this.chromosomes, this.svList, options)

      //if we dont have the data we need (vcfData), dont draw the circos
      if (!this.svList) {
        return;
      }

      container.node().appendChild(this.circosChart);
    }
  },
  computed: {
    hasAllOptions() {
      return this.centromeres && this.svList && this.bands && this.chromosomes
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