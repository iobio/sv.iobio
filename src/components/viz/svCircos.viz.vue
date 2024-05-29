<template>
    <div id="svCircos"></div>
</template>

<script>
import svCircos from '../../d3/svCircos.js';
import Sv from '../../models/Sv.js';
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
  },
  data () {
    return {
      vcfDataPro: null,
      vcfDataPar1: null,
      vcfDataPar2: null,
      vcfAltCallerData: null,
      circosChart: null,
      centromeres: null,
      bands: null,
      chromosomes: null,
      genes: null,
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
            setTimeout(() => {
              this.drawCircos()
            }, 550)
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
    
    //fetch all the genes for the circos chart
    fetch('http://localhost:3000/genes?build=hg38&source=refseq')
      .then(response => response.json())
      .then(data => {
        this.genes = data;
        //there are about 28k genes
      });

    // //fetch the vcf data
    // fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-01_svafotate_output.filteredaf.vcf.gz')
    //   .then(response => response.json())
    //   .then(data => {
    //     this.vcfDataPro = data;
    //     console.log('vcfData', this.vcfDataPro)
    //   });
    //fetch the vcf data
    fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-02_svafotate_output.filteredaf.vcf.gz')
      .then(response => response.json())
      .then(data => {
        this.vcfDataPar1 = data.map(item => new Sv(item)); 
      });  
    //fetch the vcf data
    fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-03_svafotate_output.filteredaf.vcf.gz')
      .then(response => response.json())
      .then(data => {
        this.vcfDataPar2 = data.map(item => new Sv(item)); 
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
      if (this.vcfAltCallerData) {
        options.altCallerData = this.vcfAltCallerData
      }

      //remove anything from the container
      this.circosChart = new svCircos(containerTag, this.chromosomes, this.svListSorted, options)

      //if we dont have the data we need (vcfData), dont draw the circos
      if (!this.svListSorted) {
        return;
      }

      container.node().appendChild(this.circosChart);
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
    height: 100%
    justify-content: center
    width: 100%
</style>