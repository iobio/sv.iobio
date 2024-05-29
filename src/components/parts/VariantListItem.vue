<template>
    <div id="variant-list-item">
        <div class="preview" :class="{opened: showMore}" @click="variantClicked">
            <span v-if="variant.overlappedGenes && variant.overlappedPhenGenes" class="num-genes-common-tip">{{ numberOfGenesInCommon }}</span>
            <span v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-accounted-tip">{{ numPhensAccountedFor }}</span>
            <span v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-accounted-perc-tip">{{ Math.round((numPhensAccountedFor/this.patientPhenotypes.length)*100) }}%</span>
            <div>{{ variant.chromosome }}</div>
            <div class="location-text">S: {{ variant.start }} E: {{ variant.end }}</div>
            <div class="size-text">{{ (variant.end + 1) - variant.start }} bp</div>
            <div class="type-text" :class="{red: variant.type === 'DEL'}">{{ variant.type }}</div>
        </div>
        <div v-if="showMore && variant.overlappedGenes" class="more-info">
            <div class="gene-row" v-for="gene in variant.overlappedGenes">
                <span class="gene-symbol-span">{{ gene.gene_symbol }}</span>
                <div class="gene-information-section">
                    <p class="column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                        <span v-for="phenotype in gene.phenotypes">{{ phenotype.term_id }}</span>
                    </p>
                    <p class="column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                        <span v-for="disease in gene.diseases">{{ disease.disease_id }}</span>
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
  },
  data () {
    return {
        showMore: false,
    }
  },
  mounted () {
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
        if (this.showMore) {
            this.$emit('variant-clicked', this.variant, 'show')
        } else {
            this.$emit('variant-clicked', this.variant, 'hide')
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
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    .collapsed
        #variant-list-bar
            #variant-list-item
                white-space: nowrap
    #variant-list-item
        width: 100%
        .preview
            position: relative
            display: grid
            grid-template-columns: 1fr 1.5fr 1fr .5fr
            grid-template-rows: 1fr
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
            &.opened
                box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
                background-color: #DEE9F7
                border-bottom: 1px solid #DEE9F7
            .num-genes-common-tip
                position: absolute
                top: 2px
                left: 5px
                height: 10px
                padding: 1px 2px
                font-size: .7em
                border-radius: 3px
                background-color: #F0C86C
                text-align: center
                line-height: 1em
            .num-phens-accounted-tip
                position: absolute
                top: 15px
                left: 5px
                height: 10px
                padding: 1px 2px
                font-size: .7em
                border-radius: 3px
                background-color: #67F56E
                text-align: center
                line-height: 1em
            .num-phens-accounted-perc-tip
                position: absolute
                top: 15px
                left: 25px
                height: 10px
                padding: 1px 2px
                font-size: .7em
                border-radius: 3px
                background-color: #67F56E
                text-align: center
                line-height: 1em
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
  </style>