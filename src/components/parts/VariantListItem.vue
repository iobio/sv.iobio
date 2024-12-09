<template>
    <div id="variant-list-item">

        <div class="preview" :class="{opened: showMore, focusedVariant: isFocusedVariant}" @click="focusOnVariant">
            <div class="focus-indicator" v-if="isFocusedVariant">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Focused On</title><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></svg>
            </div>

            <span class="overlap-tip">
                <span v-if="variant.overlappedGenes && patientPhenotypes && patientPhenotypes.length" class="num-phens-accounted-perc-tip">
                    <strong>
                        <span :class="{subtle: Math.round(maxSingularPhenotypes.max) == 0 }">{{ Math.round(maxSingularPhenotypes.max)}}</span> <span class="subtle">/{{ patientPhenotypes.length }}</span>
                    </strong>
                    <span class="max-gene" v-if="Math.round(maxSingularPhenotypes.max) !== 0">{{ maxSingularPhenotypes.geneName }}</span>
                </span>
                <span v-else class="num-phens-accounted-perc-tip">
                    <strong>
                        <span class="subtle">n/a</span> <span class="subtle">/{{ patientPhenotypes.length }}</span>
                    </strong>
                </span>

                <span class="goi-ol-tip">
                    <strong>
                        <span :class="{subtle: numberOfGenesOfInterest == 0 }" v-if="variant.overlappedGenes && geneCandidates && geneCandidates.length > 0">{{ numberOfGenesOfInterest }}</span>
                        <span class="na subtle" v-else>n/a</span>
                        <span class="num-genes-overlapped-tip subtle">
                            /{{ numberOfGenes }}
                        </span>
                    </strong>    
                </span>
            </span>

            <!-- Row 1 -->
            <div class="origin-text novel" v-if="reciprocalOverlap == 'N'">DeNovo <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Noteworthy</title><path d="M10 3H14V14H10V3M10 21V17H14V21H10Z" /></svg></span></div>
            <div class="origin-text inherited" v-if="reciprocalOverlap === 'I'">Inherited</div>
            <div class="origin-text novel ar" v-if="reciprocalOverlap === 'AR'">Rec.Inherit <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Noteworthy</title><path d="M10 3H14V14H10V3M10 21V17H14V21H10Z" /></svg></span></div>

            <!-- Row 2 -->
            <div class="genotype-text" :class="{het: formatGenotype(variant.genotype) == 'Het', homalt: formatGenotype(variant.genotype) == 'Hom Alt'}">
                {{ formatGenotype(variant.genotype) }}
            </div>

            <div class="size-text" v-html="bpFormatted(variant.size)"></div>
            <div class="type-text"> {{ variant.type }}</div>
        </div>
    </div>
  </template>

<script>
  import * as common from '../../dataHelpers/commonFunctions.js'

  export default {
  name: 'VariantListItem',
  components: {
  },
  props: {
    variant: Object,
    patientPhenotypes: Array,
    geneCandidates: Array,
    openedSvSet: Object,
    comparisonsLists: Array,
    chromosomeAccumulatedMap: Object,
    placeInList: Number,
    overlapProp: Number,
    filters: Object,
    focusedVariant: Object
  },
  data () {
    return {
        showMore: false,
        focused: false,
        isFocusedVariant: false
    }
  },
  mounted () {
    let svKey = `${this.variant.chromosome}-${this.variant.start}-${this.variant.end}`
    if (svKey in this.openedSvSet) {
        // this.showMore = true
    }
  },
  methods: {
    formatGenotype: common.formatGenotype,
    bpFormatted: common.bpFormatted,
    formatType: common.formatType,
    variantOpened(event) {
        event.stopPropagation();
        this.showMore = !this.showMore
        //sort the genes and phenotypes with the sortVariantInformation function
        this.variant.overlappedGenes = this.sortVariantInformation()

        if (this.showMore) {
            if (!this.focused) {
                this.$emit('variant-clicked', this.variant, 'show')
            }
        } else {
            this.focused = false
            this.$emit('variant-clicked', this.variant, 'hide')
        }
    },
    focusOnVariant() {
        this.focused = !this.focused
        if (this.focused) {
            this.$emit('variant-clicked', this.variant, 'show')
        } else {
            this.$emit('variant-clicked', this.variant, 'hide')
        }
    },
    sortVariantInformation(){
        /**
         * When the variant is clicked we will call this function that sorts through this variant's genes and phenotypes
         * If we have patient phenotypes then the genes that go to the top should be the genes with the most number of phens in common with the patient
         */
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let overlappedGenes = Object.values(this.variant.overlappedGenes)
            overlappedGenes.sort((a, b) => {
                let aPhens = Object.keys(a.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                let bPhens = Object.keys(b.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                return bPhens.length - aPhens.length
            });
            return overlappedGenes
        } else {
            return this.variant.overlappedGenes
        }
    },
  },
  computed: {
    reciprocalOverlap() {
        //If we have no inputted patient phenotypes or gene candidates then we dont want to show the reciprocal overlap there will be too many variants
        if (this.comparisonsLists && this.comparisonsLists.length > 0 && this.chromosomeAccumulatedMap && this.chromosomeAccumulatedMap.size > 0) {
            let joinedCompList = []
            for (let list of this.comparisonsLists) {
                joinedCompList.push(...list)
            }

            let overlapSize = 0;
            let olprop = 0;
            let svChrStart = this.chromosomeAccumulatedMap.get(this.variant.chromosome).start
            let svStart = this.variant.start + svChrStart
            let svEnd = this.variant.end + svChrStart
            let svSize = svEnd - svStart

            let firstParent = false;

            for (let variant of joinedCompList) {
                let compGenotype = variant.genotype.slice(0, 3);
                let chr2Start = this.chromosomeAccumulatedMap.get(variant.chromosome).start
                let v2Start = variant.start + chr2Start
                let v2End = variant.end + chr2Start

                if (svStart < v2End && svEnd > v2Start) {
                    overlapSize = Math.min(svEnd, v2End) - Math.max(svStart, v2Start);
                    olprop = (overlapSize / svSize).toFixed(2)
                    //essentially if there is something that overlaps more than or equal to the overlapProp then we return that
                    if (olprop >= this.overlapProp) {
                        if (this.variant.genotype.slice(0,3) == '1/1') {
                            if (compGenotype == '1/1') {
                                return 'I'
                            } else {
                                if (!firstParent) {
                                    firstParent = true
                                    continue
                                } else {
                                    return 'AR'
                                }
                            }
                        } else {
                            return 'I'
                        } 
                    }
                }
            }

            if (firstParent) {
                return 'AR'
            } else {
                return 'N'
            }
        } else if (this.filters && this.filters.denovoOnly) {
            return 'N'
        } else {
            return ''
        }
    },
    numberOfGenes(){
        if (this.variant.overlappedGenes && Object.keys(this.variant.overlappedGenes).length > 0) {
            return Object.keys(this.variant.overlappedGenes).length
        } else {
            return 0;
        }  
    },
    cumulativeNumOfPhenotypes(){
        if (this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0){
            let overlappedPhens = [];
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                overlappedPhens.push(...Object.keys(gene.phenotypes)) 
            }
            overlappedPhens = new Set(overlappedPhens)
            return overlappedPhens.size;
        } else {
            return 0;
        }
    }, 
    numberOfGenesInCommon() {
        if (this.variant.genesInCommon) {
            return this.variant.genesInCommon.length + this.variant.overlappedPhenGenes.length
        }
    },
    numberOfGenesOfInterest() {
        if (this.geneCandidates && this.geneCandidates.length > 0) {
            //how many of the overlapped genes are in the geneCandidates
            let genesOfInterest = 0;
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                if (this.geneCandidates.includes(gene.gene_symbol)) {
                    genesOfInterest += 1
                }
            }
            return genesOfInterest
        } else {
            return 0
        }
    },
    numPhensAccountedFor() {
        //if there are patient phenotypes we can see how many of the overlapped phenotypes are accounted for
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let inCommonOverlappedPhens = [];
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                inCommonOverlappedPhens.push(...Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype)))
            }
            inCommonOverlappedPhens = new Set(inCommonOverlappedPhens)
            return inCommonOverlappedPhens.size;
        } else {
            return 0;
        }   
    },
    maxSingularPhenotypes() {
        if (this.patientPhenotypes && this.patientPhenotypes.length > 0 && this.variant.overlappedGenes && Object.values(this.variant.overlappedGenes).length > 0) {
            let maxPercent = 0;
            let maxPhens = 0;
            let geneName = '';
            for (let gene of Object.values(this.variant.overlappedGenes)) {
                let inCommonPhens = Object.keys(gene.phenotypes).filter(phenotype => this.patientPhenotypes.includes(phenotype))
                let percent = inCommonPhens.length / this.patientPhenotypes.length * 100
                if (percent > maxPercent) {
                    maxPercent = percent
                    maxPhens = inCommonPhens.length
                    geneName = gene.gene_symbol
                }
            }
            return { max: maxPhens, geneName: geneName}
        } else {
            return { max: 0 };
        }
    }
  },
  watch: {
    focusedVariant: function() {
        if (this.focusedVariant && this.focusedVariant.chromosome === this.variant.chromosome && this.focusedVariant.start === this.variant.start && this.focusedVariant.end === this.variant.end) {
            this.isFocusedVariant = true
            console.log(this.focusedVariant)
        } else {
            this.isFocusedVariant = false
        }
    }
  },
  }
  </script>
  
  <style lang="sass">
    #variant-list-item
        width: 100%
        min-width: 200px
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
            grid-template-columns: .23fr .23fr .23fr .11fr .2fr
            grid-template-rows: 1fr 1fr
            padding: 5px
            width: 100%
            box-sizing: border-box
            border-bottom: 1px solid #F5F5F5
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
            .overlap-tip
                display: grid
                grid-template-columns: 1fr 1fr
                grid-template-rows: 1fr 1fr
                font-weight: 200
                font-size: 0.75em
                margin-left: 1px
                grid-row: 1/3
                grid-column: 1/3
                strong
                    font-weight: 600
                    margin-left: 5px
                .goi-ol-tip
                    padding: 3px 3px
                    display: flex
                    align-items: center
                    justify-content: center
                    text-align: center
                    box-sizing: border-box
                    grid-row: 1/3
                    grid-column: 2
                    strong
                        font-size: 1.2em
                        display: flex
                        align-items: center
                        justify-content: center
                    .subtle
                        font-weight: 200
                        opacity: .7
                        color: #474747
                    .na
                        font-weight: 200
                        opacity: .7
                    .num-genes-overlapped-tip
                        padding: 3px 3px
                        display: flex
                        align-items: center
                        justify-content: center
                        text-align: center
                        box-sizing: border-box
                        grid-row: 2
                        grid-column: 2
                        b
                            padding: 0px 2px
                .num-phens-accounted-perc-tip
                    padding: 3px 3px
                    display: flex
                    flex-direction: column
                    align-items: center
                    justify-content: center
                    text-align: center
                    box-sizing: border-box
                    grid-row: 1/3
                    grid-column: 1
                    strong
                        font-size: 1.2em
                        margin: 0px
                    .subtle
                        opacity: .7
                        font-weight: 200
                        color: #474747
                    .max-gene
                        font-weight: 400
                        padding-top: 3px

            .origin-text
                font-size: .8em
                color: #474747
                position: relative
                font-weight: 200
                grid-row: 1
                grid-column: 3
                display: flex
                align-items: flex-end
                svg
                    height: 15px
                    width: 15px
                    position: absolute
                    bottom: 5px
                    right: 5px
                    fill: red
                    margin-left: 5px
                    pointer-events: none
            .genotype-text
                font-size: 0.75em
                border-radius: 5px
                text-transform: uppercase
                color: #474747
                font-weight: 200
                grid-row: 2
                grid-column: 3
                display: flex
                align-items: flex-start
            .size-text
                font-size: 0.8em
                font-weight: 200
                color: #474747
                grid-row: 1/3
                grid-column: 5
                .bp-sc
                    font-size: 0.9em
                    opacity: .7
                    transform: translateY(4px) translateX(1px)
            .type-text
                border-radius: 5px
                font-size: 0.75em
                font-weight: 200
                opacity: .8
                grid-row: 1/3
                grid-column: 4
            div
                display: flex
                align-items: center
                justify-content: center
            &:hover
                background-color: #F5F5F5
                cursor: pointer
  </style>