<template>
    <div id="phenotype-details">
        <div id="upper-section">
            <div class="column">
                <div class="top-row">
                    <fieldset class="variant-summary-column">
                        <legend>Summary</legend>
                        <div class="item bold-text">
                            <span>{{ variant.svCode }}</span>
                        </div>
                        <div class="item">
                            <span>Size: </span>
                            <span v-html="bpFormatted(variant.size)"></span>
                        </div>
                        <div class="item">
                            <span>Start: </span>
                            <span v-html="bpFormatted(variant.start)"></span>
                        </div>
                        <div class="item">
                            <span>End: </span>
                            <span v-html="bpFormatted(variant.end)"></span>
                        </div>
                        <div class="item">
                            <span>Type: </span>
                            <span>{{ formatType(variant.type) }}</span>
                        </div>
                        <div class="item">
                            <span>Zygosity: </span>
                            <span v-html="svgForZygosity(variant.genotype)"></span>
                            <span>{{ formatGenotype(variant.genotype).toUpperCase() }}</span>
                        </div>
                        <div v-if="variant.svafotateMaxAf" class="item">
                            <span>Max Af: </span>
                            <span>{{ parseFloat(variant.svafotateMaxAf).toExponential(3) }}</span>
                        </div>
                        <div v-if="variant.dupHChr" class="item">
                            <span>FC Chr: </span>
                            <span>{{ parseFloat(variant.dupHChr).toExponential(2) }}</span>
                        </div>
                        <div v-if="variant.dupHFlank" class="item">
                            <span>FC Flank: </span>
                            <span>{{ parseFloat(variant.dupHFlank).toExponential(2) }}</span>
                        </div>
                        <div v-if="variant.dupHBinGC" class="item">
                            <span>FC Sim GC: </span>
                            <span>{{ parseFloat(variant.dupHBinGC).toExponential(2) }}</span>
                        </div>
                        <div v-if="variant.gcFraction" class="item">
                            <span>GC Fraction: </span>
                            <span>{{ parseFloat(variant.gcFraction).toExponential(2) }}</span>
                        </div>
                    </fieldset>

                    <fieldset class="pop-svs">
                        <legend>Population SVs ({{ popSvLen }})</legend>
                        <div class="fetching-message" v-if="!popSvs">
                            Fetching Overlapping SVs in Population <span class="blinking-elipse"></span>
                        </div>
                        <div class="none-found-message" v-else-if="popSvs && popSvs.length == 0">
                            No Overlapping SVs Found In Population <br />
                            (80% overlap threshold)
                        </div>
                        <div v-else class="pop-sv" v-for="sv in popSvs">
                            <div v-html="`Size: ${bpFormatted(sv.svlen)}`"></div>
                            <div v-html="`Start: ${bpFormatted(sv.start)}`"></div>
                            <div v-html="`End: ${bpFormatted(sv.end)}`"></div>
                            <div>Type: {{ formatType(sv.svtype) }}</div>
                            <div>Overlap: {{ sv.overlapFractionProd.toFixed(2) }}</div>
                            <div>AF: {{ parseFloat(sv.af).toExponential(2) }}</div>
                            <div>Max AF: {{ parseFloat(sv.pop_max_af).toExponential(2) }}</div>
                            <div>Source: {{ sv.source }}</div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>

        <div id="lower-section">
            <fieldset class="column gene-cards">
                <legend>Overlapped Genes</legend>

                <div class="select-organization-btn-container">
                    <label for="organization-select">Organize By:</label>
                    <select v-model="selectedOrganization" class="organization-select">
                        <option value="genes">Genes</option>
                        <option value="diseases">Diseases</option>
                    </select>
                </div>
                <div class="gene-card-row">
                    <div class="row" v-if="variant && Object.values(variant.overlappedGenes).length > 0">
                        <GeneAssociationsCard
                            v-for="gene in sortedRelevantGenes"
                            :key="gene.gene_symbol"
                            :gene="gene"
                            :doseGenes="doseGenes"
                            :patientPhenotypes="patientPhenotypes" />
                    </div>
                    <div class="row" v-if="variant && Object.values(variant.overlappedGenes).length > 0 && !hideExtraGeneInfo">
                        <GeneAssociationsCard
                            v-for="gene in sortedIrrelevantGenes"
                            :key="gene.gene_symbol"
                            :gene="gene"
                            :doseGenes="doseGenes"
                            :patientPhenotypes="patientPhenotypes" />
                    </div>
                    <div
                        class="show-more-genes"
                        v-if="variant && Object.values(variant.overlappedGenes).length > 0 && sortedIrrelevantGenes.length > 0">
                        <div class="show-btn" @click="hideExtraGeneInfo = !hideExtraGeneInfo">
                            <span v-if="hideExtraGeneInfo">Show Additional Genes</span><span v-else>Hide Additional Genes</span>
                        </div>
                    </div>

                    <div class="no-genes row" v-if="variant && Object.values(variant.overlappedGenes).length == 0">
                        No Genes Overlapped
                    </div>
                </div>
            </fieldset>
        </div>
    </div>
</template>

<script>
import * as common from "../dataHelpers/commonFunctions.js";
import { getPopulationSvs } from "../dataHelpers/dataHelpers.js";
import GeneAssociationsCard from "./parts/GeneAssociationsCard.vue";

export default {
    name: "PhenotypeDetails",
    components: {
        GeneAssociationsCard,
    },
    props: {
        variant: Object,
        patientPhenotypes: Array,
        geneCandidates: Array,
        chromosomeAccumulatedMap: Object,
        doseGenes: Object,
    },
    data() {
        return {
            popSvs: null,
            hideExtraGeneInfo: true,
            selectedOrganization: "genes",
        };
    },
    async mounted() {
        try {
            this.popSvs = await getPopulationSvs(this.variant);
        } catch (error) {
            this.popSvs = [];
        }
    },
    methods: {
        formatGenotype: common.formatGenotype,
        svgForZygosity: common.svgForZygosity,
        bpFormatted: common.bpFormatted,
        formatType: common.formatType,
    },
    computed: {
        sortedRelevantGenes() {
            /**
             * If we have phenotypes, sort the overlapped genes by the number of phenotypes they have in common with the patient.
             * If we don't have phenotypes, sort by number of phenotypes and diseases associated with the gene.
             * If we don't have genes or phenotypes we will never return those here that will be for the next computed property.
             */

            if (!this.variant.overlappedGenes || Object.values(this.variant.overlappedGenes).length == 0) {
                return [];
            } else if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
                let overlappedGenes = Object.values(this.variant.overlappedGenes);

                //Filter first so that our sort is more efficient
                overlappedGenes = overlappedGenes.filter((gene) => {
                    let phens = Object.keys(gene.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    return phens.length > 0;
                });

                //Order by the number of phenotypes in common with the patient
                overlappedGenes.sort((a, b) => {
                    let aPhens = Object.keys(a.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    let bPhens = Object.keys(b.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    return bPhens.length - aPhens.length;
                });

                return overlappedGenes;
            } else {
                let overlappedGenes = Object.values(this.variant.overlappedGenes);

                //Filter by genes that have diseases or phenotypes
                overlappedGenes = overlappedGenes.filter((gene) => {
                    return Object.keys(gene.phenotypes).length > 0 || Object.keys(gene.diseases).length > 0;
                });

                //Order by the number of phenotypes and diseases associated with the gene
                overlappedGenes.sort((a, b) => {
                    let aPhens = Object.keys(a.phenotypes).length + Object.keys(a.diseases).length;
                    let bPhens = Object.keys(b.phenotypes).length + Object.keys(b.diseases).length;
                    return bPhens - aPhens;
                });

                return overlappedGenes;
            }
        },
        sortedIrrelevantGenes() {
            if (!this.variant.overlappedGenes || Object.values(this.variant.overlappedGenes).length == 0) {
                return [];
            } else if (this.patientPhenotypes && this.patientPhenotypes.length > 0) {
                let overlappedGenes = Object.values(this.variant.overlappedGenes);

                //Find genes that don't have phenotypes in common with the patient as those were skipped in the previous computed property
                overlappedGenes = overlappedGenes.filter((gene) => {
                    let phens = Object.keys(gene.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    return phens.length == 0;
                });

                //Order by the total phenotypes and associations with the gene
                overlappedGenes.sort((a, b) => {
                    let aPhens = Object.keys(a.phenotypes).length + Object.keys(a.diseases).length;
                    let bPhens = Object.keys(b.phenotypes).length + Object.keys(b.diseases).length;
                    return bPhens - aPhens;
                });

                return overlappedGenes;
            } else {
                let overlappedGenes = Object.values(this.variant.overlappedGenes);

                //Find genes that don't have phenotypes or diseases in this case those were skipped in the previous computed property
                overlappedGenes = overlappedGenes.filter((gene) => {
                    return Object.keys(gene.phenotypes).length == 0 && Object.keys(gene.diseases).length == 0;
                });

                //If this is the situation there is nothing to order these by so we just return them
                return overlappedGenes;
            }
        },
        popSvLen() {
            if (this.popSvs) {
                return this.popSvs.length;
            } else {
                return "?";
            }
        },
        hasAnyOptionalAnnotations() {
            return (
                this.variant.dupHChr ||
                this.variant.dupHFlank ||
                this.variant.dupHBinGC ||
                this.variant.gcFraction ||
                this.variant.svafotateMaxAf
            );
        },
    },
    watch: {
        variant: {
            handler: async function (newVal, oldVal) {
                this.hideExtraGeneInfo = true;
                this.popSvs = null;
                try {
                    this.popSvs = await getPopulationSvs(this.variant);
                } catch (error) {
                    this.popSvs = [];
                }
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
#phenotype-details
    width: 100%
    height: 100%
    box-sizing: border-box
    position: relative
    display: flex
    flex-direction: column
    justify-content: flex-start
    align-items: space-between
    background-color: white
    padding: 5px 10px 5px 1px
    overflow: hidden
    .pop-svs
        display: flex
        overflow-y: auto
        overflow-x: hidden
        flex-wrap: wrap
        justify-content: flex-start
        gap: 5px
        height: 100%
        padding: 10px 5px
        flex: 1 0
        border: none
        border-top: 1px solid #E0E0E0
        legend
            font-weight: 200
            font-style: italic
            font-size: 0.8em
            color: #666666
        .pop-sv
            display: flex
            flex-direction: column
            flex-wrap: wrap
            height: 100%
            min-width: 205px
            gap: 5px
            border: 1px solid #C1D1EA
            border-radius: 5px
            padding: 5px
            margin: 5px
            font-size: 0.8em
        .fetching-message
            font-weight: 200
            font-style: italic
            color: #666666
            margin: 5px
            width: 100%
            display: flex
            align-items: center
        .none-found-message
            font-weight: 200
            font-style: italic
            color: #666666
            margin: 5px
            width: 100%
            display: flex
            align-items: center
        .blinking-elipse
            display: inline-block
            font-size: 16px
            font-weight: bold
            position: relative
    .blinking-elipse::after
        content: ""
        animation: fadeInElipsis 1s infinite steps(3)
    @keyframes fadeInElipsis
        0%
            content: ""
        33%
            content: "."
        66%
            content: ". ."
        100%
            content: ". . ."
    .bp-sc
        font-size: 0.8em
        margin-right: 5px
    #upper-section
        height: 180px
        max-height: 30%
        box-sizing: border-box
        display: flex
        flex-direction: column
    #lower-section
        flex: 1 0
        box-sizing: border-box
        display: flex
        flex-direction: column
        overflow: hidden
    .column
        display: flex
        flex-direction: column
        align-items: center
        width: 100%
        padding: 5px
        overflow: hidden
        &.gene-cards
            min-width: 0
            height: 100%
            border: none
            border-top: 1px solid #E0E0E0
            legend
                font-weight: 200
                font-style: italic
                font-size: 0.8em
                color: #666666
    .top-row
        display: flex
        flex-direction: row
        gap: 10px
        width: 100%
        max-height: 100%
        overflow: hidden
        .variant-summary-column
            display: flex
            flex-direction: column
            flex-wrap: wrap
            gap: 5px
            border: none
            border-top: 1px solid #E0E0E0
            padding: 10px
            overflow: hidden
            flex: .5 0
            legend
                font-weight: 200
                font-style: italic
                font-size: 0.8em
                color: #666666
            .item
                color: #2A65B7
                font-weight: 200
                font-size: 0.9em
                display: flex
                align-items: center
                gap: 5px
                svg
                    width: 20px
                    height: 20px
                    fill: #2A65B7
                &.bold-text > span
                    font-weight: 600
    .gene-card-row
        display: flex
        align-items: flex-start
        justify-content: flex-start
        flex-wrap: wrap
        padding: 5px
        flex: 1 0
        overflow-x: hidden
        overflow-y: auto
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
        .row
            display: flex
            flex-direction: row
            width: 100%
            align-items: flex-start
            gap: 6px
            margin-bottom: 6px
            flex-wrap: wrap
            justify-content: flex-start
    .show-more-genes
        display: flex
        flex-direction: column
        width: 100%
        align-items: flex-start
        justify-content: flex-start
        .show-btn
            background-color: #F5F5F5
            border-radius: 5px
            padding: 5px
            align-self: flex-end
            font-size: .8em
            cursor: pointer
            padding: 5px
            font-weight: 200
            font-style: italic
            color: #666666
            &:hover
                color: #2A65B7
    .select-organization-btn-container
        display: flex
        flex-direction: row
        align-items: center
        justify-content: center
        padding: 0px
        overflow: hidden
        font-size: 0.8em
        color: #474747
        align-self: flex-end
        margin-bottom: 10px
        .organization-select
            border: none
            width: 120px
            text-transform: uppercase
            color: #474747
            height: 100%
            border: 1px solid #E0E0E0
            border-radius: 5px
            font-weight: 200
            margin-left: 5px
            background-color: white
            padding: 2px 5px
            cursor: pointer
            outline: none
            &:hover
                background-color: #E0E0E0
            &:focus
                background-color: #EBEBEB
</style>
