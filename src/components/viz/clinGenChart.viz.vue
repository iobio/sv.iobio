<template>
    <div class="linear-regions-chart-wrapper">
        <div ref="clinGenRegionsChart" class="linear-regions-chart"></div>
        <div id="regions-chart-title">Dose Sensitive Regions</div>
    </div>
</template>

<script>
import clinGenChart from "../../d3/clinGenChart.d3.js";

export default {
    name: "LinearRegionsChartViz",
    components: {},
    props: {
        regionsList: Object,
        selectedArea: Object,
        chromosomes: Array,
    },
    data() {
        return {
            resizeObserver: null,
        };
    },
    mounted() {
        this.drawLinearRegionsChart();

        let debouncedDraw = this.debounce(this.drawLinearRegionsChart, 100);
        this.resizeObserver = new ResizeObserver(() => {
            debouncedDraw();
        });

        this.resizeObserver.observe(this.$refs.clinGenRegionsChart);
    },
    beforeDestroy() {
        this.resizeObserver.unobserve(this.$refs.clinGenRegionsChart);
    },
    methods: {
        drawLinearRegionsChart() {
            //Grab the container by ref
            let container = this.$refs.clinGenRegionsChart;
            //if we dont have a parent element, dont draw the chart
            if (!container || !container.clientWidth) {
                return;
            }
            //remove anything in the container
            container.innerHTML = "";

            if (!this.regionsList || !this.chromosomes) {
                return;
            }

            let options = {
                selection: this.selectedArea,
            };
            this.linearRegionsChart = new clinGenChart(container, this.chromosomes, this.regionsList, options);

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
                this.drawLinearRegionsChart();
            }
        },
        regionsList(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.drawLinearRegionsChart();
            }
        },
    },
};
</script>

<style lang="sass">
.linear-regions-chart-wrapper
    margin-top: 10px
    position: relative
.linear-regions-chart
    height: 20px
    width: 100%
    border: .5px solid #ccc
    border-radius: 5px
#regions-chart-title
    position: absolute
    top: -12px
    left: -10px
    background-color: white
    font-weight: lighter
    font-size: 14px
    color: #2A65B7
</style>
