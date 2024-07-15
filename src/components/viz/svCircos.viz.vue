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
    probandName: {
      type: String,
      default: 'Proband'
    },
    zoomZone: Object,
    genesOfInterest: Array,
    phenRelatedGenes: Array,
    batchNum: Number,
    samples: Array,
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
      let debouncedDraw = this.debounce(this.drawCircos, 100);
      this.resizeObserver = new ResizeObserver( () => {
        debouncedDraw();
      });

      this.resizeObserver.observe(document.getElementById('svCircos'));
    }
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(document.getElementById('svCircos'));
  },
  methods: {
    debounce(func, delay) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    },
    async drawCircos() {
      let containerTag = '#svCircos';
      let container = d3.select(containerTag);
      if (!container.node()) {
        return;
      }
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
        probandName: this.probandName,
        sampleNames: this.samples && this.samples.length > 0 && this.samples.map(sample => sample.props.title) || [],
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

      if (this.samples && this.samples.length > 0) {
        options.sampleLists = this.samples.map(sample => sample.props.svList)
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
      this.$emit('selectAreaEvent', zoomLevel)
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
    hasAllOptions: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.drawCircos()
      }
    },
    zoomZone: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.drawCircos()
      } 
    }, 
    genesOfInterest: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.drawCircos()
      }
    },
    batchNum: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.drawCircos()
      }
    },
    samples: function(newVal, oldVal) {
      if (newVal) {
        this.drawCircos()
      }
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