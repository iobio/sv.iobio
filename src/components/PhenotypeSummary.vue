<template>
    <div id="phenotype-summary">
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <div class="loading-text">Loading...</div>
        </div>
        <div class="summary-container">
            <div class="phenotype-chips-container" v-if="allPhenotypesDisplay.length > 0 && phenRelatedGenes.length > 0">
                <h3>Patient Phenotypes</h3>
                <div class="chip-legend">
                    <div class="legend-item">
                        <span class="legend-chip accounted"></span>
                        <span class="legend-text">Accounted for</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-chip unaccounted"></span>
                        <span class="legend-text">Not accounted for</span>
                    </div>
                </div>
                <div class="phenotype-chips">
                    <span
                        v-for="phenotype in allPhenotypesDisplay"
                        :key="phenotype.term_id"
                        class="phenotype-chip"
                        :class="{ unaccounted: !phenotype.isAccountedFor }">
                        {{ phenotype.name }}
                    </span>
                </div>
            </div>
        </div>

        <div v-if="view === 'diseases'" class="associations-container">
            <div class="disease" v-for="(disease, diseaseId) in sortedDiseasesLocal" :key="diseaseId">
                <div class="disease-content">
                    <div class="disease-info">
                        <div class="disease-header">
                            <div>
                                <span class="disease-name">{{ disease.diseases[0].disease_name }}</span>
                                <div class="disease-ids">
                                    <span v-for="(d, i) in disease.diseases" :key="d.disease_id">
                                        <a
                                            class="disease-link"
                                            v-if="d.disease_id.slice(0, 4) == 'OMIM'"
                                            :href="`https://www.omim.org/entry/${d.disease_id.slice(5)}`"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            {{ d.disease_id }}
                                        </a>
                                        <a
                                            class="disease-link"
                                            v-else-if="d.disease_id.slice(0, 5) == 'ORPHA'"
                                            :href="`https://hpo.jax.org/browse/disease/${d.disease_id}`"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            {{ d.disease_id }}
                                        </a>
                                        <span v-if="i !== disease.diseases.length - 1">, </span>
                                    </span>
                                </div>
                            </div>

                            <span class="phenotype-count"
                                ><b>{{ disease.associationsInCommon.length }}</b> HPO in common</span
                            >
                        </div>
                        <div class="common-phenotypes">
                            <div class="phenotypes-label">Phenotypes In Common:</div>
                            <div class="phenotype-chips-inline">
                                <span
                                    v-for="phenotype in disease.associationsInCommon"
                                    :key="phenotype.term_id"
                                    class="phenotype-chip-small">
                                    {{ phenotype.name }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="sv-gene-pairs">
                        <div class="pair-label"><span>SV Assoc.</span><span>Gene Assoc.</span></div>
                        <div class="pairs-list">
                            <div v-for="(pair, index) in disease.svGenePairs" :key="index" class="sv-gene-pair">
                                <span class="sv-code">{{ pair.svCode }}</span>
                                <span class="gene-symbol">{{ pair.geneSymbol }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { searchForHPO, getPhenotypesForDiseases } from "../dataHelpers/dataHelpers";
export default {
    name: "PhenotypeSummary",
    props: {
        svList: Array,
        genesOfInterest: Array,
        phenRelatedGenes: Array,
        ptPhenotypes: Array,
        isLoading: Boolean,
    },
    data() {
        return {
            phensNotAccountedFor: [],
            allPhenotypesDisplay: [],
            diseasesLocal: [],
            relevantSvsLocal: [],
            ptPhenotypesObj: {},
            view: "diseases",
        };
    },
    async mounted() {
        this.setPtPhenotypesObj();
        this.getSvsWithPhenGenes();
        await this.getDiseasesLocal();
        this.getPhensNotAccountedFor();
        await this.createAllPhenotypesDisplay();
    },
    methods: {
        setPtPhenotypesObj() {
            if (this.ptPhenotypes.length > 0) {
                this.ptPhenotypesObj = {};
                this.ptPhenotypes.forEach((hpo_id) => {
                    this.ptPhenotypesObj[hpo_id] = true;
                });
            }
        },
        getPhensNotFound(diseaseGroups, inCommonPhens) {
            if (!diseaseGroups || !inCommonPhens) {
                return [];
            }

            const allDiseaseIds = new Set(
                Object.values(diseaseGroups).flatMap((diseaseGroup) => diseaseGroup.map((d) => d.disease_id)),
            );
            return Object.values(inCommonPhens).filter((term) => !allDiseaseIds.has(term.disease_id));
        },
        getCommonPhensForGroup(diseaseGroup, inCommonPhens) {
            const diseaseIds = diseaseGroup.map((d) => d.disease_id);
            return Object.values(inCommonPhens).filter((term) => diseaseIds.includes(term.disease_id));
        },
        async getPhensNotAccountedFor() {
            const svs = this.svList.filter((sv) => sv.overlappedPhenGenes.length > 0);
            const lookupPhens = new Set(this.ptPhenotypes);
            let phensNotAccountedForLocal = []; // Different name to avoid conflict
            let allPhensInCommon = [];

            svs.forEach((sv) => {
                sv.overlappedPhenGenes.forEach((gene) => {
                    let inCommonPhens = Object.fromEntries(
                        Object.entries(sv.overlappedGenes[gene].phenotypes).filter(([t_id, term]) => lookupPhens.has(t_id)),
                    );
                    allPhensInCommon.push(inCommonPhens);
                });
            });

            // Use Promise.all to handle all async operations
            const missingTerms = [];
            for (const term of lookupPhens) {
                if (!allPhensInCommon.some((inCommonPhens) => inCommonPhens[term])) {
                    missingTerms.push(term);
                }
            }

            // Fetch all missing terms in parallel
            const termPromises = missingTerms.map(async (term) => {
                try {
                    const hpo = await searchForHPO(term);
                    return {
                        term_id: term,
                        name: hpo[0].name,
                    };
                } catch (error) {
                    return {
                        term_id: term,
                        name: "Unknown",
                    };
                }
            });

            phensNotAccountedForLocal = await Promise.all(termPromises);
            this.phensNotAccountedFor = phensNotAccountedForLocal;
        },
        async createAllPhenotypesDisplay() {
            // Create a map of accounted phenotypes
            const accountedPhenotypes = new Set();
            const svs = this.svList.filter((sv) => sv.overlappedPhenGenes.length > 0);
            const lookupPhens = new Set(this.ptPhenotypes);

            svs.forEach((sv) => {
                sv.overlappedPhenGenes.forEach((gene) => {
                    Object.keys(sv.overlappedGenes[gene].phenotypes).forEach((termId) => {
                        if (lookupPhens.has(termId)) {
                            accountedPhenotypes.add(termId);
                        }
                    });
                });
            });

            // Create display array with all phenotypes
            const phenotypesDisplay = [];

            for (const termId of this.ptPhenotypes) {
                try {
                    const hpo = await searchForHPO(termId);
                    phenotypesDisplay.push({
                        term_id: termId,
                        name: hpo[0]?.name || "Unknown",
                        isAccountedFor: accountedPhenotypes.has(termId),
                    });
                } catch (error) {
                    phenotypesDisplay.push({
                        term_id: termId,
                        name: "Unknown",
                        isAccountedFor: accountedPhenotypes.has(termId),
                    });
                }
            }

            this.allPhenotypesDisplay = phenotypesDisplay;
        },
        async getDiseasesLocal() {
            this.diseasesLocal = {};
            // Diseases local will be an object of objects where each key is a disease_id and value contains disease info plus SV/Gene pairs
            let diseaseMap = {};
            if (this.relevantSvsLocal.length > 0) {
                // Iterate through each SV and its genes to track associations
                this.relevantSvsLocal.forEach((sv) => {
                    Object.entries(sv.structGenesWithPhenoOverlap).forEach(([geneSymbol, geneObj]) => {
                        Object.values(geneObj.diseasesGrouped).forEach((diseaseArr) => {
                            let diseaseId = diseaseArr[0].disease_id;

                            if (!diseaseMap.hasOwnProperty(diseaseId)) {
                                diseaseMap[diseaseId] = {
                                    diseases: diseaseArr,
                                    svGenePairs: [],
                                    associatedPhenotypes: [],
                                    associationsInCommon: [],
                                    uniquePhensMap: {},
                                    uniqueInCommonMap: {},
                                };
                            }

                            // Add the SV and Gene pair if not already present
                            let pairExists = diseaseMap[diseaseId].svGenePairs.some(
                                (pair) => pair.svCode === sv.svCode && pair.geneSymbol === geneSymbol,
                            );
                            if (!pairExists) {
                                diseaseMap[diseaseId].svGenePairs.push({
                                    svCode: sv.svCode,
                                    geneSymbol: geneSymbol,
                                });
                            }
                        });
                    });
                });

                // Now fetch phenotypes for each disease
                for (let diseaseId of Object.keys(diseaseMap)) {
                    let diseaseObj = diseaseMap[diseaseId];
                    let diseasePhens = [];

                    if (diseaseObj.diseases.length > 1) {
                        for (let diseaseEntry of diseaseObj.diseases) {
                            let id = diseaseEntry.disease_id;

                            try {
                                let phens = await getPhenotypesForDiseases(id);
                                diseasePhens.push(...phens);
                            } catch (error) {
                                console.log("Error getting disease phenotypes");
                            }
                        }
                    } else {
                        let id = diseaseObj.diseases[0].disease_id;
                        try {
                            let phens = await getPhenotypesForDiseases(id);
                            diseasePhens = phens;
                        } catch (error) {
                            console.log("Error getting disease phenotypes");
                        }
                    }

                    diseasePhens.forEach((phen) => {
                        if (!diseaseObj.uniquePhensMap.hasOwnProperty(phen.term_id)) {
                            diseaseObj.uniquePhensMap[phen.term_id] = phen;
                            diseaseObj.associatedPhenotypes.push(phen);

                            if (this.ptPhenotypesObj.hasOwnProperty(phen.term_id)) {
                                diseaseObj.uniqueInCommonMap[phen.term_id] = phen;
                                // We'll resolve the names later after all diseases are processed
                                diseaseObj.associationsInCommon.push({
                                    term_id: phen.term_id,
                                    name: null, // Will be filled in later
                                });
                            }
                        }
                    });

                    // Only keep diseases that have associations
                    if (diseaseObj.associatedPhenotypes.length > 0 && diseaseObj.associationsInCommon.length > 0) {
                        this.diseasesLocal[diseaseId] = diseaseObj;
                    }
                }

                // Now resolve all the phenotype names using searchForHPO
                for (let diseaseId of Object.keys(this.diseasesLocal)) {
                    let disease = this.diseasesLocal[diseaseId];
                    for (let i = 0; i < disease.associationsInCommon.length; i++) {
                        let phenotype = disease.associationsInCommon[i];
                        try {
                            let hpo = await searchForHPO(phenotype.term_id);
                            phenotype.name = hpo[0]?.name || "Unknown phenotype";
                        } catch (error) {
                            phenotype.name = "Unknown phenotype";
                        }
                    }
                }
            }
        },
        getSvsWithPhenGenes() {
            // Filter down to the svs that have genes with phenotypes in common
            const svs = this.svList.filter((sv) => sv.overlappedPhenGenes.length > 0);
            const lookupPhens = new Set(this.ptPhenotypes);

            // Create a new structured value for the sv that we can use in the UI for each SV
            let editedSvs = svs.map((sv) => {
                let newGenes = {};
                // Extract only the genes with phenotypes in common, and only those phenotypes
                sv.overlappedPhenGenes.forEach((gene) => {
                    let inCommonPhens = Object.fromEntries(
                        Object.entries(sv.overlappedGenes[gene].phenotypes).filter(([t_id, term]) => lookupPhens.has(t_id)),
                    );
                    let diseases = sv.overlappedGenes[gene].diseases;

                    // For all of the diseases if the disease_name is the same as another case insensitive and remove spaces or non alphanumeric characters then group them together
                    let diseasesGrouped = Object.values(diseases).reduce((acc, disease) => {
                        if (disease.disease_name) {
                            let key = disease.disease_name
                                .toLowerCase()
                                .replace(/\s+/g, "")
                                .replace(/[^a-z0-9]/g, "");
                            if (!acc[key]) {
                                acc[key] = [];
                            }
                            let diseaseObj = {
                                disease_name: disease.disease_name || "No disease name found",
                                disease_id: disease.disease_id,
                            };
                            acc[key].push(diseaseObj);
                        } else {
                            if (!acc[disease.disease_id]) {
                                acc[disease.disease_id] = [];
                            }
                            let diseaseObj = {
                                disease_name: disease.disease_name || "No disease name found",
                                disease_id: disease.disease_id,
                            };
                            acc[disease.disease_id].push(diseaseObj);
                        }
                        return acc;
                    }, {});

                    newGenes[gene] = { inCommonPhens, diseasesGrouped };
                });
                sv.structGenesWithPhenoOverlap = newGenes;
                return sv;
            });

            this.relevantSvsLocal = editedSvs;
        },
    },
    computed: {
        sortedDiseasesLocal() {
            // Convert object to array, sort by phenotypes in common count, then convert back to array of [key, value] pairs
            return Object.entries(this.diseasesLocal)
                .sort(([, a], [, b]) => (b.associationsInCommon?.length || 0) - (a.associationsInCommon?.length || 0))
                .reduce((acc, [diseaseId, disease]) => {
                    acc[diseaseId] = disease;
                    return acc;
                }, {});
        },
    },
    watch: {
        svList: {
            async handler() {
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
                await this.createAllPhenotypesDisplay();
            },
        },
        ptPhenotypes: {
            async handler() {
                this.setPtPhenotypesObj();
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
                await this.createAllPhenotypesDisplay();
            },
        },
        phenRelatedGenes: {
            async handler() {
                this.setPtPhenotypesObj();
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
                await this.createAllPhenotypesDisplay();
            },
        },
    },
};
</script>

<style lang="sass">
#phenotype-summary
    margin-top: 20px
    display: flex
    flex-direction: column
    overflow: hidden
    height: 100%
.summary-container
    display: flex
    flex-direction: row
    gap: 10px
    align-items: flex-start
    justify-content: flex-start
.associations-container
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-start
    padding: 20px 10px
    overflow-y: auto
    .sv-code
        margin-bottom: 5px
        margin-top: 0px
        text-align: center
        border-bottom: 1px solid #f0f0f0
        padding-bottom: 5px
    .gene-symbol
        margin-bottom: 5px
        margin-top: 0px
        text-align: center
.sv
    border: 1px solid #f0f0f0
    padding: 10px
    border-radius: 5px
    margin-bottom: 5px
    width: 100%
.phenotype-chips-container
    border: 1px solid #f0f0f0
    padding: 0px
    border-radius: 5px
    font-size: 14px
    width: fit-content
    h3
        margin: 0
        text-align: center
        padding: 2px 3px
        font-weight: normal
        background-color: #f0f0f0
.chip-legend
    display: flex
    gap: 15px
    padding: 10px
    font-size: 12px
    border-bottom: 1px solid #f0f0f0
    background-color: #fafafa
.legend-item
    display: flex
    align-items: center
    gap: 5px
.legend-chip
    width: 12px
    height: 12px
    border-radius: 6px
    display: inline-block
    &.accounted
        background: #D4ECE2
    &.unaccounted
        background: #e0e0e0
        border: 1px solid #bdbdbd
.legend-text
    color: #666
    font-size: 11px
.phenotype-chips
    display: flex
    flex-wrap: wrap
    gap: 7px
    padding: 10px
.phenotype-chip
    display: inline-block
    padding: 3px 10px
    border-radius: 8px
    background: #D4ECE2
    font-size: 0.9em
    font-weight: 500
    transition: background 0.2s, color 0.2s
    &.unaccounted
        background: #e0e0e0
        color: #888
        border: 1px solid #bdbdbd
.indented
    padding-left: 20px
    &.term
        padding-left: 20px
        font-size: 14px
        font-weight: normal
        margin-bottom: 5px
        margin-left: 20px
        background-color: #f0f0f0
        border-radius: 5px
        padding: 2px 5px
        width: fit-content
.disease
    background-color: #f0f0f0
    padding: 12px
    border-radius: 8px
    margin-bottom: 10px
    width: 100%
    .disease-content
        display: flex
        gap: 20px
        align-items: flex-start
    .disease-info
        flex: 1
        min-width: 0
    .disease-header
        display: flex
        align-items: center
        margin-bottom: 8px
        .disease-name
            font-weight: bold
            font-size: 16px
            color: #333
        .disease-id
            color: #666
            font-size: 14px
            margin-left: 5px
        .phenotype-count
            display: block
            font-size: 12px
            font-weight: normal
            color: #666
            padding: 2px 8px
            border-radius: 5px
            width: fit-content
            align-self: start
            margin-left: 10px
            b
                font-size: 14px
    .disease-ids
        display: flex
        flex-wrap: wrap
        gap: 5px
        margin-bottom: 10px
        font-size: 12px
        color: #666
        .disease-link
            color: #0C5FC3
            font-weight: 200
            text-decoration: none
            &:hover
                text-decoration: underline
    .common-phenotypes
        .phenotypes-label
            font-size: 12px
            font-weight: 500
            color: #555
            margin-bottom: 4px
        .phenotype-chips-inline
            display: flex
            flex-wrap: wrap
            gap: 4px
            .phenotype-chip-small
                display: inline-block
                padding: 2px 8px
                border-radius: 12px
                background: #D4ECE2
                font-size: 11px
                font-weight: 500
                color: #333
    .sv-gene-pairs
        min-width: 200px
        .pair-label
            font-size: 12px
            font-weight: 500
            color: #555
            margin-bottom: 4px
            display: grid
            grid-template-columns: 1fr 1fr
            gap: 5
        .pairs-list
            display: flex
            flex-direction: column
            gap: 3px
            .sv-gene-pair
                display: grid
                grid-template-columns: 1fr 1fr
                gap: 5px
                .sv-code
                    background-color: #e0e0e0
                    padding: 2px 6px
                    border-radius: 3px
                    font-size: 11px
                    font-weight: 500
                .gene-symbol
                    background-color: #d1ecf1
                    padding: 2px 6px
                    border-radius: 3px
                    font-size: 11px
                    font-weight: 500
                    color: #0c5460
                    width: fit-content
.disease-group
    margin-bottom: 5px
.disease-group-header
    background-color: #f0f0f0
    padding: 5px
    border-radius: 5px
    margin-bottom: 5px
    font-weight: bold
    font-size: 14px
    width: fit-content
.view-section
    width: 100%
    border-right: 1px solid #f0f0f0
    border-left: 1px solid #f0f0f0
    border-bottom: 1px solid #f0f0f0
    border-radius: 0px 0px 5px 5px
    padding: 5px 10px
    background-color: #fafafa
.select-view-container
    display: flex
    flex-direction: row
    gap: 10px
    align-items: center
    justify-content: flex-start
    label
        font-weight: normal
        font-size: 14px
        color: #666
    .view-select
        width: 120px
        height: 30px
        border-radius: 5px
        border: 1px solid #f0f0f0
        padding: 5px
        font-size: 14px
        font-weight: normal
        background: white
.phen-in-common-header
    font-style: italic
    color: #666
    margin-bottom: 5px
    margin-top: 10px
    font-size: 14px
    font-weight: normal
.loading-overlay
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: rgba(255,255,255,0.7)
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    z-index: 10
.spinner
    border: 4px solid #f3f3f3
    border-top: 4px solid #0C5FC3
    border-radius: 50%
    width: 40px
    height: 40px
    animation: spin 1s linear infinite
@keyframes spin
    0%
        transform: rotate(0deg)
    100%
        transform: rotate(360deg)
.loading-text
    margin-top: 10px
    color: #0C5FC3
    font-size: 1.1em
    font-weight: 500
</style>
