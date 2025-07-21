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
            <div class="span-rows" @click="this.$emit('filter-to-favorites')">
                <TippedButton :button-symbol="favoritesIcon" :position="'right'" :tip-text="'Filter to Favorites'" />
            </div>

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
                <span v-if="displayMode == 'expanded' || displayMode == 'normal'">HPO In Common</span>
                <span v-if="displayMode == 'condensed'">HPO</span>
                <svg class="sort-tip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>sort</title>
                    <path
                        d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
                </svg>
            </div>
        </div>

        <div id="variant-scroll-wrapper" :class="{ hidden: showOtherVariantsList }">
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
                    :isHidden="false"
                    @variant-clicked="variantClicked"
                    @favorite-variant="favoriteVariant"
                    @hide-variant="hideVariant" />
            </div>
            <div id="variant-list-bar-sudo-scroll">
                <div id="variant-list-bar-sudo-scroll-thumb"></div>
            </div>
        </div>
        <div id="hidden-variants-section" :class="{ expanded: showOtherVariantsList }">
            <div id="hidden-variants-header">
                <span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        v-if="showOtherVariantsList"
                        @click="
                            showOtherVariantsList = false;
                            otherVariantsShowing = 'none';
                        ">
                        <title>hide other variants</title>
                        <path
                            d="M12,14L16,10H13V4H11V10H8M5,20H19C20.11,20 21,19.1 21,18V6A2,2 0 0,1 19,4H15V6H19V16H5V6H9V4H5A2,2 0 0,1 3,6V19A2,2 0 0,1 5,20Z" />
                    </svg>
                </span>

                <span>
                    <b @click="toggleShowVarList('hidden')" :class="{ showing: otherVariantsShowing == 'hidden' }">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" v-if="otherVariantsShowing != 'hidden'">
                                <title>show</title>
                                <path
                                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                            </svg>
                        </span>
                        <span>{{ hiddenVar.length }}</span>
                    </b>
                    <span>User Hidden</span>
                </span>
                <span>
                    <b @click="toggleShowVarList('filtered')" :class="{ showing: otherVariantsShowing == 'filtered' }">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" v-if="otherVariantsShowing != 'filtered'">
                                <title>show</title>
                                <path
                                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                            </svg>
                        </span>
                        <span>{{ filteredOutVar.length }}</span>
                    </b>
                    <span>Filtered Out</span>
                </span>
            </div>
            <div id="hidden-variants-column" v-if="showOtherVariantsList">
                <VariantListItem
                    v-for="(variant, index) in shownHiddenList"
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
                    :isHidden="true"
                    @variant-clicked="variantClicked"
                    @favorite-variant="favoriteVariant"
                    @unhide-variant="unhideVariant" />
            </div>
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
import TippedButton from "./parts/TippedButton.vue";

export default {
    name: "VariantListBar",
    components: {
        VariantListItem,
        TippedButton,
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
            showOtherVariantsList: false,
            otherVariantsShowing: "none",
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
        toggleShowVarList(toShow) {
            if (this.otherVariantsShowing == toShow) {
                this.showOtherVariantsList = false;
                this.otherVariantsShowing = "none";
            } else {
                this.showOtherVariantsList = true;
                this.otherVariantsShowing = toShow;
            }
        },
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
        unhideVariant(variant) {
            this.$emit("unhide-variant", variant);
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
        shownHiddenList() {
            if (this.otherVariantsShowing == "filtered") {
                return this.filteredOutVar;
            } else if (this.otherVariantsShowing == "hidden") {
                return this.hiddenVar;
            }
            return [];
        },
        favoritesIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>favorites filter</title><path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" /></svg>';
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

            if (index >= this.scrollSelection[0] && index <= this.scrollSelection[1]) {
                return;
            }

            let scrollSelection = [0, this.viewWindow];

            if (index > this.svList.length - this.viewWindow - 1) {
                scrollSelection = [this.svList.length - this.viewWindow, this.svList.length];
                this.handleScrollToVariant(scrollSelection);
            } else {
                scrollSelection = [index, index + this.viewWindow];
                this.handleScrollToVariant(scrollSelection);
            }
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
    &.hidden
        display: none
        height: 0px
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
    display: flex
    flex-direction: column
    box-sizing: border-box
    border-right: 1px solid #E0E0E0
    color: #474747
    #hidden-variants-header
        height: 40px
        min-height: 40px
        width: 100%
        border-radius: 0px 3px 0px 0px
        padding-right: 10px
        display: flex
        align-items: center
        justify-content: flex-end
        box-sizing: border-box
        border-top: 1px solid #E0E0E0
        background: #F5F5F5
        text-transform: uppercase
        font-size: .8em
        font-weight: 200
        color: #474747
        span
            margin-right: 5px
            display: inline-flex
            align-items: center
            gap: 3px
            svg
                height: 22px
                width: 22px
                cursor: pointer
                fill: #474747
            b
                background: #E0E0E0
                padding: 2px 3px
                border-radius: 3px
                display: inline-flex
                align-items: center
                justify-content: center
                cursor: pointer
                &.showing
                    background: #aeaeae
                span
                    margin: 0px
                    svg
                        height: 18px
                        width: 18px
                        fill: #474747
                &:hover
                    background: #aeaeae
    &.expanded
        height: 100%
        #hidden-variants-column
            display: flex
            flex-direction: column
            flex-grow: 1
            overflow-y: auto
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
            .tipped-button
                border: none
                background: none
                .symbol
                    pointer-events: none
                    svg
                        height: 20px
                        width: 20px
                        fill: #474747
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
