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
        :svList="svList"
        :patientPhenotypes="phenotypesOfInterest"
        @updateSvAtIndex="updateSvList"
        @variant-clicked="updateFocusedVariant"/>
      </div>

      <LeftTracksSection 
        :svList="svList"
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
        svList: [],
        focusedVariant: null,
        selectedArea: null,
        variantListBarOpen: true,
        rightSectionOpen: false,
        genesOfInterest: [],
        phenotypesOfInterest: [],
      }
    },
    async mounted() {
      let svListRes = await fetch('http://localhost:3000/dataFromVcf?vcfPath=/Users/emerson/Documents/Data/SV.iobio_testData/svpipe_results/Manta/3002-01_svafotate_output.filteredaf.vcf.gz');
      let svList = await svListRes.json();

      this.svList = svList.map(sv => new Sv(sv));

      let svListCopy = [...this.svList];
      let batchSize = 200;
      let lessNum = 0;

      for (let i = 0; i < svListCopy.length; i += batchSize) {
        let batchSvs = svListCopy.slice(i, i + batchSize);

        let batchPromises = await Promise.all(batchSvs.map(sv => this.getOverlappedGenes(sv)));

        for (let [index, newSv] of batchPromises.entries()) {
          let originalIndex = i + index; // Calculate the original index

          if (Object.keys(newSv.overlappedGenes).length == 0) {
            // Remove this item at this index and push this new SV so it ends up at the end
            this.svList.splice(originalIndex - lessNum, 1);
            this.svList.push(newSv);
            lessNum += 1;
          } else if (!this.hasPhenotypes(newSv.overlappedGenes)) {
            // Remove this item at this index and push this new SV so it ends up at the end
            this.svList.splice(originalIndex - lessNum, 1);
            this.svList.push(newSv);
            lessNum += 1;
          } else {
            // Update the current index with the new SV
            this.svList[originalIndex - lessNum] = newSv;
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
            } else {
              gene.phenotypes = phenToGene[gene_symbol]
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
        this.genesOfInterest = newGOI;
      },
      updatePhenotypesOfInterest(newPOI) {
        this.phenotypesOfInterest = newPOI;        
      },
      updateSvList(index, sv) {
        console.log(sv)
        this.svList[index] = sv;
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