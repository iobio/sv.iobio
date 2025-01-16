<template>
    <div id="lower-modal" :class="{ hidden: this.hidden }">
        <div class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>close</title>
                <path
                    d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
            </svg>
        </div>

        <div id="upper-section">
            <h3 v-if="type == 'variant'">
                SV Details (<span class="variant-code">{{ variant.svCode }}</span
                >)
            </h3>
            <div class="column">
                <div class="top-row">
                    <!-- <fieldset class="actions fieldset-buttons-container">
                        <legend>Actions</legend>
                        <button>IGV Breakends</button>
                        <button>Sample Coverage</button>
                        <button>Pull SNPs</button>
                    </fieldset> -->

                    <div class="variant-information">
                        <div class="variant-summary-column">
                            <div class="item">
                                <span v-html="bpFormatted(variant.size)"></span>
                            </div>
                            <div class="item" v-html="svgForZygosity(variant.genotype)"></div>
                            <div class="item">{{ formatType(variant.type) }}</div>
                        </div>

                        <div class="pop-svs">
                            <div class="fetching-message" v-if="!popSvs">
                                Fetching Overlapping SVs in Population <span class="blinking-elipse"></span>
                            </div>
                            <div class="none-found-message" v-else-if="popSvs && popSvs.length == 0">
                                No Overlapping SVs Found In Population (80% overlap threshold)
                            </div>
                            <div v-else class="pop-sv" v-for="sv in popSvs">
                                <div>Overlap: {{ sv.overlapFractionProd.toFixed(3) }}</div>
                                <div>AF: {{ parseFloat(sv.af).toFixed(7) }}</div>
                                <div>Max AF: {{ sv.pop_max_af }}</div>
                                <div v-html="`S: ${bpFormatted(sv.start)}`"></div>
                                <div v-html="`E: ${bpFormatted(sv.end)}`"></div>
                                <div v-html="`Size: ${bpFormatted(sv.svlen)}`"></div>
                                <div>Type: {{ sv.svtype }}</div>
                                <div>Source: {{ sv.source }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="lower-section">
            <div class="column gene-cards">
                <div class="column-header">Overlapped Genes</div>
                <div class="gene-card-row">
                    <div class="row" v-if="type == 'variant' && variant && Object.values(variant.overlappedGenes).length > 0">
                        <GeneAssociationsCard
                            v-for="gene in sortedRelevantGenes"
                            :key="gene.gene_symbol"
                            :gene="gene"
                            :patientPhenotypes="patientPhenotypes" />
                    </div>
                    <div
                        class="row"
                        v-if="
                            type == 'variant' &&
                            variant &&
                            Object.values(variant.overlappedGenes).length > 0 &&
                            !hideExtraGeneInfo
                        ">
                        <GeneAssociationsCard
                            v-for="gene in sortedIrrelevantGenes"
                            :key="gene.gene_symbol"
                            :gene="gene"
                            :patientPhenotypes="patientPhenotypes" />
                    </div>
                    <div
                        class="row show-more-genes"
                        v-if="
                            type == 'variant' &&
                            variant &&
                            Object.values(variant.overlappedGenes).length > 0 &&
                            sortedIrrelevantGenes.length > 0
                        ">
                        <div class="show-btn" @click="hideExtraGeneInfo = !hideExtraGeneInfo">
                            <span v-if="hideExtraGeneInfo">Show Additional Genes</span><span v-else>Hide Additional Genes</span>
                        </div>
                    </div>

                    <div
                        class="no-genes row"
                        v-if="type == 'variant' && variant && Object.values(variant.overlappedGenes).length == 0">
                        No Genes Overlapped
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as common from "../dataHelpers/commonFunctions.js";
import { getPopulationSvs } from "../dataHelpers/dataHelpers.js";
import GeneAssociationsCard from "./parts/GeneAssociationsCard.vue";

export default {
    name: "LowerModal",
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
    data() {
        return {
            popSvs: null,
            hideExtraGeneInfo: true,
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
        close() {
            this.$emit("close");
        },
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
    .pop-svs
        display: flex
        overflow-y: auto
        overflow-x: hidden
        flex-wrap: wrap
        justify-content: flex-start
        gap: 5px
        height: 100%
        flex-grow: 1
        padding: 10px 5px
        .pop-sv
            display: flex
            flex-direction: column
            flex-wrap: wrap
            height: 100%
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
            width: 50%
            display: flex
            align-items: center
        .none-found-message
            font-weight: 200
            font-style: italic
            color: #666666
            margin: 5px
            width: 50%
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
        .variant-code
            font-weight: 200
            font-size: 0.9em
            text-transform: none
            color: #666666
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
            display: flex
            flex-direction: row
            height: 100%
            flex: 1 0
            overflow: hidden
            .variant-summary-column
                display: flex
                flex-direction: column
                gap: 5px
                width: 15%
                min-width: 210px
                border: 1px solid #C1D1EA
                border-radius: 5px
                padding: 5px
                .item
                    color: #2A65B7
                    font-weight: 200
                    svg
                        width: 20px
                        height: 20px
                        fill: #2A65B7
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
    .gene-card-row
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
        .row
            display: flex
            flex-direction: row
            align-items: center
            justify-content: center
            height: 100%
    .show-more-genes
        height: 100%
        display: flex
        align-items: center
        justify-content: center
        .show-btn
            font-size: .8em
            cursor: pointer
            padding: 5px
            font-weight: 200
            font-style: italic
            color: #666666
            &:hover
                color: #2A65B7
</style>
