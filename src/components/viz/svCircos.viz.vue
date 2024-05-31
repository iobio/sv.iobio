<template>
    <div id="svCircos"></div>
</template>

<script>
import svCircos from '../../d3/svCircos.js';
import * as d3 from 'd3';

export default {
  name: 'svCircos',
  components: {
  },
  props: {
    svList: Array,
    zoomZone: Object,
    focusedVariant: Object,
    needsFocus: Boolean,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    batchNum: Number,
    vcfDataPro: Array,
    vcfDataPar1: Array,
    vcfDataPar2: Array,
    centromeres: Array,
    bands: Array,
    chromosomes: Array,
    genes: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      circosChart: null,
    }
  },
  mounted () {
    if (this.chromosomes) {
      this.resizeObserver = new ResizeObserver( () => {
        setTimeout(() => {
          this.drawCircos()
        }, 550)
      });

      this.resizeObserver.observe(document.getElementById('svCircos'));
    }
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
        bands: this.bands,
        zoomZone: this.zoomZone,
        zoomCallback: this.emitZoomEvent,
      }

      if (this.needsFocus && this.focusedVariant) {
        options.focusedVariant = this.focusedVariant
      }

      if (this.genes) {
        options.genes = this.genes

        if (this.genesOfInterest) {
          options.genesOfInterest = this.genesOfInterest.map(gene => this.genes[gene])
          options.genesOfInterest.filter(gene => gene !== undefined);
        }
        if (this.phenRelatedGenes) {
          options.phenRelatedGenes = this.phenRelatedGenes.map(gene => this.genes[gene])
          options.phenRelatedGenes.filter(gene => gene !== undefined);
        }
      }
      
      if (this.vcfDataPar1) {
        options.parent1Data = this.vcfDataPar1
      }
      if (this.vcfDataPar2) {
        options.parent2Data = this.vcfDataPar2
      }

      //remove anything from the container
      this.circosChart = new svCircos(containerTag, this.chromosomes, this.svListSorted, options)

      //if we dont have the data we need (vcfData), dont draw the circos
      if (!this.svListSorted) {
        return;
      }

      if (container.node() && this.circosChart) {
        container.node().appendChild(this.circosChart);
      }
    },
    emitZoomEvent(zoomLevel) {
      this.$emit('circos-zoom-event', zoomLevel)
    }
  },
  computed: {
    hasAllOptions() {
      return this.centromeres && (this.svListSorted && this.svListSorted.length > 0) && this.bands && this.chromosomes && this.genes
    }, 
    svListSorted() {
      //sorted by chromosome and start
      return [...this.svList].sort((a, b) => {
        if (a.chromosome === b.chromosome) {
          return a.start - b.start
        } else {
          return a.chromosome - b.chromosome
        }
      })
    }
  },
  watch: {
    hasAllOptions: function() {
      this.drawCircos()
    },
    zoomZone: function() {
      this.drawCircos()
    }, 
    needsFocus: function() {
      if (this.needsFocus && this.focusedVariant) {
        this.drawCircos()
      }
    },
    genesOfInterest: function(){
      this.drawCircos()
    },
    batchNum: function() {
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
    box-sizing: border-box
    display: flex
    flex-direction: column
    flex-grow: 1
    justify-content: center
    width: 100%
</style>