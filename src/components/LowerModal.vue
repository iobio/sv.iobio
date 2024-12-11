<template>
    <div id="lower-modal" :class="{hidden: this.hidden}">
        <div class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>close</title>
                <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
            </svg>
        </div>

        <div id="upper-section">
            <h3 v-if="type == 'variant'">SV Details</h3>
            <div class="column">
                <div class="top-row">
                    <!-- <fieldset class="actions fieldset-buttons-container">
                        <legend>Actions</legend>
                        <button>IGV Breakends</button>
                        <button>Sample Coverage</button>
                        <button>Pull SNPs</button>
                    </fieldset> -->

                    <div class="variant-information">
                        <div class="variant-summary-row">
                            <div class="item">
                                <span v-html="bpFormatted(variant.size)"></span>
                            </div>
                            <div class="item">{{ formatGenotype(variant.genotype, true) }} ({{ variant.genotype.slice(0, 3) }})</div>
                            <div class="item">{{ formatType(variant.type) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="lower-section">
            <div class="column gene-cards">
                <div class="column-header">Overlapped Genes</div>
                <div v-if="type == 'variant' && variant && Object.values(variant.overlappedGenes).length > 0" class="card-row">
                    <GeneAssociationsCard v-for="gene in sortVariantInformation" :key="gene.gene_symbol" :gene="gene" :patientPhenotypes="patientPhenotypes" />
                </div>
                <div class="card-row no-genes" v-else-if="type == 'variant' && variant && Object.values(variant.overlappedGenes).length == 0">No Genes Overlapped</div>
            </div>
        </div>
    </div>
</template>
  
<script>
  import * as common from '../dataHelpers/commonFunctions.js'
  import GeneAssociationsCard from './parts/GeneAssociationsCard.vue';

  export default {
  name: 'LowerModal',
  components: {
    GeneAssociationsCard,
  },
  props: {
    hidden: Boolean,
    type: String,
    variant: Object,
    patientPhenotypes: Array,
    geneCandidates: Array,
    chromosomeAccumulatedMap: Object,
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    formatGenotype: common.formatGenotype,
    bpFormatted: common.bpFormatted,
    formatType: common.formatType,
    close() {
        this.$emit('close')
    },
  },
  computed: {
    sortVariantInformation(){
        // TODO: We want to sort by genes with num of phens and also if there are genes of interest by that as well
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
  },
  watch: {
  },
  }
</script>
  
<style lang="sass">
    #lower-modal
        height: 45vh
        width: 100%
        box-sizing: border-box
        position: absolute
        display: flex
        flex-direction: column
        justify-content: flex-start
        align-items: space-between
        bottom: 5px
        right: 0
        background-color: #FCFCFC
        border-radius: 5px
        border: 1px solid #E0E0E0
        box-shadow: -2px 0px 5px 0px rgba(0,0,0,0.1), 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
        overflow: hidden
        transition: height 0.4s, border 0.4s
        .bp-sc
            font-size: 0.8em
            margin-right: 5px
        #upper-section
            height: 40%
            box-sizing: border-box
            display: flex
            flex-direction: column
        #lower-section
            height: 60%
            box-sizing: border-box
            display: flex
            flex-direction: column
        h3
            margin: 0px
            padding: 5px
            width: 100%
            text-align: center
            font-weight: 400
            font-size: 1em
            text-transform: uppercase
        &.hidden
            height: 0vh
            border: 1px solid transparent
            box-shadow: none
        .close-button
            position: absolute
            height: 30px
            width: 30px
            display: flex
            justify-content: center
            align-items: center
            right: 10px
            top: 10px
            cursor: pointer
            background-color: rgba(255, 255, 255, 0.8)
            border-radius: 50%
            box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
            svg
                width: 29px
                height: 29px
                fill: #666666
                &:hover
                    fill: red
            &:hover
                color: #2A65B7
        .column
            display: flex
            flex-direction: column
            align-items: center
            width: 100%
            height: 100%
            padding: 5px
            overflow: hidden
            .column-header
                width: 100%
                text-align: center
                padding: 2px
                font-weight: 200
                font-size: 0.9em
                text-transform: uppercase
            &.gene-cards
                height: 100%
        .top-row
            display: flex
            flex-direction: row
            align-items: center
            justify-content: space-between
            width: 100%
            padding: 5px
            max-height: 100%
            overflow: hidden
            .variant-information
                border-radius: 5px
                padding-left: 10px
                height: 100%
                flex: 1 0
                overflow: hidden
                .variant-summary-row
                    display: flex
                    flex-direction: row
                    width: 25%
                    min-width: 310px
                    justify-content: space-between
                    .item
                        border: 1px solid #C1D1EA
                        color: #2A65B7
                        border-radius: 5px
                        padding: 5px
                        font-weight: 200
                        text-align: center
                        display: flex
                        flex-direction: column
                        justify-content: center
                        margin-top: 5px
            .actions
                align-items: center
                display: flex
                flex-direction: column
                height: 100%
                justify-content: space-evenly
                max-width: 140px
                button
                    color: #2A65B7
                    font-size: 0.8em
                    margin-top: 2px
                    padding: 5px
                    width: 100%
                    cursor: not-allowed
        .card-row
            display: flex
            flex-direction: row
            align-items: flex-start
            justify-content: flex-start
            padding: 5px
            width: 100%
            flex: 1 0
            overflow-x: auto
            &.no-genes
                justify-content: center
                align-items: center
                font-weight: 200
                font-style: italic
                color: #666666
                border-radius: 5px
                width: 100%
                overflow: hidden
                background-color: #F5F5F5
</style>