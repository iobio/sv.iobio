<template>
    <div class="gene-associations-card gene-row">
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
</template>

<script>
    export default {
    name: 'GeneAssociationsCard',
    components: {
    },
    props: {
        gene: {
            type: Object,
            required: true
        },
        patientPhenotypes: {
            type: Array,
            required: true
        }
    },
    data () {
    return {
        showMorePhenotypes: false
    }
    },
    mounted () {
    },
    methods: {
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
    },
    watch: {
    },
    }
</script>

<style lang="sass">
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
                    font-weight: 200
                    bottom: 0px
                    padding: 2px
                    border-radius: 5px
                    cursor: pointer
                    &:hover
                        color: #2A65B7
                .disease-row
                    display: flex
                    align-items: center
                    margin-top: 2px
                    padding: 1px 3px
                    border: 1px solid #C1D1EA
                    border-radius: 5px
                .disease-link
                    margin-left: 5px
                    border-radius: 5px
                    display: flex
                    justify-content: center
                    border: 1px solid transparent
                    align-items: center
                    width: 18px
                    height: 18px
                    transition: background-color 0.2s, border 0.2s
                    svg
                        fill: #0C5FC3
                        height: 15px
                        width: 15px
                    &:hover
                        background-color: #C1D1EA
                        border: 1px solid #2A65B7
</style>