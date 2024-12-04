<template>
    <div id="lower-modal" :class="{hidden: this.hidden}">
        <div class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>close</title>
                <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
            </svg>
        </div>

        <div id="upper-section">
            <h3 v-if="type == 'variant'">Variant Information</h3>
            <div class="column">
                <div class="top-row">
                    <fieldset class="actions fieldset-buttons-container">
                        <legend>Actions</legend>
                        <button>IGV Breakends</button>
                        <button>Sample Coverage</button>
                        <button>Pull SNPs</button>
                    </fieldset>

                    <div class="variant-information">
                        <div class="variant-summary-col">
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
                <div v-if="type == 'variant' && variant && variant.overlappedGenes" class="card-row">
                    <div class="gene-row" v-for="gene in sortVariantInformation">
                        <span class="gene-symbol-span"><b>{{ gene.gene_symbol }}</b> Phenotypes: {{ numOverlappedByGene(gene) }}/{{ patientPhenotypes.length }}</span>

                        <div class="gene-information-section">
                            <p class="inner-column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                                <span v-for="phenotype in inPatientPhens(gene.phenotypes).inPatientPhens" :class="{patient: patientPhenotypes.includes(phenotype)}">
                                    <svg class="patient-relevant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <title>patient-phenotype</title>
                                        <path d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z" />
                                    </svg>
                                    {{ gene.phenotypes[phenotype].name}}
                                    <a class="hpo-link" :href="`https://hpo.jax.org/app/browse/term/${phenotype}`" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Link to: {{ phenotype }}</title>
                                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                                        </svg>
                                    </a>
                                </span>
                                <span class="additional-information" v-if="inPatientPhens(gene.phenotypes).nonAssociatedPhens.length > 0">Show {{ inPatientPhens(gene.phenotypes).nonAssociatedPhens.length }} Additional Phenotypes</span>
                            </p>

                            <p class="inner-column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                                <span class="disease-row" v-for="disease in gene.diseases">{{ (disease.disease_name !== null ? disease.disease_name : 'No Name Found')}}
                                    <a class="disease-link" v-if="disease.disease_id.slice(0, 4) == 'OMIM'" :href="`https://www.omim.org/entry/${disease.disease_id.slice(5)}`" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Link to: {{ disease.disease_id }}</title>
                                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                                        </svg>
                                    </a>
                                    <a class="disease-link" v-else-if="disease.disease_name" :href="`https://hpo.jax.org/browse/disease/${disease.disease_id}`" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Link to: {{ disease.disease_id }}</title>
                                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                                        </svg>
                                    </a>
                                    <span v-else>{{ disease.disease_id }}</span>
                                </span>
                            </p>

                            <p class="additional-information" v-if="(!gene.diseases || !(Object.keys(gene.diseases).length > 0)) && (!gene.phenotypes || !(Object.keys(gene.phenotypes).length > 0))">
                                <span>No Associations</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
  import * as common from '../dataHelpers/commonFunctions.js'

  export default {
  name: 'LowerModal',
  components: {
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
    numOverlappedByGene(gene) {
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
            let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
            return inCommonPhens.length
        } else {
            return 0;
        }
    },
    inPatientPhens(phenotypesObj) {
        let phenotypes = Object.keys(phenotypesObj)
        let inPatientPhens = []
        let nonAssociatedPhens = []

        inPatientPhens = phenotypes.filter(phenotype => this.patientPhenotypes.includes(phenotype))
        nonAssociatedPhens = phenotypes.filter(phenotype => !this.patientPhenotypes.includes(phenotype))
        return {
            inPatientPhens: inPatientPhens,
            nonAssociatedPhens: nonAssociatedPhens
        }
    }
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
        background-color: white
        border-radius: 5px
        border: 1px solid #E0E0E0
        box-shadow: -1px 0px 5px 0px rgba(0,0,0,0.1), 0px 2px 5px 0px rgba(0,0,0,0.1)
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
                .variant-summary-col
                    display: flex
                    flex-direction: column
                    width: 15%
                    min-width: 150px
                    justify-content: space-between
                    .item
                        background-color: #ebebeb
                        border-radius: 5px
                        padding: 5px
                        font-weight: 200
                        text-align: center
                        margin-top: 5px
            .actions
                display: flex
                flex-direction: column
                align-items: center
                justify-content: space-evenly
                max-width: 140px
                height: 100%
                button
                    margin-top: 2px
                    margin-left: auto
                    padding: 5px
                    border-radius: 5px
                    background-color: white
                    color: #2A65B7
                    width: 100%
                    border: 1px solid #2A65B7
                    font-size: 0.8em
                    cursor: pointer
                    &:hover
                        background-color: #2A65B7
                        color: white
        .card-row
            display: flex
            flex-direction: row
            align-items: flex-start
            justify-content: flex-start
            padding: 5px
            width: 100%
            flex: 1 0
            overflow-x: auto
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
            height: 100%
            display: flex
            flex-direction: column
            border: 1px solid #C1D1EA
            border-radius: 5px
            margin-right: 3px
            padding: 0px
            .additional-information
                font-size: 1em
                color: #666666
                margin-top: 5px
                text-align: center
                padding: 2px
            .gene-symbol-span
                width: 100%
                text-align: center
                padding: 5px
                background-color: #EBEBEB
                border-radius: 5px 5px 0px 0px
            .gene-information-section
                display: flex
                flex-grow: 1
                flex-direction: row
                overflow-x: hidden
                overflow-y: hidden
                .inner-column
                    margin: 0px
                    padding: 5px 3px 5px 3px
                    box-sizing: border-box
                    display: flex
                    flex-direction: column
                    align-items: flex-start
                    position: relative
                    min-width: 220px
                    overflow-y: auto
                    overflow-x: hidden
                    &:first-of-type
                        flex-grow: 1
                    .additional-information
                        font-size: 0.8em
                        color: #666666
                        margin-top: 5px
                        text-align: center
                        bottom: 0px
                        padding: 2px
                        border-radius: 5px
                        cursor: pointer
                        &:hover
                            background-color: #F5F5F5
                    .disease-row
                        display: flex
                        align-items: center
                        margin-top: 2px
                        padding: 1px 3px
                        border: 1px solid #C1D1EA
                        border-radius: 5px
                    .disease-link
                        margin-left: 5px
                        padding: 2px
                        border-radius: 5px
                        display: flex
                        justify-content: center
                        align-items: center
                        width: 18px
                        height: 18px
                        svg
                            fill: #0C5FC3
                            height: 15px
                            width: 15px
                        &:hover
                            background-color: #F5F5F5
    .patient
        border-radius: 5px
        padding: 2px
        display: flex
        align-items: center
        .patient-relevant
            fill: #0C5FC3
            height: 15px
            width: 15px
        .hpo-link
            margin-left: 5px
            padding: 2px
            border-radius: 5px
            display: flex
            justify-content: center
            align-items: center
            width: 18px
            height: 18px
            svg
                fill: #0C5FC3
                height: 15px
                width: 15px
            &:hover
                background-color: #F5F5F5
</style>