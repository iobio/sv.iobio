<template>
    <div id="variant-list-bar" :class="{ collapsed: !open }">
        <div
            v-if="svList && svList.length > 0"
            id="variant-list-bar-header"
            :class="{ hasGoi: geneCandidates && geneCandidates.length > 0 }">
            <!-- col0 -->
            <div class="span-rows"></div>

            <!-- col1 -->
            <div class="span-rows" @mouseenter="showSortTip" @mouseleave="hideSortTip" @click="$emit('sort-variants', 'chr')">
                Chr
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div class="span-rows" @click="$emit('sort-variants', 'size')">
                Size
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div class="span-rows" @click="$emit('sort-variants', 'type')">
                Type
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div class="span-rows" @click="$emit('sort-variants', 'zygosity')">
                Zygosity
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
                <span class="svgs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Proband</title>
                        <path
                            d="M9,7H13A2,2 0 0,1 15,9V11A2,2 0 0,1 13,13H11V17H9V7M11,9V11H13V9H11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>

                    <svg v-if="hasMom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Mother</title>
                        <path
                            d="M9,7H15A2,2 0 0,1 17,9V17H15V9H13V16H11V9H9V17H7V9A2,2 0 0,1 9,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>

                    <svg v-if="hasDad" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Father</title>
                        <path
                            d="M9,7H15V9H11V11H14V13H11V17H9V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                    </svg>
                </span>
            </div>

            <div class="span-rows" v-if="geneCandidates && geneCandidates.length > 0" @click="$emit('sort-variants', 'goi')">
                GoI
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div class="span-rows" @click="$emit('sort-variants', 'totalGenes')">
                Genes
                <br />
                Total
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div class="span-rows" @click="$emit('sort-variants', 'hpoOverlapped')">
                Gene:HPO
                <span>Top (Total)</span>
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>
        </div>

        <div id="variant-scroll-wrapper">
            <div id="variant-items-wrapper">
                <VariantListItem
                    v-for="(variant, index) in svListSelection"
                    :key="`${variant.chromosome}-${variant.start}-${variant.end}-${variant.type}`"
                    :variant="variant"
                    :openedSvSet="openedSvSet"
                    :geneCandidates="geneCandidates"
                    :patientPhenotypes="patientPhenotypes"
                    :comparisons="comparisons"
                    :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
                    :placeInList="index"
                    :overlapProp="overlapProp"
                    :filters="filters"
                    :focusedVariant="focusedVariant"
                    @variant-clicked="variantClicked" />
            </div>
            <div id="variant-list-bar-sudo-scroll">
                <div id="variant-list-bar-sudo-scroll-thumb"></div>
            </div>
        </div>
    </div>
</template>

<script>
import VariantListItem from "./parts/VariantListItem.vue";

export default {
    name: "VariantListBar",
    components: {
        VariantListItem,
    },
    props: {
        svList: Array,
        patientPhenotypes: Array,
        geneCandidates: Array,
        comparisons: Array,
        chromosomeAccumulatedMap: Object,
        focusedVariant: Object,
        loading: {
            type: Boolean,
            default: false,
        },
        overlapProp: Number,
        filters: Object,
        open: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            scrollSelection: [0, 22],
            openedSvSet: {},
            clickedFromBar: false,
            viewWindow: 22,
            lastScrollTop: 0,
            handleScrollBound: null,
        };
    },
    mounted() {
        this.lastScrollTop = 0;
        let variantListBar = document.getElementById("variant-items-wrapper");
        this.handleScrollBound = this.handleScroll.bind(this);
        variantListBar.addEventListener("scroll", this.handleScrollBound);

        variantListBar.scrollTop = 0;
        this.initializeScroll();
    },
    beforeDestroy() {
        let variantListBar = document.getElementById("variant-items-wrapper");
        variantListBar.removeEventListener("scroll", this.handleScrollBound);
    },
    methods: {
        resetData() {
            this.openedSvSet = {};
            this.clickedFromBar = false;
            this.lastScrollTop = 0;
        },
        handleScroll(event) {
            let variantListBar = document.getElementById("variant-items-wrapper");
            let currentScrollTop = variantListBar.scrollTop;
            if (
                currentScrollTop == this.lastScrollTop ||
                currentScrollTop == this.lastScrollTop + 1 ||
                currentScrollTop == this.lastScrollTop - 1
            ) {
                return;
            }

            if (currentScrollTop > this.lastScrollTop) {
                //We are scrolling up ^
                let newLastScrollTop = this.scrollUp(currentScrollTop);
                this.lastScrollTop = newLastScrollTop;
            } else if (currentScrollTop < this.lastScrollTop) {
                //We are scrolling down .
                let newLastScrollTop = this.scrollDown(currentScrollTop);
                this.lastScrollTop = newLastScrollTop;
            }
        },
        initializeScroll() {
            //Anytime we are going to initialize or reinitialize the scroll we need to reset
            this.resetData();

            this.scrollSelection = [0, 22];
            this.viewWindow = 22;

            //the initial thumb size will be the size of the scrollSelection[1] / svList.length * 100
            let thumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
            let height = (this.viewWindow / this.svList.length) * 100;
            thumb.style.height = height > 100 ? "99.9%" : height + "%";

            this.setupScrollbar();
        },
        setupScrollbar() {
            let variantListBar = document.getElementById("variant-items-wrapper");
            let clientHeight = variantListBar.clientHeight;
            let scrollHeight = variantListBar.scrollHeight;

            let sudoScrollBar = document.getElementById("variant-list-bar-sudo-scroll");
            sudoScrollBar.addEventListener("mousedown", (event) => {
                event.preventDefault();
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            let onMouseMove = (event) => {
                event.preventDefault();
                //get the mouse y position
                let mouseY = event.clientY;
                //what percent of the sudo scroll bar is the mouse at
                let percent = (mouseY - sudoScrollBar.getBoundingClientRect().top) / sudoScrollBar.clientHeight;
                let scrollSelection = [
                    Math.floor(percent * this.svList.length),
                    Math.floor(percent * this.svList.length) + this.viewWindow,
                ];

                //if the scroll selection is less than 0, set it to 0
                if (scrollSelection[0] < 0) {
                    scrollSelection[0] = 0;
                    scrollSelection[1] = this.viewWindow;
                    this.lastScrollTop = 0;
                }
                //if the scroll selection is greater than the svList length, set it to the svList length
                if (scrollSelection[1] > this.svList.length) {
                    let zero = this.svList.length - this.viewWindow;
                    if (zero < 0) {
                        zero = 0;
                    }

                    scrollSelection[0] = zero;
                    scrollSelection[1] = this.svList.length;
                    this.lastScrollTop = scrollHeight - clientHeight;
                }
                this.handleScrollDrag(scrollSelection);
            };

            let onMouseUp = function (event) {
                event.preventDefault();
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
        },
        scrollUp(currentScrollTop) {
            let variantListBar = document.getElementById("variant-items-wrapper");
            let clientHeight = variantListBar.clientHeight;
            let scrollHeight = variantListBar.scrollHeight;
            let scrollTop = currentScrollTop;
            let svListLen = this.svList.length;
            let newLastScrollTop = currentScrollTop;

            //If we are currently at the max scroll we have available then increment the scroll selection
            if (currentScrollTop + clientHeight >= scrollHeight && this.scrollSelection[1] < svListLen) {
                this.scrollSelection[0] += 1;
                this.scrollSelection[1] += 1;
                //Move us down one pixle so we can trigger scroll again if needed
                scrollTop -= 1;
                variantListBar.scrollTop = scrollTop;
                //Set last scroll top so we know if we scroll up or down
                newLastScrollTop = scrollTop;
                //Move the thumb
                let thumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
                let top = (this.scrollSelection[0] / this.svList.length) * 100;
                thumb.style.top = top > 100 ? "100%" : top + "%";
                //return early
                return newLastScrollTop;
            }
            //If we haven't gotten through the buffer space then just update the last scroll top value
            return newLastScrollTop;
        },
        scrollDown(currentScrollTop) {
            let variantListBar = document.getElementById("variant-items-wrapper");
            let scrollTop = currentScrollTop;
            let newLastScrollTop = currentScrollTop;

            //If we are currently at 0 or even with the top of the container
            if (currentScrollTop <= 0 && this.scrollSelection[0] > 0) {
                this.scrollSelection[0] -= 1;
                this.scrollSelection[1] -= 1;
                //Move us down one pixle so we can trigger scroll again if needed
                scrollTop += 1;
                variantListBar.scrollTop = scrollTop;
                //Set last scroll top so we know if we scroll up or down
                newLastScrollTop = scrollTop;
                //move the thumb
                let thumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
                let top = (this.scrollSelection[0] / this.svList.length) * 100;
                thumb.style.top = top > 100 ? "100%" : top + "%";
                //return early
                return newLastScrollTop;
            }
            return newLastScrollTop;
        },
        handleScrollDrag(scrollSelection) {
            this.scrollSelection = scrollSelection;
            let thumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
            let top = (this.scrollSelection[0] / this.svList.length) * 100;
            thumb.style.top = top > 100 ? "100%" : top + "%";
        },
        handleScrollToVariant(scrollSelection) {
            let direction;
            if (scrollSelection[0] > this.scrollSelection[0]) {
                direction = "down";
            } else {
                direction = "up";
            }

            this.scrollSelection = scrollSelection;

            //if we are at the very bottom of the list, we need to scroll to the bottom so we can see the last variant
            let variantListBar = document.getElementById("variant-items-wrapper");

            if (this.scrollSelection[1] >= this.svList.length - 1 && direction == "down") {
                variantListBar.scrollTop = variantListBar.scrollHeight;
            } else if (direction == "up") {
                let variantListBar = document.getElementById("variant-items-wrapper");
                let firstVariant = document.getElementsByClassName("variant-list-item")[0];
                let scrollInc = firstVariant.offsetHeight;

                let newTop = variantListBar.scrollTop - scrollInc * 2;
                if (newTop < 0) {
                    newTop = 0;
                }
                variantListBar.scrollTop = newTop;
            }

            let thumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
            let top = (this.scrollSelection[0] / this.svList.length) * 100;
            thumb.style.top = top > 100 ? "100%" : top + "%";
        },
        async variantClicked(variant, flag) {
            //add to openedSvSet
            let key = `${variant.chromosome}-${variant.start}-${variant.end}-${variant.type}`;
            if (key in this.openedSvSet) {
                delete this.openedSvSet[key];
            } else {
                this.openedSvSet[key] = true;
            }
            this.clickedFromBar = true;
            this.$emit("variant-clicked", variant, flag);
        },
    },
    computed: {
        svListSelection() {
            return this.svList.slice(this.scrollSelection[0], this.scrollSelection[1]);
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
    },
    watch: {
        svList(newVal, oldVal) {
            if (!oldVal.length || oldVal.length == 0) {
                let variantListBar = document.getElementById("variant-items-wrapper");
                variantListBar.scrollTop = 0;
                this.initializeScroll();
            }
            if (newVal.length && newVal.length !== oldVal.length) {
                let variantListBar = document.getElementById("variant-items-wrapper");
                variantListBar.scrollTop = 0;
                this.initializeScroll();
            }
        },
        focusedVariant(newVal, oldVal) {
            if (!this.focusedVariant) {
                return;
            } else if (newVal == oldVal) {
                return;
            }

            if (this.clickedFromBar) {
                this.clickedFromBar = false;
                return;
            }

            //Find the index of the focused variant in the svList
            let index = this.svList.findIndex((variant) => {
                return (
                    variant.chromosome === this.focusedVariant.chromosome &&
                    variant.start === this.focusedVariant.start &&
                    variant.end === this.focusedVariant.end &&
                    variant.type === this.focusedVariant.type
                );
            });

            if (index < 0) {
                return;
            }

            let scrollSelection = [0, this.viewWindow];

            if (index > this.svList.length - this.viewWindow - 1) {
                scrollSelection = [this.svList.length - this.viewWindow, this.svList.length];
            } else {
                scrollSelection = [index, index + this.viewWindow];
            }
            this.clickedFromBar = false;
            this.handleScrollToVariant(scrollSelection);
        },
    },
};
</script>

<style lang="sass">
#variant-scroll-wrapper
    flex-grow: 1
    width: 100%
    overflow: hidden
    padding-right: 10px
    position: relative
    overflow: hidden
    overscroll-behavior: none
    #variant-items-wrapper
        overflow-y: auto
        height: 100%
        scrollbar-width: none
        -ms-overflow-style: none
    #variant-items-wrapper::-webkit-scrollbar
        display: none
    #variant-list-bar-sudo-scroll
        position: absolute
        top: 0
        right: 0
        width: 10px
        height: 100%
        background-color: #F5F5F5
        z-index: 2
        #variant-list-bar-sudo-scroll-thumb
            width: 95%
            height: 50px
            position: relative
            background-color: #CCCCCC
            border-radius: 10px
            cursor: pointer
            &:hover
                background-color: #B8B8B8
#variant-list-bar
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-start
    padding-bottom: 1px
    width: 100%
    min-width: 350px
    height: 100%
    box-sizing: border-box
    overflow: hidden
    position: relative
    transition: width 0.4s, min-width 0.4s
    &.collapsed
        width: 0px
        min-width: 0px
    #variant-list-bar-header
        display: grid
        grid-template-columns: minmax(0, .1fr) minmax(0, .1fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .2fr) minmax(0, .2fr) minmax(0, .2fr)
        grid-template-rows: 1fr 1fr
        font-size: .8em
        font-weight: 200
        width: 100%
        height: 50px
        margin: 0px
        padding: 5px
        padding-right: 15px
        border-left: 2px solid transparent
        border-right: 2px solid transparent
        box-sizing: border-box
        position: sticky
        text-transform: uppercase
        top: 0
        background-color: white
        color: #474747
        border-bottom: 1px solid #E0E0E0
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        z-index: 1
        &.hasGoi
            grid-template-columns: minmax(0, .1fr) minmax(0, .1fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .2fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .25fr)
        .span-rows
            display: flex
            flex-direction: column
            justify-content: center
            align-items: center
            text-align: center
            grid-row: 1/3
            overflow-wrap: break-word
            max-width: 100%
            text-overflow: ellipsis
            position: relative
            cursor: pointer
            .sort-tip
                position: absolute
                right: -9px
                top: 10
                opacity: 0
                transition: opacity 0.2s
                width: 20px
                height: 20px
                fill: grey
            &:hover
                background-color: #F5F5F5
                border-radius: 5px
                .sort-tip
                    opacity: 1
            .svgs
                align-items: center
                display: flex
                justify-content: space-evenly
                width: 100%
                svg
                    width: 20px
                    height: 20px
                    fill: grey
        .upper
            grid-column: 2/4
            grid-row: 1
            max-width: 100%
            text-overflow: ellipsis
        .lower
            max-width: 100%
            grid-column: 2/4
            grid-row: 2
            justify-content: space-evenly
            text-transform: none
            overflow-wrap: break-word
            font-weight: 200
            text-overflow: ellipsis
            .col
                display: flex
                flex-direction: column
                justify-content: space-evenly
                overflow-wrap: break-word
                align-items: center
                b
                    padding: 0px 2px
</style>
