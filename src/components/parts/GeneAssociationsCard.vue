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
                            <title>Not listed in ClinGen</title>
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
                Dosage Sensitivity: No Evidence
            </div>

            <div class="dose-sensitive-tag" v-if="!doseGenes[gene.gene_symbol]">(No reported dosage sensitivity)</div>
        </div>

        <div class="gene-information-section">
            <div class="diseases-container" v-if="Object.keys(diseasesLocal).length > 0">
                <div class="disease" v-for="disease in sortedDiseasesLocal" :key="disease.diseaseIds[0]">
                    <div class="disease-header">
                        <span class="disease-name">{{ disease.disease_name }}</span>
                        <span class="phenotype-count">
                            <b>{{ Object.keys(disease.associationsInCommon).length }}</b> HPO in common
                        </span>
                    </div>
                    <div class="common-phenotypes">
                        <div class="phenotype-chips-inline">
                            <span
                                v-for="phenotype in Object.values(disease.associationsInCommon)"
                                :key="phenotype.term_id"
                                class="phenotype-chip-small">
                                {{ phenotype.name }}
                                <a
                                    class="hpo-link-small"
                                    :href="`https://hpo.jax.org/app/browse/term/${phenotype.term_id}`"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <title>Link to: {{ phenotype.term_id }}</title>
                                        <path d="M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z" />
                                    </svg>
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <p class="additional-information" v-if="Object.keys(diseasesLocal).length === 0">
                <span>No Relevant Disease Associations</span>
            </p>
        </div>
    </div>
</template>

<script>
import { convertClinGenScores } from "../../dataHelpers/commonFunctions.js";
import { searchForHPO, getPhenotypesForDiseases } from "../../dataHelpers/dataHelpers.js";

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
            diseasesLocal: {},
        };
    },
    async mounted() {
        await this.getDiseasesLocal();
    },
    methods: {
        convertClinGenScores: convertClinGenScores,
        numOverlappedByGene(gene) {
            // Count total unique patient phenotypes from all diseases in diseasesLocal
            const uniquePhenotypes = new Set();
            Object.values(this.diseasesLocal).forEach((disease) => {
                Object.keys(disease.associationsInCommon).forEach((phenotypeId) => {
                    uniquePhenotypes.add(phenotypeId);
                });
            });
            return uniquePhenotypes.size;
        },
        async getDiseasesLocal() {
            this.diseasesLocal = {};
            let diseaseMap = {};

            Object.values(this.gene.diseases).forEach((disease) => {
                let diseaseId = disease.disease_id;

                if (!disease.disease_name) {
                    diseaseMap[diseaseId] = {
                        disease_name: "None",
                        diseaseIds: [diseaseId],
                        associationsInCommon: {},
                    };
                    return;
                }

                let diseaseNameNormalized = disease.disease_name.toLowerCase().replace(/[^a-z0-9]/gi, "");

                if (!diseaseMap.hasOwnProperty(diseaseNameNormalized)) {
                    diseaseMap[diseaseNameNormalized] = {
                        disease_name: disease.disease_name,
                        diseaseIds: [diseaseId],
                        associationsInCommon: {},
                    };
                } else {
                    diseaseMap[diseaseNameNormalized].diseaseIds.push(diseaseId);
                }
            });

            // Now fetch phenotypes for each disease
            for (let diseaseId of Object.keys(diseaseMap)) {
                let diseaseObj = diseaseMap[diseaseId];
                let diseasePhens = [];

                if (diseaseObj.diseaseIds.length > 1) {
                    for (let did of diseaseObj.diseaseIds) {
                        let id = did;

                        try {
                            let phens = await getPhenotypesForDiseases(id);
                            diseasePhens.push(...phens);
                        } catch (error) {
                            console.log("Error getting disease phenotypes");
                        }
                    }
                } else {
                    let id = diseaseObj.diseaseIds[0];
                    try {
                        let phens = await getPhenotypesForDiseases(id);
                        diseasePhens = phens;
                    } catch (error) {
                        console.log("Error getting disease phenotypes");
                    }
                }

                diseasePhens.forEach((phen) => {
                    let hasRelevantPhenotype = this.patientPhenotypes.includes(phen.term_id);
                    if (hasRelevantPhenotype) {
                        diseaseObj.associationsInCommon[phen.term_id] = {
                            term_id: phen.term_id,
                            name: null,
                        };
                    }
                });

                // Only keep diseases that have associations
                if (Object.keys(diseaseObj.associationsInCommon).length > 0) {
                    this.diseasesLocal[diseaseId] = diseaseObj;
                }
            }

            // Now resolve all the phenotype names using searchForHPO
            for (let diseaseId of Object.keys(this.diseasesLocal)) {
                let disease = this.diseasesLocal[diseaseId];
                for (let term_id in disease.associationsInCommon) {
                    let phenotype = disease.associationsInCommon[term_id];
                    try {
                        let hpo = await searchForHPO(phenotype.term_id);
                        phenotype.name = hpo[0]?.name || "Unknown phenotype";
                    } catch (error) {
                        phenotype.name = "Unknown phenotype";
                    }
                }
            }
        },
    },
    computed: {
        sortedDiseasesLocal() {
            let sorted = Object.values(this.diseasesLocal).sort(
                (a, b) => Object.keys(b.associationsInCommon).length - Object.keys(a.associationsInCommon).length,
            );
            return sorted;
        },
    },
    watch: {
        patientPhenotypes: {
            async handler() {
                await this.getDiseasesLocal();
            },
        },
        gene: {
            async handler() {
                await this.getDiseasesLocal();
            },
        },
    },
};
</script>

<style lang="sass">
.gene-associations-card
    height: 250px
    width: 400px
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
        flex-direction: column
        overflow-x: hidden
        overflow-y: hidden
.diseases-container
    display: flex
    flex-direction: column
    gap: 8px
    padding: 8px
    overflow-y: auto
    height: 100%
    .disease
        background-color: #f8f9fa
        padding: 8px
        border-radius: 5px
        border: 1px solid #e9ecef
        margin-bottom: 0px
        .disease-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 6px
            .disease-name
                font-weight: bold
                font-size: 0.9em
                color: #333
            .phenotype-count
                color: #666
                b
                    color: #0C5FC3
        .common-phenotypes
            .phenotype-chips-inline
                display: flex
                flex-wrap: wrap
                gap: 3px
                .phenotype-chip-small
                    display: inline-flex
                    align-items: center
                    padding: 3px 6px
                    border-radius: 8px
                    background: #D4ECE2
                    font-size: 0.7em
                    font-weight: 500
                    color: #333
                    .hpo-link-small
                        margin-left: 3px
                        display: flex
                        align-items: center
                        border-radius: 3px
                        border: 1px solid transparent
                        transition: background-color 0.2s, border 0.2s
                        svg
                            fill: #0C5FC3
                            height: 15px
                            width: 15px
                        &:hover
                            background-color: #C1D1EA
                            border: 1px solid #2A65B7
</style>
