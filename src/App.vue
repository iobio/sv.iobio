<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar
        @toggleSelectDataSection="selectDataSectionOpen = !selectDataSectionOpen; filterDataSectionOpen = false"
        @toggleFilterDataSection="filterDataSectionOpen = !filterDataSectionOpen; selectDataSectionOpen = false" 
        @updateGenesOfInterest="updateGenesOfInterest"
        @updatePhenotypesOfInterest="updatePhenotypesOfInterest"/>
    </div>

    <SelectDataSection 
    :show="selectDataSectionOpen"
    :samples="samples"
    @update-samples="updateSamples"
    @toggle-show="selectDataSectionOpen = false"/>

    <FilterDataSection 
    :show="filterDataSectionOpen"
    :filters="filters"
    @toggleFilterDataSection="filterDataSectionOpen = false"
    @updateFilters="updateDataFilters"/>

    <div id="lower-block-container">
      <div id="var-list-bar-button-container" :class="{collapsed: !variantListBarOpen}">
        <button id="var-list-bar-toggle-btn" @click="variantListBarOpen = !variantListBarOpen">
          <img v-if="variantListBarOpen" src="/arrow-expand-left.svg" alt="close">
          <img v-else src="/arrow-expand-right.svg" alt="open">
        </button>
        <VariantListBar 
        :svList="svListVariantBar"
        :patientPhenotypes="phenotypesOfInterest"
        @updateSvAtIndex="updateSvList"
        @variant-clicked="updateFocusedVariant"/>
      </div>

      <LeftTracksSection
        :samples="samples" 
        :svList="svListChart"
        :selectedArea="selectedArea"
        :focusedVariant="focusedVariant"
        :genesOfInterest="genesOfInterest"
        :phenRelatedGenes="overlappedPhenGenes"
        :batchNum="batchNum"
        @zoomEvent="zoomFired"/>

    </div>

  </div>
</template>

<script>
  import LeftTracksSection from './components/LeftTracksSection.vue';
  import VariantListBar from './components/VariantListBar.vue';
  import NavBar from './components/NavBar.vue';
  import Sv from './models/Sv.js'
  import SelectDataSection from './components/SelectDataSection.vue'
  import FilterDataSection from './components/FilterDataSection.vue'

  export default {
    name: 'app',
    components: {
      LeftTracksSection,
      VariantListBar,
      NavBar,
      SelectDataSection,
      FilterDataSection,
    },
    data() {
      return {
        svListChart: [],
        svListVariantBar: [],
        focusedVariant: null,
        selectedArea: null,
        variantListBarOpen: false,
        genesOfInterest: [],
        phenotypesOfInterest: [],
        candidatePhenGenes: [],
        overlappedPhenGenes: [],
        batchNum: 0,
        interestStopIndex: 0, //Used to keep track of how many SVs have been moved to the front
        selectDataSectionOpen: false,
        filterDataSectionOpen: false,
        filters: {
          geneOverlap: false
        },
        samples: {
          proband: {
            name: 'Proband',
            vcf: '',
            tbi: '',
            bam: '',
            bai: '',
            svList: [],
          },
          comparrisons: []
        }
      }
    },
    async mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        if (this.samples.proband.vcf == '') {
          //open the select data section too
          this.selectDataSectionOpen = true;
          return;
        }
        let url = this.samples.proband.vcf;
        let svListRes = await fetch('http://localhost:3000/dataFromVcf?vcfPath=' + url);
        let svList = await svListRes.json();

        this.svListVariantBar = svList.map(sv => new Sv(sv));
        this.variantListBarOpen = true;

        this.svListChart = svList.map(sv => new Sv(sv));
        this.samples.proband.svList = this.svListChart;

        let svListCopy = [...this.svListVariantBar];
        let batchSize = 200;

        for (let i = 0; i < svListCopy.length; i += batchSize) {
          this.batchNum++;
          let batchSvs = svListCopy.slice(i, i + batchSize);

          let batchPromises = await Promise.all(batchSvs.map(sv => this.getOverlappedGenes(sv)));

          for (let [index, newSv] of batchPromises.entries()) {
            let originalIndex = i + index; // Calculate the original index
              // Update the current index with the new SV

              //If we have both phenotypes of interest and overlappedGenes we can see how many phenotypes are accounted for
              if (this.phenotypesOfInterest && this.phenotypesOfInterest.length > 0 && newSv.overlappedGenes && Object.values(newSv.overlappedGenes).length > 0) {
                let num = this.numPhensAccountedFor(this.phenotypesOfInterest, newSv.overlappedGenes);

                //----------------SORTING------------------------------------//
                /**
                 * If the number is greater than zero and the index is greater than the interestStopIndex we can move to top and increment the interestStopIndex
                 * If the number is greater than zero and the index is the same as the interestStopIndex we just increment the interestStopIndex
                 */
                if (num > 0) {
                  if (originalIndex > this.interestStopIndex) {
                    let temp = this.svListVariantBar[this.interestStopIndex];
                    this.svListVariantBar[this.interestStopIndex] = newSv;
                    this.svListVariantBar[originalIndex] = temp;

                    this.interestStopIndex++;
                  } else if (originalIndex == this.interestStopIndex) {
                    this.interestStopIndex++;
                  } 
                } else {
                  this.svListVariantBar[originalIndex] = newSv;
                }
              } else {
                this.svListVariantBar[originalIndex] = newSv;
              }
          }
        }
      },
      updateFocusedVariant(variant, flag) {
        if (this.focusedVariant === variant) {
          this.focusedVariant = null
        } else if (this.focusedVariant !== variant && flag == 'hide') {
          //dont change focused variant
        } else {
          this.focusedVariant = variant
        }
      },
      updateDataFilters(filters) {
        this.filters = filters
      },
      hasPhenotypes(overlappedGenes) {
        /**
         * Returns true if any of the overlappedGenes have phenotypes
         */

        return Object.values(overlappedGenes).some(gene => Object.keys(gene.phenotypes) && Object.keys(gene.phenotypes).length > 0);
      },
      async updateSamples(samples) {
        //if samples @ 0 is the same as the old samples @ 0 then we dont need to load data again but 
        //if the vcf is different we do
        if (samples.proband.vcf == this.samples.proband.vcf) {
          let svListTemp = this.samples.proband.svList;
          this.samples.proband = samples.proband;
          this.samples.proband.svList = svListTemp;
          this.samples.comparrisons = samples.comparrisons;
          return;
        } else {
          this.samples.proband = samples.proband;
          this.loadData();
        }
        this.samples.comparrisons = samples.comparrisons;
      },
      async getOverlappedGenes(variant) {
        /**
         * Fetches the overlapped genes for a given variant
         */

        let updatedVariant = {...variant}

        let genesJson = await fetch(`http://localhost:3000/genes/region?build=hg38&source=refseq&startChr=${'chr'+variant.chromosome}&startPos=${variant.start}&endChr=${'chr'+variant.chromosome}&endPos=${variant.end}`);
        let genesData = await genesJson.json();
        let overlappedGenes = genesData;

        if (this.genesOfInterest && this.genesOfInterest.length > 0) {
          let geneSet = new Set(Object.keys(overlappedGenes));
          let genesInCommon = this.genesOfInterest.filter(geneSymbol => geneSet.has(geneSymbol));
          updatedVariant.genesInCommon = genesInCommon;
        } else {
          updatedVariant.genesInCommon = [];
        }

        if (this.candidatePhenGenes && this.candidatePhenGenes.length > 0) {
          //essentially if the gene didnt have phenotypes when we checked earlier we want a chance to update it and the overlappedPhenGenes
          let geneSet = new Set(Object.keys(overlappedGenes));
          let genesInCommon = this.candidatePhenGenes.filter(geneSymbol => geneSet.has(geneSymbol));
          updatedVariant.overlappedPhenGenes = genesInCommon;
          this.overlappedPhenGenes.push(...genesInCommon);
          this.overlappedPhenGenes = [...new Set(this.overlappedPhenGenes)];
        } else {
          //if we dont have candidatePhenGenes then we dont need to update overlappedPhenGenes
          updatedVariant.overlappedPhenGenes = [];
        }

        if (Object.keys(overlappedGenes).length == 0) {
          updatedVariant.overlappedGenes = overlappedGenes;
          return updatedVariant;
        }

        let overlappedGenesKeys = Object.keys(overlappedGenes);
        let batchSize = 200;

        for (let i = 0; i < overlappedGenesKeys.length; i += batchSize) {
          let batch = overlappedGenesKeys.slice(i, i + batchSize);
          let batchString = batch.join(',');

          let associationsRes = await fetch(`http://localhost:3000/geneAssociations?genes=${batchString}`);
          let { phenToGene, diseaseToGene } = await associationsRes.json();

          //Nested for but because I'm only iterating over a limited and sliced set we should be okay
          for (let gene_symbol of batch ) {
            let gene = overlappedGenes[gene_symbol];

            //Phenotypes
            if (!phenToGene.hasOwnProperty(gene_symbol)) {
              gene.phenotypes = {};
              gene.phensInCommon = [];
            } else {
              gene.phenotypes = phenToGene[gene_symbol];
              if (this.patientPhenotypes && this.patientPhenotypes.length < 0 ) {
                //If this turns out to be very unbalenced we could check to see which was shorter
                let phenotypeSet = new Set(Object.keys(gene.phenotypes));
                gene.phenotypesInCommon = this.patientPhenotypes.filter(hpoId => phenotypeSet.has(hpoId));
              }
            }

            //Diseases
            if (!diseaseToGene.hasOwnProperty(gene_symbol)) {
              gene.diseases = {};
            } else {
              gene.diseases = diseaseToGene[gene_symbol]
            }
          }
        }
        updatedVariant.overlappedGenes = overlappedGenes;
        return updatedVariant;
      },
      areaSelected(selectedArea) {
        this.selectedArea = selectedArea
      },
      zoomFired(zoomZone) {
        this.selectedArea = zoomZone
      }, 
      updateGenesOfInterest(newGOI) {
        /**
         * Updates the genes of interest
         * 
         * Genes of interest are used to determine which SVs are displayed first so
         * if this list changes we need to update the SVs.
         */

        if (newGOI.length == this.genesOfInterest.length && newGOI.every((v, i) => v === this.genesOfInterest[i])) {
          return;
        }
        
        this.genesOfInterest = newGOI;

        //Iterate over the svListChart and update the genesInCommon given the new genesOfInterest
        this.svListVariantBar.forEach((sv, index) => {

          //If an sv has a list of overlapped genes to look at then check them against the genesOfInterest
          if (sv?.overlappedGenes && Object.keys(sv.overlappedGenes).length > 0){
            let geneSet = new Set(Object.keys(sv.overlappedGenes));
            let genesInCommon = this.genesOfInterest.filter(geneSymbol => geneSet.has(geneSymbol));
            sv.genesInCommon = genesInCommon;
          } else if (!sv.overlappedGenes) {
            sv.genesInCommon = [];
          }
        })
      },
      updatePhenotypesOfInterest(newPOI) {
        /**
         * Updates the phenotypes of interest
         * 
         * Phenotypes of interest are used to determine which SVs are displayed first so
         * if this list changes we need to update the SVs.
         */

        this.phenotypesOfInterest = newPOI;
        if (newPOI == this.phenotypesOfInterest) {
          return;
        }

        //If we have some phenotypes of interest we want to get any associated genes
        let hpoIds = newPOI.join(',');
        fetch(`http://localhost:3000/phenotypeGenes?phenotypes=${hpoIds}`)
          .then(res => res.json())
          .then(data => {
            //we are getting an object but we just want the list of the keys
            this.candidatePhenGenes = Object.keys(data);
            let overlappedLocal = [];

            //We will iterate over the svListChart and update the overlappedPhenGenes for each SV
            this.svListVariantBar.forEach((sv, index) => {

              //If an sv already has overlappedGenes calculated we can check them against the candidatePhenGenes to get the phenGenes that have some overlap with the sv
              if (sv?.overlappedGenes && Object.keys(sv.overlappedGenes).length > 0){
                let geneSet = new Set(Object.keys(sv.overlappedGenes));
                let candidateGenesOverlapped = this.candidatePhenGenes.filter(geneSymbol => geneSet.has(geneSymbol));
                sv.overlappedPhenGenes = candidateGenesOverlapped;
                overlappedLocal.push(...candidateGenesOverlapped);

                //if we do have overlapped genes and now we have phentypes of interest we can check the accounted for
                if (this.phenotypesOfInterest && this.phenotypesOfInterest.length > 0) {
                  let num = this.numPhensAccountedFor(this.phenotypesOfInterest, sv.overlappedGenes);

                  //----------------SORTING------------------------------------//
                  /**
                   * If the number is greater than zero and the index is greater than the interestStopIndex we can move to top and increment the interestStopIndex
                   * If the number is greater than zero and the index is the same as the interestStopIndex we just increment the interestStopIndex
                   */
                  if (num > 0) {
                    if (index > this.interestStopIndex) {
                      let temp = this.svListVariantBar[this.interestStopIndex];
                      this.svListVariantBar[this.interestStopIndex] = sv;
                      this.svListVariantBar[index] = temp;

                      this.interestStopIndex++;
                    } else if (index == this.interestStopIndex) {
                      this.interestStopIndex++;
                    } 
                  }
                }

              } else if (!sv.overlappedGenes || Object.keys(sv.overlappedGenes).length == 0) {
                sv.overlappedPhenGenes = [];
              } 
            })

            //update our list of overlappedPhenGenes
            this.overlappedPhenGenes = [...new Set(overlappedLocal)];
            //the value of the batchNum is not important but we need to update it to trigger a re-render so either this finishes or every 200 SVs
            this.batchNum = 0;
          })
      },
      numPhensAccountedFor(patientPhenotypes, overlappedGenes) {
        //if there are patient phenotypes we can see how many of the overlapped phenotypes are accounted for
        if (patientPhenotypes && patientPhenotypes.length > 0 && overlappedGenes && Object.values(overlappedGenes).length > 0) {
            let inCommonOverlappedPhens = [];
            for (let gene of Object.values(overlappedGenes)) {
                inCommonOverlappedPhens.push(...Object.keys(gene.phenotypes).filter(phenotype => patientPhenotypes.includes(phenotype)))
            }
            inCommonOverlappedPhens = new Set(inCommonOverlappedPhens)
            return inCommonOverlappedPhens.size;
        } else {
            return 0;
        } 
      },
      updateSvList(index, sv) {
        console.log(sv)
        this.svListVariantBar[index] = sv;
      }
    },
    watch: {
      samples: {
        handler(newVal, oldVal) {
          if (newVal.proband.vcf !== oldVal.proband.vcf) {
            this.loadData();
          }
        },
        deep: true
      }
    },
  }

</script>

<style lang="sass">
  #logo-div 
    position: absolute
    right: 5px
    top: 0px
  
  #main-container 
    box-sizing: border-box
    display: flex
    flex-direction: column
    height: 100vh
    width: 100%

  #upper-bar-container
    display: flex
    flex-direction: column
    height: fit-content
    width: 100%

  #lower-block-container 
    display: flex
    flex-direction: row
    flex: 1 1 auto
    justify-content: center
    width: 100%
    box-sizing: border-box
    overflow: hidden

  img 
    height: 30px
    margin-right: 0px
    padding-right: 0px
    transform: translate(3px, 5px)
    width: 30px

  #var-list-bar-button-container
    position: relative
    height: 100%
    padding: 0px
    margin: 0px
    width: 25%
    min-width: 250px
    transition: width 0.4s, min-width 0.4s
    &.collapsed
      width: 0px
      min-width: 0px

  #var-list-bar-toggle-btn
    position: absolute
    bottom: 10px
    right: -35px
    z-index: 2
    padding: 3px
    margin: 0px
    border-radius: 50%
    opacity: 0.8
    display: flex
    justify-content: center
    align-items: center
    border: 2px solid #2A65B7
    background-color: #C1D1EA
    &:hover
      cursor: pointer
      opacity: 1
    img
      height: 23px
      width: 23px
      display: flex 
      justify-content: center
      align-items: center
      transform: translate(0px, 0px)
</style>