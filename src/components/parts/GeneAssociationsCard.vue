<template>
    <div class="gene-associations-card gene-row">
        <div class="gene-card-header">
            <div class="symbol-row">
                {{ gene.gene_symbol }}
                <div
                    v-if="
                        doseGenes[gene.gene_symbol] &&
                        (parseInt(doseGenes[gene.gene_symbol].triplosensitivity.score) !== 0 ||
                            parseInt(doseGenes[gene.gene_symbol].haploinsufficiency.score) !== 0)
                    ">
                    <a
                        :href="`https://search.clinicalgenome.org/kb/gene-dosage/${gene.gene_symbol}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <span class="dose-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <title>Review Dose Sensitivity In ClinGen</title>
                                <path
                                    d="M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z" />
                            </svg>
                        </span>
                    </a>
                </div>

                <div v-if="!doseGenes[gene.gene_symbol]">
                    <span class="dose-icon null">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Not Listed In ClinGen</title>
                            <path
                                d="M22.11 21.46L2.39 1.73L1.11 3L6.81 8.7L4.22 11.29C1.88 13.64 1.88 17.43 4.22 19.78C6.56 22.12 10.36 22.12 12.71 19.78L15.3 17.19L20.84 22.73L22.11 21.46M4.6 16.57C4.24 15.24 4.59 13.75 5.64 12.71L8.23 10.12L9.64 11.53L4.6 16.57M10.78 7.58L9.36 6.16L11.29 4.22C13.64 1.88 17.43 1.88 19.78 4.22C22.12 6.56 22.12 10.36 19.78 12.71L17.85 14.65L16.43 13.23L18.36 11.29C19.93 9.73 19.93 7.2 18.36 5.64C16.8 4.07 14.27 4.07 12.71 5.64L10.78 7.58Z" />
                        </svg>
                    </span>
                </div>

                <div
                    v-if="
                        doseGenes[gene.gene_symbol] &&
                        parseInt(doseGenes[gene.gene_symbol].haploinsufficiency.score) == 0 &&
                        parseInt(doseGenes[gene.gene_symbol].triplosensitivity.score) == 0
                    ">
                    <a
                        :href="`https://search.clinicalgenome.org/kb/gene-dosage/${gene.gene_symbol}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <span class="dose-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <title>Review Dose Sensitivity In ClinGen</title>
                                <path
                                    d="M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z" />
                            </svg>
                        </span>
                    </a>
                </div>
            </div>

            <div
                class="dose-sensitive-tag"
                v-if="doseGenes[gene.gene_symbol] && parseInt(doseGenes[gene.gene_symbol].triplosensitivity.score) != 0">
                Triplosensitivity: {{ convertClinGenScores(doseGenes[gene.gene_symbol].triplosensitivity.score) }} (<a
                    :href="`https://www.ebi.ac.uk/ols4/ontologies/mondo/classes/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FMONDO_${doseGenes[
                        gene.gene_symbol
                    ].triplosensitivity.diseaseAssociation.slice(6)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ doseGenes[gene.gene_symbol].triplosensitivity.diseaseAssociation }}</a
                >)
            </div>

            <div
                class="dose-sensitive-tag"
                v-if="doseGenes[gene.gene_symbol] && parseInt(doseGenes[gene.gene_symbol].haploinsufficiency.score) != 0">
                Haploinsufficiency: {{ convertClinGenScores(doseGenes[gene.gene_symbol].haploinsufficiency.score) }} (<a
                    :href="`https://www.ebi.ac.uk/ols4/ontologies/mondo/classes/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FMONDO_${doseGenes[
                        gene.gene_symbol
                    ].haploinsufficiency.diseaseAssociation.slice(6)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ doseGenes[gene.gene_symbol].haploinsufficiency.diseaseAssociation }}</a
                >)
            </div>

            <div
                class="dose-sensitive-tag"
                v-if="
                    doseGenes[gene.gene_symbol] &&
                    parseInt(doseGenes[gene.gene_symbol].haploinsufficiency.score) == 0 &&
                    parseInt(doseGenes[gene.gene_symbol].triplosensitivity.score) == 0
                ">
                On ClinGen List with No Evidence
            </div>

            <div class="dose-sensitive-tag" v-if="!doseGenes[gene.gene_symbol]">Not On ClinGen List</div>

            <div class="header-row">
                <div class="centered">
                    Patient HPO <span class="blue">{{ numOverlappedByGene(gene) }}</span>
                    <svg class="patient-relevant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>patient-phenotype</title>
                        <path
                            d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z" />
                    </svg>
                </div>
                <div class="centered">Diseases</div>
            </div>
        </div>

        <div class="gene-information-section">
            <p class="inner-column" v-if="gene.phenotypes && Object.keys(gene.phenotypes).length > 0">
                <span
                    v-for="phenotype in inPatientPhens(gene.phenotypes).inPatientPhens"
                    class="phenotype"
                    :class="{ patient: patientPhenotypes.includes(phenotype) }">
                    <svg class="patient-relevant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>patient-phenotype</title>
                        <path
                            d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z" />
                    </svg>
                    {{ gene.phenotypes[phenotype].name }}
                    <a
                        class="hpo-link"
                        :href="`https://hpo.jax.org/app/browse/term/${phenotype}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Link to: {{ phenotype }}</title>
                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                        </svg>
                    </a>
                </span>
                <span
                    v-if="showMorePhenotypes"
                    v-for="phenotype in inPatientPhens(gene.phenotypes).nonAssociatedPhens"
                    class="phenotype">
                    <svg class="non-relevant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>non-patient relevant</title>
                        <path
                            d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" />
                    </svg>
                    {{ gene.phenotypes[phenotype].name }}
                    <a
                        class="hpo-link"
                        :href="`https://hpo.jax.org/app/browse/term/${phenotype}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Link to: {{ phenotype }}</title>
                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                        </svg>
                    </a>
                </span>
                <span
                    @click="showMorePhenotypes = !showMorePhenotypes"
                    class="additional-information phenotypes"
                    v-if="inPatientPhens(gene.phenotypes).nonAssociatedPhens.length > 0">
                    <span v-if="!showMorePhenotypes"
                        >Show {{ inPatientPhens(gene.phenotypes).nonAssociatedPhens.length }} Additional Phenotypes</span
                    >
                    <span v-else
                        >Hide {{ inPatientPhens(gene.phenotypes).nonAssociatedPhens.length }} non-patient Phenotypes</span
                    >
                </span>
            </p>

            <p class="inner-column" v-if="gene.diseases && Object.keys(gene.diseases).length > 0">
                <span class="disease-row" v-for="disease in gene.diseases"
                    >{{ disease.disease_name !== null ? disease.disease_name : "No Name Found" }}
                    <a
                        class="disease-link"
                        v-if="disease.disease_id.slice(0, 4) == 'OMIM'"
                        :href="`https://www.omim.org/entry/${disease.disease_id.slice(5)}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Link to: {{ disease.disease_id }}</title>
                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                        </svg>
                    </a>
                    <a
                        class="disease-link"
                        v-else-if="disease.disease_name"
                        :href="`https://hpo.jax.org/browse/disease/${disease.disease_id}`"
                        target="_blank"
                        rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Link to: {{ disease.disease_id }}</title>
                            <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                        </svg>
                    </a>
                    <span v-else>{{ disease.disease_id }}</span>
                </span>
            </p>

            <p
                class="additional-information"
                v-if="
                    (!gene.diseases || !(Object.keys(gene.diseases).length > 0)) &&
                    (!gene.phenotypes || !(Object.keys(gene.phenotypes).length > 0))
                ">
                <span>No Associations</span>
            </p>
        </div>
    </div>
</template>

<script>
import { convertClinGenScores } from "../../dataHelpers/commonFunctions.js";

export default {
    name: "GeneAssociationsCard",
    components: {},
    props: {
        gene: {
            type: Object,
            required: true,
        },
        patientPhenotypes: {
            type: Array,
            required: true,
        },
        doseGenes: Object,
    },
    data() {
        return {
            showMorePhenotypes: false,
        };
    },
    mounted() {},
    methods: {
        convertClinGenScores: convertClinGenScores,
        numOverlappedByGene(gene) {
            if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
                let inCommonPhens = Object.keys(gene.phenotypes).filter((phenotype) =>
                    this.patientPhenotypes.includes(phenotype),
                );
                return inCommonPhens.length;
            } else {
                return 0;
            }
        },
        inPatientPhens(phenotypesObj) {
            let phenotypes = Object.keys(phenotypesObj);
            let inPatientPhens = [];
            let nonAssociatedPhens = [];

            inPatientPhens = phenotypes.filter((phenotype) => this.patientPhenotypes.includes(phenotype));
            nonAssociatedPhens = phenotypes.filter((phenotype) => !this.patientPhenotypes.includes(phenotype));
            return {
                inPatientPhens: inPatientPhens,
                nonAssociatedPhens: nonAssociatedPhens,
            };
        },
    },
    computed: {},
    watch: {},
};
</script>

<style lang="sass">
.phenotype
    border-radius: 5px
    padding: 2px
    display: flex
    align-items: center
    color: #666666
    font-weight: 200
    font-size: 0.85em
    svg
        fill: #0C5FC3
        height: 15px
        min-height: 15px
        width: 15px
        min-width: 15px
    &.patient
        color: black
        font-weight: 400
    .non-relevant
        fill: #666666
        height: 15px
        width: 15px
    .hpo-link
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
.gene-row
    height: 100%
    display: flex
    flex-direction: column
    border: 1px solid #e0e0e0
    border-radius: 5px
    margin-right: 3px
    padding: 0px
    .additional-information
        font-size: .8em
        color: #666666
        margin-top: 5px
        text-align: center
        width: 100%
        padding: 2px
    .gene-card-header
        display: flex
        flex-direction: column
        width: 100%
        text-align: center
        padding: 5px
        font-size: .8em
        background-color: #EBEBEB
        border-radius: 5px 5px 0px 0px
        .dose-sensitive-tag
            color: #666666
            margin-bottom: 5px
            text-align: center
            font-weight: 200
            padding: 2px
            border-radius: 5px
        .symbol-row
            font-weight: 400
            width: 100%
            display: flex
            justify-content: center
            align-items: center
            .dose-icon
                display: flex
                align-items: center
                margin-left: 5px
                border-radius: 5px
                border: 1px solid transparent
                &.null:hover
                    background-color: inherit
                    border: 1px solid transparent
                    cursor: default
                &:hover
                    background-color: #C1D1EA
                    border: 1px solid #2A65B7
                svg
                    height: 15px
                    fill: #2A65B7
        .header-row
            display: flex
            flex-direction: row
            justify-content: space-between
            align-items: center
            padding: 5px
            font-weight: 200
            font-size: 1em
            .blue
                color: #0C5FC3
                font-weight: bold
                margin-left: 5px
        .centered
            display: flex
            align-items: center
            justify-content: center
            width: 50%
            .patient-relevant
                fill: #0C5FC3
                height: 15px
                width: 15px
                margin-left: 5px
                margin-right: 5px
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
                text-align: left
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
                font-size: 0.85em
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
