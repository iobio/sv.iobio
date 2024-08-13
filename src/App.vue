<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar
        :selectDataOpen="selectDataSectionOpen"
        :filterDataOpen="filterDataSectionOpen"
        :loaded="loadedInitiallyComplete"
        :progressPercent="progressPercent"
        :goiFromParent="genesOfInterest"
        @toggleSelectDataSection="selectDataSectionOpen = !selectDataSectionOpen; filterDataSectionOpen = false"
        @toggleFilterDataSection="filterDataSectionOpen = !filterDataSectionOpen; selectDataSectionOpen = false" 
        @updateGenesOfInterest="updateGenesOfInterest"
        @updatePhenotypesOfInterest="updatePhenotypesOfInterest"/>
    </div>

    <ToastsSection
      v-if="toasts.length > 0"
      :toasts="toasts"
      @remove-toast="removeToast"
      @remove-all-toasts="removeAllToasts"/>

    <SelectDataSection 
    :show="selectDataSectionOpen"
    :samples="samples"
    @update-samples="updateSamples"
    @toggle-show="selectDataSectionOpen = false"
    @emit-toast="addToast"/>

    <FilterDataSection 
    :show="filterDataSectionOpen"
    :filters="filters"
    :loaded="loadedInitiallyComplete"
    :probQualityStats="qualityStats.proband"
    @toggleFilterDataSection="filterDataSectionOpen = false"
    @updateFilters="updateDataFilters"/>

    <div id="lower-block-container">
      <div id="var-list-bar-button-container" :class="{collapsed: !variantListBarOpen}">
        <nav class="tab-select" :class="{collapsed: !variantListBarOpen}">
          <div class="tab" :class="{selected: selectedTab == 'svList'}" @click="selectedTab = 'svList'">SV List</div>
          <div class="tab" :class="{selected: selectedTab == 'goi'}" @click="selectedTab = 'goi'" v-if="genesOfInterest.length > 0">Genes Of Interest</div>
        </nav>

        <button id="var-list-bar-toggle-btn" @click="variantListBarOpen = !variantListBarOpen">
          <img v-if="variantListBarOpen" src="/arrow-expand-left.svg" alt="close">
          <img v-else src="/arrow-expand-right.svg" alt="open">
        </button>

        <VariantListBar 
          v-if="selectedTab == 'svList'"
          :svList="svListVariantBar"
          :patientPhenotypes="phenotypesOfInterest"
          :geneCandidates="genesOfInterest"
          :loading="!loadedInitiallyComplete"
          :sorted="variantsSorted"
          @updateSvAtIndex="updateSvList"
          @variant-clicked="updateFocusedVariant"
          @sort-variants="sortSvList"/>

        <GenesOfInterestListBar
          v-if="selectedTab == 'goi'"
          :genesOfInterest="genesOfInterest"
          @remove-gene-from-goi="removeGeneFromGeneList"
          @zoom-to-gene="zoomToGene"/>
      </div>

      <LeftTracksSection
        :samples="samples" 
        :svList="svListChart"
        :selectedArea="selectedArea"
        :focusedVariant="focusedVariant"
        :genesOfInterest="genesOfInterest"
        :phenRelatedGenes="overlappedPhenGenes"
        :batchNum="batchNum"
        :multiSampleVcf="multiSampleVcf"
        :focusedGeneName="focusedGeneName"
        @updateComparisons="updateComparisons"
        @zoomEvent="zoomFired"/>

    </div>

  </div>
</template>

<script>
  import * as dataHelper from './dataHelpers/dataHelpers.js';
  import LeftTracksSection from './components/LeftTracksSection.vue';
  import VariantListBar from './components/VariantListBar.vue';
  import GenesOfInterestListBar from './components/GenesOfInterestListBar.vue';
  import NavBar from './components/NavBar.vue';
  import Sv from './models/Sv.js'
  import SelectDataSection from './components/SelectDataSection.vue'
  import FilterDataSection from './components/FilterDataSection.vue'
  import ToastsSection from './components/ToastsSection.vue'

  export default {
    name: 'app',
    components: {
      LeftTracksSection,
      VariantListBar,
      GenesOfInterestListBar,
      NavBar,
      SelectDataSection,
      FilterDataSection,
      ToastsSection,
    },
    data() {
      return {
        selectedTab: 'svList',
        svListData: [],
        svListChart: [],
        svListVariantBar: [],
        loadedInitiallyComplete: false,
        progressPercent: 0,
        focusedVariant: null,
        focusedGeneName: null,
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
          geneOverlap: false,
          qualityCutOff: 0,
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
          comparisons: []
        },
        toasts: [],
        multiSampleVcf: false,
        variantsSorted: false,
        qualityStats: {},
        variantsFilteredOut: [],
      }
    },
    async mounted() {
      //open the select data section by default
      this.selectDataSectionOpen = true;
    },
    methods: {
      removeGeneFromGeneList(gene) {
        let newGenes = this.genesOfInterest.filter(g => g !== gene);
        this.updateGenesOfInterest(newGenes);
      },
      async loadData(isMultiple=false) {
        if (this.samples.proband.vcf == '') {
          //open the select data section too
          this.selectDataSectionOpen = true;
          return;
        }
        this.progressPercent = 0;
        this.interestStopIndex = 0;
        this.loadedInitiallyComplete = false;

        let url = this.samples.proband.vcf;
        let svList; 
        
        try {
          if (!isMultiple) {
            svList = await dataHelper.getSVsFromVCF(url);
          } else {
            svList = await dataHelper.getSVsFromVCF(url, this.samples.proband.id)
          }

          if (svList.length == 0) {
            this.toasts.push({message: `No svs found in vcf ${url}`, type: 'warning'})
            return;
          }

        } catch (error) {
          svList = [];
          
          this.toasts.push({message: `Error loading proband svs: ${error}`, type: 'error'})
          return;
        }
        
        //We use a separate list for the variant bar so we can sort it differently
        this.svListVariantBar = svList.map(sv => new Sv(sv));
        this.svListData = svList;
        this.variantListBarOpen = true;

        //We use a separate list for the chart so we can sort it differently
        this.svListChart = svList.map(sv => new Sv(sv));
        this.samples.proband.svList = this.svListChart;

        //Copying the bar list so we can sort it in batches and get information about the overlapped genes
        let svListCopy = [...this.svListVariantBar];

        //the batch size we will send SVs in to get their associations
        let batchSize = 200;
        for (let i = 0; i < svListCopy.length; i += batchSize) {;
          this.batchNum++;
          let batchSvs = svListCopy.slice(i, i + batchSize);

          let newSvs; 
          
          try{
            newSvs = await this.getSVAssociations(batchSvs);

            if (newSvs.length == 0) {
              this.toasts.push({message: 'No SVs found in proband VCF', type: 'error'})
              return;
            }

          } catch (error) {

            newSvs = [];
            this.toasts.push({message: `Error getting SV associations: ${error}`, type: 'error'})
            return;
          }

          //new svs is an array of Sv objects
          for (let [index, newSv] of newSvs.entries()) {
            let originalIndex = i + index; // Calculate the original index
              // Update the current index with the new SV

              //If we have both phenotypes of interest and overlappedGenes we can see how many phenotypes are accounted for
              if (this.phenotypesOfInterest && this.phenotypesOfInterest.length > 0 && newSv.overlappedGenes && Object.values(newSv.overlappedGenes).length > 0) {
                let num = this.numPhensAccountedFor(this.phenotypesOfInterest, newSv.overlappedGenes);

                //----------------SORTING------------------------------------//
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
                //if there are no overlappedGenes send to the bottom
                this.svListVariantBar[originalIndex] = newSv;
              }
          }
          this.progressPercent = Math.round((i + batchSize) / svListCopy.length * 100);
        }
        this.loadedInitiallyComplete = true;
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
        //Filters, essentially shouldn't need to make additional calls to the server
        if (filters.geneOverlap !== this.filters.geneOverlap || filters.qualityCutOff !== this.filters.qualityCutOff) {
          this.filters = filters;
        } else {
          return;
        }

        let allSVs = this.svListVariantBar.concat(this.variantsFilteredOut);
        let newSVs = [];
        let newFilteredOut = [];
        let filterApplied = false;

        if (filters.geneOverlap) {
          newSVs = allSVs.filter(sv => Object.values(sv.overlappedGenes).length > 0);
          newFilteredOut = allSVs.filter(sv => Object.values(sv.overlappedGenes).length == 0);
          filterApplied = true;
        }

        if (filters.qualityCutOff > 0) {
          if (!filters.geneOverlap) {
            newSVs = allSVs.filter(sv => Number(sv.quality) >= filters.qualityCutOff);
            newFilteredOut = allSVs.filter(sv => Number(sv.quality) < filters.qualityCutOff);
          } else {
            newSVs = newSVs.filter(sv => Number(sv.quality) >= filters.qualityCutOff);
            newFilteredOut.concat(newSVs.filter(sv => Number(sv.quality) < filters.qualityCutOff));
          }
          filterApplied = true;
        }

        if (!filterApplied) {
          newSVs = allSVs;
          newFilteredOut = []; 
        }

        this.svListVariantBar = newSVs;
        this.svListChart = this.svListVariantBar;
        this.variantsFilteredOut = newFilteredOut;
      },
      hasPhenotypes(overlappedGenes) {
        /**
         * Returns true if any of the overlappedGenes have phenotypes
         */
        return Object.values(overlappedGenes).some(gene => Object.keys(gene.phenotypes) && Object.keys(gene.phenotypes).length > 0);
      },
      async updateSamples(samples, isMultiple=false) {
        this.multiSampleVcf = isMultiple;
        //if samples @ 0 is the same as the old samples @ 0 then we dont need to load data again but 
        //if the vcf is different we do
        if (samples.proband.vcf == this.samples.proband.vcf) {
          let svListTemp = this.samples.proband.svList;
          this.samples.proband = samples.proband;
          this.samples.proband.svList = svListTemp;
          this.samples.comparisons = samples.comparisons;
          return;
        } else {
          this.samples.proband = samples.proband;
          this.loadData(this.multiSampleVcf);
        }
        this.samples.comparisons = samples.comparisons;
        
        if (!isMultiple) {
          this.qualityStats.proband = await dataHelper.getQualityFromVCF(samples.proband.vcf);
        } else {
          this.qualityStats.proband = await dataHelper.getQualityFromVCF(samples.proband.vcf, samples.proband.id);
        }
      },
      async getSVAssociations(variantBatch, build='hg38', source='refseq') {

        let svs;
        try {
          svs = await dataHelper.getSVBatchInfo(variantBatch, build, source);

          if (svs.length == 0) {
            this.toasts.push({message: `No SV associations for the variant batch`, type: 'error'})
            return;
          }
        } catch (error) {
          svs = [];
          this.toasts.push({message: `Error getting SV associations: ${error}`, type: 'error'})
          return;
        }

        let updatedSvs = [];

        for (let sv of svs) {
          //turn the sv into a Sv object we will have our overlappedgenes
          let updatedVariant = new Sv(sv);

          //Checks for overlap with genes of interest in the overlappedGenes(sv)
          if (this.genesOfInterest && this.genesOfInterest.length > 0) {
            let geneSet = new Set(Object.keys(updatedVariant.overlappedGenes));
            let genesInCommon = this.genesOfInterest.filter(geneSymbol => geneSet.has(geneSymbol));
            updatedVariant.genesInCommon = genesInCommon;
          } else {
            updatedVariant.genesInCommon = [];
          }

          if (this.candidatePhenGenes && this.candidatePhenGenes.length > 0) {
            //essentially if the gene didnt have phenotypes when we checked earlier we want a chance to update it and the overlappedPhenGenes
            let geneSet = new Set(Object.keys(updatedVariant.overlappedGenes));
            let genesInCommon = this.candidatePhenGenes.filter(geneSymbol => geneSet.has(geneSymbol));
            updatedVariant.overlappedPhenGenes = genesInCommon;
            this.overlappedPhenGenes.push(...genesInCommon);
            this.overlappedPhenGenes = [...new Set(this.overlappedPhenGenes)];
          } else {
            //if we dont have candidatePhenGenes then we dont need to update overlappedPhenGenes
            updatedVariant.overlappedPhenGenes = [];
          }

          updatedSvs.push(updatedVariant);
        }
        (updatedSvs)
        return updatedSvs;
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
      async updatePhenotypesOfInterest(newPOI) {
        /**
         * Updates the phenotypes of interest
         * 
         * Phenotypes of interest are used to determine which SVs are displayed first so
         * if this list changes we need to update the SVs.
         */

        if (newPOI.length == this.phenotypesOfInterest.length && newPOI.every((v, i) => v === this.phenotypesOfInterest[i])){
          return;
        }
        
        this.variantsSorted = false;
        this.phenotypesOfInterest = newPOI;

        //If we have some phenotypes of interest we want to get any associated genes
        let hpoIds = newPOI.join(',');
        let data; 
        try {
          data = await dataHelper.getGenesForPhenotypes(hpoIds);
        } catch (error) {
          data = {};
          this.toasts.push({message: `Error getting genes for phenotypes: ${error}`, type: 'error'})
          return;
        }

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
      maxSingPhenotypesOverlapped(phenotypesOfInterest, variant) {
        if (phenotypesOfInterest.length > 0 && variant.overlappedGenes && Object.values(variant.overlappedGenes).length > 0) {
            let maxPercent = 0;
            for (let gene of Object.values(variant.overlappedGenes)) {
                let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => phenotypesOfInterest.includes(phenotype))
                let percent = inCommonPhens.length / phenotypesOfInterest.length * 100
                if (percent > maxPercent) {
                    maxPercent = percent
                }
            }
            return maxPercent
        } else {
            return 0;
        }
      },
      numOfGOIOverlapped(genesOfInterest, variant) {
        if (genesOfInterest && genesOfInterest.length > 0) {
            //how many of the overlapped genes are in the geneCandidates
            let goiOL = 0;
            for (let gene of Object.values(variant.overlappedGenes)) {
                if (genesOfInterest.includes(gene.gene_symbol)) {
                  goiOL += 1
                }
            }
            return goiOL
        } else {
            return 0
        }
      },
      updateSvList(index, sv) {
        this.svListVariantBar[index] = sv;
      },
      removeToast(index) {
        this.toasts.splice(index, 1)
      },
      removeAllToasts() {
        this.toasts = []
      },
      addToast(toast) {
        this.toasts.push(toast)
      },
      updateComparisons(comparisons) {
        this.samples.comparisons = comparisons;
      },
      sortSvList(sortCategory) {
        if (sortCategory == 'genesOverlapped') {
          this.svListVariantBar.sort((a, b) => {
            return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
          })
          this.variantsSorted = true;
        } else if (sortCategory == 'percentOverlapped') {
          if (!this.phenotypesOfInterest || this.phenotypesOfInterest.length == 0) {
            this.toasts.push({message: 'No patient phenotypes to sort by, sorting by number of genes overlapped.', type: 'info'})
            
            this.svListVariantBar.sort((a, b) => {
              return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
            })
            this.variantsSorted = true;
          } else {
            this.svListVariantBar.sort((a, b) => {
              return this.maxSingPhenotypesOverlapped(this.phenotypesOfInterest, b) - this.maxSingPhenotypesOverlapped(this.phenotypesOfInterest, a);
            })
            this.variantsSorted = true;
          }
        } else if (sortCategory == 'goi') {
          if (!this.genesOfInterest || this.genesOfInterest.length == 0) {
            this.toasts.push({message: 'No genes of interest to sort by, sorting by number of genes overlapped.', type: 'info'})
            
            this.svListVariantBar.sort((a, b) => {
              return Object.keys(b.overlappedGenes).length - Object.keys(a.overlappedGenes).length;
            })
            this.variantsSorted = true;
          } else {
            this.svListVariantBar.sort((a, b) => {
              return this.numOfGOIOverlapped(this.genesOfInterest, b) - this.numOfGOIOverlapped(this.genesOfInterest, a);
            })
          } 
        }
      },
      zoomToGene(gene) {
        this.focusedGeneName = gene;
      }
    },
    watch: {
      samples: {
        handler(newVal, oldVal) {
          if (newVal.proband.vcf !== oldVal.proband.vcf) {
            this.loadData(this.multiSampleVcf);
          }
        },
        deep: true
      },
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
    max-width: 500px
    transition: width 0.4s, min-width 0.4s
    .tab-select
      display: flex
      justify-content: flex-start
      padding: 5px 0px 0px 0px
      color: #084D9B
      border-bottom: 5px solid #CADEF7
      &.collapsed
        border-bottom: 0px
        width: 0px
        min-width: 0px
        overflow: hidden
      .tab
        padding: 5px 10px
        margin: 0px
        border-radius: 5px 5px 0px 0px
        background-color: #FFD6D6
        color: #A30000
        &.selected
          background-color: #CADEF7
          color: #084D9B
        &:hover
          cursor: pointer
          background-color: #D8E9FD
          color: #084D9B
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