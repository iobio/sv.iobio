<template>
    <div id="phenotype-summary">
        <h3 class="title">HPO Summary</h3>
        <div class="summary-container">
            <div class="phens-not-accounted-for" v-if="phensNotAccountedFor.length > 0 && phenRelatedGenes.length > 0">
                <h3>Phenotypes Not Covered</h3>
                <div class="term" v-for="term in phensNotAccountedFor">
                    <span>{{ term.name }}</span> <span>({{ term.term_id }})</span>
                </div>
            </div>
            <!-- <div class="select-view-container">
                <label for="view-select">View:</label>
                <select v-model="view" class="view-select">
                    <option value="sv">SVs</option>
                    <option value="diseases">Diseases</option>
                </select>
            </div> -->
        </div>

        <div class="sv-container" v-if="view === 'sv'">
            <p class="sv" v-for="(sv) in relevantSvsLocal">
                <div class="sv-code">{{ sv.svCode }}</div>
                <div v-for="(geneObj, gene_symbol) in sv.structGenesWithPhenoOverlap">
                    <p class="gene-symbol">{{ gene_symbol }}</p>
                    <div class="term" v-for="term in getPhensNotFound(geneObj.diseaseGroups, geneObj.inCommonPhens)">
                        <span>{{ term.name }}</span> <span>({{ term.term_id }})</span> <span>Associated with: {{ term.disease_id }}</span>
                    </div>
                    <div class="disease-group" v-for="diseaseGroup in geneObj.diseasesGrouped">
                        <div class="disease-group-header" v-if="getCommonPhensForGroup(diseaseGroup, geneObj.inCommonPhens).length > 0">
                            <span v-for="(diseaseObj, index) in diseaseGroup">
                                <span v-if="index == 0">{{ diseaseObj.disease_name }}</span> 
                                <span v-if="index == 0"> (</span><span>{{ diseaseObj.disease_id }}</span><span v-if="index < diseaseGroup.length - 1">, </span> <span v-if="index == diseaseGroup.length - 1">)</span>
                            </span>
                        </div>
                        <div v-if="getCommonPhensForGroup(diseaseGroup, geneObj.inCommonPhens).length > 0" class="phen-in-common-header">Phenotypes in common:</div>
                        <div class="indented term" v-for="term in getCommonPhensForGroup(diseaseGroup, geneObj.inCommonPhens)">{{ term.name }}</div>
                    </div>
                </div>
            </p>    
        </div>

        <!-- <div v-if="view === 'diseases'">
            <div class="disease" v-for="disease in diseasesLocal">
                <span>{{ disease.diseases[0].disease_name }}</span> <span>({{ disease.diseases[0].disease_id }})</span>
            </div>
        </div> -->
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
    },
    data() {
        return {
            phensNotAccountedFor: [],
            diseasesLocal: [],
            relevantSvsLocal: [],
            ptPhenotypesObj: {},
            view: "sv",
        }
    },
    async mounted() {
        this.setPtPhenotypesObj();
        this.getSvsWithPhenGenes();
        await this.getDiseasesLocal();
        this.getPhensNotAccountedFor();
    },
    methods: {
        setPtPhenotypesObj() {
            if (this.ptPhenotypes.length > 0) {
                this.ptPhenotypesObj = {};
                this.ptPhenotypes.forEach((hpo_id) => {
                    this.ptPhenotypesObj[hpo_id] = true;
                })
            }
        },
        getPhensNotFound(diseaseGroups, inCommonPhens) {
            if (!diseaseGroups || !inCommonPhens) {
                return [];
            }
            
            const allDiseaseIds = new Set(
                Object.values(diseaseGroups).flatMap(diseaseGroup => 
                    diseaseGroup.map(d => d.disease_id)
                )
            );
            return Object.values(inCommonPhens).filter(term => 
                !allDiseaseIds.has(term.disease_id)
            );
        },
        getCommonPhensForGroup(diseaseGroup, inCommonPhens) {
            const diseaseIds = diseaseGroup.map(d => d.disease_id);
            return Object.values(inCommonPhens).filter(term => 
                diseaseIds.includes(term.disease_id)
            );
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
                if (!allPhensInCommon.some(inCommonPhens => inCommonPhens[term])) {
                    missingTerms.push(term);
                }
            }

            // Fetch all missing terms in parallel
            const termPromises = missingTerms.map(async (term) => {
                try {
                    const hpo = await searchForHPO(term);
                    return {
                        term_id: term,
                        name: hpo[0].name
                    };
                } catch (error) {
                    return {
                        term_id: term,
                        name: 'Unknown'
                    };
                }
            });

            phensNotAccountedForLocal = await Promise.all(termPromises);
            this.phensNotAccountedFor = phensNotAccountedForLocal;
        },
        async getDiseasesLocal() {
            this.diseasesLocal = [];
            // Diseases local will be an array of arrays where each array is a disease and each item in the sub array is a different instance of the same disease (ORPHA vs OMIM)
            let allDiseases = [];
            let sortedDiseases = [];
            if (this.relevantSvsLocal.length > 0) {
                let diseases = [];
                diseases = this.relevantSvsLocal.flatMap((sv) => {
                    return Object.values(sv.structGenesWithPhenoOverlap).flatMap((obj) => Object.values(obj.diseasesGrouped))
                })

                for (let diseaseArr of diseases) {
                    let diseaseObj = {}
                    diseaseObj.diseases = diseaseArr;

                    let diseasePhens = [];
                    let uniquePhensMap = {};
                    let uniquePhensList = [];
                    let uniqueInCommonList = [];

                    if (diseaseArr.length > 1) {
                        for (let diseaseEntry of diseaseArr) {
                            let id = diseaseEntry.disease_id;
                            
                            try {
                                let phens = await getPhenotypesForDiseases(id)
                                diseasePhens.push(...phens)
                            } catch (error) {
                                console.log('Error getting disease phenotypes')
                            }  
                        }
                    } else {
                        let id = diseaseArr[0].disease_id;
                        try {
                            let phens = await getPhenotypesForDiseases(id)
                            diseasePhens = phens;
                        } catch (error) {
                            console.log('Error getting disease phenotypes')
                        }
                    }
                    diseasePhens.forEach((phen) => {
                        if (!uniquePhensMap.hasOwnProperty(phen.term_id)) {
                            uniquePhensMap[phen.term_id] = phen;
                            uniquePhensList.push(phen)

                            if (this.ptPhenotypesObj.hasOwnProperty(phen.term_id)) {
                                uniqueInCommonList.push(phen)
                            }
                        }
                    })
                    diseaseObj.associatedPhenotypes = uniquePhensList;
                    diseaseObj.associationsInCommon = uniqueInCommonList;

                    if (diseaseObj.associatedPhenotypes.length > 0 && diseaseObj.associationsInCommon.length > 0) {
                        allDiseases.push(diseaseObj)
                    }
                }
                sortedDiseases = allDiseases.sort((a, b) => 
                    (b.associationsInCommon?.length || 0) - (a.associationsInCommon?.length || 0)
                );
            }
            this.diseasesLocal = sortedDiseases;
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
                            let key = disease.disease_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                            if (!acc[key]) {
                                acc[key] = [];
                            }
                            let diseaseObj = {
                                disease_name: disease.disease_name || "No disease name found",
                                disease_id: disease.disease_id,
                            }
                            acc[key].push(diseaseObj);
                        } else {
                            if (!acc[disease.disease_id]) {
                                acc[disease.disease_id] = [];
                            }
                            let diseaseObj = {
                                disease_name: disease.disease_name || "No disease name found",
                                disease_id: disease.disease_id,
                            }
                            acc[disease.disease_id].push(diseaseObj);
                        }
                        return acc;
                    }, {});

                    newGenes[gene] = {inCommonPhens, diseasesGrouped};
                });
                sv.structGenesWithPhenoOverlap = newGenes;
                return sv;
            })

            this.relevantSvsLocal = editedSvs
        },
    },
    computed: {},
    watch: {
        svList: {
            async handler() {
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
            },
        },
        ptPhenotypes: {
            async handler() {
                this.setPtPhenotypesObj();
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
            },
        },
        phenRelatedGenes: {
            async handler() {
                this.setPtPhenotypesObj();
                this.getSvsWithPhenGenes();
                await this.getDiseasesLocal();
                this.getPhensNotAccountedFor();
            },
        },
    },
}
</script>

<style lang="sass">
    #phenotype-summary
        overflow-y: auto
        margin-top: 20px
        display: flex
        flex-direction: column
        gap: 10px
        .title
            width: 100%
            text-align: center
            margin: 0px
            padding: 0px
    .summary-container
        display: flex
        flex-direction: row
        gap: 10px
        align-items: flex-start
        justify-content: space-evenly
    .sv-container
        display: flex
        flex-direction: column
        align-items: flex-start
        justify-content: flex-start
        padding: 2px 10px
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
    .phens-not-accounted-for
        margin-bottom: 20px
        border: 1px solid #f0f0f0
        padding: 0px
        border-radius: 5px  
        font-size: 14px
        width: fit-content
        h3
            margin-bottom: 10px
            margin-top: 0px
            text-align: center
            padding: 5px
            font-weight: normal
            background-color: #f0f0f0
        .term
            padding-left: 20px
            padding-right: 20px
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
        width: fit-content
        padding: 5px
        border-radius: 5px
        margin-bottom: 5px
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
    .select-view-container
        display: flex
        flex-direction: row
        gap: 10px
        align-items: center
        justify-content: center
        margin-bottom: 10px
        .view-select
            width: 100px
            height: 30px
            border-radius: 5px
            border: 1px solid #f0f0f0
            padding: 5px
            font-size: 14px
            font-weight: bold
    .phen-in-common-header
        font-style: italic
        color: #666
        margin-bottom: 5px
        margin-top: 10px
        font-size: 14px
        font-weight: normal
</style>
