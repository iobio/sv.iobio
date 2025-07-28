<template>
    <div id="phenotype-details">
        <div id="upper-section">
            <div class="column">
                <div class="top-row">
                    <fieldset class="variant-summary-column">
                        <legend>{{ variant.svCode }}</legend>
                        <div class="summary-chips">
                            <div class="chip primary">
                                <span class="chip-label">Size</span>
                                <span class="chip-value" v-html="bpFormatted(variant.size)"></span>
                            </div>
                            <div class="chip primary">
                                <span class="chip-label">Start</span>
                                <span class="chip-value" v-html="bpFormatted(variant.start)"></span>
                            </div>
                            <div class="chip primary">
                                <span class="chip-label">End</span>
                                <span class="chip-value" v-html="bpFormatted(variant.end)"></span>
                            </div>
                            <div class="chip primary">
                                <span class="chip-label">Type</span>
                                <span class="chip-value">{{ formatType(variant.type) }}</span>
                            </div>
                            <div class="chip primary zygosity-chip">
                                <span class="chip-label">Zygosity</span>
                                <span class="chip-value">
                                    <span v-html="svgForZygosity(variant.genotype)"></span>
                                    <span>{{ formatGenotype(variant.genotype).toUpperCase() }}</span>
                                </span>
                            </div>
                            <div v-if="variant.svafotateMaxAf" class="chip secondary">
                                <span class="chip-label">Max AF</span>
                                <span class="chip-value">{{ parseFloat(variant.svafotateMaxAf).toExponential(3) }}</span>
                            </div>
                            <div v-if="variant.dupHChr" class="chip secondary">
                                <span class="chip-label">FC Chr</span>
                                <span class="chip-value">{{ parseFloat(variant.dupHChr).toExponential(2) }}</span>
                            </div>
                            <div v-if="variant.dupHFlank" class="chip secondary">
                                <span class="chip-label">FC Flank</span>
                                <span class="chip-value">{{ parseFloat(variant.dupHFlank).toExponential(2) }}</span>
                            </div>
                            <div v-if="variant.dupHBinGC" class="chip secondary">
                                <span class="chip-label">FC Sim GC</span>
                                <span class="chip-value">{{ parseFloat(variant.dupHBinGC).toExponential(2) }}</span>
                            </div>
                            <div v-if="variant.gcFraction" class="chip secondary">
                                <span class="chip-label">GC Fraction</span>
                                <span class="chip-value">{{ parseFloat(variant.gcFraction).toExponential(2) }}</span>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset class="pop-svs">
                        <legend>SVAFotate Population SVs ({{ popSvLen }})</legend>
                        <div class="fetching-message" v-if="!popSvs">
                            Fetching SVAFotate Population SVs <span class="blinking-elipse"></span>
                        </div>
                        <div class="none-found-message" v-else-if="popSvs && popSvs.length == 0">
                            <div class="empty-state">
                                <div class="empty-text">
                                    <div>No Overlapping SVs Found</div>
                                    <div class="empty-subtext">(80% overlap threshold)</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="pop-svs-grid">
                            <div class="pop-sv-card" v-for="sv in popSvs" :key="`${sv.start}-${sv.end}-${sv.svtype}`">
                                <div class="pop-sv-header">
                                    <span class="sv-type-badge" :class="sv.svtype.toLowerCase()">{{
                                        formatType(sv.svtype)
                                    }}</span>
                                    <span class="sv-source">{{ sv.source }}</span>
                                </div>
                                <div class="pop-sv-metrics">
                                    <div class="metric-row">
                                        <span class="metric-label">Size</span>
                                        <span class="metric-value" v-html="bpFormatted(sv.svlen)"></span>
                                    </div>
                                    <div class="metric-row">
                                        <span class="metric-label">Position</span>
                                        <span
                                            class="metric-value"
                                            v-html="`${bpFormatted(sv.start)} - ${bpFormatted(sv.end)}`"></span>
                                    </div>
                                    <div class="metric-row">
                                        <span class="metric-label">Overlap</span>
                                        <span class="metric-value">{{ sv.overlapFractionProd.toFixed(2) }}</span>
                                    </div>
                                    <div class="metric-row">
                                        <span class="metric-label">AF</span>
                                        <span class="metric-value">{{ parseFloat(sv.af).toExponential(2) }}</span>
                                    </div>
                                    <div class="metric-row">
                                        <span class="metric-label">Max AF</span>
                                        <span class="metric-value">{{ parseFloat(sv.pop_max_af).toExponential(2) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>

        <div id="lower-section">
            <fieldset class="column gene-cards">
                <legend>Overlapped Genes</legend>
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
        build: String,
    },
    data() {
        return {
            popSvs: null,
            hideExtraGeneInfo: true,
            selectedOrganization: "genes",
        };
    },
    async mounted() {
        if (!this.build) {
            return;
        }
        try {
            this.popSvs = await getPopulationSvs(this.variant, this.build);
        } catch (error) {
            this.popSvs = [];
            console.error("Error fetching population SVs:", error);
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
                    this.popSvs = await getPopulationSvs(this.variant, this.build);
                } catch (error) {
                    this.popSvs = [];
                }
            },
            deep: true,
        },
        build: {
            handler: async function (newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    try {
                        this.popSvs = await getPopulationSvs(this.variant, newVal);
                    } catch (error) {
                        this.popSvs = [];
                        console.error("Error fetching population SVs:", error);
                    }
                }
            },
        },
    },
};
</script>

<style lang="sass">
#phenotype-details
    width: 100%
    max-width: 1000px
    height: 100%
    box-sizing: border-box
    position: relative
    display: flex
    flex-direction: column
    justify-content: flex-start
    align-items: space-between
    align-self: center
    background-color: white
    padding: 5px 10px 5px 1px
    overflow: hidden
    .pop-svs
        display: flex
        flex-direction: column
        overflow-y: auto
        overflow-x: hidden
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
        .pop-svs-grid
            display: flex
            flex-wrap: wrap
            gap: 6px
            overflow-y: auto
            align-items: flex-start
            justify-content: flex-start
        .pop-sv-card
            background: #FAFBFC
            border: 1px solid #E1E8ED
            border-radius: 6px
            padding: 8px 10px
            transition: all 0.2s ease
            flex: 0 0 auto
            min-width: 200px
            max-width: 280px
        .pop-sv-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 6px
        .sv-type-badge
            display: inline-block
            padding: 1px 6px
            border-radius: 10px
            font-size: 0.7em
            font-weight: 500
            text-transform: uppercase
            background: #d1ecf1
            color: #0c5460
        .sv-source
            font-size: 0.7em
            color: #6B7280
            font-style: italic
        .pop-sv-metrics
            display: flex
            flex-direction: column
            gap: 3px
        .metric-row
            display: flex
            justify-content: space-between
            align-items: center
            font-size: 0.75em
        .metric-label
            color: #6B7280
            font-weight: 400
        .metric-value
            color: #1F2937
            font-weight: 500
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace
        .fetching-message
            font-weight: 200
            font-style: italic
            color: #666666
            margin: 20px
            width: 100%
            display: flex
            align-items: center
            justify-content: center
        .none-found-message
            display: flex
            align-items: center
            justify-content: center
            height: 100%
            width: 100%
        .empty-state
            display: flex
            flex-direction: column
            align-items: center
            gap: 12px
            padding: 20px
            text-align: center
        .empty-icon
            font-size: 2.5em
            opacity: 0.6
        .empty-text
            color: #6B7280
            font-weight: 400
        .empty-subtext
            font-size: 0.85em
            color: #9CA3AF
            font-style: italic
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
        height: 200px
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
        gap: 15px
        width: 100%
        max-height: 100%
        overflow: hidden
        @media (max-width: 768px)
            flex-direction: column
            gap: 10px
        .variant-summary-column
            display: flex
            flex-direction: column
            gap: 4px
            border: none
            border-top: 1px solid #E0E0E0
            padding: 6px 10px
            overflow: hidden
            flex: .5 0
            @media (max-width: 768px)
                flex: 1 0
            legend
                font-weight: 600
                font-size: 1.1em
                color: #2A65B7
                text-align: center
                padding: 0
                margin-bottom: 2px
            .summary-chips
                display: flex
                flex-wrap: wrap
                gap: 8px
                align-items: flex-start
                justify-content: flex-start
                @media (max-width: 480px)
                    gap: 3px
            .chip
                display: flex
                flex-direction: column
                align-items: center
                gap: 1px
                padding: 3px 6px
                border-radius: 4px
                min-width: 50px
                text-align: center
                transition: all 0.2s ease
                cursor: default
                flex: 0 0 auto
                border: 1px solid #E0E0E0
                background: #F5F5F5
                @media (max-width: 480px)
                    padding: 2px 4px
                    min-width: 45px
                &.zygosity-chip .chip-value
                    display: flex
                    align-items: center
                    gap: 2px
                    svg
                        width: 12px
                        height: 12px
                        fill: black
            .chip-label
                font-size: 0.7em
                font-weight: 500
                color: #6B7280
                text-transform: uppercase
                letter-spacing: 0.2px
            .chip-value
                font-size: 0.8em
                font-weight: 600
                color: #1F2937
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace
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
