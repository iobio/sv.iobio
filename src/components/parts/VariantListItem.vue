<template>
    <div class="variant-list-item">
        <div
            class="preview"
            :class="{ opened: showMore, focusedVariant: isFocusedVariant, hasGoi: geneCandidates && geneCandidates.length > 0 }"
            @click="focusOnVariant">
            <!-- col1 -->
            <div class="chr-text">
                <div>{{ variant.chromosome }}</div>
                <div v-if="band" class="band">{{ band }}</div>
            </div>

            <!-- col2 -->
            <div v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-text">
                <strong>
                    <span :class="{ subtle: Math.round(maxSingularPhenotypes.max) == 0 }">{{
                        Math.round(maxSingularPhenotypes.max)
                    }}</span>
                    <span :class="{ subtle: numPhensAccountedFor == 0 }"> ({{ numPhensAccountedFor }}) </span>
                </strong>
            </div>
            <!-- OR -->
            <div v-else class="num-phens-text">
                <strong>
                    <span class="subtle">n/a</span>
                </strong>
            </div>

            <!-- col3 -->
            <div
                class="goi-ol-text"
                v-if="geneCandidates && geneCandidates.length > 0"
                :class="{ subtle: numberOfGenesOfInterest == 0 }">
                {{ numberOfGenesOfInterest }}
            </div>

            <!-- col4 -->
            <div class="total-text" :class="{ subtle: numberOfGenes == 0 }">{{ numberOfGenes }}</div>

            <!-- col5 Top -->
            <div class="zygosity-symbols">
                <div
                    class="genotype-text"
                    :class="{ het: formatGenotype(variant.genotype) == 'Het', homalt: formatGenotype(variant.genotype) == 'Hom' }"
                    v-html="svgForZygosity(variant.genotype)"></div>

                <div v-if="hasMom" v-html="parentZygosity.mother[0]"></div>
                <div v-if="hasDad" v-html="parentZygosity.father[0]"></div>
            </div>

            <!-- col6 -->
            <div class="type-text">{{ variant.type }}</div>

            <!-- col7 -->
            <div class="size-text" v-html="bpFormatted(variant.size)"></div>
        </div>
    </div>
</template>

<script>
import * as common from "../../dataHelpers/commonFunctions.js";

export default {
    name: "VariantListItem",
    components: {},
    props: {
        variant: Object,
        patientPhenotypes: Array,
        geneCandidates: Array,
        openedSvSet: Object,
        comparisons: Array,
        chromosomeAccumulatedMap: Object,
        placeInList: Number,
        overlapProp: Number,
        filters: Object,
        focusedVariant: Object,
    },
    data() {
        return {
            showMore: false,
            focused: false,
        };
    },
    mounted() {},
    methods: {
        formatGenotype: common.formatGenotype,
        bpFormatted: common.bpFormatted,
        formatType: common.formatType,
        svgForZygosity: common.svgForZygosity,
        variantOpened(event) {
            event.stopPropagation();
            this.showMore = !this.showMore;
            //sort the genes and phenotypes with the sortVariantInformation function
            this.variant.overlappedGenes = this.sortVariantInformation();

            if (this.showMore) {
                if (!this.focused) {
                    this.$emit("variant-clicked", this.variant, "show");
                }
            } else {
                this.focused = false;
                this.$emit("variant-clicked", this.variant, "hide");
            }
        },
        focusOnVariant() {
            this.focused = !this.focused;
            if (this.focused) {
                this.$emit("variant-clicked", this.variant, "show");
            } else {
                this.$emit("variant-clicked", this.variant, "hide");
            }
        },
        sortVariantInformation() {
            /**
             * When the variant is clicked we will call this function that sorts through this variant's genes and phenotypes
             * If we have patient phenotypes then the genes that go to the top should be the genes with the most number of phens in common with the patient
             */
            if (
                this.patientPhenotypes &&
                this.patientPhenotypes.length > 0 &&
                this.variant.overlappedGenes &&
                Object.values(this.variant.overlappedGenes).length > 0
            ) {
                let overlappedGenes = Object.values(this.variant.overlappedGenes);
                overlappedGenes.sort((a, b) => {
                    let aPhens = Object.keys(a.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    let bPhens = Object.keys(b.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype));
                    return bPhens.length - aPhens.length;
                });
                return overlappedGenes;
            } else {
                return this.variant.overlappedGenes;
            }
        },
    },
    computed: {
        band() {
            if (this.variant.bands.length > 1) {
                return this.variant.bands[0].name + " - " + this.variant.bands[this.variant.bands.length - 1].name;
            } else if (this.variant.bands.length == 1) {
                return this.variant.bands[0].name;
            }

            if (this.variant.bands.length == 0) {
                return null;
            }
        },
        parentZygosity() {
            if (
                this.comparisons &&
                this.comparisons.length > 0 &&
                this.chromosomeAccumulatedMap &&
                this.chromosomeAccumulatedMap.size > 0
            ) {
                let mother = this.comparisons.find((comp) => comp.relation.toLowerCase() == "mother");
                let father = this.comparisons.find((comp) => comp.relation.toLowerCase() == "father");

                let svChrStart = this.chromosomeAccumulatedMap.get(this.variant.chromosome).start;
                let svStart = this.variant.start + svChrStart;
                let svEnd = this.variant.end + svChrStart;
                let svSize = svEnd - svStart;

                let overlapSize = 0;
                let olprop = 0;
                let parentSvgs = {
                    mother: [],
                    father: [],
                };

                if (mother && mother.svList.length > 0) {
                    let momHasOverlap = false;
                    for (let variant of mother.svList) {
                        let compGenotype = variant.genotype.slice(0, 3);
                        let chr2Start = this.chromosomeAccumulatedMap.get(variant.chromosome).start;
                        let sv2Start = variant.start + chr2Start;
                        let sv2End = variant.end + chr2Start;

                        if (
                            (sv2Start >= svStart && sv2Start <= svEnd) ||
                            (sv2End >= svStart && sv2End <= svEnd) ||
                            (svStart >= sv2Start && svStart <= sv2End) ||
                            (svEnd >= sv2Start && svEnd <= sv2End)
                        ) {
                            overlapSize = Math.min(svEnd, sv2End) - Math.max(svStart, sv2Start);
                            olprop = (overlapSize / svSize).toFixed(2);
                            //essentially if there is something that overlaps more than or equal to the overlapProp then we return that
                            if (olprop >= this.overlapProp) {
                                parentSvgs.mother.push(this.svgForZygosity(variant.genotype));
                                momHasOverlap = true;
                            }
                        }
                    }

                    if (!momHasOverlap) {
                        parentSvgs.mother.push(this.svgForZygosity("0/0"));
                    }
                }

                if (father && father.svList.length > 0) {
                    let dadHasOverlap = false;
                    for (let variant of father.svList) {
                        let compGenotype = variant.genotype.slice(0, 3);
                        let chr2Start = this.chromosomeAccumulatedMap.get(variant.chromosome).start;
                        let sv2Start = variant.start + chr2Start;
                        let sv2End = variant.end + chr2Start;

                        if (
                            (sv2Start >= svStart && sv2Start <= svEnd) ||
                            (sv2End >= svStart && sv2End <= svEnd) ||
                            (svStart >= sv2Start && svStart <= sv2End) ||
                            (svEnd >= sv2Start && svEnd <= sv2End)
                        ) {
                            overlapSize = Math.min(svEnd, sv2End) - Math.max(svStart, sv2Start);
                            olprop = (overlapSize / svSize).toFixed(2);
                            //essentially if there is something that overlaps more than or equal to the overlapProp then we return that
                            if (olprop >= this.overlapProp) {
                                parentSvgs.father.push(this.svgForZygosity(variant.genotype));
                                dadHasOverlap = true;
                            }
                        }
                    }
                    if (!dadHasOverlap) {
                        parentSvgs.father.push(this.svgForZygosity("0/0"));
                    }
                }

                return parentSvgs;
            }
        },
        reciprocalOverlap() {
            if (
                this.comparisons &&
                this.comparisons.length > 0 &&
                this.chromosomeAccumulatedMap &&
                this.chromosomeAccumulatedMap.size > 0
            ) {
                let joinedCompList = [];
                for (let comparison of this.comparisons) {
                    joinedCompList.push(...comparison.svList);
                }

                let overlapSize = 0;
                let olprop = 0;
                let svChrStart = this.chromosomeAccumulatedMap.get(this.variant.chromosome).start;
                let svStart = this.variant.start + svChrStart;
                let svEnd = this.variant.end + svChrStart;
                let svSize = svEnd - svStart;

                let firstParent = false;

                for (let variant of joinedCompList) {
                    let compGenotype = variant.genotype.slice(0, 3);
                    let chr2Start = this.chromosomeAccumulatedMap.get(variant.chromosome).start;
                    let v2Start = variant.start + chr2Start;
                    let v2End = variant.end + chr2Start;

                    if (
                        (sv2Start >= svStart && sv2Start <= svEnd) ||
                        (sv2End >= svStart && sv2End <= svEnd) ||
                        (svStart >= sv2Start && svStart <= sv2End) ||
                        (svEnd >= sv2Start && svEnd <= sv2End)
                    ) {
                        overlapSize = Math.min(svEnd, v2End) - Math.max(svStart, v2Start);
                        olprop = (overlapSize / svSize).toFixed(2);
                        //essentially if there is something that overlaps more than or equal to the overlapProp then we return that
                        if (olprop >= this.overlapProp) {
                            if (this.variant.genotype.slice(0, 3) == "1/1") {
                                if (compGenotype == "1/1") {
                                    return "I";
                                } else {
                                    if (!firstParent) {
                                        firstParent = true;
                                        continue;
                                    } else {
                                        return "AR";
                                    }
                                }
                            } else {
                                return "I";
                            }
                        }
                    }
                }

                if (firstParent) {
                    return "AR";
                } else {
                    return "N";
                }
            } else if (this.filters && this.filters.denovoOnly) {
                return "N";
            } else {
                return "";
            }
        },
        hasMom() {
            return this.comparisons.some((comparison) => {
                return comparison.relation.toLowerCase() == "mother";
            });
        },
        hasDad() {
            return this.comparisons.some((comparison) => {
                return comparison.relation.toLowerCase() == "father";
            });
        },
        numberOfGenes() {
            if (this.variant.overlappedGenes && Object.keys(this.variant.overlappedGenes).length > 0) {
                return Object.keys(this.variant.overlappedGenes).length;
            } else {
                return 0;
            }
        },
        cumulativeNumOfPhenotypes() {
            if (this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
                let overlappedPhens = [];
                for (let gene of Object.values(this.variant.overlappedGenes)) {
                    overlappedPhens.push(...Object.keys(gene.phenotypes));
                }
                overlappedPhens = new Set(overlappedPhens);
                return overlappedPhens.size;
            } else {
                return 0;
            }
        },
        numberOfGenesInCommon() {
            if (this.variant.genesInCommon) {
                return this.variant.genesInCommon.length + this.variant.overlappedPhenGenes.length;
            }
        },
        numberOfGenesOfInterest() {
            if (this.geneCandidates && this.geneCandidates.length > 0) {
                //how many of the overlapped genes are in the geneCandidates
                let genesOfInterest = 0;
                for (let gene of Object.values(this.variant.overlappedGenes)) {
                    if (this.geneCandidates.includes(gene.gene_symbol)) {
                        genesOfInterest += 1;
                    }
                }
                return genesOfInterest;
            } else {
                return 0;
            }
        },
        numPhensAccountedFor() {
            /**
             * The total number of phenotypes that are accounted for in the overlapped genes
             */
            if (
                this.patientPhenotypes &&
                this.patientPhenotypes.length > 0 &&
                this.variant.overlappedGenes &&
                Object.values(this.variant.overlappedGenes).length > 0
            ) {
                let inCommonOverlappedPhens = [];
                for (let gene of Object.values(this.variant.overlappedGenes)) {
                    inCommonOverlappedPhens.push(
                        ...Object.keys(gene.phenotypes).filter((phenotype) => this.patientPhenotypes.includes(phenotype)),
                    );
                }
                inCommonOverlappedPhens = new Set(inCommonOverlappedPhens);
                return inCommonOverlappedPhens.size;
            } else {
                return 0;
            }
        },
        maxSingularPhenotypes() {
            /**
             * The max number of phenotypes that are accounted for in a single gene overlapped by the variant
             */
            if (
                this.patientPhenotypes &&
                this.patientPhenotypes.length > 0 &&
                this.variant.overlappedGenes &&
                Object.values(this.variant.overlappedGenes).length > 0
            ) {
                let maxPercent = 0;
                let maxPhens = 0;
                let geneName = "";
                for (let gene of Object.values(this.variant.overlappedGenes)) {
                    let inCommonPhens = Object.keys(gene.phenotypes).filter((phenotype) =>
                        this.patientPhenotypes.includes(phenotype),
                    );
                    let percent = (inCommonPhens.length / this.patientPhenotypes.length) * 100;
                    if (percent > maxPercent) {
                        maxPercent = percent;
                        maxPhens = inCommonPhens.length;
                        geneName = gene.gene_symbol;
                    }
                }
                return { max: maxPhens, geneName: geneName };
            } else {
                return { max: 0 };
            }
        },
        isFocusedVariant() {
            if (!this.focusedVariant) {
                return false;
            }

            if (
                this.focusedVariant.chromosome === this.variant.chromosome &&
                this.focusedVariant.start === this.variant.start &&
                this.focusedVariant.end === this.variant.end &&
                this.focusedVariant.type === this.variant.type
            ) {
                return true;
            } else {
                return false;
            }
        },
    },
    watch: {},
};
</script>

<style lang="sass">
.variant-list-item
    width: 100%
    min-width: 200px
    min-height: 45px
    position: relative
    .novel-tag
        display: flex
        justify-content: center
        align-items: center
        position: absolute
        top: -1px
        right: 0px
        svg
            height: 13px
            width: 13px
            fill: red
            pointer-events: none
    .focus-indicator
        display: flex
        justify-content: center
        align-items: center
        position: absolute
        top: 0px
        right: 0px
        width: 25px
        height: 25px
        svg
            height: 20px
            width: 20px
            fill: #FFB60A
            pointer-events: none
    .preview
        position: relative
        display: grid
        grid-template-columns: minmax(0, .1fr) minmax(0, .25fr) minmax(0, .2fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr)
        grid-template-rows: 1fr 1fr
        padding: 5px
        width: 100%
        box-sizing: border-box
        border-bottom: 1px solid #F5F5F5
        border-top: 2px solid transparent
        border-left: 2px solid transparent
        border-right: 2px solid transparent
        &.hasGoi
            grid-template-columns: minmax(0, .1fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .3fr) minmax(0, .15fr) minmax(0, .15fr)
        &.focusedVariant
            border: 2px solid #FFB60A
            border-radius: 5px
        &.opened
            box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
            background-color: #DEE9F7
            border-bottom: 1px solid #DEE9F7
        .exp-collapse-carrot
            display: flex
            justify-content: center
            align-items: center
            align-self: flex-end
            border-radius: 50%
            border: 2px solid transparent
            height: fit-content
            transition: border 0.2s ease-in-out, border-radius 0.2s ease-in-out
            &:hover
                cursor: pointer
                border: 2px solid #2A65B7
                border-radius: 5px
            svg
                height: 20px
                width: 20px
                fill: #2A65B7
                pointer-events: none
        .goi-ol-text
            font-weight: 200
            grid-row: 1/3
            color: #474747
            display: flex
            align-items: center
            justify-content: center
            text-align: center
            &.subtle
                opacity: .4
            .na

                opacity: .4
        .num-phens-text
            padding: 3px 3px
            display: flex
            flex-direction: column
            align-items: center
            justify-content: center
            text-align: center
            box-sizing: border-box
            grid-row: 1/3
            font-size: 0.8em
            strong
                font-size: 1.2em
                margin: 0px
            .subtle
                opacity: .4
                font-weight: 200
                color: #474747
            .max-gene
                font-weight: 400
                padding-top: 3px
        .zygosity-symbols
            align-items: center
            color: #474747
            display: flex
            font-size: .8em
            font-weight: 200
            grid-row: 1/3
            justify-content: space-evenly
            position: relative
            width: 100%
            svg
                height: 15px
                width: 15px
                fill: #474747
        .genotype-text
            font-size: 0.75em
            border-radius: 5px
            text-transform: uppercase
            color: #474747
            font-weight: 200
            display: flex
            align-items: flex-start
            &.homalt
                color: red
            svg
                height: 15px
                width: 15px
                fill: #474747
        .size-text
            font-size: 0.8em
            font-weight: 200
            color: #474747
            grid-row: 1/3
            .bp-sc
                font-size: 0.9em
                opacity: .8
        .type-text
            border-radius: 5px
            font-size: 0.75em
            font-weight: 200
            opacity: .8
            grid-row: 1/3
        .chr-text
            font-weight: 200
            grid-row: 1/3
            color: #474747
            display: flex
            flex-direction: column
            align-items: center
            justify-content: center
            text-align: cente
            overflow: visible
            .band
                font-size: 0.75em
                font-weight: 200
                color: #474747
                margin-left: 5px
                display: flex
                align-self: flex-start
                overflow: visible
                white-space: nowrap
                transform: translateY(3px)
        .total-text
            font-weight: 200
            grid-row: 1/3
            color: #474747
            display: flex
            align-items: center
            justify-content: center
            text-align: center
            &.subtle
                opacity: .4
        div
            display: flex
            align-items: center
            justify-content: center
        &:hover
            background-color: #F5F5F5
            cursor: pointer
</style>
