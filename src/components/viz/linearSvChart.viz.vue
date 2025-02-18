<template>
    <div ref="rootDraggableContainer" class="linear-sv-chart-wrapper">
        <p class="title" v-if="name">{{ name }}</p>
        <div v-if="!isProband" class="remove-button" @click="emitRemoveTrack">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>remove</title>
                <path
                    d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z" />
            </svg>
        </div>
        <div v-if="!isProband" class="drag-handle" @mousedown="dragChartStart($event)" @mouseup="changeCursorToGrab($event)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>drag up/down</title>
                <path d="M10,8H6L12,2L18,8H14V16H18L12,22L6,16H10V8Z" />
            </svg>
        </div>
        <div :class="{ hidden: isLoading }" ref="linearChartContainer" class="linear-sv-chart"></div>
        <div class="loading-message" v-if="isLoading">
            <p>Loading...</p>
        </div>
    </div>
</template>

<script>
import linearSvChart from "../../d3/linearSvChart.d3.js";

export default {
    name: "LinearSvChartViz",
    components: {},
    props: {
        svList: Array,
        focusedVariant: {
            type: Object,
            required: false,
        },
        selectedArea: Object,
        chromosomes: Array,
        centromeres: Array,
        bands: Array,
        name: String,
        isProband: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            resizeObserver: null,
            pendingDelete: false,
        };
    },
    mounted() {
        this.drawLinearSvChart();

        let debouncedDraw = this.debounce(this.drawLinearSvChart, 100);
        this.resizeObserver = new ResizeObserver(() => {
            debouncedDraw();
        });

        this.resizeObserver.observe(this.$refs.linearChartContainer);
    },
    beforeDestroy() {
        this.resizeObserver.unobserve(this.$refs.linearChartContainer);
    },
    methods: {
        drawLinearSvChart() {
            //Grab the container by ref
            let container = this.$refs.linearChartContainer;
            //if we dont have a parent element, dont draw the chart
            if (!container || !container.clientWidth) {
                return;
            }
            //remove anything in the container
            container.innerHTML = "";

            if (!this.hasAllOptions) {
                return;
            }

            let options = {
                selection: this.selectedArea,
                selectionCallback: this.selectedAreaCallback,
                focusedVariantCallback: this.focusedVariantCallback,
                brush: true,
                centromeres: this.centromeres,
                bands: this.bands,
                isProband: this.isProband,
            };

            if (this.focusedVariant) {
                options.focusedVariant = this.focusedVariant;
            }

            this.linearSvChart = new linearSvChart(container, this.chromosomes, this.svList, options);

            //grab the container and append the chart
            container.appendChild(this.linearSvChart);
        },
        dragChartStart(event) {
            let obj = event.target;
            obj.style.cursor = "grabbing";

            let rootContainer = this.$refs.rootDraggableContainer;
            rootContainer.setAttribute("draggable", true);
        },
        changeCursorToGrab(event) {
            let obj = event.target;
            obj.style.cursor = "grab";
        },
        selectedAreaCallback(selectedArea) {
            this.$emit("selectAreaEvent", selectedArea);
        },
        focusedVariantCallback(focusedVariant) {
            this.$emit("focusedVariantEvent", focusedVariant);
        },
        debounce(func, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        },
        emitRemoveTrack() {
            this.$emit("removeTrack");
        },
    },
    computed: {
        hasAllOptions() {
            return this.chromosomes && this.svList && this.svList.length > 0;
        },
        isLoading() {
            //Based on whether the svList is empty or not
            return this.svList.length === 0;
        },
    },
    watch: {
        selectedArea() {
            this.drawLinearSvChart();
        },
        svList: {
            handler() {
                this.drawLinearSvChart();
            },
            deep: true,
        },
    },
};
</script>

<style lang="sass">
.tooltip-hover-variant
    position: absolute
    background-color: white
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3)
    padding: 5px 10px
    border-radius: 5px
    pointer-events: none
    display: flex
    min-width: 200px
    flex-direction: column
    justify-content: center
    align-items: center
    overflow: hidden
    z-index: 10
    .tooltip-cols
        display: flex
        flex-direction: row
        gap: 10px
        .tooltip-row
            display: flex
            flex-direction: row
            gap: 5px
            .tooltip-title
                text-transform: uppercase
                font-weight: 200
            .tooltip-info
                white-space: nowrap
                overflow: hidden
                text-align: right
                display: flex
                flex-direction: column
                justify-content: center
                align-items: flex-end
                flex-grow: 1
                font-weight: 200
                text-overflow: ellipsis
                max-width: 100px
                font-size: 0.8em
                color: #474747
                &.zy
                    text-transform: uppercase
.linear-sv-chart-wrapper
    background-color: white
    border-bottom: 1px solid whitesmoke
    border-radius: 5px
    padding: 5px
    position: relative
    .title
        box-sizing: border-box
        padding: 0px 5px
        border-radius: 5px
        margin: 0px
        position: absolute
        pointer-events: none
        left: -10px
        font-weight: lighter
        font-size: 14px
    p
        color: #2A65B7
        box-sizing: border-box
        width: fit-content
        margin: 0px
        background-color: whitesmoke
    .drag-handle
        height: 30px
        width: 15px
        border: 1px solid #2A65B7
        background-color: white
        display: flex
        justify-content: center
        align-items: center
        position: absolute
        top: 50%
        left: -9px
        font-weight: bold
        border-radius: 5px
        cursor: grab
        writing-mode: vertical-rl
        text-align: center
        line-height: .3em
        color: #2A65B7
        box-sizing: content-box
        &:hover
            background-color: #C1D1EA
        svg
            width: 20px
            height: 20px
            fill: #2A65B7
    .remove-button
        position: absolute
        top: 26%
        left: -10px
        cursor: pointer
        color: #2A65B7
        width: 18px
        height: 18px
        border-radius: 50%
        border: 1px solid #2A65B7
        display: flex
        justify-content: center
        align-items: center
        svg
            width: 15px
            height: 15px
            fill: #2A65B7
        &:hover
            color: red
            border: 1px solid red
            svg
                fill: red
.linear-sv-chart
    height: 90px
    width: 100%
    overflow: hidden
    &.hidden
        display: none
.loading-message
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    height: 120px
    box-sizing: border-box
    padding: 5px 8px
    p
        font-weight: bold
        color: #2A65B7
        font-size: 1.25em
        padding: 0px
        margin: 0px
        height: 100%
        display: flex
        align-items: center
        justify-content: center
        background: whitesmoke
        border-radius: 5px
</style>
