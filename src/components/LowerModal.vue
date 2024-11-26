<template>
    <div id="lower-modal" :class="{hidden: this.hidden}">
        <div class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>close</title>
                <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
            </svg>
        </div>

        <h3 v-if="type == 'variant'"> Variant Information</h3>
        <!-- Currently replicate what used to be in the Variant List Item -->
        <div v-if="type == 'variant' && variant && variant.overlappedGenes" class="more-info">
            <div class="gene-row" v-for="gene in sortVariantInformation">
                <span class="gene-symbol-span">{{ gene.gene_symbol }} <sup><i>({{ percentOverlappedByGene(gene) }}%)</i></sup></span>
                <div class="gene-information-section">
                    <p class="column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                        <span v-for="phenotype in sortByInPatientPhens(gene.phenotypes)" :class="{green: patientPhenotypes.includes(phenotype)}">{{ gene.phenotypes[phenotype].name}}
                            (<a :href="`https://hpo.jax.org/app/browse/term/${phenotype}`" target="_blank" rel="noopener noreferrer">{{ phenotype }}</a>)
                        </span>
                    </p>
                    <p class="column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                        <span v-for="disease in gene.diseases">{{ (disease.disease_name !== null ? disease.disease_name : 'No Name Found')}}
                            (<a v-if="disease.disease_id.slice(0, 4) == 'OMIM'" :href="`https://www.omim.org/entry/${disease.disease_id.slice(5)}`" target="_blank" rel="noopener noreferrer">{{ disease.disease_id }}</a>
                                <a v-else-if="disease.disease_name" :href="`https://hpo.jax.org/browse/disease/${disease.disease_id}`" target="_blank" rel="noopener noreferrer">{{ disease.disease_id }}</a>
                                <span v-else>{{ disease.disease_id }}</span>)
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
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
    close() {
        this.$emit('close')
    },
    percentOverlappedByGene(gene) {
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
            let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
            return Math.round(inCommonPhens.length / this.patientPhenotypes.length * 100)
        } else {
            return 0;
        }
    },
    sortByInPatientPhens(phenotypesObj) {
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
    }
  },
  computed: {
    sortVariantInformation(){
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
        align-items: flex-start
        bottom: 5px
        right: 0
        background-color: #F8F8F8
        opacity: 0.85
        border-radius: 5px
        border: 1px solid #E0E0E0
        z-index: 1
        transition: height 0.4s, border 0.4s
        h3
            margin: 0px
            padding: 5px
            width: 100%
            text-align: center
            border-bottom: 1px solid #F5F5F5
        &.hidden
            height: 0vh
            border: 1px solid transparent
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
        .more-info
            display: flex
            flex-direction: column
            align-items: flex-start
            justify-content: flex-start
            padding: 5px
            width: 45%
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