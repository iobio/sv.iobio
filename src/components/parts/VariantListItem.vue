<template>
    <div id="variant-list-item">
        <div class="preview" :class="{opened: showMore}" @click="variantClicked">
            <span class="exp-collapse-carrot">
                <svg v-if="!showMore" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chevron-down</title><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chevron-up</title><path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" /></svg>
            </span>
            <span class="overlap-tip">
                <span v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-accounted-perc-tip">
                    <strong>
                        {{ Math.round(maxSingularPhenotypes)}}%
                    </strong>
                    Max Phens
                </span>
                <span v-else class="num-genes-overlapped-tip">
                    <strong>{{ numberOfGenes }}</strong>
                    genes
                </span>
                <span v-if="variant.overlappedGenes && geneCandidates && geneCandidates.length > 0" class="goi-ol-tip">
                    <strong>{{ numberOfGenesOfInterest }}</strong>
                    GoI
                </span>
            </span>

            
            <div>{{ variant.chromosome }}</div>
            <div class="location-text">
                S: {{ bpFormatted(variant.start) }} <br> E: {{ bpFormatted(variant.end) }}
            </div>
            <div class="size-text">{{ bpFormatted((variant.end + 1) - variant.start) }}</div>
            <div class="type-text" :class="{red: variant.type === 'DEL'}">{{ variant.type }}</div>
        </div>
        <div v-if="showMore && variant.overlappedGenes" class="more-info">
            <div class="gene-row" v-for="gene in variant.overlappedGenes">
                <span class="gene-symbol-span">{{ gene.gene_symbol }} <sup><i>({{ percentOverlappedByGene(gene) }}%)</i></sup></span>
                <div class="gene-information-section">
                    <p class="column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                        <span v-for="phenotype in sortByInPatientPhens(gene.phenotypes)" :class="{green: patientPhenotypes.includes(phenotype)}">{{ gene.phenotypes[phenotype].name + ` (${phenotype})` }}</span>
                    </p>
                    <p class="column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                        <span v-for="disease in gene.diseases">{{ (disease.disease_name !== null ? disease.disease_name : 'No Name Found') +' ('+disease.disease_id +')' }}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
  </template>

<script>
  export default {
  name: 'VariantListItem',
  components: {
  },
  props: {
    variant: Object,
    patientPhenotypes: Array,
    geneCandidates: Array,
    openedSvSet: Object
  },
  data () {
    return {
        showMore: false,
    }
  },
  mounted () {
    let svKey = `${this.variant.chromosome}-${this.variant.start}-${this.variant.end}`
    if (svKey in this.openedSvSet) {
        this.showMore = true
    }
  },
  methods: {
    roundScore(score) {
        //turn score to number
        score = parseFloat(score)
        return Math.round(score * 1000) / 1000
    }, 
    variantClicked() {
        console.log(this.variant)
        this.showMore = !this.showMore

        //sort the genes and phenotypes with the sortVariantInformation function
        this.variant.overlappedGenes = this.sortVariantInformation()

        if (this.showMore) {
            this.$emit('variant-clicked', this.variant, 'show')
        } else {
            this.$emit('variant-clicked', this.variant, 'hide')
        }
    },
    sortVariantInformation(){
        /**
         * When the variant is clicked we will call this function that sorts through this variant's genes and phenotypes
         * If we have patient phenotypes then the genes that go to the top should be the genes with the most number of phens in common with the patient
         */
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let overlappedGenes = Object.values(this.variant.overlappedGenes)
            overlappedGenes.sort((a, b) => {
                let aPhens = Object.keys(a.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                let bPhens = Object.keys(b.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                return bPhens.length - aPhens.length
            });
            return overlappedGenes
        } else {
            return this.variant.overlappedGenes
        }
    },
    sortByInPatientPhens(phenotypesObj) {
        /**
         * Turns a phenotypes object into an array of the phenotypes which are the keys 
         * the array is sorted by if that phenotype is in the patient phenotypes
         */
        let phenotypes = Object.keys(phenotypesObj)
        phenotypes.sort((a, b) => {
            if (this.patientPhenotypes.includes(a) && !this.patientPhenotypes.includes(b)) {
                return -1
            } else if (!this.patientPhenotypes.includes(a) && this.patientPhenotypes.includes(b)) {
                return 1
            } else {
                return 0
            }
        })
        return phenotypes
    },
    bpFormatted(valuebp) {
        if (valuebp > 1000000) {
            return `${(valuebp / 1000000).toFixed(2)}Mb`;
        } else if (valuebp > 1000) {
            return `${(valuebp / 1000).toFixed(2)}Kb`;
        }
        return `${valuebp}Bp`;
    },
    percentOverlappedByGene(gene) {
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
            let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
            return Math.round(inCommonPhens.length / this.patientPhenotypes.length * 100)
        } else {
            return 0;
        }
    },
  },
  computed: {
    numberOfGenes(){
        if (this.variant.overlappedGenes && Object.keys(this.variant.overlappedGenes).length > 0) {
            return Object.keys(this.variant.overlappedGenes).length
        } else {
            return 0;
        }  
    },
    cumulativeNumOfPhenotypes(){
        if (this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0){
            let overlappedPhens = [];
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                overlappedPhens.push(...Object.keys(gene.phenotypes)) 
            }
            overlappedPhens = new Set(overlappedPhens)
            return overlappedPhens.size;
        } else {
            return 0;
        }
    }, 
    numberOfGenesInCommon() {
        if (this.variant.genesInCommon) {
            return this.variant.genesInCommon.length + this.variant.overlappedPhenGenes.length
        }
    },
    numberOfGenesOfInterest() {
        if (this.geneCandidates && this.geneCandidates.length > 0) {
            //how many of the overlapped genes are in the geneCandidates
            let genesOfInterest = 0;
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                if (this.geneCandidates.includes(gene.gene_symbol)) {
                    genesOfInterest += 1
                }
            }
            return genesOfInterest
        } else {
            return 0
        }
    },
    numPhensAccountedFor() {
        //if there are patient phenotypes we can see how many of the overlapped phenotypes are accounted for
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let inCommonOverlappedPhens = [];
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                inCommonOverlappedPhens.push(...Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype)))
            }
            inCommonOverlappedPhens = new Set(inCommonOverlappedPhens)
            return inCommonOverlappedPhens.size;
        } else {
            return 0;
        }   
    },
    maxSingularPhenotypes() {
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let maxPercent = 0;
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                let percent = inCommonPhens.length / this.patientPhenotypes.length * 100
                if (percent > maxPercent) {
                    maxPercent = percent
                }
            }
            return maxPercent
        } else {
            return 0;
        }
    }
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    #variant-list-item
        width: 100%
        min-width: 200px
        .preview
            position: relative
            display: grid
            grid-template-columns: .025fr .21fr .15fr .25fr .25fr .15fr
            grid-template-rows: 1fr
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            &.opened
                box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
                background-color: #DEE9F7
                border-bottom: 1px solid #DEE9F7
            .exp-collapse-carrot
                display: flex
                justify-content: center
                align-items: center
                border-radius: 50%
                border: 2px solid transparent
                transition: border 0.2s ease-in-out, border-radius 0.2s ease-in-out
                &:hover
                    cursor: pointer
                    border: 2px solid #2A65B7
                    border-radius: 5px
                svg
                    height: 20px
                    width: 20px
                    fill: #2A65B7
                    pointer-events: none
            .overlap-tip
                display: flex
                flex-direction: row
                justify-content: flex-start
                font-family: 'Courier New', Courier, monospace
                font-size: 0.7em
                .goi-ol-tip
                    padding: 3px 3px
                    border-radius: 0px 5px 5px 0px
                    background-color: #FF8585
                    display: flex
                    flex-direction: column
                    align-items: center
                    justify-content: center
                    text-align: center
                    box-sizing: border-box
                .num-phens-accounted-perc-tip
                    padding: 3px 3px
                    border-radius: 5px 0px 0px 5px
                    background-color: #8BBEF9
                    display: flex
                    flex-direction: column
                    align-items: center
                    justify-content: center
                    text-align: center
                    box-sizing: border-box
                .num-genes-overlapped-tip
                    padding: 3px 3px
                    border-radius: 5px 0px 0px 5px
                    display: flex
                    flex-direction: column
                    align-items: center
                    justify-content: center
                    text-align: center
                    box-sizing: border-box
            .rank-text
                color: #2A65B7
                font-weight: bold
            .location-text
                font-size: 0.7em
            .size-text
                font-size: 0.8em
            .type-text
                border: 1px solid black
                border-radius: 5px
                font-size: 0.8em
                &.red
                    color: red
                    font-weight: bold
                    border: 1px solid red
            div
                display: flex
                align-items: center
                justify-content: center
            &:hover
                background-color: #F5F5F5
                cursor: pointer
        .more-info
            display: flex
            flex-direction: column
            align-items: flex-start
            justify-content: flex-start
            padding: 5px
            width: 100%
            overflow-y: auto
            max-height: 800px
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            div
                width: 100%
                display: flex
                justify-content: space-between
                span
                    font-size: 0.8em
                    margin-right: 5px
                .gene-span
                    padding: 2px
                    border-radius: 5px
                    font-size: 0.8em
                    border: 1px solid #2A65B7
                    background-color: #C1D1EA
                    color: #2A65B7
                    &:hover
                        background-color: #2A65B7
                        color: white
                        cursor: pointer
                .other-genes-container
                    display: flex
                    flex-wrap: wrap
                    span
                        margin-right: 3px
                        margin-top: 3px
                        padding: 2px
                        border-radius: 5px
                        font-size: 0.8em
                        border: 1px solid #2A65B7
                        background-color: #C1D1EA
                        color: #2A65B7
                        &:hover
                            background-color: #2A65B7
                            color: white
                            cursor: pointer
        .gene-row
            max-height: 200px
            display: flex
            flex-direction: column
            .gene-symbol-span
                width: 100%
                text-align: center
                border-bottom: 1px solid #C1D1EA
                border-top: 1px solid #C1D1EA
            .gene-information-section
                display: flex
                flex-grow: 1
                flex-direction: row
                overflow-x: hidden
                overflow-y: hidden
                .column
                    margin: 0px
                    padding: 5px 3px 5px 3px
                    box-sizing: border-box
                    display: flex
                    flex-direction: column
                    overflow-y: auto
                    overflow-x: hidden
                    &:first-of-type
                        flex-grow: 1
    .green
        background-color: #8BBEF9
        border: 1px solid white
        border-radius: 5px
  </style>