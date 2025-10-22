<template>
    <div class="linear-gene-chart-wrapper" ref="rootDraggableContainer">
        <p v-if="name">{{ name }}</p>
        <div ref="linearGeneChartContainer" class="linear-gene-chart"></div>
    </div>
</template>

<script>
import linearGeneChart from "../../d3/linearGeneChart.d3.js";

export default {
    name: "LinearGeneChartViz",
    components: {},
    props: {
        genesList: Object,
        selectedArea: Object,
        chromosomes: Array,
        centromeres: Array,
        bands: Array,
        genesOfInterest: Array,
        phenRelatedGenes: Array,
        name: String,
        batchNum: Number,
        build: String,
    },
    data() {
        return {
            resizeObserver: null,
        };
    },
    mounted() {
        this.drawLinearGeneChart();

        // Increase debounce delay for more stability
        this.debouncedDrawFunction = this.debounce(this.drawLinearGeneChart, 300);
        this.resizeObserver = new ResizeObserver(() => {
            this.debouncedDrawFunction();
        });

        this.resizeObserver.observe(this.$refs.linearGeneChartContainer);
    },
    beforeDestroy() {
        this.resizeObserver.unobserve(this.$refs.linearGeneChartContainer);
    },
    methods: {
        drawLinearGeneChart() {
            //Grab the container by ref
            let container = this.$refs.linearGeneChartContainer;
            //if we dont have a parent element, dont draw the chart
            if (!container || !container.clientWidth) {
                return;
            }
            //remove anything in the container
            container.innerHTML = "";

            if (!this.genesList || !this.chromosomes) {
                return;
            }

            let options = {
                selection: this.selectedArea,
                selectionCallback: this.selectedAreaCallback,
                brush: true,
                genesOfInterest: this.genesOfInterest,
                phenRelatedGenes: this.phenRelatedGenes,
                centromeres: this.centromeres,
                bands: this.bands,
                build: this.build,
            };
            this.linearGeneChart = new linearGeneChart(container, this.chromosomes, this.genesList, options);

            //grab the container and append the chart
            container.appendChild(this.linearGeneChart);
        },
        dragChartStart(event) {
            let obj = event.target;
            obj.style.cursor = "grabbing";
            //We need to get the root element and allow it to be dragged
            let rootContainer = this.$refs.rootDraggableContainer;
            //allow it to be dragged
            rootContainer.setAttribute("draggable", true);
        },
        changeCursorToGrab(event) {
            let obj = event.target;
            obj.style.cursor = "grab";
        },
        selectedAreaCallback(selectedArea) {
            this.$emit("selectAreaEvent", selectedArea);
        },
        debounce(func, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        },
    },
    watch: {
        // Debounced watchers to lessen redraw frequency and the chance of race conditions
        batchNum(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.debouncedDrawFunction();
            }
        },
        selectedArea(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.debouncedDrawFunction();
            }
        },
        genesList(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.debouncedDrawFunction();
            }
        },
        genesOfInterest: {
            handler() {
                this.debouncedDrawFunction();
            },
            deep: true,
        },
        phenRelatedGenes: {
            handler() {
                this.debouncedDrawFunction();
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
.linear-gene-chart-wrapper
    background-color: #F8F8F8
    border: .5px solid transparent
    border-bottom: 1px solid transparent
    border-radius: 5px
    margin-top: 5px
    padding: 5px
    position: relative
    .show-hide-toggle
        position: absolute
        right: 45%
        bottom: 5px
        cursor: pointer
        font-size: 14px
        color: #666666
        font-weight: 200
        font-style: italic
        background-color: rgba(255, 255, 255, 0.8)
        border-radius: 5px
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
        padding: 2px 5px
        &:hover
            color: #2A65B7
    .global-gene-tip
        position: absolute
        right: 43%
        bottom: 5px
        cursor: pointer
        font-size: 14px
        color: #666666
        font-weight: 200
        font-style: italic
        border-radius: 5px
        padding: 2px 5px
        cursor: default
    p
        color: #2A65B7
        font-weight: lighter
        width: fit-content
        border-radius: 5px
        box-sizing: border-box
        margin: 0px
        margin-bottom: 5px
        padding: 0px 2px
        background-color: #F8F8F8
        pointer-events: none
        font-size: 14px
        position: absolute
        left: -10px
        top: 0px
    .linear-gene-chart
        height: 120px
        width: 100%
        overflow: hidden
        overflow-y: scroll
        scrollbar-width: none
        &::-webkit-scrollbar
            display: none
</style>
