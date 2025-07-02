<template>
    <div class="variant-list-item">
        <div
            class="preview"
            :class="{
                opened: showMore,
                focusedVariant: isFocusedVariant,
                hasGoi: geneCandidates && geneCandidates.length > 0 && (displayMode == 'expanded' || displayMode == 'normal'),
                condensed: displayMode == 'condensed',
                expanded: displayMode == 'expanded',
            }"
            @click="focusOnVariant">
            <!-- col0 -->
            <div class="favorite-tag" @click.stop="favoriteVariant" :class="{ favorite: variant.favorite }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>favorite</title>
                    <path
                        d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" />
                </svg>
            </div>

            <div class="hide-tag" @click.stop="hideVariant">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>hide</title>
                    <path
                        d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z" />
                </svg>
            </div>

            <!-- col1 -->
            <div class="chr-text">
                <div>{{ variant.chromosome }}</div>
            </div>
            <div v-if="band" class="band">{{ band }}</div>

            <!-- col2 -->
            <div class="size-text" v-html="bpFormatted(variant.size)"></div>

            <!-- col3 -->
            <div class="type-text">{{ variant.type }}</div>

            <!-- col4 -->
            <div class="zygosity-symbols">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Proband</title>
                        <path
                            d="M9,7H13A2,2 0 0,1 15,9V11A2,2 0 0,1 13,13H11V17H9V7M11,9V11H13V9H11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>
                    <div v-html="svgForZygosity(variant.genotype)"></div>
                </div>

                <div>
                    <svg v-if="hasMom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Mother</title>
                        <path
                            d="M9,7H15A2,2 0 0,1 17,9V17H15V9H13V16H11V9H9V17H7V9A2,2 0 0,1 9,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>
                    <div v-if="hasMom" v-html="parentZygosity.mother[0]"></div>
                </div>

                <div>
                    <svg v-if="hasDad" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Father</title>
                        <path
                            d="M9,7H15V9H11V11H14V13H11V17H9V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>
                    <div v-if="hasDad" v-html="parentZygosity.father[0]"></div>
                </div>
            </div>

            <!-- col5 Top -->
            <div
                class="goi-ol-text"
                v-if="geneCandidates && geneCandidates.length > 0 && (displayMode == 'expanded' || displayMode == 'normal')"
                :class="{ subtle: numberOfGenesOfInterest == 0 }">
                {{ numberOfGenesOfInterest }}
            </div>

            <!-- col6 -->
            <div
                v-if="displayMode == 'expanded' || displayMode == 'normal'"
                class="total-text"
                :class="{ subtle: numberOfGenes == 0 }">
                {{ numberOfGenes }}
            </div>

            <!-- col7 -->
            <div v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-text">
                <!-- <span
                        v-if="displayMode == 'expanded' || displayMode == 'normal'"
                        :class="{ subtle: Math.round(maxSingularPhenotypes.max) == 0 }"
                        >{{ Math.round(maxSingularPhenotypes.max) }}</span
                    >
                    <span
                        v-if="displayMode == 'expanded' || displayMode == 'normal'"
                        :class="{ subtle: numPhensAccountedFor == 0 }">
                        ({{ numPhensAccountedFor }})
                    </span> -->
                <div class="phenotypes-preview" v-if="displayMode == 'expanded' || displayMode == 'normal'">
                    <div class="num-phens-tag" v-if="numPhensAccountedFor > 0">
                        {{ numPhensAccountedFor }}
                    </div>
                    <span class="phenotype-tag" v-for="phenotype in overlappedPhenotypes" :key="phenotype">
                        {{ phenotype }}
                    </span>
                </div>
                <span v-if="displayMode == 'condensed'" :class="{ subtle: numPhensAccountedFor == 0 }">
                    {{ numPhensAccountedFor }}
                </span>
            </div>
            <!-- OR -->
            <div v-else class="num-phens-text">
                <strong>
                    <span class="subtle">n/a</span>
                </strong>
            </div>
        </div>
    </div>
</template>

<script>
import * as common from "../../dataHelpers/commonFunctions.js";
import { searchForHPO } from "../../dataHelpers/dataHelpers.js";

export default {
    name: "VariantListItem",
    components: {},
    props: {
        variant: Object,
        patientPhenotypes: Array,
        geneCandidates: Array,
        comparisons: Array,
        displayMode: String,
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
            overlappedPhenotypes: [],
        };
    },
    mounted() {
        this.updateOverlappedPhenotypes();
    },
    methods: {
        formatGenotype: common.formatGenotype,
        bpFormatted: common.bpFormatted,
        formatType: common.formatType,
        svgForZygosity: common.svgForZygosity,
        favoriteVariant() {
            this.$emit("favorite-variant", this.variant);
        },
        hideVariant() {
            this.$emit("hide-variant", this.variant);
        },
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
        async updateOverlappedPhenotypes() {
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

                let inCommonNames = [];
                for (let hpo of inCommonOverlappedPhens) {
                    try {
                        const result = await searchForHPO(hpo);
                        if (result && result.length > 0 && result[0].name) {
                            inCommonNames.push(result[0].name);
                        } else {
                            // Fallback to using the HPO ID if lookup fails or returns no results
                            inCommonNames.push(hpo);
                        }
                    } catch (error) {
                        console.error(`Error looking up HPO ${hpo}:`, error);
                        // Fallback to using the HPO ID if lookup fails
                        inCommonNames.push(hpo);
                    }
                }
                this.overlappedPhenotypes = inCommonNames;
            } else {
                this.overlappedPhenotypes = [];
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
    watch: {
        patientPhenotypes: {
            handler() {
                this.updateOverlappedPhenotypes();
            },
            deep: true,
        },
        "variant.overlappedGenes": {
            handler() {
                this.updateOverlappedPhenotypes();
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
.variant-list-item
    width: 100%
    height: 100px
    min-height: 100px
    max-height: 100px
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
        grid-template-columns: minmax(0, .05fr) minmax(0, .05fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .5fr)
        grid-template-rows: 1fr 1fr
        padding: 5px
        width: 100%
        height: 100%
        box-sizing: border-box
        border-bottom: 1px solid #F5F5F5
        border-top: 2px solid transparent
        border-left: 2px solid transparent
        border-right: 2px solid transparent
        &.hasGoi
            grid-template-columns: minmax(0, .1fr) minmax(0, .1fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .2fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .25fr)
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
        &.condensed
            grid-template-columns: minmax(0, .1fr) minmax(0, .15fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .15fr)
            grid-template-rows: 1fr 1fr
        &.expanded
            grid-template-columns: minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .2fr) minmax(0, .5fr)
            grid-template-rows: 1fr 1fr
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
            position: relative
            max-height: 100%
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
            .phenotypes-preview
                display: flex
                flex-wrap: wrap
                overflow-y: auto
                max-height: 100%
                height: 100%
                .phenotype-tag
                    padding: 3px
                    border-radius: 5px
                    background-color: #F5F5F5
                    margin: 2px
                    font-size: 0.8em
                    font-weight: 200
                    color: #474747
        .zygosity-symbols
            display: flex
            flex-direction: column
            align-items: center
            color: #474747
            display: flex
            font-size: .8em
            font-weight: 200
            grid-row: 1/3
            justify-content: center
            position: relative
            width: 100%
            svg
                height: 15px
                width: 15px
                fill: #474747
        .size-text
            font-size: 0.8em
            font-weight: 200
            color: #474747
            grid-row: 1/2
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
            grid-row: 1/2
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
            grid-row: 2/3
            grid-column: 2/4
            color: #474747
            text-align: start
            overflow: visible
            white-space: nowrap
            background-color: #F5F5F5
            border-radius: 5px
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
    .favorite-tag
        grid-column: 1/2
        grid-row: 1/2
        border-radius: 5px
        svg
            height: 20px
            width: 20px
            fill: #474747
            pointer-events: none
        &:hover
            background: #e3e3e3
        &.favorite
            svg
                fill: #FFB60A
    .hide-tag
        grid-column: 1/2
        grid-row: 2/3
        border-radius: 5px
        svg
            height: 15px
            width: 15px
            fill: #474747
            pointer-events: none
        &:hover
            background: #e3e3e3
    .num-phens-tag
        position: absolute
        top: -3px
        left: 0
        border: .5px solid #474747
        padding: 1px 3px
        font-size: 0.8em
        font-weight: 200
        border-radius: 5px
        color: #474747
</style>
