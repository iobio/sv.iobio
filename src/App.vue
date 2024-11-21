<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar
        :selectDataOpen="selectDataSectionOpen"
        :filterDataOpen="filterDataSectionOpen"
        :loaded="loadedInitiallyComplete"
        :progressPercent="progressPercent"
        :goiFromParent="genesOfInterest"
        :poiFromParent="phenotypesOfInterest"
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

    <div id="lower-block-container">
      <div id="var-list-bar-button-container" :class="{collapsed: !variantListBarOpen}">
        <FilterDataSection 
          :show="filterDataSectionOpen"
          :filters="filters"
          :loaded="loadedInitiallyComplete"
          :probQualityStats="qualityStats.proband"
          @toggleFilterDataSection="filterDataSectionOpen = false"
          @updateFilters="updateDataFilters"/>

        <div class="button-container">
            <div @click="showSortOptions = !showSortOptions" class="sort-btn">
                <div class="sort-options-popup" :class="{hidden: !showSortOptions}">
                    <span @click="sortSvList('goi')">Genes of Interest (GOI)</span>
                    <span @click="sortSvList('percentOverlapped')">Phenotypes % Max</span>
                    <span @click="sortSvList('genesOverlapped')"># Genes</span>
                </div>
                <svg class="sort-svg" v-if="loadedInitiallyComplete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Sort SVs</title>
                    <path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" />
                </svg>

                <svg class="loading-svg" v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>loading</title>
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
            </div>

            <div class="tab-select-wrapper">
                <nav class="tab-select" :class="{collapsed: !variantListBarOpen}">
                <div class="tab" :class="{selected: selectedTab == 'svList'}" @click="selectedTab = 'svList'">Variants</div>
                <div class="tab" :class="{selected: selectedTab == 'goi'}" @click="selectedTab = 'goi'" v-if="genesOfInterest.length > 0">Genes</div>
                </nav>
            </div>


            <div class="filter-button" @click="filterDataSectionOpen = !filterDataSectionOpen; selectDataSectionOpen = false">
                <svg v-if="loadedInitiallyComplete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>Filter SVs</title>
                <path d="M12 18.88A1 1 0 0 1 11.71 19.71A1 1 0 0 1 10.3 19.71L6.3 15.71A1 1 0 0 1 6 14.87V9.75L1.21 3.62A1 1 0 0 1 1.38 2.22A1 1 0 0 1 2 2H16A1 1 0 0 1 16.62 2.22A1 1 0 0 1 16.79 3.62L12 9.75V18.88M4 4L8 9.06V14.58L10 16.58V9.05L14 4M13 16L18 21L23 16Z" />
                </svg>

                <svg class="loading-svg" v-if="!loadedInitiallyComplete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>loading</title>
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
            </div>
        </div>


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
          :comparisonsLists="comparisonsLists"
          :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
          :overlapProp="overlapProp"
          :filters="filters"
          :focusedVariant="focusedVariant"
          @updateSvAtIndex="updateSvList"
          @variant-clicked="updateFocusedVariant"
          @sort-variants="sortSvList"/>

        <GenesOfInterestListBar
          v-if="selectedTab == 'goi'"
          :genesOfInterest="genesOfInterest"
          :zoomedGeneName="focusedGeneName"
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
        :focusedGeneName="focusedGeneName"
        :genomeEnd="genomeEnd"
        :genomeStart="genomeStart"
        @updateComparisons="updateComparisons"
        @zoomEvent="zoomFired"
        @update-comparison-lists="setComparisonSamples"
        @set-chromosome-accumulated-map="setChromosomeMap"/>

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
  import MosaicSession from './models/MosaicSession.js';

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
        genomeStart: 0,
        genomeEnd: 0,
        overlapProp: .8,
        selectedTab: 'svList',
        svListData: [],
        svListChart: [],
        svListVariantBar: [],
        comparisonsLists: [],
        showSortOptions: false,
        chromosomeAccumulatedMap: {},
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
          denovoOnly: false,
        },
        samples: {
          proband: {
            name: 'Proband',
            id: null,
            vcf: '',
            tbi: '',
            bam: '',
            bai: '',
            svList: [],
          },
          comparisons: []
        },
        toasts: [],
        variantsSorted: false,
        qualityStats: {},
        variantsFilteredOut: [],
        //Mosaic Session Items
        mosaicSession: null,
        mosaicUrlParams: null,
        mosaidProjectId: null,
        mosaicSampleId: null,
        mosaicExperimentId: null,
        validFromMosaic: true,
        mosaidVcfUrl: null,
      }
    },
    async mounted() {
        //this.selectDataSectionOpen = true;
        await this.initMosaicSession();
    },
    created() {
        this.mosaicUrlParams = new URLSearchParams(window.location.search);
        if (this.mosaicUrlParams.get('access_token')){
            localStorage.setItem('mosaic-iobio-tkn', this.mosaicUrlParams.get('access_token'));
        } else {
            localStorage.setItem('mosaic-iobio-tkn', '');
        }
    },
    methods: {
      async initMosaicSession() {
        if (localStorage.getItem('mosaic-iobio-tkn') && localStorage.getItem('mosaic-iobio-tkn').length > 0){
          //Gets everything from the URL and assigns what is needed
          this.mosaicProjectId = Number(this.mosaicUrlParams.get('project_id'));
          let tokenType = this.mosaicUrlParams.get('token_type');

          let source = this.mosaicUrlParams.get('source');
          source = decodeURIComponent(source);

          let clientAppNumber = this.mosaicUrlParams.get('client_application_id');
          this.mosaicExperimentId = this.mosaicUrlParams.get('experiment_id');

          //Create a new MosaicSession object
          this.mosaicSession = new MosaicSession(clientAppNumber);

          try {
            await this.mosaicSession.promiseInit(source, this.mosaicProjectId, tokenType);
          } catch (error) {
            this.validFromMosaic = false;
            this.selectDataSectionOpen = true;
            this.toasts.push({message: `Error initializing Mosaic Session: ${error}`, type: 'error'})
          }

          //Go through the samples and get just names and ids
          let samples = await this.mosaicSession.promiseGetProjectSamples(this.mosaicProjectId);
          samples = samples.map(sample => {
            return {
                name: sample.name,
                id: sample.id,
            }
          })
          
          //Find the proband from the relation attribute out of mosaic
          let probandId;
          for (let sample of samples) {
            let attributes = await this.mosaicSession.promiseGetSampleAttributes(this.mosaicProjectId, sample.id);
            let relationships = attributes.find(attr => attr.name == 'Relation').values;
            let isProband = relationships.find(rel => rel.value == 'Proband');
            
            if (isProband) {
              probandId = sample.id;
              break;
            }
          }

          //Get the proband name to use for samples
          let probandName = samples.find(sample => sample.id == probandId).name;
          
          //Set the proband id and get the phenotypes from mosaic
          this.mosaicSampleId = probandId;
          let terms = await this.mosaicSession.promiseGetSampleHpoTerms(this.mosaicProjectId, this.mosaicSampleId);
          this.phenotypesOfInterest = terms.map(term => term.hpo_id);

          //Get the proband's vcf file using the mosaicSession and experimentId
          let experiment = await this.mosaicSession.promiseGetExperiment(this.mosaicProjectId, this.mosaicExperimentId);
          let vcfFiles = experiment.files.filter(file => file.type == 'vcf');
          let probandFile = vcfFiles.find(file => file.sample_id == this.mosaicSampleId);
          let fileId = probandFile.id;

          //Get the signed url for the proband's vcf file that can be accessed via http
          this.mosaicVcfUrl = await this.mosaicSession.promiseGetSignedUrlForFile(this.mosaicProjectId, fileId);

          if (this.mosaicVcfUrl) {
            //If everything worked update the sample and open the select data section for the user to get the comparisons
            this.samples.proband.vcf = this.mosaicVcfUrl.url;
            this.samples.proband.id = probandName;
            this.validFromMosaic = true;
            this.selectDataSectionOpen = true;

          } else {
            //set not launched from mosaic not valid something went wrong
            this.validFromMosaic = false;
            this.selectDataSectionOpen = true;
          }
        } else {
            //set not launched from mosaic not valid something went wrong
            this.validFromMosaic = false;
            this.selectDataSectionOpen = true;
        }
      },
      returnDenovo(svList, comps, chromMap) {
        let joinedCompList = [];
        let denovoList = [];
        let nonDenovo = [];
        for (let list of comps) {
          joinedCompList.push(...list)
        }
    
        for (let sv of svList) {
          let overlapSize = 0;
          let olprop = 0;
          let svChrStart = chromMap.get(sv.chromosome).start
          let svStart = sv.start + svChrStart
          let svEnd = sv.end + svChrStart
          let svSize = svEnd - svStart

          let isNonDenovo = false;

          for (let variant of joinedCompList) {
              let chr2Start = chromMap.get(variant.chromosome).start
              let v2Start = variant.start + chr2Start
              let v2End = variant.end + chr2Start

              if (svStart < v2End && svEnd > v2Start) {
                  overlapSize = Math.min(svEnd, v2End) - Math.max(svStart, v2Start);
                  olprop = (overlapSize / svSize).toFixed(2)
                  //if there is something that overlaps more than or equal to the overlapProp not denovo
                  if (olprop >= this.overlapProp) {
                    nonDenovo.push(sv)
                    isNonDenovo = true;
                    break;
                  }
              }
          }
          if (!isNonDenovo) {
            denovoList.push(sv)
          }
        }

        return { denovoList: denovoList, nonDenovo: nonDenovo }
      },
      setChromosomeMap(chromosomeMap) {
        this.chromosomeAccumulatedMap = chromosomeMap;
        this.genomeEnd = chromosomeMap.get('Y').end;
      },
      setComparisonSamples(comparisons) {
        this.comparisonsLists = comparisons;
      },
      removeGeneFromGeneList(gene) {
        let newGenes = this.genesOfInterest.filter(g => g !== gene);
        this.updateGenesOfInterest(newGenes);
      },
      async loadData() {
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
          if (!this.samples.proband.id || this.samples.proband.id == '') {
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
        //We just want to make sure we trigger this incase we got phenotypes while we were loading or before
        await this.updatePhenotypesOfInterest(this.phenotypesOfInterest);
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
        if (filters.geneOverlap !== this.filters.geneOverlap || filters.denovoOnly !== this.filters.denovoOnly) {
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

        if (filters.denovoOnly) {
          if (!this.comparisonsLists.length > 0 || !this.chromosomeAccumulatedMap || !this.chromosomeAccumulatedMap.size > 0) {
            if (!this.comparisonsLists > 0) {
              this.addToast({message: 'No comparrisons.', type: 'error'})
            } else {
              this.addToast({message: 'No chromosome map defined.', type: 'error'})
            }
          } else {
            if (newSVs.length == 0) {
              newSVs = allSVs;
            }

            let { denovoList, nonDenovo } = this.returnDenovo(newSVs, this.comparisonsLists, this.chromosomeAccumulatedMap)
            newSVs = denovoList;
            newFilteredOut.push(...nonDenovo)
            filterApplied = true;
          }
        }

        if (!filterApplied) {
          newSVs = allSVs;
          newFilteredOut = []; 
        }

        this.svListVariantBar = newSVs;
        this.svListChart = newSVs;
        this.variantsFilteredOut = newFilteredOut;
      },
      hasPhenotypes(overlappedGenes) {
        /**
         * Returns true if any of the overlappedGenes have phenotypes
         */
        return Object.values(overlappedGenes).some(gene => Object.keys(gene.phenotypes) && Object.keys(gene.phenotypes).length > 0);
      },
      async updateSamples(samples) {
        this.samples.proband = samples.proband;
        this.loadData();

        this.samples.comparisons = samples.comparisons;
        
        if (!samples.proband.id || samples.proband.id == '') {
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
      zoomFired(zoomZone, isGene=false) {
        if (this.selectedArea == zoomZone) {
          return;
        }
        this.selectedArea = zoomZone
        if (!isGene) {
          this.focusedGeneName = null;
        }
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
            this.loadData();
          }
        },
        deep: true
      },
      variantListBarOpen: {
        handler(newVal, oldVal) {
          if (newVal == false){
            this.filterDataSectionOpen = false;
          }
        }
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
    box-sizing: border-box
    display: flex
    flex-direction: column
    padding: 5px 0px 0px 0px
    margin: 0px
    width: 25%
    min-width: 380px
    max-width: 500px
    transition: width 0.4s, min-width 0.4s
    .button-container
      display: flex
      flex-direction: row
      align-items: center
      justify-content: center
      width: 100%
      margin-bottom: 5px
      .tab-select-wrapper
        flex-grow: 1
        display: flex
        justify-content: center
      .filter-button
        display: flex
        justify-content: center
        align-items: center
        height: 30px
        width: 30px
        margin: 0px
        padding: 0px
        border: 1px solid #EBEBEB
        transform: translate(0px, 0px)
        margin-left: auto
        margin-right: 15px
        border-radius: 50%
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.2)
        transition: border-radius 0.2s
        z-index: 3
        &:hover
          cursor: pointer
          border-radius: 5px
        svg
          fill: #2A65B7
          height: 20px
          width: 20px
          transform: translate(0px, 0px)
        .loading-svg
            animation: spin 1s linear infinite
        @keyframes spin
          0%
            transform: rotate(0deg)
          100%
            transform: rotate(360deg)
    .sort-btn
        cursor: pointer
        overflow: visible
        position: relative
        display: flex
        justify-content: center
        align-items: center
        border-radius: 50%
        border: 1px solid #EBEBEB
        transition: all 0.25s
        padding: 2px
        margin-left: 3px
        height: 30px
        width: 30px
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.2)
        &.sorted
            cursor: not-allowed
        svg
            width: 20px
            height: 20px
            fill: #2A65B7
            pointer-events: none
            &.sorted
                filter: grayscale(100%)
            &.loading-svg
                animation: spin 1s linear infinite
            &:hover
                border-radius: 5px
        .sort-options-popup
            position: absolute
            top: 109%
            left: 0px
            width: 250px
            height: 100px
            padding: 5px
            font-weight: normal
            background-color: white
            border: 1px solid #ADC2DF
            border-radius: 5px
            display: flex
            flex-direction: column
            justify-content: space-around
            align-items: flex-start
            transition: height 0.25s, opacity 0.15s
            opacity: .95
            z-index: 2
            &.hidden
                opacity: 0
                pointer-events: none
                height: 0px
                border: 0px
        span
            cursor: pointer
            padding: 5px
            width: 100%
            border-radius: 5px 5px 0px 0px
            text-align: left
            border-bottom: 1px solid #ADC2DF
            &:hover
                background-color: #F5F5F5
            &:last-of-type
                border-radius: 0px 0px 5px 5px
                border-bottom: none
    .tab-select
      display: flex
      justify-content: flex-end
      align-content: flex-end
      color: #474747
      border-radius: 5px
      width: fit-content
      border: 1px solid #EBEBEB
      overflow: hidden
      &.collapsed
        border-bottom: 0px
        width: 0px
        min-width: 0px
        overflow: hidden
      .tab
        padding: 5px 10px
        margin: 0px
        text-transform: uppercase
        font-weight: 200
        &.selected
          background-color: #EBEBEB
          font-weight: 400
        &:hover
          cursor: pointer
          background-color: #E0E0E0
    &.collapsed
      width: 0px
      min-width: 0px
      .filter-button
        display: none
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