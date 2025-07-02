<template>
    <div id="variant-list-bar" :class="{ collapsed: !open }">
        <div
            v-if="svList && svList.length > 0"
            id="variant-list-bar-header"
            :class="{
                hasGoi: geneCandidates && geneCandidates.length > 0 && (displayMode == 'expanded' || displayMode == 'normal'),
                condensed: displayMode == 'condensed',
                expanded: displayMode == 'expanded',
            }">
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
                <span v-if="displayMode == 'expanded' || displayMode == 'normal'">Zygosity</span>
                <span v-if="displayMode == 'condensed'">Zyg</span>
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div
                class="span-rows"
                v-if="geneCandidates && geneCandidates.length > 0 && (displayMode == 'expanded' || displayMode == 'normal')"
                @click="$emit('sort-variants', 'goi')">
                GoI
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>

            <div
                v-if="displayMode == 'expanded' || displayMode == 'normal'"
                class="span-rows"
                @click="$emit('sort-variants', 'totalGenes')">
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
                <span>HPO Terms</span>
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
                    :geneCandidates="geneCandidates"
                    :patientPhenotypes="patientPhenotypes"
                    :comparisons="comparisons"
                    :displayMode="displayMode"
                    :chromosomeAccumulatedMap="chromosomeAccumulatedMap"
                    :placeInList="index"
                    :overlapProp="overlapProp"
                    :filters="filters"
                    :focusedVariant="focusedVariant"
                    @variant-clicked="variantClicked"
                    @favorite-variant="favoriteVariant"
                    @hide-variant="hideVariant" />
            </div>
            <div id="variant-list-bar-sudo-scroll">
                <div id="variant-list-bar-sudo-scroll-thumb"></div>
            </div>
        </div>
        <div id="hidden-variants-section">
            <span
                ><b>{{ hiddenVar.length }}</b> User Hidden Variants</span
            >
            <span
                ><b>{{ filteredOutVar.length }}</b> Variants Filtered Out</span
            >
        </div>
    </div>
</template>

<script>
/**
 * This component is the worst thing I've created in my entire life I am sorry for anyone who has to maintain it
 * The virtual scroller is very particular you have to ensure that you have just the right logic to actually have it work as intended
 * Change things with the utmost caution
 */
import VariantListItem from "./parts/VariantListItem.vue";

export default {
    name: "VariantListBar",
    components: {
        VariantListItem,
    },
    props: {
        svList: Array,
        filteredOutVar: Array,
        hiddenVar: Array,
        patientPhenotypes: Array,
        geneCandidates: Array,
        comparisons: Array,
        chromosomeAccumulatedMap: Object,
        focusedVariant: Object,
        displayMode: {
            type: String,
            default: "normal",
        },
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
            listItemsContainer: null,
            sudoScrollBar: null,
            scrollThumb: null,
            scrollSelection: [0, 11],
            viewWindow: 11,
            lastScrollTop: 0,
            handleScrollBound: null,
            itemHeight: 100,
            containerHeight: 0,
            resizeObserver: null,
        };
    },
    mounted() {
        this.setupVariables();

        this.handleScrollBound = this.scrollHandler.bind(this);
        this.listItemsContainer.addEventListener("scroll", this.handleScrollBound);

        this.listItemsContainer.scrollTop = 0;
        this.initializeScroll();

        // Add resize observer
        this.resizeObserver = new ResizeObserver(() => {
            this.$nextTick(() => {
                this.viewWindow = this.calculateViewWindow();
                if (this.svList.length > 0) {
                    let height = (this.viewWindow / this.svList.length) * 100;
                    this.scrollThumb.style.height = height > 100 ? "99.9%" : height + "%";
                }
            });
        });
        this.resizeObserver.observe(this.listItemsContainer);
    },
    beforeDestroy() {
        this.listItemsContainer.removeEventListener("scroll", this.handleScrollBound);

        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },
    methods: {
        setupVariables() {
            this.listItemsContainer = document.getElementById("variant-items-wrapper");
            this.containerHeight = this.listItemsContainer.clientHeight;

            this.sudoScrollBar = document.getElementById("variant-list-bar-sudo-scroll");
            this.scrollThumb = document.getElementById("variant-list-bar-sudo-scroll-thumb");
        },
        favoriteVariant(variant) {
            this.$emit("favorite-variant", variant);
        },
        hideVariant(variant) {
            this.$emit("hide-variant", variant);
        },
        resetScroll() {
            this.lastScrollTop = 0;
        },
        scrollHandler() {
            let currentScrollTop = this.listItemsContainer.scrollTop;
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
        calculateViewWindow() {
            this.containerHeight = this.listItemsContainer.clientHeight;
            let calculatedViewWindow = Math.ceil(this.containerHeight / this.itemHeight) + 2; // Add buffer
            return calculatedViewWindow;
        },
        initializeScroll() {
            this.resetScroll();
            this.viewWindow = this.calculateViewWindow();
            this.scrollSelection = [0, this.viewWindow];
            if (this.svList.length > 0) {
                let height = (this.viewWindow / this.svList.length) * 100;
                this.scrollThumb.style.height = height > 100 ? "99.9%" : height + "%";
            }

            this.setupScrollbar();
        },
        setupScrollbar() {
            let clientHeight = this.listItemsContainer.clientHeight;
            let scrollHeight = this.listItemsContainer.scrollHeight;

            this.sudoScrollBar.addEventListener("mousedown", (event) => {
                event.preventDefault();
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            let onMouseMove = (event) => {
                event.preventDefault();
                //get the mouse y position
                let mouseY = event.clientY;
                //what percent of the sudo scroll bar is the mouse at
                let percent = (mouseY - this.sudoScrollBar.getBoundingClientRect().top) / this.sudoScrollBar.clientHeight;
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
            let clientHeight = this.listItemsContainer.clientHeight;
            let scrollHeight = this.listItemsContainer.scrollHeight;
            let svListLen = this.svList.length;
            let newLastScrollTop = currentScrollTop;

            // If we're near the bottom and there are more items to show
            if (currentScrollTop + clientHeight >= scrollHeight - this.itemHeight && this.scrollSelection[1] < svListLen) {
                // Move the window up by one item
                this.scrollSelection[0] += 1;
                this.scrollSelection[1] += 1;

                // Update thumb position
                if (this.svList.length > 0) {
                    let top = (this.scrollSelection[0] / this.svList.length) * 100;
                    this.scrollThumb.style.top = top > 100 ? "100%" : top + "%";
                }
                this.listItemsContainer.scrollTop -= 1;
                return currentScrollTop - 1;
            }

            return newLastScrollTop;
        },
        scrollDown(currentScrollTop) {
            let newLastScrollTop = currentScrollTop;

            // If we're near the top and there are more items above
            if (currentScrollTop <= this.itemHeight && this.scrollSelection[0] > 0) {
                // Move the window down by one item
                this.scrollSelection[0] -= 1;
                this.scrollSelection[1] -= 1;

                if (this.svList.length > 0) {
                    let top = (this.scrollSelection[0] / this.svList.length) * 100;
                    this.scrollThumb.style.top = top > 100 ? "100%" : top + "%";
                }
                this.listItemsContainer.scrollTop += 1;
                return currentScrollTop + 1;
            }
            this.listItemsContainer.scrollTop += 1;
            return newLastScrollTop;
        },
        handleScrollDrag(scrollSelection) {
            this.scrollSelection = scrollSelection;

            this.listItemsContainer.scrollTop = this.scrollSelection[0] * this.itemHeight;

            if (this.svList.length > 0) {
                let top = (this.scrollSelection[0] / this.svList.length) * 100;
                this.scrollThumb.style.top = top > 100 ? "100%" : top + "%";
            }
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
            if (this.scrollSelection[1] >= this.svList.length - 1 && direction == "down") {
                this.listItemsContainer.scrollTop = this.listItemsContainer.scrollHeight;
            } else if (direction == "up") {
                let firstVariant = document.getElementsByClassName("variant-list-item")[0];

                if (firstVariant) {
                    let scrollInc = firstVariant.offsetHeight;
                    let newTop = this.listItemsContainer.scrollTop - scrollInc * 2;
                    if (newTop < 0) {
                        newTop = 0;
                    }
                    this.listItemsContainer.scrollTop = newTop;
                }
            }

            if (this.svList.length > 0) {
                let top = (this.scrollSelection[0] / this.svList.length) * 100;
                this.scrollThumb.style.top = top > 100 ? "100%" : top + "%";
            }
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
        svList: {
            handler(newVal, oldVal) {
                if (!oldVal || oldVal.length === 0) {
                    this.listItemsContainer.scrollTop = 0;
                    this.initializeScroll();
                } else if (newVal.length && newVal.length !== oldVal.length) {
                    this.listItemsContainer.scrollTop = 0;
                    this.initializeScroll();
                }
            },
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
        max-height: 100%
        scrollbar-width: none
        -ms-overflow-style: none
        position: relative
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
#hidden-variants-section
    height: 40px
    width: 100%
    border-radius: 3px
    padding-right: 10px
    display: flex
    align-items: center
    justify-content: flex-end
    box-sizing: border-box
    border: 1px solid #E0E0E0
    text-transform: uppercase
    font-size: .8em
    font-weight: 200
    color: #474747
    span
        margin-right: 5px
        b
            background: #E0E0E0
            padding: 2px
            border-radius: 3px
            text-align: center
#variant-list-bar
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-start
    padding-bottom: 1px
    width: 100%
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
        grid-template-columns: minmax(0, .05fr) minmax(0, .05fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .5fr)
        grid-template-rows: 1fr 1fr
        font-size: .7em
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
        &.condensed
            grid-template-columns: minmax(0, .1fr) minmax(0, .15fr) minmax(0, .25fr) minmax(0, .15fr) minmax(0, .15fr) minmax(0, .15fr)
            grid-template-rows: 1fr 1fr
        &.expanded
            grid-template-columns: minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .1fr) minmax(0, .2fr) minmax(0, .5fr)
            grid-template-rows: 1fr 1fr
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
