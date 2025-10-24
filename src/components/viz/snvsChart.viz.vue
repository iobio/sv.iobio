<template>
    <div class="linear-snvs-chart-wrapper">
        <div ref="clinGenRegionsChart" class="linear-snvs-chart"></div>
        <div id="snvs-chart-title">SNVs</div>
    </div>
</template>

<script>
import snvsChart from "../../d3/snvsChart.d3.js";

export default {
    name: "SnvsChartViz",
    components: {},
    props: {
        snvsList: Object,
        selectedArea: Object,
        chromosomes: Array,
    },
    data() {
        return {
            resizeObserver: null,
        };
    },
    mounted() {
        this.drawLinearSnvsChart();

        let debouncedDraw = this.debounce(this.drawLinearSnvsChart, 100);
        this.resizeObserver = new ResizeObserver(() => {
            debouncedDraw();
        });

        this.resizeObserver.observe(this.$refs.clinGenRegionsChart);
    },
    beforeDestroy() {
        this.resizeObserver.unobserve(this.$refs.clinGenRegionsChart);
    },
    methods: {
        drawLinearSnvsChart() {
            let container = this.$refs.clinGenRegionsChart;
            if (!container || !container.clientWidth) {
                return;
            }
            //remove anything in the container in case of redraw
            container.innerHTML = "";

            if (!this.snvsList || !this.chromosomes) {
                return;
            }

            let options = {
                selection: this.selectedArea,
            };
            this.linearRegionsChart = new snvsChart(container, this.chromosomes, this.snvsList, options);

            //grab the container and append the chart
            container.appendChild(this.linearRegionsChart);
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
        selectedArea(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.drawLinearSnvsChart();
            }
        },
        snvsList(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.drawLinearSnvsChart();
            }
        },
    },
};
</script>

<style lang="sass">
.linear-snvs-chart-wrapper
    padding: 5px
    margin-top: 10px
    position: relative
.linear-snvs-chart
    height: 20px
    width: 100%
    border: .5px solid #ccc
    border-radius: 5px
#snvs-chart-title
    position: absolute
    top: -12px
    left: -10px
    background-color: white
    font-weight: lighter
    font-size: 14px
    color: #2A65B7
.snv-tooltip
    position: absolute
    background-color: white
    border: 1px solid #ccc
    border-radius: 5px
    padding: 5px
    font-size: 13px
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2)
    display: flex
    flex-direction: column
    z-index: 3
    .snv-tooltip-item
        display: flex
        margin-bottom: 5px
        .label
            background-color: #ccc
            padding: 2px 5px
            border-radius: 5px 0px 0px 5px
            display: flex
            align-items: center
        .value
            max-width: 130px
            text-wrap: wrap
            word-wrap: break-word
            overflow: hidden
            border-top: 1px solid #ccc
            border-bottom: 1px solid #ccc
            border-right: 1px solid #ccc
            border-radius: 0px 5px 5px 0px
            padding: 2px 5px
</style>
