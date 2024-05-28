<template>
  <div id="main-container">
    <div id="upper-bar-container">
      <NavBar 
        @updateGenesOfInterest="updateGenesOfInterest"
        @updatePhenotypesOfInterest="updatePhenotypesOfInterest"/>
      <!-- <UpperChromBar
        :svList="svList"
        :zoomZone="selectedArea"
        @area-selected="areaSelected"/> -->
    </div>

    <div id="lower-block-container">
      <div id="var-list-bar-button-container" :class="{collapsed: !variantListBarOpen}">
        <button id="var-list-bar-toggle-btn" @click="variantListBarOpen = !variantListBarOpen">
          <img v-if="variantListBarOpen" src="/arrow-expand-left.svg" alt="close">
          <img v-else src="/arrow-expand-right.svg" alt="open">
        </button>
        <VariantListBar 
        :svList="svListChart"
        :patientPhenotypes="phenotypesOfInterest"
        @updateSvAtIndex="updateSvList"
        @variant-clicked="updateFocusedVariant"/>
      </div>

      <LeftTracksSection 
        :svList="svListChart"
        :selectedArea="selectedArea"
        :focusedVariant="focusedVariant"
        :genesOfInterest="genesOfInterest"
        @circos-zoom-event="circosZoomFired"/>

      <div id="right-section-container" :class="{collapsed: !rightSectionOpen}">
        <button id="right-section-toggle-btn" @click="rightSectionOpen = !rightSectionOpen">
        <img v-if="rightSectionOpen" src="/arrow-expand-right.svg" alt="close">
        <img v-else src="/arrow-expand-left.svg" alt="open">
        </button>
        <RightSection />
      </div> 

    </div>

  </div>
</template>

<script>
  import UpperChromBar from './components/UpperChromBar.vue'
  import LeftTracksSection from './components/LeftTracksSection.vue';
  import RightSection from './components/RightSection.vue';
  import VariantListBar from './components/VariantListBar.vue';
  import NavBar from './components/NavBar.vue';
  import Sv from './models/Sv.js'

  export default {
    name: 'app',
    components: {
      UpperChromBar,
      LeftTracksSection,
      RightSection,
      VariantListBar,
      NavBar
    },
    data() {
      return {
        svListChart: [],
        svListVariantBar: [],
        focusedVariant: null,
        selectedArea: null,
        variantListBarOpen: true,
        rightSectionOpen: false,
        genesOfInterest: [],
        phenotypesOfInterest: [],
        ofInterestStopIndex: 0,
      }
    },
    async mounted() {
      let svListRes = await fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-01_svafotate_output.filteredaf.vcf.gz');
      let svList = await svListRes.json();

      this.svListChart = svList.map(sv => new Sv(sv));

      let svListCopy = [...this.svListChart];
      let batchSize = 200;
      let lessNum = 0;

      for (let i = 0; i < svListCopy.length; i += batchSize) {
        let batchSvs = svListCopy.slice(i, i + batchSize);

        let batchPromises = await Promise.all(batchSvs.map(sv => this.getOverlappedGenes(sv)));

        for (let [index, newSv] of batchPromises.entries()) {
          let originalIndex = i + index; // Calculate the original index

          //Before we sort anything down the list make sure we dont want to swap this to the top
          if (newSv.genesInCommon.length > 0) {
            //if we have genes in common perform a swap
            let temp = this.svListChart[this.ofInterestStopIndex] //whatever is at the 'stop' index
            this.svListChart[this.ofInterestStopIndex] = newSv;
            this.svListChart[originalIndex - lessNum] = temp

            this.ofInterestStopIndex ++;
            continue;
          }

          if (Object.keys(newSv.overlappedGenes).length == 0) {
            // Remove this item at this index and push this new SV so it ends up at the end
            this.svListChart.splice(originalIndex - lessNum, 1);
            this.svListChart.push(newSv);
            lessNum += 1;
          } else if (!this.hasPhenotypes(newSv.overlappedGenes)) {
            // Remove this item at this index and push this new SV so it ends up at the end
            this.svListChart.splice(originalIndex - lessNum, 1);
            this.svListChart.push(newSv);
            lessNum += 1;
          } else {
            // Update the current index with the new SV
            this.svListChart[originalIndex - lessNum] = newSv;
          }
        }
      }
    },
    methods: {
      updateFocusedVariant(variant, flag) {
        if (this.focusedVariant === variant) {
          this.focusedVariant = null
        } else if (this.focusedVariant !== variant && flag == 'hide') {
          //dont change focused variant
        } else {
          this.focusedVariant = variant
        }
      },
      hasPhenotypes(overlappedGenes) {
        return Object.values(overlappedGenes).some(gene => Object.keys(gene.phenotypes) && Object.keys(gene.phenotypes).length > 0);
      },
      async getOverlappedGenes(variant) {
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
      circosZoomFired(zoomZone) {
        this.selectedArea = zoomZone
      }, 
      updateGenesOfInterest(newGOI) {
        //if it is the same list we dont need to do anything
        if (newGOI.length == this.genesOfInterest.length && newGOI.every((v, i) => v === this.genesOfInterest[i])) {
          return;
        }
        
        this.genesOfInterest = newGOI;
        //TODO: here we will need to update genes in common on change
        this.svListChart.forEach((sv, index) => {
          if (sv?.overlappedGenes && Object.keys(sv.overlappedGenes).length > 0){
            let geneSet = new Set(Object.keys(sv.overlappedGenes));
            let genesInCommon = this.genesOfInterest.filter(geneSymbol => geneSet.has(geneSymbol));
            sv.genesInCommon = genesInCommon;

            if (genesInCommon.length > 0) {
              //if we have genes in common perform a swap
              let temp = this.svListChart[this.ofInterestStopIndex]
              this.svListChart[this.ofInterestStopIndex] = this.svListChart[index]
              this.svListChart[index] = temp

              this.ofInterestStopIndex ++;
            }
          } else if (!sv.genesInCommon){
            sv.genesInCommon = [];
          }
        })
      },
      updatePhenotypesOfInterest(newPOI) {
        this.phenotypesOfInterest = newPOI;
        //TODO: here we will need to update phenotypes in common on change

        //One we want to pull genes associated with these phenotypes so we know "possible genes of interest"

        //Then we also want to check our variants and see if they overlap any of these phenotypeRelatedGenes

        //We want to give a phens in common to reflect the number of phenotypes in common represented by the genes overlapped cumulatively 

      },
      updateSvList(index, sv) {
        console.log(sv)
        this.svListChart[index] = sv;
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
    transition: width 0.5s
    &.collapsed
      width: 0px
      min-width: 0px

  #var-list-bar-toggle-btn
    position: absolute
    top: 5px
    right: -35px
    z-index: 2
    padding: 3px
    margin: 0px
    border-radius: 50%
    display: flex
    justify-content: center
    align-items: center
    border: 2px solid #2A65B7
    background-color: #C1D1EA
    &:hover
      cursor: pointer
      opacity: 0.8
    img
      height: 23px
      width: 23px
      display: flex 
      justify-content: center
      align-items: center
      transform: translate(0px, 0px)

  #right-section-container
    position: relative
    display: flex
    padding-top: 10px
    padding-bottom: 10px
    height: 100%
    width: 35%
    box-sizing: border-box
    border-left: 1px solid #F5F5F5
    transition: all 0.5s
    &.collapsed
      width: 0px
      min-width: 0px
  #right-section-toggle-btn
    position: absolute
    top: 5px
    left: -35px
    z-index: 2
    padding: 3px
    margin: 0px
    border-radius: 50%
    display: flex
    justify-content: center
    align-items: center
    border: 2px solid #2A65B7
    background-color: #C1D1EA
    &:hover
      cursor: pointer
      opacity: 0.8
    img
      height: 23px
      width: 23px
      display: flex 
      justify-content: center
      align-items: center
      transform: translate(0px, 0px)
</style>